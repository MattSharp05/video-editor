#!/usr/bin/env python3
"""A local stand-in for Broadcast's hero endpoints, for testing gen_mesh.py's paid path with no key and no money.
It implements the contract in .claude/skills/hero-assets/references/broadcast-contract.md: proposals, decisions,
mesh jobs (idempotent; 403 without a `generate` decision for that model; 402 over budget). A finished job serves
the file given with --glb. usage: python3 mock_broadcast.py --glb path.glb [--port 8765] [--cap 1.0]"""
import argparse, json, os, threading, uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ap = argparse.ArgumentParser(); ap.add_argument('--glb', required=True); ap.add_argument('--port', type=int, default=8765)
ap.add_argument('--cap', type=float, default=1.0); a = ap.parse_args()
P, J, IDEM, SPENT = {}, {}, {}, [0.0]
LOCK = threading.Lock()

class H(BaseHTTPRequestHandler):
    def log_message(self, *x): pass
    def send(self, code, obj, ctype='application/json'):
        b = obj if isinstance(obj, bytes) else json.dumps(obj).encode()
        self.send_response(code); self.send_header('Content-Type', ctype); self.send_header('Content-Length', str(len(b)))
        self.end_headers(); self.wfile.write(b)
    def body(self): return json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))) or b'{}')
    def authed(self): return self.headers.get('Authorization', '').startswith('Bearer ')
    def do_GET(self):
        if self.path.startswith('/files/'): return self.send(200, open(a.glb, 'rb').read(), 'model/gltf-binary')
        if not self.authed(): return self.send(401, {'error': 'auth'})
        if self.path.startswith('/api/factory/hero-proposals/'):
            p = P.get(self.path.rsplit('/', 1)[1]); return self.send(200, p) if p else self.send(404, {'error': 'none'})
        if self.path == '/api/factory/hero-decisions':
            return self.send(200, [{'proposal_id': k, **v['decision']} for k, v in P.items() if v.get('decision')])
        if self.path.startswith('/api/gen/mesh-jobs/'):
            j = J.get(self.path.rsplit('/', 1)[1])
            if not j: return self.send(404, {'error': 'none'})
            j['polls'] += 1
            if j['polls'] >= 2: j.update(status='completed', output_url=f'http://127.0.0.1:{a.port}/files/{j["job_id"]}.glb', cost_usd=j['quote_usd'])
            else: j['status'] = 'running'
            return self.send(200, {k: j.get(k) for k in ('status', 'output_url', 'cost_usd', 'error')})
        self.send(404, {'error': 'path'})
    def do_POST(self):
        if not self.authed(): return self.send(401, {'error': 'auth'})
        b = self.body()
        with LOCK:
            if self.path == '/api/factory/hero-proposals':
                p = P.setdefault(b['proposal_id'], {'status': 'pending', 'decision': None})
                p.update(stage=b['stage'], stills=len(b['stills']), object=b['object'])
                return self.send(200, {'proposal_id': b['proposal_id'], 'status': p['status']})
            if self.path.startswith('/test/decide/'):  # what Matthew's click in the dashboard would do
                P[self.path.rsplit('/', 1)[1]].update(status='decided', decision=b); return self.send(200, {'ok': True})
            if self.path == '/api/gen/mesh-jobs':
                if b.get('idempotency_key') in IDEM: j = J[IDEM[b['idempotency_key']]]; return self.send(200, {'job_id': j['job_id'], 'status': j['status'], 'quote_usd': j['quote_usd']})
                d = (P.get(b['proposal_id']) or {}).get('decision') or {}
                if d.get('choice') != 'generate' or d.get('model') != b['model']: return self.send(403, {'error': 'not_approved'})
                if SPENT[0] + b['quote_usd'] > a.cap: return self.send(402, {'error': 'budget', 'remaining_usd': round(a.cap - SPENT[0], 2)})
                SPENT[0] += b['quote_usd']; jid = uuid.uuid4().hex[:12]
                J[jid] = {'job_id': jid, 'status': 'queued', 'quote_usd': b['quote_usd'], 'polls': 0, 'req': b}; IDEM[b['idempotency_key']] = jid
                print('job', jid, b['model'], b['fal_endpoint'], json.dumps(b['fal_input']), flush=True)
                return self.send(200, {'job_id': jid, 'status': 'queued', 'quote_usd': b['quote_usd']})
        self.send(404, {'error': 'path'})

print(f'mock Broadcast on :{a.port}', flush=True)
ThreadingHTTPServer(('127.0.0.1', a.port), H).serve_forever()

#!/usr/bin/env python3
"""Generate the avatar's face clips for each face slot: quote first, never pay twice.

usage (from the film folder, after face_slots.py):
  python3 gen_face.py quote  --avatar ../avatar/avatar.json [--model KEY] [--only hook,cta]
  python3 gen_face.py run    --avatar ../avatar/avatar.json [--model KEY] --budget 3.00 [--only hook] [--retry]
  python3 gen_face.py status
  python3 gen_face.py models
Reads src/face_slots.json, the avatar profile (master_ref, generation.*), scripts/face_models.json.
Writes public/face/<slot>.mp4 (muted, constant fps; AvatarSlot plays them), face/state.json (jobs and
idempotency keys: a rerun polls submitted jobs instead of resubmitting), face/manifest.json (model, seconds,
cost, seed and avatar version per slot).
Providers: placeholder (free, FFmpeg), fal (FAL_KEY, or a network secret injected by the cloud proxy),
broadcast (BROADCAST_URL + BROADCAST_TOKEN; Broadcast holds the provider keys and caps). Contract and status
of each model: references/face-models.md. Keys are read from the environment only and never written anywhere.
"""
import argparse, base64, hashlib, json, math, mimetypes, os, ssl, subprocess, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REG = json.load(open(os.path.join(HERE, 'face_models.json')))
MODELS = {m['key']: m for m in REG['models']}

ap = argparse.ArgumentParser()
ap.add_argument('cmd', choices=['quote', 'run', 'status', 'models'])
ap.add_argument('--avatar', default='../avatar/avatar.json')
ap.add_argument('--model')
ap.add_argument('--only', help='comma-separated slot names')
ap.add_argument('--budget', type=float, help='USD this run may spend (required for paid models)')
ap.add_argument('--retry', action='store_true', help='resubmit slots whose last job failed (quoted again)')
ap.add_argument('--slots', default='src/face_slots.json')
ap.add_argument('--timeout', type=int, default=1800)
a = ap.parse_args()

if a.cmd == 'models':
    for m in REG['models']:
        print(f'{m["key"]:24s} {m["status"]:9s} ${m["price_usd_per_s"]:.4f}/s  max {m["max_s"]:>4}s  {m["label"]}')
    sys.exit()

os.makedirs('face', exist_ok=True)
STATE_P = 'face/state.json'
state = json.load(open(STATE_P)) if os.path.exists(STATE_P) else {}
save_state = lambda: json.dump(state, open(STATE_P, 'w'), indent=1)

if a.cmd == 'status':
    for k, v in state.items():
        print(f'{k:10s} {v.get("status"):10s} {v.get("model"):24s} ${v.get("cost_usd", 0):.2f}  {v.get("output", "")}')
    sys.exit()

AV = json.load(open(a.avatar))
AV_DIR = os.path.dirname(os.path.abspath(a.avatar))
GEN = AV.get('generation', {})
model = MODELS.get(a.model or GEN.get('face_model') or 'placeholder') or sys.exit(f'unknown model {a.model}')
if model['status'] == 'planned':
    sys.exit(f'{model["key"]} is planned: no adapter yet (references/face-models.md)')
master = os.path.join(AV_DIR, AV['look']['master_ref'])
if not os.path.exists(master): sys.exit(f'master reference missing: {master}')
prompt = GEN.get('prompt') or REG['default_prompt']
seed = GEN.get('seed', 7)
S = json.load(open(a.slots))
fps = S.get('fps', 30)
slots = [s for s in S['slots'] if not a.only or s['name'] in a.only.split(',')]


def secs(s):
    d = s['clip_out'] - s['clip_in']
    inc = model.get('billing_increment_s', 1)
    return math.ceil(d / inc) * inc


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def idem(s):
    key = '|'.join([model['key'], model.get('endpoint', ''), sha(s['audio']), sha(master), prompt, str(seed),
                    str(s['clip_in']), str(s['clip_out'])])
    return hashlib.sha256(key.encode()).hexdigest()[:24]


def todo(s):
    st = state.get(s['name'])
    if not st or st.get('idem') != idem(s): return 'new'
    if st['status'] == 'completed' and os.path.exists(st.get('output', '')): return 'done'
    if st['status'] == 'failed': return 'retry' if a.retry else 'failed'
    return 'poll'


rows = [(s, todo(s), secs(s) * model['price_usd_per_s']) for s in slots]
to_pay = sum(c for s, t, c in rows if t in ('new', 'retry'))
cap = GEN.get('cost_cap_per_video_usd')
print(f'model {model["key"]} ({model["status"]}), ${model["price_usd_per_s"]}/s; avatar {AV["id"]} v{AV["version"]}')
for s, t, c in rows:
    print(f'  {s["name"]:10s} {secs(s):5.1f}s  ${c:6.2f}  {t}')
spent = sum(v.get('cost_usd', 0) for v in state.values() if v.get('model') != 'placeholder')
print(f'to spend now ${to_pay:.2f}; spent on this video so far ${spent:.2f}' + (f'; cap ${cap:.2f}' if cap else ''))
if a.cmd == 'quote': sys.exit()

if to_pay > 0:
    if a.budget is None: sys.exit('paid run: pass --budget USD after the quote is approved')
    if to_pay > a.budget + 1e-9: sys.exit(f'quote ${to_pay:.2f} exceeds --budget ${a.budget:.2f}: nothing started')
    if cap and spent + to_pay > cap + 1e-9: sys.exit(f'would pass the avatar cap ${cap:.2f}: nothing started')

# ---------- providers ----------
CA = os.environ.get('SSL_CERT_FILE') or os.environ.get('REQUESTS_CA_BUNDLE')
if not CA and os.path.exists('/root/.ccr/ca-bundle.crt'): CA = '/root/.ccr/ca-bundle.crt'
CTX = ssl.create_default_context(cafile=CA) if CA else ssl.create_default_context()


def http(method, url, headers, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={**headers, **({'Content-Type': 'application/json'} if data else {})})
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=120) as r:
            return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b'{}')


def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
    return f'data:{mime};base64,' + base64.b64encode(open(path, 'rb').read()).decode()


def dig(obj, dotted):
    for k in dotted.split('.'): obj = obj[k]
    return obj


def fal_submit(s):
    key = os.environ.get('FAL_KEY', 'proxy-injected')  # with a network secret the proxy replaces the header
    inp = model['inputs']
    body = {inp['image']: data_uri(master), inp['audio']: data_uri(s['audio'])}
    if inp.get('prompt'): body[inp['prompt']] = prompt
    code, r = http('POST', f'https://queue.fal.run/{model["endpoint"]}', {'Authorization': f'Key {key}'}, body)
    if code >= 300 or 'request_id' not in r: raise RuntimeError(f'fal submit {code}: {r}')
    return {'request_id': r['request_id'], 'status_url': r['status_url'], 'response_url': r['response_url']}


def fal_poll(job):
    key = os.environ.get('FAL_KEY', 'proxy-injected')
    h = {'Authorization': f'Key {key}'}
    code, r = http('GET', job['status_url'], h)
    st = r.get('status')
    if st == 'COMPLETED':
        code, res = http('GET', job['response_url'], h)
        if code >= 300: return 'failed', None, None, f'fal result {code}: {res}'
        return 'completed', dig(res, model.get('output', 'video.url')), None, None
    if st in ('IN_QUEUE', 'IN_PROGRESS'): return 'running', None, None, None
    return 'failed', None, None, f'fal status {code}: {r}'


def bc():
    url, tok = os.environ.get('BROADCAST_URL'), os.environ.get('BROADCAST_TOKEN')
    if not url or not tok: sys.exit('broadcast provider: set BROADCAST_URL and BROADCAST_TOKEN')
    return url.rstrip('/'), {'Authorization': f'Bearer {tok}'}


def broadcast_submit(s, key):
    url, h = bc()
    code, r = http('POST', f'{url}/api/gen/face-jobs', h, {
        'video_id': os.environ.get('BROADCAST_VIDEO_ID', os.path.basename(os.path.dirname(os.getcwd()))),
        'slot': s['name'], 'model': model['key'], 'idempotency_key': key, 'image': data_uri(master),
        'audio': data_uri(s['audio']), 'prompt': prompt, 'seed': seed, 'seconds': secs(s)})
    if code == 402: raise RuntimeError(f'broadcast budget: {r}')
    if code >= 300 or 'job_id' not in r: raise RuntimeError(f'broadcast submit {code}: {r}')
    return {'job_id': r['job_id']}


def broadcast_poll(job):
    url, h = bc()
    code, r = http('GET', f'{url}/api/gen/face-jobs/{job["job_id"]}', h)
    st = r.get('status')
    if st == 'completed': return 'completed', r['output_url'], r.get('cost_usd'), None
    if st in ('queued', 'running'): return 'running', None, None, None
    return 'failed', None, None, r.get('error') or f'broadcast {code}: {r}'


def placeholder(s, out):  # master ref, cover-cropped to 9:16, slow push-in, muted
    d = s['clip_out'] - s['clip_in']
    n = max(1, round(d * fps))
    vf = (f'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,scale=2160:3840,'
          f'zoompan=z=\'1+0.06*on/{n}\':x=\'iw/2-iw/zoom/2\':y=\'ih/2-ih/zoom/2\':d={n}:s=1080x1920:fps={fps},'
          f'format=yuv420p')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', master, '-vf', vf, '-frames:v', str(n),
                    '-c:v', 'libx264', '-crf', '20', '-an', out], check=True)


def finish(src_url, out):  # download, drop audio, constant fps (the master VO plays under it in Remotion)
    tmp = out + '.dl'
    with urllib.request.urlopen(urllib.request.Request(src_url), context=CTX, timeout=600) as r, open(tmp, 'wb') as f:
        f.write(r.read())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-an', '-r', str(fps), '-c:v', 'libx264', '-crf', '18',
                    '-pix_fmt', 'yuv420p', out], check=True)
    os.remove(tmp)


SUBMIT = {'fal': fal_submit, 'broadcast': None}
POLL = {'fal': fal_poll, 'broadcast': broadcast_poll}

# ---------- run ----------
os.makedirs('public/face', exist_ok=True)
for s, t, c in rows:
    out = f'public/face/{s["name"]}.mp4'
    if t == 'done' or t == 'failed':
        if t == 'failed': print(f'  {s["name"]}: last job failed ({state[s["name"]].get("error")}); --retry to resubmit')
        continue
    if t == 'poll': continue
    key = idem(s)
    state[s['name']] = {'model': model['key'], 'idem': key, 'status': 'submitting', 'seed': seed,
                        'seconds': secs(s), 'est_usd': round(c, 4)}
    save_state()  # the key is saved before the paid call
    if model['provider'] == 'placeholder':
        placeholder(s, out)
        state[s['name']].update(status='completed', output=out, cost_usd=0)
    else:
        try:
            job = broadcast_submit(s, key) if model['provider'] == 'broadcast' else SUBMIT[model['provider']](s)
            state[s['name']].update(status='running', job=job)
        except Exception as e:
            state[s['name']].update(status='failed', error=str(e))
    save_state()

t0 = time.time()
while any(state.get(s['name'], {}).get('status') == 'running' for s in slots):
    if time.time() - t0 > a.timeout:
        print('timeout: jobs still running; rerun to keep polling (nothing is resubmitted)'); break
    for s in slots:
        st = state.get(s['name'])
        if not st or st['status'] != 'running': continue
        status, url, cost, err = POLL[model['provider']](st['job'])
        if status == 'completed':
            out = f'public/face/{s["name"]}.mp4'
            finish(url, out)
            st.update(status='completed', output=out, cost_usd=cost if cost is not None else st['est_usd'])
            print(f'  {s["name"]}: done')
        elif status == 'failed':
            st.update(status='failed', error=err)
            print(f'  {s["name"]}: FAILED {err}')
        save_state()
    time.sleep(5)

man = {'avatar': AV['id'], 'avatar_version': AV['version'], 'master_ref': AV['look']['master_ref'],
       'face_share': S.get('face_share'), 'slots': {}, 'total_usd': 0.0}
for name, st in state.items():
    man['slots'][name] = {k: st.get(k) for k in ('model', 'status', 'seconds', 'cost_usd', 'seed', 'output')}
    man['total_usd'] += st.get('cost_usd') or 0
man['total_usd'] = round(man['total_usd'], 4)
json.dump(man, open('face/manifest.json', 'w'), indent=1)
print(f'manifest: face/manifest.json, total ${man["total_usd"]:.2f}')

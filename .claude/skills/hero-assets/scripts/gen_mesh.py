#!/usr/bin/env python3
"""Hero assets: proposals, Matthew's decisions, and generated 3D models (.glb). Quote first, never pay twice.

usage (from the film folder):
  python3 gen_mesh.py models
  python3 gen_mesh.py propose --id P --object "Las Vegas Sphere" --scene act2/sphere --reason "..." \
          --mode image|text [--prompt "..."] [--image ../refs/sphere.jpg] --model KEY [--options texture,pbr] \
          --stills stills/hero/P/threejs-a.png ... [--stage proposal|comparison]
  python3 gen_mesh.py decide --id P --choice CHOICE --reason "Matthew's words" [--model KEY] [--budget USD] [--notes ".."]
  python3 gen_mesh.py sync   --id P               (reads the decision from Broadcast and records it like `decide`)
  python3 gen_mesh.py quote  --id P [--model KEY] [--options ...]
  python3 gen_mesh.py run    --id P [--model KEY] [--options ...] [--budget USD] [--retry] [--seed N]
  python3 gen_mesh.py status

Choices: keep_threejs | redo_threejs | generate (stage proposal); use_generated | keep_threejs_after_compare (stage
comparison). A paid run needs a `generate` decision naming that model and a budget at least the quote.

Writes (in the film folder): hero/proposals.json (proposals and decisions), hero/state.json (jobs and idempotency keys:
a rerun polls a submitted job instead of resubmitting), hero/manifest.json (model, price, cost, prompt, image hash,
seed, options, proposal id, licence, file hash per generated model), public/hero/<id>/<model>.glb, and
hero/<id>/proposal.md (what is shown to Matthew). Appends every decision to lab/hero-assets/decisions.md.

Providers: placeholder (free, local: writes a primitive .glb with deliberately wrong scale, origin and baked light, so
the fit kit is exercised), broadcast (every paid model: Broadcast's mesh-job proxy holds the fal key and the caps;
the session sends BROADCAST_URL + BROADCAST_TOKEN). This script never calls fal and never reads a fal key.
"""
import argparse, base64, datetime, hashlib, json, math, mimetypes, os, ssl, struct, sys, time, urllib.request, zlib

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
REG = json.load(open(os.path.join(HERE, 'mesh_models.json')))
MODELS = {m['key']: m for m in REG['models']}
DECISIONS_MD = os.environ.get('HERO_DECISIONS', os.path.join(REPO, 'lab', 'hero-assets', 'decisions.md'))
STAGE_CHOICES = {'proposal': ['keep_threejs', 'redo_threejs', 'generate'],
                 'comparison': ['use_generated', 'keep_threejs_after_compare', 'redo_threejs', 'generate']}

ap = argparse.ArgumentParser()
ap.add_argument('cmd', choices=['models', 'propose', 'decide', 'sync', 'quote', 'run', 'status'])
ap.add_argument('--id', help='proposal id, e.g. vegas-01-sphere-1')
ap.add_argument('--object'); ap.add_argument('--scene'); ap.add_argument('--reason')
ap.add_argument('--why-generate', help='why generation might look better (proposal)')
ap.add_argument('--on-screen', help='seconds on screen and framing, e.g. "4.2 s, close-up"')
ap.add_argument('--score', help='rubric, e.g. "focal=1 secs=3.5 frame=close real=1 detail=1 deforms=0"')
ap.add_argument('--mode', choices=['image', 'text'])
ap.add_argument('--prompt'); ap.add_argument('--image')
ap.add_argument('--model'); ap.add_argument('--options', help='comma-separated, e.g. texture,pbr')
ap.add_argument('--stills', nargs='*', default=[])
ap.add_argument('--stage', choices=['proposal', 'comparison'], default='proposal')
ap.add_argument('--choice'); ap.add_argument('--notes', default='')
ap.add_argument('--budget', type=float, help='USD this run may spend (paid models)')
ap.add_argument('--seed', type=int)
ap.add_argument('--source', default='chat', help='where the decision was given: chat | broadcast')
ap.add_argument('--retry', action='store_true', help='resubmit after a failed job (quoted again)')
ap.add_argument('--timeout', type=int, default=1800)
a = ap.parse_args()

if a.cmd == 'models':
    for m in REG['models']:
        opts = ' '.join(f'+{k} ${v["usd"]:.2f}' for k, v in m.get('options', {}).items() if v.get('usd'))
        print(f'{m["key"]:24s} {m["status"]:9s} ${m["price_usd"]:.3f} {opts:30s} {"text+image" if m.get("text") else "image"}'
              f'  {m["label"]}')
    sys.exit()

os.makedirs('hero', exist_ok=True)
P_PATH, S_PATH, M_PATH = 'hero/proposals.json', 'hero/state.json', 'hero/manifest.json'
load = lambda p: json.load(open(p)) if os.path.exists(p) else {}
props, state, man = load(P_PATH), load(S_PATH), load(M_PATH)
dump = lambda obj, p: json.dump(obj, open(p, 'w'), indent=1)
now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
VIDEO_ID = os.environ.get('BROADCAST_VIDEO_ID', os.path.basename(os.path.dirname(os.getcwd())))

if a.cmd == 'status':
    for pid, p in props.items():
        d = p.get('decisions', [])
        last = d[-1] if d else {}
        print(f'{pid:28s} {p["object"][:24]:24s} {p["stage"]:10s} {last.get("choice", "pending"):26s} {last.get("model") or ""}')
    for k, v in state.items():
        print(f'  job {k:36s} {v.get("status"):10s} ${v.get("cost_usd", 0):.2f}  {v.get("output", "")}')
    sys.exit()

if not a.id: sys.exit('--id is required')

# ---------- shared ----------
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
        try: return e.code, json.loads(e.read() or b'{}')
        except ValueError: return e.code, {}


def bc(required=True):
    url, tok = os.environ.get('BROADCAST_URL'), os.environ.get('BROADCAST_TOKEN')
    if not url or not tok:
        if required: sys.exit('broadcast: set BROADCAST_URL and BROADCAST_TOKEN')
        return None, None
    return url.rstrip('/'), {'Authorization': f'Bearer {tok}'}


def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
    return f'data:{mime};base64,' + base64.b64encode(open(path, 'rb').read()).decode()


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def model_of(key):
    m = MODELS.get(key) or sys.exit(f'unknown model {key} (gen_mesh.py models)')
    if m['status'] == 'planned': sys.exit(f'{key} is planned: no adapter yet')
    return m


def pick_options(m, given):
    opts = given.split(',') if given else list(m.get('default_options', []))
    opts = [o for o in opts if o]
    bad = [o for o in opts if o not in m.get('options', {})]
    if bad: sys.exit(f'{m["key"]} has no option {bad}; it has {list(m.get("options", {}))}')
    for o in opts:
        clash = [x for x in m['options'][o].get('excludes', []) if x in opts]
        if clash: opts = [x for x in opts if x not in clash]  # e.g. Tripo 'hd' replaces 'texture'
    return sorted(set(opts))


def fal_request(m, mode, opts, prompt, seed):
    """The endpoint and input Broadcast should send to fal ('$image' stands for the image sent alongside)."""
    ep = m.get('endpoint_text') if mode == 'text' else m.get('endpoint')
    inp, f = dict(m.get('base_inputs', {})), m.get('inputs', {})
    for o in opts: inp.update(m['options'][o].get('inputs', {}))
    if mode == 'image': inp[f['image']] = '$image'
    if prompt:
        if mode == 'text': inp[f['prompt']] = prompt
        elif f.get('texture_prompt'): pass  # an image run keeps the prompt for the record only
    sk = f.get('seed_text') if mode == 'text' and f.get('seed_text') else f.get('seed')
    if sk: inp[sk] = seed
    return ep, inp


def price(m, opts):
    return round(m['price_usd'] + sum(m['options'][o].get('usd', 0) for o in opts), 4)


def quote_table(pr, model_keys):
    rows = []
    for k in model_keys:
        m = MODELS[k]
        if m['status'] == 'planned' or (pr['mode'] == 'text' and not m.get('text')): continue
        o = pick_options(m, None)
        rows.append({'model': k, 'label': m['label'], 'options': o, 'price_usd': price(m, o), 'status': m['status'],
                     'licence': m['licence']['summary']})
    return rows


def append_decision_md(pr, d):
    os.makedirs(os.path.dirname(DECISIONS_MD), exist_ok=True)
    if not os.path.exists(DECISIONS_MD):
        open(DECISIONS_MD, 'w').write('# Hero-asset decisions\n\n(see `.claude/skills/hero-assets/SKILL.md`)\n\n')
    est = next((r['price_usd'] for r in pr.get('quotes', []) if r['model'] == d.get('model')), None)
    line = (f'| {d["date"][:10]} | `{pr["id"]}` | {pr["video_id"]} | {pr["object"]} | {pr.get("on_screen", "")} | '
            f'{pr.get("score", "")} | {pr["stage"]} | {d["choice"]} | {d.get("model") or ""} | '
            f'{"" if est is None else f"${est:.2f}"} | {d["reason"].replace("|", "/")} | {d.get("source", "")} |\n')
    txt = open(DECISIONS_MD).read()
    header = ('| Date | Proposal | Video | Object | On screen | Score | Stage | Choice | Model | Est. | Reason (his words) | Via |\n'
              '|---|---|---|---|---|---|---|---|---|---|---|---|\n')
    if '## Log' not in txt: txt += '\n## Log\n\n' + header
    open(DECISIONS_MD, 'w').write(txt + line)


# ---------- propose ----------
if a.cmd == 'propose':
    old = props.get(a.id, {})
    need = ['object', 'scene', 'mode', 'model'] if a.stage == 'proposal' else []
    miss = [n for n in need if not getattr(a, n) and not old.get('suggested_model' if n == 'model' else n)]
    if miss: sys.exit(f'missing --{" --".join(miss)}')
    pr = {**old, 'id': a.id, 'video_id': VIDEO_ID, 'stage': a.stage, 'updated': now()}
    for k in ('object', 'scene', 'reason', 'mode', 'prompt', 'image'):
        if getattr(a, k) is not None: pr[k] = getattr(a, k)
    if a.why_generate: pr['why_generate'] = a.why_generate
    if a.on_screen: pr['on_screen'] = a.on_screen
    if a.score: pr['score'] = a.score
    if a.model: pr['suggested_model'] = a.model
    if pr['mode'] == 'image' and not (pr.get('image') and os.path.exists(pr['image'])):
        sys.exit('image mode: --image must point at an existing reference')
    if pr['mode'] == 'text' and not pr.get('prompt'): sys.exit('text mode: --prompt is required')
    stills = pr.setdefault('stills', {})
    for s in a.stills:
        if not os.path.exists(s): sys.exit(f'still missing: {s}')
    stills[a.stage] = a.stills or stills.get(a.stage, [])
    pr.setdefault('decisions', [])
    pr['quotes'] = quote_table(pr, list(MODELS))
    sm = MODELS[pr['suggested_model']]
    pr['estimate_usd'] = price(sm, pick_options(sm, a.options))
    props[a.id] = pr
    dump(props, P_PATH)
    os.makedirs(f'hero/{a.id}', exist_ok=True)
    md = [f'# Hero asset proposal `{a.id}` ({pr["stage"]})', '',
          f'**Object:** {pr["object"]}  ·  **Scene:** {pr["scene"]}  ·  **On screen:** {pr.get("on_screen", "?")}', '',
          f'**Rubric:** {pr.get("score", "(not scored)")}', '',
          f'**Why it is a candidate:** {pr.get("reason", "")}', '',
          f'**Why generation might look better:** {pr.get("why_generate", "")}', '',
          f'**Input:** {pr["mode"]}-to-3D' + (f'; prompt "{pr["prompt"]}"' if pr.get('prompt') else '') +
          (f'; reference `{pr["image"]}`' if pr.get('image') else ''), '',
          f'**Suggested:** `{pr["suggested_model"]}` at ${pr["estimate_usd"]:.2f}', '',
          '| Model | Options | Price | Status | Licence |', '|---|---|---|---|---|']
    md += [f'| `{r["model"]}` | {",".join(r["options"]) or "-"} | ${r["price_usd"]:.2f} | {r["status"]} | {r["licence"]} |'
           for r in pr['quotes'] if r['model'] != 'placeholder']
    md += ['', '**Stills:**'] + [f'- {st}: ' + ', '.join(f'`{x}`' for x in v) for st, v in pr['stills'].items()]
    md += ['', 'Choices: ' + ' / '.join(STAGE_CHOICES[pr['stage']]) + ' (with a model to generate, and the reason).']
    open(f'hero/{a.id}/proposal.md', 'w').write('\n'.join(md) + '\n')
    print('\n'.join(md))
    url, h = bc(required=False)
    if url:
        body = {'proposal_id': a.id, 'video_id': VIDEO_ID, 'object': pr['object'], 'scene': pr['scene'],
                'reason': pr.get('reason'), 'score': pr.get('score'), 'why_generate': pr.get('why_generate'), 'on_screen': pr.get('on_screen'),
                'input': {'mode': pr['mode'], 'prompt': pr.get('prompt'),
                          'image': data_uri(pr['image']) if pr.get('image') else None},
                'suggested_model': pr['suggested_model'], 'estimate_usd': pr['estimate_usd'], 'options': pr['quotes'],
                'stills': [{'label': os.path.splitext(os.path.basename(s))[0], 'image': data_uri(s)}
                           for s in pr['stills'][pr['stage']]], 'stage': pr['stage']}
        code, r = http('POST', f'{url}{REG["proxy"]["proposals"]}', h, body)
        print(f'\nposted to Broadcast: {code} {r}' if code < 300 else f'\nBroadcast refused the proposal {code}: {r}')
    else:
        print('\n(no BROADCAST_URL: show hero/%s/proposal.md and the stills to Matthew in the session)' % a.id)
    sys.exit()

pr = props.get(a.id) or sys.exit(f'no proposal {a.id}: run propose first (hero/proposals.json)')


def record(choice, reason, model=None, budget=None, notes='', source='chat', date=None):
    if choice not in STAGE_CHOICES[pr['stage']]:
        sys.exit(f'choice {choice} not valid at stage {pr["stage"]}: {STAGE_CHOICES[pr["stage"]]}')
    if choice == 'generate' and not model: sys.exit('generate: --model is the model Matthew picked')
    if not reason: sys.exit('--reason: his reason, in his words (ask if he gave none)')
    if model: model_of(model)
    d = {'stage': pr['stage'], 'choice': choice, 'model': model, 'budget_usd': budget, 'reason': reason,
         'notes': notes, 'source': source, 'date': date or now()}
    pr['decisions'].append(d)
    dump(props, P_PATH)
    append_decision_md(pr, d)
    print(f'recorded: {a.id} {pr["stage"]} -> {choice} {model or ""}  ({DECISIONS_MD})')


if a.cmd == 'decide':
    record(a.choice, a.reason, a.model, a.budget, a.notes, a.source)
    sys.exit()

if a.cmd == 'sync':
    url, h = bc()
    code, r = http('GET', f'{url}{REG["proxy"]["proposals"]}/{a.id}', h)
    if code >= 300: sys.exit(f'Broadcast {code}: {r}')
    d = r.get('decision')
    if r.get('status') != 'decided' or not d: sys.exit(f'{a.id}: still pending in Broadcast')
    seen = any(x.get('date') == d.get('decided_at') for x in pr['decisions'])
    if seen: sys.exit(f'{a.id}: decision already recorded')
    record(d['choice'], d.get('reason') or '', d.get('model'), d.get('budget_usd'), d.get('notes', ''), 'broadcast',
           d.get('decided_at'))
    sys.exit()

# ---------- quote / run ----------
approved = next((d for d in reversed(pr['decisions']) if d['choice'] == 'generate'), None)
model = model_of(a.model or (approved or {}).get('model') or 'placeholder')
opts = pick_options(model, a.options)
cost = price(model, opts)
paid = model['provider'] != 'placeholder'
if pr['mode'] == 'text' and not model.get('text'): sys.exit(f'{model["key"]} has no text-to-3D; use an image')
seed = a.seed if a.seed is not None else REG.get('default_seed', 7)
img = pr.get('image')
JOB = f'{a.id}:{model["key"]}'


def idem():
    parts = [model['key'], model.get('endpoint', ''), a.id, pr['mode'], sha(img) if img else '', pr.get('prompt') or '',
             str(seed), ','.join(opts)]
    return hashlib.sha256('|'.join(parts).encode()).hexdigest()[:24]


st = state.get(JOB)
todo = ('new' if not st or st.get('idem') != idem() else
        'done' if st['status'] == 'completed' and os.path.exists(st.get('output', '')) else
        ('retry' if a.retry else 'failed') if st['status'] == 'failed' else
        'resubmit' if st['status'] == 'submitting' else 'poll')  # resubmit: same key, Broadcast returns the same job
spent = sum(v.get('cost_usd') or 0 for v in state.values())
print(f'{a.id}: {model["key"]} ({model["status"]}) options {opts or "-"}  ${cost:.2f}  {todo}; '
      f'spent on this video ${spent:.2f}')
print(f'  licence: {model["licence"]["summary"]}')
if paid: print('  fal request (sent by Broadcast): %s %s' % fal_request(model, pr['mode'], opts, pr.get('prompt'), seed))
if a.cmd == 'quote': sys.exit()

if paid and todo in ('new', 'retry'):
    if not approved: sys.exit('no `generate` decision on this proposal: nothing started (post the proposal first)')
    if approved['model'] != model['key']:
        sys.exit(f'Matthew approved {approved["model"]}, not {model["key"]}: nothing started')
    budget = a.budget if a.budget is not None else approved.get('budget_usd')
    if budget is None: sys.exit('paid run: pass --budget USD (the approved amount)')
    if cost > budget + 1e-9: sys.exit(f'quote ${cost:.2f} exceeds the budget ${budget:.2f}: nothing started')
    cap = REG.get('cost_cap_per_video_usd')
    if cap and spent + cost > cap + 1e-9: sys.exit(f'would pass the per-video cap ${cap:.2f}: nothing started')


# ---------- placeholder: a primitive .glb ----------
def png_rgb(w, h, px):
    raw = b''.join(b'\x00' + bytes(px[y * w * 3:(y + 1) * w * 3]) for y in range(h))
    ch = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + ch(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + \
        ch(b'IDAT', zlib.compress(bytes(raw), 9)) + ch(b'IEND', b'')


def placeholder_glb(out):
    """A sphere on a plinth: what a generator might return. Deliberately wrong for the fit kit to fix: units in
    centimetres (radius 57), origin off the base and off-centre, metallicFactor left at glTF's default 1 on the plinth,
    and the sphere's albedo with shading and a highlight baked in from a light at the upper left."""
    R, OFF = 57.0, (31.0, 12.0, -8.0)
    W, H = 256, 128
    L = (-0.55, 0.65, 0.52); ln = math.sqrt(sum(c * c for c in L)); L = tuple(c / ln for c in L)
    px = bytearray(W * H * 3)
    for y in range(H):
        lat = math.pi * (0.5 - (y + 0.5) / H)
        for x in range(W):
            lon = 2 * math.pi * (x + 0.5) / W
            n = (math.cos(lat) * math.cos(lon), math.sin(lat), -math.cos(lat) * math.sin(lon))
            dot = (x % 8 < 5) and (y % 8 < 5)  # an LED grid
            base = (240, 170, 60) if dot else (40, 44, 60)
            if abs(lat) < 0.35 and dot: base = (70, 160, 250)
            shade = 0.25 + 0.95 * max(0.0, sum(n[i] * L[i] for i in range(3)))
            spec = max(0.0, sum(n[i] * L[i] for i in range(3))) ** 24 * 180
            for c in range(3):
                px[(y * W + x) * 3 + c] = max(0, min(255, int(base[c] * shade + spec)))
    tex = png_rgb(W, H, px)

    def sphere(seg=48, rings=24):
        P, N, U, I = [], [], [], []
        for r in range(rings + 1):
            v = r / rings; lat = math.pi * (0.5 - v)
            for s in range(seg + 1):
                u = s / seg; lon = 2 * math.pi * u
                n = (math.cos(lat) * math.cos(lon), math.sin(lat), -math.cos(lat) * math.sin(lon))
                P.append((OFF[0] + R * n[0], OFF[1] + R + 18 + R * n[1], OFF[2] + R * n[2])); N.append(n); U.append((u, v))
        for r in range(rings):
            for s in range(seg):
                i = r * (seg + 1) + s; j = i + seg + 1
                I += [i, j, i + 1, i + 1, j, j + 1]
        return P, N, U, I

    def plinth(seg=48, r=34.0, h=22.0):
        P, N, U, I = [], [], [], []
        for k in range(2):
            for s in range(seg + 1):
                a_ = 2 * math.pi * s / seg; c, sn = math.cos(a_), math.sin(a_)
                P.append((OFF[0] + r * c, OFF[1] + k * h, OFF[2] + r * sn)); N.append((c, 0, sn)); U.append((s / seg, k))
        for s in range(seg):
            I += [s, s + seg + 1, s + 1, s + 1, s + seg + 1, s + seg + 2]
        top = len(P); P.append((OFF[0], OFF[1] + h, OFF[2])); N.append((0, 1, 0)); U.append((0.5, 0.5))
        for s in range(seg + 1):
            a_ = 2 * math.pi * s / seg
            P.append((OFF[0] + r * math.cos(a_), OFF[1] + h, OFF[2] + r * math.sin(a_))); N.append((0, 1, 0)); U.append((0.5, 0.5))
        for s in range(seg): I += [top, top + 2 + s, top + 1 + s]
        return P, N, U, I

    bin_ = bytearray(); views, accs = [], []

    def add(data, target=None):
        while len(bin_) % 4: bin_.append(0)
        views.append({'buffer': 0, 'byteOffset': len(bin_), 'byteLength': len(data), **({'target': target} if target else {})})
        bin_.extend(data); return len(views) - 1

    prims = []
    for (P, N, U, I), mat in ((sphere(), 0), (plinth(), 1)):
        pa = add(b''.join(struct.pack('<3f', *p) for p in P), 34962)
        accs.append({'bufferView': pa, 'componentType': 5126, 'count': len(P), 'type': 'VEC3',
                     'min': [min(p[i] for p in P) for i in range(3)], 'max': [max(p[i] for p in P) for i in range(3)]})
        accs.append({'bufferView': add(b''.join(struct.pack('<3f', *n) for n in N), 34962), 'componentType': 5126,
                     'count': len(N), 'type': 'VEC3'})
        accs.append({'bufferView': add(b''.join(struct.pack('<2f', *u) for u in U), 34962), 'componentType': 5126,
                     'count': len(U), 'type': 'VEC2'})
        accs.append({'bufferView': add(struct.pack(f'<{len(I)}I', *I), 34963), 'componentType': 5125,
                     'count': len(I), 'type': 'SCALAR'})
        b = len(accs) - 4
        prims.append({'attributes': {'POSITION': b, 'NORMAL': b + 1, 'TEXCOORD_0': b + 2}, 'indices': b + 3, 'material': mat})
    img_view = add(tex)
    gltf = {'asset': {'version': '2.0', 'generator': 'hero-assets placeholder'},
            'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0, 'name': 'placeholder'}],
            'meshes': [{'primitives': prims}],
            'materials': [{'name': 'baked', 'pbrMetallicRoughness': {'baseColorTexture': {'index': 0},
                                                                     'metallicFactor': 0.0, 'roughnessFactor': 0.5}},
                          {'name': 'plinth', 'pbrMetallicRoughness': {'baseColorFactor': [0.18, 0.18, 0.2, 1]}}],
            'textures': [{'source': 0, 'sampler': 0}], 'samplers': [{'magFilter': 9729, 'minFilter': 9987}],
            'images': [{'bufferView': img_view, 'mimeType': 'image/png'}],
            'buffers': [{'byteLength': 0}], 'bufferViews': views, 'accessors': accs}
    while len(bin_) % 4: bin_.append(0)
    gltf['buffers'][0]['byteLength'] = len(bin_)
    js = json.dumps(gltf, separators=(',', ':')).encode()
    js += b' ' * ((4 - len(js) % 4) % 4)
    body = struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(bin_)) + b'BIN\x00' + bytes(bin_)
    open(out, 'wb').write(struct.pack('<4sII', b'glTF', 2, 12 + len(body)) + body)


# ---------- broadcast proxy ----------
def submit(key):
    url, h = bc()
    body = {'kind': 'mesh', 'proposal_id': a.id, 'video_id': VIDEO_ID, 'model': model['key'], 'idempotency_key': key,
            'mode': pr['mode'], 'image': data_uri(img) if img else None, 'prompt': pr.get('prompt'), 'seed': seed,
            'options': {o: True for o in opts}, 'quote_usd': cost}
    body['fal_endpoint'], body['fal_input'] = fal_request(model, pr['mode'], opts, pr.get('prompt'), seed)
    body['output_field'] = model['output']
    code, r = http('POST', f'{url}{REG["proxy"]["jobs"]}', h, body)
    if code == 402: raise RuntimeError(f'broadcast budget: {r}')
    if code == 403: raise RuntimeError(f'broadcast: not approved there: {r}')
    if code >= 300 or 'job_id' not in r: raise RuntimeError(f'broadcast submit {code}: {r}')
    return {'job_id': r['job_id']}


def poll(job):
    url, h = bc()
    code, r = http('GET', f'{url}{REG["proxy"]["jobs"]}/{job["job_id"]}', h)
    s = r.get('status')
    if s == 'completed': return 'completed', r.get('output_url'), r.get('cost_usd'), None
    if s in ('queued', 'running'): return 'running', None, None, None
    return 'failed', None, None, r.get('error') or f'broadcast {code}: {r}'


def download(src, out):
    with urllib.request.urlopen(urllib.request.Request(src), context=CTX, timeout=600) as r, open(out + '.dl', 'wb') as f:
        f.write(r.read())
    if open(out + '.dl', 'rb').read(4) != b'glTF': raise RuntimeError('download is not a binary glTF (.glb)')
    os.replace(out + '.dl', out)


out = f'public/hero/{a.id}/{model["key"]}.glb'
os.makedirs(os.path.dirname(out), exist_ok=True)
if todo == 'failed':
    sys.exit(f'last job failed ({st.get("error")}); --retry resubmits (a paid retry is quoted again above)')
if paid and todo in ('new', 'retry', 'resubmit'): bc()  # before any state is written
if todo == 'resubmit':
    try: state[JOB].update(status='running', job=submit(state[JOB]['idem']))
    except Exception as e: state[JOB].update(status='failed', error=str(e))
    dump(state, S_PATH)
if todo in ('new', 'retry'):
    state[JOB] = {'model': model['key'], 'idem': idem(), 'status': 'submitting', 'seed': seed, 'options': opts,
                  'est_usd': cost, 'started': now()}
    dump(state, S_PATH)  # the key is saved before any paid call
    if not paid:
        placeholder_glb(out)
        state[JOB].update(status='completed', output=out, cost_usd=0)
    else:
        try: state[JOB].update(status='running', job=submit(state[JOB]['idem']))
        except Exception as e: state[JOB].update(status='failed', error=str(e))
    dump(state, S_PATH)

t0 = time.time()
while state[JOB]['status'] == 'running':
    if time.time() - t0 > a.timeout: sys.exit('timeout: job still running; rerun to keep polling (nothing resubmitted)')
    s, src, c, err = poll(state[JOB]['job'])
    if s == 'completed':
        try:
            download(src, out)
            state[JOB].update(status='completed', output=out, source_url=src, cost_usd=c if c is not None else cost)
        except Exception as e:  # paid for: keep the job and its URL, a rerun downloads again without resubmitting
            state[JOB].update(status='running', download_error=str(e)); dump(state, S_PATH)
            sys.exit(f'download failed ({e}); rerun to retry the download (not resubmitted)')
    elif s == 'failed':
        state[JOB].update(status='failed', error=err)
    dump(state, S_PATH)
    if state[JOB]['status'] == 'running': time.sleep(5)

st = state[JOB]
if st['status'] != 'completed': sys.exit(f'FAILED: {st.get("error")}')
man[JOB] = {'proposal_id': a.id, 'video_id': VIDEO_ID, 'object': pr['object'], 'model': model['key'],
            'label': model['label'], 'endpoint': fal_request(model, pr['mode'], opts, pr.get('prompt'), seed)[0] if paid else None, 'mode': pr['mode'], 'prompt': pr.get('prompt'),
            'image': img, 'image_sha256': sha(img) if img else None, 'seed': seed, 'options': opts,
            'price_usd': cost, 'cost_usd': st.get('cost_usd'), 'output': st['output'], 'sha256': sha(st['output']),
            'bytes': os.path.getsize(st['output']), 'source_url': st.get('source_url'),
            'licence': model['licence'], 'date': st.get('started')}
dump(man, M_PATH)
print(f'{st["output"]} ({man[JOB]["bytes"]} bytes, ${st.get("cost_usd") or 0:.2f}); manifest: {M_PATH}')

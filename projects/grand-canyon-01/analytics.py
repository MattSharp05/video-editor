# Analytics for Grand Canyon 01 from the session transcript: wall time, work counts and tokens for two phases,
# script (topic -> approved v0.2) and production (go-ahead -> delivery). Subagent runs are included by timestamp.
import json, glob, collections, datetime as dt, sys
S = '5dc44929-3cdd-5cc0-86b7-02dfff66f5f5'
F = f'/root/.claude/projects/-home-user/{S}.jsonl'
P = lambda s: dt.datetime.fromisoformat(s.replace('Z', '+00:00'))
rows = [json.loads(l) for l in open(F)]
def utext(d):
    c = d.get('message', {}).get('content')
    return c if isinstance(c, str) else ' '.join(b.get('text', '') for b in c if isinstance(b, dict) and b.get('type') == 'text') if isinstance(c, list) else ''
topic = next(P(d['timestamp']) for d in rows if d.get('type') == 'user' and 'grand canyon was formed' in utext(d).lower())
go = P(open('/home/user/video-editor/projects/grand-canyon-01/.start').read().strip())
end = P(sys.argv[1]) if len(sys.argv) > 1 else max(P(d['timestamp']) for d in rows if d.get('timestamp'))
PH = [('Script: topic -> fact-checked v0.2', topic, go), ('Production: go-ahead -> delivered film', go, end)]
def which(t):
    for i, (_, a, b) in enumerate(PH):
        if a <= t < b: return i
st = [collections.Counter() for _ in PH]; seen = set()
for d in rows:
    if not d.get('timestamp'): continue
    p = which(P(d['timestamp']))
    if p is None: continue
    if d.get('type') == 'assistant':
        m = d['message']
        if m.get('id') not in seen:
            seen.add(m.get('id')); u = m.get('usage', {}) or {}
            for k, v in [('out', 'output_tokens'), ('fresh', 'input_tokens'), ('cache_r', 'cache_read_input_tokens'), ('cache_w', 'cache_creation_input_tokens')]:
                st[p][k] += u.get(v, 0)
            st[p]['responses'] += 1
        for b in m.get('content', []) if isinstance(m.get('content'), list) else []:
            if b.get('type') != 'tool_use': continue
            st[p]['tools'] += 1; name, inp = b['name'], json.dumps(b.get('input', {}))
            if name in ('Write', 'Edit') or (name == 'Bash' and ("s.replace(" in inp or 'sed -i' in inp)): st[p]['edits'] += 1
            if name == 'Bash' and 'remotion render' in inp: st[p]['full_renders'] += 1
            if name == 'Bash' and ('stills.mjs' in inp or 'remotion still' in inp): st[p]['still_batches'] += 1
            if name == 'Read' and any(x in inp for x in ('.png', '.jpg')): st[p]['image_reviews'] += 1
            if name == 'Agent': st[p]['agents'] += 1
            if name in ('WebSearch', 'WebFetch'): st[p]['web'] += 1
    if d.get('type') == 'user' and isinstance(d.get('message', {}).get('content'), list):
        for b in d['message']['content']:
            if isinstance(b, dict) and b.get('type') == 'tool_result' and b.get('is_error'): st[p]['errors'] += 1
for f in glob.glob(f'/root/.claude/projects/-home-user/{S}/subagents/*.jsonl'):
    s2 = set()
    for l in open(f):
        d = json.loads(l)
        if d.get('type') != 'assistant' or not d.get('timestamp'): continue
        p = which(P(d['timestamp'])); m = d['message']
        if p is None or m.get('id') in s2: continue
        s2.add(m.get('id')); u = m.get('usage', {}) or {}
        st[p]['sub_out'] += u.get('output_tokens', 0)
        st[p]['sub_in'] += u.get('input_tokens', 0) + u.get('cache_read_input_tokens', 0) + u.get('cache_creation_input_tokens', 0)
out = []
for (name, a, b), s in zip(PH, st):
    out.append({'phase': name, 'start': a.isoformat(), 'end': b.isoformat(), 'minutes': round((b - a).total_seconds() / 60, 1), **s})
print(json.dumps(out, indent=1))

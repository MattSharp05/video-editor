# Production analytics from a Claude Code session transcript: wall time, responses, tool calls, edits, still batches,
# image reviews, renders, web lookups, subagents and tokens per phase. From projects/grand-canyon-01/analytics.py.
# usage: python3 analytics.py TRANSCRIPT.jsonl "Script=2026-11-06T02:24:43Z" "Production=2026-11-06T02:44:32Z" [--end ISO]
#   Each phase runs from its start to the next phase's start (the last one to --end, or the transcript's last entry).
#   Transcripts: ~/.claude/projects/<cwd-slug>/<session-id>.jsonl; subagents in <session-id>/subagents/*.jsonl.
#   Write the phase starts down as they happen (a `.start` file or the brief) so the split is exact.
import json, glob, collections, os, sys, datetime as dt

P = lambda s: dt.datetime.fromisoformat(s.replace('Z', '+00:00'))
args = [a for a in sys.argv[1:] if not a.startswith('--end')]
end_arg = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--end=')), None)
if len(args) < 2: sys.exit(__doc__ or open(__file__).read().split('\nimport')[0])
F = args[0]
rows = [json.loads(l) for l in open(F)]
names = [a.split('=', 1)[0] for a in args[1:]]; starts = [P(a.split('=', 1)[1]) for a in args[1:]]
end = P(end_arg) if end_arg else max(P(d['timestamp']) for d in rows if d.get('timestamp'))
PH = list(zip(names, starts, starts[1:] + [end]))


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
        if m.get('id') not in seen:   # one response can span several transcript entries
            seen.add(m.get('id')); u = m.get('usage', {}) or {}
            for k, v in [('out', 'output_tokens'), ('fresh', 'input_tokens'), ('cache_r', 'cache_read_input_tokens'), ('cache_w', 'cache_creation_input_tokens')]:
                st[p][k] += u.get(v, 0)
            st[p]['responses'] += 1
        for b in m.get('content', []) if isinstance(m.get('content'), list) else []:
            if b.get('type') != 'tool_use': continue
            st[p]['tools'] += 1; name, inp = b['name'], json.dumps(b.get('input', {}))
            if name in ('Write', 'Edit') or (name == 'Bash' and ('s.replace(' in inp or 'sed -i' in inp)): st[p]['edits'] += 1
            if name == 'Bash' and 'remotion render' in inp: st[p]['renders'] += 1
            if name == 'Bash' and ('stills.mjs' in inp or 'remotion still' in inp or 'snap.sh' in inp): st[p]['still_batches'] += 1
            if name == 'Read' and any(x in inp for x in ('.png', '.jpg')): st[p]['image_reviews'] += 1
            if name in ('Agent', 'Task'): st[p]['agents'] += 1
            if name in ('WebSearch', 'WebFetch'): st[p]['web'] += 1
    if d.get('type') == 'user' and isinstance(d.get('message', {}).get('content'), list):
        for b in d['message']['content']:
            if isinstance(b, dict) and b.get('type') == 'tool_result' and b.get('is_error'): st[p]['errors'] += 1
for f in glob.glob(os.path.join(F[:-len('.jsonl')], 'subagents', '*.jsonl')):
    s2 = set()
    for l in open(f):
        d = json.loads(l)
        if d.get('type') != 'assistant' or not d.get('timestamp'): continue
        p = which(P(d['timestamp'])); m = d['message']
        if p is None or m.get('id') in s2: continue
        s2.add(m.get('id')); u = m.get('usage', {}) or {}
        st[p]['sub_out'] += u.get('output_tokens', 0)
        st[p]['sub_in'] += u.get('input_tokens', 0) + u.get('cache_read_input_tokens', 0) + u.get('cache_creation_input_tokens', 0)
out = [{'phase': n, 'start': a.isoformat(), 'end': b.isoformat(), 'minutes': round((b - a).total_seconds() / 60, 1), **s}
       for (n, a, b), s in zip(PH, st)]
print(json.dumps(out, indent=1))

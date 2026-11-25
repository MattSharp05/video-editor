# Put the script's words back where the ASR wrote digits or merged words; timings split evenly over the heard span.
# Keeps the script's punctuation for the captions. Run after align.py; then check_words.py should print no diffs.
import json, re, difflib
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
script = [w for l in json.load(open('lines.json')) for w in l.split()]
W = [w for w in json.load(open('../film/src/words.json')) if norm(w['w'])]
out = []
for op, a, b, c, d in difflib.SequenceMatcher(None, [norm(x) for x in script], [norm(w['w']) for w in W]).get_opcodes():
    if op == 'equal':
        out += [{'w': script[a + k], 's': W[c + k]['s'], 'e': W[c + k]['e']} for k in range(b - a)]
    else:
        assert d > c, (op, script[a:b])
        s0, e0, n = W[c]['s'], W[d - 1]['e'], b - a
        out += [{'w': script[a + k], 's': round(s0 + (e0 - s0) * k / n, 3), 'e': round(s0 + (e0 - s0) * (k + 1) / n, 3)} for k in range(n)]
        print('fixed', W[c:d], '->', script[a:b])
json.dump(out, open('../film/src/words.json', 'w'), indent=0)

# Replace ASR spellings in words.json with the script's words, one for one (counts must match): keeps timings.
import json, re
L = json.load(open('lines.json'))['lines']; W = json.load(open('words.json'))
S = ' '.join(L).split()
assert len(S) == len(W), (len(S), len(W))
n = lambda s: re.sub(r"[^a-z0-9]", '', s.lower())
diff = [(w['w'], s) for w, s in zip(W, S) if n(w['w']) != n(s)]
for w, s in zip(W, S): w['w'] = s
json.dump(W, open('words.json', 'w'), indent=0); print('fixed', diff)

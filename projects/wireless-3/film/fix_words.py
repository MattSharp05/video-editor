# ASR fixes to vo/words.json -> src/words.json (the audio says the script words; whisper wrote them differently):
# line 3 "Dr." -> "Doctor"; line 15 "sharp" "eyed" -> "sharp-eyed". usage: python3 fix_words.py
import json, re
W = json.load(open('../vo/words.json')); out = []
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
i = 0
while i < len(W):
    w = dict(W[i])
    if norm(w['w']) == 'dr': w['w'] = 'Doctor'
    if norm(w['w']) == 'sharp' and i + 1 < len(W) and norm(W[i + 1]['w']) == 'eyed':
        w = {'w': 'sharp-eyed', 's': w['s'], 'e': W[i + 1]['e']}; i += 1
    out.append(w); i += 1
L = json.load(open('../vo/lines.json'))
want = [norm(x) for l in L for x in l.split()]
heard = [norm(w['w']) for w in out]
assert heard == want, [(a, b) for a, b in zip(heard, want) if a != b][:5] or (len(heard), len(want))
json.dump(out, open('src/words.json', 'w'), indent=0); print(len(out), 'words OK, last end', out[-1]['e'])

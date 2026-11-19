# Fix ASR number forms in film/src/words.json after align.py (re-run after every re-alignment): whisper writes
# "20", "50", "200"; the script (and the captions) say "twenty", "fifty", "two hundred".
import json
p = '../film/src/words.json'; W = json.load(open(p)); out = []
for w in W:
    k = w['w'].strip('.,')
    if k == '20': out.append(dict(w, w='twenty'))
    elif k == '50': out.append(dict(w, w='fifty'))
    elif k == '200':
        m = round((w['s'] + w['e']) / 2, 3); out += [{'w': 'two', 's': w['s'], 'e': m}, {'w': 'hundred', 's': m, 'e': w['e']}]
    else: out.append(w)
json.dump(out, open(p, 'w'), indent=0); print(len(W), '->', len(out))

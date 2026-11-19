# Fix ASR forms in film/src/words.json after align.py so they match the captions (re-run after every re-alignment).
# "660 tonne" -> "660-tonne" (spoken "six hundred sixty ton"; caption says tonne per the fact check), "40%" -> "40" "percent."
import json
p = '../film/src/words.json'; W = json.load(open(p)); out = []
for w in W:
    if w['w'].lower().startswith('tonne') and out and out[-1]['w'] == '660':
        out[-1] = {'w': '660-tonne', 's': out[-1]['s'], 'e': w['e']}; continue
    if w['w'].startswith('40%'):
        m = round((w['s'] + w['e']) / 2, 3)
        out += [{'w': '40', 's': w['s'], 'e': m}, {'w': 'percent.', 's': m, 'e': w['e']}]; continue
    out.append(w)
json.dump(out, open(p, 'w'), indent=0); print(len(W), '->', len(out))

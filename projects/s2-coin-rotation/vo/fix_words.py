# Fix ASR tokenisation in film/src/words.json after align.py (re-run after every re-alignment):
# "S .A .T." -> one word "S.A.T."; "300 ,000" -> "three hundred thousand" (split evenly over its span).
import json
p = '../film/src/words.json'; W = json.load(open(p)); out = []
i = 0
while i < len(W):
    w = W[i]
    if w['w'] == 'S' and i + 2 < len(W) and W[i + 1]['w'] == '.A':
        out.append({'w': 'S.A.T.', 's': w['s'], 'e': W[i + 2]['e']}); i += 3; continue
    if w['w'] == '300' and i + 1 < len(W) and W[i + 1]['w'].startswith(',000'):
        s, e = w['s'], W[i + 1]['e']; d = (e - s) / 3
        out += [{'w': x, 's': round(s + k * d, 3), 'e': round(s + (k + 1) * d, 3)} for k, x in enumerate(['three', 'hundred', 'thousand'])]; i += 2; continue
    out.append(w); i += 1
json.dump(out, open(p, 'w'), indent=0); print(len(W), '->', len(out))

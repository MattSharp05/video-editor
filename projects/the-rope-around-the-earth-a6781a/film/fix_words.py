# Whisper writes numbers as digits: put the spoken words back (script v1), splitting "40 ,000" into two timed words.
import json
W = json.load(open('src/words.json')); out = []
i = 0
while i < len(W):
    w = W[i]; k = w['w'].strip()
    if k == '40' and i + 1 < len(W) and W[i + 1]['w'].strip().startswith(','):
        n = W[i + 1]; out += [{'w': 'forty', 's': w['s'], 'e': w['e']}, {'w': 'thousand', 's': n['s'], 'e': n['e']}]; i += 2; continue
    if k.strip(',.') == '16': w = dict(w, w='sixteen')
    out.append(w); i += 1
json.dump(out, open('src/words.json', 'w'), indent=0)
print(len(out), ' '.join(x['w'] for x in out)[:400])

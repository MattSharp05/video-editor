# Fix ASR formatting in film/src/words.json after align.py (re-run after every re-alignment): numbers written as digits
# and hyphenated words split -> the script's spelling, so captions and cues match the script word for word.
import json
p = '../film/src/words.json'; W = json.load(open(p)); out = []; i = 0
def join(n, text): global i; out.append({'w': text, 's': W[i]['s'], 'e': W[i + n - 1]['e']}); i += n
while i < len(W):
    w = W[i]['w'].strip()
    if w == '50' and i + 1 < len(W) and W[i + 1]['w'].startswith('-50'): join(2, 'fifty-fifty' + W[i + 1]['w'][3:]); continue
    if w.lower() == 'one' and [x['w'].strip('.,').lower() for x in W[i + 1:i + 4]] == ['in', 'a', 'hundred']: join(4, 'one-in-a-hundred'); continue
    if w.startswith('98'): join(1, 'ninety-eight' + w[2:]); continue
    if w.startswith('99'): join(1, 'ninety-nine' + w[2:]); continue
    out.append(W[i]); i += 1
json.dump(out, open(p, 'w'), indent=0); print(len(W), '->', len(out))

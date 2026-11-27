# Whisper writes the number as digits split in two ("27" ",572"): merge them into one timed word "27,572", which the
# captions show exactly as the card does. Run after align.py.
import json
W = json.load(open('src/words.json')); out = []; i = 0
while i < len(W):
    w = W[i]
    if w['w'].strip() == '27' and i + 1 < len(W) and W[i + 1]['w'].strip().startswith(','):
        out.append({'w': '27,572', 's': w['s'], 'e': W[i + 1]['e']}); i += 2; continue
    out.append(w); i += 1
json.dump(out, open('src/words.json', 'w'), indent=0)
print(len(out), ' '.join(x['w'] for x in out)[-160:])

# Whisper splits "three-second" into "three" + "-second": merge them into one timed word, as the script and captions
# have it. Run after align.py.
import json
W = json.load(open('src/words.json')); out = []; i = 0
while i < len(W):
    w = W[i]
    if i + 1 < len(W) and W[i + 1]['w'].strip() == '-second':
        out.append({'w': w['w'] + '-second', 's': w['s'], 'e': W[i + 1]['e']}); i += 2; continue
    out.append(w); i += 1
json.dump(out, open('src/words.json', 'w'), indent=0)
print(len(out))

# Fix ASR slips in film/src/words.json after align.py (re-run after every re-alignment).
# "molecules there" heard as "molecules their" (a homophone: the audio is the script's word).
import json
p = '../film/src/words.json'; W = json.load(open(p))
for i, w in enumerate(W):
    if w['w'].lower() == 'their' and i and W[i - 1]['w'].lower() == 'molecules': w['w'] = 'there'
json.dump(W, open(p, 'w'), indent=0); print(len(W), 'words')

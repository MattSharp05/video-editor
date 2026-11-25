# Fix ASR slips in film/src/words.json after align.py (re-run after every re-alignment).
# "feel it least" heard as "feel at least" (listen to line 7 to confirm the audio); "seatbelt" heard as "seat belt".
import json
p = '../film/src/words.json'; W = json.load(open(p)); out = []
for i, w in enumerate(W):
    if w['w'].lower().strip('.,') == 'belt' and out and out[-1]['w'].lower() == 'seat':
        out[-1] = {'w': 'seatbelt', 's': out[-1]['s'], 'e': w['e']}; continue
    if w['w'].lower() == 'at' and out and out[-1]['w'].lower() == 'feel': w = dict(w, w='it')
    out.append(w)
json.dump(out, open(p, 'w'), indent=0); print(len(W), '->', len(out))

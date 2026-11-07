# ASR fixes for lightsaber-01 words.json (checked against the script and single-line transcripts):
#  "20" ",000" -> "20,000" (split number); "that's small" -> "that small" (line 12 alone reads "that small", 2/2 runs)
import json
W = json.load(open('src/words.json')); out = []
for w in W:
    if out and w['w'] in (',000', ',000.') and out[-1]['w'] == '20':
        out[-1] = {'w': '20,000', 's': out[-1]['s'], 'e': w['e']}; continue
    if w['w'] == "that's" and out and out[-1]['w'] == 'Nothing': w = {**w, 'w': 'that'}
    out.append(w)
json.dump(out, open('src/words.json', 'w'), indent=0); print(len(W), '->', len(out))

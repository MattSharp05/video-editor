# ASR fixes for black-hole-01 words.json (checked against the script and single-line transcripts):
#  "edge, you can't" -> "edge, it can't" (line 3 alone reads "it can't"); "-in" "-one" -> "in" "one" (hyphen artefacts)
import json
W = json.load(open('src/words.json')); out = []
for w in W:
    if w['w'] == 'you' and out and out[-1]['w'].startswith('edge') and len(out) < 60: w = {**w, 'w': 'it'}
    if w['w'].startswith('-'): w = {**w, 'w': w['w'][1:]}
    out.append(w)
json.dump(out, open('src/words.json', 'w'), indent=0); print(len(W), '->', len(out))

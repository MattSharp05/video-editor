# Fix the ASR's slips in film/src/words.json against vo/lines.json (the audio says the script's words).
import json, re
p = 'film/src/words.json'; W = json.load(open(p)); out = []; i = 0
while i < len(W):
    w = W[i]['w']
    if w.lower() == 'its': W[i]['w'] = "it's"
    if w.lower() == 'pie': W[i]['w'] = 'pi'
    if w.lower() == 'two' and i + 2 < len(W) and W[i + 1]['w'] == 'in' and W[i + 2]['w'].lower() == 'pi':
        out.append({'w': 'two-in-pi', 's': W[i]['s'], 'e': W[i + 2]['e']}); i += 3; continue
    if w == '64': W[i]['w'] = 'sixty-four'
    if w == '%': W[i]['w'] = 'percent.'
    if w == '20' and W[i + 1]['w'] == ',000': W[i]['w'] = 'Twenty'; W[i + 1]['w'] = 'thousand'
    out.append(W[i]); i += 1
json.dump(out, open(p, 'w'), indent=0)
script = [re.sub(r"[^a-z0-9'-]", '', x.lower()) for l in json.load(open('vo/lines.json')) for x in l.split()]
got = [re.sub(r"[^a-z0-9'-]", '', x['w'].lower()) for x in out]
bad = [(k, a, b) for k, (a, b) in enumerate(zip(script, got)) if a != b]
print(len(script), '=', len(got), 'mismatches:', bad[:10])

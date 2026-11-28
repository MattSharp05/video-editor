# Fix words.json against the kept script (ai-voiceover.md step 3): ASR wrote numbers as digits and US spellings.
# Splits "20" ",000" / "400" into the spoken words with the time shared out, and takes the script's spelling.
import json, re
W = json.load(open('src/words.json')); L = [l['text'] for l in json.load(open('../vo/lines.json'))]
script = ' '.join(L).split()
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
out, i = [], 0
SPLIT = {'20': ['twenty'], ',000': ['thousand'], '400': ['four', 'hundred']}
for w in W:
    toks = SPLIT.get(w['w'].strip().rstrip(',.'), None)
    if toks is None: toks = [w['w']]
    n = len(toks); d = (w['e'] - w['s']) / n
    for k, t in enumerate(toks):
        sw = script[i]
        if norm(t) != norm(sw) and norm(t).replace('or', 'our').replace('er', 're') != norm(sw) and norm(t) not in ('kilometers', 'meters', 'colors'):
            raise SystemExit(f'mismatch at word {i}: {t!r} vs script {sw!r}')
        out.append({'w': sw, 's': round(w['s'] + k * d, 3), 'e': round(w['s'] + (k + 1) * d, 3)}); i += 1
assert i == len(script), (i, len(script))
json.dump(out, open('src/words.json', 'w'), indent=0); print(len(out), 'words; end', out[-1]['e'])

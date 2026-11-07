# beats.json from the voiceover's word timings: the one source of timing for picture, captions and sound.
# usage: python3 beats.py  (from film/; reads src/words.json) -> src/beats.json {name: seconds}
import json, re, sys
W = json.load(open('src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
toks = [norm(w['w']) for w in W]
def at(phrase, after=0.0, end=False):
    p = [norm(x) for x in phrase.split()]
    for i in range(len(toks) - len(p) + 1):
        if W[i]['s'] >= after and toks[i:i + len(p)] == p:
            return round(W[i + len(p) - 1]['e'] if end else W[i]['s'], 3)
    sys.exit(f'not found: "{phrase}" after {after}s')
L = json.load(open('../vo/lines.json'))
B = {f'l{i}': at(' '.join(l.split()[:3])) for i, l in enumerate(L)}
B.update({
    'tv': at('giant TV'), 'actually': at('actually'), 'gaps': at('with gaps'),
    'pucks': at('hockey pucks'), 'million12': at('one point two'),
    'frame': at('steel frame'), 'apart': at('eight inches'), 'fortyeight': at('forty eight'),
    'onedot': at('one dot'), 'colors': at('millions of colors'),
    'computer': at('A computer'), 'manytimes': at('many times'),
    'upclose': at('Up close'), 'faraway': at('far away'), 'blend': at('blend them'),
    'eyeball': at('giant eyeball'), 'blink': at('blink'), 'whole': at('whole building'),
    'inside': at('Inside'), 'sharper': at('much sharper'), 'wraps': at('wraps over'),
    'so': at('So the Sphere'), 'rest': at('do the rest'), 'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.2, 3)
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

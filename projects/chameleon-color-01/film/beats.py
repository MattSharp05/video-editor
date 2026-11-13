# beats.json from the voiceover's word timings: the one source of timing for picture, captions and sound.
# usage: python3 beats.py   (from film/; reads src/words.json and ../vo/line_starts.json) -> src/beats.json
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


B = {f'l{i}': round(s, 3) for i, s in enumerate(json.load(open('../vo/line_starts.json')))}
rc = at('so crystals')
B.update({
    'hide': at('to hide'), 'talk': at('to talk'), 'bright': at('turns bright'), 'backoff': at('back off'), 'branch': at('my branch'),
    'dark': at('turns dark'), 'win': at('you win'), 'cold': at('cold chameleon'), 'sun': at('in the sun'),
    'how': at('so how'), 'strange': at('strange part'), 'nopaint': at('no green paint'), 'nopaint_end': at('paint in it', end=True),
    'outer': at('clear outer'), 'yellow': at('yellow layer'), 'crystals': at('tiny crystals'), 'rows': at('neat rows'),
    'calm': at('is calm'), 'close': at('close together'), 'blue': at('blue light'), 'through': at('shines up'),
    'green': at('make green'), 'excited': at('gets excited'), 'apart': at('spread apart'), 'glows': at('skin glows'),
    'orange': at('and orange'), 'turndark': at('to turn dark'), 'bottom': at('bottom layer'),
    'recap': rc, 'r_green': at('make green', after=rc), 'r_far': at('far apart', after=rc), 'r_orange': at('make orange', after=rc),
    'r_dark': at('dark color from', after=rc), 'next': at('next time'), 'closely': at('look closely'), 'talking': at('be talking'),
    'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.8, 3)
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

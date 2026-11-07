# beats.json from the voiceover's word timings: the one source of timing for picture, captions and sound.
# usage: python3 beats.py            (run from the film folder; reads src/words.json, optional ../vo/line_starts.json)
#   -> src/beats.json {name: seconds}. The film imports it; the sound script (mix.py / events.py) reads the same file.
# Edit B below: one entry per beat, named for what happens there. A phrase the new VO no longer says stops the
# script by name, so a re-recorded take re-times everything or tells you what moved.
import json, os, re, sys
W = json.load(open('src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
toks = [norm(w['w']) for w in W]


def at(phrase, after=0.0, end=False):
    """Start (or end) time of the first occurrence of `phrase` starting at or after `after` seconds."""
    p = [norm(x) for x in phrase.split()]
    for i in range(len(toks) - len(p) + 1):
        if W[i]['s'] >= after and toks[i:i + len(p)] == p:
            return round(W[i + len(p) - 1]['e'] if end else W[i]['s'], 3)
    sys.exit(f'not found: "{phrase}" after {after}s')


B = {}
if os.path.exists('../vo/line_starts.json'):   # generated VO (ai-voiceover.md): one beat per line start
    B.update({f'l{i}': round(s, 3) for i, s in enumerate(json.load(open('../vo/line_starts.json')))})
B.update({
    'myth': at('inside out'), 'actually': at('but actually'), 'outer': at('outer layer'), 'creeps': at('creeps inward'),
    'oven': at('inside the oven'), 'magnetron': at('magnetron'), 'invisible': at('invisible waves'),
    'bounce': at('bounce around'), 'metal': at('metal box'), 'door': at("the door's"), 'holes': at('tiny holes'),
    'keep': at('keep them in'), 'swings': at('swings back'), 'billions': at('billions'), 'second': at('every second'),
    'water': at('water in it'), 'molecules': at('tiny molecules'), 'plus': at('plus side'), 'minus': at('minus side'),
    'tugs': at('tugs them'), 'other': at('then the other'), 'wiggle': at('so they wiggle'), 'bump': at('bump into'),
    'heat': at('makes heat'), 'reach': at('only reach'), 'thick': at('thick food'), 'middle': at('the middle'),
    'wait': at('has to wait'), 'spots': at('some spots'), 'more': at('more waves'), 'why': at("that's why"), 'spins': at('plate spins'),
    'r_waves': at('so waves'), 'r_wiggle': at('wiggle the water'), 'r_bump': at('the bumping', after=at('so waves')),
    'r_heat': at('makes heat', after=at('so waves')), 'leftovers': at('your leftovers'), 'hot': at('get hot'), 'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.2, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

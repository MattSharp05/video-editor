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
    'tail': at('tail flips'), 'falls': at('falls'), 'actually': at('actually'), 'notail': at('no tail'),
    'inner': at('inner ear'), 'eyes': at('eyes tell'), 'up': at('is up'), 'air': at('air'), 'nothing': at('nothing to push'),
    'how': at('how can it turn'), 'turn_q': at('turn', after=at('how can')), 'bends': at('bends in'), 'middle': at('middle'),
    'each': at('each half'), 'different': at('different way'), 'tucks': at('tucks'), 'frontlegs': at('front legs in'),
    'alot': at('turns a lot'), 'backlegs': at('back legs stick'), 'stick': at('stick out'), 'barely': at('barely'),
    'swaps': at('swaps'), 'backin': at('back legs in'), 'frontout': at('front legs out'), 'catches': at('catches up'),
    'all': at('all happen'), 'half_s': at('half a second'), 'reaches': at('reaches'), 'down': at('down'), 'bendthem': at('bends them'),
    'softly': at('softly'), 'hurt': at('badly hurt'), 'never': at('never drop'), 'test': at('test this'),
    'r_bends': at('bends', after=43), 'r_tucks': at('tucks', after=43), 'r_twists': at('twists'), 'r_swaps': at('swaps', after=43),
    'r_lands': at('lands'), 'paws': at('four paws'), 'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.25, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

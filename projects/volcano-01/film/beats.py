# Volcano 01. beats.json from the voiceover's word timings: the one source of timing for picture, captions and sound.
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
    'ooze': at('volcano ooze'), 'blow': at('blow its top'), 'secret': at('the secret is gas'), 'hiding': at('hiding inside'),
    'magma': at('is called magma'), 'fizz': at('like the fizz'), 'squeeze': at('squeezes the gas'), 'rises': at('as magma rises'),
    'bubbles': at('makes bubbles'), 'depends': at('what happens next'), 'hawaii': at('in hawaii'), 'rise': at('bubbles rise'),
    'pop': at('and pop'), 'easily': at('gets out easily'), 'rivers': at('the lava pours'), 'silica': at('more silica'),
    'glass': at('glass is mostly'), 'sticky': at('thick and sticky'), 'peanut': at('peanut butter'), 'stuck': at('get stuck'),
    'push': at('push harder'), 'helens': at('that is what happened'), 'side': at('pushed the side'), 'quake': at('an earthquake'),
    'slid': at('slid away'), 'boom': at('with a boom'), 'shaken': at('opening a shaken'), 'ash': at('ash shot up'),
    'minutes': at('15 minutes'), 'gone': at('top of the mountain'), 'recap': at('so runny magma'), 'oozes': at('it oozes'),
    'traps': at('traps gas'), 'blowtop': at('blow its top', after=at('traps gas')), 'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.6, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

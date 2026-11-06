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
    'wind': at('wind'), 'biggest': at('biggest wave'), 'tide': at('the tide'), 'weaker': at('weaker'),
    'hardest': at('hardest'), 'middle': at('the middle'), 'least': at('the least'), 'bumps': at('two bumps'),
    'pointsmoon': at('points at the moon'), 'farside': at('far side left', after=at('two bumps')),
    'spins': at('spins through'), 'twohigh': at('two high tides'), 'sun': at('the sun pulls'), 'lineup': at('line up'),
    'bigger': at('even bigger'), 'open': at('open ocean'), 'meter': at('one meter'), 'canada': at('canada'),
    'fifteen': at('fifteen meters'), 'r_pulls': at('moon pulls', after=at('fifteen meters')),
    'r_stretch': at('ocean stretches'), 'r_spins': at('earth spins', after=at('ocean stretches')),
    'twice': at('and twice'), 'rolls': at('rolls in'), 'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.4, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

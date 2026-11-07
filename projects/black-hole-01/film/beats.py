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
    'spaghetti': at('become spaghetti'), 'scientists': at('scientists'), 'word': at('spaghettification'), 'you': at('pretend'),
    'star': at('giant star'), 'dies': at('dies'), 'crush': at('crushes'), 'tiny': at('tiny space'),
    'gravity': at('its gravity'), 'edge': at('crosses its edge'), 'cant': at("can't get back"), 'light': at('not even light'),
    'faster': at('faster than light'), 'nothing': at('nothing can'), 'black': at('looks black'),
    'glow': at('can glow'), 'drain': at('down a drain'), 'rubs': at('it rubs'), 'millions': at('millions'), 'shines': at('it shines'),
    'fall': at('now you fall'), 'feet': at('your feet are'), 'head': at('than your head'), 'harder': at('feet harder'), 'stretch': at('you stretch'),
    'friend': at('your friend watches'), 'slow': at('slow down'), 'stop': at('seem to stop'), 'red': at('turn red'), 'fade': at('fade away'),
    'watch': at('your own watch'), 'always': at('like always'), 'dontstop': at("don't stop"), 'fallin': at('fall right in'),
    'small': at('a small black'), 'before': at('before you'), 'giant': at('giant one'), 'piece': at('one piece'),
    'either': at('either way'), 'never': at('never come back'), 'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.8, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

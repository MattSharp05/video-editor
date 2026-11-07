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
if os.path.exists('../vo/line_starts.json'):   # one beat per line start
    B.update({f'l{i}': round(s, 3) for i, s in enumerate(json.load(open('../vo/line_starts.json')))})
B.update({
    'florence': at('florence'), 'leonardo': at('signed leonardo'), 'title': at('this is'), 'part': at('part three'),
    'alfredo': at('named alfredo'), 'money': at('huge pile'), 'pretends': at('pretends'), 'expert': at('museum expert'),
    'hotel': at('small hotel'), 'room': at('room twenty'), 'thin': at('thin man'), 'opens': at('opens a white'),
    'trunk': at('trunk'), 'lifts': at('lifts out'), 'underneath': at('underneath'), 'silk': at('red silk'),
    'mona': at('is the mona'), 'cracks': at('tiny cracks'), 'seal': at('a seal'), 'real': at('real one'),
    'police': at('the police arrest'), 'vincenzo': at("it's vincenzo"), 'why': at('why did'),
    'italy': at('belonged in italy'), 'stolen': at('stolen from'), 'nottrue': at("wasn't true"),
    'leo': at('leonardo da vinci'), 'france': at('to france'), 'king': at('french king'),
    'tour': at('before she goes'), 'showsoff': at('italy shows'), 'crowds': at('huge crowds'),
    'jan': at('january'), 'wall': at('back on her wall'), 'paris': at('in paris'),
    'twodays': at('two days'), 'hundred': at('hundred thousand'), 'jail': at('vincenzo spends'),
    'seven': at('seven months'), 'famous': at('more famous'), 'today': at('today'), 'millions': at('millions'),
    'year': at('every year'), 'stole': at('who stole'), 'smile2': at('famous smile'), 'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.3, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

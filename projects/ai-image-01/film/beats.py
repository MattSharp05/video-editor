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
    'glues': at('glues'), 'photos': at('real photos'), 'actually': at('actually'), 'static2': at('fuzzy static'),
    'type': at('you type'), 'pizza3': at('pizza'), 'then3': at('then you hit'), 'send': at('send'),
    'words4': at('words directly'), 'so4': at('so it turns'), 'numbers': at('into numbers'),
    'purestatic': at('pure static'), 'oldtv': at('old tv'), 'guesses': at('guesses'), 'noise6': at('just noise'), 'wipes': at('wipes'),
    'twenty': at('twenty'), 'eachtime': at('each time'), 'clearer': at('clearer'),
    'steer': at('steer'), 'blobs': at('the blobs'), 'dog8': at('dog', after=30), 'wave8': at('wave'), 'pizza8': at('pizza', after=30),
    'learn': at('how did'), 'billions': at('billions'), 'captions': at('with captions'), 'covered': at('covered'), 'clean': at('clean it up'),
    'r_numbers': at('become numbers'), 'r_static': at('static gets'), 'brandnew': at('brand new'), 'lands': at('lands'), 'phone': at('your phone'),
    'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.2, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

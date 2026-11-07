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
    'laser': at('a laser'), 'never': at('never end'), 'two': at('two lasers'), 'through': at('right through'), 'noclash': at('no clash'),
    'plasma': at('is plasma'), 'lightning': at('like lightning'), 'cutters': at('plasma cutters'), 'twenty': at('degrees') - 0.6,
    'sun': at('surface of the sun'), 'still': at('hold still'), 'sprays': at('sprays out'), 'burn': at('burn the hand'),
    'magnets': at('use magnets'), 'tube': at('thin tube'), 'books': at('old star wars books'), 'loops': at('loops at the tip'),
    'back': at('back into the hilt'), 'bend': at('its end', end=True), 'touch': at('two blades touch'), 'snap': at('snap and'),
    'burst': at('burst of plasma'), 'clash': at("that's the clash"), 'kyber': at('kyber crystal'), 'empire': at('the empire'),
    'deathstar': at('death'), 'gun': at('main gun'), 'notlaser': at('not a laser'), 'r_plasma': at("it's plasma", after=at('not a laser')),
    'r_magnets': at('held by magnets'), 'r_crystal': at('by a crystal'), 'battery': at('the battery'), 'nothing': at('nothing that small'),
    'yet': at('yet', end=True), 'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.6, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

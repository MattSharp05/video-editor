# beats.json from the voiceover's word timings: the one source of timing for picture, captions and sound.
# usage: python3 beats.py   (from the film folder; reads src/words.json and ../vo/line_starts.json) -> src/beats.json
# A phrase the VO no longer says stops the script by name.
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
B.update({
    'busy': at('almost as busy'), 'rem': at('called rem'), 'eyes': at('eyes dart'), 'muscles': at('most of your muscles'),
    'seeing': at('seeing parts'), 'fly': at('fly over'), 'feel': at('feelings part'), 'scary': at('scary'), 'exciting': at('exciting'),
    'front': at('front part'), 'quiet': at('very quiet'), 'normal': at('feels normal'), 'memory': at('memory parts'),
    'today': at('today'), 'older': at('older memories'), 'cells': at('tiny brain cells'), 'spark': at('spark'),
    'chem': at('sends chemicals'), 'gap': at('tiny gap'), 'r_stem': at('brainstem holds'), 'r_back': at('back makes'),
    'r_feel': at('feelings turn'), 'r_front': at('front stops'), 'alarm': at('alarm rings'), 'slips': at('slips away'), 'end': W[-1]['e'],
})
# where the camera passes from one world to the next (inside a glow)
B['into_room'] = round(B['l1'] - 0.15, 3)                       # through his lit window
B['into_brain'] = round(at('parts of it') - 0.1, 3)             # through the glow under his skin
B['into_dream'] = round(at('his town', end=True) - 0.2, 3)      # into the dream model
B['into_cell'] = round(at('talking', end=True), 3)              # into a streetlight
B['recap'] = B['l9']                                            # out of the cell, back to the whole brain
B['into_wake'] = round(B['alarm'] + 0.35, 3)                    # out of his head as the alarm rings
B['into_town'] = round(B['slips'] + 0.9, 3)                     # out through the window
B['total'] = round(B['end'] + 2.2, 3)
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in sorted(B.items(), key=lambda kv: kv[1]): print(f'{k:12s} {v:7.2f}')

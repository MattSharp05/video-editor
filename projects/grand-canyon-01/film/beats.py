# beats.json from the voiceover's word timings: every picture and sound event in the film keys off these.
import json, re
W = json.load(open('../vo/words.json')); starts = json.load(open('../vo/line_starts.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
toks = [norm(w['w']) for w in W]
def at(phrase, after=0.0, end=False):
    p = [norm(x) for x in phrase.split()]
    for i in range(len(toks) - len(p) + 1):
        if W[i]['s'] >= after and toks[i:i + len(p)] == p:
            return W[i + len(p) - 1]['e'] if end else W[i]['s']
    raise SystemExit(f'not found: {phrase} after {after}')
B = {f'l{i}': round(s, 2) for i, s in enumerate(starts)}
B.update({
  'billion': at('2 billion'), 'six': at('5 or 6'), 'mile': at('a mile'), 'grit': at('with grit'), 'scour': at('scour'),
  'drop1': at('steep drop'), 'before': at('long before'), 'pushed': at('pushed up'), 'sea': at('found its way'),
  'drop2': at('steep drop', after=at('found its way')), 'cut': at('cut straight down'), 'seabeds': at('seabeds'),
  'swamps': at('swamps'), 'desert': at('desert'), 'cliff': at('frozen into a cliff'), 'hard': at('hard layers'),
  'crumble': at('crumble'), 'staircase': at('staircase'), 'mostly': at('mostly cuts'), 'sidecanyons': at('side canyons'),
  'flash': at('flash floods'), 'rockfall': at('rockfall after'), 'eighteen': at('18 miles'), 'rose': at('land rose'),
  'fell': at('river fell'), 'ground': at('grit ground'), 'pulled': at('pulled the walls'), 'floods': at('floods still'),
  'fall': at('still fall', end=False), 'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.4, 2)
json.dump(B, open('src/beats.json', 'w'), indent=1); print(B)

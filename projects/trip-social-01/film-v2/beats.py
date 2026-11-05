# One source of truth for timing: beat times (seconds) derived from the VO's word timings.
# Film.tsx imports src/beats.json; the sound event list is built from the same file.
import json, re
W = json.load(open('src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
def at(phrase, end=False, nth=0):
    p = [norm(x) for x in phrase.split()]
    hits = [i for i in range(len(W) - len(p) + 1) if all(norm(W[i + j]['w']) == p[j] for j in range(len(p)))]
    i = hits[nth]
    return round(W[i + len(p) - 1]['e'] if end else W[i]['s'], 3)
B = {
  'l1': at("You've saved"), 'forty': at('40'), 'none': at('none'), 'l1_end': at('of them', end=True),
  'l2': at("So I'm building"), 'plan': at('actual plan'), 'l2_end': at('actual plan', end=True),
  'l3': at('Copy a TikTok'), 'open_trip': at('open Trip'), 'asks': at('it asks'), 'add_tiktok': at('add this TikTok'), 'l3_end': at('add this TikTok', end=True),
  'l4': at('It reads the caption'), 'pulls': at('pulls out'), 'names': at('it names'), 'l4_end': at('it names', end=True),
  'l5': at('Tap Smart Add'), 'smart_add': at('Smart Add'), 'picks': at('picks the day'), 'least': at('least extra travel'), 'l5_end': at('extra travel', end=True),
  'l6': at('Or plan your'), 'at_once': at('At once'), 'l6_end': at('At once', end=True),
  'l7': at('Your saves finally'), 'with_you': at('with you'), 'l7_end': at('with you', end=True),
  'l8': at('Would you use'), 'end': round(W[-1]['e'], 3),
}
B['total'] = round(B['end'] + 1.5, 3)
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:10s} {v:6.2f}')

# beats.json from the voiceover's word timings: the one source of timing for picture, captions and sound.
# usage: python3 beats.py   (from film/; reads src/words.json and ../vo/lines.json) -> src/beats.json {name: seconds}
import json, re, sys
W = json.load(open('src/words.json')); L = json.load(open('../vo/lines.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
toks = [norm(w['w']) for w in W]

def at(phrase, after=0.0, end=False):
    p = [norm(x) for x in phrase.split()]
    for i in range(len(toks) - len(p) + 1):
        if W[i]['s'] >= after and toks[i:i + len(p)] == p:
            return round(W[i + len(p) - 1]['e'] if end else W[i]['s'], 3)
    sys.exit(f'not found: "{phrase}" after {after}s')

B, k = {}, 0
for i, line in enumerate(L):            # line starts = first word of each script line
    B[f'l{i}'] = W[k]['s']; k += len(line.split())
    B[f'e{i}'] = W[k - 1]['e']
B.update({
 'waste': at('waste'), 'hard0': at('running hard'), 'fuel': at('fuel'), 'sugar': at('sugar'), 'energy': at('energy'),
 'easy': at('easy pace'), 'engines': at('tiny engines'), 'almost': at('almost all'),
 'runhard': at('when you run hard'), 'superfast': at('super fast'), 'cant': at("can't keep up"),
 'lactate': at('into lactate'), 'spills': at('spills'), 'blood': at('blood'),
 'heart': at('your heart'), 'brain': at('your brain'), 'muscles': at('other muscles'), 'again': at('burn it again'),
 'why': at('so why'), 'acid': at('acid and'), 'together': at('together'), 'slow': at('slow you down'),
 'fast': at('run fast enough'), 'piles': at('piles up'), 'pace': at('that pace'), 'threshold': at('lactate threshold'),
 'training': at('training'), 'pushes': at('pushes that line'), 'reason': at('one big reason'), 'grow': at('you grow more'),
 'trash': at("isn't trash"), 'fuel2': at("it's fuel", after=at('training')), 'fit': at('fit runners'), 'more': at('even more'),
 'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.2, 3)
json.dump(B, open('src/beats.json', 'w'), indent=1)
for kk, v in B.items(): print(f'{kk:10s} {v:7.2f}')

# beats.json from the voiceover's word timings: the one source of timing for picture, captions and sound.
# usage: python3 beats.py  (from film/; reads src/words.json and ../vo/line_starts.json or the stand-in)
import json, os, re, sys
W = json.load(open('src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
toks = [norm(w['w']) for w in W]


def at(phrase, after=0.0, end=False):
    p = [norm(x) for x in phrase.split()]
    for i in range(len(toks) - len(p) + 1):
        if W[i]['s'] >= after and toks[i:i + len(p)] == p:
            return round(W[i + len(p) - 1]['e'] if end else W[i]['s'], 3)
    sys.exit(f'not found: "{phrase}" after {after}s')


B = {}
LS = '../vo/line_starts.json' if os.path.exists('../vo/line_starts.json') else '../vo/line_starts_standin.json'
B.update({f'l{i}': round(s, 3) for i, s in enumerate(json.load(open(LS)))})
B.update({
    'recap': at('last time'), 'remains': at('human remains'), 'runaway': at('run away'),
    'title': at('this is'), 'part2': at('part two'), 'chase': at('the chase'),
    'descr': at('description'), 'papers': at('newspapers printed'), 'picture': at('his picture'),
    'shaved': at('shaved off'), 'mustache': at('big mustache'), 'glasses': at('his glasses'),
    'ethel': at('and ethel'), 'hair': at('her hair'), 'boy': at('as a boy'),
    'robinson': at('mr robinson'), 'son': at('his son'), 'bigship': at('big ship'), 'canada': at('to canada'),
    'captain': at("the ship's captain"), 'kendall': at('henry kendall'), 'watched': at('he watched'),
    'clothes': at("boy's clothes"), 'didntfit': at("didn't fit"), 'tenderly': at('tenderly'), 'hand': at("father's hand", end=True),
    'read': at('had read'), 'wondered': at('he wondered'), 'couldbe': at('could this be'),
    'wireless': at('had wireless'), 'air': at('through the air'), 'nowires': at('no wires'),
    'sent': at('sent a secret'), 'land': at('back to land'), 'onboard': at('on board'), 'helper': at('with a helper'),
    'dew': at('inspector dew got'), 'jumped': at('he jumped'), 'faster': at('faster ship'),
    'everywhere': at('newspapers everywhere'), 'noidea': at('no idea'), 'racing': at('was racing'), 'first': at('there first'),
    'fordays': at('for days'), 'raced': at('ships raced'),
    'morning': at('one morning'), 'river': at('big river'), 'smallboat': at('small boat'), 'meet': at('to meet'),
    'pilot': at('a man dressed'), 'climbed': at('climbed aboard'), 'but': at("but he wasn't"), 'really': at('really a pilot'),
    'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.25, 3)
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

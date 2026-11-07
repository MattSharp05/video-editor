# beats.json from the voiceover's word timings: the one source of timing for picture, captions and sound.
# usage: python3 beats.py   (from film/; reads src/words.json and ../vo/line_starts.json) -> src/beats.json
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


B = {f'l{i}': round(s, 3) for i, s in enumerate(json.load(open('../vo/line_starts.json')))}
B.update({
    'octo': at("it's an octopus"), 'colors': at('change its colors'), 'blink': at('as fast as a blink'),
    'skin': at('its skin is full'), 'millions': at('millions'), 'single': at('single color'),
    'yellow': at('yellow'), 'red': at('red or'), 'brown': at('brown'), 'muscles': at('tiny muscles'), 'open': at('wide open'),
    'letgo': at('let go'), 'dot': at('back to a dot'), 'nerves': at('nerves from the brain'), 'pull': at('when to pull'),
    'fast': at('so fast'), 'blue': at("can't make blue"), 'shiny': at('shiny cells'), 'bounce': at('bounce those'),
    'white': at('white cells'), 'around': at('the light around'), 'notenough': at('is not enough') - 0.3, 'bumpy': at('rocks are bumpy'),
    'bumps': at('little bumps'), 'rough': at('skin rough'), 'strange': at('strange part'), 'most': at('most scientists'),
    'match': at('how does it match'), 'nobody': at('nobody knows for sure'), 'clue': at('a clue'), 'dish': at('in a dish'),
    'noeyes': at('no eyes'), 'slow': at('it was slow'), 'helps': at('if it helps'),
    'recap': at("so that's"), 'r_bags': at('color bags'), 'r_shiny': at('shiny cells', after=at("so that's")),
    'r_white': at('white cells', after=at("so that's")), 'r_bumps': at('and bumps'), 'next': at('next time'), 'twice': at('look twice'),
    'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.8, 3)
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:10s} {v:7.2f}')

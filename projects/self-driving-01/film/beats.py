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
    'nobody': at('nobody driving'), 'see_you': at('see you?'),
    'y2004': at('In 2004'), 'desert': at('desert race'), 'this_year': at('This year'), 'half_million': at('half a million'),
    'no_wheel': at('nobody at the wheel'), 'first': at('First, the car'), 'roof': at('its roof'), 'fires': at('fires laser'),
    'times': at('times each'), 'bounce': at('bounce,'), 'building': at('building a'), 'street3d': at('the street.'),
    'radar': at('Radar tracks'), 'speed': at('speed, even'), 'rain': at('in rain'), 'cameras': at('Cameras pick'),
    'lights': at('traffic lights'), 'signs': at('and signs'), 'seeing': at('But seeing'), 'guesses': at('It guesses'),
    'people': at('people, bikes'), 'bikes': at('bikes and'), 'cars': at('cars around'), 'next': at('go next'),
    'plans': at('Then it plans'), 'path': at('path around'), 'again1': at('again and again'), 'again2': at('again as'),
    'sim': at('Waymo has practised'), 'billion': at('20 billion'), 'simulation': at('in simulation'),
    'tesla': at('Tesla bet'), 'cams_only': at('cameras only'), 'no_lidar': at('no lidar,'), 'one_net': at('one neural'),
    'turns': at('turns video'), 'driving': at('into driving'), 'buy': at('Teslas people'), 'watching': at('driver watching'),
    'robotaxis': at('some Tesla robotaxis'), 'texas': at('in Texas'), 'no_employee': at('no employee'),
    'cracked': at('So, is'), 'not_yet': at('Not yet'), 'cities': at('about 15'), 'a_car': at('a car with no'),
    'sees': at('sees you,'), 'guess2': at('guesses your'), 'drives': at('drives around'),
    'end': round(W[-1]['e'], 3),
})
B['total'] = round(B['end'] + 1.4, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

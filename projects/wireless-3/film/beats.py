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
LS = '../vo/line_starts.json' if os.path.exists('../vo/line_starts.json') else 'src/line_starts_standin.json'
B.update({f'l{i}': round(s, 3) for i, s in enumerate(json.load(open(LS)))})
B.update({
    'raced': at('raced across'), 'pilot0': at('dressed as a pilot'), 'climbed': at('climbed onto'),
    'title': at('this is caught'), 'part': at('part three'), 'verdict': at('the verdict'),
    'really': at('was really'), 'dew': at('inspector dew in'), 'disguise': at('in disguise'),
    'near': at('came near'), 'goodmorning': at('good morning'), 'crippen': at('doctor crippen'),
    'over': at('chase was over'), 'ethel': at('found ethel'), 'boy': at('as a boy'),
    'london': at('back in london'), 'didnt': at("didn't do it"), 'trial': at('big trial'), 'bailey': at('old bailey'),
    'scientist': at('a scientist'), 'drug': at('dangerous drug'), 'remains1': at('in the remains'),
    'bought': at('had bought'), 'winter': at('that winter'),
    'pajama': at('pajama shirt'), 'store': at('from a store'), 'shopped': at('doctor shopped'),
    'jury': at('the jury said'), 'guilty': at('guilty of murder'), 'death': at('put to death'), 'law': at('the law back'),
    'ethel2': at('ethel had'), 'notguilty': at('not guilty'), 'free': at('went free'),
    'first': at('one of the first'), 'wireless': at('wireless message'), 'catch': at('helped catch'),
    'twist': at('one last twist'),
    'y2007': at('in 2007'), 'sample': at('tiny sample'), 'match': at('did not match'), 'family': at("cora's family"),
    'experts': at('other experts'), 'wrong': at('may be wrong'), 'reopened': at('never been reopened'),
    'didhe': at('did the doctor'), 'yes': at('jury said yes'), 'argue': at('still argue'),
    'caught': at('he was caught'), 'captain': at('sharp-eyed captain'), 'message': at('a message sent'),
    'air': at('the air'),
    'end': round(W[-1]['e'], 3),
})
B['total'] = round(B['end'] + 1.3, 3)   # tail after the last word (end card holds >= 2 s from 0.8 s before the end)
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

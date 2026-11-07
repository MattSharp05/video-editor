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
    'think': at('think'), 'ml1': at('mona lisa'), 'before': at('before 1911'), 'superstar': at('no superstar'),
    'artlovers': at('art lovers'), 'stole': at('then someone'), 'stole_end': at('stole her', end=True),
    'title': at('this is the stolen'), 'partone': at('part one'), 'vanishing': at('the vanishing'),
    'paris': at('paris 1911'), 'giant': at('giant museum'), 'mondays': at('on mondays'), 'closed': at('closed'),
    'monday': at('one monday morning'), 'smock': at('white work smock'), 'halls': at('quiet halls'),
    'name': at('his name is'), 'knows': at('he knows this'), 'helped': at('he helped make'), 'glassbox': at('glass box'),
    'protects': at('that protects'),
    'room': at('he walks into'), 'hangs': at('she hangs'), 'hooks': at('four iron hooks'), 'hooks_end': at('iron hooks', end=True),
    'lifts': at('he lifts her'), 'nobody': at('nobody stops'),
    'carries': at('he carries her'), 'staircase': at('back staircase'), 'frame': at('heavy frame'), 'leaves': at('leaves them'),
    'board': at('now'), 'thin': at('thin wooden board'), 'wraps': at('he wraps'), 'clothes': at('work clothes'),
    'door': at('but the door'), 'locked': at('is locked'),
    'plumber': at('then a plumber'), 'worker': at('is a worker'), 'opens': at('opens the door'),
    'walksout': at('vincenzo walks out'), 'streets': at('streets of paris'), 'carrying': at('carrying the mona'),
    'nextday': at('the next day'), 'painter': at('a painter comes'), 'finds': at('he finds'), 'empty': at('four empty hooks'),
    'guards': at('at first'), 'photographers': at('photographers'), 'didnt': at("they didn't"),
    'gone': at('is gone'), 'noone': at('no one knows'), 'tookher': at('took her', after=78),
    'end': round(W[-1]['e'], 3),
})
B['total'] = round(B['end'] + 1.2, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

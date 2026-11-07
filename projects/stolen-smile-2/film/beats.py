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
LS = '../vo/line_starts.json' if os.path.exists('../vo/line_starts.json') else '../vo/line_starts_standin.json'
if os.path.exists(LS):
    B.update({f'l{i}': round(s, 3) for i, s in enumerate(json.load(open(LS)))})
B.update({
    'recap': at('last time'), 'walked': at('walked out'), 'louvre': at('louvre'),
    'title': at('this is'), 'part2': at('part two'), 'hunt': at('the hunt'),
    'closes': at('museum closes'), 'week': at('whole week'), 'search': at('search it'),
    'papers': at('newspapers'), 'world': at('all over the world'), 'suddenly': at('suddenly'), 'name': at('her name'),
    'sing': at('sing songs'), 'postcards': at('funny postcards'),
    'opens': at('opens again'), 'crowds': at('crowds line up'), 'empty': at('empty wall'),
    'kafka': at('franz kafka'), 'writer': at('famous writer'),
    'who': at('who did it'), 'arrest': at('arrest a'), 'poet': at('poet'), 'lock': at('lock him up'), 'days': at('few days'),
    'question': at('question a'), 'picasso': at('pablo picasso'),
    'neither': at('neither one'), 'letgo': at('let go'),
    'thumb': at('thumbprint'), 'never': at('never match'),
    'files': at('sorted their files'), 'measure': at('body measurements'), 'notfp': at('not fingerprints'),
    'knock': at('knock on'), 'look': at('look around'), 'leave': at('and leave'),
    'where': at('where is'), 'hidden': at('hidden'), 'same': at('same little room'),
    'days2': at('days turn'), 'months': at('months turn'), 'years': at('into years'),
    'fear': at('many people'), 'forever': at('forever'),
    'twoyears': at('two years later'), 'florence': at('florence'), 'letter': at('opens a letter'),
    'says': at('the writer says'), 'has': at('he has the'), 'signs': at('signs it'), 'leonardo': at('leonardo'),
    'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.6, 3)   # tail: the signature settles, then the end card
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

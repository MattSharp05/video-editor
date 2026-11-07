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
if os.path.exists('../vo/line_starts.json'):
    B.update({f'l{i}': round(s, 3) for i, s in enumerate(json.load(open('../vo/line_starts.json')))})
B.update({
    'lots': at('lots'), 'think': at('think'), 'block': at('block sound'), 'block_e': at('block sound', end=True),
    'actually': at('actually'), 'more': at('more sound'), 'upside': at('upside down'), 'copyof': at('copy of'),
    'sound3': at('sound is'), 'pushed': at('pushed'), 'pulled': at('pulled'), 'over': at('over and over'), 'wave3': at('like a wave'),
    'tiny': at('tiny'), 'mics': at('microphones'), 'listen4': at('listen to'), 'around': at('around you'),
    'chip5': at('little chip'), 'flipped5': at('flipped copy'), 'where': at('where the noise'), 'pulls5': at('copy pulls'),
    'speaker6': at('the speaker'), 'plays': at('plays that'), 'music6': at('your music'),
    'when7': at('when a push'), 'meets': at('meets'), 'cancel': at('cancel out'), 'most': at('most of'), 'disappears': at('disappears'), 'ear7': at('your ear'),
    'knows': at('knows'), 'playing': at('playing it'), 'only': at('only flips'), 'flips8': at('flips the noise'),
    'best': at('works best'), 'steady': at('steady'), 'engine': at('plane engine'), 'quick': at('quick'), 'voices': at('voices'), 'harder': at('harder'),
    'cushions': at('soft cushions'), 'blockthose': at('block those'),
    'so11': at('so your'), 'listen11': at('listen', after=40), 'flip11': at('flip the noise', after=40), 'fight': at('fight'), 'withsound': at('with sound'),
    'end': W[-1]['e'],
})
B['total'] = round(B['end'] + 1.2, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

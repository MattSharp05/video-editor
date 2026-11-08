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
if os.path.exists(LS):
    B.update({f'l{i}': round(s, 3) for i, s in enumerate(json.load(open(LS)))})
B.update({
    'y1910': at('in 1910'), 'vanished': at('vanished in london'), 'secret': at('then a secret'), 'ship': at('from a ship'),
    'catch': at('helped catch'), 'accused': at('the man accused'),
    'title': at('this is caught'), 'partone': at('part one'), 'singer': at('the missing singer'),
    'cora': at('cora crippen was'), 'hats': at('big hats'), 'friends': at('lots of friends'),
    'husband': at('her husband'), 'hawley': at('hawley crippen'), 'small': at('a small quiet'),
    'called': at('everyone called'), 'glasses': at('he wore glasses'), 'mustache': at('big mustache'),
    'winter': at('one winter night'), 'dinner': at('dinner and cards'), 'left': at('when they left'),
    'goodbye': at('said goodbye'), 'steps': at('front steps'), 'steps_end': at('front steps', end=True),
    'never': at('her friends never'), 'again': at('saw her again'),
    'soon': at('soon the doctor'), 'america': at('gone to america'),
    'sick': at('then he said'), 'died': at('and died'),
    'questions': at('but her friends'), 'where': at('where in america'), 'funeral': at('when was the'),
    'fuzzy': at('answers were fuzzy'), 'fuzzy_end': at('were fuzzy', end=True),
    'else': at('and there was'), 'typist': at("the doctor's typist"), 'ethel': at('ethel was'),
    'jewelry': at("cora's jewelry"),
    'police': at("so cora's friends"), 'yard': at('scotland yard'),
    'dew': at('chief inspector'), 'ask': at('came to ask'),
    'thistime': at('this time'), 'newstory': at('a new story'), 'ranaway': at('left him'),
    'showed': at('he even showed'), 'cellar1': at('down to the cellar'),
    'insleft': at('the inspector left'), 'cameback': at('when he came back'), 'gone': at('were gone'),
    'searched': at('so the police'), 'under': at('under the cellar'), 'remains': at('human remains'),
    'doctor': at('and the doctor'), 'vanished2': at('he had vanished'),
    'end': round(W[-1]['e'], 3),
})
B['total'] = round(B['end'] + 1.2, 3)   # tail after the last word
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')

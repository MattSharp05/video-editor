# Whisper writes American spelling: put the script's British words back (captions and cue() match the script).
import json
W = json.load(open('src/words.json'))
for w in W:
    if w['w'].lower().startswith('color'): w['w'] = w['w'].replace('color', 'colour').replace('Color', 'Colour')
json.dump(W, open('src/words.json', 'w'), indent=0)
print([w['w'] for w in W if 'olour' in w['w']])

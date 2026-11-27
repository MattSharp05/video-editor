# Whisper writes spoken numbers as digits: put the script's words back (captions and cue() match the script).
import json
W = json.load(open('src/words.json'))
for w in W:
    core = w['w'].strip('.,?!'); tail = w['w'][len(core):] if w['w'].startswith(core) else ''
    if core in ('20', '25'): w['w'] = {'20': 'twenty', '25': 'twenty-five'}[core] + tail
json.dump(W, open('src/words.json', 'w'), indent=0)
print([w['w'] for w in W if 'twenty' in w['w']])

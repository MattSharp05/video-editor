# The ASR heard every word (151 = 151) but wrote numbers as digits; put the script's words back, keep its timings.
import json
want = [w for l in json.load(open('lines.json')) for w in l.split()]
ws = json.load(open('../film/src/words.json')); assert len(ws) == len(want)
for w, s in zip(ws, want): w['w'] = s
json.dump(ws, open('../film/src/words.json', 'w'), indent=0); print('fixed', len(ws))

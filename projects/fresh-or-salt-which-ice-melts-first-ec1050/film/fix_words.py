# Whisper joins "fresh water" / "salt water" into one word: split them back into two timed words (time shared by
# letters), as the script and captions have them. Run after align.py.
import json, re
W = json.load(open('src/words.json')); out = []
for w in W:
    m = re.match(r'^(fresh|salt)(water)([^a-z]*)$', w['w'], re.I)
    if m:
        k = len(m.group(1)) / (len(m.group(1)) + 5); mid = round(w['s'] + (w['e'] - w['s']) * k, 3)
        out += [{'w': m.group(1), 's': w['s'], 'e': mid}, {'w': m.group(2) + m.group(3), 's': mid, 'e': w['e']}]
    else: out.append(w)
json.dump(out, open('src/words.json', 'w'), indent=0)
print(len(out), ' '.join(x['w'] for x in out))

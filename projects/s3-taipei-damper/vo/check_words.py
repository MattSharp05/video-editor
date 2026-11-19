# Compare the aligned transcript (film/src/words.json) with the script lines word for word; list differences.
import json, re, difflib
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
want = [norm(w) for l in json.load(open('caption_lines.json')) for w in l.split()]
got = [norm(w['w']) for w in json.load(open('../film/src/words.json'))]
for op, a, b, c, d in difflib.SequenceMatcher(None, want, got).get_opcodes():
    if op != 'equal': print(op, 'script:', want[a:b], 'heard:', got[c:d], 'at word', c)
print(len(want), 'script words,', len(got), 'heard')

# Stand-in word timings (2.8 words/s, gaps.json between lines) until vo/words.json exists. usage: python3 standin.py
import json
L = json.load(open('../vo/lines.json')); G = json.load(open('../vo/gaps.json'))
t, W, S = 0.25, [], []
for i, line in enumerate(L):
    if i: t += G[i]
    S.append(round(t, 3))
    for w in line.split():
        d = 1 / 2.8; W.append({'w': w, 's': round(t, 3), 'e': round(t + d * 0.9, 3)}); t += d
json.dump(W, open('src/words.json', 'w'), indent=0); json.dump(S, open('src/line_starts_standin.json', 'w'))
print(len(W), 'words, end', W[-1]['e'])

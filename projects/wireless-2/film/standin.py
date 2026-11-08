# Stand-in word timings (2.8 words/s, gaps from vo/gaps.json) until the AI VO is aligned. Writes src/words.json
# and ../vo/line_starts_standin.json. Labelled stand-in; replaced by vo/words.json.
import json
L = json.load(open('../vo/lines.json')); G = json.load(open('../vo/gaps.json'))
t, W, S = 0.25, [], []
for i, line in enumerate(L):
    t += G[i]; S.append(round(t, 3))
    for w in line.split():
        d = 1 / 3.1 + (0.1 if w[-1] in ',.?!:' else 0)
        W.append({'w': w, 's': round(t, 3), 'e': round(t + 1 / 2.8 - 0.04, 3)}); t += d
json.dump(W, open('src/words.json', 'w'), indent=0)
print(len(W), 'words, last end', W[-1]['e'])
json.dump(S, open('../vo/line_starts_standin.json', 'w'))

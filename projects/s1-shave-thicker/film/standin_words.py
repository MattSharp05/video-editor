# Stand-in words.json (no VO yet): lines follow each other at 2.8 words/s. Replace with align.py output once the VO exists.
import json, re
LINES = json.load(open("../vo/lines.json"))
out = []; t = 0.15
for line in LINES:
    for w in line.split():
        d = 0.33
        out.append({"w": w, "s": round(t, 3), "e": round(t + d * 0.85, 3)})
        t += d + (0.18 if re.search(r"[.,]$", w) else 0)
    t += 0.3
json.dump(out, open("src/words.json", "w"), indent=0)
json.dump([0.0] * 1600, open("src/vo_env.json", "w"))
print(len(out), "words, last ends", out[-1]["e"])

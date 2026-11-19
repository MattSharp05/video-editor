# Stand-in words.json (no VO yet): lines in order at 2.8 words/s with pauses. Replace with align.py output once the VO exists.
import json, re, sys
LINES = json.load(open('../vo/lines.json'))
GAP = [0, 0.45, 0.35, 1.5, 0.4, 0.4, 0.5, 0.4, 0.55, 0.4, 0.45, 0.45]
out, t = [], 0.3
for i, line in enumerate(LINES):
    t += GAP[i] if i < len(GAP) else 0.4
    for w in line.split():
        d = 0.33
        out.append({"w": w, "s": round(t, 3), "e": round(t + d * 0.85, 3)})
        t += d + (0.18 if re.search(r"[.,:?]$", w) else 0)
    print(f"{out[-len(line.split())]['s']:5.2f}..{out[-1]['e']:5.2f}  {line[:50]}")
json.dump(out, open("src/words.json", "w"), indent=0)
json.dump([0.0] * 1500, open("src/vo_env.json", "w"))
print(len(out), "words, last ends", out[-1]["e"])

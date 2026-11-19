# Stand-in words.json (no VO yet) from ../vo/caption_lines.json at ~2.84 words/s with pauses between lines.
# Replace with align.py output once the voiceover exists.
import json, re
out, t = [], 0.3
for line in json.load(open("../vo/caption_lines.json")):
    for w in line.split():
        d = 0.31
        out.append({"w": w, "s": round(t, 3), "e": round(t + d * 0.85, 3)})
        t += d + (0.15 if re.search(r"[.,]$", w) else 0)
    t += 0.4
json.dump(out, open("src/words.json", "w"), indent=0)
json.dump([0.0] * 1500, open("src/vo_env.json", "w"))
print(len(out), "words, last ends", out[-1]["e"])

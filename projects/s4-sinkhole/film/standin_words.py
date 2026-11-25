# Stand-in words.json (no VO yet): each script line starts at its beat time, words spaced at 2.8 words/s.
# Replace with align.py output once the voiceover exists.
import json, re
LINES = [
 (0, "This road looks solid. But underneath, it's hollow."),
 (0, "It starts with rain. Rain soaks up carbon dioxide from the air and soil, and turns into a weak acid."),
 (0, "Under the dirt, that acid eats into limestone, a little every year, and opens up cracks and holes."),
 (0, "The sticky clay above can hold up like an arch, even with empty space underneath."),
 (0, "But bit by bit, its ceiling crumbles down into the cracks, and the empty space climbs upward."),
 (0, "Up top, nothing looks wrong."),
 (0, "Until the roof gets too thin to hold the weight. Then it drops all at once."),
 (0, "That's why sinkholes seem to open overnight. The hole was growing for months, or years."),
]
out = []
t = 0.15
for _, line in LINES:  # lines follow each other; 2.8 words/s already includes ordinary pauses
    for w in line.split():
        d = 0.33
        out.append({"w": w, "s": round(t, 3), "e": round(t + d * 0.85, 3)})
        t += d + (0.18 if re.search(r"[.,]$", w) else 0)
    print(f"{_:5.1f} -> {out[-len(line.split())]['s']:5.2f}..{out[-1]['e']:5.2f}  {line[:40]}")
    t += 0.3
json.dump(out, open("src/words.json", "w"), indent=0)
json.dump([0.0] * 1500, open("src/vo_env.json", "w"))
print(len(out), "words, last ends", out[-1]["e"])

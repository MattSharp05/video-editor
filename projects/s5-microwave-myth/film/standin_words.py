# Stand-in words.json (no VO yet): each script line starts at its beat time, words spaced at 2.8 words/s.
# Replace with align.py output once the voiceover exists.
import json, re
LINES = [
 (0, "A lot of people think a microwave cooks food from the inside out."),
 (0, "Watch what really happens."),
 (0, "Microwaves mostly heat the outer inch or so of thick food."),
 (0, "They make the water molecules there twist back and forth, billions of times a second, and that layer gets hot."),
 (0, "The middle gets much less. It mostly warms as heat creeps in from the outside."),
 (0, "That's why leftovers can be scalding at the edges and still cold in the middle."),
 (0, "So let it stand a few minutes, and the heat finishes the job."),
]
out = []
t = 0.15
for _, line in LINES:
    t += _  # lines follow each other; 2.8 words/s already includes ordinary pauses
    for w in line.split():
        d = 0.33
        out.append({"w": w, "s": round(t, 3), "e": round(t + d * 0.85, 3)})
        t += d + (0.18 if re.search(r"[.,]$", w) else 0)
    print(f"{_:5.1f} -> {out[-len(line.split())]['s']:5.2f}..{out[-1]['e']:5.2f}  {line[:40]}")
    t += 0.3
json.dump(out, open("src/words.json", "w"), indent=0)
json.dump([0.0] * 1300, open("src/vo_env.json", "w"))
print(len(out), "words, last ends", out[-1]["e"])

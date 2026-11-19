# Stand-in words.json (no VO yet): each script line starts at its beat time, words spaced at 2.8 words/s.
# Replace with align.py output once the voiceover exists.
import json, re
LINES = [
 (0, "Drop a basketball with a tennis ball on top. How high does the tennis ball fly?"),
 (0, "Back to your hand? Twice as high? Pause and guess."),
 (1.0, "Over the rim!"),
 (0, "Here's why. The basketball squashes into the ground and springs back up, with the tennis ball still falling onto it."),
 (0, "So the tennis ball is launched off a ball that's rushing up underneath it."),
 (0, "With perfect bouncy balls, it could leave almost three times as fast as it fell."),
 (0, "And three times the speed means nine times the height."),
 (0, "Real balls lose some bounce, so it's more like three or four times. Still over the rim."),
 (0, "Try it outside."),
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

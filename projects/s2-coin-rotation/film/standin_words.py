# Stand-in words.json (no VO yet): each script line starts at its beat time, words spaced at 2.8 words/s.
# Replace with align.py output once the voiceover exists.
import json, re
LINES = [
 (0.0, "Most people think turbulence shakes the whole plane the same."),
 (3.6, "But watch these three cups. Front. Middle. Back."),
 (6.8, "Same bump. The back cup spills. The middle one moves least."),
 (10.7, "That's because a plane doesn't just bounce. It rocks, like a seesaw."),
 (15.0, "And the middle of that seesaw is near the wings."),
 (18.6, "That's where the plane's weight is balanced, so that's where it pivots."),
 (22.9, "The farther your seat is from that point, the more it moves."),
 (27.2, "So the back rows feel it most. The seats over the wing feel it least."),
 (32.6, "Book a seat over the wing, and keep your seatbelt on."),
 (36.5, "Most passengers seriously hurt by turbulence weren't wearing one."),
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
json.dump([0.0] * 1300, open("src/vo_env.json", "w"))
print(len(out), "words, last ends", out[-1]["e"])

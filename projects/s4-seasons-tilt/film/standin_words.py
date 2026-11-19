# Stand-in words.json (no VO yet): each script line starts at its beat time, words spaced at 2.8 words/s.
# Replace with align.py output once the voiceover exists.
import json, re
LINES = [
 (0, "Lots of people think it's summer when Earth is closest to the Sun."),
 (0, "But we're closest in early January, in winter up north."),
 (0, "The real reason is Earth's tilt."),
 (0, "In June, the north leans toward the Sun."),
 (0, "Follow one beam of sunlight."),
 (0, "In summer, it hits almost straight down. All its heat lands on one small patch."),
 (0, "In winter, the Sun sits low. The same beam hits at a slant and spreads over about twice the ground."),
 (0, "So every patch gets about half the heat."),
 (0, "That's why it's summer in New York while it's winter in Sydney."),
 (0, "It's not how close the Sun is. It's mostly how straight its light hits."),
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

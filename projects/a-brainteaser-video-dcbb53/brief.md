# One cut, six sides (brief)

Status: idea step (Broadcast Content Factory, video dcbb53d1, attempt 1, 2026-11-25). Waiting for Matthew's approval
on Broadcast before the script step.

## Facts
- Idea from Broadcast: "a brainteaser video". Style pack: `realistic-3d`. No account yet, no avatar.
- Format: Instagram Reel 1080x1920, 30 fps, about 30-40 s, captions on, hook card at frame 0. Goal: reach (shares and
  comments: viewers argue over their guess).
- Voice: `r3-m07` (calm British documentary man, 40s), cloned for every line from its reference clip
  (`lab/voice-picker/library/say.py`). Credit: "Voice: AI (Qwen3-TTS)".
- Music: "Lightless Dawn" by Kevin MacLeod (incompetech.com), CC BY 4.0, baked in and ducked under the voice. Credit
  line goes in the caption exactly as written.
- Script at a 3rd-grade reading level (short sentences, plain words).

## Idea
**One straight cut through a cube can leave a perfect hexagon.** Ask "one straight cut through a cube: what shape is
the cut face?", let the viewer pause and guess (most say square, maybe triangle), then show a wire slicing a cube of
butter on a slant and the halves sliding apart to reveal a six-sided face.

- Audience: anyone who scrolls past puzzles; no maths needed. They have held a sugar cube or a block of cheese.
- Hook (curiosity format Matthew likes): "Most people think a cube can only be cut into squares and triangles. But
  one straight cut makes a perfect hexagon."
- Proof on screen: the cut, in slow motion, then the face lit and its six edges traced one by one with a count 1-6.
  Why it works: a cube has six faces and a flat cut crosses each face at most once, so six sides is the most it can
  have. Tilt the blade so it is square-on to the line from one corner to the opposite corner, through the centre,
  and it passes the middle of six edges: every side is equal.
- Payoff: the viewer can try it with a sugar cube or a block of cheese (call to action: "Try it on cheese").

## Decisions
- 2026-11-25 topic: the cube-slice hexagon. Not a repeat: session 2 made coin rotation, Monty Hall and Buffon's
  matches; the coin brief listed "slicing a cube into a hexagon" as an unused alternative. A 3D reveal suits the
  realistic-3d style (a real material being cut).
- Alternatives kept for later: cutting a Möbius strip down the middle (one loop, not two), the birthday paradox
  (23 people, past 50 %), lily pads doubling (half covered the day before full).

## Claims to verify (script step)
- A plane section of a cube can be a triangle, square, rectangle, trapezoid, pentagon or hexagon; never more than
  six sides (one side per face crossed).
- The section through the centre perpendicular to a space diagonal is a regular hexagon through six edge midpoints.

## Guidance read
- `.claude/skills/broadcast-factory/SKILL.md` (from main), `.claude/skills/video-script/SKILL.md` (Ideas),
  `profiles/video-script` profile; earlier brain-teaser briefs (s2-coin-rotation, s2-monty-hall, s2-buffon-matches).

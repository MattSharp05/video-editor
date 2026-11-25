# One cut, six sides (brief)

Status: render step (2026-11-25), board approved in Broadcast. The film is `film/src/Film.tsx` (`film` composition):
the board's shots set in motion, timed from `src/beats.json` (VO words); voice `vo/` (r3-m07, 11 lines cloned);
sound `film/sound/mix.py`.

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

## Claims to verify (script step: both checked, see script.md)
- A plane section of a cube can be a triangle, square, rectangle, trapezoid, pentagon or hexagon; never more than
  six sides (one side per face crossed).
- The section through the centre perpendicular to a space diagonal is a regular hexagon through six edge midpoints.

## Look (style step, 2026-11-25)
- A 5 cm butter cube (rounded 2.8 mm edges) on an oak board, dark kitchen behind, window light from the left.
  Cut through the centre square-on to the corner-to-corner line (`film/src/butter.ts`: exact section of the rounded
  cube, so the face is the true regular hexagon). Top half lifts up the cut plane; bottom half shows the face.
- Accent `#35d4ff` (cyan) = the hexagon and its count; nothing else in frame is cyan. Type: Hanken Grotesk 800,
  hook card "One cut. / Six sides?" at the top over the dark backdrop.
- Known CGI tells to fix in visuals: butter rind reads smooth/plastic (needs knife marks, softer subsurface look),
  cut-face lighter band inside the cyan line from the glow tube; board grain is plain.

## Board (visuals step, 2026-11-25)
- Scene ids = script lines: s1 l1 … s11 l11. Colour roles: cyan = the hexagon and its count; white = the
  corner-to-corner guide (corner glows, line drawn through the butter); magenta `#ff4fb0` = the cube's faces (s9-s10).
- s1 square cut: front half tipped onto its back so its square face looks up; wire lies on the board in the cut.
- s6 knife: chef's knife in the cut plane, edge at the centre; right-angle mark at the centre is small (enlarge in render).
- s10: the lit face's one hexagon side is small at phone size; consider a closer push-in when animating.
- The script's l3 said amber for the count; the film uses the style frame's cyan accent instead.
- Still open from style: butter rind reads smooth/plastic; board grain plain.

## Guidance read
- `.claude/skills/broadcast-factory/SKILL.md` (from main), `.claude/skills/video-script/SKILL.md` (Ideas),
  script step: `video-script/SKILL.md` (Script + checklist), `references/explainers.md`, `check_script.py`,
  `projects/moon-tides-01/readability.py`, s2-coin-rotation `script.md` (format);
  `profiles/video-script` profile; earlier brain-teaser briefs (s2-coin-rotation, s2-monty-hall, s2-buffon-matches).
- style step (2026-11-25): `animated-video/SKILL.md`, `styles/README.md`, `styles/realistic-3d/README.md`,
  `references/look-pass.md`; template `remotion-film` (three-canvas, finish, frame.mjs), realism kit `noise.ts`.
- visuals step (2026-11-25): `broadcast-factory/SKILL.md` (factory branch), `animated-video/SKILL.md`,
  `references/remotion-pipeline.md`, `templates/parts/README.md`, `references/three.md`, `styles/realistic-3d/README.md`,
  `references/look-pass.md`, `references/review.md` (stills before renders), `references/direct.md`.
  Not run (board only, no motion yet): brainstorm/picker agents (the script's picture column is the concept), sourcing.
- render step (2026-11-25): `broadcast-factory/SKILL.md` (main), `animated-video/SKILL.md`, `references/ai-voiceover.md`,
  `references/remotion-pipeline.md`, `real-sfx/references/studio-sound.md`, `references/three.md`,
  `templates/parts/README.md`, `references/review.md`; `library/music/README.md`, turbulence-seat-01 `sound/mix.py` (pattern).
  Sourcing skipped: every object (butter, cheese, wire, knife, board) was already built and approved on the board.

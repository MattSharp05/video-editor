# s5 ball stack (brief)

Status: script v0.1, building the board. 3D explainer series, session 5 of 5 (everyday physics: kitchen, home, sport),
video 1 of 2: the **brain teaser**. Unsupervised (Matthew 2026-11-19): every approval below is a fresh judge agent.

## Facts
- Topic (chosen 2026-11-19): drop a basketball with a tennis ball resting on top; the tennis ball flies several times
  higher than it was dropped from. Pose it, "pause and guess", reveal it as an event (it flies way over the rim).
  Why this topic: a stranger can try it tonight, the answer is surprising and quantitative, and it is a falling,
  bouncing, flying event (3D). Not used by any other project or session area (sport = session 5).
- Goal: reach. Instagram Reel 1080x1920, 30 fps, target 36-42 s, captions on, hook in the first 2 s.
- Voice: AI m5 (`library/voices/m5/`, cloned from `ref_m5.wav`). Music: Floating Cities (Kevin MacLeod, CC BY 4.0),
  ducked 10-12 dB under the voice. SFX: CC0 `sfx-29`-`sfx-61` (`library/sfx/cstack-cc0`) or synthesized.
- Physics (research 2026-11-19, sources below): ideal limit (perfectly elastic, bottom ball much heavier, separate
  collisions) the top ball leaves at 3v and rises 9x the drop height; with a mass ratio of ~10 even lossless gives
  ~2.65v (~7x). Measured: Cross 2007 (small 150 g ball) 2.4x; Howard CC ~3x; Bristol 2015 press release "three to
  four times higher". The balls stay in contact (Berdeni, Champneys, Szalai 2015, 20,000 fps): the basketball is
  still squashed on the floor as it springs back into the tennis ball; the two-collision story is a simplification.
  Masses: basketball 567-650 g (size 7), tennis ball 56-59.4 g. Rim 3.05 m.
- Film numbers: basketball bottom released at 1.10 m (the drop height d); tennis ball sits on top (centre 1.37 m);
  it leaves the basketball at 0.27 m. Real reveal: rises 3.5 d = 3.85 m to a 4.1 m peak (clears the 3.05 m rim by
  ~1 m). Ideal: 9 d = 9.9 m (peak 10.2 m).

## Decisions (logged; Matthew not asked)
- 2026-11-19 Picture brainstorm by a fresh agent (`notes/brainstorm.md`), picks by a second fresh agent. Picker chose
  one gym world, a height tower of glowing rungs, strobe ghosts, a tennis-ball POV cam with arrows, a 1x1 -> 3x3 tile
  squaring that stacks nine high, and crumbling tiles for the loss. **Changed by me:** the world is an outdoor school
  court at golden hour beside a tall brick wall, not a gym: the realism kit sky lights it (proven on turbulence), a
  10 m ideal tower needs open sky, and "Try it outside" lands where we already are.
- Real reveal shows ~3.5x (inside the measured 3-4x), never 9x; 9x is drawn only as the "perfect bounce" ghost tower.
- No hand on screen (real-time hands read as CGI): the stack hangs at the release line; the line is labelled
  "your hand".

## Assets (scouted 2026-11-19; all files in `film/public/`, out of git, rebuild: `film/models-prep/README.md`)
| Asset | Source | Licence | Notes |
|---|---|---|---|
| "Basketball Classic Standard Ball" by HQ3DMOD | sketchfab.com/3d-models/39d0e28487d2426bb9c24010dcfc4808 | CC BY 4.0 | 15k tris; spec-gloss material converted to metal-rough (gltf-transform) |
| "Tennis Ball" by Tentrox | sketchfab.com/3d-models/edc344dcc65440ea97b5eae84f1957a4 | CC BY 4.0 | 1.5k tris |
| "Basketball Hoop Panel" by Nimrod Assaf | sketchfab.com/3d-models/a30a5de53a6748c39cbd2923946b5993 | CC BY 4.0 | 6k tris, weathered outdoor hoop |
| Brick 4, Asphalt 01 (textures) | Poly Haven | CC0 | 2k |
| Built in code | sky (realism kit), court lines, wall, height tower, arrows, tiles, ghosts, dust | ours | |
Rejected: "Realistic Tennis Ball" by 4M CgiWorks (Sketchfab Standard licence, not CC); the gym and street-court
models (we built the outdoor set from textures instead).

## Guidance read
- 2026-11-19 step 1 (pictures, concept, script): video-script SKILL.md, references/picture-first.md,
  references/explainers.md, ~/.video-script/profile.md; animated-video SKILL.md, references/direct.md,
  references/motion-principles.md, ~/.animated-video/profile.md.
- 2026-11-19 step 2 (look): styles/README.md, styles/realistic-3d/README.md, references/look-pass.md.
- 2026-11-19 steps 4-5 (scout, build): references/sourcing.md, references/three.md, references/remotion-pipeline.md,
  templates/parts/README.md, templates/parts/src/kit/motion/README.md.

## Sources
- Cross, "Vertical bounce of two vertically aligned balls", Am. J. Phys. 75, 1009 (2007):
  https://www.physics.usyd.edu.au/~cross/PUBLICATIONS/38.%202BallBounce.pdf
- University of Bristol, 2015 (Berdeni, Champneys, Szalai, Proc. R. Soc. A):
  https://www.bristol.ac.uk/news/2015/july/two-ball-bounce-problem.html
- Howard CC: https://pressbooks.howardcc.edu/jrip3/chapter/up-and-away-rebound-height-and-energy-changes-in-a-system-of-collisions/
- ITF ball tests; FIBA ball weights; rim 3.05 m (FIBA/NBA).

## Lessons for the skills
(filled in as they happen)

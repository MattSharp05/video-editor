# s5 ball stack (brief)

Status: board v1 judged (approve with fixes, fixed); v1 rendering. 3D explainer series, session 5 of 5 (everyday physics: kitchen, home, sport),
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

- 2026-11-19 Fact check (fresh agent, Cross 2007, Bristol 2015, Harter 1971): reworded "hits the ground and springs
  back up, while the tennis ball is still coming down" -> "squashes into the ground and springs back up, with the tennis
  ball still falling onto it" (the balls stay in contact; no gap in the picture); "gets hit by a ball that's already
  rushing up" -> "is launched off a ball that's rushing up underneath it"; "up to three times as fast" -> "could leave
  almost three times as fast" (3v needs an infinitely heavy bottom ball; ~2.65v at 10:1); "Way over the rim" -> "Over
  the rim" (at 2.7x the peak clears the rim by only ~0.2 m); "three to four" -> "three or four"; one height reference:
  multiples of the 1.10 m drop, stacked from the 0.27 m launch point (the tower base and the guess bars follow it).
- 2026-11-19 Board v1 judge (fresh agent, stand-in for Matthew): **approve with fixes**. Fixed: the reveal camera now
  tracks the ball and pushes in to it at the peak (halo doubled, ~60 px with glow), windows moved off the flight path,
  the "?" is a third target the ball pops; strobe ghosts drift sideways like a strobe photo (fewer, 45 % opacity);
  sun 0.075 -> 0.11 and exposure 0.62 -> 0.78; hook re-framed low with the rim in frame (camera solved with
  `frame.mjs`); chase-cam arrows shortened and the orange arrow put on the basketball; "rushing up" no longer lime in
  the caption (lime = the tennis ball); tower centred near the ball path, wide enough to keep its top out of the
  caption band, caption scrim 0.65 -> 0.75; the guesses come back beside the real tower ("your guess: 1x", "2x").
  Not changed: the light is still more late-afternoon than deep golden hour (Preetham sky at 12 deg); the ≈3x label
  matches "almost three times" (the judge asked for "up to", which the fact check ruled out).
- Music gap measured on stems: 10.4 dB at +12 dB, mix uses +11.5 dB (~10.9 dB under the voice in speech).
- Motion check (motion_check.py against an accepted film): skipped, no accepted 3D film render on this machine
  (turbulence's renders are out of git). The flicker scan, the cut stills and the mute test cover it.

## Checks on v1 (2026-11-19)
- Render: `render_chunks.sh v1`, 1,171 frames, ~1.1 s/frame at concurrency 4 (25 min).
- Flicker scan (YAVG per frame): one step only, at the 11.48 s cut (the reveal -> the replay). No one-frame bounces.
- Cut stills either side of the three cuts (11.48, 18.54, 22.72 s): clean pictures, states switch on the cut frame.
- Mute test (fresh judge, frames at 2 fps, caption band blacked out): main point recovered ("in theory ~3x the speed
  and so 9x the height, in practice about 3-4x the drop height"); most shareable: the 3x3 = 9 beat, the 9x tower over
  the hoop, the guesses vs the real tower. Fixed: the answer flashed by at the peak -> "3-4x higher!" label at the
  peak; the replay read as dead air -> "basketball squashes" / "tennis ball still falling" labels; the chase cam ->
  "falling" / "rushing up"; unexplained coral sparkles -> "lost: heat, sound, wobble"; labels clipped at the top or
  right -> moved and clamped inside x 1010; low contrast -> a dark pill behind every 3D label; guess labels 36 -> 44 px.
  Not changed: the tile flight scatter (29-29.5 s, under a second), the ending without a closing message (the caption
  carries "Try it outside").
- Fix render: `partial.sh` frames 115-1100 into v2.

## Guidance read
- 2026-11-19 step 1 (pictures, concept, script): video-script SKILL.md, references/picture-first.md,
  references/explainers.md, ~/.video-script/profile.md; animated-video SKILL.md, references/direct.md,
  references/motion-principles.md, ~/.animated-video/profile.md.
- 2026-11-19 step 2 (look): styles/README.md, styles/realistic-3d/README.md, references/look-pass.md.
- 2026-11-19 steps 4-5 (scout, build): references/sourcing.md, references/three.md, references/remotion-pipeline.md,
  templates/parts/README.md, templates/parts/src/kit/motion/README.md.
- 2026-11-19 step 3 (audio): references/ai-voiceover.md, real-sfx/references/studio-sound.md, ~/.video-edit/profile.md,
  library/voices/m5/README.md, library/music/README.md.
- 2026-11-19 step 6 (before the render): references/review.md.

## Sources
- Cross, "Vertical bounce of two vertically aligned balls", Am. J. Phys. 75, 1009 (2007):
  https://www.physics.usyd.edu.au/~cross/PUBLICATIONS/38.%202BallBounce.pdf
- University of Bristol, 2015 (Berdeni, Champneys, Szalai, Proc. R. Soc. A):
  https://www.bristol.ac.uk/news/2015/july/two-ball-bounce-problem.html
- Howard CC: https://pressbooks.howardcc.edu/jrip3/chapter/up-and-away-rebound-height-and-energy-changes-in-a-system-of-collisions/
- ITF ball tests; FIBA ball weights; rim 3.05 m (FIBA/NBA).

## Lessons for the skills
(filled in as they happen)

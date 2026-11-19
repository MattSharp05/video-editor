# s4 ISS gravity (brief)

Status: script v0.1, fact-check running. 3D explainer series, session 4 (Earth, space and nature), video 3: a
**brain teaser**, asked for by Matthew through the coordinating session (2026-11-19: "make one more video"; pose a
puzzle in the 3D world, "pause and guess", a visual reveal that is an event). Unsupervised: every decision is logged
here; approvals go to fresh judge agents.

## Facts
- Format: Instagram Reel 1080×1920, 30 fps, 30–45 s, captions on, hook in 2 s. Goal: reach (shares, arguments).
- Voice m5 (cloned from `ref_m5.wav`, never redesigned). Music: Floating Cities, ducked 10–12 dB under the voice
  (measured). SFX: CC0 `sfx-29`–`sfx-61` (`library/sfx/cstack-cc0`) or synthesized only.
- Delivery: -14 LUFS, true peak < -1.5 dBTP, < 50 MB, measured on the MP4. Caption: no voice credit line; the
  Instagram AI label note stays.
- Free assets only (CC BY / CC0), credited; model files gitignored with a rebuild README; no paid generation.

## Decisions
- 2026-11-19 topic, from a fresh brainstorm agent's 12 candidates (its top pick): **how much gravity is on the Space
  Station? About 90 %**; the crew floats because everything up there is falling together. Chosen over all Earth's
  water in one ball and the raindrop shape: the most argued-about, the reveal is an event (step off a 400 km tower and
  fall), and it needs no caveat beyond "about". The gravity tunnel through Earth was dropped: its 42-minute answer holds
  only for a uniform Earth (38 min real; Klotz 2015).
- Not a repeat: moon-tides-01 is about tides; s4-seasons-tilt about the tilt.
- Pictures: brainstorm and picker in fresh agents (direct.md). Picker's set: a bathroom scale as the question and the
  answer (0.0 floating, ~90 % on the tower top, 0.0 again falling with the crew); the tower that becomes Newton's
  mountain (cannon shots from its top; the last one orbits and becomes the station's path); bookend wide shots.
  Dropped: elevator with a cut cable, Newton under the apple, contestants, tug of war (each a new world unearned).
- Analogy check (direct.md step 2): the draft has no analogy beyond Newton's cannon, which is the real mechanism; the
  tower is a thought experiment, checked by the fact-check. (The brainstorm ran before this check: no effect here.)
- Hooks: three from different formulas (`hooks.txt`, `check_script.py`): Cold Open Demo chosen ("Watch this astronaut
  float. How much gravity is up here?", 1.4 s, no flags).

## Assets (scouted 2026-11-19, `find_asset.py`, test-rendered with `render_glb.mjs`)
- Station: "ISS" by uperesito (sketchfab.com/3d-models/813f5b296e584c26bf386ca39de6c3d4), CC BY 4.0, 32k triangles,
  2.6 MB, static. Chosen over a 19.7 MB copy of the same mesh and Peter Stephan's 38k (failed to frame: tiny parts).
- Astronaut: "Animated Floating Astronaut in Space Suit Loop" by LasquetiSpice
  (sketchfab.com/3d-models/e2c4b146e58141e4b87917456a9970b1), CC BY 4.0, 58k triangles, a 7 s float loop (controllable:
  animated). Chosen over its 34 s version (same mesh) and Antropik's untextured one.
- Earth: globe kit (NASA Blue Marble / Black Marble, public domain; NASA credit).
- Built in code: tower, platform, scale, pen, paths, cannon trails, labels.

## Guidance read
- 2026-11-19, step 1 (re-read after merging main): video-script SKILL.md (hooks.json + check_script.py are new),
  references/picture-first.md; animated-video SKILL.md, references/direct.md, references/motion-principles.md;
  references/sourcing.md (scout); s2-monty-hall/brief.md (the series' other brain teaser: its lessons).
- 2026-11-19, step 2: styles/README.md, references/look-pass.md (re-read); styles/realistic-3d/README.md read in full
  earlier this session for s4-seasons-tilt and s4-sinkhole.

## Outstanding corrections
- none yet

## Lessons for the skills
- (to fill)

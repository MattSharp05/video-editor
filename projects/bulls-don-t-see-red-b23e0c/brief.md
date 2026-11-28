# Bulls don't see red (brief)

Broadcast routine video (routine "First routine test", slot 8, post_at 2026-11-28 09:50 UTC, approval: review),
video b23e0cfb-738d-49c4-ac39-09e5e8425cf4, made in one unsupervised session (STEP=all, broadcast-factory section 8).

## Goal and format
- Account @storytime_scroll. Genre: myth-buster. Goal: reach. Instagram Reel 1080x1920, 30 fps, aim 25-35 s.
- Idea: Myth: bulls charge because the cape is red. Fact: cattle are red-green colourblind (two kinds of colour
  cones, we have three), so red looks dull to them; the bull charges at the cape's movement, and tests show it
  charges a moving cape of any colour.
- Hook (planner, flat denial): "Bulls don't hate red. They can't even see it."
- Planner note: split view, human colours vs bull vision of the cape.
- Audience: curious scrollers, kids to adults. The surprise: the famous red is wasted on the bull.
- Style: realistic-3d (three.js in Remotion). Hero assets: off (routine, nobody to approve).
- Voice: r3-m07, British documentary (Broadcast library, say.py). Credit: "Voice: AI (Qwen3-TTS)".
- Music: "Stay the Course" by Kevin MacLeod (incompetech.com), CC BY 4.0, baked in and ducked under the voice.
- Routine rules (Matthew): "Read all the skills before starting." References: four Instagram reels (animations,
  style, colours, graphics, transitions).
- Reading level: about grade 3 (profile). No bullfight violence: a ranch arena, capes on stands and rails, no matador.

## Facts (to fact-check)
- Cattle are dichromats: two cone types (short-wave ~450 nm, long/middle-wave ~555 nm); humans have three. They
  can't tell red from green; long-wave red looks dull/dark to them (Jacobs, Deegan & Neitz 1998, Vis. Neurosci.).
- Tests (MythBusters "Red Rag to a Bull", 2007): the bull charged red, blue and white flags alike; with people in
  the ring it went for the one moving, not the one in red standing still. Muleta motion draws the charge.

## Guidance read
- 2026-11-28, intake: broadcast-factory SKILL.md (origin/main), CLAUDE.md, ~/.animated-video/profile.md,
  ~/.video-script/profile.md, animated-video SKILL.md, styles/realistic-3d/README.md. Precedents:
  factory/the-shrimp-that-punches-water-into-bubbl-f80e40 and factory/lightning-strikes-twice-c38a9c (same routine,
  style, voice, music): film scaffold copied from the shrimp film.
- 2026-11-28, script: video-script SKILL.md, references/explainers.md, hooks.json (rules), check_script.py.
- 2026-11-28, steps 1-6: animated-video references/direct.md, motion-principles.md, look-pass.md, three.md,
  ai-voiceover.md, remotion-pipeline.md, sourcing.md (find_asset.py, render_glb.mjs), review.md.
- Skipped, with reason: characters.md (stand-in mannequins only, no hands in close-up), water/compositing/assembly
  (none), hero-assets (off for routines), avatar-cutins (no avatar), handoffs.md (no revision yet).

## Decisions (unsupervised; logged)
- Pictures: one fresh agent, brainstorm then pick (time). Taken: the bull-vision filter as the film's device (the
  planner's split view, a line with YOUR EYES / BULL EYES), a colour-test dot plate on the sand, a cone-cell field
  split 3 vs 2. Not taken: the moving "gaze cone" (a fixed split reads more clearly muted), three bulls racing.
- Bull vision: Vienot et al. 1999 deuteranope matrix in linear RGB on the right of the split (cattle cones ~455 and
  ~555 nm sit close to a human deuteranope). The plate's red and green dots are chosen with equal long-wave signal, so
  the red shape vanishes in bull vision (an isoluminant test plate).
- Bull: Sketchfab "Black Bull" by Znvne179 (CC BY 4.0, 31k tris, rigged, no animations,
  https://sketchfab.com/3d-models/6cab97514b0d404395c7aaad99e25bd1). Gallop, pawing, head and tail driven from its bones
  in Scene.tsx (axes measured from the bind pose). Model file not committed (find_asset.py "bull" --get 12).
- People: mannequin stand-ins (MythBusters test, labelled illustration). No bullfight violence: capes on stands,
  flags on posts, a swinging cape on a machine arm.
- Colour language: RED = red things (the myth); GOLD (accent) = movement (motion trails, MOTION, CHARGE); white line
  = the split.
- Sound: mix.py (CC0 cstack library + synthesized crowd bed, hoof scrapes and sand burst, labelled), Stay the Course
  ducked: voice stem -9.8 LUFS, music -22.1 (12.3 dB under), mix -14.3 LUFS, true peak -2.0 dBFS. Measured, not heard.

## Checks before the render (2026-11-28)
- Script: check_script.py flags kept: slot timings (timing from the VO); hooks "nothing checkable" (the bull and cape
  are on screen). VO: say.py r3-m07, 9 lines, 36.4 s; Whisper transcript matches the script word for word (color ->
  colour put back).
- Stills: four rounds. Fixed: hook cape off frame then hiding the bull, cell field not drawn (shader) and its divide
  off the split, back-lit cape (sun moved behind the camera), flags and end framings, cowboys out of frame.
- Mute test, stills pass (fresh judge, 1 still/s, captions off): recovered 3 vs 2 cells, red = green on the plate, bull
  vision dulls red, charges all three flags, chases the mover not the still red man, not red but motion. Fixed: the
  cape shot's split ran too far left (now stops mid-cape), the charge beat had no card (SO WHY CHARGE?), olive side
  labels on olive (dark pills). Not changed: the plate's shape is not named (its point read), the machine-arm cape
  reads as "on a wire".
- Gallop: 18 consecutive frames read as a gallop (legs cycle, tail lags).
- Quarter-scale preview + motion_check: skipped (3D cost does not fall with --scale on this CPU, per the shrimp film);
  motion readout runs on the full cut.

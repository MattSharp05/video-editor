# Why the sky is blue (brief)

Broadcast routine video (routine "First routine test", slot 1, post_at 2026-11-27 00:10 UTC, approval: review),
video 417d62ca-d100-4d29-bb30-24a39e4b1176, made in one unsupervised session (STEP=all, broadcast-factory section 8).

## Goal and format
- Account @storytime_scroll. Genre: explainer. Goal: reach. Instagram Reel 1080x1920, 30 fps, aim 25-40 s.
- Idea: sunlight holds every colour; air molecules scatter short blue wavelengths far more than red (Rayleigh,
  about 1/wavelength^4), so blue reaches the eye from every direction of the sky. At sunset the light crosses much
  more air, the blue is scattered away first, and the reds and oranges are what is left.
- Hook (planner, question style): "Sunlight is every color. So why does the sky choose blue?"
- Planner note: show white sunlight splitting over a photoreal Earth limb, then a sunset pass.
- Style: realistic-3d (three.js in Remotion). Hero assets: off (routine, nobody to approve).
- Voice: r3-m07, British documentary (Broadcast library, cloned from `lab/voice-picker/library/r3-m07.flac`).
  Credit: "Voice: AI (Qwen3-TTS)".
- Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0, baked in and ducked under the voice.
- Routine rules (Matthew): "Read all the skills before starting." References: four Instagram reels (animations,
  style, colours, graphics, transitions).
- Reading level: about grade 3 (profile).

## Guidance read
- 2026-11-26, intake: broadcast-factory SKILL.md (main), CLAUDE.md, ~/.animated-video/profile.md,
  ~/.video-script/profile.md; animated-video SKILL.md, styles/README.md; references/ai-voiceover.md,
  references/direct.md, references/motion-principles.md; video-script SKILL.md, references/explainers.md.

- 2026-11-26, steps 2-6: styles/realistic-3d/README.md, references/look-pass.md, references/remotion-pipeline.md,
  templates/parts/README.md, references/three.md, references/review.md, real-sfx/references/studio-sound.md (first
  section), globe kit header (src/kit/globe.tsx), realism kit sky.ts.
- Skipped, with reason: references/sourcing.md (no found models: Earth from the globe kit, everything else built in
  code), characters/water/compositing/assembly (none in the film), hero-assets (off for routines).

## Decisions (unsupervised; logged)
- Pictures: fresh brainstorm + picker agent (one agent with two passes, to save time against the 00:10 UTC slot;
  direct.md asks for two). Picks: the sunbeam as a braid of coloured photons in every world; blue (accent) always =
  scattered light; red/orange = light that kept going straight. Worlds: space limb, macro air, ground sky.
- Device numbers: simulation per-molecule odds ~ (470/lambda)^4 (blue 470 nm, red 700 nm -> 4.9x); the counter on
  screen is the same seeded simulation that draws the ricochets.
- Style frame and boards judged by me against the mute test (routine: no human approvals); the routine approves
  checkpoints automatically.
- Sound: mix.py (CC0 cstack library + synthesized noise beds), Floating Cities ducked under the voice; mix measured
  -14.4 LUFS, peak -2.0 dBFS. Not listened to (measured only).

## Checks before the render (2026-11-26)
- Stills: four rounds (out/s1..s6). Fixed: the air shell painted an orange stripe across the planet's face (shader
  now discards sight lines that hit the planet); midday sky blown out (sun was in frame; moved behind the camera,
  exposure 0.085); ground streaks stacked on the sun (they now fan out toward the viewer); noon tag off frame.
- Mute test, stills pass (fresh judge, 1 still/s, captions off): recovered "sunlight made of colours", "blue
  knocked off course", "blue scatters about five times more than red", "at sunset light travels a long path and
  loses its blue", "leftover light is red and orange". Missed/confusing: 5-12 s no visible bounce (hit flash and
  ricochets enlarged, camera closer, odds raised); sky shot uncarded (added "blue from every direction"); end card
  low contrast (white with blue word); sunset card clipped at the caption band (moved below the limb); globe
  cropped at the end (camera pulled back further). Not changed: hard cuts between scales (allowed, on the words);
  grain (Finish default).
- Fact check (fresh agent): no spoken line wrong; ratio fixed by moving blue to 470 nm; "air drawn thicker than
  real" note added in the space shots.
- Motion check (quarter-scale preview + motion_check.py): skipped for time; the full cut is checked instead.

## Checks on the render (2026-11-26)
- v1: 1,204 frames in 20 min (conc 3, ~1 s/frame), 37.8 MB, -14.5 LUFS, true peak -1.8 dBTP. Flicker scan: luma
  steps only at the five cuts (4.20, 21.00, 24.57, 32.10, 34.70 s).
- Mute test on the cut (fresh judge, caption band blacked out): recovered every claim (colours in sunlight, molecules,
  blue scatters more, blue from every direction, long sunset path strips the blue, red and orange left). Fixed in v2:
  the counter contradicted "about 5x" (251/76 = 3.3x: blue saturated along 22 molecules) -> stratified scattering
  (share scattered = 0.16 x (470/lambda)^4 per colour), tally shown from "five times", now 4.5-4.8x; dim counter ->
  dark pill, light-blue/white text; "air drawn thicker than real" tiny and over the beam -> sunset shot only, 38 px,
  below the noon tag; dusk bottom 40 % black -> camera pitched up 23 deg; dusk had no card -> "only red + orange
  arrive". Not changed: the noon glint reads as a "fuzzy blob" (it is the sub-solar glint); hard cuts between scales.
- Cover: the judge's pick, the sunset pass where blue sprays off the grazing beam (~31.5 s).

## Delivered (2026-11-26 22:15 UTC)
- v2 posted to Broadcast as the render checkpoint (git 75054b6): 1,204 frames, 40.13 s, 36.7 MB, -14.5 LUFS, true
  peak -1.8 dBTP; cover at 31.0 s; caption in `caption.md`; review passed with three minor notes. Waits on the
  routine's review approval; nothing queued or posted by this session.
- v2 counter checks: 45/12, 100/21, 146/32 (4.6x) against "about 5x".

## Outstanding corrections
- none

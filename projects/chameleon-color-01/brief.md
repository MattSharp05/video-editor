# Chameleon color 01 (brief)

Status (2026-11-13): option A picked (Matthew: "Go with A and yes same music and voice"). Script v1 fact-checked; VO
(design-m2 clone, 67.0 s), timeline, sound mix v1 and key-frame board v1 (`stills/board-v1.png`) done; waiting for
board approval before the full render (~2 h).

## Request (Matthew, 2026-11-12)
"A video explaining how chameleons change color. Make it engaging, colorful and fun. Must be at a 3rd grade reading
level. Give me 3 script options summarized. Give me some sample frames first."

## Corrections
- 2026-11-12: "no i want you to look at the octopus video. the 3D graphics we had. please use this video as a
  reference as it was our best performing video." → v1 (flat 2D cartoon frames) dropped. v2 is 3D (three.js in
  Remotion), built on the Octopus 01 kit, with its caption and card style and its structure. (Verified in the sample
  frames; still to verify in an export.)

## Facts
- Reference: `projects/octopus-01/` on branch `claude/octopus-camouflage-video` (reef, skin macro world, cards).
- Options: `script-options.md` (A myth-buster, B watch it change, C no green inside; recommended B).
- Film source: `film/` (scaffold copied from Octopus 01: `src/kit/`, fonts, config). New: `src/chameleon.tsx` (original
  model: lofted body/head with casque and crest, spiral tail, legs with two toe bundles, turret eyes; skin shader with
  calm / hot / dark palettes and granular scales), `src/forest.tsx` (mossy branch, broad leaves, bokeh canopy, haze),
  `src/skinworld.tsx` (yellow layer, crystal lattice with spread 0..1, dark layer, light beams as waves),
  `src/Sample.tsx` (the six sample shots). Render: `cd film && node samples.mjs` (~7 s a frame at half size).
- Voice: design-m2 cloned from `vo/ref_design-m2_hook.wav` (copy of Grand Canyon 01's); 14 lines, 67.0 s, 178 words;
  faster-whisper transcript matches word for word (one homophone fixed: "It's" -> "Its").
- Music: Floating Cities (`music/`, git-ignored mp3). Mix v1 (`film/sound/mix.py`, 21 cues, 3.1 per 10 s): -14.1 LUFS,
  -2.0 dBTP; music 10.9 dB under speech, +6.6 dB in pauses (measured from stems). Effects CC0 or synthesized only.
- Board v1 fixes: face-off reframed; exit beams shortened into frame + glow; crystal tint blue -> pale -> orange (no
  pink); darker, thicker dark cells + rising pigment veil; recap camera held below the yellow layer.

## Outstanding corrections
- Use Octopus 01 (3D) as the reference for look and structure (above).

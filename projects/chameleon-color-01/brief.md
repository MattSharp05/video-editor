# Chameleon color 01 (brief)

Status (2026-11-13): v1 delivered (`film/out/chameleon-color-01_final.mp4`, git-ignored; sent in the session). Matthew
picked option A ("Go with A and yes same music and voice") and approved the board ("Run full render").

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

## Render (2026-11-13)
- Chunked render (`film/render_chunks.sh`, 7 x 300 frames, 4 cores, SwiftShader): 03:14-04:42, ~88 min, ~2.6 s/frame
  (forest ~2.2-3.3 s, skin ~2 s). Every chunk checked as a 1 fps strip while the next rendered; no fixes needed.
- Final: 1080x1920, 30 fps, 2025 frames, 67.5 s, H.264 CRF 21, 96 MB. Audio -14.2 LUFS, -2.3 dBTP measured on the
  MP4 (the first mux hit -0.3 dBTP after AAC; an oversampled -2.5 dB limiter before encoding fixed it, now in the script).
- Measured, not listened to: loudness, peaks, music 10.9 dB under speech. To listen for: effect softness (crystal glint
  ~0:30, sunbeam ~0:33), the music swell in the pauses.

## v2 (2026-11-13)
- Matthew on v1: "at the start it is too stagnant, I want to be visually engaged maybe the camera needs to move around a
  focal point". Fix: from frame 0 the camera orbits the hero's eye (az 62 -> ~0 deg at a steady rate) while pulling
  back to reveal the branch, handing over to the face-off framing; both eyes dart independently until the rival comes;
  every leaf sways (wind in the leaf shader, all forest shots). Re-rendered the four forest chunks (~43 min); skin
  chunks kept. Delivered `film/out/chameleon-color-01_v2.mp4`: 67.5 s, 2025 frames, -14.2 LUFS, -2.3 dBTP.

## Outstanding corrections
- Use Octopus 01 (3D) as the reference for look and structure (above).

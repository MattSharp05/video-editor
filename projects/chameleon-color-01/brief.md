# Chameleon color 01 (brief)

Status: 3 script options (v2) + 6 3D sample frames for Matthew to pick (2026-11-12). Nothing scripted in full yet.

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
- Open: voice (Octopus used design-m2, assumed), runtime (~70 s assumed).

## Outstanding corrections
- Use Octopus 01 (3D) as the reference for look and structure (above).

# The look pass (three.js, software or GPU rendering)

Ten upgrades that took Grand Canyon 01 from "decent CGI" to a recognisable real place, ranked by visual gain per
render cost. Source research: `lab/3d-skills-research.md` (skills borrowed from, with licences). Code:
[terrain kit](../templates/parts/src/kit/terrain/README.md). Before/after frames: `projects/grand-canyon-01/compare/`.

Measure first: time 40 frames of a typical shot before and after (`npx remotion render --frames=A-B`), subtract
~20 s start-up, divide. Add a switch per upgrade (`--props='{"off":["env"]}'`) so each one's cost is measured, not guessed.

| # | Upgrade | Fixes | Cost measured (CPU, SwiftShader) |
|---|---|---|---|
| 1 | Real imagery on real terrain (public-domain where possible) | "clay" look, invented colour | small (one 4096 texture) |
| 2 | Shadow, ambient occlusion and fine normals baked once from the elevation data | flat walls, no depth | ~none per frame |
| 3 | ACES tone mapping once, exposure per shot (underwater, close, wide) | washed-out or flat contrast | ~none |
| 4 | Sky dome whose horizon = fog colour; height fog thicker low, warmer toward the sun | weak depth and air | low |
| 5 | Close-range rock detail in the shader (3D value-noise grain + derivative bump), faded by distance; per-pixel pattern for hero rocks | blobby close-ups, stair-stepped vertex colours | ~0.2 s/frame |
| 6 | Water: flowing bump along a `flow` attribute, depth tint across the channel, sky reflection (environment on the water only); caustics on the bed | flat ribbon, dead underwater | low |
| 7 | Stones: lumpy flattened icosahedrons seated into the ground, contact-shadow blobs, roll with travel | floating balls | low |
| 8 | One fitted shadow map only in close shots (frustum = 0.85 x camera distance) | close-ups without shadows | medium, only while on |
| 9 | Vignette + 4 cycled grain plates (CSS overlay); glow = additive halo mesh, not bloom | finish | ~none |
| 10 | Camera through keys with a monotone cubic (PCHIP): no stop at each key, no overshoot; big zooms aim early | mechanical moves, dives through ground | none |

Lessons with numbers:
- Environment (PMREM) lighting on every surface cost ~0.8 s/frame in software rendering; put it on the water (or hero
  objects) only and light the rest with a sky-coloured hemisphere light. The frames looked the same.
- Whole look pass: 0.85 -> 1.8 s/frame on the CPU (36 -> ~70 min for 77 s). A GPU machine removes most of this.
- Don't use SSAO/N8AO/GTAO with a logarithmic depth buffer (broken depth reconstruction, and expensive in software);
  bake AO instead. No temporal effects: every frame renders independently.
- Fog/sky colours are output-space when injected after tone mapping (as three's own fog is): author them as sRGB.
- Headless Chrome in the cloud container has WebGL2 only (no `navigator.gpu`); WebGPU-only skills (TSL, GTAO node)
  can't render there.
- Water: match the real water of the place and era before shading it (Grand Canyon flood scenes are red-brown and
  murky; clear green is today's dam river). Techniques, costs and licences: `lab/water-research.md`.

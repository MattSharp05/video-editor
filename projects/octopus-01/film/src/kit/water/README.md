# Water kit

Reusable water for three.js films in Remotion: rivers (flowing current, banks, rapids), oceans (Gerstner swell, beach,
whitecaps, glint), waterfalls (falling sheet, plunge pool, mist), underwater (absorption fog, caustics, silt, light
shafts, the surface from below) and flood fronts. WebGL2, renders without a GPU (SwiftShader), every frame
deterministic from `t`. Units: metres. Test bench and measured costs: `lab/water/` (one shot per piece); choose the
water first with [water](../../../../references/water.md).

| File | What it is |
|---|---|
| `presets.ts` | `PRESETS`: clearGreen, muddyFlood, glacialBlue, tropical, deepOcean, stormSea (colours, RGB extinction per metre, foam, roughness, reflectivity, caustics, silt). Start from the real place and era |
| `glsl.ts` | Shared shader code: value noise, fbm, two-phase flow (`wflow`, Valve 2010), `BUMP` (fragment only: bump from a height via screen derivatives), `AA` (fade detail before it aliases) |
| `river.ts` | `riverGeometry(path, width)` (attributes `flow` = metres along / 0..1 across, `slope`), `riverMaterial(preset, uTime, {width, speed, depth, rapids, envMap})`: flowing ripples faster mid-channel and on steep reaches, depth colour across the channel, bank foam, rapids as a V of standing waves that lift the surface and stay put |
| `ocean.ts` | `oceanGeometry(size, res)`, `oceanMaterial(preset, uTime, {waves, height, beach, envMap, sunDir})`: summed Gerstner waves with analytic normals, shoaling toward a beach plane, crest light, whitecaps, breaking lines, swash, sun glint |
| `waterfall.ts` | `waterfallGeometry(lip, dir, width, height)` (ballistic sheet), `waterfallMaterial(preset, uTime, height)`: streaks at the local fall speed, aerating to white, ragged edges |
| `underwater.ts` | `withUnderwater(material, U, key)` patches any standard material (caustics on upward faces, RGB absorption fog); `siltPoints/siltMaterial`; `shaftMaterial`; `surfaceFromBelowMaterial` (Snell's window) |
| `flood.ts` | `floodGeometry(path, width, front, height)`, `floodMaterial(...)`: a muddy front filling a channel, deepening behind a bulging snout, glossy, foaming at the front and banks |
| `env.ts` | `skyDome(colors)`, `skyEnvironment(gl, colors)` (PMREM for reflections), presets SKY_DAY, SKY_LOW_SUN, SKY_FRONT |
| `components.tsx` | `<River>`, `<Ocean>`, `<Waterfall>` (sheet + pool + mist), `<UnderwaterSet>`, `<FloodFront>`: each takes `t` and a preset |

Setup: `npm i three @react-three/fiber @remotion/three`; copy this folder to `src/kit/water/`. Pass `envMap` from
`skyEnvironment()` to water materials only (environment light on every surface costs ~0.8 s/frame in software).
The stone geometry used in the bench comes from the terrain kit's `look.ts` (`stoneGeometry`).

Licences: original code; techniques from Valve's "Water Flow in Portal 2" (SIGGRAPH 2010), GPU Gems ch. 1 (Gerstner
waves), Pope & Fry 1997 (absorption). No Shadertoy code (default CC BY-NC-SA). Research: `lab/water-research.md`.

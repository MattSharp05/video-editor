# Water rendering research (2026-11-06)

Question (Matthew): find a better way to render water. Two agents: river surface techniques; underwater, flash flood
and what the Colorado actually looks like. Costs are estimates for software WebGL2 (SwiftShader, 1080x1920) unless
marked measured; all techniques deterministic (time as a uniform, seeded randomness, no accumulated simulation).

## What the real river looks like (sources: USGS, NPS)
- Since Glen Canyon Dam (1963) the river is clear, cold and green below the dam; turbidity at Lees Ferry fell ~2000x.
  In Grand Canyon it is usually clear (<10 FNU) but turns red-brown within hours when the Paria or Little Colorado
  flood (winter storms, Jul-Sep monsoon). USGS FS 2016-3053 https://pubs.usgs.gov/fs/2016/3053/fs20163053.pdf
- Width ~90 m average (23 m minimum), depth ~12 m average, 25 m max. NPS Park Profile 2025.
- Rapids form where side-canyon debris fans pinch the channel: a hole behind a boulder, standing waves that stay put,
  a wave train down the centre. USGS PP 1591; Leopold PP 669-D.
- Side-canyon floods are debris flows: clay to boulders, only 10-25% water by weight, "boulders, mud" (Bright Angel,
  Aug 2026). USGS WRI 94-4214.
- **Film consequence:** the carving happens in sediment-laden floods. Flood scenes (the riverbed close-up, the flash
  flood) should be red-brown and murky; clear green water with bright caustics reads as today's dam-controlled river.
  Colour guidance (estimates; no source gives hex): flood river #8A5A3C-#A87050, beige foam #CDB89A; today's river
  #2E5A4C-#3F7A64; flash-flood front #5E4030-#7A5034 with tan foam rim #C9B091; flood underwater haze #6E5A3A-#8C7348.

## Ranked techniques
River surface (ribbon with `flow` = metres along, 0..1 across):
1. Two-phase flow-mapped normals (Valve, Portal 2; three.js Water2.js shader maths, MIT): two scrolled normal-map
   samples at phase fract(t) and fract(t+0.5), noise-offset; speed faster mid-channel (4v(1-v)) and by slope; fade by
   fwidth with distance. ~4 texture reads, no extra pass. Do not use Water/Water2/Reflector objects as-is: extra scene
   renders per frame and Water2 uses a clock (not deterministic).
2. Baked river attributes: synthetic depth across the channel -> Beer-Lambert colour with a turbidity switch
   (green today / red-brown flood); bank foam from the across coordinate; rapids from a per-vertex `slope` along the
   path: standing-wave crests with no time term, foam flowing through them. Low cost.
3. Canyon-wall reflections without a pass: march the reflected ray 8-16 steps through the DEM height texture, sample the
   imagery on a hit, sky PMREM on a miss, mix by Fresnel. Medium cost, water pixels only.
Underwater (flood close-up): RGB turbidity fog (red absorbed first; flood haze brown, visibility cheated to 1.5-3 m);
instanced silt motes (2-5k, closed-form positions); sediment puffs at pebble impacts; faint/absent caustics in flood
water (texture-based caustics, Evan Wallace WebGL Water is MIT, if clear water is ever shown); dim brown light shafts as
additive cones (no screen-space god rays); Snell's window only if the camera looks up.
Flash flood: a draped muddy ribbon on the side-canyon floor with a bulging snout at a moving front; two-phase flow
texture; beige foam at front and banks; instanced debris and spray on seeded ballistic arcs; rockfall baked offline
(cannon-es/rapier to keyframes) and replayed.
With a GPU later: planar reflections (Reflector), depth pre-pass refraction, WebGPU compute (Gerstner waves in rapids,
SSR, caustics). Rivers suit flow maps better than FFT oceans.

## Code sources and licences
MIT: three.js Water.js / Water2.js / webgl_water_flowmap / water normal textures; thaslle/stylized-water (foam);
norio/three-stylized-water (TSL: depth, shoreline, intersection, waves; port maths to GLSL); Evan Wallace WebGL Water;
drei MeshReflectorMaterial (GPU later); stegu/webgl-noise. Technique only: Valve slides. Avoid copying Shadertoy code
(default CC BY-NC-SA, incl. "Seascape"); avoid martinRenou/threejs-caustics (no licence). Stock footage (Pexels,
Pixabay) is not CC0 and doesn't match camera/scale: hero close-ups only, if ever.

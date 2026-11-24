# Realistic 3D

A photoreal or physically detailed world (a street, a field, a house, an engine room) and a
camera that moves through it believably. It reads as real when its scale, materials, light, air
and motion obey physics; adjectives in a prompt or more objects in a frame don't get there.

The three.js route has a tested starting kit, `templates/parts/src/kit/realism/`, with a runnable
example shot in `examples/realistic-3d/` at the repo root. The kit is a detailed procedural
starting point, not photographic quality: its example still reads as CGI (see "What the kit does
not do"). Its numbers come from one outdoor shot; measure every setting on the shot you build.

## Read the references as physics

Collect real photos or clips of the place or thing at the distances the film needs (wide, mid,
close), the user's first, and read from them measurable properties, not moods:
- **Scale:** real dimensions in metres (door height, kerb, leaf size, vehicle length); pick one
  scene unit (1 = 1 m) before modelling.
- **Materials:** each surface's base colour, roughness, and where and why it is worn, dirty, wet or
  weathered (rain runs down, hands touch handles, sun bleaches the top).
- **Light:** time of day, sun direction and hardness, sky colour, the colour bounced off the
  ground, which surfaces are in shadow.
- **Air:** how much haze at what distance, and its colour.
- **Density:** how much detail sits in one square metre at the hero distance.
- **Motion:** how things move (grass and branches in wind, a car pitching as it brakes, water,
  people's weight shifts).

## Choose the route

three.js in Remotion with the realism kit (below), or Blender rendered to a PNG plate that Remotion
composites. The route table, the budget and choreography rules, and the Blender loop live in
[blender](../../references/blender.md#choose-the-renderer); read it before choosing. Blender shots
start from [`templates/blender-shot/`](../../templates/blender-shot/README.md) (a script that builds
the scene from an empty file, preview presets, an in-frame report) and run on Matthew's Mac.

## The realism kit (three.js route)

Copy `templates/parts/src/kit/realism/` into the film's `src/kit/realism/` (it imports `three` and
its standard add-ons only). Read `examples/realistic-3d/` first: `src/set.ts` composes a whole
outdoor set from the kit and `src/Shot.tsx` shows the per-frame wiring. Change that set rather than
writing these pieces again.

| File | Use it for |
| --- | --- |
| `sky.ts` | `skyLight(gl, {elevation, azimuth, turbidity, clouds, ground, visibility})` once: three's Preetham `Sky` for the background, a PMREM environment of that sky over a ground disc lit by it (bounce light), the sun's colour and intensity through the same atmosphere, and haze colours read back from the sky |
| `sun.ts` | `makeSun({...sky, center, radius})`: a shadowing sun whose shadow box is fixed over the set; `followSun()` moves it only in whole shadow texels when the camera travels further |
| `shade.ts` | Patches for three's standard materials, composed with `patch(material, ...)`: `wind()` (frame-driven, world space, also put into `depthFor()` so shadows sway), `weather()` (noise colour, roughness and relief, edge chips, dust and moss on top faces, grime from the ground, streaks below sources, wetness, per-vertex wear masks), `air()` (height haze lit by the sky, before tone mapping), `translucent()` (sun through blades and leaves), `leaf()` (a textureless leaf cut-out). Set `time.value = frame / fps` each frame |
| `plants.ts` | `scatter()` seeded placement with a density function (for both where things grow and level of detail); `instances()`; `tuft()`, `flower()`, `tree()`, `leafCard()` |
| `shapes.ts` | `edges()` convexity attribute for edge wear; `paint()` per-vertex wear masks; seeded `rock()` and `slab()` |
| `camera.ts` | `track()` along a path at a focal length on a 36 mm sensor; `move()` eased progress |
| `noise.ts` | Seeded `rng`, CPU noise, and GPU noise with octaves faded below two pixels so detail doesn't crawl |

Wiring: the template's `ThreeCanvas` at `dpr={2}` (2× supersampling; thin grass shimmers without
it), `shadows="percentage"`, and `gl.toneMapping` and `toneMappingExposure` set in `onCreated`.
Build the set once in `useMemo`; per frame set only the time uniform, animated transforms and the
camera, all from the frame number. Keep `Finish` at `bloom={0}` (three already tone-mapped) for
its vignette and grain.

Settings the example settled, with the reason:
- **Sun from the sky's own disc.** A sun derived from the sky shader's disc radiance times its
  solid angle (`sunColor()`) gives a direct-to-sky ratio near clear-sky measurements: at a 13°
  sun, an intensity of about 25 with ACES exposure about 0.24. A sun five times weaker made the
  sky outshine the set.
- **Haze is strong for its number.** The horizon sky is several times brighter than sunlit grass,
  so a few percent of in-scattered light lifts distant ground a lot: a visibility of 1.4 km washed
  the meadow into a beige band; 4 km read as late-afternoon air.
- **Rough ground still mirrors the horizon at grazing angles** under three's Fresnel. Use
  `MeshPhysicalMaterial({specularIntensity: 0.25})` for soil and litter.
- **Rocks need creased normals** (`toCreasedNormals`, done in `rock()`); smooth normals across
  fracture planes read as pillows or sandbags.
- **Weathering has to be bigger than feels right** at its viewing distance: chips, rust runs and
  moss sized for a close-up vanish at 4 m. Check a 1:1 crop of the hero still.
- **Light the side you show.** A wall whose camera-facing side was away from the sun read as a
  dark heap; facing the sun, it read as stone.

Measured on the example (1280×720, 24 fps, 2× supersampled, about 60k near grass tufts, 150k far
tufts, 150k leaf cards, one 4096 shadow map, an Apple-silicon laptop shared with other renders):
60 frames in 17–24 s at concurrency 1 including browser start and scene build; re-rendered frames
bit-identical, also between two installs. `examples/realistic-3d/check.sh` reproduces this and
fails if a re-rendered frame differs.

### What the kit does not do
Sub-frame motion blur, depth of field, ambient occlusion or bounce beyond the environment map,
cascaded shadows (one shadow box: far trees cast no shadow on the meadow), volumetric light
shafts, bloom in linear light, per-frame level of detail (it has two density tiers), and an
automatic contact-slip check. (The Blender bridge is `templates/blender-shot/`.) Build these only when a shot needs them, then
validate on that shot. Its example reads as CGI: tree crowns repeat one constructor's shape on
regular spacing, faces turned from the sun go nearly black, grass has no seed heads or dead
blades, and `Finish`'s grain is heavy for a realistic film.

## Build physical detail

Search the asset library first when it is installed. Sourced sky maps, models and scanned
materials are sourced assets: use them only where the brief allows, check their licence, and
record where each came from.
- **Model in real units** with real proportions from the references. Bevel edges; bevels catch light.
- **Write constructors, not one-off meshes:** a function that builds a fence, a tree or a building
  from parameters and a seed makes a hundred varied instances and can be registered for the next
  film (the example's `pump.ts`: lathe profiles and tubes in real units, weathered where water runs
  and hands touch).
- **Most realism lives in roughness.** Vary roughness and colour across every surface with noise,
  add normal detail at the hero distance, drive wear, dirt and wetness from masks that follow the
  cause (height for grime, upward faces for dust, edges for chips), and break up visible tiling.
- **Scatter by instancing** (`InstancedMesh`; distribute-and-instance nodes in Blender) with
  per-instance scale, rotation and colour, denser where the camera looks.
- **Light from the sky:** a sun plus an environment from a sky model or HDR image, so every
  surface sees the sky's colour; shadows on everything that touches the ground.
- **Air:** distance fog tinted toward the sky colour, stronger with distance and lower to the
  ground in the morning.
- **Exposure:** work in linear light, set exposure like a camera, tone map with a filmic curve
  (ACES or AgX) exactly once. `Finish`'s bloom is an sRGB filter on the finished picture: either
  bloom in linear light before the tone map and set `Finish` `bloom={0}`, or keep `Finish` bloom
  and add none upstream.

Judge a still of the hero framing beside the matching reference at the same size.

When 3D cuts against real footage of the same object and can't match it, cut on motion or a
shared shape (a gas burst, matching circles, a fast move) rather than holding the two side by side
or dissolving slowly between them.

## People in a realistic film

Hands and faces are where a real-time render reads as CGI first, especially at macro: rubbery
skin, one flat skin tone, fingers bending past their limits, a pinch that never grips.
- **Frame around them first:** silhouettes against a window, backs of heads, hands entering at the
  frame edge, a cut-away to the object. A shot that only works with a convincing close-up hand or
  face is a route decision, not a polish task.
- **When they must appear,** give the rig real joint ranges (finger joints flex in one plane, the
  fingertip joint follows the middle one, almost no hyperextension), checked over every rendered
  frame, plus contact checks against the props. Skin needs colour variation
  (redder knuckles, fingertips and creases, paler over tendons, translucent nails) and light
  through thin edges.
- **Drop a pose that can't look real.** If it stays wrong after a focused pass (a precision pinch
  at macro is the usual one), restage the action without the hand: the object moves on its own and
  a cut carries the action.
- **Check scanned assets before framing them:** a licensed scan may have closed eyes, blemishes in
  its albedo, or no texture; keep its licence and credit with it.
- **Reroute the people, keep the world:** reframe, or move the shot to Blender. Dissolving the set
  around a hard element leaves the whole film unplaced.

## Animate with weight, then test one moving shot

- **Contact:** a planted foot, hoof or wheel doesn't slide. Derive a wheel's rotation from the
  distance travelled (angle = distance ÷ radius) and lock feet for their contact frames.
- **Secondary motion lags the cause:** branches after the trunk, cloth after the body, a car's body
  after its wheels. Heavy things accelerate and stop slowly.
- **Simulate offline, play by frame:** bake physics or cloth to keyframes or a per-frame array and
  look the frame up. Wind and ambient life come from noise driven by the frame number.
- **A real camera:** set the lens by focal length (`PerspectiveCamera.setFocalLength(mm)`), move it
  like a dolly, crane or drone with limited acceleration, and shake it only when a person is
  holding it. Motion blur matches a 180° shutter (three.js needs sub-frame accumulation; Cycles has
  it built in).
- **Determinism:** every random value seeded; in Blender, fix the seed and sample count and bake
  simulations.

Before building the rest of the film, render its hardest few seconds at full size (the fastest
camera move through the densest detail), run the
[temporal checks](../../references/review.md#temporal-checks), record seconds per frame, show it
beside the reference, and wait for the user's verdict. For a realistic look this replaces the
style frame: a still can't show whether the motion is believable.

## Handing Blender frames to Remotion

Render a numbered sequence at the film's fps and size, timed from the same cue frames as
everything else: the template's `scene.py` reads `beats.json`, and the shot's sound events come
from the same file; `blender-plate.tsx` shows the sequence as a layer
([blender](../../references/blender.md#into-remotion)). Remotion composites display-ready sRGB under
captions and overlays, so colour is transformed once on the way:
- **PNG** (8- or 16-bit) is written with the scene's view transform (AgX or Filmic) applied:
  composite it as is, with no second curve.
- **EXR** stores scene-linear light: convert it to display sRGB in one step, with the view
  transform the look was approved with.
- Blender frames and three.js layers in one shot need the same transform and exposure (or render
  the overlay in Blender too); mismatched curves show at the seam.
- **Speed change after rendering:** re-render on the new output grid at fractional positions with
  `scene.frame_set(int(x), subframe=x - int(x))`, every per-frame script reading x as a float;
  check that a half-frame lands halfway between its neighbours before full runs. Cheaper: lock the
  delivery speed before final renders.

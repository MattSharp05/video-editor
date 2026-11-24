# Blender shots

Read at step 2 when a shot might need Blender (choosing the route), and at steps 4–5 before writing a Blender
scene. A Blender shot is a script that builds the scene from nothing, rendered to a PNG plate that Remotion
shows as one layer under captions and overlays. Template: [`templates/blender-shot/`](../templates/blender-shot/README.md).
Colour handoff and speed changes: [realistic 3D, "Handing Blender frames to Remotion"](../styles/realistic-3d/README.md#handing-blender-frames-to-remotion).

## Choose the renderer

| Route | Choose it when | Costs |
| --- | --- | --- |
| three.js in Remotion (`three-canvas.tsx`, the realism, motion and terrain kits) | Stylised to detailed 3D; many shots; tight sync to VO and captions; outdoor sun and sky light; instanced vegetation and props; anything the film re-times often | No global illumination, AO pass or ray-traced reflections: faces turned from the sun go very dark, contact shadows come only from the shadow map, no depth of field or motion blur (the motion kit's `Shutter` adds blur). Fast: the realism example renders at 0.3–0.4 s per 1280×720 frame |
| Blender (Cycles, or EEVEE for speed) rendered to an image sequence that Remotion composites | Close-ups that must pass as photographs; product shots (glass, coated plastic, brushed metal); interiors lit by bounce; glass, liquids, caustics; cloth, fluid or rigid-body simulation; very dense scattered detail; a `.blend` asset (Blender Studio rigs) | Seconds to minutes per frame; runs on Matthew's Mac, not in the cloud; a separate script to keep in sync with the cue frames; every timing change is a queued re-render |

- Estimate the budget before choosing: seconds per frame on the test shot times the film's frame count, at the
  machine's real speed. Ask the user before a route whose estimate runs past their deadline.
- Count choreography in the budget, not only render time. An offline renderer turns every timing change into a
  queued re-render, and rendering the set once with animated layers over it makes a static plate the cheap
  default; films made that way drifted toward long holds where one ambient thing moves while the narration
  explains. Block and approve the motion first (three.js, or this template's `layout` preset over the VO), then
  commit to offline renders.
- Prefer short Blender shots inside a film the rest of which is three.js or 2D: one hero shot of 2–5 s, not a
  whole film. Keep captions, labels and UI in Remotion over the plate so they re-time for free.
- Blender is optional: check for it, never assume it (`blender --version`; on Matthew's Mac it is 5.1.0).

## The loop

1. **Write `scene.py`** in a copy of the template, one folder per shot (`film/blender/<shot>/`). The script builds
   everything from a factory-reset empty file every run; nothing lives only in a `.blend`. Model in metres, light
   with real wattages, seed every random value, time every event from `beats.json` (`shot.f('beat', offset)`).
2. **Describe** before rendering: `python3 describe.py --frame N` for the start, middle and end frames, plus
   `--region 0,250,1080,220` for the caption band. Fix anything `out` that should be in, anything `partly` that
   should be whole, the warnings, and a hero that crosses the Reels UI bands. It is a bounding-box check that knows
   nothing about occlusion; the stills confirm it.
3. **Layout stills** (`--preset layout --frames ...` at each beat's first, middle and last frame): framing,
   scale, timing. Solid colours only; never judge the look from them.
4. **Time a 30-frame test** at the preset you will deliver (`--frames 0-29`, or five frames spread over the shot
   for `final`) and read the steady s/frame line, not the first frame, which carries scene sync and kernel loading.
   `shot.py` prints the whole-shot estimate; multiply by the number of re-renders you expect.
5. **Draft stills** (`draft`, EEVEE half size) or `cycles` stills for the look: materials, light, the brand colour
   (AgX desaturates bright saturated colour; see Traps). Compare with the reference at the same size.
6. **Final plate**: `--preset final --all --out <film>/public/out/plates/<shot>`, then stills of the film around
   the plate (the template's `snap.sh`) and the [temporal checks](review.md#temporal-checks) on the plate itself.

## Presets

| Preset | Engine and size | Use it for |
| --- | --- | --- |
| `layout` | Workbench, half size, outlines and shadows | Framing, scale and timing; runs in the cloud too |
| `fast` | EEVEE, 480 px wide, 16 samples | Quick motion strips, the 30-frame timing test |
| `draft` (default) | EEVEE, half size, 32 samples | The look, stills for the board |
| `cycles` | Cycles, full size, 64 samples, denoised; Metal on macOS, OptiX/CUDA/HIP/oneAPI if present, else CPU | Glass, bounce, caustics; anything EEVEE fakes |
| `final` | `FINAL` in scene.py (default Cycles 256 samples, AgX, 8-bit PNG, optional motion blur) | The plate |

`--samples`, `--scale`, `--size WxH` and `--fps` override any preset. The default size is 1080×1920 at 30 fps.

## Frames, cache and folders

- **Film frame N of the plate is scene frame `frame_start + N`** (frame_start is 1) and file `NNNN.png`. The plate
  starts at its start beat's film frame; nothing else needs offsetting.
- **One shot per folder.** `shot.py`'s cache key is a hash of that folder's files plus the pixel-changing flags:
  frames already rendered with the same key are skipped (an interrupted final resumes), and a new key deletes the
  old frames before rendering. A shared folder makes an edit to one shot re-render the others (Montage's trap: an
  edit elsewhere re-rendered a shot for 44 s). `beats.json` symlinked into the folder is part of the key, so a
  re-timed VO re-renders every Blender shot; copy only the beats a shot uses when that costs too much.
- **Paths from the script's folder** (`props.here('hdri.exr')`): Blender runs from wherever it was started.
- **Plates are renders**: they go in the film's `public/out/plates/<shot>/` (git-ignored by `**/out/`), never in
  git. The shot folder, `scene.py`, `props.py` and any small source textures are committed.

## Into Remotion

Use the kit part [`blender-plate.tsx`](../templates/parts/README.md) (copy it into the film's `src/kit/`):
`<BlenderPlate dir="out/plates/<shot>" from={f(beats.product)} frames={N} />` shows file `frame - from`, nothing
outside the plate (or holds an end with `hold`), and fails the render on a missing file.
- Render at the film's fps and size; the template defaults to 1080×1920 at 30 fps.
- Full-frame plate: everything in Blender, captions and overlays in Remotion on top. Element plate: set
  `TRANSPARENT = True` (film_transparent, floor as a shadow catcher) for an RGBA plate over a Remotion background.
- Colour is transformed once, in Blender: a PNG carries the view transform (AgX by default); composite it with no
  second curve, and don't put `Finish` bloom on it. Three.js layers in the same shot need the same transform and
  exposure ([realistic 3D](../styles/realistic-3d/README.md#handing-blender-frames-to-remotion)).
- Sound events read the same `beats.json` the shot reads, so the drop and its thud stay on one frame.
- Never rewrite a plate a running Remotion render reads: render a new version to `<shot>.new`, swap the folders
  between renders ([pipeline gotchas](remotion-pipeline.md#gotchas)).

## Where it runs

- **Matthew's Mac** (MacBook Pro, Apple silicon, Blender 5.1.0 on PATH, Metal): the place for `draft`, `cycles`
  and `final`. Cloud sessions can't reach it now, so Blender runs in a **local Claude session** in
  `~/Studio/video-editor`. Split the work by what each side can do:
  - The cloud session writes `scene.py`, runs describe, `layout` and low-sample `cycles` stills through the `bpy`
    wheel (below), and commits the shot folder.
  - The local session pulls, runs the 30-frame timing test and the final plate, and renders the film there,
    because plates don't travel through git and nothing is uploaded anywhere without Matthew asking.
  - Before a long render on the Mac: check memory, swap and load ([pipeline gotchas](remotion-pipeline.md#gotchas)),
    run one heavy job at a time, and wrap it in `caffeinate -i` so the laptop doesn't sleep mid-plate.
- **Cloud container** (no GPU, no Blender binary): `uv venv -p 3.13` and `uv pip install bpy==5.1.0` (430 MB wheel;
  the version matches the Mac), then `BPY_PYTHON=<venv>/bin/python python3 shot.py ...`. Workbench and EEVEE need
  EGL: `apt-get install -y libegl1 libegl-mesa0 libgl1-mesa-dri`. Keep venvs and renders out of the repo.
  Measured 2026-11-24 on 4 CPUs shared with other jobs: layout 0.28 s/frame at 540×960; Cycles CPU 16 samples
  22–35 s/frame at 1080×1920; EEVEE under software GL 16.5 s/frame at 480 px, slower than Cycles, so skip it here.

## Time

- Time a 30-frame test before any long run, and estimate from its steady rate, not the first frame.
- Estimate before calling a render stuck: Montage's Cycles element at 1.6 s/frame × 504 frames sat at 13% for 13
  minutes, which is exactly on schedule. `shot.py` prints per-frame times and the minutes left.
- Machine speed varies with load: the same 16-sample Cycles frame took 21–35 s here as other agents' encodes came
  and went. Quote the range.

## Traps

- **API drift.** Tested on 5.1.0. 5.0 removed `Action.fcurves` (layered actions: use `props.fcurves(obj)`), named
  EEVEE `BLENDER_EEVEE` again (`BLENDER_EEVEE_NEXT` in 4.2–4.5; use `props.engine_id('EEVEE')`) and deprecated
  `Material.use_nodes` (always on; removal planned for 6.0). 4.1 removed auto smooth (`mesh.shade_smooth()` plus a
  bevel with `harden_normals`) and the Musgrave texture. 4.0 renamed Principled BSDF inputs (Specular IOR Level,
  Subsurface/Transmission/Sheen/Coat Weight, Emission Color). `shot.py` prints a hint for each of these.
- **Operators need a UI context** that `-b` doesn't have: build with `bpy.data`, `bmesh` and the props helpers,
  not `bpy.ops` (render and file operators are fine).
- **`--factory-startup` resets preferences**, including the Cycles GPU choice: `props.pick_device()` sets it each
  run, and prints which device it used. Read that line; a final that silently ran on the CPU is the expensive bug.
- **Bright saturated colour turns pastel under AgX.** The example's orange box went salmon with a 420 W key at 3 m
  and held its colour at 140 W. Check the brand or accent colour in a `draft` still and lower the light before
  reaching for exposure or another view transform.
- **Workbench shows `diffuse_color`**, not the shader: `props.material()` keeps the two in step; a hand-built node
  material shows grey in `layout`.
- **describe's boxes are bounding boxes**: a rotated thin object can read `partly` while its pixels are in frame,
  and a hidden object still reads `in`. Use `layout` stills for the final word.
- **Determinism**: Cycles' seed is fixed and not animated, so noise doesn't crawl differently on a re-render; two
  renders of one frame were pixel-identical (PNG bytes differ only in metadata). Bake simulations before the plate.
- **Baked keys are linear between frames.** Subframe sampling (motion blur, re-timing) interpolates between the
  per-frame keys `props.bake()` writes; bake with `step=1` for anything fast.
- **A `.blend` is for looking**, not editing: `--save-blend` writes the built scene to open in the UI; a change
  made there is lost on the next run. Put it in `scene.py`.

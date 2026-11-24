# Blender shot

One offline-rendered 3D shot, built entirely by a script from an empty file, rendered to a numbered PNG
plate that Remotion shows as a layer. When to use it, the loop and the traps: [blender](../../references/blender.md).

Copy this folder once per shot: `projects/<slug>/film/blender/<shot>/`. The folder is the shot's cache key,
so one shot per folder.

| File | What it does |
| --- | --- |
| `scene.py` | Builds the whole scene from a factory-reset file every run (example: a rounded box drops onto a plinth under a three-point light while the camera orbits 30°). Holds `SHOT` (timing), `FINAL` (final render settings) and `TRANSPARENT`. |
| `props.py` | Helpers: `here()` paths from the shot folder, `Shot` timing from `beats.json`, `material()` (Principled BSDF by keyword, sRGB hex in), `rounded_box()`, `cylinder()`, `plane()`, `text()`, `camera()` by focal length, `look_at()`, `three_point()`, `area_light()`, `studio_world()`, `world_hdri()`, `bake()` (keyframes every frame from a Python function), `fcurves()` (works on 5.x layered actions), presets, device choice and the render loop. |
| `shot.py` | The one entry point, run with the system Python: finds Blender, applies the cache, starts `blender -b --factory-startup --python scene.py -- ...`, filters Blender's log, prints seconds per frame and an estimate for the whole shot, and turns a Python error into file, line, source line and a hint. |
| `describe.py` | JSON of the camera and each object in / partly in / out of frame (projected bounding box, pixel box, share of frame, depth), its materials, whether it moves over the shot, lights and warnings; `--region x,y,w,h` names the objects in part of the frame. |

```bash
cd projects/<slug>/film/blender/<shot>
ln -s ../../src/beats.json beats.json                    # optional: time the shot from the film's beats
python3 describe.py --frame 0 --region 0,250,1080,220    # what is in frame, what sits under the captions
python3 shot.py --preset layout --frames 0,45,89         # framing stills -> out/layout/
python3 shot.py --preset fast --frames 0-29              # 30-frame timing test (prints s/frame, whole-shot estimate)
python3 shot.py --preset draft --frames 0,45,89          # look stills (EEVEE, half size; default preset)
python3 shot.py --preset final --all --out ../../public/out/plates/<shot>   # the plate
```

Presets: `layout` Workbench at half size (framing and timing; solid colours, never judge the look from it),
`fast` EEVEE 480 px wide, 16 samples, `draft` EEVEE half size, 32 samples, `cycles` Cycles on the GPU (Metal on
macOS, then OptiX, CUDA, HIP, oneAPI; CPU if none), full size, 64 samples, denoised, `final` the `FINAL` dict in
scene.py (default Cycles, 256 samples). Flags: `--size WxH`, `--fps N`, `--seconds S`, `--scale F`,
`--samples N`, `--depth 8|16`, `--device CPU|METAL|OPTIX|...`, `--seed N`, `--save-blend FILE` (open the built
scene in the UI to look around; never edit it, edit scene.py), `--force`, `--verbose`.

Timing: plate file `NNNN.png` is shot frame N = scene frame `frame_start + N` (frame_start is 1). `SHOT` spans two
beats of `beats.json`; `shot.f('beat', offset_s)` is a beat's shot frame. In Remotion the plate starts at the start
beat's film frame: `<BlenderPlate dir="out/plates/<shot>" from={f(beats.product)} frames={N} />`
([parts](../parts/README.md)).

Cache: `shot.py` hashes every file in this folder (symlinks followed; `out/` skipped) with the pixel-changing
flags. Same key: frames already in `--out` are skipped, so an interrupted render resumes. New key: the old frames
in `--out` are deleted first, so a plate never mixes two versions.

Without Blender (cloud containers): `BPY_PYTHON` points at a Python 3.13 venv with `pip install bpy==5.1.0` (the
same build as Matthew's Blender 5.1.0). Workbench and EEVEE also need `libegl1 libegl-mesa0 libgl1-mesa-dri`
(software GL: EEVEE ran about 16 s per 480 px frame, slower than Cycles on the CPU). Use `layout` and low-sample
`cycles` there; finals belong on the Mac.

Tested 2026-11-24 on bpy 5.1.0, Linux, 4 shared CPUs (load 7–10 from other jobs), no GPU: layout 0.28 s/frame at
540×960 (30 frames in 8.4 s), Cycles CPU 16 samples 22–35 s/frame at 1080×1920, EEVEE under Mesa 16.5 s/frame at
480×853, describe under 1 s, two Cycles renders pixel-identical, RGBA shadow-catcher plate composited correctly,
plate shown frame-exact in Remotion 4. Not tested: the `blender` binary path, Metal, OptiX/CUDA, a full final run.

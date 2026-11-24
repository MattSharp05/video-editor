"""Blender headless test: a product-style shot built entirely by script.

A rounded box on a plinth in front of a seamless sweep, three-point area lights, and a slow
camera orbit over 3 s (frames 0-89 at 30 fps, 1080x1920). Scene unit: 1 = 1 m.

Run (from the repo root). Call the app binary, not the /usr/local/bin/blender symlink: through
the symlink Blender can't find its bundled Python ("No module named 'encodings'").
    /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P lab/blender-test/scene.py -- --engine eevee --frames 0,45,89
    /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P lab/blender-test/scene.py -- --engine cycles --samples 64

Writes PNGs (AgX applied, composite as is) and timing.json to lab/blender-test/out/<engine>/
(git-ignored). --save also writes the built .blend there.
"""

import argparse
import json
import math
import os
import sys
import time

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))

W, H, FPS = 1080, 1920, 30
FRAME_START, FRAME_END = 0, 89          # 90 frames = 3 s
ORBIT_DEG = 40                          # total camera sweep over the shot
SEED = 7


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--engine", choices=["eevee", "cycles"], default="eevee")
    p.add_argument("--frames", default="0,45,89")
    p.add_argument("--samples", type=int, default=64)
    p.add_argument("--out", default=None)
    p.add_argument("--save", action="store_true")
    return p.parse_args(argv)


# ---------- scene ----------

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.resolution_x, s.render.resolution_y = W, H
    s.render.resolution_percentage = 100
    s.render.fps = FPS
    s.frame_start, s.frame_end = FRAME_START, FRAME_END
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGB"
    s.render.image_settings.color_depth = "8"
    s.view_settings.view_transform = "AgX"
    s.view_settings.look = "AgX - Medium High Contrast"
    s.view_settings.exposure = -1.6   # 0.0 clipped the plinth and washed the orange out
    return s


def principled(name, color, rough, coat=0.0, coat_rough=0.1, noise_rough=0.0):
    """Principled material; noise_rough > 0 varies roughness with a noise texture."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = coat_rough
    if noise_rough > 0:
        tex = nt.nodes.new("ShaderNodeTexNoise")
        tex.inputs["Scale"].default_value = 18.0
        tex.inputs["Detail"].default_value = 6.0
        ramp = nt.nodes.new("ShaderNodeMapRange")
        ramp.inputs["To Min"].default_value = rough - noise_rough
        ramp.inputs["To Max"].default_value = rough + noise_rough
        nt.links.new(tex.outputs["Fac"], ramp.inputs["Value"])
        nt.links.new(ramp.outputs["Result"], b.inputs["Roughness"])
    return m


def bevel(obj, width, segments):
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.harden_normals = False
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return mod


def build_sweep():
    """Seamless studio backdrop: floor that curves up into a back wall."""
    import bmesh
    me = bpy.data.meshes.new("Sweep")
    bm = bmesh.new()
    depth, radius, height, width = 6.0, 1.6, 6.0, 14.0
    profile = [(y, 0.0) for y in (-depth, -2.0, 0.0)]   # floor towards camera, then the bend
    for i in range(1, 17):                              # quarter circle up into the wall
        a = (i / 16) * (math.pi / 2)
        profile.append((radius * math.sin(a), radius * (1 - math.cos(a))))
    profile.append((radius, height))
    rows = []
    for x in (-width / 2, width / 2):
        rows.append([bm.verts.new((x, y + 2.4, z)) for y, z in profile])
    for i in range(len(profile) - 1):
        bm.faces.new((rows[0][i], rows[1][i], rows[1][i + 1], rows[0][i + 1]))
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("Sweep", me)
    bpy.context.collection.objects.link(ob)
    for poly in me.polygons:
        poly.use_smooth = True
    ob.data.materials.append(principled("Backdrop", (0.62, 0.60, 0.57), 0.85))
    return ob


def build_plinth():
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=0.42, depth=0.30,
                                        location=(0, 0, 0.15))
    p = bpy.context.object
    p.name = "Plinth"
    bevel(p, 0.012, 4)
    p.data.materials.append(principled("Plinth", (0.80, 0.78, 0.74), 0.55, noise_rough=0.12))
    return p


def build_product():
    """A rounded box (about 22 x 14 x 30 cm), soft-touch coloured body."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.30 + 0.15))
    b = bpy.context.object
    b.name = "Product"
    b.scale = (0.22, 0.14, 0.30)
    bpy.ops.object.transform_apply(scale=True)
    bevel(b, 0.028, 10)
    b.rotation_euler = (0, 0, math.radians(-18))
    b.data.materials.append(
        principled("ProductBody", (0.85, 0.32, 0.12), 0.38, coat=0.6, coat_rough=0.18,
                   noise_rough=0.04))
    return b


def area_light(name, loc, target, power, size, color=(1, 1, 1), size_y=None):
    d = bpy.data.lights.new(name, "AREA")
    d.energy = power
    d.color = color
    d.shape = "RECTANGLE"
    d.size = size
    d.size_y = size_y or size
    ob = bpy.data.objects.new(name, d)
    ob.location = loc
    bpy.context.collection.objects.link(ob)
    c = ob.constraints.new("TRACK_TO")
    c.target = target
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"
    return ob


def build_lights(target):
    # Key: large soft box front-left and above; warm-neutral.
    area_light("Key", (-1.6, -1.8, 1.9), target, 420, 1.4, (1.0, 0.96, 0.90))
    # Fill: front-right, low and big, about 1/4 of the key; slightly cool.
    area_light("Fill", (1.9, -1.4, 0.8), target, 110, 2.0, (0.90, 0.95, 1.0))
    # Rim: behind and above on the right, a strip that edges the silhouette.
    area_light("Rim", (1.0, 1.6, 1.6), target, 360, 0.3, (1.0, 1.0, 1.0), size_y=1.6)
    w = bpy.data.worlds.new("World")
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.05, 0.05, 0.055, 1)
    bg.inputs["Strength"].default_value = 1.0


def build_camera(target):
    pivot = bpy.data.objects.new("OrbitPivot", None)
    pivot.location = (0, 0, 0)
    bpy.context.collection.objects.link(pivot)

    cd = bpy.data.cameras.new("Camera")
    cd.lens = 80                      # mm on a 36 mm sensor: product-shot compression
    cd.sensor_width = 36
    cd.dof.use_dof = True
    cd.dof.focus_object = target
    cd.dof.aperture_fstop = 5.6
    cam = bpy.data.objects.new("Camera", cd)
    cam.location = (0, -3.4, 0.95)
    cam.parent = pivot
    bpy.context.collection.objects.link(cam)
    c = cam.constraints.new("TRACK_TO")
    c.target = target
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"
    bpy.context.scene.camera = cam

    # Slow orbit with eased start and end (Bezier keys), -ORBIT/2 -> +ORBIT/2.
    pivot.rotation_euler = (0, 0, math.radians(-ORBIT_DEG / 2))
    pivot.keyframe_insert("rotation_euler", index=2, frame=FRAME_START)
    pivot.rotation_euler = (0, 0, math.radians(ORBIT_DEG / 2))
    pivot.keyframe_insert("rotation_euler", index=2, frame=FRAME_END)
    return cam


def build():
    s = reset()
    build_sweep()
    build_plinth()
    product = build_product()
    aim = bpy.data.objects.new("Aim", None)          # look slightly below the box centre
    aim.location = (0, 0, 0.36)
    bpy.context.collection.objects.link(aim)
    build_lights(aim)
    build_camera(product)
    cam = s.camera
    cam.constraints["Track To"].target = aim
    return s


# ---------- engines ----------

def eevee_id():
    items = bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys()
    for k in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        if k in items:
            return k
    raise RuntimeError(f"no EEVEE engine in {items}")


def setup_eevee(s):
    s.render.engine = eevee_id()
    e = s.eevee
    e.taa_render_samples = 64
    for attr, val in (("use_shadows", True), ("use_raytracing", True),
                      ("shadow_ray_count", 2), ("shadow_step_count", 8)):
        if hasattr(e, attr):
            setattr(e, attr, val)
    return {"engine": s.render.engine, "samples": e.taa_render_samples}


def setup_cycles(s, samples):
    s.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.refresh_devices()
    used = []
    for d in prefs.devices:
        d.use = d.type == "METAL"
        if d.use:
            used.append(d.name)
    if not used:
        raise RuntimeError("no Metal device found")
    c = s.cycles
    c.device = "GPU"
    c.samples = samples
    c.use_adaptive_sampling = False      # fixed sample count: deterministic and comparable
    c.seed = SEED
    c.use_denoising = True
    c.denoiser = "OPENIMAGEDENOISE"
    c.max_bounces = 8
    return {"engine": "CYCLES", "samples": samples, "devices": used,
            "denoiser": c.denoiser}


# ---------- main ----------

def main():
    args = parse_args()
    t0 = time.perf_counter()
    s = build()
    info = setup_eevee(s) if args.engine == "eevee" else setup_cycles(s, args.samples)
    out = args.out or os.path.join(HERE, "out", args.engine)
    os.makedirs(out, exist_ok=True)
    if args.save:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out, "scene.blend"))
    build_s = time.perf_counter() - t0

    frames = [int(f) for f in args.frames.split(",")]
    times = {}
    for f in frames:
        s.frame_set(f)
        s.render.filepath = os.path.join(out, f"frame_{f:04d}.png")
        t = time.perf_counter()
        bpy.ops.render.render(write_still=True)
        times[f] = round(time.perf_counter() - t, 2)
        print(f"[scene.py] {args.engine} frame {f}: {times[f]} s", flush=True)

    report = {**info, "resolution": [W, H], "fps": FPS, "build_s": round(build_s, 2),
              "seconds_per_frame": times, "blender": bpy.app.version_string}
    with open(os.path.join(out, "timing.json"), "w") as fh:
        json.dump(report, fh, indent=2)
    print("[scene.py] " + json.dumps(report), flush=True)


main()

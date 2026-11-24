# Helpers for a Blender shot built entirely from scene.py (tested on Blender 5.1.0, bpy module, Linux CPU).
# scene.py imports this module from its own folder; shot.py runs both inside Blender:
#   blender -b --factory-startup --python scene.py -- --preset draft --frames 0,45,89 --out DIR
# Everything a shot needs from Blender's API goes through here, so an API change is fixed once.
#
#   here(*parts)            path relative to the shot folder (Blender's cwd is elsewhere)
#   Shot(...)               timing: fps, size, length in frames, beats.json cues -> shot frames
#   material(name, ...)     Principled BSDF by keyword (base, rough, metal, coat, emit, ...)
#   camera(...), look_at()  camera by focal length on a 36 mm sensor, aimed at a point
#   three_point(...)        key, fill, rim area lights around a subject; studio_world()
#   text(...)               an extruded text object
#   bake(obj, fn, shot)     keyframe obj on every shot frame from fn(t) -> (location, look_at or rotation)
#   main(build)             parse args, factory-reset, build, apply the preset, render or describe
import math, os, random, sys, json, time

import bpy
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))  # the shot folder: props.py is copied beside scene.py


def here(*parts):
    """A path inside the shot folder. Blender's working directory is wherever it was started."""
    return os.path.join(HERE, *parts)


# ---------------------------------------------------------------- timing

class Shot:
    """Timing for one shot. Film frame N of the plate is scene frame `frame_start + N`.

    beats.json (optional, next to scene.py: copy or symlink the film's src/beats.json) maps names to film
    seconds. `start`/`end` name the beats the shot spans; without the file the shot runs 0..default_len s.
    """

    def __init__(self, start=None, end=None, default_len=4.0, fps=30, size=(1080, 1920), frame_start=1):
        self.fps, self.size, self.frame_start = fps, tuple(size), frame_start
        path = here('beats.json')
        self.beats = json.load(open(path)) if os.path.exists(path) else {}
        self.t0 = self.beats.get(start, 0.0) if start else 0.0
        t1 = self.beats.get(end) if end else None
        self.length_s = (t1 - self.t0) if t1 is not None else default_len
        self.missing = [b for b in (start, end) if b and self.beats and b not in self.beats]

    def apply_overrides(self, a):
        if a.fps: self.fps = a.fps
        if a.size: self.size = tuple(int(v) for v in a.size.lower().split('x'))
        if a.seconds: self.length_s = a.seconds

    @property
    def frames(self):
        """Number of frames in the plate."""
        return max(1, round(self.length_s * self.fps))

    def f(self, beat=None, offset=0.0):
        """Shot frame (0-based, float) of a beat plus offset seconds; a beat not in beats.json counts as shot start."""
        t = self.beats.get(beat, self.t0) if beat else self.t0
        return (t + offset - self.t0) * self.fps

    def t(self, n):
        """Seconds since shot start for shot frame n."""
        return n / self.fps

    def scene_frame(self, n):
        return self.frame_start + n


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def ease_out(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


# ---------------------------------------------------------------- materials

_ALIASES = {  # keyword -> Principled BSDF input (Blender 4.0+ names)
    'base': 'Base Color', 'rough': 'Roughness', 'metal': 'Metallic', 'ior': 'IOR', 'alpha': 'Alpha',
    'coat': 'Coat Weight', 'coat_rough': 'Coat Roughness', 'spec': 'Specular IOR Level',
    'transmission': 'Transmission Weight', 'sheen': 'Sheen Weight', 'subsurface': 'Subsurface Weight',
    'emit': 'Emission Color', 'emit_strength': 'Emission Strength',
}


def rgb(hex_or_tuple):
    """'#RRGGBB' (sRGB, as picked from a reference) -> linear RGBA, which Blender's colour inputs expect."""
    if isinstance(hex_or_tuple, str):
        h = hex_or_tuple.lstrip('#')
        c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
        lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
        return (*lin, 1.0)
    t = tuple(hex_or_tuple)
    return t if len(t) == 4 else (*t, 1.0)


def material(name, base='#cccccc', rough=0.5, metal=0.0, **kw):
    """A Principled BSDF material. Colours are sRGB hex (converted to linear) or linear tuples.
    Extra inputs by alias (coat=, emit=, emit_strength=, transmission=, ...) or by exact input name."""
    m = bpy.data.materials.new(name)
    if hasattr(m, 'use_nodes') and not m.use_nodes:  # deprecated in 5.x (always on), kept for 4.x
        m.use_nodes = True
    bsdf = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    vals = {'base': base, 'rough': rough, 'metal': metal, **kw}
    for k, v in vals.items():
        key = _ALIASES.get(k, k)
        if key not in bsdf.inputs:
            raise KeyError(f'Principled BSDF has no input "{key}" (from {k}=); inputs: {[i.name for i in bsdf.inputs]}')
        sock = bsdf.inputs[key]
        sock.default_value = rgb(v) if sock.type == 'RGBA' else v
    m.diffuse_color = rgb(base)  # Workbench (layout preset) shows this colour
    m.roughness, m.metallic = rough, metal
    return m


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


# ---------------------------------------------------------------- objects

def link(obj, collection=None):
    (collection or bpy.context.scene.collection).objects.link(obj)
    return obj


def mesh_object(name, bm):
    """An object from a bmesh (bmesh is freed)."""
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return link(bpy.data.objects.new(name, me))


def rounded_box(name, size=(1, 1, 1), radius=0.08, segments=6, location=(0, 0, 0)):
    """A box with rounded edges: a cube plus a bevel modifier, smooth shaded with hardened normals."""
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    o = mesh_object(name, bm)
    o.location = location
    b = o.modifiers.new('round', 'BEVEL')
    b.width, b.segments, b.limit_method, b.harden_normals = radius, segments, 'NONE', True
    o.data.shade_smooth()
    return o


def cylinder(name, radius=1.0, depth=0.2, segments=96, location=(0, 0, 0), bevel=0.01):
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=radius, radius2=radius, depth=depth)
    o = mesh_object(name, bm)
    o.location = location
    if bevel:
        b = o.modifiers.new('edge', 'BEVEL')
        b.width, b.segments, b.harden_normals = bevel, 3, True
        b.limit_method = 'ANGLE'
    o.data.shade_smooth()
    return o


def plane(name, size=10.0, location=(0, 0, 0)):
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=size / 2)
    o = mesh_object(name, bm)
    o.location = location
    return o


def text(body, name='text', size=0.2, extrude=0.01, bevel=0.002, align='CENTER', location=(0, 0, 0), font=None):
    """Extruded text (Blender's built-in font unless `font` is a .ttf/.otf path, e.g. here('fonts/X.ttf'))."""
    cu = bpy.data.curves.new(name, 'FONT')
    cu.body, cu.size, cu.extrude, cu.bevel_depth = body, size, extrude, bevel
    cu.align_x, cu.align_y = align, 'CENTER'
    if font:
        cu.font = bpy.data.fonts.load(font)
    o = link(bpy.data.objects.new(name, cu))
    o.location = location
    return o


# ---------------------------------------------------------------- camera and lights

def look_at(obj, target, roll=0.0):
    """Point an object's -Z (cameras, lights) at a world point."""
    d = Vector(target) - obj.location
    q = d.to_track_quat('-Z', 'Y')
    e = q.to_euler('XYZ', obj.rotation_euler)  # compatible with the previous rotation: no flips when baked
    if roll:
        e.rotate_axis('Z', roll)
    obj.rotation_euler = e
    return obj


def camera(name='camera', lens=50, location=(0, -5, 1.5), target=(0, 0, 0.5), clip=(0.05, 200), dof=None):
    """A camera by focal length on a 36 mm sensor (full frame), made the scene camera.
    dof=(focus_distance_m, f_stop) turns on depth of field."""
    cd = bpy.data.cameras.new(name)
    cd.lens, cd.sensor_width, cd.sensor_fit = lens, 36, 'AUTO'
    cd.clip_start, cd.clip_end = clip
    if dof:
        cd.dof.use_dof, cd.dof.focus_distance, cd.dof.aperture_fstop = True, dof[0], dof[1]
    o = link(bpy.data.objects.new(name, cd))
    o.location = location
    look_at(o, target)
    bpy.context.scene.camera = o
    return o


def area_light(name, energy=300, size=1.0, color=(1, 1, 1), location=(0, 0, 3), target=(0, 0, 0), spread=None):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy, ld.size, ld.color = energy, size, color[:3]
    if spread is not None:
        ld.spread = spread
    o = link(bpy.data.objects.new(name, ld))
    o.location = location
    look_at(o, target)
    return o


def three_point(target=(0, 0, 0.5), dist=4.0, key=600, fill_ratio=0.25, rim=800, warm=(1.0, 0.92, 0.84),
                cool=(0.85, 0.92, 1.0), key_azimuth=-40):
    """Key (warm, high, camera-left by default), fill (cool, low, opposite, fill_ratio of the key) and rim
    (behind, high). Energies in watts for area lights at `dist` metres; scale energy with dist**2."""
    t = Vector(target)

    def at(az, el, r):
        a, e = math.radians(az), math.radians(el)
        return t + Vector((r * math.sin(a) * math.cos(e), -r * math.cos(a) * math.cos(e), r * math.sin(e)))
    return {
        'key': area_light('key', key, 1.5, warm, at(key_azimuth, 40, dist), t),
        'fill': area_light('fill', key * fill_ratio, 2.5, cool, at(-key_azimuth * 1.5, 15, dist), t),
        'rim': area_light('rim', rim, 1.0, (1, 1, 1), at(180 + key_azimuth / 2, 50, dist), t),
    }


def studio_world(color='#1a1c20', strength=1.0):
    """A plain world colour (also the ambient light). Use an HDRI with world_hdri() for reflections."""
    w = bpy.data.worlds.new('world')
    bpy.context.scene.world = w
    if hasattr(w, 'use_nodes') and not w.use_nodes:
        w.use_nodes = True
    bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs['Color'].default_value = rgb(color)
    bg.inputs['Strength'].default_value = strength
    return w


def world_hdri(path, strength=1.0, rotation_deg=0.0):
    w = studio_world()
    nt = w.node_tree
    env = nt.nodes.new('ShaderNodeTexEnvironment')
    env.image = bpy.data.images.load(path)
    mapping, coord = nt.nodes.new('ShaderNodeMapping'), nt.nodes.new('ShaderNodeTexCoord')
    mapping.inputs['Rotation'].default_value[2] = math.radians(rotation_deg)
    bg = next(n for n in nt.nodes if n.type == 'BACKGROUND')
    nt.links.new(coord.outputs['Generated'], mapping.inputs['Vector'])
    nt.links.new(mapping.outputs['Vector'], env.inputs['Vector'])
    nt.links.new(env.outputs['Color'], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = strength
    return w


# ---------------------------------------------------------------- animation

def fcurves(id_data):
    """F-curves of an ID's action. Blender 5.0 removed Action.fcurves (layered actions only)."""
    ad = id_data.animation_data
    if not ad or not ad.action:
        return []
    act = ad.action
    if getattr(act, 'is_action_legacy', False) or not hasattr(act, 'layers'):
        return list(act.fcurves)
    out = []
    for layer in act.layers:
        for strip in layer.strips:
            cb = strip.channelbag(ad.action_slot) if ad.action_slot else None
            if cb:
                out += list(cb.fcurves)
    return out


def bake(obj, fn, shot, step=1, interpolation='LINEAR'):
    """Keyframe obj on every `step`-th shot frame (and the last) from fn(t_seconds, n) -> dict with any of
    location, look (a point to aim at), rotation (Euler radians), scale, plus 'lens' for cameras.
    Baking from a Python function keeps the motion in one place, deterministic and readable by describe.py."""
    frames = list(range(0, shot.frames, step))
    if frames[-1] != shot.frames - 1:
        frames.append(shot.frames - 1)
    for n in frames:
        sf = shot.scene_frame(n)
        p = fn(shot.t(n), n)
        if 'location' in p:
            obj.location = p['location']; obj.keyframe_insert('location', frame=sf)
        if 'look' in p:
            look_at(obj, p['look'], p.get('roll', 0.0)); obj.keyframe_insert('rotation_euler', frame=sf)
        elif 'rotation' in p:
            obj.rotation_euler = p['rotation']; obj.keyframe_insert('rotation_euler', frame=sf)
        if 'scale' in p:
            obj.scale = p['scale']; obj.keyframe_insert('scale', frame=sf)
        if 'lens' in p and obj.type == 'CAMERA':
            obj.data.lens = p['lens']; obj.data.keyframe_insert('lens', frame=sf)
    for idd in (obj, obj.data):
        for fc in fcurves(idd):
            for k in fc.keyframe_points:
                k.interpolation = interpolation
    return obj


# ---------------------------------------------------------------- presets and devices

PRESETS = {
    # name: (engine, scale of the shot size or fixed width, note)
    'layout': 'Workbench, half size: framing and timing only (solid colours, no materials or light)',
    'fast': 'EEVEE, 480 px wide, 16 samples',
    'draft': 'EEVEE, half size, 32 samples (default)',
    'cycles': 'Cycles on the GPU (CPU if none), full size, 64 samples, denoised',
    'final': "the script's own render settings (scene.py FINAL), full size",
}


def engine_id(kind):
    ids = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]
    if kind == 'EEVEE':  # 'BLENDER_EEVEE_NEXT' in 4.2-4.5, 'BLENDER_EEVEE' again from 5.0
        for i in ('BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT'):
            if i in ids: return i
        return 'BLENDER_EEVEE'
    return kind


def pick_device(scene, want='auto'):
    """Cycles device: Metal on macOS, then OptiX, CUDA, HIP, oneAPI; CPU when none is found."""
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
    except KeyError:
        scene.cycles.device = 'CPU'
        return 'CPU (cycles add-on preferences not found)'
    order = ['METAL'] if sys.platform == 'darwin' else ['OPTIX', 'CUDA', 'HIP', 'ONEAPI']
    if want != 'auto':
        order = [want.upper()]
    for kind in order:
        if want.upper() == 'CPU':
            break
        try:
            prefs.compute_device_type = kind
        except TypeError:
            continue
        (prefs.refresh_devices if hasattr(prefs, 'refresh_devices') else prefs.get_devices)()
        gpus = [d for d in prefs.devices if d.type == kind]
        if gpus:
            for d in prefs.devices:
                d.use = d.type == kind
            scene.cycles.device = 'GPU'
            return f'{kind}: ' + ', '.join(d.name for d in gpus)
    scene.cycles.device = 'CPU'
    return f'CPU ({os.cpu_count()} threads)'


def apply_preset(scene, preset, shot, final, a):
    """Engine, size, samples and colour for one preset. `final` is scene.py's FINAL dict."""
    r = scene.render
    w, h = shot.size
    scale = {'layout': 0.5, 'fast': 480 / w, 'draft': 0.5}.get(preset, 1.0)
    if a.scale: scale = a.scale
    r.resolution_x, r.resolution_y, r.resolution_percentage = max(2, round(w * scale)), max(2, round(h * scale)), 100
    r.fps = shot.fps
    note = ''
    if preset == 'layout':
        r.engine = 'BLENDER_WORKBENCH'
        sh = scene.display.shading
        sh.light, sh.color_type, sh.show_object_outline = 'STUDIO', 'MATERIAL', True
        sh.show_shadows, sh.show_cavity = True, True
        scene.display.render_aa = '8'
        scene.view_settings.view_transform = 'Standard'  # layout is for framing; never grade from it
    elif preset in ('fast', 'draft'):
        r.engine = engine_id('EEVEE')
        scene.eevee.taa_render_samples = a.samples or (16 if preset == 'fast' else 32)
    elif preset == 'cycles':
        r.engine = 'CYCLES'
        note = pick_device(scene, a.device)
        scene.cycles.samples = a.samples or 64
        scene.cycles.use_denoising = True
    elif preset == 'final':
        r.engine = final.get('engine', 'CYCLES') if final.get('engine') != 'EEVEE' else engine_id('EEVEE')
        if r.engine == 'CYCLES':
            note = pick_device(scene, a.device)
            scene.cycles.samples = a.samples or final.get('samples', 256)
            scene.cycles.use_denoising = final.get('denoise', True)
        else:
            scene.eevee.taa_render_samples = a.samples or final.get('samples', 64)
        if final.get('motion_blur'):  # 180-degree shutter; Cycles samples subframes between the baked keys
            r.use_motion_blur, r.motion_blur_shutter = True, 0.5
    else:
        raise ValueError(f'unknown preset {preset!r}; one of {list(PRESETS)}')
    if r.engine == 'CYCLES':
        scene.cycles.seed, scene.cycles.use_animated_seed = a.seed, False  # same noise every run
        r.use_persistent_data = True  # keep the BVH between frames of one run
    if preset != 'layout':
        vt = final.get('view_transform', 'AgX')
        scene.view_settings.view_transform = vt
        scene.view_settings.look = final.get('look', 'None')
        scene.view_settings.exposure = final.get('exposure', 0.0)
    # Output: PNG with the view transform baked in (composite as is in Remotion, no second curve).
    im = r.image_settings
    im.file_format = 'PNG'
    im.color_mode = 'RGBA' if r.film_transparent else 'RGB'
    im.color_depth = str(a.depth or final.get('depth', 8))
    im.compression = 15
    return note


# ---------------------------------------------------------------- entry

def parse(argv):
    import argparse
    argv = argv[argv.index('--') + 1:] if '--' in argv else []
    p = argparse.ArgumentParser(prog='scene.py', description='Build and render this shot (run by shot.py).')
    p.add_argument('--preset', default='draft', choices=list(PRESETS))
    p.add_argument('--frames', default='0', help='shot frames: 0,45,89 or 0-29 or "all"')
    p.add_argument('--out', default=None)
    p.add_argument('--size', default=None, help='WxH, e.g. 1920x1080 (default from scene.py)')
    p.add_argument('--fps', type=int, default=None)
    p.add_argument('--seconds', type=float, default=None, help='override the shot length')
    p.add_argument('--scale', type=float, default=None, help='override the preset scale')
    p.add_argument('--samples', type=int, default=None)
    p.add_argument('--depth', type=int, choices=[8, 16], default=None)
    p.add_argument('--device', default='auto', help='auto, CPU, METAL, OPTIX, CUDA, HIP, ONEAPI')
    p.add_argument('--seed', type=int, default=7)
    p.add_argument('--skip', default='', help='shot frames already on disk (shot.py passes these)')
    p.add_argument('--describe', default=None, help='write describe JSON to this path instead of rendering')
    p.add_argument('--region', default=None, help='x,y,w,h in output pixels of the full-size frame (describe)')
    p.add_argument('--save-blend', default=None, help='also save the built scene as a .blend (to open in the UI)')
    return p.parse_args(argv)


def frame_list(spec, total):
    if spec == 'all':
        return list(range(total))
    out = []
    for part in spec.split(','):
        if '-' in part.strip()[1:]:
            a, b = part.split('-', 1)
            out += range(int(a), int(b) + 1)
        elif part.strip():
            out.append(int(part))
    bad = [n for n in out if not 0 <= n < total]
    if bad:
        raise SystemExit(f'frames {bad} outside the shot (0..{total - 1}); the shot has {total} frames')
    return out


def main(build, shot, final=None):
    """Factory-reset, build the scene with build(shot), then render the requested frames or describe."""
    a = parse(sys.argv)
    final = final or {}
    random.seed(a.seed)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    shot.apply_overrides(a)
    scene = bpy.context.scene
    scene.render.fps = shot.fps
    scene.frame_start = shot.frame_start
    scene.frame_end = shot.frame_start + shot.frames - 1
    scene.render.resolution_x, scene.render.resolution_y = shot.size
    scene.unit_settings.system, scene.unit_settings.scale_length = 'METRIC', 1.0
    t = time.time()
    build(shot)
    print(f'[shot] built in {time.time() - t:.2f} s: {shot.frames} frames at {shot.fps} fps, {shot.size[0]}x{shot.size[1]}'
          + (f'; beats missing from beats.json: {shot.missing}' if shot.missing else ''), flush=True)
    if a.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.save_blend))
    if a.describe:
        sys.path.insert(0, HERE)
        import describe
        frames = frame_list(a.frames, shot.frames)
        rep = describe.report(scene, shot, frames[0], a.region)
        json.dump(rep, open(a.describe, 'w'), indent=1)
        return
    note = apply_preset(scene, a.preset, shot, final, a)
    out = os.path.abspath(a.out or here('out', a.preset))
    os.makedirs(out, exist_ok=True)
    frames = frame_list(a.frames, shot.frames)
    skip = {int(x) for x in a.skip.split(',') if x}
    todo = [n for n in frames if n not in skip]
    r = scene.render
    print(f'[shot] preset {a.preset}: {r.engine} {r.resolution_x}x{r.resolution_y} {note}; '
          f'{len(todo)} to render, {len(frames) - len(todo)} cached -> {out}', flush=True)
    times = []
    for i, n in enumerate(todo):
        scene.frame_set(shot.scene_frame(n))
        r.filepath = os.path.join(out, f'{n:04d}.png')
        t = time.time()
        bpy.ops.render.render(write_still=True)
        times.append(time.time() - t)
        left = (len(todo) - i - 1) * (sum(times) / len(times))
        print(f'[shot] frame {n} ({i + 1}/{len(todo)}): {times[-1]:.2f} s; about {left / 60:.1f} min left', flush=True)
    if times:
        # The first frame carries scene sync and kernel load; the steady rate is the rest.
        steady = sum(times[1:]) / (len(times) - 1) if len(times) > 1 else times[0]
        print(f'[shot] {len(times)} frames, {sum(times):.1f} s; {steady:.2f} s/frame steady (first {times[0]:.2f} s); '
              f'whole shot ({shot.frames} frames) at this preset: about {steady * shot.frames / 60:.1f} min', flush=True)
        json.dump({'preset': a.preset, 'engine': r.engine, 'size': [r.resolution_x, r.resolution_y],
                   'sec_per_frame': round(steady, 3), 'first_frame_sec': round(times[0], 3), 'device': note,
                   'view_transform': scene.view_settings.view_transform, 'frames_total': shot.frames,
                   'blender': bpy.app.version_string},
                  open(os.path.join(out, 'timing.json'), 'w'), indent=1)

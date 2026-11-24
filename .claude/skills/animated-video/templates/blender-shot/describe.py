# What is in frame, as JSON: the camera, each object in / partly in / out of frame (by its projected
# bounding box), its screen box, materials, whether it moves over the shot, and warnings.
#   python3 describe.py [--frame N] [--region x,y,w,h] [--out FILE]      (runs Blender through shot.py)
# x,y,w,h are pixels of the full-size output frame, y from the top (Reels captions: 0,250,1080,220).
# Screen boxes are bounding boxes, so "partly" can mean a corner of the box, and nothing here knows about
# occlusion: an object hidden behind another still reads "in". Confirm framing in a layout still.
# Inside Blender, props.main imports this file and calls report(); run on its own it calls shot.py.
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def _screen_box(scene, cam, obj, depsgraph):
    from bpy_extras.object_utils import world_to_camera_view
    from mathutils import Vector
    ev = obj.evaluated_get(depsgraph)
    local = [Vector(c) for c in ev.bound_box]
    corners = [ev.matrix_world @ c for c in local]
    pts = [world_to_camera_view(scene, cam, c) for c in corners]  # x, y in 0..1 from bottom-left; z = depth
    depth = [p.z for p in pts]
    near = cam.data.clip_start
    if max(depth) <= near:
        return None, 'behind', min(depth), max(depth)
    # Corners in front of the camera, plus where each box edge crosses the near plane (a floor that runs
    # under the camera has corners behind it; projecting only the front ones would miss most of it).
    front = [p for p in pts if p.z > near]
    for i in range(8):
        for j in range(i + 1, 8):
            if sum(abs(local[i][k] - local[j][k]) > 1e-9 for k in range(3)) != 1:
                continue  # not a box edge
            di, dj = depth[i], depth[j]
            if (di - near) * (dj - near) < 0:
                c = corners[i] + (corners[j] - corners[i]) * ((near * 1.001 - di) / (dj - di))
                front.append(world_to_camera_view(scene, cam, c))
    xs, ys = [p.x for p in front], [p.y for p in front]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    ix0, ix1, iy0, iy1 = max(x0, 0), min(x1, 1), max(y0, 0), min(y1, 1)
    if ix0 >= ix1 or iy0 >= iy1:
        state = 'out'
    elif x0 >= 0 and x1 <= 1 and y0 >= 0 and y1 <= 1:
        state = 'in'
    else:
        state = 'partly'
    return (x0, x1, y0, y1), state, min(depth), max(depth)


def _px(box, W, H):
    """Normalised camera-view box (y up) -> [x, y, w, h] pixels, y from the top, clipped to the frame."""
    x0, x1, y0, y1 = box
    cx0, cx1 = max(0, min(1, x0)), max(0, min(1, x1))
    cy0, cy1 = max(0, min(1, y0)), max(0, min(1, y1))
    return [round(cx0 * W), round((1 - cy1) * H), round((cx1 - cx0) * W), round((cy1 - cy0) * H)]


def _materials(obj):
    out = []
    for slot in getattr(obj, 'material_slots', []):
        m = slot.material
        if not m:
            continue
        d = {'name': m.name}
        nt = getattr(m, 'node_tree', None)
        b = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None) if nt else None
        if b:
            c = b.inputs['Base Color'].default_value
            d['base_linear'] = [round(v, 3) for v in c[:3]]
            d['rough'] = round(b.inputs['Roughness'].default_value, 3)
            d['metal'] = round(b.inputs['Metallic'].default_value, 3)
            if b.inputs['Base Color'].is_linked:
                d['base_linear'] = 'texture'
        if nt:
            for n in nt.nodes:
                if n.type == 'TEX_IMAGE' and n.image and not n.image.has_data and not os.path.exists(
                        __import__('bpy').path.abspath(n.image.filepath)):
                    d.setdefault('missing_images', []).append(n.image.filepath)
        out.append(d)
    return out


def report(scene, shot, n=0, region=None):
    import bpy
    W, H = shot.size
    cam = scene.camera
    warnings = []
    if not cam:
        return {'error': 'no scene camera', 'warnings': ['set bpy.context.scene.camera']}
    # Motion: sample each object's world matrix at start, middle and end of the shot.
    samples = sorted({0, shot.frames // 2, shot.frames - 1})
    mats = {}
    for s in samples:
        scene.frame_set(shot.scene_frame(s))
        for o in scene.objects:
            mats.setdefault(o.name, []).append(o.matrix_world.copy())
    lens_moves = cam.data.animation_data is not None and cam.data.animation_data.action is not None
    scene.frame_set(shot.scene_frame(n))
    dg = bpy.context.evaluated_depsgraph_get()

    def moved(name):
        ms = mats.get(name, [])
        return any(max(abs(a[i][j] - ms[0][i][j]) for i in range(4) for j in range(4)) > 1e-5 for a in ms[1:])

    cd = cam.data
    vt = scene.view_settings.view_transform
    rep = {
        'frame': n, 'scene_frame': shot.scene_frame(n), 'shot_frames': shot.frames, 'fps': shot.fps,
        'size': [W, H], 'seconds': round(shot.t(n), 3),
        'camera': {'name': cam.name, 'location': [round(v, 3) for v in cam.matrix_world.translation],
                   'lens_mm': round(cd.lens, 2), 'sensor_mm': cd.sensor_width, 'clip': [cd.clip_start, cd.clip_end],
                   'dof': [round(cd.dof.focus_distance, 3), cd.dof.aperture_fstop] if cd.dof.use_dof else None,
                   'animated': moved(cam.name) or lens_moves},
        'render': {'film_transparent': scene.render.film_transparent, 'view_transform': vt,
                   'look': scene.view_settings.look, 'exposure': scene.view_settings.exposure},
        'objects': [], 'lights': [],
    }
    reg = None
    if region:
        rx, ry, rw, rh = [float(v) for v in region.split(',')]
        reg = (rx / W, (rx + rw) / W, 1 - (ry + rh) / H, 1 - ry / H)  # to normalised, y up
        rep['region'] = {'box_px': [rx, ry, rw, rh], 'objects': []}
    for o in scene.objects:
        if o.type == 'LIGHT':
            rep['lights'].append({'name': o.name, 'type': o.data.type, 'watts': round(o.data.energy, 1),
                                  'color': [round(c, 3) for c in o.data.color],
                                  'location': [round(v, 3) for v in o.matrix_world.translation],
                                  'animated': moved(o.name)})
            if o.data.energy <= 0:
                warnings.append(f'light {o.name} has no energy')
            continue
        if o.type not in ('MESH', 'CURVE', 'FONT', 'SURFACE', 'META', 'CURVES', 'POINTCLOUD', 'VOLUME'):
            continue
        if o.hide_render:
            continue
        box, state, dmin, dmax = _screen_box(scene, cam, o, dg)
        d = {'name': o.name, 'type': o.type, 'state': state, 'animated': moved(o.name),
             'depth_m': [round(dmin, 3), round(dmax, 3)], 'materials': _materials(o)}
        if box and state != 'out':
            d['box_px'] = _px(box, W, H)
            bw, bh = max(0, min(box[1], 1) - max(box[0], 0)), max(0, min(box[3], 1) - max(box[2], 0))
            d['frame_cover'] = round(bw * bh, 4)  # share of the frame its box covers
        if not d['materials'] and o.type in ('MESH', 'FONT', 'CURVE'):
            warnings.append(f'{o.name} has no material (renders default grey)')
        for m in d['materials']:
            for p in m.get('missing_images', []):
                warnings.append(f'{o.name}: image not found {p} (build paths with props.here())')
        if dmax > cd.clip_end:
            warnings.append(f'{o.name} reaches {dmax:.1f} m, past the camera clip end {cd.clip_end} m')
        ev = o.evaluated_get(dg)
        lc = ev.matrix_world.inverted() @ cam.matrix_world.translation
        bb = ev.bound_box
        if all(min(c[i] for c in bb) - 1e-3 <= lc[i] <= max(c[i] for c in bb) + 1e-3 for i in range(3)):
            warnings.append(f'camera is inside the bounding box of {o.name}')
        if reg and box and state != 'out':
            ox0, ox1 = max(box[0], reg[0]), min(box[1], reg[1])
            oy0, oy1 = max(box[2], reg[2]), min(box[3], reg[3])
            if ox0 < ox1 and oy0 < oy1:
                area = (ox1 - ox0) * (oy1 - oy0)
                rep['region']['objects'].append({'name': o.name, 'share_of_region': round(area / ((reg[1] - reg[0]) * (reg[3] - reg[2])), 3)})
        # Reels UI covers the top ~220 px and bottom ~420 px of a 1080x1920 frame (remotion-pipeline.md).
        if (W, H) == (1080, 1920) and box and state != 'out' and d.get('frame_cover', 0) > 0.002:
            top = (1 - min(box[3], 1)) * H
            bottom = (1 - max(box[2], 0)) * H
            if top < 220 and bottom > 220 and o.name not in ('floor',):
                d['note'] = 'crosses the top 220 px Reels UI band'
        rep['objects'].append(d)
    if not any(o['state'] in ('in', 'partly') for o in rep['objects']):
        warnings.append('nothing is in frame')
    if not scene.render.film_transparent and scene.world is None:
        warnings.append('no world: the background renders black')
    if vt not in ('AgX', 'Filmic', 'Standard', 'Khronos PBR Neutral'):
        warnings.append(f'view transform {vt}: PNG output bakes this curve in; composite it with no second curve')
    if not rep['lights'] and (scene.world is None):
        warnings.append('no lights and no world: the frame will be black')
    rep['warnings'] = warnings
    return rep


def main():
    import argparse
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--frame', type=int, default=0, help='shot frame (0-based)')
    p.add_argument('--region', default=None, help='x,y,w,h pixels, y from the top')
    p.add_argument('--out', default=None, help='also keep the JSON here')
    a, rest = p.parse_known_args()
    out = a.out or os.path.join(HERE, 'out', f'describe-{a.frame:04d}.json')
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    cmd = [sys.executable, os.path.join(HERE, 'shot.py'), '--describe', out, '--frames', str(a.frame)]
    if a.region:
        cmd += ['--region', a.region]
    r = subprocess.run(cmd + rest)
    if r.returncode:
        sys.exit(r.returncode)
    print(open(out).read())


if __name__ == '__main__' and 'bpy' not in sys.modules:
    main()

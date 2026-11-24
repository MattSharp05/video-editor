# Example Blender shot: a rounded box drops onto a plinth under a three-point light while the camera orbits.
# This file builds the WHOLE scene from an empty factory file every run: no .blend is the source of truth.
# Run it through shot.py (python3 shot.py --preset layout --frames 0,45,89), never by hand in the UI.
#
# Timing: SHOT spans beats START..END of an optional beats.json next to this file (symlink the film's
# src/beats.json); without it the shot is DEFAULT_LEN seconds. Plate file NNNN.png is shot frame N, which is
# scene frame frame_start + N; in Remotion the plate goes on a <Sequence from={f(beats[START])}>.
# Everything random is seeded (props.main seeds `random`, Cycles' seed is fixed and not animated).
import math, os, random, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # Blender does not put the script's folder on sys.path
import props
from props import Shot, ease, ease_out, material, assign

SHOT = Shot(start='product', end='product_end', default_len=4.0, fps=30, size=(1080, 1920))
LAND = 'product_land'           # beat at which the box touches down; shot start + 0.8 s when missing
FINAL = dict(engine='CYCLES', samples=256, denoise=True, view_transform='AgX', look='None', exposure=0.0, depth=8,
             motion_blur=False)
TRANSPARENT = False             # True: no floor or world in the picture, RGBA PNG for compositing over Remotion


def build(shot):
    import bpy
    scene = bpy.context.scene
    scene.render.film_transparent = TRANSPARENT
    props.studio_world('#15171b', 0.6)

    # Set, in metres. Plinth 60 cm across, box 24 x 24 x 30 cm.
    floor = assign(props.plane('floor', 40), material('floor', '#202226', rough=0.65, spec=0.3))
    floor.is_shadow_catcher = TRANSPARENT  # with TRANSPARENT the floor keeps only its shadow
    plinth = assign(props.cylinder('plinth', radius=0.30, depth=0.40, location=(0, 0, 0.20)),
                    material('plinth', '#d9d4cc', rough=0.45))
    box = assign(props.rounded_box('box', size=(0.24, 0.24, 0.30), radius=0.035),
                 material('box', '#e2572b', rough=0.28, coat=0.6, coat_rough=0.08))

    # A little seeded clutter so a re-run proves determinism (same seed -> same pebbles).
    stone = material('pebble', '#5a5650', rough=0.8)
    for i in range(7):
        a, r = random.uniform(0, 2 * math.pi), random.uniform(0.45, 0.9)
        s = random.uniform(0.015, 0.035)
        p = assign(props.rounded_box(f'pebble{i}', size=(s * 1.4, s, s * 0.7), radius=s * 0.3, segments=3,
                                     location=(r * math.cos(a), r * math.sin(a), s * 0.35)), stone)
        p.rotation_euler.z = random.uniform(0, math.pi)

    props.three_point(target=(0, 0, 0.55), dist=3.0, key=140, fill_ratio=0.3, rim=220)

    # Box: drops 25 cm and settles on the plinth top (z 0.40 + half height), easing out from LAND.
    land = shot.f(LAND) if LAND in shot.beats else 0.8 * shot.fps
    rest = 0.40 + 0.15

    def box_pose(t, n):
        k = ease_out((n - (land - 0.6 * shot.fps)) / (0.6 * shot.fps))
        return {'location': (0, 0, rest + 0.25 * (1 - k)), 'rotation': (0, 0, math.radians(-25 + 20 * ease(n / shot.frames)))}
    props.bake(box, box_pose, shot)

    # Camera: 50 mm, 2.4 m from the plinth axis, orbiting 30 degrees over the shot, slightly above the box.
    cam = props.camera(lens=50, location=(0, -2.4, 1.0), target=(0, 0, 0.52))

    def orbit(t, n):
        a = math.radians(-15 + 30 * ease(n / max(1, shot.frames - 1)))
        return {'location': (2.4 * math.sin(a), -2.4 * math.cos(a), 0.95), 'look': (0, 0, 0.50)}
    props.bake(cam, orbit, shot)


if __name__ == '__main__':
    props.main(build, SHOT, FINAL)

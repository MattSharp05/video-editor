#!/usr/bin/env python3
# One entry point for a Blender shot. Runs with the system Python (no bpy needed) and starts Blender:
#   python3 shot.py --preset layout --frames 0,45,89          framing stills -> out/layout/
#   python3 shot.py --preset fast --frames 0-29               time a 30-frame test before longer runs
#   python3 shot.py --preset final --all --out ../../public/out/plates/box   the plate for Remotion
#   python3 shot.py --describe out/d.json --frames 45 [--region 0,250,1080,220]   (describe.py wraps this)
# Presets: layout (Workbench, half size), fast (EEVEE 480 px wide), draft (EEVEE half size, default),
# cycles (Cycles on Metal/OptiX/CUDA/HIP if present, else CPU; 64 samples), final (scene.py's FINAL).
# Other flags pass through to scene.py: --size WxH --fps N --seconds S --samples N --depth 8|16
# --device CPU|METAL|... --seed N --scale F --save-blend FILE. --force re-renders frames already on disk.
#
# It runs `blender -b --factory-startup --python scene.py -- ...` (Blender from $BLENDER, PATH or
# /Applications/Blender.app), or, with no Blender, a Python that has the `bpy` wheel ($BPY_PYTHON).
# Cache: the key is a hash of every file in this folder (out/ excluded; symlinks followed, so a linked
# beats.json counts) plus the render flags. Frames already in --out with the same key are skipped; a changed
# key re-renders them. Keep each shot in its own folder so an edit elsewhere leaves its cache alone.
# On a Python error it prints the file, line, source line and a hint instead of Blender's whole log.
import hashlib, json, os, re, shutil, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
SCENE = os.path.join(HERE, 'scene.py')


def find_blender():
    """('blender', path) or ('bpy', python) or (None, why)."""
    for c in (os.environ.get('BLENDER'), shutil.which('blender'),
              '/Applications/Blender.app/Contents/MacOS/Blender'):
        if c and os.path.exists(c):
            return 'blender', c
    for py in (os.environ.get('BPY_PYTHON'), sys.executable):
        if py and subprocess.run([py, '-c', 'import bpy'], capture_output=True).returncode == 0:
            return 'bpy', py
    return None, 'no Blender: set BLENDER=/path/to/blender, put blender on PATH, or BPY_PYTHON to a Python with `pip install bpy`'


def folder_hash(root, extra):
    h = hashlib.sha256(json.dumps(extra, sort_keys=True).encode())
    for d, dirs, files in os.walk(root, followlinks=True):
        dirs[:] = sorted(x for x in dirs if x not in ('out', '__pycache__', '.git'))
        for f in sorted(files):
            if f.endswith(('.blend1', '.pyc')) or f.startswith('.'):
                continue
            p = os.path.join(d, f)
            h.update(os.path.relpath(p, root).encode())
            with open(p, 'rb') as fh:
                h.update(hashlib.sha256(fh.read()).digest())
    return h.hexdigest()[:16]


# Error messages seen across Blender 4.x -> 5.x API changes, and what to do.
HINTS = [
    (r"has no attribute 'fcurves'", "Blender 5.0 removed Action.fcurves (layered actions): use props.fcurves(obj)."),
    (r"BLENDER_EEVEE_NEXT", "EEVEE's id is 'BLENDER_EEVEE' again from 5.0 ('BLENDER_EEVEE_NEXT' in 4.2-4.5): use props.engine_id('EEVEE')."),
    (r"use_auto_smooth", "Auto smooth was removed in 4.1: use mesh.shade_smooth() and a bevel with harden_normals, or a 'Smooth by Angle' modifier."),
    (r'["\'](Specular|Subsurface|Emission|Transmission|Sheen|Clearcoat)["\']', "Principled BSDF inputs were renamed in 4.0: Specular IOR Level, Subsurface Weight, Emission Color, Transmission Weight, Sheen Weight, Coat Weight (props.material takes spec=, emit=, coat=...)."),
    (r"Principled BSDF has no input", "Use an input name from the list in the message, or a props.material alias."),
    (r"ShaderNodeTexMusgrave", "The Musgrave texture was merged into Noise Texture in 4.1 (ShaderNodeTexNoise with its detail inputs)."),
    (r"context is incorrect|poll\(\) failed", "Operators need a UI context that -b does not have: use the data API (bpy.data, bmesh) or props helpers instead of bpy.ops."),
    (r"No such file or directory|Cannot read file|not found", "Blender runs from another folder: build paths with props.here('file') (os.path.dirname(__file__)); if the path is right, the file is missing."),
    (r"No module named 'props'", "Keep props.py beside scene.py and the sys.path.insert line at the top of scene.py."),
    (r"enum .* not found in|not found in \(", "An enum value changed name between Blender versions: the message lists the valid ones."),
    (r"'(\w+)' object has no attribute '(\w+)'", "The property moved or was renamed in this Blender version: check bpy.app.version and the API docs for that type."),
]


def explain(log):
    """File, line, source and a hint for the last Python traceback in Blender's output, or None."""
    i = log.rfind('Traceback (most recent call last)')
    if i < 0:
        m = re.search(r'^(Error: Python: .*|.*Error: .*)$', log, re.M)
        return None if not m else f'[shot] {m.group(1)}'
    tb = log[i:].splitlines()
    frames = [(m.group(1), int(m.group(2)), m.group(3)) for m in
              (re.match(r'\s*File "(.+)", line (\d+), in (.+)', l) for l in tb) if m]
    err = next((l for l in tb[1:] if re.match(r'^[A-Za-z_.]+(Error|Exception|Exit)\b|^\w+Error:', l)), tb[-1])
    ours = [f for f in frames if f[0].startswith(HERE)] or frames
    err = err.strip()
    lines = ['[shot] Python error: ' + (err if len(err) < 600 else err[:600] + ' ...')]
    for path, ln, fn in ours[-3:]:
        src = ''
        try:
            src = open(path).read().splitlines()[ln - 1].strip()
        except Exception:
            pass
        lines.append(f'  {os.path.relpath(path, HERE) if path.startswith(HERE) else path}:{ln} in {fn}: {src}')
    for pat, hint in HINTS:
        if re.search(pat, err):
            lines.append('  hint: ' + hint)
            break
    return '\n'.join(lines)


def _frames(spec):
    out = []
    for part in spec.split(','):
        part = part.strip()
        if '-' in part[1:]:
            a, b = part.split('-', 1)
            out += range(int(a), int(b) + 1)
        elif part:
            out.append(int(part))
    return out


def main():
    argv = sys.argv[1:]
    flag = lambda name, default=None: argv[argv.index(name) + 1] if name in argv else default
    force = '--force' in argv
    verbose = '--verbose' in argv
    argv = [a for a in argv if a not in ('--force', '--verbose')]
    if '--all' in argv:
        i = argv.index('--all')
        argv[i:i + 1] = ['--frames', 'all']
    preset = flag('--preset', 'draft')
    describe = flag('--describe')
    out = os.path.abspath(flag('--out') or os.path.join(HERE, 'out', preset))
    if '--out' in argv:
        argv[argv.index('--out') + 1] = out
    else:
        argv += ['--out', out]

    kind, exe = find_blender()
    if not kind:
        sys.exit('[shot] ' + exe)

    # Cache: skip frames already rendered from the same folder contents and flags.
    # The key holds the flags that change pixels; which frames are asked for is not part of it.
    keyargs, skip_next = [], False
    for a in argv:
        if skip_next:
            skip_next = False
        elif a in ('--frames', '--out', '--describe', '--region'):
            skip_next = True
        else:
            keyargs.append(a)
    key = folder_hash(HERE, {'args': keyargs, 'preset': preset})
    keyfile = os.path.join(out, '.shot-key')
    if not describe:
        os.makedirs(out, exist_ok=True)
        old = open(keyfile).read().strip() if os.path.exists(keyfile) else None
        if old != key or force:
            for f in os.listdir(out):  # stale frames would mix two versions of the shot in one plate
                if re.fullmatch(r'\d{4}\.png', f):
                    os.remove(os.path.join(out, f))
        open(keyfile, 'w').write(key + '\n')  # before rendering, so an interrupted run resumes
        done = sorted(int(f[:4]) for f in os.listdir(out) if re.fullmatch(r'\d{4}\.png', f))
        if done:
            argv += ['--skip', ','.join(map(str, done))]
        want = flag('--frames', '0')
        if want != 'all' and set(_frames(want)) <= set(done):
            print(f'[shot] all {len(_frames(want))} frames cached in {out} (key {key}); --force to re-render')
            return

    cmd = ([exe, '-b', '--factory-startup', '-noaudio', '--python-exit-code', '1', '--python', SCENE, '--'] if kind == 'blender'
           else [exe, SCENE, '--']) + argv
    print(f'[shot] {kind}: {exe}', flush=True)
    t0 = time.time()
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    log = []
    for line in p.stdout:
        log.append(line)
        # Blender prints a progress line per tile and sample; keep ours, errors and warnings.
        if verbose or line.startswith('[shot]') or (re.search(r'WARNING|Warning:', line) and not re.search(r'CUEW|HIPEW', line)):
            print(line, end='', flush=True)
    p.wait()
    text = ''.join(log)
    if p.returncode or 'Traceback (most recent call last)' in text:
        msg = explain(text)
        print(msg or '\n'.join(log[-30:]), file=sys.stderr)
        sys.exit(p.returncode or 1)
    print(f'[shot] done in {time.time() - t0:.1f} s (including Blender start and scene build)', flush=True)


if __name__ == '__main__':
    main()

#!/bin/bash
# Mute-test frames: captions off, 2 fps, 0.4 scale, timestamped sheets of 12 (references/review.md#mute-test).
# usage: ./mute.sh <outdir> [from_s] [to_s]
set -e; cd "$(dirname "$0")"; out=$1; a=${2:-0}; b=${3:-51}; mkdir -p "$out"
b_=$(mktemp -d)/bundle; npx remotion bundle src/index.ts --out-dir "$b_" --log=error >/dev/null
python3 -c "
a,b=$a,$b
t=a
while t<=b: print(f'{t:.1f}'); t+=0.5" | xargs -P 3 -I{} sh -c 'npx remotion still "$0" Film "$1/m{}.png" --frame=$(python3 -c "print(min(1530,round({}*30)))") --scale=0.4 --props="{\"captions\":false}" --log=error >/dev/null' "$b_" "$out"
rm -rf "$(dirname "$b_")"
ls $out/m*.png | sort -t m -k2 -g > /dev/null
python3 - "$out" <<'PY'
import sys, glob, re
from PIL import Image, ImageDraw
out = sys.argv[1]
fs = sorted(glob.glob(f'{out}/m*.png'), key=lambda f: float(re.findall(r'm([\d.]+)\.png', f)[0]))
for k in range(0, len(fs), 12):
    grp = fs[k:k + 12]; ims = [Image.open(f) for f in grp]; w, h = ims[0].size
    sh = Image.new('RGB', (w * 6, (h + 30) * 2), 'white'); d = ImageDraw.Draw(sh)
    for i, (f, im) in enumerate(zip(grp, ims)):
        x, y = (i % 6) * w, (i // 6) * (h + 30); sh.paste(im, (x, y + 30)); d.text((x + 8, y + 6), 't=' + re.findall(r'm([\d.]+)\.png', f)[0] + 's', fill='black')
    sh.save(f'{out}/sheet_{k // 12:02d}.png')
print('sheets', (len(fs) + 11) // 12)
PY

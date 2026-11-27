# Mute-test sheets (references/review.md#mute-test): timestamped contact sheets of a film with the caption band
# blacked out, for a fresh judge who has never seen the script. On-screen cards in the picture stay: they are part of
# the film; only the narration's captions are hidden.
#
#   python3 mute_sheets.py CUT.mp4 OUTDIR [--fps 2] [--band 230:300]
#       frames from a render (no re-render needed: the caption band is painted black)
#   python3 mute_sheets.py STILLS_DIR OUTDIR
#       stills rendered with --props='{"captions":false}' named t<sec>.png (snap.sh) or s_<sec>.png; times from names
#   -> OUTDIR/sheet_N.jpg (24 tiles each, labelled with seconds) + OUTDIR/f_NNN.jpg singles for close looks.
# --band TOP:HEIGHT in pixels of the 1080x1920 frame (default 230:300: the template captions at y 250 + their scrim).
import glob, os, re, subprocess, sys
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
arg = lambda k, d: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
fps = float(arg('--fps', 2)); top, hgt = map(int, arg('--band', '230:300').split(':'))
os.makedirs(out, exist_ok=True)
if os.path.isdir(src):  # stills: black out the band only if captions were left on by mistake is the caller's choice
    files = sorted(glob.glob(f'{src}/*.png'), key=lambda p: float(re.findall(r'[\d.]+', os.path.basename(p).replace('.png', ''))[-1]))
    items = []
    for i, p in enumerate(files):
        t = float(re.findall(r'[\d.]+', os.path.basename(p).replace('.png', ''))[-1])
        im = Image.open(p).convert('RGB'); s = im.width / 1080
        ImageDraw.Draw(im).rectangle([0, top * s, im.width, (top + hgt) * s], fill='black')
        f = f'{out}/f_{i + 1:03d}.jpg'; im.save(f, quality=85); items.append((t, f))
else:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf',
                    f'fps={fps},drawbox=x=0:y={top}:w=1080:h={hgt}:color=black:t=fill,scale=270:-1', f'{out}/f_%03d.jpg'], check=True)
    fs = sorted(glob.glob(f'{out}/f_*.jpg'))
    items = [(i / fps, f) for i, f in enumerate(fs)]
W, H, cols, per = 270, 480, 8, 24
for k in range(0, len(items), per):
    part = items[k:k + per]; rows = (len(part) + cols - 1) // cols
    sh = Image.new('RGB', (cols * W, rows * (H + 22)), 'white')
    for i, (t, f) in enumerate(part):
        x, y = (i % cols) * W, (i // cols) * (H + 22)
        sh.paste(Image.open(f).convert('RGB').resize((W, H)), (x, y + 22)); ImageDraw.Draw(sh).text((x + 6, y + 5), f'{t:.1f}s', fill='black')
    sh.save(f'{out}/sheet_{k // per}.jpg', quality=85)
print(f'{len(items)} frames -> {out}/sheet_*.jpg')

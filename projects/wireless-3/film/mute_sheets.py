# Mute-test sheets: frames at 2 fps from a captions-off muted render, labelled with their time, 4×3 per sheet.
# usage: python3 mute_sheets.py out/mute.mp4 out/mute   -> out/mute/sheet_NN.jpg
import os, subprocess, sys, glob
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out + '/f', exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', 'fps=2,scale=270:-1', out + '/f/%04d.jpg'], check=True)
fs = sorted(glob.glob(out + '/f/*.jpg')); per = 12
for k in range(0, len(fs), per):
    group = fs[k:k + per]; W, H = 270, 480
    sh = Image.new('RGB', (4 * W, 3 * (H + 26)), 'white')
    for i, p in enumerate(group):
        n = int(os.path.basename(p)[:4]); t = (n - 1) / 2
        x, y = (i % 4) * W, (i // 4) * (H + 26)
        sh.paste(Image.open(p), (x, y + 26)); ImageDraw.Draw(sh).text((x + 6, y + 6), f't = {t:.1f} s', fill='black')
    sh.save(f'{out}/sheet_{k // per:02d}.jpg', quality=85)
print(len(fs), 'frames,', (len(fs) + per - 1) // per, 'sheets')

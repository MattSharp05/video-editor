#!/usr/bin/env python3
"""Join labelled tiles into one comparison sheet: sheet_compare.py OUT.jpg TITLE tile.png:label:sub ..."""
import sys
from PIL import Image, ImageDraw, ImageFont
out, title, tiles = sys.argv[1], sys.argv[2], [t.split('::') for t in sys.argv[3:]]
W = 480; ims = []
for f, *lab in tiles:
    im = Image.open(f).convert('RGB'); im.thumbnail((W, 640)); ims.append((im, lab))
H = max(i.height for i, _ in ims)
c = Image.new('RGB', (W * len(ims), H + 110), (24, 22, 20)); d = ImageDraw.Draw(c)
fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22); f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17)
d.text((12, 8), title, fill=(240, 240, 240), font=fb)
for k, (im, lab) in enumerate(ims):
    c.paste(im, (k * W + (W - im.width) // 2, 44))
    for j, t in enumerate(lab): d.text((k * W + 10, H + 50 + j * 24), t[:46], fill=(235, 235, 235) if j == 0 else (170, 170, 170), font=fb if j == 0 else f)
c.save(out, quality=88)

# Contact sheet of stills sorted by time: python3 sheet2.py DIR OUTPREFIX [per_sheet]
import glob, sys
from PIL import Image, ImageDraw
d, pre = sys.argv[1], sys.argv[2]; per = int(sys.argv[3]) if len(sys.argv) > 3 else 13
fs = sorted(glob.glob(f'{d}/s_*.png'), key=lambda p: float(p.split('s_')[1][:-4]))
def sheet(files, out, cols=7, W=270):
    H = int(W * 16 / 9); rows = (len(files) + cols - 1) // cols
    s = Image.new('RGB', (cols * W, rows * (H + 22)), 'white')
    for i, p in enumerate(files):
        x, y = (i % cols) * W, (i // cols) * (H + 22)
        s.paste(Image.open(p).convert('RGB').resize((W, H)), (x, y + 22)); ImageDraw.Draw(s).text((x + 6, y + 5), p.split('s_')[1][:-4], fill='black')
    s.save(out)
for k in range(0, len(fs), per): sheet(fs[k:k + per], f'{pre}{k // per}.png')

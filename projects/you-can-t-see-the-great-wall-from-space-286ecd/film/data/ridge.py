# The wall's path: cheapest path along high ground between two ridge points of dem.npy (cost rises fast below the
# local ridge), smoothed. Writes wall_path.json in metres (x east, z south, y elevation) about the DEM centre.
import json, heapq, numpy as np
from scipy.ndimage import gaussian_filter, maximum_filter
d = np.load('dem.npy'); meta = json.load(open('dem.json')); N = d.shape[0]; px = meta['size_km'] * 1000 / N
s = gaussian_filter(d, 1.5); loc = maximum_filter(s, 41)
cost = 1 + ((loc - s) / 12.0) ** 2           # metres below the local ridge top
A, B = (280, 580), (590, 980)                 # (row, col) in 1024 px: ridge west of the summit -> summit
def snap(p):
    r, c = p; w = s[r-15:r+16, c-15:c+16]; k = np.unravel_index(w.argmax(), w.shape); return (r-15+k[0], c-15+k[1])
A, B = snap(A), snap(B)
dist = np.full(d.shape, np.inf); prev = {}; dist[A] = 0; h = [(0, A)]
while h:
    c0, p = heapq.heappop(h)
    if p == B: break
    if c0 > dist[p]: continue
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            q = (p[0]+dr, p[1]+dc)
            if (dr or dc) and 0 <= q[0] < N and 0 <= q[1] < N:
                nc = c0 + cost[q] * (1.414 if dr and dc else 1)
                if nc < dist[q]: dist[q] = nc; prev[q] = p; heapq.heappush(h, (nc, q))
path = [B]
while path[-1] != A: path.append(prev[path[-1]])
path = np.array(path[::-1], float)
from scipy.ndimage import gaussian_filter1d
path = np.stack([gaussian_filter1d(path[:, 0], 4, mode='nearest'), gaussian_filter1d(path[:, 1], 4, mode='nearest')], 1)[::3]
pts = [[(c - N/2) * px, float(s[int(round(r)), int(round(c))]), (r - N/2) * px] for r, c in path]
json.dump({'px_m': px, 'points': pts}, open('wall_path.json', 'w'))
L = sum(np.hypot(pts[i+1][0]-pts[i][0], pts[i+1][2]-pts[i][2]) for i in range(len(pts)-1))
print(len(pts), 'points', round(L), 'm', 'A', A, 'B', B)
from PIL import Image, ImageDraw
im = Image.open('/tmp/bf/dem.png').convert('RGB'); dr = ImageDraw.Draw(im)
dr.line([(c/2, r/2) for r, c in path], fill=(255, 160, 0), width=3); im.save('/tmp/bf/dem_path.png')

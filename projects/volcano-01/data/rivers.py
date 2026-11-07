# Lava river paths on Kilauea (picture of "the lava pours out in glowing rivers"): steepest descent over the real DEM
# from vents on the summit caldera's south rim and the upper east rift. Writes ../film/public/kil13_rivers.json (u,v,elev m).
import json, numpy as np
from scipy import ndimage as nd
d = nd.gaussian_filter(np.load('kil13_dem.npy'), 3.0); N = d.shape[0]
VENTS = [(0.40, 0.53), (0.37, 0.55), (0.34, 0.50), (0.42, 0.57), (0.31, 0.47)]   # (u, v): south and south-west of the caldera (flows run SW, as in 1971 and 1974)
rng = np.random.default_rng(3); out = []
for (u, v) in VENTS:
    r, c = v * N, u * N; path = []; pr, pc = 0.0, 0.0
    for k in range(4000):
        ri, ci = int(r), int(c)
        if not (2 < ri < N - 3 and 2 < ci < N - 3): break
        gy, gx = (d[ri + 1, ci] - d[ri - 1, ci]) / 2, (d[ri, ci + 1] - d[ri, ci - 1]) / 2
        g = np.hypot(gx, gy) + 1e-6
        dr, dc = -gy / g, -gx / g
        dr = dr + 1.2 * pr + rng.normal(0, 0.3); dc = dc + 1.2 * pc + rng.normal(0, 0.3); n = np.hypot(dr, dc); dr, dc = dr / n, dc / n; pr, pc = dr, dc
        r += dr * 1.5; c += dc * 1.5
        if k % 6 == 0: path.append([round(float(c) / N, 4), round(float(r) / N, 4), round(float(d[ri, ci]), 1)])
        if len(path) > 140: break
    out.append(path); print(len(path), path[-1])
json.dump(out, open('../film/public/kil13_rivers.json', 'w'))

# Heightfields for the film (run from data/ after fetch.py):
#   helens: today's DEM (post-1980) + a reconstructed pre-1980 cone (labelled "reconstructed" in the film):
#     the summit (2,950 m, USGS) refilled over today's crater and the north-side landslide scar from a cone fitted to
#     the surviving south/east/west flanks, with fine radial gullies; elsewhere the real DEM.
#   Writes ../film/public/<site>_h.bin (float32, G x G, metres), <site>.json meta, and bakes normals + light.
import json, sys, numpy as np
from scipy import ndimage as nd
from PIL import Image
G = 384
def down(a): return nd.zoom(nd.gaussian_filter(a, 1.0), G / a.shape[0], order=1).astype(np.float32)
out = {}
for site in ['kil13', 'helens']:
    d = np.load(f'{site}_dem.npy'); m = json.load(open(f'{site}.json')); N = d.shape[0]; cell = m['size_km'] / N * 1000
    fields = {'h': d}
    if site == 'helens':
        pr, pc = 527, 431; R, C = np.mgrid[0:N, 0:N]
        mask = (np.hypot(R - pr, C - pc) * cell < 2200) & (d < 2150) & (R < pr)
        cr, cc = (R[mask].mean() + pr) / 2 + 5, C[mask].mean()
        rho = np.hypot(R - cr, C - cc) * cell; ang = np.arctan2(-(R - cr), C - cc)   # 0 = east, +pi/2 = north
        sel = (rho > 1600) & (rho < 5000) & (np.sin(ang) < 0.2)
        p = np.polyfit(rho[sel], d[sel], 2)
        cone = np.where(rho < 1600, 2950 - (2950 - np.polyval(p, 1600)) * (rho / 1600) ** 1.6, np.polyval(p, rho))
        cone += 18 * np.sin(ang * 46 + 3 * np.sin(ang * 7)) * np.clip(rho / 1600, 0, 1)            # radial gullies
        north = np.clip((np.sin(ang) - 0.05) / 0.5, 0, 1)                                          # the landslide sector
        reach = np.clip((1700 + 2300 * north - rho) / 500, 0, 1)
        fill = np.clip(cone - d, 0, None) * reach
        fields['pre'] = d + fill
        m['crater'] = [float(cc / N), float(cr / N)]          # (u, v) of the old summit in the square
        print('helens pre max', fields['pre'].max())
    meta = {'G': G, 'size_km': m['size_km'], 'min_m': m['min_m'], 'max_m': m['max_m'], **({'crater': m['crater']} if 'crater' in m else {})}
    for k, a in fields.items():
        down(a).tofile(f'../film/public/{site}_{k}.bin')
    json.dump(meta, open(f'../film/public/{site}.json', 'w'))
    # bake: normals (object space, x east, y up, z south) and soft sun shadow + AO, from the full-res post DEM
    for k, a in fields.items():
        Y = nd.gaussian_filter(a, 0.7) / 1000 * 1.0; ck = cell / 1000
        gz, gx = np.gradient(Y, ck)
        n = np.stack([-gx, np.ones_like(Y), -gz], -1); n /= np.linalg.norm(n, axis=-1, keepdims=True)
        Image.fromarray(((n * 0.5 + 0.5) * 255).astype(np.uint8)).resize((1024, 1024)).save(f'../film/public/{site}_{k}_n.png')
        SUN = np.array([-0.55, 0.5, 0.65]); SUN /= np.linalg.norm(SUN)      # morning-ish, from the south-east... x east,z south
        SUN = np.array([0.55, 0.45, 0.70]); SUN /= np.linalg.norm(SUN)
        rows, cols = np.mgrid[0:N, 0:N].astype(np.float32)
        hdir = np.array([SUN[2], SUN[0]]); hdir /= np.linalg.norm(hdir); tan_e = SUN[1] / np.hypot(SUN[0], SUN[2])
        sh = np.ones_like(Y)
        for s in np.geomspace(0.03, 6.0, 48):
            v = nd.map_coordinates(Y, [rows + hdir[0] * s / ck, cols + hdir[1] * s / ck], order=1, mode='nearest')
            sh = np.minimum(sh, np.clip(((Y + s * tan_e) - v) / (0.06 * s) * 0.5 + 0.5, 0, 1))
        ao = np.zeros_like(Y)
        for a2 in np.linspace(0, 2 * np.pi, 10, endpoint=False):
            hor = np.zeros_like(Y)
            for s in np.geomspace(0.03, 2.0, 14):
                hor = np.maximum(hor, (nd.map_coordinates(Y, [rows + np.sin(a2) * s / ck, cols + np.cos(a2) * s / ck], order=1, mode='nearest') - Y) / s)
            ao += np.sin(np.arctan(hor))
        ao = np.clip(1 - ao / 10, 0, 1)
        Image.fromarray((np.stack([sh, ao, np.zeros_like(Y)], -1) * 255).astype(np.uint8)).resize((1024, 1024)).save(f'../film/public/{site}_{k}_l.png')
        print(site, k, 'baked', sh.mean().round(2), ao.mean().round(2))

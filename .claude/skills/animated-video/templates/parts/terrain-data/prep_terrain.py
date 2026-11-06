# Terrain fields for the film (grid G x G over the ~31.6 km square), written as float32 binaries to film/public/:
#   h.bin        real elevation (m)
#   plateau.bin  the surface before the canyon: the rims' level carried across (grey closing of the DEM, smoothed)
#   dist.bin     distance from the Colorado River (km), so carving can go down first (narrow) and then wide
#   river.json   the river's centreline (grid coords, upstream to downstream) for the pebble ride and labels
import json, numpy as np
from scipy import ndimage as nd
G = 320
d = np.load('dem.npy'); meta = json.load(open('dem.json'))
h = nd.zoom(nd.gaussian_filter(d, 1.2), G / d.shape[0], order=1).astype(np.float32)
cell_km = meta['size_km'] / G
# the pre-canyon surface: a plane fitted to the rim country (cells above 2000 m; the plateau rises to the north here)
yy, xx = np.mgrid[0:G, 0:G]; rim = h > 2000
A = np.c_[xx[rim], yy[rim], np.ones(rim.sum())]; coef = np.linalg.lstsq(A, h[rim], rcond=None)[0]
plateau = np.maximum(coef[0] * xx + coef[1] * yy + coef[2], h).astype(np.float32)
# river: the cheapest path across the map over elevation, from the lowest cell on the east edge to the lowest on the
# west edge (the Colorado flows east to west here)
from skimage.graph import route_through_array
band = slice(G // 3, G)                                   # the river is in the lower two thirds
e = G // 3 + int(np.argmin(h[band, -1])); w = G // 3 + int(np.argmin(h[band, 0]))
path, _ = route_through_array((h - h.min() + 1) ** 2, (e, G - 1), (w, 0), fully_connected=True, geometric=True)
river = np.zeros_like(h, bool)
for y, x in path: river[y, x] = True
dist = (nd.distance_transform_edt(~river) * cell_km).astype(np.float32)
cols = [(int(x), int(y)) for y, x in path]
for name, arr in [('h', h), ('plateau', plateau), ('dist', dist)]:
    arr.tofile(f'../film/public/{name}.bin')
json.dump({'G': G, 'size_km': meta['size_km'], 'cell_km': cell_km, 'min_m': float(h.min()), 'max_m': float(h.max()),
           'river': cols[::-1]}, open('../film/public/terrain.json', 'w'))
print(G, round(cell_km, 3), 'river cols', len(cols), 'h', h.min(), h.max(), 'plateau', plateau.min(), plateau.max(), 'max dist', dist.max())

# a side canyon for the flash-flood beat: cheapest path over elevation from the north rim down to the river
tj = json.load(open('../film/public/terrain.json'))
rx = int(G * 0.55); ry = next(y for x, y in cols if x == rx)
sy = next(y for y in range(ry, 0, -1) if h[y, rx] > 2300)
end = min(path, key=lambda p: abs(p[1] - (rx - 25)))       # meet the river a little downstream
trib, _ = route_through_array((h - h.min() + 1) ** 2, (sy, rx), tuple(end), fully_connected=True, geometric=True)
tj['trib'] = [(int(x), int(y)) for y, x in trib]
json.dump(tj, open('../film/public/terrain.json', 'w'))
print('trib', len(trib), 'from', (rx, sy), h[sy, rx])

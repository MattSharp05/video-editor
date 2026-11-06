# Bake lighting from the full-resolution DEM (1024 px, ~31 m) into textures for the terrain top, once:
#   normals.png   object-space normals (x east, y up, z south) of the displayed terrain (heights x VEX): sharper
#                 relief than the 320-vertex mesh
#   light.png     R = soft sun shadow (1 lit, 0 shadow), G = ambient occlusion (horizon-based), B unused
# Sun matches the imagery (winter, low, from the south-south-east) and SUN in World.tsx.
import json, numpy as np
from scipy import ndimage as nd
from PIL import Image
VEX = 1.6
SUN = np.array([0.30, 0.50, 0.81]); SUN /= np.linalg.norm(SUN)          # x east, y up, z south
d = nd.gaussian_filter(np.load('dem.npy'), 0.7); meta = json.load(open('dem.json'))
N = d.shape[0]; cell = meta['size_km'] / N                              # km per pixel
Y = d / 1000 * VEX                                                       # displayed height, km
gz, gx = np.gradient(Y, cell)                                            # rows = +z (south), cols = +x (east)
n = np.stack([-gx, np.ones_like(Y), -gz], -1); n /= np.linalg.norm(n, axis=-1, keepdims=True)
Image.fromarray(((n * 0.5 + 0.5) * 255).astype(np.uint8)).save('../film/public/normals.png')
rows, cols = np.mgrid[0:N, 0:N].astype(np.float32)
def sample(r, c): return nd.map_coordinates(Y, [r, c], order=1, mode='nearest')
# soft sun shadow: march toward the sun; penumbra from the closest miss (k = softness)
hdir = np.array([SUN[2], SUN[0]]); hdir /= np.linalg.norm(hdir)         # (row, col) direction
tan_e = SUN[1] / np.hypot(SUN[0], SUN[2])
sh = np.ones_like(Y)
for s in np.geomspace(0.04, 9.0, 72):                                    # km along the ground
    rr, cc = rows + hdir[0] * s / cell, cols + hdir[1] * s / cell
    clear = (Y + s * tan_e) - sample(rr, cc)                             # ray height above terrain
    sh = np.minimum(sh, np.clip(clear / (0.06 * s) * 0.5 + 0.5, 0, 1))
# ambient occlusion: mean horizon elevation over 12 directions, 0.03-2.5 km
ao = np.zeros_like(Y)
for a in np.linspace(0, 2 * np.pi, 12, endpoint=False):
    hor = np.zeros_like(Y)
    for s in np.geomspace(0.03, 2.5, 20):
        rr, cc = rows + np.sin(a) * s / cell, cols + np.cos(a) * s / cell
        hor = np.maximum(hor, (sample(rr, cc) - Y) / s)
    ao += np.sin(np.arctan(hor))
ao = 1 - ao / 12
out = np.stack([sh, np.clip(ao, 0, 1), np.zeros_like(Y)], -1)
Image.fromarray((out * 255).astype(np.uint8)).save('../film/public/light.png')
prev = (np.clip(sh * 0.6 + 0.4, 0, 1) * np.clip(ao, 0, 1) * 255).astype(np.uint8)
Image.fromarray(prev).resize((512, 512)).save('/tmp/claude-0/-home-user/5dc44929-3cdd-5cc0-86b7-02dfff66f5f5/scratchpad/light_prev.png')
print('shadow mean', sh.mean().round(3), 'ao mean', ao.mean().round(3))

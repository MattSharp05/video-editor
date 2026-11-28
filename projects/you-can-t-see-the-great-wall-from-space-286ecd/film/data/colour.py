# Procedural late-autumn ground colour for the Jinshanling block (no free imagery licence outside the US):
# olive scrub in hollows, tan and rust on dry slopes and crests, grey rock on the steepest faces. -> ../public/ground.jpg
import json, numpy as np
from PIL import Image
from scipy import ndimage as nd
d = nd.gaussian_filter(np.load('dem.npy'), 0.7); N = d.shape[0]; px = json.load(open('dem.json'))['size_km'] * 1000 / N
gz, gx = np.gradient(d, px); slope = np.hypot(gx, gz)
rng = np.random.default_rng(3)
def noise(sig): n = nd.gaussian_filter(rng.standard_normal(d.shape), sig); return (n - n.mean()) / n.std()
rel = d - nd.gaussian_filter(d, 25)                     # + on crests, - in hollows
wet = np.clip(-rel / 40 + 0.4 + 0.25 * noise(6), 0, 1)
rock = np.clip((slope - 0.75) / 0.4 + 0.3 * noise(3), 0, 1)
olive = np.array([88, 86, 52]); tan = np.array([150, 120, 84]); rust = np.array([128, 74, 44]); grey = np.array([132, 124, 112])
r = np.clip(0.5 + 0.6 * noise(4), 0, 1)[..., None]
c = tan * (1 - r) + rust * r
c = c * (1 - wet[..., None]) + olive * wet[..., None]
c = c * (1 - rock[..., None]) + grey * rock[..., None]
c *= (1 + 0.12 * noise(1.2))[..., None]
Image.fromarray(np.clip(c, 0, 255).astype(np.uint8)).save('../public/ground.jpg', quality=92)
print('ok')
# sun shadow from the bake (light.png R) darkens the colour map; the mesh itself gets the direct light
L = np.asarray(Image.open('../public/light.png')).astype(np.float32) / 255
c2 = np.asarray(Image.open('../public/ground.jpg')).astype(np.float32) * (0.55 + 0.45 * L[..., :1]) * (0.75 + 0.25 * L[..., 1:2])
Image.fromarray(np.clip(c2, 0, 255).astype(np.uint8)).save('../public/ground.jpg', quality=92)
# heights for the mesh: 512 x 512 float32 (2x2 mean of the 1024 DEM), metres
h = np.load('dem.npy').reshape(512, 2, 512, 2).mean((1, 3)).astype(np.float32); h.tofile('../public/dem512.bin')

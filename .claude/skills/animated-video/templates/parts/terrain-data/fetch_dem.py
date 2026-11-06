# Terrain for the film: AWS Open Data "Terrain Tiles" (terrarium PNG; in the US the source is USGS 3DEP/NED, public
# domain). 4x4 tiles at zoom 12 around Grand Canyon Village -> a ~31 km square, 1024 px. Writes dem.npy (metres).
import math, io, urllib.request, numpy as np, json
from PIL import Image
LAT, LON, Z, N = 36.20, -112.16, 12, 4
def tile(lat, lon, z):
    n = 2 ** z; x = (lon + 180) / 360 * n; y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n; return x, y
cx, cy = tile(LAT, LON, Z); x0, y0 = int(cx) - N // 2 + 1, int(cy) - N // 2 + 1
img = np.zeros((256 * N, 256 * N), np.float32)
for j in range(N):
    for i in range(N):
        url = f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x0 + i}/{y0 + j}.png'
        a = np.asarray(Image.open(io.BytesIO(urllib.request.urlopen(url).read())).convert('RGB')).astype(np.float32)
        img[j*256:(j+1)*256, i*256:(i+1)*256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
def lonlat(x, y, z):
    n = 2 ** z; lon = x / n * 360 - 180; lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n)))); return lon, lat
w, n_ = lonlat(x0, y0, Z); e, s = lonlat(x0 + N, y0 + N, Z)
size_km = (e - w) * 111.32 * math.cos(math.radians(LAT))
np.save('dem.npy', img)
json.dump({'west': w, 'east': e, 'north': n_, 'south': s, 'size_km': size_km, 'min_m': float(img.min()), 'max_m': float(img.max())}, open('dem.json', 'w'), indent=1)
print(json.load(open('dem.json')))

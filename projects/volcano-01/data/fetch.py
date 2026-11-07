# Elevation + imagery for both volcanoes (run from data/): python3 fetch.py kilauea|helens
#   DEM: AWS Open Data "Terrain Tiles" (terrarium PNG; in the US the source is USGS 3DEP/NED, public domain), zoom Z, N x N tiles
#   Imagery: USGS National Map "USGSImageryOnly" (public domain) for the same web-mercator square at zoom Z+2 -> 4096 px
# Writes <site>_dem.npy (m, git-ignored as data/*.npy? no: kept small), <site>.json, ../film/public/<site>_imagery.jpg
import math, io, json, sys, urllib.request, concurrent.futures as cf, numpy as np
from PIL import Image
SITES = {'kilauea': (19.405, -155.275, 12, 4), 'kil13': (19.40, -155.27, 13, 4),   # Kilauea summit caldera, Halema'uma'u ~19.407N 155.283W
         'helens':  (46.200, -122.190, 12, 4)}   # Mount St. Helens crater ~46.20N 122.18W
site = sys.argv[1]; LAT, LON, Z, N = SITES[site]
def tile(lat, lon, z):
    n = 2 ** z; return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
def lonlat(x, y, z):
    n = 2 ** z; return x / n * 360 - 180, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))
cx, cy = tile(LAT, LON, Z); x0, y0 = int(cx) - N // 2 + 1, int(cy) - N // 2 + 1
UA = {'User-Agent': 'video-editor-research/1.0'}
def get(url): return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
dem = np.zeros((256 * N, 256 * N), np.float32)
for j in range(N):
    for i in range(N):
        a = np.asarray(Image.open(io.BytesIO(get(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x0+i}/{y0+j}.png'))).convert('RGB')).astype(np.float32)
        dem[j*256:(j+1)*256, i*256:(i+1)*256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
w, n_ = lonlat(x0, y0, Z); e, s = lonlat(x0 + N, y0 + N, Z)
size_km = (e - w) * 111.32 * math.cos(math.radians((n_ + s) / 2))
np.save(f'{site}_dem.npy', dem)
json.dump({'west': w, 'east': e, 'north': n_, 'south': s, 'size_km': size_km, 'min_m': float(dem.min()), 'max_m': float(dem.max())}, open(f'{site}.json', 'w'), indent=1)
print(site, json.load(open(f'{site}.json')))
Z2, K = Z + 2, 4 * N
def img(ij):
    i, j = ij
    return ij, Image.open(io.BytesIO(get(f'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{Z2}/{y0*4+j}/{x0*4+i}'))).convert('RGB')
out = Image.new('RGB', (256 * K, 256 * K))
with cf.ThreadPoolExecutor(8) as ex:
    for (i, j), t in ex.map(img, [(i, j) for j in range(K) for i in range(K)]):
        out.paste(t.resize((256, 256)), (i * 256, j * 256))
out.save(f'../film/public/{site}_imagery.jpg', quality=88)
out.resize((768, 768)).save(f'/tmp/claude-0/-home-user-video-editor/913b9535-f62b-5781-832d-c62e119fd410/scratchpad/{site}_img.jpg')
print('imagery ok')

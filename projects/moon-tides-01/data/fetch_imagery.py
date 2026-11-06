# Satellite imagery for the terrain: USGS National Map "USGSImageryOnly" (public domain), the same web-mercator square
# as the DEM (fetch_dem.py), at zoom 14 -> 16x16 tiles -> 4096 px (~7.7 m/px). Writes film/public/imagery.jpg.
import math, io, urllib.request, concurrent.futures as cf, numpy as np
from PIL import Image
LAT, LON, Z, N = 45.42, -63.90, 11, 4      # must match fetch_dem.py
def tile(lat, lon, z):
    n = 2 ** z; return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
cx, cy = tile(LAT, LON, Z); x0, y0 = int(cx) - N // 2 + 1, int(cy) - N // 2 + 1
Z2, K = 13, 4 * N                                 # 4x finer
X0, Y0 = x0 * 4, y0 * 4
def get(ij):
    i, j = ij
    url = f'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{Z2}/{Y0 + j}/{X0 + i}.jpg'
    req = urllib.request.Request(url, headers={'User-Agent': 'video-editor-research/1.0'})
    return ij, Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=60).read())).convert('RGB')
img = Image.new('RGB', (256 * K, 256 * K))
with cf.ThreadPoolExecutor(8) as ex:
    for (i, j), t in ex.map(get, [(i, j) for j in range(K) for i in range(K)]):
        img.paste(t.resize((256, 256)), (i * 256, j * 256))
img.save('../film/public/fundy_imagery.jpg', quality=88)
img.resize((512, 512)).save('/tmp/claude-0/-home-user/5dc44929-3cdd-5cc0-86b7-02dfff66f5f5/scratchpad/imagery_small.jpg')
print('ok', img.size)

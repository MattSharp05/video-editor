#!/usr/bin/env python3
"""Search every free 3D / material / image source at once and rank the results.

usage:
  find_asset.py "typewriter" [--also "type writer,underwood"] [--kind model|material|image] [--max 24] [--out DIR]
  find_asset.py --build-index            # refresh the offline indexes (Kenney, Quaternius, NASA)

Writes DIR/results.json and DIR/sheet.jpg (thumbnails, ranked). Read the sheet: fit is judged by eye,
then the top picks get a test render (render_glb.mjs) before anything is chosen.
Rules, sources and how each is reached: ../../references/sourcing.md. Licence tiers: cc0 > by > free (own licence) > nc > unknown.
"""
import argparse, concurrent.futures as cf, html, io, json, os, re, subprocess, sys, time, urllib.parse
import requests
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
IDX = os.path.join(HERE, 'index')
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) asset-search'}
CONTROLLABLE = False  # --controllable: ask Sketchfab for rigged or animated models only
TIER = {'cc0': 1.0, 'by': 0.85, 'free': 0.8, 'nc': 0.55, 'unknown': 0.35}
S = requests.Session(); S.headers.update(UA)

def get(url, **kw):
    r = S.get(url, timeout=kw.pop('timeout', 25), **kw); r.raise_for_status(); return r

def toks(s): return [t for t in re.split(r'[^a-z0-9]+', s.lower()) if len(t) > 1]

def match(queries, name, tags=''):
    """Best score over the query variants (the first is the main query; --also variants count 80 %).
    A word counts when it is in the name exactly or as a plural; tags count less."""
    n, t = set(toks(name)), set(toks(tags))
    has = lambda w, S: w in S or w + 's' in S or w + 'es' in S or (w.endswith('s') and w[:-1] in S)
    best = 0.0
    for k, q in enumerate(queries):
        qt = toks(q)
        if not qt: continue
        hit_n = sum(1 for w in qt if has(w, n)); hit_t = sum(1 for w in qt if has(w, t) and not has(w, n))
        s = (2.0 * hit_n + 0.8 * hit_t) / (2.0 * len(qt))
        if hit_n == len(qt): s += 0.5
        best = max(best, s * (1.0 if k == 0 else 0.8))
    return best

def item(**k):
    k.setdefault('tier', 'unknown'); k.setdefault('formats', []); k.setdefault('faces', None)
    k.setdefault('rigged', None); k.setdefault('download', ''); k.setdefault('thumb', ''); k.setdefault('note', '')
    return k

# ---------- live sources ----------
def polyhaven(qs, kind):
    t = {'model': 'models', 'material': 'textures', 'image': 'hdris'}[kind]
    d = get(f'https://api.polyhaven.com/assets?t={t}').json()
    out = []
    for i, a in d.items():
        sc = match(qs, a.get('name', i), ' '.join(a.get('tags', []) + a.get('categories', [])))
        if sc > 0.3:
            out.append(item(source='polyhaven', id=i, name=a.get('name', i), url=f'https://polyhaven.com/a/{i}', tier='cc0',
                            licence='CC0', formats=['gltf', 'blend', 'fbx'], score=sc, ready=True,
                            thumb=f'https://cdn.polyhaven.com/asset_img/thumbs/{i}.png?width=256&height=256',
                            download=f'https://api.polyhaven.com/files/{i}'))
    return out

def sketchfab(qs, kind):
    if kind != 'model': return []
    out, seen = [], set()
    filters = [{'animated': 'true'}, {'rigged': 'true'}] if CONTROLLABLE else [{}]
    for q in qs:
      for flt in filters:
        d = get('https://api.sketchfab.com/v3/search', params={'type': 'models', 'q': q, 'downloadable': 'true', 'count': 24, **flt}).json()
        for m in d.get('results', []):
              if m['uid'] in seen or m.get('isAgeRestricted'): continue
              seen.add(m['uid'])
              lic = (m.get('license') or {}).get('label', '') or ''
              slug = lic.lower()
              tier = 'cc0' if 'cc0' in slug or 'public domain' in slug else 'nc' if 'noncommercial' in slug or 'non-commercial' in slug \
                  else 'by' if 'attribution' in slug else 'free' if 'free standard' in slug else 'unknown'
              ims = sorted((m.get('thumbnails') or {}).get('images', []), key=lambda x: abs(x.get('width', 0) - 256))
              out.append(item(source='sketchfab', id=m['uid'], name=m['name'], url=m.get('viewerUrl', ''), tier=tier, licence=lic,
                              formats=['glb', 'gltf'], faces=m.get('faceCount'), rigged=True if flt.get('rigged') else None, animated=(m.get('animationCount') or 0) > 0,
                              score=match(qs, m['name'], ' '.join(t.get('name', '') for t in m.get('tags', []))) + 0.15,
                              thumb=ims[0]['url'] if ims else '', ready=True, note='download uses the account token saved as a network secret',
                              likes=m.get('likeCount', 0), author=(m.get('user') or {}).get('displayName', '')))
    return out

def smithsonian(qs, kind):
    if kind != 'model': return []
    groups = {}
    for q in qs:
        d = get('https://3d-api.si.edu/api/v1.0/content/file/search', params={'q': q, 'file_type': 'glb', 'rows': 100}).json()
        for r in d.get('rows', []):
            c = r['content']; g = groups.setdefault(c['model_url'], {'title': r['title'], 'files': {}})
            g['files'][c.get('quality', '')] = c['uri']
    out = []
    for mu, g in groups.items():
        f = g['files']; uri = f.get('Medium') or f.get('High') or f.get('Low') or f.get('Thumb') or next(iter(f.values()))
        title = re.sub('<[^>]+>', '', g['title'])
        out.append(item(source='smithsonian', id=mu, name=title, url=f'https://3d.si.edu/object/{mu.split(":")[-1]}',
                        tier='unknown', licence='check (Smithsonian Open Access; many CC0)', formats=['glb'],
                        score=match(qs, title), ready=True, download=uri, thumb_glb=f.get('Thumb') or uri,
                        note='search ranking is loose; rights via the Open Access API'))
    return out

def ambientcg(qs, kind):
    if kind != 'material': return []
    out = []
    for q in qs:
        d = get('https://ambientcg.com/api/v2/full_json', params={'q': q, 'limit': 20, 'include': 'imageData,tagData'}).json()
        for a in d.get('foundAssets', []):
            pv = (a.get('previewImage') or {}).get('256-PNG') or ''
            out.append(item(source='ambientcg', id=a['assetId'], name=a.get('displayName', a['assetId']), url=f'https://ambientcg.com/view?id={a["assetId"]}',
                            tier='cc0', licence='CC0', formats=['zip (PBR maps)'], score=match(qs, a.get('displayName', ''), ' '.join(a.get('tags', []))),
                            thumb=pv, ready=True, download=f'https://ambientcg.com/get?file={a["assetId"]}_1K-JPG.zip'))
    return out

def openverse(qs, kind):
    if kind != 'image': return []
    out = []
    for q in qs:
        d = get('https://api.openverse.org/v1/images/', params={'q': q, 'page_size': 20}).json()
        for r in d.get('results', []):
            lic = r.get('license', '')
            tier = 'cc0' if lic in ('cc0', 'pdm') else 'nc' if 'nc' in lic else 'by'
            out.append(item(source='openverse', id=r['id'], name=r.get('title') or '', url=r.get('foreign_landing_url', ''), tier=tier,
                            licence=f"{lic} {r.get('license_version') or ''}".strip(), formats=[r.get('filetype') or 'image'],
                            score=match(qs, r.get('title') or '', ' '.join(t['name'] for t in r.get('tags') or [])), ready=True,
                            thumb=r.get('thumbnail') or r.get('url', ''), download=r.get('url', ''), author=r.get('creator', '')))
    return out

# ---------- offline indexes (built by --build-index) ----------
def from_index(name):
    def f(qs, kind):
        p = os.path.join(IDX, f'{name}.json')
        if kind != 'model' or not os.path.exists(p): return []
        out = []
        for a in json.load(open(p)):
            sc = match(qs, a['name'], a.get('tags', ''))
            if sc > 0.3: out.append(item(**{**a, 'score': sc}))
        return out
    return f

def ours(qs, kind):
    p = os.path.join(IDX, 'ours.json')
    if not os.path.exists(p): return []
    out = []
    for a in json.load(open(p)):
        sc = match(qs, a['name'], a.get('tags', ''))
        if sc > 0.3: out.append(item(**{**a, 'score': sc + 0.6}))  # our tested assets win ties
    return out

SOURCES = {'ours': ours, 'polyhaven': polyhaven, 'sketchfab': sketchfab, 'smithsonian': smithsonian, 'nasa': from_index('nasa'),
           'kenney': from_index('kenney'), 'quaternius': from_index('quaternius'), 'ambientcg': ambientcg, 'openverse': openverse}

def build_index():
    os.makedirs(IDX, exist_ok=True)
    # NASA: the public git repo's file tree (no blobs), each model ships a .glb and a .png preview
    d = os.path.join(IDX, '_nasa_repo')
    if not os.path.exists(d):
        subprocess.run(['git', 'clone', '-q', '--filter=blob:none', '--no-checkout', '--depth', '1', 'https://github.com/nasa/NASA-3D-Resources', d], check=True)
    files = subprocess.run(['git', '-C', d, 'ls-tree', '-r', '--name-only', 'HEAD'], capture_output=True, text=True, check=True).stdout.splitlines()
    nasa = {}
    for f in files:
        if not f.startswith('3D Models/'): continue
        folder = f.split('/')[1]; e = nasa.setdefault(folder, {'glb': '', 'png': ''})
        if f.lower().endswith('.glb'): e['glb'] = f
        elif f.lower().endswith(('.png', '.jpg')) and not e['png']: e['png'] = f
    json.dump([{'source': 'nasa', 'id': k, 'name': k, 'url': 'https://science.nasa.gov/3d-resources/', 'tier': 'free',
                'licence': 'NASA media (free; no endorsement)', 'formats': ['glb'], 'ready': True,
                'download': 'git:' + v['glb'], 'thumb': ('git:' + v['png']) if v['png'] else ''}
               for k, v in nasa.items() if v['glb']], open(os.path.join(IDX, 'nasa.json'), 'w'), indent=0)
    # Kenney: the 3D category pages (CC0)
    ken = {}
    for pg in range(1, 12):
        try: h = get(f'https://kenney.nl/assets/category:3D/page:{pg}').text
        except Exception: break
        new = [x for x in re.findall(r"https://kenney.nl/assets/([a-z0-9-]+)", h) if x not in ('category', 'tag', 'page') and x not in ken]
        if not new: break
        for x in new: ken[x] = ''
    out = []
    for slug, img in ken.items():
        try: page = get(f'https://kenney.nl/assets/{slug}').text
        except Exception: continue
        tags = ' '.join(re.findall(r"href='https://kenney.nl/assets/tag:([a-z0-9-]+)'", page))
        og = re.search(r"og:image'\s+content='([^']+)'", page)
        out.append({'source': 'kenney', 'id': slug, 'name': slug.replace('-', ' '), 'tags': tags, 'url': f'https://kenney.nl/assets/{slug}',
                    'tier': 'cc0', 'licence': 'CC0', 'formats': ['glb', 'fbx', 'obj'], 'ready': True, 'download': 'browser:kenney',
                    'thumb': og.group(1) if og else img, 'note': 'a pack: pick the model inside after download'})
        time.sleep(0.3)
    json.dump(out, open(os.path.join(IDX, 'kenney.json'), 'w'), indent=0)
    # Quaternius: pack pages (QAL v1.0: free incl. commercial, no credit, no redistributing the files)
    h = get('https://quaternius.com/').text
    q = []
    for slug in sorted(set(re.findall(r'href="/?packs/([a-z0-9]+)\.html"', h))):
        p = get(f'https://quaternius.com/packs/{slug}.html').text
        title = html.unescape((re.search(r'<title>([^<]+)', p) or [None, slug])[1]).replace('Quaternius', '').strip(' -·|•')
        desc = ' '.join(re.sub('<[^>]+>', ' ', x) for x in re.findall(r'<p[^>]*>(.*?)</p>', p, re.S))[:600]
        itch = re.search(r'https://quaternius\.itch\.io/[a-z0-9-]+', p)
        img = f'https://quaternius.com/assets/images/fullres/{slug}.jpg'
        q.append({'source': 'quaternius', 'id': slug, 'name': title or slug, 'tags': desc, 'url': f'https://quaternius.com/packs/{slug}.html',
                  'tier': 'free', 'licence': 'Quaternius QAL v1.0 (free, no credit; don\'t redistribute files)', 'formats': ['glb', 'fbx', 'obj'],
                  'ready': True, 'download': 'browser:itch ' + (itch.group(0) if itch else ''), 'thumb': img, 'note': 'a pack'})
        time.sleep(0.3)
    json.dump(q, open(os.path.join(IDX, 'quaternius.json'), 'w'), indent=0)
    print(f'nasa {len(nasa)}  kenney {len(out)}  quaternius {len(q)}')

# ---------- ranking and sheet ----------
def rank(items):
    import math
    for a in items:
        f = a.get('faces') or 0
        size = 0.85 if f > 500_000 else 1.03 if 3_000 <= f <= 200_000 else 1.0   # CPU rendering: heavy meshes cost
        pop = 1 + 0.03 * math.log10((a.get('likes') or 0) + 1)                       # tie-breaker only
        a['rank_score'] = round(a['score'] * TIER.get(a['tier'], 0.35) * (1.0 if a.get('ready') else 0.85) *
                                (1.05 if 'glb' in a['formats'] or 'gltf' in a['formats'] else 1.0) * size * pop, 3)
    return sorted(items, key=lambda a: -a['rank_score'])

def fetch_thumb(a):
    t = a.get('thumb') or ''
    try:
        if t.startswith('git:'):
            b = subprocess.run(['git', '-C', os.path.join(IDX, '_nasa_repo'), 'show', 'HEAD:' + t[4:]], capture_output=True, check=True).stdout
        elif t.startswith('file:'):
            b = open(os.path.join(HERE, t[5:]), 'rb').read()  # relative to this folder
        elif t:
            b = get(t, timeout=20).content
        else:
            return None
        im = Image.open(io.BytesIO(b)).convert('RGB'); im.thumbnail((256, 256)); return im
    except Exception:
        return None

def sheet(items, path, title):
    n = len(items); cols = 6; rows = (n + cols - 1) // cols
    W, H = 256, 256 + 64
    canvas = Image.new('RGB', (cols * W, rows * H + 40), (24, 22, 20)); d = ImageDraw.Draw(canvas)
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14); big = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
    except Exception: font = big = ImageFont.load_default()
    d.text((10, 8), title, fill=(240, 240, 240), font=big)
    with cf.ThreadPoolExecutor(12) as ex: ims = list(ex.map(fetch_thumb, items))
    for k, (a, im) in enumerate(zip(items, ims)):
        x, y = (k % cols) * W, 40 + (k // cols) * H
        if im: canvas.paste(im, (x + (W - im.width) // 2, y + (256 - im.height) // 2))
        else: d.text((x + 70, y + 120), '(no preview)', fill=(150, 150, 150), font=font)
        col = {'cc0': (120, 220, 140), 'by': (130, 190, 255), 'free': (200, 200, 120), 'nc': (255, 170, 90)}.get(a['tier'], (200, 120, 120))
        d.text((x + 6, y + 260), f"{k + 1}. {a['source']} · {a['tier']}" + (f" · {a['faces'] // 1000}k" if a.get('faces') else '') + (' · anim' if a.get('animated') else ' · rig' if a.get('rigged') else ''), fill=col, font=font)
        d.text((x + 6, y + 280), a['name'][:32], fill=(235, 235, 235), font=font)
    canvas.save(path, quality=88)

def fetch(r, dest):
    """Download one result into dest; returns the model file path. Kenney/Quaternius packs go through the browser."""
    os.makedirs(dest, exist_ok=True); src = r['source']
    if src == 'polyhaven':
        f = get(r['download']).json()['gltf']['1k']['gltf']
        main = os.path.join(dest, os.path.basename(f['url'])); open(main, 'wb').write(get(f['url'], timeout=120).content)
        for rel, inc in f.get('include', {}).items():
            p = os.path.join(dest, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'wb').write(get(inc['url'], timeout=120).content)
        return main
    if src == 'smithsonian':
        p = os.path.join(dest, os.path.basename(r['download'])); open(p, 'wb').write(get(r['download'], timeout=180).content); return p
    if src == 'nasa':
        rel = r['download'][4:]; p = os.path.join(dest, os.path.basename(rel))
        open(p, 'wb').write(subprocess.run(['git', '-C', os.path.join(IDX, '_nasa_repo'), 'show', 'HEAD:' + rel], capture_output=True, check=True).stdout); return p
    if src == 'sketchfab':
        # Personal API token, injected by the environment's network secret for api.sketchfab.com (never in code).
        d = get(f"https://api.sketchfab.com/v3/models/{r['id']}/download").json()
        pick = d.get('glb') or d.get('gltf') or d.get('source')
        raw = requests.get(pick['url'], timeout=600).content  # signed S3 link, no auth, expires in 5 min
        if pick is d.get('glb'):
            p = os.path.join(dest, 'model.glb'); open(p, 'wb').write(raw); return p
        import zipfile
        z = zipfile.ZipFile(io.BytesIO(raw)); root = os.path.realpath(dest)
        for n in z.namelist():  # untrusted archive: refuse paths that leave dest
            if not os.path.realpath(os.path.join(dest, n)).startswith(root + os.sep): raise SystemExit(f'unsafe path in zip: {n}')
        z.extractall(dest)
        for ext in ('.glb', '.gltf', '.fbx', '.obj'):
            for base, _, fs in os.walk(dest):
                for f in fs:
                    if f.lower().endswith(ext): return os.path.join(base, f)
        raise SystemExit('no model file in the archive')
    raise SystemExit(f'{src}: download by hand or with the browser helper (see README)')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('query', nargs='?'); ap.add_argument('--also', default=''); ap.add_argument('--kind', default='model')
    ap.add_argument('--max', type=int, default=24); ap.add_argument('--controllable', action='store_true', help='rigged or animated models only (Sketchfab filters)'); ap.add_argument('--out', default='');
    ap.add_argument('--sources', default=','.join(SOURCES)); ap.add_argument('--build-index', action='store_true')
    ap.add_argument('--get', default='', help='comma list of result numbers to download from the last run in --out')
    a = ap.parse_args()
    if a.build_index: return build_index()
    if a.get:
        out = a.out or os.path.join('/tmp', 'find_asset', re.sub(r'\W+', '-', a.query.lower()))
        res = json.load(open(os.path.join(out, 'results.json')))['results']
        for n in a.get.split(','):
            r = res[int(n) - 1]; slug = re.sub(r'\W+', '-', r['name'].lower())[:40]  # outside the f-string: Python < 3.12
            print(n, r['source'], r['name'], '->', fetch(r, os.path.join(out, 'models', f"{n}-{slug}")))
        return
    global CONTROLLABLE; CONTROLLABLE = a.controllable
    if CONTROLLABLE: a.sources = ','.join(x for x in a.sources.split(',') if x in ('ours', 'sketchfab', 'quaternius', 'kenney'))
    qs = [a.query] + [x.strip() for x in a.also.split(',') if x.strip()]
    t0 = time.time(); found, errors = [], {}
    with cf.ThreadPoolExecutor(10) as ex:
        futs = {ex.submit(SOURCES[s], qs, a.kind): s for s in a.sources.split(',') if s in SOURCES}
        for f in cf.as_completed(futs):
            try: found += f.result()
            except Exception as e: errors[futs[f]] = str(e)[:120]
    res = [r for r in rank(found) if r['score'] > 0.2][:a.max]
    out = a.out or os.path.join('/tmp', 'find_asset', re.sub(r'\W+', '-', a.query.lower()))
    os.makedirs(out, exist_ok=True)
    json.dump({'queries': qs, 'kind': a.kind, 'seconds': round(time.time() - t0, 1), 'errors': errors,
               'per_source': {s: sum(1 for x in found if x['source'] == s) for s in SOURCES}, 'results': res},
              open(os.path.join(out, 'results.json'), 'w'), indent=1)
    sheet(res, os.path.join(out, 'sheet.jpg'), f'"{a.query}" ({a.kind}) · {len(found)} found · top {len(res)}')
    print(f'{len(found)} found in {time.time() - t0:.1f}s ' + ' '.join(f'{s}:{sum(1 for x in found if x["source"] == s)}' for s in SOURCES) +
          (f'  errors: {errors}' if errors else ''))
    for k, r in enumerate(res[:12]):
        print(f"{k + 1:2}. {r['rank_score']:.2f} {r['source']:<11} {r['tier']:<7} {r['name'][:44]:<44} {r.get('faces') or ''}")
    print('sheet:', os.path.join(out, 'sheet.jpg'))

if __name__ == '__main__':
    main()

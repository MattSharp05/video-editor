# Turn Matthew's picks into the studio's sound palette, and rank new candidates by his taste.
#
#   python3 palette.py build PICKS_DIR            # PICKS_DIR: the picker's `picks` docs as JSON files
#                                                 # (ArtifactData list ... out_dir), writes sound-palette.json
#   python3 palette.py rank CATEGORY FILE...      # score new sounds against the palette's profile
#   python3 palette.py taste                      # print the real-sfx taste.py commands for loves and bans
#
# The palette has three layers, used in this order when a video needs a sound:
#   1. references: category -> the file he picked. NOT reused as is: "Use these as references. We are not going to
#                  use the same sounds each video. But this sort of vibe" (Matthew, 2026-11-05). Each new video picks
#                  fresh sounds closest to the category's reference (and the overall profile); the reference itself
#                  is only the fallback when nothing new is close enough.
#   2. profile:   the measured character of everything he picked (brightness, ring, attack, length), overall
#                 and per category, so new candidates can be ranked by distance to his taste
#   3. passed:    files he heard and did not pick (pushed down, never banned outright)
import json, glob, math, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'sound-palette.json')
KEYS = ['brightness_hz', 'ring_s', 'attack_ms', 'length_s']
SCALE = {'brightness_hz': 400.0, 'ring_s': 0.1, 'attack_ms': 40.0, 'length_s': 0.15}  # one "step" of difference


def measure(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '22050', '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32); a = np.abs(x); pk = a.max() + 1e-9
    env = np.convolve(a, np.ones(220) / 220, 'same')
    on = int(np.argmax(env > pk * 0.05)); off = len(env) - int(np.argmax(env[::-1] > pk * 0.03))
    seg = x[on:off] if off - on > 64 else x
    spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))); fr = np.fft.rfftfreq(len(seg), 1 / 22050)
    ip = int(np.argmax(env)); tail = (int(np.argmax(env[ip:] < pk * 0.0316)) or len(env) - ip) / 22050
    return {'brightness_hz': float((spec * fr).sum() / (spec.sum() + 1e-9)), 'length_s': (off - on) / 22050,
            'ring_s': tail, 'attack_ms': (ip - on) / 22050 * 1000}


def profile(ms):
    return {k: {'median': float(np.median([m[k] for m in ms])), 'min': float(min(m[k] for m in ms)), 'max': float(max(m[k] for m in ms))}
            for k in KEYS} if ms else None


def distance(m, prof):
    return math.sqrt(sum(((m[k] - prof[k]['median']) / SCALE[k]) ** 2 for k in KEYS))


def build(picks_dir):
    docs = []
    for f in glob.glob(os.path.join(picks_dir, '**', '*.json'), recursive=True):
        d = json.load(open(f)); docs.append(d.get('data', d))
    pal = {'defaults': {}, 'silent': [], 'unfilled': [], 'passed': [], 'notes': {}}
    picked_m, per_cat = [], {}
    for d in docs:
        c = d['category']
        if d.get('note'): pal['notes'][c] = d['note']
        if d.get('choice') == 'silence': pal['silent'].append(c); continue
        if d.get('choice') in (None, 'none'): pal['unfilled'].append(c); continue
        pal['defaults'][c] = {'label': d['label'], 'source': d['source'], 'measured': d.get('measured')}
        pal['passed'] += d.get('passed') or []
        if d.get('measured'): picked_m.append(d['measured']); per_cat[c] = d['measured']
    pal['profile'] = {'overall': profile(picked_m), 'per_category': per_cat}
    json.dump(pal, open(OUT, 'w'), indent=1)
    print(f"palette: {len(pal['defaults'])} defaults, {len(pal['silent'])} silent, {len(pal['unfilled'])} need new options -> {OUT}")
    if pal['profile']['overall']:
        p = pal['profile']['overall']
        print('his profile (median): brightness %.0f Hz, ring %.2f s, attack %.0f ms, length %.2f s' %
              tuple(p[k]['median'] for k in KEYS))


def rank(cat, files):
    pal = json.load(open(OUT)); prof = pal['profile']['overall']
    ref = (pal['defaults'].get(cat) or {}).get('measured')
    if ref:  # rank against this category's reference first, the overall profile second
        prof = {k: {'median': 0.7 * ref[k] + 0.3 * prof[k]['median']} for k in KEYS}
    if not prof: sys.exit('no profile yet: build the palette from picks first')
    passed = set(pal['passed'])
    rows = []
    for f in files:
        m = measure(f); d = distance(m, prof) + (2 if any(p and p in f for p in passed) else 0)
        rows.append((d, f, m))
    for d, f, m in sorted(rows):
        print(f"{d:5.2f}  {os.path.basename(f):40s} brightness {m['brightness_hz']:5.0f} Hz  ring {m['ring_s']:.2f}s  attack {m['attack_ms']:4.0f}ms")


def taste():
    pal = json.load(open(OUT))
    for c, v in pal['defaults'].items():
        print(f"python3 scripts/taste.py love '{os.path.basename(v['source'])}'   # {c}")


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'build': build(sys.argv[2])
    elif cmd == 'rank': rank(sys.argv[2], sys.argv[3:])
    elif cmd == 'taste': taste()
    else: print(__doc__ if __doc__ else open(__file__).read().split('\nimport')[0])

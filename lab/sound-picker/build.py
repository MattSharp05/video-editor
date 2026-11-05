# Build the sound-picker candidates: for each reusable category, a few options (softest first by measurement),
# each rendered as a short level-matched clip, with its measured character. Writes clips/ and candidates.json.
import json, os, subprocess, sys, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
U = '/home/user/video-editor/.claude/skills/real-sfx/vendor/node_modules/uisfx/sounds'
LIB = '/home/user/video-editor/library/sfx'
MUS = os.path.join(HERE, 'music-src')
PACKS = ['zen', 'minimal', 'soft', 'organic', 'dreamy', 'studio', 'glass']

def load(f, ss=None, t=None):
    cmd = ['ffmpeg', '-v', 'error'] + (['-ss', str(ss)] if ss else []) + (['-t', str(t)] if t else []) + ['-i', f, '-ac', '1', '-ar', '22050', '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32)

def measure(f):
    x = load(f); a = np.abs(x); pk = a.max() + 1e-9
    env = np.convolve(a, np.ones(220) / 220, 'same')
    on = int(np.argmax(env > pk * 0.05)); off = len(env) - int(np.argmax(env[::-1] > pk * 0.03))
    seg = x[on:off] if off - on > 64 else x
    spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))); fr = np.fft.rfftfreq(len(seg), 1 / 22050)
    cen = float((spec * fr).sum() / (spec.sum() + 1e-9))
    ip = int(np.argmax(env)); tail = (int(np.argmax(env[ip:] < pk * 0.0316)) or len(env) - ip) / 22050
    return {'brightness_hz': round(cen), 'length_s': round((off - on) / 22050, 2), 'ring_s': round(tail, 2), 'attack_ms': round((ip - on) / 22050 * 1000)}

def words(m):
    b = m['brightness_hz']; r = m['ring_s']
    bw = 'dark' if b < 600 else 'warm' if b < 1000 else 'bright' if b < 1600 else 'very bright'
    rw = 'dry' if r < 0.1 else 'short' if r < 0.25 else 'rings a little' if r < 0.5 else 'rings'
    aw = 'soft attack' if m['attack_ms'] > 60 else 'crisp attack'
    return f'{bw} · {rw} · {aw}'

def clip(src, dst, kind, filt=None):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if kind == 'sfx':     # short sounds: peak-normalised to -6 dBFS so options compare by character, not level
        af = (filt + ',' if filt else '') + 'apad=pad_dur=0.25,dynaudnorm=f=500:g=3:p=0.5'
        tmp = dst + '.wav'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', (filt or 'anull'), '-ar', '44100', tmp], check=True)
        x = load(tmp); pk = np.abs(x).max() + 1e-9; g = 10 ** (-6 / 20) / pk
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'volume={g:.4f},apad=pad_dur=0.3', '-ac', '2', '-b:a', '160k', dst], check=True)
        os.remove(tmp)
    elif kind == 'bed':   # 10 s, loudness-matched
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '3', '-t', '10', '-i', src, '-af',
                        'afade=t=in:d=0.6,afade=t=out:st=9:d=1,loudnorm=I=-26:TP=-3', '-ac', '2', '-b:a', '160k', dst], check=True)
    else:                 # music: 22 s from 20 s in, loudness-matched
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '20', '-t', '22', '-i', src, '-af',
                        'afade=t=in:d=1,afade=t=out:st=20:d=2,loudnorm=I=-18:TP=-2', '-ac', '2', '-b:a', '192k', dst], check=True)

UI = [  # id, name, the moment it is for, uisfx cue
  ('tap', 'Tap', 'A button or control is pressed.', 'press'),
  ('select', 'Select / found', 'Something gets picked out: a word found, an item highlighted.', 'select'),
  ('appear', 'Appear / open', 'An element appears or grows: a card opens, a sheet rises.', 'expand'),
  ('land', 'Land / place', 'Something settles into place: a pin drops, a card lands in a day.', 'drop'),
  ('lift', 'Lift', 'Something is picked up off the screen.', 'drag-start'),
  ('confirm', 'Confirm / done', 'An action succeeds: saved, added, done.', 'success'),
  ('notify', 'Notification', 'A message or alert arrives.', 'notification'),
  ('toggle', 'Toggle', 'A switch flips on.', 'toggle-on'),
  ('typing', 'Typing', 'Text is typed into a field.', 'typing'),
  ('error', 'Not found / error', 'Something fails or is missing.', 'error'),
  ('swipe', 'Swipe', 'A quick slide across the screen.', 'swipe'),
  ('send', 'Send / travel off', 'Something is sent or leaves toward somewhere else.', 'send'),
]
LP = 'lowpass=f=3500,volume=0.9'
MOTION = [
  ('whoosh-small', 'Small move', 'An object travels across the frame.', [
      ('fast whoosh, softened', f'{LIB}/cstack-cc0/whoosh-fast.flac', LP), ('fast whoosh', f'{LIB}/cstack-cc0/whoosh-fast.flac', None),
      ('air slice, softened', f'{LIB}/cstack-cc0/blade-slice.flac', 'lowpass=f=4000'), ('cinematic swipe', f'{U}/cinematic/swipe.mp3', None)]),
  ('whoosh-large', 'Camera move', 'The camera travels: a tilt, a pull back, a transition.', [
      ('deep whoosh', f'{LIB}/cstack-cc0/whoosh-deep.flac', None), ('deep whoosh, softened', f'{LIB}/cstack-cc0/whoosh-deep.flac', 'lowpass=f=1800'),
      ('wing flutter, softened', f'{LIB}/cstack-cc0/wing-flutter.flac', 'lowpass=f=2500'), ('cinematic forward', f'{U}/cinematic/forward.mp3', None)]),
]
BEDS = ('ambience', 'Background bed', 'A quiet bed under the whole film from the app’s world (no music).', [
  ('city at night', f'{LIB}/cstack-cc0/city-night.flac'), ('ocean surface', f'{LIB}/cstack-cc0/ocean-surface.flac'),
  ('deep underwater', f'{LIB}/cstack-cc0/underwater-deep.flac'), ('low electrical hum', f'{LIB}/cstack-cc0/electrical-hum.flac')])
MUSIC = ('music', 'Music bed', 'Calm music under the film (shortlisted by measurement: slow, sparse, no bounce). Kevin MacLeod, CC BY 4.0.', [
  ('Bathed in the Light', f'{MUS}/Bathed_in_the_Light.mp3'), ('Floating Cities', f'{MUS}/Floating_Cities.mp3'),
  ('Healing', f'{MUS}/Healing.mp3'), ('Clean Soul', f'{MUS}/Clean_Soul.mp3')])

cats = []
for cid, name, moment, cue in UI:
    opts = []
    for p in PACKS:
        f = f'{U}/{p}/{cue}.mp3'
        if os.path.exists(f):
            m = measure(f); opts.append((m['brightness_hz'] / 1000 + m['ring_s'] * 3, p, f, m))
    opts.sort()
    pick = opts[:4]
    out = []
    for _, p, f, m in pick:
        dst = f'clips/{cid}/{p}.mp3'; clip(f, os.path.join(HERE, dst), 'sfx')
        out.append({'key': p, 'label': f'{p} pack', 'file': dst, 'source': f'uisfx/{p}/{cue}.mp3', 'licence': 'CC0', 'measured': m, 'words': words(m)})
    cats.append({'id': cid, 'name': name, 'moment': moment, 'group': 'Interface', 'options': out})
for cid, name, moment, srcs in MOTION:
    out = []
    for i, (label, f, filt) in enumerate(srcs):
        dst = f'clips/{cid}/{i}.mp3'; clip(f, os.path.join(HERE, dst), 'sfx', filt)
        m = measure(os.path.join(HERE, dst))
        out.append({'key': str(i), 'label': label, 'file': dst, 'source': os.path.relpath(f, '/home/user/video-editor') + (f' + {filt}' if filt else ''), 'licence': 'CC0', 'measured': m, 'words': words(m)})
    cats.append({'id': cid, 'name': name, 'moment': moment, 'group': 'Motion', 'options': out})
for (cid, name, moment, srcs), kind, grp in ((BEDS, 'bed', 'Beds'), (MUSIC, 'music', 'Beds')):
    out = []
    for i, (label, f) in enumerate(srcs):
        dst = f'clips/{cid}/{i}.mp3'; clip(f, os.path.join(HERE, dst), kind)
        out.append({'key': str(i), 'label': label, 'file': dst, 'source': os.path.relpath(f, '/home/user/video-editor'),
                    'licence': 'CC BY 4.0 (credit Kevin MacLeod)' if kind == 'music' else 'CC0'})
    cats.append({'id': cid, 'name': name, 'moment': moment, 'group': grp, 'options': out})
json.dump(cats, open(os.path.join(HERE, 'candidates.json'), 'w'), indent=1)
print(sum(len(c['options']) for c in cats), 'clips in', len(cats), 'categories')
for c in cats: print(c['id'], [o['label'] + ' (' + o.get('words', '') + ')' for o in c['options']])

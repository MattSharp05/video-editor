# Stolen Smile 2 sound: voice up front, Floating Cities (Kevin MacLeod, CC BY 4.0) ducked under speech the series way
# (+12 dB, gentle sidechain), and a few soft effects, each with a visible cause, timed from src/beats.json.
# Series sounds come from the kit palette (projects/stolen-smile-kit/film-kit/sound/<name>.wav) when it exists; otherwise a
# synthesized stand-in of the same name is made here (numpy). CC0 library only otherwise. usage: python3 mix.py [music_db] [stems]
import json, os, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); W = f'{HERE}/work'; os.makedirs(W, exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']
KIT = f'{HERE}/series'   # copy of the kit's sound palette (film-kit/sound), same files and gains in every part
sys.path.insert(0, KIT)
from series_sfx import build_sfx
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
SR = 48000

def env(n, a=0.004, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / r)

def synth(name):
    """Stand-ins in the series' spirit: soft, short, dark-warm."""
    rng = np.random.default_rng(abs(hash(name)) % 2**32)
    if name == 'hook-clink':
        n = int(0.5 * SR); t = np.arange(n) / SR
        x = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(2350, 0.5), (3710, 0.25), (5200, 0.12)]) * env(n, 0.002, 0.09)
    elif name == 'glint':
        n = int(0.7 * SR); t = np.arange(n) / SR
        x = (np.sin(2 * np.pi * 1760 * t) + 0.4 * np.sin(2 * np.pi * 2640 * t)) * env(n, 0.01, 0.2) * 0.5
    elif name == 'question-plink':
        n = int(0.5 * SR); t = np.arange(n) / SR
        x = (np.sin(2 * np.pi * 392 * t) + 0.3 * np.sin(2 * np.pi * 784 * t)) * env(n, 0.003, 0.12)
    elif name == 'stamp':
        n = int(0.3 * SR); x = rng.normal(0, 1, n) * env(n, 0.001, 0.03)
        t = np.arange(n) / SR; x = 0.6 * x + np.sin(2 * np.pi * 90 * t) * env(n, 0.002, 0.08)
    elif name in ('paper-flap', 'cloth-swish'):
        n = int(0.45 * SR); x = rng.normal(0, 1, n)
        x = np.convolve(x, np.ones(30) / 30, 'same') * np.sin(np.linspace(0, np.pi, n)) ** 2
    elif name == 'calendar-tear':
        n = int(0.25 * SR); x = rng.normal(0, 1, n) * (rng.random(n) < 0.3) * np.sin(np.linspace(0, np.pi, n))
        x = np.convolve(x, np.ones(6) / 6, 'same')
    elif name == 'gauge-ratchet':
        n = int(1.0 * SR); x = np.zeros(n)
        for k in range(14):
            i = int(k * 0.07 * SR); m = min(n - i, 600); x[i:i + m] += rng.normal(0, 1, m) * env(m, 0.0005, 0.004)
    elif name == 'typewriter':
        n = int(1.0 * SR); x = np.zeros(n)
        for k in range(9):
            i = int(k * 0.105 * SR); m = 1200; x[i:i + m] += rng.normal(0, 1, m) * env(m, 0.0005, 0.006)
    elif name == 'sting-smile':
        n = int(2.5 * SR); t = np.arange(n) / SR; x = np.zeros(n)
        for k, f in enumerate([523.25, 659.25, 783.99, 659.25]):
            i = int(k * 0.42 * SR); m = n - i; tt = t[:m]
            x[i:] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * env(m, 0.003, 0.5) * 0.35
    elif name == 'knock':
        n = int(0.5 * SR); x = np.zeros(n); t = np.arange(1500) / SR
        for i in (0, int(0.18 * SR)):
            x[i:i + 1500] += np.sin(2 * np.pi * 140 * t) * env(1500, 0.001, 0.02) + rng.normal(0, 0.3, 1500) * env(1500, 0.0005, 0.006)
    elif name == 'door':
        n = int(0.6 * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * 70 * t) * env(n, 0.002, 0.1) + rng.normal(0, 0.15, n) * env(n, 0.001, 0.04)
    elif name == 'flash':
        n = int(0.4 * SR); x = rng.normal(0, 1, n) * env(n, 0.001, 0.06); x = np.convolve(x, np.ones(4) / 4, 'same')
    elif name == 'ink-drop':
        n = int(0.4 * SR); t = np.arange(n) / SR; f = 900 * np.exp(-t * 18) + 300
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.05)
    else:
        raise SystemExit(f'no sound {name}')
    x = x / (np.abs(x).max() + 1e-9) * 0.7
    return np.stack([x, x], 1)

def get(name):
    for ext in ('wav', 'flac'):
        p = f'{KIT}/{name}.{ext}'
        if os.path.exists(p): return p, 'kit'
    p = f'{W}/syn_{name}.wav'
    sf.write(p, synth(name), SR); return p, 'synth'

# (time, sound, gain dB, what you see)
CUES = [
    (B['l0'] + 0.35, 'paper-flap', -24, '"Last time…" card pins up'),
    (B['l0'] + 0.5, 'paper-flap', -26, 'recap flat 1 slides in'),
    (B['l0'] + 1.9, 'cloth-swish', -24, 'recap flat 2: the smock bundle'),
    (B['l0'] + 3.3, 'paper-flap', -26, 'recap flat 3: plumber at the door'),
    (4.55, 'question-plink', -18, 'hooks twist into the "?"'),
    (B['l1'] + 0.05, 'sting-smile', -16, 'title plaque drops onto the "?"'),
    (B['part2'] - 0.05, 'typewriter', -24, '"Part two: the hunt" typed'),
    (7.95, 'stamp', -26, 'magnifier lands on the floor'),
    (B['l2'] + 0.2, 'door', -24, "the Louvre's front swings open"),
    (B['week'] - 0.1, 'calendar-tear', -24, 'calendar Day 1…7'),
    (B['week'] + 1.0, 'calendar-tear', -26, 'calendar tears'),
    (B['l3'] - 0.75, 'paper-flap', -22, 'last page flies into the press'),
    (B['world'] - 0.1, 'paper-flap', -22, 'pages fold into birds'),
    (B['suddenly'], 'gauge-ratchet', -20, 'fame gauge swings to the globe'),
    (B['postcards'], 'paper-flap', -24, 'postcard stand spins'),
    (B['crowds'], 'cloth-swish', -26, 'hats come off'),
    (B['kafka'] + 0.12, 'flash', -22, 'camera flash on Kafka'),
    (B['arrest'] - 0.1, 'question-plink', -18, '"?" lands on the poet'),
    (B['lock'], 'door', -20, 'cell door of poem lines shuts'),
    (B['days'] - 0.3, 'calendar-tear', -24, 'a few days tear'),
    (B['l8'] + 0.3, 'question-plink', -19, '"?" hops to Picasso'),
    (B['neither'] + 0.2, 'stamp', -16, '"Not him" stamp'),
    (B['neither'] + 0.75, 'stamp', -17, '"Not him" stamp'),
    (B['letgo'], 'door', -22, 'cell door opens'),
    (B['thumb'] - 0.1, 'glint', -26, 'the dusted print appears'),
    (B['l11'] - 0.2, 'paper-flap', -22, 'ridges straighten into drawers'),
    (B['notfp'], 'question-plink', -22, 'the print shrugs: no drawer fits'),
    (B['knock'] + 0.05, 'knock', -14, 'knock at the door'),
    (B['leave'] - 0.3, 'cloth-swish', -24, 'trunk lid snaps shut'),
    (B['l13'] + 0.2, 'question-plink', -18, 'giant "?" over Paris'),
    (B['hidden'] + 0.1, 'cloth-swish', -22, 'lid lifts: she is inside'),
    (B['same'] + 0.4, 'glint', -16, 'her glint'),
    (B['months'], 'calendar-tear', -22, '1911 → 1912'),
    (B['years'], 'calendar-tear', -22, '1912 → 1913'),
    (B['l16'] - 0.05, 'paper-flap', -20, 'the poster tears off and flies'),
    (B['florence'] + 1.6, 'paper-flap', -24, 'envelope lands on the desk'),
    (B['letter'] + 0.1, 'cloth-swish', -24, 'letter opener slits the envelope'),
    (B['leonardo'] + 0.7, 'glint', -18, 'amber glint on the signature'),
    (B['leonardo'] + 1.35, 'ink-drop', -18, 'ink drop lands'),
    (T - 1.9, 'stamp', -18, 'end card pinned'),
]
SERIES = set(json.load(open(f'{KIT}/series.json'))['sounds'])
# title typewriter: one clack per typed letter, the kit's titleCardTimes (typeAt = at+16 frames, 2 frames a letter)
at = round((B['l1'] + 0.05) * 30) + 16
label = 'Part two: the hunt'
CUES = [c for c in CUES if c[1] != 'typewriter'] + [((at + i * 2) / 30, 'typewriter', 0, 'title letter typed') for i, ch in enumerate(label) if ch != ' ']
CUES += [(B['l0'], 'hook-hum', 0, 'the four empty hooks'), (B['l15'] - 0.2, 'hook-hum', 0, 'empty hooks under the web'),
         (B['look'] + 0.8, 'amber-shimmer', 0, 'trunk crack glows hot as the detective nears'), (B['l14'] + 0.2, 'amber-shimmer', 0, 'trunk still glowing at the window')]
CUES.sort(key=lambda c: c[0])
ser = [c for c in CUES if c[1] in SERIES]; part = [c for c in CUES if c[1] not in SERIES]
build_sfx([{'sound': c[1], 'fr': round(c[0] * 30), 'gain_db': 0} for c in ser], round(T * 30), f'{W}/sfx_series.wav', fps=30)
used = {c[1]: 'kit' for c in ser}
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample={SR},aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
args += ['-i', f'{W}/sfx_series.wav']
fc.append(f'[2]aresample={SR},aformat=channel_layouts=stereo[ser]')
mix = ['[voA]', '[mduck]', '[ser]']
for i, (t, name, g, note) in enumerate(part):
    p, src = get(name); used[name] = src
    args += ['-i', p]
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 3}]aresample={SR},aformat=channel_layouts=stereo,lowpass=f=7000,volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]alimiter=limit=0.89:attack=2:release=40:level=false[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{W}/stem_voice.wav', '-map', '[mduck]', f'{W}/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', str(SR), f'{W}/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'sound': c[1], 'gain_db': 0 if c[1] in SERIES else c[2], 'source': used[c[1]], 'what': c[3]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues;', {k: v for k, v in used.items()})

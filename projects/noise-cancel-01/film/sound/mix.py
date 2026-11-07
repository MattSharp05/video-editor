# Noise cancel 01 sound: voice up front; Floating Cities (Kevin MacLeod, CC BY 4.0) ducked by phrase; a synthesized
# engine HUM bed that tells the story (steady in the cabin, cut by most of its level the moment push meets pull,
# low inside the calm bubble, back for the engine shot, swelling outside the plane); synthesized music-box plinks on the
# notes; quiet CC0 effects on the events, timed from beats.json and out/events.json (the picture's own numbers).
# usage (from film/): $PY sound/mix.py [music_db] [stems]      PY = the voice venv (numpy, soundfile)
import json, os, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); W = f'{HERE}/work'; os.makedirs(W, exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']
E = json.load(open(f'{HERE}/../out/events.json'))
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 10
STEM = len(sys.argv) > 2
SR = 48000

# ---- synthesized hum bed: the noise of the film ----
n = int(T * SR); tt = np.arange(n) / SR
rng = np.random.default_rng(7)
brown = np.cumsum(rng.standard_normal(n)); brown -= np.convolve(brown, np.ones(4800) / 4800, 'same'); brown /= np.abs(brown).max() + 1e-9
hum = (0.55 * np.sin(2 * np.pi * 98 * tt) + 0.35 * np.sin(2 * np.pi * 196 * tt + 0.4) + 0.18 * np.sin(2 * np.pi * 294 * tt + 1.1)) * (1 + 0.08 * np.sin(2 * np.pi * 0.7 * tt))
hum = hum * 0.6 + 0.5 * brown
def env(points):  # [(time, dB)] linear in dB between points
    ts, ds = zip(*points); return 10 ** (np.interp(tt, ts, ds) / 20)
L7, L11 = E['L7'], E['L11']
g = env([(0, -60), (0.6, -6), (B['actually'], -6), (B['l2'] - 0.5, -8), (L7['popT'] - 0.05, -6), (L7['popT'] + 0.12, -22), (B['l7'], -22),
         (B['best'] - 0.2, -22), (B['best'] + 0.6, -10), (B['l9'], -12), (B['l10'], -18), (L11['punch'], -18), (L11['punch'] + 0.15, -26), (L11['out0'] + 0.5, -14), (T - 1.2, -10), (T, -60)])
hum = hum * g * 0.12
sf.write(f'{W}/hum.wav', np.stack([hum, hum], 1).astype(np.float32), SR)

# ---- music-box plinks for the notes (pentatonic, soft attack, short ring) ----
box = np.zeros(n)
scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]
for i, nt in enumerate(E['NOTES']):
    t0 = nt['spawn'] + 0.05; f = scale[(i * 3) % len(scale)]; k = int(t0 * SR); d = int(0.6 * SR)
    if k + d > n: continue
    x = np.arange(d) / SR; s = (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(2 * np.pi * 2 * f * x)) * np.exp(-x * 7) * np.minimum(1, x / 0.004)
    box[k:k + d] += s * 0.05
sf.write(f'{W}/box.wav', np.stack([box, box], 1).astype(np.float32), SR)

P = lambda r: f'asetrate=48000*{r},aresample=48000'
items = E['BELT']['items']
CUES = [
 *[(0.14 + i * 0.4, f'{L}/screen-tap.flac', f'lowpass=f=2500,{P(0.8 + 0.05 * (i % 3))}', -26, 'noise squiggle pings off the brick cup') for i in range(4)],
 (B['block'], f'{L}/rubber-stamp.flac', f'lowpass=f=3000,{P(0.85)}', -14, 'BLOCK stamp lands on the brick cup'),
 (E['L2']['pop'], f'{L}/bubbles-burst.flac', 'lowpass=f=4000,atrim=0:0.5,afade=t=out:st=0.35:d=0.15', -14, 'thought bubble pops'),
 *[(tw['launch'], f'{L}/pop-soft.flac', f'lowpass=f=3000,{P(1.15 + 0.1 * i)}', -19, 'speaker fires a twin (backflip)') for i, tw in enumerate(E['L2']['twin'])],
 (E['L3']['dive0'] + 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=1800,afade=t=in:d=0.2', -26, 'dive into the squiggle: the line becomes air'),
 *[(c, f'{L}/pop-soft.flac', f'lowpass=f=2500,{P(0.9 + 0.08 * i)}', -21, f'mic {i} catches a squiggle') for i, c in enumerate(E['L4']['catch'])],
 (B['chip5'], f'{L}/relay-click.flac', 'lowpass=f=2500', -17, 'chip wakes up'),
 *[(it['flip'], f'{L}/card-riffle.flac', f'atrim=0:0.12,afade=t=out:st=0.06:d=0.06,lowpass=f=3000,{P(0.9 + 0.04 * (j % 4))}', -27, 'spatula flips a slice')
   for j, it in enumerate(items) if it['kind'] == 'slice' and (it['flip'] < B['where'] or B['knows'] < it['flip'] < B['l8'])][:8],
 *[(it['flip'] + 0.05, f'{L}/pop-soft.flac', f'lowpass=f=3500,{P(1.3)}', -22, 'note spared: hops over the spatula') for it in items if it['kind'] == 'note'],
 (L7['popT'], f'{L}/pop-soft.flac', f'lowpass=f=2200,{P(0.7)}', -10, 'PUSH MEETS PULL: both squiggles flatten and pop, the eardrum stops'),
 *[(tp, f'{L}/pop-soft.flac', f'lowpass=f=2500,{P(0.95 + 0.07 * i)}', -24, 'squiggle pops at the calm bubble edge') for i, tp in enumerate(E['CALMPOPS'])],
 *[(e['pop'], f'{L}/pop-soft.flac', f'lowpass=f=2000,{P(0.85)}', -25, 'engine metronome pop') for e in E['ENGINE'][1::2]],
 *[(v['lop'], f'{L}/rubber-stamp.flac', f'lowpass=f=1500,{P(1.2)}', -26, 'voice and late copy collide lopsided') for v in E['VOICES'][::2]],
 *[(d['t0'], f'{L}/impact-deep.flac', 'lowpass=f=900,atrim=0:0.5,afade=t=out:st=0.3:d=0.2', -22, 'voice squiggle plunges into the cushion') for d in E['DENTS']],
 (E['BRICK']['on'], f'{L}/rubber-stamp.flac', f'lowpass=f=2500,{P(0.8)}', -19, 'cushion flashes BLOCK'),
 (L11['mics'], f'{L}/pop-soft.flac', f'lowpass=f=3000,{P(1.1)}', -21, 'mics pop up (listen)'),
 (L11['flip'], f'{L}/card-riffle.flac', 'atrim=0:0.15,afade=t=out:st=0.08:d=0.07,lowpass=f=3000', -21, 'spatula flips (flip)'),
 (L11['punch'], f'{L}/pop-soft.flac', f'lowpass=f=2400,{P(0.75)}', -11, 'gloved squiggles punch and pop (fight)'),
 (L11['punch'], f'{L}/impact-deep.flac', 'lowpass=f=700,atrim=0:0.6,afade=t=out:st=0.4:d=0.2', -20, 'punch body'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC, '-i', f'{W}/hum.wav', '-i', f'{W}/box.wav']
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]',
      f'[2]aformat=channel_layouts=stereo,atrim=0:{T}[hum]', f'[3]aformat=channel_layouts=stereo,atrim=0:{T}[box]']
mix = ['[voA]', '[mduck]', '[hum]', '[box]']
for c in CUES: args += ['-i', c[1]]
for i, (t, src, flt, gdb, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 4}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={gdb}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{W}/stem_voice.wav', '-map', '[mduck]', f'{W}/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{W}/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4], 'src': os.path.basename(c[1]), 'db': c[3]} for c in CUES]
          + [{'t': 0, 'note': 'synth hum bed (98/196/294 Hz + brown noise), level follows the cancel', 'src': 'synth', 'db': None},
             {'t': E['NOTES'][0]['spawn'], 'note': 'synth music-box plinks on each note', 'src': 'synth', 'db': None}], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues')

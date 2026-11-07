# Black hole 01 sound: voice up front, Floating Cities (CC BY 4.0) clearly audible under it, a synthesized deep drone for
# the hole (swells when the camera is close, darkens at the giant hole), clock ticks that follow the dials on screen
# (one sound per state: the friend's clock ticks every second; yours, seen from far, ticks once and stops; your own
# watch ticks every second), and a few soft effects on the picture's events (beats.json). CC0 library + synthesized.
# usage (from film/): ../vo/.venv-qw/bin/python sound/mix.py [music_db] [stem]
import json, math, os, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); W = f'{HERE}/work'; os.makedirs(W, exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']; SR = 48000
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
t = np.arange(int(T * SR)) / SR
sm = lambda x: x * x * (3 - 2 * x)
rise = lambda a, d: sm(np.clip((t - a) / d, 0, 1))
win = lambda a, b, f=0.5: np.minimum(rise(a, f), 1 - rise(b - f, f))

# --- the drone: low partials with slow beating plus filtered noise; louder near the hole, deeper when it's giant ---
rng = np.random.default_rng(3)
noise = np.convolve(rng.standard_normal(len(t)), np.ones(400) / 400, 'same')   # crude low-pass
giant = rise(B['giant'] - 0.4, 2.6)
f0 = 41 * (1 - 0.25 * giant)
ph = 2 * np.pi * np.cumsum(f0) / SR
drone = np.sin(ph) + 0.5 * np.sin(2.003 * ph) + 0.25 * np.sin(3.01 * ph + 1) + 6 * noise
near = 0.55 + 0.25 * win(B['edge'] - 0.5, B['shines'] + 1.0, 1.0) + 0.3 * giant - 0.25 * win(B['friend'], B['watch'], 0.6)
drone *= near * (1 + 0.15 * np.sin(2 * np.pi * 0.13 * t)) * np.clip(t / 1.0, 0, 1)
sf.write(f'{W}/drone.wav', (drone / np.abs(drone).max() * 0.5).astype(np.float32), SR)

# --- ticks from the dials (same numbers as Film.tsx) ---
tick, sr = sf.read(f'{L}/clock-tick.flac', dtype='float32'); tick = tick.mean(1) if tick.ndim > 1 else tick
tick = tick[:int(0.12 * sr)] * np.hanning(int(0.12 * sr) * 2)[int(0.12 * sr):]
if sr != SR: tick = np.interp(np.arange(int(len(tick) * SR / sr)) * sr / SR, np.arange(len(tick)), tick)
ticks = np.zeros((len(t), 2), np.float32)
def put(at, gain, pan, pitch=1.0):
    x = np.interp(np.arange(int(len(tick) / pitch)) * pitch, np.arange(len(tick)), tick) * gain
    i = int(at * SR); n = min(len(x), len(ticks) - i)
    ticks[i:i + n, 0] += x[:n] * (1 - pan) ; ticks[i:i + n, 1] += x[:n] * (1 + pan)
t0 = B['friend'] + 0.3
k = 1
while t0 + k < B['watch'] - 0.1: put(t0 + k, 1.0, -0.5); k += 1          # the friend's clock: every second
for k in (1,):                                                            # yours, seen from far: one slow tick, then none
    put(t0 - math.log(1 - 0.55 * k) / 0.55, 0.7, 0.5, 0.8)
k = 1
while B['watch'] + k < B['small'] - 0.2: put(B['watch'] + k, 1.0, 0.0); k += 1   # your own watch: every second
sf.write(f'{W}/ticks.wav', (ticks / np.abs(ticks).max() * 0.5), SR)

CUES = [  # (time, source, filter chain, gain dB, note)
 (0.0, f'{W}/drone.wav', 'lowpass=f=260', -17, 'the hole: a deep drone all film (synthesized)'),
 (0.0, f'{W}/ticks.wav', 'lowpass=f=3500', -24, 'clock ticks from the dials: friend every second, yours once, your watch every second'),
 (B['you'] - 0.3, f'{L}/whoosh-fast.flac', 'lowpass=f=1800', -26, 'you turn to the camera'),
 (B['star'] - 0.8, f'{L}/whoosh-deep.flac', 'lowpass=f=1200,asetrate=48000*0.8,aresample=48000', -19, 'pull back; the star appears'),
 (B['dies'] - 0.05, f'{L}/impact-deep.flac', 'lowpass=f=900,asetrate=48000*0.7,aresample=48000,afade=t=out:st=2.5:d=1.5', -17, 'the star flashes'),
 (B['crush'] - 0.2, 'syn:brown', 'atrim=0:1.4,lowpass=f=300,afade=t=in:d=1.2,afade=t=out:st=1.25:d=0.15', -16, 'the star caves in (synthesized)'),
 (B['tiny'] + 0.12, f'{L}/impact-deep.flac', 'lowpass=f=1400', -18, 'collapse: the hole is born'),
 (B['edge'] - 0.6, f'{L}/whoosh-fast.flac', 'lowpass=f=1500,asetrate=48000*0.85,aresample=48000', -24, 'the rock falls in'),
 (B['cant'] - 0.2, f'{L}/whoosh-deep.flac', 'highpass=f=400,lowpass=f=3000,asetrate=48000*1.3,aresample=48000', -27, 'the fan of light shoots out and bends'),
 (B['faster'] - 0.1, f'{L}/underwater-deep.flac', 'atrim=2:7,lowpass=f=700,afade=t=in:d=0.8,afade=t=out:st=4:d=1', -25, 'the river of space'),
 (B['glow'] - 0.4, f'{L}/whoosh-deep.flac', 'lowpass=f=1400', -21, 'the camera cranes over the disk'),
 (B['drain'] - 0.6, f'{L}/underwater-deep.flac', 'atrim=10:15,lowpass=f=500,afade=t=in:d=1,afade=t=out:st=3.5:d=1.5', -24, 'gas swirls down the drain'),
 (B['rubs'] + 0.2, f'{L}/electric-spark-crackle.flac', 'lowpass=f=2400,afade=t=out:st=0.9:d=0.5', -28, 'gas bits rub and spark'),
 (B['fall'] - 0.3, f'{L}/whoosh-deep.flac', 'lowpass=f=1600', -20, 'back to you; you tip feet first'),
 (B['harder'] - 0.1, f'{L}/ship-creak.flac', 'lowpass=f=1800,asetrate=48000*0.75,aresample=48000', -24, 'you stretch long and thin'),
 (B['friend'] - 0.2, f'{L}/whoosh-deep.flac', 'lowpass=f=1500,asetrate=48000*0.9,aresample=48000', -19, 'fly back to the friend\'s ship'),
 (B['red'] - 0.1, 'syn:brown', 'atrim=0:2.2,lowpass=f=180,afade=t=in:d=0.3,afade=t=out:st=0.7:d=1.5', -22, 'you redden and fade (synthesized)'),
 (B['watch'] - 0.35, f'{L}/whoosh-fast.flac', 'lowpass=f=2000', -22, 'dive back to your watch'),
 (B['fallin'] - 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=1100,asetrate=48000*0.75,aresample=48000', -19, 'you fall in'),
 (B['small'] - 0.2, f'{L}/whoosh-deep.flac', 'lowpass=f=1300', -23, 'pull back to the stretch zone'),
 (B['giant'] - 0.4, 'syn:brown', 'atrim=0:3.2,lowpass=f=120,afade=t=in:d=2.4,afade=t=out:st=2.6:d=0.6', -14, 'the hole grows giant (synthesized)'),
 (B['giant'] + 2.1, f'{L}/impact-deep.flac', 'lowpass=f=700,asetrate=48000*0.6,aresample=48000', -20, 'giant: the swell lands'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (tt, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=4:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
for i, (tt, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, tt) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{W}/stem_voice.wav', '-map', '[mduck]', f'{W}/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{W}/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues;', round(len(CUES) / T * 10, 1), 'per 10 s')

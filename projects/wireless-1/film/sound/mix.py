# Caught by Wireless 1 sound: voice up front (high-pass, one static +10 dB gain, no compressor), Floating Cities (Kevin
# MacLeod, CC BY 4.0) at +10 dB (measured ~10.5 dB under speech) with the series' gentle sidechain duck (threshold 0.06, ratio 3; same chain as parts 2–3),
# fades in/out; effects = the kit's series sounds (film-kit/sound, CC0/synth, series gains) from sound/cues.json (built
# from src/p1/cues.ts, the same numbers the picture uses), plus two local synthesized foley cues (knock, brick).
# usage: python3 mix.py [music_db] [stems]
import json, os, subprocess, sys, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); W = f'{HERE}/work'; os.makedirs(W, exist_ok=True)
KIT = '/home/user/video-editor/projects/wireless-kit/film-kit/sound'
sys.path.insert(0, KIT)
from series_sfx import build_sfx
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']; FPS = 30; SR = 48000
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 10
STEM = len(sys.argv) > 2
cues = json.load(open(f'{HERE}/cues.json'))
kit = [c for c in cues if not c['sound'].startswith('local:')]
local = [c for c in cues if c['sound'].startswith('local:')]
sfx = build_sfx(kit, round(T * FPS), f'{W}/sfx_kit.wav', fps=FPS) or f'{W}/sfx_kit.wav'

# local synthesized foley (soft, dark-warm, short): three wood knocks; one low brick "tock" with a little grit
def knock(seed):
    r = np.random.default_rng(seed); n = int(0.09 * SR); tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * (180 + r.uniform(-10, 10)) * tt) * np.exp(-tt * 55) + 0.4 * np.sin(2 * np.pi * 410 * tt) * np.exp(-tt * 90)
    return body + 0.15 * r.standard_normal(n) * np.exp(-tt * 200)
def brick():
    r = np.random.default_rng(5); n = int(0.35 * SR); tt = np.arange(n) / SR
    s = np.zeros(n)
    for k, d in enumerate([0, 0.11, 0.2]):
        i = int(d * SR); m = n - i; u = np.arange(m) / SR
        s[i:] += (0.9 - 0.25 * k) * (np.sin(2 * np.pi * 95 * u) * np.exp(-u * 40) + 0.2 * r.standard_normal(m) * np.exp(-u * 120))
    return s
x = np.zeros(int(round(T * SR)))
for c in local:
    i = int(round(c['fr'] / FPS * SR))
    if c['sound'] == 'local:knock':
        for k, d in enumerate([0, 0.22, 0.44]):
            y = knock(k) * 0.22; j = i + int(d * SR); x[j:j + len(y)] += y[:len(x) - j]
    else:
        y = brick() * 0.16; x[i:i + len(y)] += y[:len(x) - i]
lw = f'{W}/sfx_local.wav'
with wave.open(lw, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())

args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC, '-i', f'{W}/sfx_kit.wav', '-i', lw]
fc = [f'[0]aresample={SR},aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]',
      f'[2]aresample={SR},aformat=channel_layouts=stereo[fx]', f'[3]aresample={SR},aformat=channel_layouts=stereo,lowpass=f=5000[lfx]',
      f'[voA][mduck][fx][lfx]amix=inputs=4:normalize=0:duration=first,atrim=0:{T}[pre]',
      '[pre]alimiter=limit=0.89:attack=2:release=40:level=false[out]']
if STEM:
    subprocess.run(args + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{W}/stem_voice.wav', '-map', '[mduck]', f'{W}/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', str(SR), f'{W}/mix.wav'], check=True)
print(len(cues), 'cues ->', f'{W}/mix.wav')

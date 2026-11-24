# s1 Heart in the middle sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under speech, and soft
# sounds with a visible cause, timed from the same words as the picture (src/words.json; offsets mirror src/timeline.ts).
# CC0 library (library/sfx/cstack-cc0) + synthesized (numpy: heartbeat, chest pushes; labelled 'syn').
# usage: python3 mix.py [music_dB] [stem]
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
W = json.load(open(f'{HERE}/../src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
def cue(p, nth=0):
    ps = [norm(x) for x in p.split()]; hits = [W[i]['s'] for i in range(len(W) - len(ps) + 1) if all(norm(W[i + j]['w']) == ps[j] for j in range(len(ps)))]
    return hits[nth]
VO_END = W[-1]['e']; T = VO_END + 2.2   # = DUR_S in timeline.ts
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 7
STEM = len(sys.argv) > 2
SR = 48000
# beats (same formulas as timeline.ts)
look, middle, leans, matters, dont, centre, blood = cue('Look inside.'), cue('near the middle'), cue('leans'), cue('And that matters'), cue("Don't push"), cue('lower half'), cue('some blood')
CUT_CPR = matters - 0.12
BPM = 70; PER = 60 / BPM; CPR_HZ = 110 / 60
WP = 0.55   # whoosh-deep.flac peaks 0.55 s in
# --- synthesized beds (numpy)
t = np.arange(int(T * SR)) / SR
def thump(f0, dur, decay, at, gain):
    y = np.zeros_like(t); i0 = int(at * SR); n = min(int(dur * SR), len(t) - i0)
    if n <= 0: return y
    tt = np.arange(n) / SR; f = f0 * (1 + 0.6 * np.exp(-tt * 30))
    y[i0:i0 + n] = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * decay) * (1 - np.exp(-tt * 400)) * gain; return y
hb = np.zeros_like(t)
k = 0
while True:
    a = k * PER + 0.05 * PER
    if a > CUT_CPR - 0.1: break
    hb += thump(55, 0.25, 22, a, 1.0) + thump(65, 0.2, 26, a + 0.15 * PER, 0.6); k += 1
sf.write(f'{HERE}/work/heartbeat.wav', hb.astype(np.float32), SR)   # syn: heartbeat under the standing shot
pp = np.zeros_like(t); a0 = centre + 0.2; k = 0
while a0 + (k + 0.225) / CPR_HZ < T - 0.3:
    at = a0 + (k + 0.225) / CPR_HZ; g = min(1, max(0, (T - 0.6 - at) / 0.6))
    pp += thump(70, 0.22, 20, at - 0.03, 0.8 * g) + 0.0; k += 1
noise = np.random.default_rng(3).standard_normal(len(t)) * 0.0   # placeholder (kept silent)
sf.write(f'{HERE}/work/pushes.wav', (pp + noise).astype(np.float32), SR)   # syn: dull chest pushes
CUES = [
 (0.0, f'{HERE}/work/heartbeat.wav', 'lowpass=f=220', -9, 'syn heartbeat, 70 bpm, stops on the cut'),
 (look - 0.05, f'{L}/glass-ting.flac', 'lowpass=f=4000,afade=t=out:st=0.6:d=0.8', -26, 'skin turns to glass'),
 (middle - 0.15, f'{L}/whoosh-fast.flac', 'lowpass=f=2000', -27, 'centre line sweeps down'),
 (leans - 0.05, f'{L}/whoosh-deep.flac', 'lowpass=f=900,asetrate=48000*0.8,aresample=48000', -27, 'the heart tips left'),
 (CUT_CPR - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1600', -21, 'cut to the lying body'),
 (dont + 0.05, f'{L}/impact-deep.flac', 'lowpass=f=500', -30, 'the hand lands on the left'),
 (0.0, f'{HERE}/work/pushes.wav', 'lowpass=f=300', -10, 'syn chest pushes, 110/min'),
 (blood - 0.3, 'syn:brown', 'atrim=0:2.4,lowpass=f=140,afade=t=in:d=0.6,afade=t=out:st=1.2:d=1.2', -24, 'syn swell: blood to the brain'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (tt, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=6:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
for i, (tt, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, tt) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4], 'src': c[1].split('/')[-1]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
n_ev = k + len(CUES)
print(len(CUES), 'cue tracks;', k, 'pushes; total', round(T, 2))

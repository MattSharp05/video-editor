# s1 Knuckle crack sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under speech, and sounds with a
# visible cause, timed from the same words as the picture (src/words.json; offsets mirror src/timeline.ts).
# CC0 library (library/sfx/cstack-cc0) + synthesized (numpy: knuckle cracks; ffmpeg noise beds), labelled 'syn'.
# usage: python3 mix.py [music_dB] [stem]
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
W = json.load(open(f'{HERE}/../src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
def cue(p, nth=0):
    ps = [norm(x) for x in p.split()]; hits = [W[i]['s'] for i in range(len(W) - len(ps) + 1) if all(norm(W[i + j]['w']) == ps[j] for j in range(len(ps)))]
    return hits[nth]
VO_END = W[-1]['e']; T = VO_END + 2.2
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 5
STEM = len(sys.argv) > 2
SR = 48000; WP = 0.55
CUT_IN, CUT_OUT = cue('Each knuckle') - 0.12, cue('One doctor') - 0.12
pull, pressure, pop, takes, neither, lefth, stop = cue('Pull the bones'), cue('pressure'), cue('the pop.') + 0.08, cue("can't crack"), cue('Neither hand'), cue("left hand's"), cue('If it ever')
# --- synthesized knuckle cracks (a sharp, short, slightly resonant click), same times as the picture
t = np.arange(int(T * SR)) / SR; rng = np.random.default_rng(5)
def crack(at, g, pitch=1.0):
    i0 = int(at * SR); n = int(0.06 * SR); tt = np.arange(n) / SR
    burst = rng.standard_normal(n) * np.exp(-tt * 260) + 0.6 * np.sin(2 * np.pi * 900 * pitch * tt) * np.exp(-tt * 120)
    y = np.zeros_like(t); m = min(n, len(t) - i0); y[i0:i0 + m] = burst[:m] * g; return y
cr = np.zeros_like(t)
for i, p in enumerate([1.0, 1.3, 1.6, 1.9]): cr += crack(p, 0.9, 1 + 0.06 * i)          # shot 0 fist (timeline POPS0)
cr += crack(pop, 1.0, 0.8)                                                                   # the pop inside the joint
a, b, per = lefth - 0.2, neither - 0.3, 1.1                                                 # shot 2 left hand (timeline leftCrack)
k = 0
while a + k * per + 0.45 * per < b + 0.8:
    p0 = a + k * per + 0.45 * per
    if p0 > CUT_OUT:
        for i in range(4): cr += crack(p0 + i * 0.06, 0.45, 1.1 + 0.05 * i)
    k += 1
sf.write(f'{HERE}/work/cracks.wav', cr.astype(np.float32), SR)
CUES = [
 (0.0, 'syn:brown', f'atrim=0:{CUT_IN},lowpass=f=300,afade=t=in:d=0.3,afade=t=out:st={CUT_IN - 0.06}:d=0.06', -32, 'syn room tone at the desk'),
 (0.0, f'{HERE}/work/cracks.wav', 'highpass=f=300,lowpass=f=6000', -8, 'syn knuckle cracks (fist, the pop, the left hand)'),
 (CUT_IN - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1600', -21, 'cut inside the knuckle'),
 (CUT_IN, f'{L}/underwater-deep.flac', f'atrim=0:{CUT_OUT - CUT_IN},lowpass=f=500,afade=t=in:d=0.05,afade=t=out:st={CUT_OUT - CUT_IN - 0.08}:d=0.08', -26, 'inside the joint bed'),
 (pull - 0.05, 'syn:brown', 'atrim=0:2.2,lowpass=f=120,afade=t=in:d=0.8,afade=t=out:st=1.2:d=1.0', -22, 'syn stretch: the bones pull apart'),
 (pop - 0.02, f'{L}/pop-soft.flac', 'lowpass=f=3000', -16, 'the bubble forms'),
 (pop + 0.02, f'{L}/bubbles-burst.flac', 'lowpass=f=2500,afade=t=out:st=0.3:d=0.5', -30, 'fizz of gas'),
 (takes - 0.2, 'syn:brown', 'atrim=0:1.8,lowpass=f=100,afade=t=in:d=0.6,afade=t=out:st=0.9:d=0.9', -24, 'syn: second pull, no pop'),
 (takes + 0.2, f'{L}/clock-tick.flac', f'atrim=0:{CUT_OUT - takes - 0.6},afade=t=out:st={CUT_OUT - takes - 1.0}:d=0.4', -28, 'the clock runs'),
 (CUT_OUT - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1600,asetrate=48000*0.9,aresample=48000', -21, 'cut to the desk'),
 (CUT_OUT, 'syn:brown', f'atrim=0:{T - CUT_OUT},lowpass=f=300,afade=t=in:d=0.06,afade=t=out:st={T - CUT_OUT - 1.0}:d=1.0', -32, 'syn room tone at the desk'),
 (neither + 0.05, f'{L}/glass-ting.flac', 'lowpass=f=5000,afade=t=out:st=0.8:d=0.8', -26, 'every knuckle glows: no arthritis'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (tt, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=40:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
for i, (tt, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, tt) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4], 'src': c[1].split('/')[-1]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cue tracks; total', round(T, 2))

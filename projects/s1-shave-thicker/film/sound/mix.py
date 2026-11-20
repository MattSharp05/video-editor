# s1 Shave thicker sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under speech, and sounds with a
# visible cause, timed from the same words as the picture (src/words.json; offsets mirror src/timeline.ts).
# CC0 library (library/sfx/cstack-cc0) + synthesized (numpy: hair snips; ffmpeg noise beds), labelled 'syn'.
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
think, root, hairThat, real, shaveOr, slices, same, coarser = cue("You've probably heard"), cue('The root'), cue("A hair that's"), cue('Hormones at puberty'), cue('So shave'), cue('Shaving slices'), cue('Same width.'), cue('feels coarser')
CUT_ROOT, CUT_TIPS, CUT_END = root - 0.12, hairThat - 0.12, real - 0.12
# blade sweeps (timeline: bladeX ramp(0.15, think+0.6), blade2X ramp(shaveOr-0.1, shaveOr+1.3)); a snip per hair crossing
t = np.arange(int(T * SR)) / SR; rng = np.random.default_rng(9)
def snip(at, g):
    i0 = int(at * SR); n = int(0.025 * SR); tt = np.arange(n) / SR
    y = np.zeros_like(t); m = min(n, len(t) - i0)
    if m > 0: y[i0:i0 + m] = (rng.standard_normal(n) * np.exp(-tt * 300))[:m] * g
    return y
sn = np.zeros_like(t)
for k in range(46): sn += snip(0.25 + (think + 0.45) * (k / 46) ** 1.1 + 0.02 * rng.random(), 0.35 + 0.3 * rng.random())
for k in range(30): sn += snip(shaveOr + 0.05 + 1.2 * (k / 30) + 0.02 * rng.random(), 0.25 + 0.2 * rng.random())
sn += snip(slices - 0.15, 0.9)   # the small blade reaches the right hair (timeline tipBladeX)
sf.write(f'{HERE}/work/snips.wav', sn.astype(np.float32), SR)
CUES = [
 (0.0, 'syn:brown', f'atrim=0:{CUT_ROOT},lowpass=f=260,afade=t=in:d=0.3,afade=t=out:st={CUT_ROOT - 0.06}:d=0.06', -32, 'syn skin room tone'),
 (0.05, f'{L}/blade-slice.flac', 'lowpass=f=5000', -22, 'the blade sweeps in'),
 (0.0, f'{HERE}/work/snips.wav', 'highpass=f=1500,lowpass=f=8000', -14, 'syn hair snips as the blade passes (and the single slice in the tips study)'),
 (CUT_ROOT - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1500', -22, 'cut to the section'),
 (CUT_ROOT, f'{L}/underwater-deep.flac', f'atrim=0:{CUT_TIPS - CUT_ROOT},lowpass=f=500,afade=t=in:d=0.05,afade=t=out:st={CUT_TIPS - CUT_ROOT - 0.08}:d=0.08', -28, 'inside the skin bed'),
 (cue('sits deeper,') - 0.1, f'{L}/sonar-ping.flac', 'lowpass=f=2500', -28, 'the living root lights'),
 (CUT_TIPS - WP, f'{L}/whoosh-fast.flac', 'lowpass=f=2500', -24, 'cut to the two hairs'),
 (slices - 0.6, f'{L}/blade-slice.flac', 'lowpass=f=6000,volume=0.6', -26, 'the small blade slides in (tips study)'),
 (same - 0.6, f'{L}/relay-click.flac', 'lowpass=f=4000', -22, 'the caliper jaws close'),
 (cue('thicker', 2) - 0.2, f'{L}/relay-click.flac', 'lowpass=f=4000', -24, 'the caliper closes on the regrown stub'),
 (coarser - 0.1, f'{L}/wing-flutter.flac', 'lowpass=f=3000,afade=t=out:st=0.5:d=0.6', -30, 'the pad brushes the tips'),
 (CUT_END - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1500,asetrate=48000*0.9,aresample=48000', -22, 'cut back to the skin'),
 (CUT_END, 'syn:brown', f'atrim=0:{T - CUT_END},lowpass=f=260,afade=t=in:d=0.06,afade=t=out:st={T - CUT_END - 1.0}:d=1.0', -32, 'syn skin room tone'),
 (shaveOr - 0.1, f'{L}/blade-slice.flac', 'lowpass=f=5000', -24, 'the second shave'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (tt, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=50:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
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

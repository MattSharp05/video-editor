# One cut, six sides: sound. Voice (AI, r3-m07) up front, "Lightless Dawn" (Kevin MacLeod, CC BY 4.0) ducked under
# speech, and a few soft sounds with a visible cause, timed from the same beats as the picture (src/beats.json; the
# offsets mirror state() in src/Film.tsx). CC0 library (library/sfx/cstack-cc0) only.
# usage: python3 sound/mix.py [music_dB] [stem]   (from film/) -> public/mix.wav, sound/cues.json
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json'))
T = B['total']
CUT = {i: (0 if i == 1 else B[f'L{i}'] - 0.08) for i in range(1, 12)}   # = CUTS in Film.tsx (scene i starts)
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/library/music/files/Lightless_Dawn.mp3'
MUSIC_START = 0.0
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
pitch = lambda r: f'asetrate=48000*{r},aresample=48000'
w1 = min(1.0, B['squares'] - 0.5)
CUES = [
 (0.12, f'{L}/blade-slice.flac', 'lowpass=f=3000', -24, 'the wire drops into the butter'),
 (w1 + 1.05, f'{L}/impact-deep.flac', 'lowpass=f=500', -27, 'the front half lands on its back'),
 (B['straight'] - 0.05, f'{L}/blade-slice.flac', f'{pitch(0.92)},lowpass=f=2800', -23, 'the slanted cut'),
 (max(B['straight'] + 0.7, B['perfect'] - 0.3), f'{L}/whoosh-deep.flac', 'lowpass=f=1200', -29, 'the top half slides up the cut'),
 *[(B[f'n{k}'] - 0.02, f'{L}/pop-soft.flac', f'{pitch(1 + 0.07 * (k - 1))},lowpass=f=2400', -27, f'side {k} lights') for k in range(1, 7)],
 (CUT[4] + 0.95, f'{L}/impact-deep.flac', 'lowpass=f=450', -29, 'the halves close'),
 *[(B['guess_end'] + 0.25 + 0.5 * k, f'{L}/clock-tick.flac', 'lowpass=f=3000,atrim=0:0.25', -27, f'guess hold tick {k + 1}') for k in range(3)],
 (B['corner1'] - 0.03, f'{L}/glass-ting.flac', 'lowpass=f=3500', -28, 'first corner glows'),
 (B['farthest'] - 0.03, f'{L}/glass-ting.flac', f'{pitch(1.19)},lowpass=f=3500', -28, 'far corner glows'),
 (B['knife'] - 0.4, f'{L}/whoosh-fast.flac', 'lowpass=f=2200', -27, 'the knife comes down'),
 (B['crosses'], f'{L}/glass-ting.flac', f'{pitch(1.33)},lowpass=f=3500', -30, 'edge dots light'),
 (CUT[9] + 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=1000', -28, 'pull back to the whole cube'),
 (CUT[10] + 0.05, f'{L}/whoosh-deep.flac', f'{pitch(0.85)},lowpass=f=900', -29, 'the cube rises and turns'),
 (CUT[11] + 0.15, f'{L}/blade-slice.flac', f'{pitch(0.85)},lowpass=f=2600', -23, 'the cheese is cut'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-ss', str(MUSIC_START), '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.0,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for t, src, flt, g, note in CUES:
    args += ['-i', src]
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:11] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/../public/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4], 'src': c[1].split('/')[-1]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues;', round(len(CUES) / T * 10, 1), 'per 10 s; total', round(T, 2))

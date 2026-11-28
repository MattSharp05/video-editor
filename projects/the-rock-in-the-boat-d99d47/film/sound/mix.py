# The rock in the boat: voice up front, "Lightless Dawn" (Kevin MacLeod, CC BY 4.0; the routine's pick) ducked under
# speech, and CC0 sounds on the picture's events (times from beats.json with the same offsets as scene.tsx's T).
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'; MUSIC = f'{HERE}/../music/lightless-dawn.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 16  # the track opens at -26.7 LUFS: +16 dB measured -19.8 LUFS ducked, ~12 dB under the voice (-7.5)
STEM = len(sys.argv) > 2
tip, splash = B['over'] + 0.05, B['falls'] - 0.05
weight, size, split, less = B['l4'] + 0.35, B['l5'] + 0.25, B['three'], B['less']
CUES = [
 (0.0, f'{L}/ocean-surface.flac', f'atrim=0:{T},lowpass=f=1600,afade=t=in:d=0.6,afade=t=out:st={T - 1.5}:d=1.5', -27, 'water lapping the hull (bed)'),
 (tip, f'{L}/ship-creak.flac', 'atrim=0:1.4,lowpass=f=2500,afade=t=out:st=0.9:d=0.5', -21, 'the boat rocks as the rock goes over'),
 (B['guess'] - 0.05, f'{L}/pop-soft.flac', 'lowpass=f=3000', -17, 'the three guess chips appear'),
 (splash, f'{L}/water-plunge.flac', 'lowpass=f=3200', -13, 'the rock hits the water'),
 (splash + 0.35, f'{L}/bubbles-burst.flac', 'lowpass=f=2400', -21, 'bubbles as it sinks'),
 (weight, f'{L}/whoosh-fast.flac', 'lowpass=f=1800', -23, 'the weight block lifts out of the water'),
 (size, f'{L}/whoosh-fast.flac', 'lowpass=f=1500,asetrate=48000*0.85,aresample=48000', -23, 'the size twin rises off the floor'),
 (split + 0.25, f'{L}/pop-soft.flac', 'lowpass=f=3000', -19, 'the big block splits: twin 1'),
 (split + 0.55, f'{L}/pop-soft.flac', 'asetrate=48000*1.12,aresample=48000,lowpass=f=3000', -19, 'twin 2'),
 (less + 0.1, f'{L}/bubbles-burst.flac', 'lowpass=f=1800', -23, 'two twins melt back into the pool'),
 (B['l7'], f'{L}/ship-creak.flac', 'atrim=0:1.2,lowpass=f=2200,afade=t=out:st=0.7:d=0.5', -24, 'the boat bobs up'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES): args += ['-i', src]
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues;', round(len(CUES) / T * 10, 1), 'per 10 s')

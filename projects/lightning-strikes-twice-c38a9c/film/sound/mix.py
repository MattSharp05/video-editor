# Lightning strikes twice: voice (AI, r3-m07, Broadcast library) up front, "Stay the Course" (Kevin MacLeod, CC BY 4.0)
# ducked under speech, and sounds with a visible cause, timed from the same timeline.ts as the picture
# (sound/dump-events.mts -> work/events.json). CC0 library (library/sfx/cstack-cc0) + synthesized noise (labelled 'syn:':
# thunder rumble, rain bed).
# usage: python3 mix.py [music_dB] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
FILM = os.path.dirname(HERE)
ev = subprocess.run(f'npx esbuild sound/dump-events.mts --bundle --platform=node --format=esm --log-level=error | node --input-type=module',
                    shell=True, cwd=FILM, capture_output=True, text=True, check=True).stdout
E = json.loads(ev); json.dump(E, open(f'{HERE}/work/events.json', 'w'), indent=1)
T, B, C = E['dur'], E['beats'], E['cuts']
L = f'{FILM}/../../../library/sfx/cstack-cc0'
VO = f'{FILM}/../vo/vo.wav'
MUSIC = f'{HERE}/src/stay-the-course.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 8.0
STEM = len(sys.argv) > 2
WP = 0.55   # whoosh-deep peaks 0.55 s into the file
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
thunder = lambda d: f'atrim=0:{d},lowpass=f=160,lowpass=f=160,afade=t=in:d=0.04,afade=t=out:st=0.15:d={d - 0.2}:curve=exp'
CUES = [(0, 'syn:pink', f'atrim=0:{T},highpass=f=900,lowpass=f=5000,afade=t=in:d=0.3,afade=t=out:st={T - 2}:d=2', -40, 'rain bed (syn)'),
        (0, f'{L}/city-night.flac', f'atrim=0:{T},{lo(2500)},afade=t=in:d=0.3,afade=t=out:st={T - 2}:d=2,aloop=loop=1:size=1488000', -36, 'city bed')]
# each landed strike: a zap on the contact frame, thunder rolling in after (bigger strikes louder)
for i, s in enumerate(E['strikes']):
    if s < 0 and i: continue
    rapid = C['again'] <= s < C['year']
    CUES.append((max(0, s - 0.02), f'{L}/electric-zap.flac', f'{lo(3500)},{pitch(0.8 + 0.06 * (i % 4))}', -27 if rapid else -24, f'strike {i + 1}: crack'))
    if not rapid or i % 3 == 0:
        d = 2.4 if rapid else 3.0
        CUES.append((s + 0.12, 'syn:brown', thunder(d), -12 if not rapid else -16, f'strike {i + 1}: thunder (syn)'))
CUES += [
 (C['why'] - WP, f'{L}/whoosh-deep.flac', lo(1800), -26, 'cut: crane up the tower'),
 (C['cloud'] - WP, f'{L}/whoosh-deep.flac', lo(1500), -24, 'cut: into the cloud base'),
 (C['cloud'] + 0.1, 'syn:brown', f'atrim=0:{C["leader"] - C["cloud"]},lowpass=f=110,afade=t=in:d=0.8,afade=t=out:st={C["leader"] - C["cloud"] - 0.1}:d=0.1', -15, 'charge building: low rumble (syn)'),
 (B['fills'] + 0.2, f'{L}/electric-spark-crackle.flac', f'{lo(2600)},{pitch(0.7)}', -31, 'sparks crawl in the cloud'),
 (C['leader'] - WP, f'{L}/whoosh-deep.flac', lo(1800), -25, 'cut: side view, cloud to city'),
]
for k, s in list(enumerate(E["steps"]))[::2]:
    CUES.append((s, f'{L}/electric-zap.flac', f'{lo(2400)},{pitch(0.55 + 0.03 * k)},volume=-4dB', -33, f'leader jump {k + 1}'))
CUES += [
 (B['tall'], f'{L}/electrical-hum.flac', f'atrim=0:{E["contact"] - B["tall"]},{lo(1500)},afade=t=in:d=0.6,afade=t=out:st={E["contact"] - B["tall"] - 0.05}:d=0.05', -30, 'streamers rise: buzz'),
 (C['contact'] - WP, f'{L}/whoosh-deep.flac', lo(1800), -26, 'cut: close on the mast'),
 (E['contact'] - 0.01, f'{L}/electric-zap.flac', f'{lo(5000)},{pitch(1.0)}', -20, 'contact'),
 (E['ret'] - 0.02, f'{L}/impact-deep.flac', f'{lo(1200)},atrim=0:2.5,afade=t=out:st=1.5:d=1', -18, 'return stroke: crack'),
 (E['ret'] + 0.1, 'syn:brown', thunder(3.2), -10, 'return stroke: thunder (syn)'),
 (C['gap'] - WP, f'{L}/whoosh-deep.flac', lo(1500), -27, 'cut: wide, rulers'),
 (B['closest'], f'{L}/glass-ting.flac', f'{lo(3500)},afade=t=out:st=0.6:d=1.0', -30, 'the tower ruler is shortest'),
 (C['year'] - WP, f'{L}/whoosh-deep.flac', lo(1800), -26, 'cut: a year of strikes'),
 (C['end'] - WP, f'{L}/whoosh-deep.flac', lo(1800), -26, 'cut: last bolt, pull back'),
]
for k in range(0, 23, 4):  # a year of strikes: soft ticks every 4th scar
    tt = C['year'] + 0.2 + (k / 23) * (B['twentyfive'] + 0.6 - C['year'] - 0.2)
    CUES.append((tt, f'{L}/electric-zap.flac', f'{lo(2200)},{pitch(0.9 + 0.03 * k)}', -33, f'scar {k + 1}'))
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.0,afade=t=out:st={T - 2.2}:d=2.2,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=60:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4], 'src': c[1].split('/')[-1]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues;', round(len(CUES) / T * 10, 1), 'per 10 s; total', round(T, 2))

# The shrimp that punches water into bubbles: voice (AI, r3-m07, Broadcast library) up front, "Stay the Course" (Kevin MacLeod, CC BY 4.0)
# ducked under speech, and sounds with a visible cause, timed from the same timeline.ts as the picture
# (sound/dump-events.mts -> work/events.json). CC0 library (library/sfx/cstack-cc0) + synthesized noise (labelled 'syn:':
# the slowed-down drone).
# usage: python3 mix.py [music_dB] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
FILM = os.path.dirname(HERE)
ev = subprocess.run(f'npx esbuild sound/dump-events.mts --bundle --platform=node --format=esm --log-level=error | node --input-type=module',
                    shell=True, cwd=FILM, capture_output=True, text=True, check=True).stdout
E = json.loads(ev); json.dump(E, open(f'{HERE}/work/events.json', 'w'), indent=1)
T, B, C = E['dur'], E['beats'], E['cuts']
SLOW0, SLOW1 = E['cutGap'], E['cutEnd']
L = f'{FILM}/../../../library/sfx/cstack-cc0'
VO = f'{FILM}/../vo/vo.wav'
MUSIC = f'{HERE}/src/stay-the-course.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 8.0
STEM = len(sys.argv) > 2
WP = 0.55   # whoosh-deep peaks 0.55 s into the file
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
thunder = lambda d: f'atrim=0:{d},lowpass=f=160,lowpass=f=160,afade=t=in:d=0.04,afade=t=out:st=0.15:d={d - 0.2}:curve=exp'
CUES = [(0, f'{L}/underwater-deep.flac', f'atrim=0:{T},{lo(2200)},afade=t=in:d=0.3,afade=t=out:st={T - 2}:d=2', -30, 'reef bed')]
# real-speed strikes: a fast whoosh into the hit, a crack, the burst of bubbles
for i, s in enumerate(E['strikes']):
    if SLOW0 <= s < SLOW1: continue
    CUES += [(max(0, s - 0.12), f'{L}/whoosh-fast.flac', f'{lo(5000)},atrim=0:0.6,afade=t=out:st=0.3:d=0.3', -26, f'strike {i + 1}: swing'),
             (s, f'{L}/impact-deep.flac', f'{lo(2500)},atrim=0:1.2,afade=t=out:st=0.5:d=0.7,{pitch(1.15 + 0.04 * (i % 3))}', -19, f'strike {i + 1}: crack on the shell'),
             (s + 0.02, f'{L}/bubbles-burst.flac', f'{lo(6000)},atrim=0:1.2,afade=t=out:st=0.6:d=0.6', -23, f'strike {i + 1}: bubbles burst')]
for k, c in enumerate(C):
    CUES.append((c - WP, f'{L}/whoosh-deep.flac', lo(1800), -29, f'cut {k + 1}'))
D = SLOW1 - SLOW0
CUES += [
 (SLOW0, 'syn:brown', f'atrim=0:{D},lowpass=f=90,afade=t=in:d=0.6,afade=t=out:st={D - 0.05}:d=0.05', -14, 'slowed-down world: low drone (syn)'),
 (E['contact'], f'{L}/impact-deep.flac', f'{lo(1400)},{pitch(0.6)},atrim=0:2.5,afade=t=out:st=1.2:d=1.3', -15, 'HIT 1: the club meets the shell (slowed)'),
 (E['tear'], f'{L}/bubbles-burst.flac', f'{lo(3000)},{pitch(0.6)}', -21, 'the water tears into bubbles (slowed)'),
]
n = 6
for k in range(n):
    tt = E['collapseA'] + (k + 0.5) / n * (E['collapseB'] - E['collapseA'])
    CUES.append((tt, f'{L}/pop-soft.flac', f'{lo(3000)},{pitch(0.55 + 0.05 * k)}', -24, f'bubble collapses {k + 1}'))
CUES += [(E['hit2'], f'{L}/impact-deep.flac', f'{lo(2000)},{pitch(0.8)},atrim=0:2,afade=t=out:st=1:d=1', -14, 'HIT 2: the bubbles hit the shell'),
         (E['hit2'] + 0.05, f'{L}/water-plunge.flac', f'{lo(2500)},{pitch(0.7)}', -25, 'HIT 2: water rushes back')]
for k, tt in enumerate([B['flash'] - 0.15, B['light'] - 0.1, B['faint'] + 0.35]):
    CUES.append((tt, f'{L}/glass-ting.flac', f'{lo(6000)},{pitch(1.2 + 0.15 * k)},afade=t=out:st=0.4:d=0.8', -30, f'flash of light {k + 1}'))
CUES.append((B['two'] + 0.05, f'{L}/impact-deep.flac', f'{lo(2000)},{pitch(1.0)},atrim=0:1.5,afade=t=out:st=0.6:d=0.9', -20, 'end: HIT 2 tag, shell cracks'))
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

# Bulls don't see red: voice (AI, r3-m07, Broadcast library) up front, "Stay the Course" (Kevin MacLeod, CC BY 4.0)
# ducked under speech, and sounds with a visible cause, timed from the same timeline.ts as the picture
# (sound/dump-events.mts -> work/events.json). CC0 library (library/sfx/cstack-cc0) + synthesized noise (labelled 'syn:':
# the crowd murmur bed, hoof thuds' low body, the sand burst).
# usage: python3 mix.py [music_dB] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
FILM = os.path.dirname(HERE)
ev = subprocess.run(f'npx esbuild sound/dump-events.mts --bundle --platform=node --format=esm --log-level=error | node --input-type=module',
                    shell=True, cwd=FILM, capture_output=True, text=True, check=True).stdout
E = json.loads(ev); json.dump(E, open(f'{HERE}/work/events.json', 'w'), indent=1)
T, W, C = E['dur'], E['T'], E['cuts']
L = f'{FILM}/../../../library/sfx/cstack-cc0'
VO = f'{FILM}/../vo/vo.wav'
MUSIC = f'{HERE}/src/stay-the-course.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 8.0
STEM = len(sys.argv) > 2
WP = 0.55   # whoosh-deep peaks 0.55 s into the file
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
def span(a, b, src, flt, g, note):
    d = max(0.05, b - a)
    return (a, src, f'atrim=0:{d},{flt},afade=t=in:d=0.04,afade=t=out:st={max(0, d - 0.06)}:d=0.06', g, note)
CUES = []
# the ring: a crowd murmur bed in every ring shot (not in the eye), cut on the cuts
ring = [(0, C['eye']), (C['plate'], T)]
for a, b in ring:
    CUES.append(span(a, b, 'syn:pink', 'bandpass=f=700:width_type=o:w=2,tremolo=f=0.7:d=0.35,lowpass=f=2500', -40, 'crowd murmur (syn)'))
CUES.append(span(C['eye'], C['plate'], f'{L}/electrical-hum.flac', f'{lo(600)},{pitch(0.8)}', -36, 'eye: the cells hum'))
for k, c in enumerate(C.values()):
    CUES.append((c - WP, f'{L}/whoosh-deep.flac', lo(1800), -30, f'cut {k + 1}'))
# hook: the bull paws the sand (right fore scrapes on sin(t * 5.2) > 0)
import math
k = 0
while True:
    t = (math.pi / 2 + 2 * math.pi * k) / 5.2; k += 1
    if t > C['eye'] - 0.2: break
    CUES.append((t, 'syn:brown', 'atrim=0:0.25,bandpass=f=900:width_type=o:w=2,afade=t=out:st=0.05:d=0.2', -24, 'hoof scrapes sand (syn)'))
# eye: the counts land
CUES += [(W['three'], f'{L}/glass-ting.flac', f'{pitch(1.0)},afade=t=out:st=0.3:d=0.6', -28, 'YOU: 3'),
         (W['two'], f'{L}/glass-ting.flac', f'{pitch(0.8)},afade=t=out:st=0.3:d=0.6', -28, 'BULL: 2')]
# plate and cape: the split slides across (soft whoosh)
CUES += [(C['plate'] + 0.3, f'{L}/whoosh-fast.flac', f'{lo(3000)},{pitch(0.7)}', -32, 'split slides over the plate'),
         (C['cape'] + 0.1, f'{L}/wing-flutter.flac', f'{lo(3000)},{pitch(0.6)},atrim=0:2.5,afade=t=out:st=1.5:d=1', -30, 'cape flaps'),
         (E['flick'], f'{L}/wing-flutter.flac', f'{lo(4000)},{pitch(0.75)},atrim=0:0.8,afade=t=out:st=0.4:d=0.4', -24, 'cape flicks')]
# hooves: thuds on the gallop (two per stride), from each running span
def hooves(a, b, rate, g, note):
    n = int((b - a) * rate * 2)
    for i in range(n):
        t = a + i / (rate * 2)
        CUES.append((t, f'{L}/impact-deep.flac', f'{lo(700)},{pitch(1.6 + 0.12 * (i % 3))},atrim=0:0.3,afade=t=out:st=0.08:d=0.2', g, note))
hooves(E['launch'] + 0.15, C['flags'], 7.5 / 3.2, -27, 'charge: hooves')
hooves(C['flags'], C['motion'], 2.4, -28, 'flags run: hooves')
hooves(C['motion'], C['impact'], 2.3, -30, 'motion: hooves (high, far)')
hooves(C['impact'], E['hit'], 2.2, -28, 'impact: hooves')
hooves(C['end'], T - 0.5, 2.2, -31, 'end: hooves')
for i, h in enumerate(E['flagHit']):
    CUES += [(h, f'{L}/impact-deep.flac', f'{lo(2000)},{pitch(1.1 + 0.08 * i)},atrim=0:0.9,afade=t=out:st=0.3:d=0.6', -22, f'flag {i + 1} hit'),
             (h + 0.03, f'{L}/wing-flutter.flac', f'{lo(5000)},{pitch(0.9)},atrim=0:0.7,afade=t=out:st=0.3:d=0.4', -26, f'flag {i + 1} whips')]
# impact: the bull hits the swinging cape on 'movement', slowed
CUES += [(E['hit'], f'{L}/impact-deep.flac', f'{lo(1500)},{pitch(0.7)},atrim=0:2.2,afade=t=out:st=0.8:d=1.4', -17, 'impact (slowed)'),
         (E['hit'] + 0.02, 'syn:brown', 'atrim=0:1.6,bandpass=f=1200:width_type=o:w=3,afade=t=out:st=0.2:d=1.4', -22, 'sand burst (syn)'),
         (E['hit'] + 0.05, f'{L}/wing-flutter.flac', f'{lo(3000)},{pitch(0.55)},atrim=0:1.5,afade=t=out:st=0.6:d=0.9', -24, 'cape flung (slowed)')]
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

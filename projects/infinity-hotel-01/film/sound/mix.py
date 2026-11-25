# Infinity hotel 01 sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under it, and soft sounds with a
# visible cause, timed from the film's own numbers (sound/events.json, printed by sound/dump.mts from src/timeline.ts).
# Effects: CC0 cstack set (library/sfx/cstack-cc0) + synthesized noise (labelled 'syn:').
# usage: python3 mix.py [music_dB] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
E = json.load(open(f'{HERE}/events.json')); B = E['B']; T = E['dur']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 11.5
STEM = len(sys.argv) > 2
WP = 0.57  # whoosh-deep peaks 0.57 s in
def ting(t, k, g, note): return (t, f'{L}/glass-ting.flac', f'asetrate=48000*{k},aresample=48000,lowpass=f=4200,afade=t=out:st=0.4:d=0.8', g, note)
def click(t, k, g, note): return (t, f'{L}/relay-click.flac', f'asetrate=48000*{k},aresample=48000,lowpass=f=3500', g, note)
def whoosh(t, k, g, note, deep=True): return (t - (WP if deep else 0.1), f'{L}/whoosh-{"deep" if deep else "fast"}.flac', f'asetrate=48000*{k},aresample=48000,lowpass=f=2200', g, note)
def pop(t, k, g, note): return (t, f'{L}/pop-soft.flac', f'asetrate=48000*{k},aresample=48000,lowpass=f=3000', g, note)
steps = [(B['guest'] - 0.6 + 0.48 * i, f'{L}/screen-tap.flac', f'asetrate=48000*{0.55 + 0.04 * (i % 2)},aresample=48000,lowpass=f=1800', -34, f'newcomer step {i + 1}') for i in range(6)]
flicks = [(E['m1'] + 0.62, 'off'), (E['newArrive'] + 0.1, 'on'), (E['m2'] + 0.7, 'off'), (E['fill'] + 1.3, 'on'), (E['out'] + 0.4, 'off'), (E['numIn'] + 1.6, 'on')]
CUES = [
 (0.0, 'syn:brown', f'atrim=0:{T},lowpass=f=260,afade=t=in:d=0.4,afade=t=out:st={T - 2}:d=2', -35, 'night air (synth)'),
 (0.0, f'{L}/city-night.flac', f'atrim=0:{T},highpass=f=120,lowpass=f=2500,afade=t=in:d=0.3,afade=t=out:st={T - 3}:d=3', -42, 'distant road at night'),
 (0.0, f'{L}/electrical-hum.flac', f'atrim=0:6,lowpass=f=900,afade=t=out:st=4.5:d=1.5', -44, 'neon buzz under the sign (cover)'),
 *steps,
 *[click(t, 1.0 if w == 'on' else 0.8, -31, f'"NO" flickers {w}') for t, w in flicks],
 whoosh(E['m1'] + 0.6, 1.1, -30, 'everyone moves one room (wave)', deep=False),
 ting(E['newArrive'], 1.0, -31, 'the newcomer takes room 1'),
 (E['busArrive'][0], 'syn:brown', f'atrim=0:{E["busArrive"][1] - E["busArrive"][0] + 0.3},lowpass=f=140,afade=t=in:d=0.8,afade=t=out:st={E["busArrive"][1] - E["busArrive"][0] - 0.2}:d=0.5', -24, 'the bus rolls up (engine, synth)'),
 (E['busArrive'][1] - 0.1, 'syn:white', 'atrim=0:0.8,highpass=f=2500,lowpass=f=7000,afade=t=in:d=0.05,afade=t=out:st=0.25:d=0.55', -36, 'air brakes (synth)'),
 whoosh(E['m2'] + 0.8, 0.9, -27, 'everyone doubles (arcs)'),
 whoosh(E['fill'] + 0.6, 1.15, -29, 'the bus empties into the odd rooms', deep=False),
 ting(E['fill'] + 1.3, 1.12, -31, 'the odd rooms light'),
 whoosh(E['out'] + 0.5, 1.25, -31, 'everyone checks out (rise and fade)', deep=False),
 (E['busLeave'][0], 'syn:brown', 'atrim=0:1.6,lowpass=f=120,afade=t=in:d=0.2,afade=t=out:st=0.6:d=1.0', -28, 'the bus pulls away'),
 (E['bus2'][0], 'syn:brown', f'atrim=0:{E["bus2"][1] - E["bus2"][0] + 0.3},lowpass=f=150,afade=t=in:d=0.6,afade=t=out:st={E["bus2"][1] - E["bus2"][0] - 0.2}:d=0.5', -25, 'the last bus rolls up'),
 (E['bus2'][1] - 0.1, 'syn:white', 'atrim=0:0.7,highpass=f=2500,lowpass=f=7000,afade=t=out:st=0.2:d=0.5', -37, 'air brakes'),
 whoosh(E['numIn'] + 0.7, 1.05, -30, 'the numbers fly to their rooms', deep=False),
 *[ting(t, 0.9 + 0.06 * k, -31, f'digit {k + 1} lands in the new number') for k, t in enumerate(E['picks'])],
 *[pop(t, 1.0 + 0.08 * k, -30 - (0 if k < 3 else 3), f'≠ at room {k + 1}') for k, t in enumerate(E['neq'])],
 pop(B['noRoom'] + 0.3, 0.8, -29, 'the new number steps out to the road'),
 *[(t, f'{L}/card-riffle.flac', 'lowpass=f=3000', -31, f'the numbers reshuffle {i + 1}') for i, t in enumerate(E['shuffles'])],
 *[pop(t + 0.85, 0.9 + 0.1 * i, -29, f'another number left out ({i + 2})') for i, t in enumerate(E['shuffles'])],
 (B['bigger'] - 0.2, 'syn:pink', f'atrim=0:{T - B["bigger"]},bandpass=f=700:w=900,afade=t=in:d=1.8,afade=t=out:st={T - B["bigger"] - 2}:d=2', -36, 'the crowd of left-out numbers (synth swell)'),
 (B['bigger'] + 0.1, f'{L}/impact-deep.flac', 'lowpass=f=300,atrim=0:1.6,afade=t=out:st=0.6:d=1.0', -32, 'soft low hit as the camera pulls back'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.0,afade=t=out:st={T - 1.8}:d=1.8,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration={T + 1}:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
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

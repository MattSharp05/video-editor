# s2 coin rotation sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under it, and soft sounds with a
# visible cause, timed from the timeline's own events (sound/events.json, written by ../times.mts from src/timeline.ts).
# Effects: CC0 cstack set (library/sfx/cstack-cc0, sfx-29..61) + synthesized noise (labelled 'syn:').
# usage: python3 mix.py [music_dB] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
E = json.load(open(f'{HERE}/events.json')); B = E['B']; T = E['dur']; CUT = E['cut']
R, S = E['reveal'], E['spans']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 9.5
STEM = len(sys.argv) > 2
ROLL = 'highpass=f=1800,lowpass=f=5200,tremolo=f=26:d=0.7'   # a coin's reeded edge purring along the paper
def roll(a, b, g, note): return (a, 'syn:pink', f'atrim=0:{b - a:.3f},{ROLL},afade=t=in:d=0.15,afade=t=out:st={max(0, b - a - 0.25):.3f}:d=0.25', g, note)
def scribble(a, d, g, note): return (a, 'syn:white', f'atrim=0:{d},bandpass=f=3800:w=2600,tremolo=f=11:d=0.9,afade=t=in:d=0.04,afade=t=out:st={d - 0.08}:d=0.08', g, note)
def ting(a, k, g, note): return (a, f'{L}/glass-ting.flac', f'asetrate=48000*{k},aresample=48000,lowpass=f=4500,afade=t=out:st=0.5:d=0.9', g, note)
WP = 0.57  # whoosh-deep peaks 0.57 s in
CUES = [
 (0.0, 'syn:brown', f'atrim=0:{T},lowpass=f=300,afade=t=in:d=1.0,afade=t=out:st={T - 1.5}:d=1.5', -36, 'room tone (quiet study)'),
 roll(0.0, B['roll'] - 0.1, -31, 'A rolls under the hook'),
 roll(B['roll'] + 0.2, B['turnQ'] + 0.2, -33, 'A rolls back to the start'),
 scribble(B['guessEnd'] + 0.05, 1.25, -36, 'pencil draws the route circle'),
 scribble(B['once'] - 0.05, 0.6, -31, 'bubble 1 shaded'),
 roll(R['T0'], R['TEND'], -30, 'the reveal roll'),
 ting(R['THALF'] - 0.02, 1.0, -26, 'arrow points up again: 1'),
 ting(R['TEND'] - 0.02, 1.12, -25, 'arrow up again: 2'),
 scribble(B['twice'] + 0.05, 0.6, -31, 'bubble 2 shaded'),
 (S['UNWRAP'][0], f'{L}/card-riffle.flac', 'lowpass=f=3500,atrim=0:0.9,afade=t=out:st=0.6:d=0.3', -27, 'the strip peels off and straightens'),
 roll(S['ALONG'][0], S['ALONG'][1], -30, 'A rolls along the strip'),
 ting(S['ALONG'][1] - 0.2, 1.0, -26, 'one turn on the straight'),
 (S['BEND'][0], f'{L}/card-riffle.flac', 'lowpass=f=3000,asetrate=48000*0.85,aresample=48000,atrim=0:1.2,afade=t=out:st=0.8:d=0.4', -29, 'the strip bends back'),
 ting(S['BEND'][1] - 0.2, 1.12, -25, 'the bend adds a turn'),
 (CUT - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -24, 'cut to the 1982 question'),
 roll(CUT + 0.6, B['four'] + 0.05, -31, 'the small coin rolls round the big one'),
 *[ting(c - 0.02, k, -26, f'count {i + 1}') for i, (c, k) in enumerate(zip(E['satCounts'], [1.0, 1.12, 1.26, 1.5]))],
 scribble(B['key'] + 0.35, 0.55, -32, 'the key\'s (B) 3 circled'),
 (B['wasnt'] - 0.05, f'{L}/whoosh-fast.flac', 'lowpass=f=2500', -30, 'struck in coral'),
 scribble(B['wasnt'] + 0.3, 0.6, -31, 'amber 4 written'),
 (B['students'] - 0.2, f'{L}/whoosh-deep.flac', 'lowpass=f=1200,asetrate=48000*0.8,aresample=48000', -27, 'pull back over the desk'),
 (B['thousand'], f'{L}/card-riffle.flac', 'lowpass=f=3000', -30, 'the stacks of answer sheets'),
 ting(B['thousand'] + 0.3, 0.75, -31, 'the amber wave through the stacks'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.0}:d=2.0,volume={MUSIC_DB}dB[m]',
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

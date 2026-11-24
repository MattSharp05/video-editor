# s4 ISS gravity sound: voice (AI, m5) up front, Floating Cities (series song, CC BY 4.0) ducked under speech, and soft
# sounds with a visible cause, timed from the same words as the picture (src/words.json; cue offsets mirror
# src/timeline.ts). CC0 library (library/sfx/cstack-cc0) + synthesized noise only (labelled 'syn:').
# usage: python3 mix.py [music_dB] [stem]
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
W = json.load(open(f'{HERE}/../src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
def cue(p, nth=0):
    ps = [norm(x) for x in p.split()]; hits = [W[i]['s'] for i in range(len(W) - len(ps) + 1) if all(norm(W[i + j]['w']) == ps[j] for j in range(len(ps)))]
    return hits[nth]
VO_END = W[-1]['e']; T = VO_END + 2.2   # = DUR_S in timeline.ts
ROOT = '/home/user/video-editor'
L = f'{ROOT}/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = f'{ROOT}/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 7.5
STEM = len(sys.argv) > 2
B = dict(none=cue('None?'), half=cue('Half?'), all=cue('Almost all?'), pause=cue('Pause and guess.'), build=cue('Build a'), km=cue('four hundred'),
         step=cue('and step'), fall=cue("You'd fall,"), ninety=cue('ninety percent'), why=cue('So why'), falling=cue('is falling'),
         sideways=cue("It's also"), asit=cue('As it'), missing=cue('keeps missing.'), crew=cue('The crew falls'), zero=cue('reads zero.'),
         notZero=cue('Not zero'), freeFall=cue('Free fall,'))
# = timeline.ts: cuts, the scale's reading, the step, the cannon shots
CUT_TOWER, CUT_TOP, CUT_GLOBE, CUT_CREW = B['build'] - 0.12, B['step'] - 0.12, B['why'] - 0.12, B['crew'] - 0.12
STEP = B['fall'] + 0.05
SHOT = [B['sideways'] + 0.25 + i * 0.75 for i in range(4)]; LAND = [SHOT[i] + d for i, d in enumerate([0.7, 0.8, 0.9])]
WP = 0.55   # whoosh-deep peaks 0.55 s into the file
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
CUES = [
 (0.0, f'{L}/electrical-hum.flac', f'{lo(700)},atrim=0:{CUT_TOWER},afade=t=in:d=0.6,afade=t=out:st={CUT_TOWER - 0.08}:d=0.06', -36, 'station hum (station shot)'),
 (B['none'], f'{L}/relay-click.flac', lo(2500), -27, 'needle to NONE'),
 (B['half'], f'{L}/relay-click.flac', f'{lo(2500)},{pitch(1.12)}', -27, 'needle to HALF'),
 (B['all'], f'{L}/relay-click.flac', f'{lo(2500)},{pitch(1.25)}', -27, 'needle to ALMOST ALL'),
 (B['pause'] + 0.3, f'{L}/clock-tick.flac', f'{lo(3000)},atrim=0:{CUT_TOWER - B["pause"] - 0.35},afade=t=out:st={CUT_TOWER - B["pause"] - 0.6}:d=0.25', -26, 'pause and guess: ticking ring'),
 (CUT_TOWER - WP, f'{L}/whoosh-deep.flac', lo(1600), -24, 'cut to the globe'),
 (B['build'] + 0.05, 'syn:brown', 'atrim=0:2.4,lowpass=f=160,afade=t=in:d=0.4,afade=t=out:st=1.2:d=1.2', -24, 'the tower rises (synthesized rumble)'),
 (CUT_TOP - WP, f'{L}/whoosh-deep.flac', f'{lo(1600)},{pitch(1.1)}', -26, 'cut to the tower top'),
 (CUT_TOP + 0.15, f'{L}/servo-arm.flac', f'{lo(2200)},atrim=0:0.8,afade=t=out:st=0.5:d=0.3', -30, 'the scale counts up'),
 (CUT_TOP + 0.9, f'{L}/pop-soft.flac', lo(2400), -24, '~90% shows'),
 (STEP, f'{L}/whoosh-fast.flac', f'{lo(2500)},{pitch(0.8)}', -24, 'he steps off'),
 (STEP + 0.3, 'syn:pink', f'atrim=0:{CUT_GLOBE - STEP - 0.3},highpass=f=300,lowpass=f=2500,afade=t=in:d=1.5,afade=t=out:st={CUT_GLOBE - STEP - 0.4}:d=0.08', -29, 'falling: rushing air (synthesized)'),
 (CUT_GLOBE - WP, f'{L}/whoosh-deep.flac', lo(1400), -24, 'cut to the orbit'),
 (B['falling'] - 0.2, f'{L}/sonar-ping.flac', f'{lo(2000)},afade=t=out:st=0.8:d=0.6', -32, 'FALLING: the paths part'),
] + [
 (SHOT[i], f'{L}/impact-deep.flac', f'{lo(900)},{pitch(1 + 0.12 * i)}', -24 + i, f'cannon shot {i + 1}') for i in range(4)
] + [
 (LAND[i], f'{L}/impact-deep.flac', f'{lo(400)},{pitch(0.7)}', -31, f'shot {i + 1} lands') for i in range(3)
] + [
 (B['asit'] - 0.2, f'{L}/whoosh-fast.flac', f'{lo(3000)},{pitch(1.3)}', -29, 'the last shot laps the planet'),
 (B['missing'] + 0.1, f'{L}/whoosh-deep.flac', f'{lo(2200)},{pitch(1.2)}', -27, 'it passes the tower: it keeps missing'),
 (CUT_CREW - WP, f'{L}/whoosh-deep.flac', lo(1600), -24, 'cut back to the crew'),
 (CUT_CREW, f'{L}/electrical-hum.flac', f'{lo(700)},atrim=0:{B["notZero"] - CUT_CREW + 1.5},afade=t=in:d=0.06,afade=t=out:st={B["notZero"] - CUT_CREW}:d=1.5', -36, 'station hum (crew shot)'),
 (B['crew'] + 0.25, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(0.9)}', -26, 'SAME FALL arrows'),
 (B['notZero'] - 0.1, f'{L}/whoosh-deep.flac', f'{lo(1200)},areverse', -28, 'pull back to the whole orbit'),
 (B['freeFall'], f'{L}/glass-ting.flac', f'{lo(3200)},afade=t=out:st=0.8:d=1.5', -27, 'FREE FALL'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 1.8}:d=1.8,volume={MUSIC_DB}dB[m]',
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

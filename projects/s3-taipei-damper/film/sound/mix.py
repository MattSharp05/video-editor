# s3-taipei-damper sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under speech, and soft sounds
# with a visible cause, timed from the same words as the picture (src/words.json; offsets mirror src/timeline.ts).
# CC0 library (library/sfx/cstack-cc0, sfx-29..61) + synthesized noise only (labelled 'syn:').
# usage: python3 mix.py [music_dB] [stem]
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
W = json.load(open(f'{HERE}/../src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
def cue(p, nth=0):
    ps = [norm(x) for x in p.split()]; hits = [W[i]['s'] for i in range(len(W) - len(ps) + 1) if all(norm(W[i + j]['w']) == ps[j] for j in range(len(ps)))]
    return hits[nth]
VO_END = W[-1]['e']; T = VO_END + 2.2   # = DUR_S in timeline.ts
R = '/home/user/video-editor'
L = f'{R}/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = f'{R}/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 7.5
STEM = len(sys.argv) > 2
# cuts: same formulas as CUT_* in src/timeline.ts; whoosh-deep peaks 0.55 s into its file
CUT_IN, CUT_OUT, CUT_IN2, CUT_END = cue('But the ball') - 0.12, cue('Without') - 0.12, cue('In a') - 0.12, VO_END + 0.9
WP = 0.55
ball, wind, cables, pistons, without, meter = cue('ball hanging'), cue('Wind'), cue('cables,'), cue('Pistons'), cue('Without'), cue('meter.')
def bed(a, b, kind, flt, g, note, fin=0.04):
    return (a, kind, f'atrim=0:{b - a:.3f},{flt},afade=t=in:d={fin},afade=t=out:st={b - a - 0.06:.3f}:d=0.06', g, note)
STORM = 'highpass=f=150,lowpass=f=2400'
RAIN = 'highpass=f=3500,lowpass=f=9000'
ROOM = 'lowpass=f=170'
CUES = [
 bed(0.0, CUT_IN, 'syn:pink', STORM, -27, 'storm wind outside the tower', 0.5),
 bed(0.0, CUT_IN, 'syn:white', RAIN, -36, 'rain on the glass', 0.5),
 (ball - 0.05, f'{L}/glass-ting.flac', 'lowpass=f=4000', -24, 'the wall turns to glass: the ball appears'),
 (wind - 0.2, 'syn:pink', 'atrim=0:2.6,highpass=f=200,lowpass=f=1600,afade=t=in:d=0.9,afade=t=out:st=1.0:d=1.6', -20, 'the gust that shoves the tower'),
 (CUT_IN - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -22, 'cut into the damper floors'),
 bed(CUT_IN, CUT_OUT, 'syn:brown', ROOM, -24, 'room hum inside the tower'),
 bed(CUT_IN, CUT_OUT, 'syn:pink', 'highpass=f=150,lowpass=f=600', -36, 'the storm through the walls'),
 (cables + 0.05, f'{L}/ship-creak.flac', 'lowpass=f=1400,atrim=0:2.0,afade=t=out:st=1.4:d=0.6', -27, 'cables take the swing'),
 (pistons + 0.1, 'syn:white', 'atrim=0:1.6,bandpass=f=1400:width_type=o:w=1.2,afade=t=in:d=0.4,afade=t=out:st=0.7:d=0.9', -31, 'pistons hiss: oil through the valves'),
 (pistons + 2.1, 'syn:white', 'atrim=0:1.4,bandpass=f=1200:width_type=o:w=1.2,afade=t=in:d=0.4,afade=t=out:st=0.6:d=0.8', -32, 'pistons hiss on the return swing'),
 (CUT_OUT - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1500,asetrate=48000*0.85,aresample=48000', -22, 'cut out to the tower'),
 bed(CUT_OUT, CUT_IN2, 'syn:pink', STORM, -27, 'storm wind outside'),
 bed(CUT_OUT, CUT_IN2, 'syn:white', RAIN, -36, 'rain'),
 (without + 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=900,asetrate=48000*0.7,aresample=48000', -26, 'the ghost tower swings wide'),
 (CUT_IN2 - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -22, 'cut back to the ball'),
 bed(CUT_IN2, CUT_END, 'syn:brown', ROOM, -24, 'room hum'),
 (meter - 0.05, f'{L}/vault-clank.flac', 'lowpass=f=2000', -27, 'the ball reaches the 1 m mark'),
 (CUT_END - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -23, 'cut to the tower top (loop)'),
 (CUT_END, 'syn:pink', f'atrim=0:{T - CUT_END:.3f},{STORM},afade=t=in:d=0.04,afade=t=out:st={T - CUT_END - 0.7:.3f}:d=0.7', -27, 'storm outside again'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.0}:d=2.0,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=40:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
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

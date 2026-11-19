# s3-jet-engine sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under speech, and soft sounds
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
CUT_IN, CUT_BACK = cue("In today's") - 0.12, cue('That huge') - 0.12
WP = 0.55
fire, but, fan, one, squeezed, burned, last, turns, shoves, most, spins = cue('with fire.'), cue('But most'), cue('giant fan'), cue('one part'), cue('squeezed,'), cue('burned.'), cue('last one'), cue('turns the fan.'), cue('shoves'), cue('most of the thrust.'), cue('spins the fan,')
def bed(a, b, kind, flt, g, note, fin=0.04):
    return (a, kind, f'atrim=0:{b - a:.3f},{flt},afade=t=in:d={fin},afade=t=out:st={b - a - 0.06:.3f}:d=0.06', g, note)
ROAR = 'highpass=f=60,lowpass=f=900'      # engine roar outside (synth brown + pink)
WHINE = 'bandpass=f=2600:width_type=o:w=0.3' # fan whine
INSIDE = 'lowpass=f=400'
CUES = [
 bed(0.0, CUT_IN, 'syn:brown', ROAR, -17, 'engine roar on the takeoff roll', 0.3),
 bed(0.0, CUT_IN, 'syn:pink', 'highpass=f=300,lowpass=f=3000', -30, 'wind and rumble of the roll', 0.3),
 bed(0.0, CUT_IN, 'syn:white', WHINE, -40, 'fan whine', 0.3),
 (fire - 0.1, 'syn:brown', 'atrim=0:1.4,lowpass=f=300,afade=t=in:d=0.2,afade=t=out:st=0.5:d=0.9', -16, 'the exhaust flares on "fire"'),
 (but + 0.05, f'{L}/servo-arm.flac', 'lowpass=f=2500', -26, 'the cowl swings open'),
 (fan, f'{L}/whoosh-fast.flac', 'lowpass=f=2000', -27, 'the fan pulls in the air'),
 (CUT_IN - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -22, 'cut to the fan face'),
 bed(CUT_IN, CUT_BACK, 'syn:brown', INSIDE, -24, 'muffled roar inside the engine'),
 (one + 0.2, f'{L}/pop-soft.flac', 'lowpass=f=2400', -25, 'one bead drops into the core'),
 (squeezed - 0.1, f'{L}/rope-or-cable-winch.flac', 'lowpass=f=1800,atrim=0:1.2,afade=t=out:st=0.8:d=0.4', -30, 'squeezed through the compressor'),
 (burned - 0.15, 'syn:brown', 'atrim=0:1.2,lowpass=f=500,afade=t=in:d=0.05,afade=t=out:st=0.3:d=0.9', -14, 'it burns: a whump'),
 (burned - 0.1, f'{L}/electric-spark-crackle.flac', 'lowpass=f=3000,atrim=0:0.8,afade=t=out:st=0.4:d=0.4', -32, 'the flame crackles'),
 (last - 0.05, f'{L}/whoosh-fast.flac', 'lowpass=f=1500,asetrate=48000*0.8,aresample=48000', -27, 'the spin runs along the shaft'),
 (turns + 0.25, 'syn:white', 'atrim=0:1.4,bandpass=f=2400:width_type=o:w=0.3,afade=t=in:d=0.6,afade=t=out:st=0.7:d=0.7', -32, 'the fan whines up'),
 (shoves, f'{L}/whoosh-deep.flac', 'lowpass=f=1400,asetrate=48000*0.85,aresample=48000', -26, 'the fan shoves the air backward'),
 (CUT_BACK - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -22, 'cut behind the engine'),
 bed(CUT_BACK, T, 'syn:brown', ROAR, -18, 'roar outside again', 0.04),
 bed(CUT_BACK, T, 'syn:white', WHINE, -42, 'fan whine'),
 (spins + 0.4, f'{L}/wing-flutter.flac', 'lowpass=f=1800', -29, 'liftoff: air over the wing'),
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

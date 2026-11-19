# s3-canal-locks sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under speech, and soft sounds
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
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 6
STEM = len(sys.argv) > 2
# cuts: same formulas as CUT_* in src/timeline.ts; whoosh-deep peaks 0.55 s into its file
CUT_SECTION, CUT_BACK, CUT_SEA = cue('The gate') - 0.12, cue('Three steps,') - 0.12, cue('Each ship') - 0.12
WP = 0.55
closes, valve, pours, wells, floats, sails, going, liters, rain = cue('closes.'), cue('A valve'), cue('pours in.'), cue('wells up'), cue('floats up'), cue('sails out'), cue('Going down,'), cue('liters,'), cue('the rain')
def bed(a, b, kind, flt, g, note, fin=0.04, fout=0.06):
    return (a, kind, f'atrim=0:{b - a:.3f},{flt},afade=t=in:d={fin},afade=t=out:st={b - a - fout:.3f}:d={fout}', g, note)
OUT = 'highpass=f=120,lowpass=f=1200'      # open air over the canal (synth pink)
CH = 'lowpass=f=260'                        # water moving in the chamber (synth brown)
CUES = [
 bed(0.0, CUT_SECTION, 'syn:pink', OUT, -33, 'open air over the locks', 0.4),
 bed(0.0, 3.6, 'syn:brown', CH, -24, 'water churning as the chamber fills (hook time-lapse)', 0.3, 0.6),
 (0.4, f'{L}/ship-horn-distant.flac', 'lowpass=f=1500', -30, 'a ship horn across the locks'),
 (CUT_SECTION - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -22, 'cut to the section'),
 bed(CUT_SECTION, CUT_BACK, 'syn:brown', 'lowpass=f=180', -30, 'inside the lock walls'),
 (closes - 0.1, f'{L}/vault-clank.flac', 'lowpass=f=1800', -24, 'the mitre gate closes'),
 (valve, f'{L}/servo-arm.flac', 'lowpass=f=2200', -27, 'the valve turns'),
 (pours - 0.1, f'{L}/water-plunge.flac', 'lowpass=f=2000', -22, 'water drops into the tunnel'),
 (pours + 0.2, 'syn:brown', f'atrim=0:{floats + 1.2 - pours:.3f},lowpass=f=420,afade=t=in:d=0.5,afade=t=out:st={floats + 0.6 - pours:.3f}:d=0.6', -21, 'water rushing through the tunnel'),
 (wells, f'{L}/bubbles-burst.flac', 'lowpass=f=2500', -25, 'water wells up through the floor'),
 (CUT_BACK - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1800,asetrate=48000*0.9,aresample=48000', -22, 'cut out to the aerial'),
 bed(CUT_BACK, CUT_SEA, 'syn:pink', OUT, -33, 'open air'),
 (sails, f'{L}/ship-horn-distant.flac', 'lowpass=f=1300,asetrate=48000*0.94,aresample=48000', -29, 'the ship sails onto the lake'),
 (going, 'syn:brown', 'atrim=0:2.6,lowpass=f=300,afade=t=in:d=0.4,afade=t=out:st=1.6:d=1.0', -25, 'the down lane drains'),
 (CUT_SEA - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -22, 'cut to the sea'),
 (CUT_SEA, f'{L}/ocean-surface.flac', f'atrim=0:{T - CUT_SEA:.3f},lowpass=f=2500,afade=t=in:d=0.04,afade=t=out:st={T - CUT_SEA - 1.5:.3f}:d=1.5', -27, 'the sea'),
 (liters + 0.25, f'{L}/water-plunge.flac', 'lowpass=f=1500,asetrate=48000*0.75,aresample=48000', -18, 'the cube of water tips into the sea'),
 (rain - 0.3, 'syn:pink', f'atrim=0:{T - rain + 0.3:.3f},highpass=f=1800,lowpass=f=8000,afade=t=in:d=0.6,afade=t=out:st={T - rain - 1.0:.3f}:d=1.3', -31, 'rain'),
 (rain + 0.5, f'{L}/impact-deep.flac', 'lowpass=f=300', -30, 'distant thunder'),
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

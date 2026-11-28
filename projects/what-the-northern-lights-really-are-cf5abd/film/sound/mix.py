# What the Northern Lights really are: voice (AI, r3-m07, Broadcast library) up front, Floating Cities (CC BY 4.0) ducked under
# speech, and soft sounds with a visible cause, timed from the same words as the picture (src/words.json; cut times
# mirror src/timeline.ts CUT_*). CC0 library (library/sfx/cstack-cc0) + synthesized noise only (labelled 'syn:').
# usage: python3 mix.py [music_dB] [stem]
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
W = json.load(open(f'{HERE}/../src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
def cue(p, nth=0):
    ps = [norm(x) for x in p.split()]; hits = [W[i]['s'] for i in range(len(W) - len(ps) + 1) if all(norm(W[i + j]['w']) == ps[j] for j in range(len(ps)))]
    return hits[nth]
VO_END = W[-1]['e']; T = VO_END + 2.0   # = DUR_S in timeline.ts
ROOT = '/home/user/video-editor'
L = f'{ROOT}/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = f'{ROOT}/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 7.5
STEM = len(sys.argv) > 2
B = dict(wind=cue('a wind'), crash=cue('from the'), sun=cue('The Sun blows'), charged=cue('charged bits.'), solar=cue('solar wind.'),
         earth=cue("Earth's magnetic"), pushes=cue('pushes most'), steers=cue('shakes the'), poles=cue('the poles.'), there=cue('There, about'),
         slam=cue('slam into'), oxygen=cue('Oxygen glows'), higher=cue('Higher up,'), nitrogen=cue('Nitrogen adds'), so=cue('So every'), lighting=cue('lit up'))
CUT_SUN, CUT_FIELD, CUT_SLICE, CUT_END = (B[k] - 0.1 for k in ('sun', 'earth', 'there', 'so'))
WP = 0.55   # whoosh-deep peaks 0.55 s into the file: start it that much before a cut
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
def bed(t0, t1, src, flt, g, note):
    return (t0, src, f'atrim=0:{t1 - t0},{flt},afade=t=in:d=0.05,afade=t=out:st={t1 - t0 - 0.06}:d=0.06', g, note)
CUES = [
 bed(0, CUT_SUN, 'syn:pink', 'highpass=f=120,lowpass=f=520', -31, 'night: cold wind bed'),
 (B['wind'] - 0.2, f'{L}/whoosh-fast.flac', f'{lo(1400)},{pitch(0.85)}', -30, 'amber streaks start pouring down'),
 (B['crash'] + 0.05, f'{L}/electric-spark-crackle.flac', f'{lo(3000)},atrim=0:1.2,afade=t=out:st=0.6:d=0.6', -33, 'streaks hit, curtain brightens'),
 (CUT_SUN - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut to the Sun'),
 bed(CUT_SUN, CUT_FIELD, 'syn:brown', 'lowpass=f=160', -24, 'Sun: low rumble bed'),
 (B['charged'] + 0.05, f'{L}/electric-spark-crackle.flac', f'{lo(2600)},{pitch(1.2)},atrim=0:0.8,afade=t=out:st=0.4:d=0.4', -32, '"charged bits"'),
 (B['solar'], f'{L}/whoosh-deep.flac', f'{lo(1200)},{pitch(0.8)}', -27, '"SOLAR WIND" tag, stream flows on'),
 (CUT_FIELD - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut to Earth and its field'),
 bed(CUT_FIELD, CUT_SLICE, 'syn:brown', 'lowpass=f=140', -27, 'space: drone bed'),
 (B['earth'] + 0.3, f'{L}/electrical-hum.flac', f'{lo(900)},atrim=0:2.2,afade=t=in:d=0.4,afade=t=out:st=1.4:d=0.8', -30, 'field lines light up'),
 (B['pushes'] + 0.2, f'{L}/whoosh-fast.flac', f'{lo(1500)},{pitch(0.9)}', -31, 'stream parts round the bubble'),
 (B['steers'] + 0.4, f'{L}/whoosh-fast.flac', f'{lo(2200)},{pitch(1.15)}', -31, 'particles slide down the lines'),
 (B['poles'] + 0.1, f'{L}/glass-ting.flac', f'{lo(3500)},afade=t=out:st=0.8:d=1.0', -29, 'polar crowns ignite'),
 (CUT_SLICE - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut to the side view over the pole'),
 bed(CUT_SLICE, CUT_END, 'syn:pink', 'highpass=f=200,lowpass=f=900', -33, 'upper air: thin hiss bed'),
 (B['slam'] + 0.05, f'{L}/electric-spark-crackle.flac', f'{lo(2400)},atrim=0:1.4,afade=t=out:st=0.8:d=0.6', -30, 'bits slam into the air'),
 (B['oxygen'] + 0.1, f'{L}/pop-soft.flac', f'{lo(2600)},{pitch(1.0)}', -27, '"oxygen: green"'),
 (B['higher'] + 0.15, f'{L}/pop-soft.flac', f'{lo(2600)},{pitch(1.15)}', -27, '"higher oxygen: red"'),
 (B['nitrogen'] + 0.05, f'{L}/pop-soft.flac', f'{lo(2600)},{pitch(1.3)}', -27, '"nitrogen: blue + purple"'),
 (CUT_END + 0.1, f'{L}/whoosh-deep.flac', f'{lo(1100)},{pitch(0.75)}', -25, 'pull back to the whole Earth'),
 (CUT_END, 'syn:brown', f'atrim=0:{T - CUT_END},lowpass=f=140,afade=t=in:d=0.3,afade=t=out:st={T - CUT_END - 1.5}:d=1.5', -27, 'space: drone bed'),
 (B['lighting'] + 0.1, f'{L}/glass-ting.flac', f'{lo(3200)},afade=t=out:st=0.8:d=1.2', -29, 'end card'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 1.8}:d=1.8,volume={MUSIC_DB}dB[m]',
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

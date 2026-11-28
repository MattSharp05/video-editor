# You can't see the Great Wall from space: voice (AI, r3-m07, Broadcast library) up front, Dreamer (Kevin MacLeod, CC BY 4.0) ducked under
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
MUSIC = f'{HERE}/work/Dreamer.mp3'   # incompetech.com source_url from the brief (git-ignored)
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 7.5
STEM = len(sys.argv) > 2
B = dict(astro=cue('Most astronauts'), no=cue('say no.'), wall=cue('The wall is long.'), branches=cue('branches.'), thin=cue('But it'),
         wide=cue('as wide'), same=cue('the same colours'), station=cue('The Space Station'), four=cue('four hundred kilometres'),
         frm=cue('From there,'), away=cue('metres away.'), so=cue('So astronauts'), spot=cue('spot it'), eyes=cue('their eyes.'),
         what=cue('What do'), cities=cue('Cities,'), huge=cue('The wall is huge.'), just=cue('Just not'))
CUT_LONG, CUT_THIN, CUT_STATION, CUT_PENCIL, CUT_SEARCH, CUT_END = (B[k] - 0.1 for k in ('astro', 'thin', 'station', 'frm', 'so', 'huge'))
WP = 0.55   # whoosh-deep peaks 0.55 s into the file: start it that much before a cut
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
def bed(t0, t1, src, flt, g, note):
    return (t0, src, f'atrim=0:{t1 - t0},{flt},afade=t=in:d=0.05,afade=t=out:st={t1 - t0 - 0.06}:d=0.06', g, note)
CUES = [
 bed(0, CUT_LONG, 'syn:pink', 'highpass=f=150,lowpass=f=700', -32, 'ridge: wind bed'),
 (0.25, f'{L}/whoosh-deep.flac', f'{lo(1400)},{pitch(0.8)}', -27, 'camera cranes up off the wall'),
 (CUT_LONG - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut to orbit'),
 bed(CUT_LONG, CUT_THIN, 'syn:brown', 'lowpass=f=150', -27, 'orbit: drone bed'),
 (B['astro'] + 0.05, f'{L}/sonar-ping.flac', f'{lo(3000)},afade=t=out:st=0.6:d=0.8', -31, 'search ring hunts'),
 (B['no'] + 0.15, f'{L}/relay-click.flac', lo(3000), -30, 'ring settles on "?"'),
 (B['wall'], f'{L}/whoosh-fast.flac', f'{lo(1600)},{pitch(0.9)}', -30, 'amber ribbon starts drawing'),
 (B['wall'] + 0.3, f'{L}/tile-clicks.flac', f'{lo(3500)},atrim=0:2.8,afade=t=out:st=2.0:d=0.8', -36, 'counter running'),
 (B['branches'] - 0.2, f'{L}/whoosh-fast.flac', f'{lo(2200)},{pitch(1.15)}', -31, 'branches sprout'),
 (CUT_THIN - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut to the wall'),
 bed(CUT_THIN, CUT_STATION, 'syn:pink', 'highpass=f=150,lowpass=f=700', -32, 'ridge: wind bed'),
 (CUT_THIN, 'syn:brown', f'atrim=0:{B["same"] - CUT_THIN},lowpass=f=90,afade=t=in:d=0.3,afade=t=out:st={B["same"] - CUT_THIN - 0.8}:d=0.8', -30, 'car on the wall: engine rumble'),
 (B['wide'] - 0.05, f'{L}/pop-soft.flac', lo(2600), -28, 'ruler across the wall'),
 (B['same'] - 0.05, f'{L}/pop-soft.flac', f'{lo(2600)},{pitch(1.12)}', -28, 'swatch: wall'),
 (B['same'] + 0.2, f'{L}/pop-soft.flac', f'{lo(2600)},{pitch(1.25)}', -28, 'swatch: hills'),
 (B['same'] + 0.6, f'{L}/whoosh-deep.flac', f'{lo(1100)},{pitch(0.7)}', -27, 'camera climbs away, wall vanishes'),
 (CUT_STATION - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut to the station in orbit'),
 bed(CUT_STATION, CUT_PENCIL, 'syn:brown', 'lowpass=f=150', -27, 'orbit: drone bed'),
 (B['station'] + 0.3, f'{L}/electrical-hum.flac', f'{lo(900)},atrim=0:2.2,afade=t=in:d=0.4,afade=t=out:st=1.4:d=0.8', -32, 'station passes'),
 (B['four'] + 0.05, f'{L}/glass-ting.flac', f'{lo(3200)},afade=t=out:st=0.6:d=0.8', -30, '400 km bracket'),
 (CUT_PENCIL - WP, f'{L}/whoosh-fast.flac', lo(2000), -25, 'cut to the pencil'),
 bed(CUT_PENCIL, CUT_SEARCH, 'syn:pink', 'highpass=f=250,lowpass=f=1200', -36, 'pitch: open-air bed'),
 (B['frm'] + 0.3, f'{L}/whoosh-deep.flac', f'{lo(1200)},{pitch(0.85)}', -26, 'pull back from the pencil'),
 (B['away'] + 0.1, f'{L}/sonar-ping.flac', f'{lo(3000)},afade=t=out:st=0.6:d=0.8', -31, 'ring marks the lost pencil'),
 (CUT_SEARCH - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut to the station view'),
 bed(CUT_SEARCH, CUT_END, 'syn:brown', 'lowpass=f=150', -27, 'orbit: drone bed'),
 (B['so'] + 0.1, f'{L}/sonar-ping.flac', f'{lo(3000)},afade=t=out:st=0.6:d=0.8', -32, 'ring hunts'),
 (B['spot'] + 0.15, f'{L}/relay-click.flac', lo(3000), -31, 'ring: "wall?"'),
 (B['eyes'], f'{L}/relay-click.flac', f'{lo(3000)},{pitch(0.9)}', -31, 'ring: "wall?" again'),
 (B['what'] - 0.1, f'{L}/whoosh-deep.flac', f'{lo(1000)},{pitch(0.7)}', -28, 'night sweeps across'),
 (B['cities'], f'{L}/glass-ting.flac', f'{lo(3500)},afade=t=out:st=0.8:d=1.0', -30, 'city lights bloom'),
 (CUT_END - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut back to the wall'),
 (CUT_END, 'syn:pink', f'atrim=0:{T - CUT_END},highpass=f=150,lowpass=f=700,afade=t=in:d=0.05,afade=t=out:st={T - CUT_END - 1.5}:d=1.5', -32, 'ridge: wind bed'),
 (B['huge'] + 0.6, f'{L}/impact-deep.flac', lo(1500), -27, '"huge": the tower looms'),
 (B['just'] + 0.05, f'{L}/glass-ting.flac', f'{lo(3200)},afade=t=out:st=0.8:d=1.2', -30, 'end card'),
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

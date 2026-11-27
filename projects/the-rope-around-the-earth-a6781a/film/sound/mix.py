# Why the sky is blue: voice (AI, r3-m07, Broadcast library) up front, Floating Cities (CC BY 4.0) ducked under
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
VO_END = W[-1]['e']; T = VO_END + 2.2   # = DUR_S in timeline.ts
ROOT = '/home/user/video-editor'
L = f'{ROOT}/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = f'{ROOT}/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 7.5
STEM = len(sys.argv) > 2
B = dict(choose=cue('choose blue?'), answer=cue('The answer'), bounce=cue('bounce it'), but=cue('But they'), five=cue('five times'),
         red=cue('Red mostly'), blue=cue('Blue gets scattered'), wherever=cue('So wherever'), sunset=cue('At sunset,'), more=cue('much more'),
         along=cue('Along the'), only=cue('Only the'), sky=cue("The sky doesn't"), scatters=cue('scatters it'))
CUT_MACRO, CUT_SKY, CUT_SUNSET, CUT_DUSK, CUT_END = (B[k] - 0.1 for k in ('answer', 'wherever', 'sunset', 'only', 'sky'))
WP = 0.55   # whoosh-deep peaks 0.55 s into the file: start it that much before a cut
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
def bed(t0, t1, src, flt, g, note):
    return (t0, src, f'atrim=0:{t1 - t0},{flt},afade=t=in:d=0.05,afade=t=out:st={t1 - t0 - 0.06}:d=0.06', g, note)
CUES = [
 bed(0, CUT_MACRO, 'syn:brown', 'lowpass=f=140', -26, 'space: low drone bed'),
 (0.2, f'{L}/whoosh-deep.flac', f'{lo(1200)},{pitch(1.1)}', -30, 'the braid of sunlight streaks along the limb'),
 (B['choose'] - 0.05, f'{L}/glass-ting.flac', f'{lo(3500)},afade=t=out:st=0.8:d=1.0', -29, 'the blue strand flares ("why blue?")'),
 (CUT_MACRO - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut into the air (macro)'),
 bed(CUT_MACRO, CUT_SKY, 'syn:pink', 'highpass=f=400,lowpass=f=2200', -36, 'macro: air hiss bed'),
 (B['bounce'] + 0.05, f'{L}/pop-soft.flac', f'{lo(2600)},{pitch(1.15)}', -27, 'ricochet off a molecule'),
 (B['bounce'] + 0.45, f'{L}/pop-soft.flac', f'{lo(2600)},{pitch(1.3)}', -29, 'ricochet'),
 (B['but'] + 0.25, f'{L}/tile-clicks.flac', f'{lo(2200)},atrim=0:0.9,afade=t=out:st=0.5:d=0.4', -33, 'tally counters appear and tick'),
 (B['five'] + 0.05, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(1.05)}', -25, '"about 5x more"'),
 (B['red'] - 0.1, f'{L}/whoosh-fast.flac', f'{lo(900)},{pitch(0.8)}', -31, 'red strand keeps going straight'),
 (B['blue'] + 0.2, f'{L}/glass-ting.flac', f'{lo(3000)},{pitch(0.9)},afade=t=out:st=0.8:d=1.4', -30, 'the air glows blue'),
 (CUT_SKY - WP, f'{L}/whoosh-deep.flac', lo(1800), -23, 'cut to the ground at midday'),
 bed(CUT_SKY, CUT_SUNSET, 'syn:pink', 'highpass=f=150,lowpass=f=650', -30, 'midday: wind bed'),
 (CUT_SUNSET - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut to space, sunset pass'),
 bed(CUT_SUNSET, CUT_DUSK, 'syn:brown', 'lowpass=f=140', -26, 'space: drone bed'),
 (B['sunset'] + 0.6, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(1.1)}', -26, '"noon: short trip"'),
 (B['more'] + 0.05, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(0.9)}', -25, '"sunset: long trip"'),
 (B['along'] - 0.3, f'{L}/whoosh-deep.flac', f'{lo(900)},{pitch(0.75)}', -29, 'push in along the sunset path'),
 (CUT_DUSK - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut to the ground at sunset'),
 bed(CUT_DUSK, CUT_END, 'syn:pink', 'highpass=f=120,lowpass=f=500', -30, 'dusk: wind bed'),
 (CUT_END - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut to space, pull back'),
 (CUT_END, 'syn:brown', f'atrim=0:{T - CUT_END},lowpass=f=140,afade=t=in:d=0.05,afade=t=out:st={T - CUT_END - 1.5}:d=1.5', -26, 'space: drone bed'),
 (B['scatters'] + 0.05, f'{L}/glass-ting.flac', f'{lo(3200)},afade=t=out:st=0.8:d=1.2', -29, '"blue = scattered light"'),
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

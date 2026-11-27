# Fresh or salt: voice (AI, r3-m07, Broadcast library) up front, "Lightless Dawn" (Kevin MacLeod, CC BY 4.0) ducked
# under speech, and soft sounds with a visible cause, timed from the same words as the picture (src/words.json; cut
# times mirror src/timeline.ts CUT). CC0 library (library/sfx/cstack-cc0) only.
# Music is not committed (15 MB): curl -L -o sound/src/lightless-dawn.mp3 "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Lightless%20Dawn.mp3"
# usage: python3 sound/mix.py [music_dB] [stem]   (from film/) -> sound/work/mix.wav, sound/cues.json
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
W = json.load(open(f'{HERE}/../src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
def cue(p, nth=0):
    ps = [norm(x) for x in p.split()]; hits = [W[i]['s'] for i in range(len(W) - len(ps) + 1) if all(norm(W[i + j]['w']) == ps[j] for j in range(len(ps)))]
    return hits[nth]
def cue_end(p, nth=0):
    s = cue(p, nth); i = [w['s'] for w in W].index(s); return W[i + len(p.split()) - 1]['e']
VO_END = W[-1]['e']; T = VO_END + 1.4   # = DUR_S in timeline.ts
ROOT = '/home/user/video-editor'
L = f'{ROOT}/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = f'{HERE}/src/lightless-dawn.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 5
STEM = len(sys.argv) > 2
B = dict(two=cue('Two ice cubes,'), which=cue('Which melts first?'), pause=cue('Pause and guess.'), most=cue('Most people pick salt,'),
         because=cue('because salt melts'), roads=cue('on roads.'), but=cue('But the cube'), first=cue('melts first.', 1),
         watch=cue('Watch the blue'), cold=cue('Cold water is heavier'), warm=cue('Warmer water comes up'), inSalt=cue('In salt water,'),
         lighter=cue('is lighter than'), blanket=cue('cold blanket.'), soSalt=cue('So salt does not'), tryIt=cue('Try it at home'))
pre = 0.08
CUT = {k: B[k] - pre for k in ('pause', 'because', 'but', 'watch', 'inSalt', 'soSalt')}
WP = 0.55   # whoosh-deep peaks 0.55 s into the file: start it that much before a cut
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
def bed(t0, t1, src, flt, g, note):
    return (t0, src, f'atrim=0:{t1 - t0},{flt},afade=t=in:d=0.4,afade=t=out:st={t1 - t0 - 0.4}:d=0.4', g, note)
DROP = {'fresh': B['two'] + 0.15 + 0.32, 'salt': B['two'] + 0.45 + 0.32}   # cube hits the water (timeline.ts DROP + 0.32)
CUES = [
 bed(0, CUT['because'], f'{L}/city-night.flac', 'highpass=f=120,lowpass=f=2500', -40, 'kitchen room tone (window, distant street)'),
 (DROP['fresh'] - 0.02, f'{L}/water-plunge.flac', f'{lo(5000)},{pitch(1.25)},atrim=0:0.9,afade=t=out:st=0.5:d=0.4', -22, 'fresh cube splashes in'),
 (DROP['salt'] - 0.02, f'{L}/water-plunge.flac', f'{lo(5000)},{pitch(1.15)},atrim=0:0.9,afade=t=out:st=0.5:d=0.4', -22, 'salt cube splashes in'),
 (DROP['fresh'] + 0.1, f'{L}/glass-ting.flac', f'{lo(6000)},{pitch(1.3)},afade=t=out:st=0.3:d=0.6', -32, 'ice knocks the glass'),
 (B['pause'], f'{L}/pop-soft.flac', lo(4000), -26, 'the first ? pops up'),
 (B['pause'] + 0.2, f'{L}/pop-soft.flac', f'{lo(4000)},{pitch(1.12)}', -27, 'the second ? pops up'),
 (B['most'] + 0.05, f'{L}/screen-tap.flac', lo(4000), -28, 'MOST PICK SALT: the salt ? turns gold'),
 (CUT['because'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -28, 'cut: the icy road'),
 bed(CUT['because'], CUT['but'], f'{L}/city-night.flac', 'highpass=f=200,lowpass=f=3000', -32, 'outdoors: street air'),
 (B['because'] + 0.45, f'{L}/tile-clicks.flac', f'{lo(5000)},atrim=0:1.2,afade=t=out:st=0.8:d=0.4', -30, 'salt grains patter on the ice'),
 (CUT['but'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -28, 'cut: back to the glasses, the race'),
 (CUT['but'] + 0.2, f'{L}/clock-tick.flac', f'{lo(3000)},atempo=2.0,atrim=0:{B["first"] + 0.9 - CUT["but"]},afade=t=out:st={B["first"] + 0.5 - CUT["but"]}:d=0.4', -31, 'time-lapse clock'),
 (B['first'] + 0.05, f'{L}/glass-ting.flac', f'{lo(5000)},afade=t=out:st=0.6:d=0.8', -27, 'FRESH WINS lands'),
 (CUT['watch'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -29, 'cut: close on the fresh glass'),
 (CUT['watch'] + 0.1, f'{L}/underwater-deep.flac', f'highpass=f=90,lowpass=f=1500,atrim=0:{CUT["soSalt"] - CUT["watch"]},afade=t=in:d=0.3,afade=t=out:st={CUT["soSalt"] - CUT["watch"] - 0.5}:d=0.4', -36, 'close on the water: soft underwater bed'),
 (B['cold'], f'{L}/bubbles-burst.flac', f'{lo(2000)},{pitch(0.8)},atrim=0:1.4,afade=t=out:st=0.9:d=0.5', -33, 'blue streams sink'),
 (B['warm'], f'{L}/whoosh-fast.flac', f'{lo(1400)},{pitch(0.7)}', -32, 'warm water swirls up'),
 (CUT['inSalt'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -29, 'cut: close on the salt glass'),
 (B['lighter'], f'{L}/bubbles-burst.flac', f'{lo(1800)},{pitch(0.75)},atrim=0:1.2,afade=t=out:st=0.8:d=0.4', -34, 'blue spreads along the top'),
 (B['blanket'], f'{L}/glass-ting.flac', f'{lo(3200)},{pitch(0.85)},afade=t=out:st=0.6:d=0.8', -29, 'COLD BLANKET lands'),
 (CUT['soSalt'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -28, 'cut: pull back to both glasses'),
 bed(CUT['soSalt'], T, f'{L}/city-night.flac', 'highpass=f=120,lowpass=f=2500', -40, 'kitchen room tone again'),
 (B['tryIt'], f'{L}/pop-soft.flac', f'{lo(4000)},{pitch(1.1)}', -26, 'TRY IT AT HOME lands'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=50:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
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

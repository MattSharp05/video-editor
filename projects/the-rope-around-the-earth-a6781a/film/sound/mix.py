# The rope around the Earth: voice (AI, r3-m07, Broadcast library) up front, "Lightless Dawn" (Kevin MacLeod,
# CC BY 4.0) ducked under speech, and soft sounds with a visible cause, timed from the same words as the picture
# (src/words.json; cut times mirror src/timeline.ts CUT_*). CC0 library (library/sfx/cstack-cc0) + synthesized noise
# beds only (labelled 'syn:').
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
VO_END = W[-1]['e']; T = VO_END + 1.6   # = DUR_S in timeline.ts
ROOT = '/home/user/video-editor'
L = f'{ROOT}/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = f'{HERE}/src/lightless-dawn.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 13
STEM = len(sys.argv) > 2
B = dict(wrap=cue('Wrap a rope'), whole=cue('whole Earth.'), now=cue('Now make'), longer=cue('meter longer.'), lift=cue('Lift it'),
         how=cue('How big'), guessEnd=cue_end('Pause and guess.'), spread=cue('One meter, spread'), nothing=cue('sounds like nothing.'),
         but=cue('But the gap'), sixteen=cue('sixteen centimeters.'), why=cue('A rope lifted'), six=cue('six steps'), so=cue('So one extra'),
         sixth=cue('a sixth'), size=cue('And the size'), never=cue('never matters.'), tennis=cue('Around a tennis'), same=cue('same sixteen'),
         what=cue('What did you'), guess=cue('guess?', 1))
pre = 0.08
CUT = {k: B[k] - pre for k in ('wrap', 'now', 'lift', 'how', 'spread', 'but', 'why', 'size', 'tennis', 'what')}
WP = 0.55   # whoosh-deep peaks 0.55 s into the file: start it that much before a cut
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
def bed(t0, t1, src, flt, g, note):
    return (t0, src, f'atrim=0:{t1 - t0},{flt},afade=t=in:d=0.05,afade=t=out:st={t1 - t0 - 0.06}:d=0.06', g, note)
CUES = [
 bed(0, CUT['but'], 'syn:brown', 'lowpass=f=130', -27, 'space: low drone bed'),
 (0.05, f'{L}/glass-ting.flac', f'{lo(3200)},{pitch(0.9)},afade=t=out:st=0.8:d=1.2', -31, 'the ring glows on the hook'),
 (CUT['wrap'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -25, 'cut: wide orbit'),
 (CUT['wrap'] + 0.15, f'{L}/rope-or-cable-winch.flac', f'{lo(2000)},atrim=0:2.2,afade=t=out:st=1.6:d=0.6', -30, 'the rope draws itself round'),
 (B['whole'] + 0.5, f'{L}/glass-ting.flac', f'{lo(3500)},afade=t=out:st=0.6:d=1.0', -30, 'the ring closes'),
 (CUT['now'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -25, 'cut: close on the rope'),
 (B['now'] + 0.1, f'{L}/rope-or-cable-winch.flac', f'{lo(1800)},atrim=0:0.6,afade=t=out:st=0.4:d=0.2,{pitch(1.2)}', -29, 'the ring opens'),
 (B['longer'] + 0.3, f'{L}/relay-click.flac', lo(2600), -27, 'the ends join'),
 (CUT['lift'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -25, 'cut: wide, posts'),
 (CUT['lift'] + 0.15, f'{L}/tile-clicks.flac', f'{lo(2400)},atrim=0:1.4,afade=t=out:st=1.0:d=0.4', -31, 'posts ripple up round the planet'),
 (CUT['how'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -25, 'cut: low over the limb'),
 *[(B['guessEnd'] + k * (CUT['spread'] - B['guessEnd'] - 0.1) / 3, f'{L}/clock-tick.flac', f'{lo(3000)},atrim=0:0.3', -24, f'countdown {3 - k}') for k in range(3)],
 (CUT['spread'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -25, 'cut: wide'),
 (B['spread'] + 0.4, f'{L}/whoosh-fast.flac', f'{lo(1500)},{pitch(0.9)}', -31, 'the red metre smears round'),
 (CUT['but'] - WP, f'{L}/whoosh-deep.flac', lo(2000), -21, 'crash zoom: cut to the ground'),
 bed(CUT['but'], CUT['why'], 'syn:pink', 'highpass=f=150,lowpass=f=700', -31, 'savanna: wind bed'),
 (B['sixteen'] - 0.25, f'{L}/servo-arm.flac', f'{lo(2600)},atrim=0:0.6,afade=t=out:st=0.4:d=0.2', -29, 'the tape rises to the rope'),
 (B['sixteen'] + 0.3, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(1.1)}', -27, '"16 CM" lands'),
 (CUT['why'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -24, 'cut: the view from above'),
 bed(CUT['why'], CUT['tennis'], 'syn:brown', 'lowpass=f=120', -30, 'diagram: low bed'),
 *[(B['six'] - 0.4 + k * 0.12, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(1 + 0.07 * k)}', -29, f'red corner {k + 1} flies down') for k in range(0, 4, 3)],
 *[(B['six'] + 0.6 + k * (B['so'] - 0.3 - B['six'] - 0.6) / 6, f'{L}/screen-tap.flac', f'{lo(2600)},{pitch(1 + 0.05 * k)}', -30, f'step tick {k + 1}') for k in range(0, 6, 2)],
 (B['sixth'] + 0.8, f'{L}/glass-ting.flac', f'{lo(3200)},afade=t=out:st=0.6:d=1.0', -30, 'the radius: 16 cm'),
 (CUT['size'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -26, 'cut: the square alone'),
 (B['size'] + 0.3, f'{L}/whoosh-fast.flac', f'{lo(1000)},{pitch(0.75)}', -30, 'the Earth shrinks to nothing'),
 (B['never'] + 0.4, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(1.2)}', -27, 'a tennis ball appears in the ring'),
 (CUT['tennis'] - WP, f'{L}/whoosh-deep.flac', lo(1800), -24, 'cut: the tennis ball on the sand'),
 bed(CUT['tennis'], T, 'syn:pink', 'highpass=f=150,lowpass=f=700', -31, 'savanna: wind bed'),
 (B['same'] - 0.3, f'{L}/servo-arm.flac', f'{lo(2600)},atrim=0:0.6,afade=t=out:st=0.4:d=0.2,{pitch(1.1)}', -29, 'the tape slides out'),
 (CUT['what'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -25, 'cut: the cat at the rope'),
 (B['guess'] + 0.05, f'{L}/glass-ting.flac', f'{lo(3200)},afade=t=out:st=0.8:d=1.2', -29, '"WHAT DID YOU GUESS?"'),
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

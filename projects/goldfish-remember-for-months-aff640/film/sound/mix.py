# Goldfish remember for months: voice (AI, r3-m07, Broadcast library) up front, "Floating Cities" (Kevin MacLeod,
# CC BY 4.0) ducked under speech, and soft sounds with a visible cause, timed from the same words as the picture
# (src/words.json; cut times mirror src/timeline.ts CUT). CC0 library (library/sfx/cstack-cc0) only.
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
MUSIC = f'{HERE}/src/floating-cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 5
STEM = len(sys.argv) > 2
B = dict(not_=cue('Not even close.'), sci=cue('Scientists in England'), push=cue('Push the lever,'), food=cue('food drops in.'),
         then=cue('Then they made'), hour=cue('one hour a day.'), so=cue('So the fish learned'), pushed=cue('They pushed'),
         close=cue('came close.'), germ=cue('In Germany,'), meant=cue('meant food.'), three=cue('Three months later,'),
         still=cue('still knew'), myth=cue('So the three-second'), rem=cue('Goldfish remember'))
pre = 0.08
CUT = {k: B[k] - pre for k in ('sci', 'then', 'so', 'germ', 'three', 'myth')}
WP = 0.55   # whoosh-deep peaks 0.55 s into the file: start it that much before a cut
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
def bed(t0, t1, src, flt, g, note):
    return (t0, src, f'atrim=0:{t1 - t0},{flt},afade=t=in:d=0.4,afade=t=out:st={t1 - t0 - 0.4}:d=0.4', g, note)
# lever pushes in the learn shot (mirror timeline.ts pushTimes('learn'))
lp, p, gap = [], B['pushed'] - 0.2, 1.1
while p < CUT['germ'] - 0.3: lp.append(p); p += gap; gap = max(0.42, gap * 0.8)
FEED = B['close'] + 0.1
CUES = [
 bed(0, T, f'{L}/underwater-deep.flac', 'highpass=f=90,lowpass=f=1800', -34, 'inside the tank: bed'),
 bed(0, T, f'{L}/bubbles-burst.flac', 'highpass=f=300,lowpass=f=4000', -38, 'the bubbler: bed'),
 (B['not_'] - 0.1, f'{L}/rubber-stamp.flac', lo(3000), -26, 'the timer hits 0.0 and NOT EVEN CLOSE lands'),
 (CUT['sci'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -28, 'cut: the lever shot'),
 (B['sci'] + 0.5, f'{L}/servo-arm.flac', f'{lo(2400)},atrim=0:0.9,afade=t=out:st=0.6:d=0.3', -28, 'the lever lowers into the water'),
 (B['push'] + 0.1, f'{L}/relay-click.flac', lo(3500), -24, 'the fish pushes the lever'),
 (B['push'] + 0.25, f'{L}/glass-ting.flac', f'{lo(3200)},afade=t=out:st=0.6:d=0.8', -30, 'the lever glows: food'),
 (B['push'] + 0.3, f'{L}/water-plunge.flac', f'{lo(3000)},{pitch(1.4)},atrim=0:0.8', -30, 'pellets hit the water'),
 (CUT['then'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -28, 'cut: the clock'),
 (CUT['then'] + 0.1, f'{L}/clock-tick.flac', f'{lo(3000)},atrim=0:{B["hour"] - CUT["then"]},afade=t=out:st={B["hour"] - CUT["then"] - 0.4}:d=0.4,atempo=2.0', -32, 'the hand spins through a day'),
 (B['then'] + 0.8, f'{L}/relay-click.flac', f'{lo(2500)},{pitch(0.85)}', -30, 'push outside the hour: nothing'),
 (B['then'] + 2.0, f'{L}/relay-click.flac', f'{lo(2500)},{pitch(0.8)}', -31, 'push outside the hour: nothing'),
 (B['hour'], f'{L}/glass-ting.flac', f'{lo(3200)},{pitch(0.9)},afade=t=out:st=0.6:d=0.8', -30, 'the feeding hour lights cyan'),
 (CUT['so'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -28, 'cut: the fish learns the time'),
 *[(x + 0.1, f'{L}/relay-click.flac', f'{lo(3500)},{pitch(1 + 0.04 * i)}', -27, f'push {i + 1}, faster as the hour nears') for i, x in enumerate(lp)],
 (FEED, f'{L}/glass-ting.flac', f'{lo(3200)},afade=t=out:st=0.6:d=0.8', -29, 'the hour arrives: the lever pays'),
 (FEED + 0.1, f'{L}/water-plunge.flac', f'{lo(3000)},{pitch(1.4)},atrim=0:0.8', -30, 'pellets hit the water'),
 (CUT['germ'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -28, 'cut: the smell shot'),
 (B['germ'] + 0.25, f'{L}/pop-soft.flac', lo(3000), -27, 'a drop falls from the pipette'),
 (B['germ'] + 0.4, f'{L}/bubbles-burst.flac', f'{lo(2500)},atrim=0:1.2,afade=t=out:st=0.8:d=0.4', -31, 'the cyan cloud spreads'),
 (B['meant'] - 0.2, f'{L}/water-plunge.flac', f'{lo(3000)},{pitch(1.4)},atrim=0:0.8', -31, 'pellets in the cloud'),
 (CUT['three'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -28, 'cut: three months later'),
 (CUT['three'] + 0.1, f'{L}/clock-tick.flac', f'{lo(3000)},atempo=2.0,atrim=0:{B["still"] - CUT["three"] - 0.4},afade=t=out:st={B["still"] - CUT["three"] - 0.8}:d=0.4', -32, 'days flicker past'),
 (B['still'] - 0.2, f'{L}/pop-soft.flac', lo(3000), -27, 'the same smell drop'),
 (B['still'] + 0.4, f'{L}/whoosh-fast.flac', f'{lo(1500)},{pitch(1.2)}', -31, 'the fish darts straight to it'),
 (CUT['myth'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -28, 'cut: the pull-back'),
 (B['rem'], f'{L}/glass-ting.flac', f'{lo(3200)},{pitch(1.1)},afade=t=out:st=0.6:d=0.8', -30, 'MONTHS, NOT SECONDS lands'),
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

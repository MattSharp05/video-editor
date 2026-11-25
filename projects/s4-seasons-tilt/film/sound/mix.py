# s4 Seasons tilt sound: voice (AI, m5) up front, Floating Cities (series song, CC BY 4.0) ducked under speech, and soft
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
B = dict(closest=cue('closest to the'), but=cue('But'), january=cue('January,'), winterUp=cue('winter up'), real=cue('The real'),
         tilt=cue("Earth's tilt."), june=cue('In June,'), follow=cue('Follow'), beam=cue('beam of'), summer=cue('In summer,'),
         patch=cue('small patch.'), winter=cue('In winter, the Sun'), sameBeam=cue('The same beam'), half=cue('half'), why=cue("That's why"),
         newYork=cue('New York'), sydney=cue('Sydney.'), notClose=cue("It's not"), close=cue('close the'), straightIts=cue('straight its'))
CUT_MEADOW, CUT_BACK = B['summer'] - 0.12, B['why'] - 0.12   # = CUT_* in timeline.ts
FLY = 0.9
WP = 0.55   # whoosh-deep peaks 0.55 s into the file: start it that much before a cut
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
CUES = [
 (0.0, 'syn:brown', f'atrim=0:{CUT_MEADOW},lowpass=f=140,afade=t=in:d=0.6,afade=t=out:st={CUT_MEADOW - 0.06}:d=0.06', -26, 'space: a low drone bed'),
 (0.5, f'{L}/whoosh-deep.flac', f'{lo(900)},{pitch(0.8)}', -27, 'Earth swings in along the myth oval'),
 (B['closest'] + 0.12, f'{L}/rubber-stamp.flac', lo(2000), -25, '"closest = summer?" tag'),
 (B['but'] - 0.25, f'{L}/whoosh-deep.flac', f'{lo(1000)},{pitch(0.65)}', -24, 'the oval deflates into a near-circle'),
 (B['january'] - 0.05, f'{L}/pop-soft.flac', lo(2200), -24, 'JAN 3 tag'),
 (B['winterUp'] - 0.5, 'syn:pink', 'atrim=0:1.4,highpass=f=2500,lowpass=f=7000,afade=t=in:d=0.5,afade=t=out:st=0.6:d=0.8', -36, 'snow sweeps over the north'),
 (B['real'] + 0.3, f'{L}/glass-ting.flac', f'{lo(3000)},afade=t=out:st=0.8:d=1.2', -30, 'the axis shoots out of the poles'),
 (B['tilt'] - 0.15, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(1.2)}', -25, '23.4 deg arc'),
 (B['june'] + 0.2, f'{L}/whoosh-deep.flac', f'{lo(1100)},{pitch(0.75)}', -26, 'half a lap round the Sun'),
 (B['follow'] - 0.1, 'syn:pink', f'atrim=0:{CUT_MEADOW - B["follow"] + 0.1},bandpass=f=900:w=1.2,afade=t=in:d=1.6,afade=t=out:st={CUT_MEADOW - B["follow"] - 0.05}:d=0.06', -31, 'the beam leaves the Sun (riser)'),
 (CUT_MEADOW - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut to the meadow'),
 (CUT_MEADOW, 'syn:pink', f'atrim=0:{CUT_BACK - CUT_MEADOW},highpass=f=150,lowpass=f=650,afade=t=in:d=0.05,afade=t=out:st={CUT_BACK - CUT_MEADOW - 0.06}:d=0.06', -29, 'meadow: wind bed'),
 (CUT_MEADOW + 0.25, f'{L}/tile-clicks.flac', f'{lo(2500)},atrim=0:1.2,afade=t=out:st=0.7:d=0.5', -30, 'the first 100 marbles land (summer)'),
 (B['patch'] - 0.6, f'{L}/pop-soft.flac', lo(2400), -24, '"100% heat"'),
 (B['winter'], 'syn:pink', 'atrim=0:2.4,highpass=f=300,lowpass=f=1500,afade=t=in:d=0.8,afade=t=out:st=1.2:d=1.2', -27, 'winter time-lapse: the wind rises, snow spreads'),
 (B['sameBeam'] + 0.25, f'{L}/tile-clicks.flac', f'{lo(2000)},{pitch(0.85)},atrim=0:1.4,afade=t=out:st=0.8:d=0.6', -32, 'the slanted marbles land, spread out'),
 (B['half'] - 0.35, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(0.9)}', -24, '"46%" (left)'),
 (B['half'] - 0.2, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(0.9)}', -25, '"46%" (right)'),
 (CUT_BACK - WP, f'{L}/whoosh-deep.flac', lo(1800), -22, 'cut back to space'),
 (CUT_BACK, 'syn:brown', f'atrim=0:{T - CUT_BACK},lowpass=f=140,afade=t=in:d=0.05,afade=t=out:st={T - CUT_BACK - 1.5}:d=1.5', -26, 'space: drone bed again'),
 (B['newYork'] - 0.1, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(1.1)}', -24, '"New York: summer"'),
 (B['sydney'] - 1.0, f'{L}/whoosh-deep.flac', f'{lo(900)},{pitch(0.7)}', -28, 'Earth turns, Sydney comes round'),
 (B['sydney'] - 0.1, f'{L}/pop-soft.flac', f'{lo(2000)},{pitch(0.85)}', -24, '"Sydney: winter"'),
 (B['close'] + 0.1, f'{L}/rubber-stamp.flac', f'{lo(1800)},{pitch(0.9)}', -24, '"distance" struck out'),
 (B['notClose'] + 0.7, f'{L}/whoosh-deep.flac', f'{lo(1000)},{pitch(0.8)}', -27, 'pull back to the orbit'),
 (B['straightIts'] - 0.1, f'{L}/glass-ting.flac', f'{lo(3200)},afade=t=out:st=0.8:d=1.2', -29, '"angle"'),
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

# Cat landing 01 sound: voice up front, Floating Cities (Kevin MacLeod, CC BY 4.0) ducked under speech, and soft
# sounds with a visible cause, timed from beats.json. CC0 library (library/sfx/cstack-cc0) + synthesized only.
# usage: python3 sound/mix.py [music_db] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
pitch = lambda r: f'asetrate=48000*{r},aresample=48000'
CUES = [
 (0.95, f'{L}/pop-soft.flac', f'{pitch(0.8)},lowpass=f=3000', -20, 'paw slips off the sill'),
 (1.15, f'{L}/whoosh-deep.flac', 'lowpass=f=1600', -19, 'falls off the sill'),
 (B['tail'] - 0.1, 'syn:brown', 'atrim=0:2.9,lowpass=f=600,tremolo=f=11:d=0.95,afade=t=in:d=0.3,afade=t=out:st=2.2:d=0.7', -17, 'tail spins like a rotor (whop-whop), sputters out'),
 (4.0, f'{L}/bubbles-burst.flac', 'lowpass=f=4000,afade=t=out:st=1.2:d=0.8', -24, 'myth bubbles pop'),
 (B['actually'] + 0.5, f'{L}/whoosh-fast.flac', 'lowpass=f=3000', -20, 'the Manx drops past'),
 (7.2, f'{L}/whoosh-deep.flac', f'{pitch(1.25)},lowpass=f=2500', -22, 'into the ear'),
 (7.6, f'{L}/underwater-deep.flac', 'atrim=0:3.3,lowpass=f=900,afade=t=in:d=0.5,afade=t=out:st=2.6:d=0.7', -24, 'fluid sloshing in the inner-ear loops'),
 (9.55, f'{L}/servo-arm.flac', 'atrim=0:1.0,lowpass=f=3500,afade=t=out:st=0.7:d=0.3', -24, 'the UP dial swings'),
 (10.55, f'{L}/relay-click.flac', 'lowpass=f=3500', -20, 'the pilot pulls the lever'),
 (10.85, f'{L}/whoosh-deep.flac', 'lowpass=f=2000', -21, 'out through the eye'),
 (13.2, f'{L}/tile-clicks.flac', 'atrim=0:0.9,lowpass=f=3000,afade=t=out:st=0.5:d=0.4', -24, 'chalk wall crumbles'),
 (B['bends'] + 0.3, f'{L}/pop-soft.flac', f'{pitch(0.7)}', -22, 'the curl snaps into a V'),
 (21.6, f'{L}/whoosh-fast.flac', f'{pitch(1.1)},lowpass=f=3500', -19, 'front half turns a lot'),
 (29.2, f'{L}/whoosh-deep.flac', 'lowpass=f=2200', -18, 'back half catches up'),
 (B['catches'] + 0.25, f'{L}/padlock-close.flac', 'lowpass=f=3000', -22, 'the click: halves line up'),
 (33.0, f'{L}/clock-tick.flac', 'atrim=0:0.4', -24, 'stopwatch appears'),
 (33.35, f'{L}/whoosh-fast.flac', f'{pitch(1.3)}', -20, 'the flip at real speed'),
 (35.6, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -18, 'the floor rushes up'),
 (B['bendthem'], f'{L}/impact-deep.flac', 'lowpass=f=500,afade=t=out:st=0.4:d=0.4', -20, 'soft landing on the rug'),
 (B['softly'] + 0.3, f'{L}/pop-soft.flac', f'{pitch(0.6)},lowpass=f=1500', -19, 'toast flops butter side down'),
 (42.85, 'syn:brown', 'atrim=0:1.0,lowpass=f=260,tremolo=f=24:d=0.8,afade=t=in:d=0.2,afade=t=out:st=0.6:d=0.4', -16, 'purr under the chin scratch'),
 (43.4, f'{L}/whoosh-deep.flac', 'lowpass=f=1500', -21, 'tilt up the wall'),
] + [(B[k] + 0.02, f'{L}/pop-soft.flac', pitch(0.9 + 0.08 * i), -21, f'recap word {k}') for i, k in enumerate(['r_bends', 'r_tucks', 'r_twists', 'r_swaps', 'r_lands'])] + [
 (49.35, f'{L}/whoosh-fast.flac', f'{pitch(0.9)},lowpass=f=3000', -20, 'leap back to the sill'),
 (50.35, f'{L}/pop-soft.flac', f'{pitch(0.75)}', -22, 'lands on the sill'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.0,afade=t=out:st={T - 2.0}:d=2.0,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=4:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4], 'src': os.path.basename(c[1])} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues')

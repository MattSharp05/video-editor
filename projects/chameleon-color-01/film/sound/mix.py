# Chameleon color 01 sound (from Octopus 01): voice up front, Floating Cities (Matthew's pick, CC BY 4.0) clearly audible
# under it, a soft synthesized forest air on the branch and the CC0 deep bed inside the skin, and a few soft effects on
# the picture's own events (beats.json). CC0 library + synthesized only.
# usage (from film/): ../../../lab/voice-picker/.venv-qw/bin/python sound/mix.py [music_db] [stem]
import json, os, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); W = f'{HERE}/work'; os.makedirs(W, exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']; SR = 48000
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = f'{HERE}/../../music/floating-cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
SW1, SW2 = B['nopaint_end'] + 0.35, B['next'] - 0.55
inskin = f"between(t,{SW1},{SW2})"
P = lambda r: f'asetrate=48000*{r},aresample=48000'
CUES = [  # (time, source, filter chain, gain dB, note)
 (0.0, 'syn:brown', f'aloop=loop=-1:size=2e5,atrim=0:{T},lowpass=f=700,highpass=f=80,afade=t=in:d=1.5,afade=t=out:st={T - 2}:d=2,volume=\'if({inskin},0.15,1)\':eval=frame', -33, 'forest air (synthesized), almost gone inside the skin'),
 (SW1 - 0.2, f'{L}/underwater-deep.flac', f'atrim=0:{SW2 - SW1 + 0.6},lowpass=f=900,afade=t=in:d=0.6,afade=t=out:st={SW2 - SW1}:d=0.6', -27, 'inside-the-skin bed'),
 (B['talk'] - 0.1, 'syn:pink', 'atrim=0:1.6,highpass=f=1200,lowpass=f=4500,afade=t=in:d=0.5,afade=t=out:st=0.8:d=0.8', -40, 'leaves rustle as the rival climbs in (synthesized)'),
 (B['bright'] - 0.1, f'{L}/whoosh-deep.flac', f'areverse,lowpass=f=1400,afade=t=in:d=0.4,{P(1.15)}', -29, 'the hero flushes bright'),
 (B['bright'] + 0.5, 'syn:brown', 'atrim=0:1.0,lowpass=f=350,afade=t=in:d=0.5,afade=t=out:st=0.6:d=0.4', -28, 'puffs up (synthesized)'),
 (B['dark'] + 0.05, f'{L}/whoosh-deep.flac', f'lowpass=f=700,{P(0.8)}', -31, 'the rival goes dark'),
 (B['how'] + 0.6, f'{L}/whoosh-deep.flac', 'lowpass=f=1500', -24, 'push toward the skin'),
 (SW1 - 0.3, f'{L}/whoosh-fast.flac', 'lowpass=f=1600', -27, 'into the skin'),
 (B['yellow'] + 0.1, f'{L}/pop-soft.flac', 'lowpass=f=1800', -29, 'yellow layer lights'),
 (B['crystals'] + 0.1, f'{L}/glass-ting.flac', 'lowpass=f=2400,afade=t=out:st=0.5:d=0.6', -38, 'crystals glint (soft)'),
 (B['calm'] + 0.2, f'{L}/whoosh-fast.flac', f'lowpass=f=1300,{P(0.9)}', -30, 'the sunbeam comes in'),
 (B['blue'], f'{L}/pop-soft.flac', f'lowpass=f=2000,{P(1.2)}', -29, 'blue bounces back'),
 (B['green'], f'{L}/pop-soft.flac', f'lowpass=f=2000,{P(1.35)}', -28, 'out comes green'),
 (B['apart'] - 0.3, 'syn:brown', 'atrim=0:1.4,lowpass=f=450,afade=t=in:d=0.9,afade=t=out:st=1.0:d=0.4', -27, 'the lattice spreads (synthesized)'),
 (B['glows'] + 0.1, f'{L}/pop-soft.flac', f'lowpass=f=1500,{P(0.85)}', -28, 'orange comes out'),
 (B['turndark'] + 0.3, f'{L}/whoosh-deep.flac', f'lowpass=f=600,{P(0.75)}', -27, 'dark arms rise'),
 (B['r_green'], f'{L}/pop-soft.flac', f'lowpass=f=2000,{P(1.35)}', -30, 'recap: green'),
 (B['r_orange'], f'{L}/pop-soft.flac', f'lowpass=f=1500,{P(0.85)}', -30, 'recap: orange'),
 (B['r_dark'] + 0.2, f'{L}/pop-soft.flac', f'lowpass=f=1000,{P(0.7)}', -29, 'recap: dark'),
 (SW2 - 0.3, f'{L}/whoosh-fast.flac', 'lowpass=f=1600,areverse,afade=t=in:d=0.3', -27, 'out of the skin'),
 (B['closely'] + 0.1, f'{L}/pop-soft.flac', f'lowpass=f=1600,{P(1.1)}', -33, 'the eye turns to us'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (tt, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=4:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
for i, (tt, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, tt) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{W}/stem_voice.wav', '-map', '[mduck]', f'{W}/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{W}/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues;', round(len(CUES) / T * 10, 1), 'per 10 s')

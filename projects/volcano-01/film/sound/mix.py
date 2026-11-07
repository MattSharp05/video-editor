# Volcano 01 sound: voice up front, Floating Cities (Matthew's music pick, CC BY 4.0) clearly audible under it, soft
# CC0 effects on the picture's events (beats.json) and synthesized rumbles/fizz (filtered noise, labelled).
# usage (from film/): ../vo/.venv-qw/bin/python sound/mix.py [music_db] [stem]
import json, os, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); W = f'{HERE}/work'; os.makedirs(W, exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']; SR = 48000
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2

CUES = [  # (time, source, filter chain, gain dB, note): every sound has a visible cause in the picture
 (B['blow'] - 0.4, 'syn:brown', 'atrim=0:3.0,lowpass=f=120,afade=t=in:d=0.3,afade=t=out:st=1.6:d=1.4', -12, 'hook: St. Helens bursts (synthesized rumble)'),
 (B['secret'] + 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -22, 'the knife cuts Kilauea open'),
 (B['fizz'] - 0.1, 'syn:pink', 'atrim=0:2.2,highpass=f=2500,lowpass=f=6000,afade=t=in:d=0.5,afade=t=out:st=1.2:d=1.0', -36, 'the gas fizzes in the magma (synthesized)'),
 (B['squeeze'] + 0.1, f'{L}/impact-deep.flac', 'lowpass=f=900,asetrate=48000*0.8,aresample=48000', -20, 'the rock above presses down'),
 (B['bubbles'] - 0.1, f'{L}/bubbles-burst.flac', 'lowpass=f=2500,afade=t=out:st=1.0:d=0.8', -25, 'bubbles form as the magma rises'),
 (B['depends'] + 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=1500,asetrate=48000*0.9,aresample=48000', -23, 'pull back; the knife opens St. Helens'),
 (B['pop'] - 0.05, f'{L}/pop-soft.flac', 'lowpass=f=2500', -24, 'a bubble pops at the summit'),
 (B['pop'] + 0.5, f'{L}/pop-soft.flac', 'lowpass=f=2200,asetrate=48000*0.85,aresample=48000', -27, 'another pop'),
 (B['easily'] + 0.2, f'{L}/bubbles-burst.flac', 'lowpass=f=2200,afade=t=out:st=1.2:d=0.8', -27, 'the gas streams out'),
 (B['rivers'], 'syn:brown', 'atrim=0:4.0,lowpass=f=400,highpass=f=60,tremolo=f=7:d=0.3,afade=t=in:d=0.8,afade=t=out:st=2.8:d=1.2', -26, 'lava rivers crackle and flow (synthesized)'),
 (B['glass'] - 0.3, f'{L}/whoosh-deep.flac', 'lowpass=f=1600', -22, 'across to St. Helens'),
 (B['sticky'] + 0.2, f'{L}/water-plunge.flac', 'lowpass=f=700,asetrate=48000*0.7,aresample=48000,afade=t=out:st=0.6:d=0.4', -24, 'the spoon sinks into sticky magma, stands'),
 (B['push'] + 0.2, 'syn:brown', 'atrim=0:2.5,lowpass=f=90,afade=t=in:d=1.8,afade=t=out:st=2.0:d=0.5', -18, 'pressure builds (synthesized)'),
 (B['quake'] - 0.1, 'syn:brown', 'atrim=0:4.2,lowpass=f=110,tremolo=f=9:d=0.5,afade=t=in:d=0.2,afade=t=out:st=2.6:d=1.6', -10, 'the earthquake and the slide (synthesized rumble)'),
 (B['boom'] + 0.25, f'{L}/impact-deep.flac', 'lowpass=f=1100,asetrate=48000*0.7,aresample=48000', -13, 'the blast'),
 (B['boom'] + 0.3, 'syn:brown', 'atrim=0:5.0,lowpass=f=160,afade=t=in:d=0.05,afade=t=out:st=1.0:d=4.0', -11, 'the blast rolls on (synthesized)'),
 (B['shaken'] + 0.3, f'{L}/pop-soft.flac', 'lowpass=f=2400,asetrate=48000*0.75,aresample=48000', -20, 'the bottle cap pops'),
 (B['shaken'] + 0.35, 'syn:pink', 'atrim=0:2.0,highpass=f=1800,lowpass=f=5000,afade=t=in:d=0.05,afade=t=out:st=0.6:d=1.4', -30, 'the soda spray (synthesized)'),
 (B['ash'] - 0.2, f'{L}/whoosh-deep.flac', 'lowpass=f=1200,asetrate=48000*0.8,aresample=48000', -19, 'ride the ash column up'),
 (B['gone'], f'{L}/whoosh-deep.flac', 'lowpass=f=1400', -24, 'back down to the crater'),
 (B['oozes'] - 0.1, f'{L}/bubbles-burst.flac', 'lowpass=f=2200,afade=t=out:st=1.0:d=0.8', -28, 'recap: Kilauea bubbles out'),
 (B['blowtop'] + 0.1, 'syn:brown', 'atrim=0:2.5,lowpass=f=120,afade=t=in:d=0.1,afade=t=out:st=0.5:d=2.0', -16, 'recap: the boom (synthesized)'),
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

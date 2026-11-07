# Octopus 01 sound: voice up front, Floating Cities (Matthew's music pick, CC BY 4.0) clearly audible under it, the
# CC0 deep-underwater bed for the reef (quieter inside the skin), and a few soft effects on the picture's own events
# (beats.json). CC0 library + synthesized only.
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
SW1, SW2, SW3, SW4 = B['millions'] + 0.55, B['notenough'] + 0.45, B['recap'] + 0.2, B['r_bumps'] - 0.15
CUES = [  # (time, source, filter chain, gain dB, note)
 (0.0, f'{L}/underwater-deep.flac', f'aloop=loop=-1:size=2e6,atrim=0:{T},lowpass=f=1400,afade=t=in:d=1.2,afade=t=out:st={T - 2}:d=2,volume=\'if(between(t,{SW1},{SW2})+between(t,{SW3},{SW4}),0.35,1)\':eval=frame', -21, 'reef bed, quieter inside the skin'),
 (B['octo'] - 0.05, f'{L}/bubbles-burst.flac', 'lowpass=f=2200,afade=t=out:st=0.8:d=0.4', -24, 'the rock lets go: octopus revealed'),
 (B['octo'] + 0.05, f'{L}/whoosh-fast.flac', 'lowpass=f=1800', -26, 'the fish bolts'),
 (B['colors'] + 0.4, f'{L}/pop-soft.flac', 'lowpass=f=1500', -31, 'blink 1'),
 (B['colors'] + 1.3, f'{L}/pop-soft.flac', 'lowpass=f=1500,asetrate=48000*1.12,aresample=48000', -31, 'blink 2'),
 (B['blink'] + 0.2, f'{L}/pop-soft.flac', 'lowpass=f=1500,asetrate=48000*1.25,aresample=48000', -31, 'blink 3'),
 (SW1 - 0.45, f'{L}/whoosh-deep.flac', 'lowpass=f=1600', -22, 'dive into the skin'),
 (B['yellow'], f'{L}/pop-soft.flac', 'lowpass=f=1800', -27, 'yellow sac'),
 (B['red'], f'{L}/pop-soft.flac', 'lowpass=f=1800,asetrate=48000*1.12,aresample=48000', -27, 'red sac'),
 (B['brown'], f'{L}/pop-soft.flac', 'lowpass=f=1800,asetrate=48000*1.25,aresample=48000', -27, 'brown sac'),
 (B['open'] - 0.4, 'syn:brown', 'atrim=0:1.2,lowpass=f=500,afade=t=in:d=0.8,afade=t=out:st=0.9:d=0.3', -27, 'the sac stretches open (synthesized)'),
 (B['letgo'] + 0.1, f'{L}/pop-soft.flac', 'lowpass=f=1400,asetrate=48000*0.85,aresample=48000', -25, 'it springs back to a dot'),
 (B['dot'] + 0.45, f'{L}/bubbles-burst.flac', 'lowpass=f=2000,afade=t=out:st=1.0:d=0.5', -27, 'the field opens in a wave'),
 (B['nerves'] + 0.9, f'{L}/whoosh-fast.flac', 'lowpass=f=1300,asetrate=48000*0.9,aresample=48000', -26, 'the spark runs down the nerve'),
 (B['pull'] + 0.35, f'{L}/pop-soft.flac', 'lowpass=f=1600,asetrate=48000*0.8,aresample=48000', -23, 'the whole field fires at once'),
 (B['blue'] + 0.3, f'{L}/whoosh-deep.flac', 'lowpass=f=1200,asetrate=48000*1.1,aresample=48000', -26, 'through the empty slot'),
 (B['white'] - 0.2, f'{L}/whoosh-deep.flac', 'lowpass=f=1000,asetrate=48000*0.9,aresample=48000', -28, 'down to the white cells'),
 (SW2 - 0.4, f'{L}/whoosh-deep.flac', 'lowpass=f=1600,areverse,afade=t=in:d=0.3', -23, 'climb out of the skin'),
 (B['bumps'], 'syn:pink', 'atrim=0:1.4,highpass=f=400,lowpass=f=1800,afade=t=in:d=0.5,afade=t=out:st=0.9:d=0.5', -34, 'bumps rise (synthesized)'),
 (B['most'] - 0.45, f'{L}/whoosh-deep.flac', 'lowpass=f=900', -23, 'into the pupil'),
 (B['match'] - 0.1, f'{L}/bubbles-burst.flac', 'lowpass=f=2200', -27, 'question bubbles rise'),
 (SW3 - 0.4, f'{L}/whoosh-deep.flac', 'lowpass=f=1500', -24, 'dive into the dish skin'),
 (SW4 - 0.3, f'{L}/whoosh-deep.flac', 'lowpass=f=1500,areverse,afade=t=in:d=0.3', -25, 'out to the reef'),
 (B['next'] - 0.3, f'{L}/whoosh-fast.flac', 'lowpass=f=1600', -29, 'the fish comes back'),
] + [(B['twice'] + 0.1 + i * 0.12, f'{L}/pop-soft.flac', f'lowpass=f=1500,asetrate=48000*{1 + 0.06 * i:.2f},aresample=48000', -32, f'rock eye {i + 1} opens') for i in range(6)]
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

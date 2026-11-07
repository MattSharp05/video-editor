# Microwave 01 sound: voice up front, Floating Cities (Kevin MacLeod, CC BY 4.0) ducked under speech, and soft sounds with a
# visible cause, each timed from beats.json. CC0 library (library/sfx/cstack-cc0) + synthesized (lavfi) only.
# usage: python3 mix.py [music_db] [stem]  -> work/mix.wav, cues.json
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
CUES = [
 (0.0, f'{L}/electrical-hum.flac', f'aloop=loop=-1:size=2e6,atrim=0:{B["hot"] - 0.1},lowpass=f=700,afade=t=in:d=0.6,afade=t=out:st={B["hot"] - 0.5}:d=0.4', -31, 'the oven hums while it runs (stops when the door opens)'),
 (0.9, f'{L}/whoosh-deep.flac', 'lowpass=f=1500', -24, 'push through the door window'),
 (B['myth'], f'{L}/rubber-stamp.flac', 'lowpass=f=3000', -17, 'MYTH? stamp slams'),
 (B['actually'], 'syn:pink', 'atrim=0:0.6,lowpass=f=1200,afade=t=in:d=0.02,afade=t=out:st=0.1:d=0.5', -24, 'the torch sputters out (puff)'),
 (B['actually'] + 0.2, f'{L}/rubber-stamp.flac', 'lowpass=f=2400', -22, 'stamp flips to NOPE'),
 (B['outer'], 'syn:brown', 'atrim=0:1.6,lowpass=f=160,afade=t=in:d=0.5,afade=t=out:st=0.6:d=1.0', -20, 'outer layer warms'),
 (B['l2'] - 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=1400', -24, 'travel to the magnetron'),
 (B['magnetron'] - 0.2, f'{L}/electrical-hum.flac', f'atrim=0:{B["bounce"] - B["magnetron"]},highpass=f=90,lowpass=f=1500,afade=t=in:d=0.4,afade=t=out:st={B["bounce"] - B["magnetron"] - 0.6}:d=0.6', -24, 'magnetron close up hums'),
 (B['invisible'] + 0.5, f'{L}/sonar-ping.flac', 'lowpass=f=1800,afade=t=out:st=0.4:d=0.6', -27, 'rings turn on as waves'),
 (B['bounce'] - 0.3, f'{L}/whoosh-fast.flac', 'lowpass=f=2500', -26, 'waves burst into the box'),
 (B['door'] - 0.2, f'{L}/whoosh-deep.flac', 'asetrate=48000*0.85,aresample=48000,lowpass=f=1500', -22, 'shrink to ant scale at the door'),
 (B['holes'] + 0.25, f'{L}/impact-deep.flac', 'lowpass=f=600', -21, 'the wave squashes on the mesh and bounces back'),
 (B['second'] + 0.2, f'{L}/clock-tick.flac', 'atrim=0:0.3', -18, 'stopwatch ticks once'),
 (B['water'] - 0.15, f'{L}/water-plunge.flac', 'lowpass=f=2500', -21, 'ribbon lands on the bead; dive in'),
 (B['plus'], f'{L}/pop-soft.flac', '', -24, '+ signs ripple on'),
 (B['minus'], f'{L}/pop-soft.flac', 'asetrate=48000*0.8,aresample=48000', -24, '− signs ripple on'),
 (B['wiggle'] - 0.3, f'{L}/tile-clicks.flac', f'atrim=0:{B["l8"] - B["wiggle"]},lowpass=f=2500,afade=t=in:d=0.3,afade=t=out:st={B["l8"] - B["wiggle"] - 0.6}:d=0.6', -27, 'BONKs: molecules bump'),
 (B['heat'] - 0.2, 'syn:brown', 'atrim=0:2.0,lowpass=f=140,afade=t=in:d=0.5,afade=t=out:st=0.8:d=1.2', -17, 'the crowd heats up'),
 (B['reach'] - 0.9, f'{L}/whoosh-deep.flac', 'areverse,lowpass=f=1400', -25, 'pull back out of the bead'),
 (B['spots'] - 0.7, f'{L}/whoosh-deep.flac', 'lowpass=f=1300', -25, 'crane up over the plate'),
 (B['more'], f'{L}/bubbles-burst.flac', 'lowpass=f=3000,afade=t=out:st=0.8:d=0.6', -25, 'cheek bubbles on the hot spot'),
 (B['spins'] - 0.2, f'{L}/servo-arm.flac', 'lowpass=f=1200,afade=t=out:st=0.8:d=0.6', -27, 'turntable starts'),
 (B['r_waves'] - 0.7, f'{L}/whoosh-deep.flac', 'lowpass=f=1300', -26, 'tilt back to the side view'),
 (B['leftovers'] + 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=1500', -25, 'pull out through the door'),
 (B['hot'] - 0.15, f'{L}/relay-click.flac', '', -20, 'door pops open'),
 (B['hot'] - 0.1, 'syn:ding', 'lowpass=f=3000,afade=t=out:st=0.05:d=1.6', -26, 'soft ding'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    if src == 'syn:ding':
        args += ['-f', 'lavfi', '-i', 'sine=frequency=1046:sample_rate=48000:duration=2']
    elif src.startswith('syn:'):
        args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=4:seed={i + 3}']
    else:
        args += ['-i', src]
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    chain = ','.join(x for x in ['aresample=48000', 'aformat=channel_layouts=stereo', flt, f'volume={g}dB', f'adelay={d}|{d}'] if x)
    fc.append(f'[{i + 2}]{chain}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4], 'src': os.path.basename(c[1])} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues')

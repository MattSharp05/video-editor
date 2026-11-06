# Grand Canyon 01 sound: voice up front, Floating Cities (Matthew's music pick) ducked under speech, and a few quiet
# nature sounds on the picture's events, all timed from beats.json. Everything here is CC0, CC BY (music, credited)
# or synthesized. Writes work/mix.wav and prints the cue list.
import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
# (start s, source, filter, gain dB, note); 'syn:...' = synthesized with anoisesrc
CUES = [
 (0.0, f'{L}/ocean-surface.flac', f'atrim=0:{B["l1"] + 2.5},lowpass=f=1400,afade=t=out:st={B["l1"] + 1.3}:d=1.2', -20, 'river water at the boulder'),
 (B['l1'] + 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=2200', -17, 'pull back out of the gorge'),
 (B['l3'] + 0.85, f'{L}/water-plunge.flac', 'lowpass=f=3000', -16, 'the camera goes under the water'),
 (B['l3'] + 0.9, f'{L}/underwater-deep.flac', f'atrim=0:{B["l4"] + 1.4 - B["l3"] - 0.9},afade=t=in:d=0.4,afade=t=out:st={B["l4"] + 0.6 - B["l3"] - 0.9}:d=0.8', -17, 'under the river (Matthew\'s ambience pick)'),
 (B['scour'] - 0.05, 'syn:pink', 'atrim=0:1.6,highpass=f=900,lowpass=f=5000,tremolo=f=23:d=0.9,afade=t=in:d=0.1,afade=t=out:st=0.8:d=0.8', -30, 'grit scouring the bed'),
 (B['l4'] + 0.15, f'{L}/whoosh-deep.flac', 'lowpass=f=2200', -18, 'up out of the water'),
 (B['before'] + 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=1600,asetrate=48000*0.85,aresample=48000', -20, 'time runs back, the canyon fills'),
 (B['pushed'], 'syn:brown', 'atrim=0:2.6,lowpass=f=110,afade=t=in:d=0.5,afade=t=out:st=1.6:d=1.0', -12, 'the land is pushed up'),
 (B['cut'], 'syn:brown', 'atrim=0:2.4,lowpass=f=160,highpass=f=40,afade=t=in:d=0.2,afade=t=out:st=1.2:d=1.2', -16, 'the river cuts straight down'),
 (B['l6'] + 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=2000', -20, 'camera to the cut face'),
 (B['crumble'], 'syn:pink', 'atrim=0:1.2,lowpass=f=1500,tremolo=f=11:d=0.8,afade=t=in:d=0.05,afade=t=out:st=0.4:d=0.8', -26, 'soft layers crumble'),
 (B['mostly'], f'{L}/whoosh-deep.flac', 'lowpass=f=2000', -20, 'rise to the top view'),
 (B['flash'] - 0.3, f'{L}/whoosh-fast.flac', 'asetrate=48000*0.7,aresample=48000,lowpass=f=2500', -16, 'a flash flood runs down a side canyon'),
 (B['rockfall'], 'syn:pink', 'atrim=0:1.5,lowpass=f=1200,tremolo=f=17:d=0.9,afade=t=in:d=0.05,afade=t=out:st=0.5:d=1.0', -22, 'rockfall'),
 (B['rockfall'] + 0.7, f'{L}/impact-deep.flac', 'lowpass=f=900', -22, 'rocks land'),
 (B['rose'], 'syn:brown', 'atrim=0:1.2,lowpass=f=110,afade=t=in:d=0.2,afade=t=out:st=0.5:d=0.7', -14, 'recap: the land rose'),
 (B['ground'], 'syn:brown', 'atrim=0:1.2,lowpass=f=160,highpass=f=40,afade=t=in:d=0.1,afade=t=out:st=0.4:d=0.8', -18, 'recap: grit ground down'),
 (B['floods'], f'{L}/whoosh-fast.flac', 'asetrate=48000*0.7,aresample=48000,lowpass=f=2500', -18, 'floods still cut'),
 (B['fall'] - 0.1, 'syn:pink', 'atrim=0:1.3,lowpass=f=1200,tremolo=f=17:d=0.9,afade=t=in:d=0.05,afade=t=out:st=0.4:d=0.9', -23, 'the walls still fall'),
 (B['fall'] + 0.5, f'{L}/impact-deep.flac', 'lowpass=f=900', -23, 'rocks land'),
 (T - 1.2, f'{L}/ocean-surface.flac', 'atrim=0:1.4,lowpass=f=1400,afade=t=in:d=0.6', -20, 'back at the boulder (loop)'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]',
      f'[vo]asplit=2[voA][key]',
      # music: low under the voice, ducked further while he speaks
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume=-15dB[m]',
      f'[m][key]sidechaincompress=threshold=0.03:ratio=8:attack=30:release=450:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    if src.startswith('syn:'):
        args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=4:seed={i + 3}']
    else:
        args += ['-i', src]
    k = len(args) // 2   # placeholder; input index computed below
mixidx = 2
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(t * 1000)
    fc.append(f'[{mixidx}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]')
    mix.append(f'[c{i}]'); mixidx += 1
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-1.5:LRA=11[out]')
args += ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav']
subprocess.run(args, check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues;', round(len(CUES) / T * 10, 1), 'per 10 s')

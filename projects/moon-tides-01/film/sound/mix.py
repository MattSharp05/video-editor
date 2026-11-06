# Moon tides 01 sound: voice up front, Floating Cities (Matthew's music pick, CC BY 4.0) ducked under speech, and quiet
# sounds from the picture's events (beats.json): surf on the beach, air as the camera rises through the sky and dives
# through cloud, a low swell under the bulges, water rising in the Bay of Fundy. CC0 library + synthesized only.
import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
CUES = [
 (0.0, f'{L}/ocean-surface.flac', f'atrim=0:{B["l2"] + 0.8},lowpass=f=2400,afade=t=in:d=0.3,afade=t=out:st={B["l2"] - 0.6}:d=1.2', -15, 'surf on the beach'),
 (B['l1'] + 1.0, f'{L}/whoosh-deep.flac', 'lowpass=f=1800,asetrate=48000*0.8,aresample=48000', -17, 'rising off the beach into the sky'),
 (B['l2'] - 0.2, 'syn:pink', 'atrim=0:1.4,lowpass=f=900,afade=t=in:d=0.5,afade=t=out:st=0.6:d=0.8', -26, 'air: through the haze into space'),
 (B['bumps'], 'syn:brown', 'atrim=0:2.4,lowpass=f=90,afade=t=in:d=0.6,afade=t=out:st=1.2:d=1.2', -15, 'the ocean stretches into two bumps'),
 (B['spins'], f'{L}/whoosh-deep.flac', 'lowpass=f=1400', -22, 'Earth turns'),
 (B['lineup'], 'syn:brown', 'atrim=0:2.0,lowpass=f=110,afade=t=in:d=0.4,afade=t=out:st=1.0:d=1.0', -16, 'sun and moon line up: the bumps grow'),
 (B['canada'] - 0.7, 'syn:pink', 'atrim=0:1.4,lowpass=f=900,afade=t=in:d=0.5,afade=t=out:st=0.6:d=0.8', -25, 'air: down through the clouds'),
 (B['canada'] - 0.2, f'{L}/ocean-surface.flac', f'atrim=0:{B["l9"] - B["canada"] + 0.6},lowpass=f=1200,afade=t=in:d=0.8,afade=t=out:st={B["l9"] - B["canada"] - 0.4}:d=1.0', -19, 'the bay filling'),
 (B['fifteen'] - 0.3, 'syn:brown', 'atrim=0:2.0,lowpass=f=80,afade=t=in:d=0.6,afade=t=out:st=1.0:d=1.0', -17, 'the tide rises 15 m'),
 (B['l9'] - 0.2, 'syn:pink', 'atrim=0:1.2,lowpass=f=900,afade=t=in:d=0.4,afade=t=out:st=0.5:d=0.7', -26, 'up into space for the recap'),
 (B['twice'] - 0.6, 'syn:pink', 'atrim=0:1.2,lowpass=f=900,afade=t=in:d=0.4,afade=t=out:st=0.5:d=0.7', -26, 'down to the beach'),
 (B['twice'] - 0.3, f'{L}/ocean-surface.flac', f'atrim=0:{T - B["twice"] + 0.3},lowpass=f=2400,afade=t=in:d=0.8', -14, 'the tide rolls in'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume=-15dB[m]',
      '[m][key]sidechaincompress=threshold=0.03:ratio=8:attack=30:release=450:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=4:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues')

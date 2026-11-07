# Dream brain 01 sound: voice up front, Floating Cities (Matthew's music pick, Kevin MacLeod, CC BY 4.0) ducked under
# speech, and soft sounds on the picture's events (beats.json). CC0 library (library/sfx/cstack-cc0) + synthesized only.
# Studio taste: subtle and soft, no big clinks or chimes; swipes and camera moves mostly quiet.
import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
air = lambda d: f'atrim=0:{d},lowpass=f=800,afade=t=in:d={d * 0.4},afade=t=out:st={d * 0.5}:d={d * 0.5}'
CUES = [
 (0.0, f'{L}/city-night.flac', f'atrim=0:{B["into_room"] + 0.4},lowpass=f=2500,afade=t=in:d=0.4,afade=t=out:st={B["into_room"] - 0.4}:d=0.8', -22, 'the town at night'),
 (B['into_room'] - 0.35, 'syn:pink', air(0.8), -27, 'through the window'),
 (B['into_brain'] - 0.4, f'{L}/whoosh-deep.flac', 'lowpass=f=1500,asetrate=48000*0.85,aresample=48000', -23, 'into his head'),
 (B['into_brain'], f'{L}/underwater-deep.flac', f'atrim=0:{B["into_dream"] - B["into_brain"]},lowpass=f=900,afade=t=in:d=1.0,afade=t=out:st={B["into_dream"] - B["into_brain"] - 1.0}:d=1.0', -24, 'inside the brain: a soft deep bed'),
 (B['rem'] - 0.2, 'syn:brown', 'atrim=0:2.0,lowpass=f=110,afade=t=in:d=0.5,afade=t=out:st=0.9:d=1.1', -17, 'the brainstem switches REM on'),
 (B['muscles'] + 0.1, f'{L}/electrical-hum.flac', 'atrim=0:2.2,lowpass=f=500,afade=t=in:d=0.3,afade=t=out:st=1.2:d=1.0', -28, 'the barrier holds the signals'),
 (B['seeing'] + 0.3, 'syn:pink', 'atrim=0:3.5,highpass=f=2500,lowpass=f=6000,afade=t=in:d=1.2,afade=t=out:st=2.0:d=1.5', -34, 'light building the dream town'),
 (B['into_dream'] - 0.4, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -21, 'into the dream'),
 (B['into_dream'], 'syn:pink', f'atrim=0:{B["into_cell"] - B["into_dream"]},lowpass=f=600,afade=t=in:d=1.5,afade=t=out:st={B["into_cell"] - B["into_dream"] - 1.5}:d=1.5', -30, 'wind while he flies'),
 (B['feel'] + 0.1, f'{L}/impact-deep.flac', 'lowpass=f=160', -21, 'heartbeat 1: the feelings part'),
 (B['feel'] + 0.45, f'{L}/impact-deep.flac', 'lowpass=f=160', -24, 'heartbeat 2'),
 (B['scary'] - 0.2, f'{L}/whoosh-deep.flac', 'lowpass=f=1500', -20, 'a gust drops him toward the roofs'),
 (B['exciting'], f'{L}/whoosh-fast.flac', 'lowpass=f=3000', -25, 'he swoops up'),
 (B['quiet'] - 0.1, 'syn:brown', 'atrim=0:1.4,lowpass=f=140,afade=t=in:d=0.2,afade=t=out:st=0.4:d=1.0', -24, 'the front goes dark'),
 (B['memory'], 'syn:pink', 'atrim=0:2.5,highpass=f=3000,lowpass=f=7000,afade=t=in:d=0.8,afade=t=out:st=1.2:d=1.3', -34, 'memory ribbons'),
 (B['into_cell'] - 0.4, f'{L}/whoosh-deep.flac', 'lowpass=f=1500,asetrate=48000*1.1,aresample=48000', -23, 'into a streetlight'),
 (B['spark'] + 0.1, f'{L}/electric-spark-crackle.flac', 'atrim=0:1.2,lowpass=f=2500,afade=t=out:st=0.5:d=0.7', -30, 'the spark runs down the arm'),
 (B['chem'] + 0.3, f'{L}/bubbles-burst.flac', 'atrim=0:1.5,lowpass=f=2500,afade=t=out:st=0.8:d=0.7', -30, 'messengers cross the gap'),
 (B['gap'] + 0.3, 'syn:brown', 'atrim=0:1.0,lowpass=f=200,afade=t=in:d=0.1,afade=t=out:st=0.3:d=0.7', -24, 'the next cell lights'),
 (B['recap'] - 0.3, f'{L}/whoosh-deep.flac', 'lowpass=f=1300', -24, 'pull out to the whole brain'),
 (B['alarm'], 'syn:alarm', 'atrim=0:2.2,afade=t=out:st=1.8:d=0.4', -24, 'the alarm: soft two-tone beeps'),
 (B['into_wake'], 'syn:pink', air(1.0), -28, 'out of his head'),
 (B['into_town'] - 0.2, f'{L}/city-night.flac', f'atrim=0:{T - B["into_town"] + 0.2},lowpass=f=3000,afade=t=in:d=0.8', -24, 'the town in the morning'),
]
def src_args(i, src):
    if src == 'syn:alarm':  # gentle beeps: 0.12 s on, 0.13 s off, two tones
        expr = "0.35*sin(2*PI*(if(lt(mod(t,0.5),0.25),880,740))*t)*lt(mod(t,0.25),0.12)"
        return ['-f', 'lavfi', '-i', f"aevalsrc='{expr}':s=48000:d=3"]
    if src.startswith('syn:'): return ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=8:seed={i + 3}']
    return ['-i', src]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume=-15dB[m]',
      '[m][key]sidechaincompress=threshold=0.03:ratio=8:attack=30:release=450:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES): args += src_args(i, src)
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues')

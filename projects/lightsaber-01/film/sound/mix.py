# Lightsaber 01 sound: voice up front, Floating Cities (Matthew's music pick, CC BY 4.0) clearly audible under it, a
# synthesized blade hum that follows the blade's life (on from frame 0, a wobble when the camera is close, a falling
# pitch when the battery dies), and a few soft effects on the picture's events (beats.json). CC0 library + synthesized.
# usage (from film/): ../vo/.venv-qw/bin/python sound/mix.py [music_db] [stem]
import json, os, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); W = f'{HERE}/work'; os.makedirs(W, exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']; SR = 48000
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
HAZE = B['empire'] - 0.05

# --- the hum: two low partials plus a soft buzz, slow beating; dies with a falling pitch ---
t = np.arange(int(T * SR)) / SR
die0, die1 = B['nothing'] - 0.2, B['yet'] + 0.2
pitch = np.where(t < die0, 1.0, np.clip(1 - 0.55 * (t - die0) / (die1 - die0), 0.45, 1))
flick = np.where(t > B['battery'] + 0.2, 0.75 + 0.25 * np.sin(t * 47) * np.sin(t * 13), 1.0)
env = np.clip(1 - (t - die0) / (die1 - die0), 0, 1) * flick
env *= np.clip(t / 0.15, 0, 1)
ph = 2 * np.pi * np.cumsum(92 * pitch) / SR
hum = np.sin(ph) + 0.45 * np.sin(2 * ph + 0.3) + 0.18 * np.sin(3.01 * ph) + 0.08 * np.sign(np.sin(ph)) * 0.5
hum *= (1 + 0.12 * np.sin(2 * np.pi * 0.7 * t)) * env
# quieter while the blade is a laser (a thin beam hums thinner) and while the camera is at the station
laser = np.clip((t - B['l1'] - 0.35) / 0.5, 0, 1) * np.clip(1 - (t - B['plasma'] + 0.1) / 0.6, 0, 1)
away = np.clip((t - HAZE) / 0.4, 0, 1) * np.clip(1 - (t - B['l11'] + 0.5) / 0.8, 0, 1)
hum *= (1 - 0.6 * laser) * (1 - 0.85 * away)
sf.write(f'{W}/hum.wav', (hum / np.abs(hum).max() * 0.5).astype(np.float32), SR)

CUES = [  # (time, source, filter chain, gain dB, note)
 (0.0, f'{W}/hum.wav', 'lowpass=f=900', -21, 'the blade hum, all film (synthesized)'),
 (B['l1'] + 0.5, f'{L}/whoosh-deep.flac', 'lowpass=f=2200,asetrate=48000*1.25,aresample=48000', -19, 'the beam shoots up and keeps going'),
 (B['two'] - 0.15, f'{L}/whoosh-fast.flac', 'lowpass=f=2000', -22, 'the red beam ignites'),
 (B['plasma'] - 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=1600', -21, 'beams thicken into blades, camera dives'),
 (B['lightning'] - 0.1, f'{L}/electric-spark-crackle.flac', 'atrim=0:1.6,lowpass=f=2600,afade=t=out:st=1.0:d=0.6', -27, 'lightning crawling in the blade'),
 (B['still'] + 0.1, 'syn:pink', 'atrim=0:3.2,highpass=f=300,lowpass=f=2400,afade=t=in:d=0.4,afade=t=out:st=2.2:d=1.0', -30, 'the spray hisses (synthesized)'),
 (B['magnets'], f'{L}/electrical-hum.flac', 'atrim=0:3.5,lowpass=f=1200,afade=t=in:d=0.3,afade=t=out:st=2.5:d=1.0', -25, 'the magnets energise'),
 (B['touch'] + 0.2, f'{L}/impact-deep.flac', 'lowpass=f=1800', -17, 'the blades meet'),
 (B['burst'] - 0.05, f'{L}/electric-zap.flac', 'lowpass=f=3000,afade=t=out:st=0.6:d=0.4', -23, 'the field snaps: burst of plasma'),
 (B['burst'], f'{L}/electric-spark-crackle.flac', 'atrim=0:1.4,lowpass=f=2800,afade=t=out:st=0.8:d=0.6', -24, 'sparks'),
 (HAZE - 0.45, f'{L}/whoosh-deep.flac', 'lowpass=f=1500', -20, 'through the crystal into the dish'),
 (B['deathstar'] - 0.2, 'syn:brown', 'atrim=0:1.6,lowpass=f=140,afade=t=in:d=1.2,afade=t=out:st=1.3:d=0.3', -14, 'the dish charges (synthesized)'),
 (B['gun'] + 0.35, f'{L}/impact-deep.flac', 'lowpass=f=1200,asetrate=48000*0.8,aresample=48000', -15, 'the gun fires'),
 (B['gun'] + 0.4, f'{L}/whoosh-deep.flac', 'lowpass=f=1400,asetrate=48000*0.85,aresample=48000', -17, 'the beam passes overhead'),
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

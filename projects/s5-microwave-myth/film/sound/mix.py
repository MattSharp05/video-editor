# s5 microwave myth sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under speech, soft sounds with a
# visible cause. Times from sound/times.json (npx tsx sound/times.mts > sound/times.json), the same numbers as the picture.
# CC0 library (library/sfx/cstack-cc0 = sfx-29..61) + synthesized ('syn:' noise, 'tone:' sine).  usage: python3 mix.py [music_dB] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
T_ = json.load(open(f'{HERE}/times.json')); T = T_['dur']; g = T_.get
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
WP_DEEP, WP_FAST = 0.57, 0.08
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
K1, F1 = g('cutFace'), g('cutOut')
CUES = [
 (0.0, 'syn:brown', f'atrim=0:{g("watch")},lowpass=f=180,highpass=f=40,afade=t=in:d=0.3,afade=t=out:st={g("watch") - 0.15}:d=0.15', -24, 'microwave running (bed)'),
 (0.0, 'tone:120', f'atrim=0:{g("watch")},volume=0.5,afade=t=in:d=0.3,afade=t=out:st={g("watch") - 0.15}:d=0.15', -34, 'microwave mains hum'),
 (0.3, f'{L}/electrical-hum.flac', f'atrim=0:{g("watch") - 0.3},highpass=f=600,lowpass=f=4000,afade=t=in:d=0.4,afade=t=out:st={g("watch") - 0.5}:d=0.2', -36, 'hologram shimmer'),
 (g('watch') - 0.2, f'{L}/electric-zap.flac', 'highpass=f=800,lowpass=f=5000,afade=t=out:st=0.25:d=0.2', -32, 'the myth hologram glitches'),
 *[(s, 'syn:white', 'atrim=0:0.6,highpass=f=1500,lowpass=f=6000,afade=t=in:d=0.1,afade=t=out:st=0.35:d=0.25', -34, f'scan line {i + 1}') for i, s in enumerate(g('scans'))],
 (g('micro') - 0.15, f'{L}/electrical-hum.flac', 'atrim=0:3.2,lowpass=f=1500,afade=t=in:d=0.4,afade=t=out:st=2.6:d=0.6', -27, 'microwaves roll in'),
 *[(w, f'{L}/pop-soft.flac', f'{pitch(0.7 + 0.03 * (i % 4))},lowpass=f=1800', -33, f'wave front {i + 1} lands') for i, w in enumerate(g('waves')[::3])],
 (g('inch') - 0.05, f'{L}/tile-clicks.flac', 'atrim=0.7:1.0,asetpts=PTS-STARTPTS,lowpass=f=3000', -30, 'ruler clicks on'),
 (g('cutMol') - WP_DEEP, f'{L}/whoosh-deep.flac', 'lowpass=f=1500', -24, 'cut to molecule scale'),
 (g('cutMol'), 'syn:pink', f'atrim=0:{g("cutBack") - g("cutMol")},bandpass=f=900:w=600,tremolo=f=8:d=0.6,afade=t=in:d=0.6,afade=t=out:st={g("cutBack") - g("cutMol") - 0.1}:d=0.1', -32, 'molecules twisting (flutter)'),
 (g('cutBack') - WP_FAST, f'{L}/whoosh-fast.flac', f'{pitch(0.9)},lowpass=f=2500', -25, 'cut back to the face'),
 *[(g('creeps') + 0.3 * i, f'{L}/clock-tick.flac', 'atrim=0:0.12,asetpts=PTS-STARTPTS,lowpass=f=4000', -30, f'clock tick {i + 1}') for i in range(6)],
 (g('why') + 0.4, f'{L}/bubbles-burst.flac', 'lowpass=f=3000,afade=t=in:d=0.3,afade=t=out:st=2.4:d=0.8', -30, 'hot edge bubbling'),
 (g('why') + 0.4, 'syn:white', 'atrim=0:3.2,highpass=f=3000,lowpass=f=9000,afade=t=in:d=0.5,afade=t=out:st=2.4:d=0.8', -40, 'sizzle'),
 (g('boiling') - 0.15, f'{L}/screen-tap.flac', 'lowpass=f=2500', -28, 'probe in: edge'),
 (g('icy') - 0.15, f'{L}/screen-tap.flac', f'{pitch(0.85)},lowpass=f=2500', -28, 'probe in: middle'),
 (g('stand') - 0.1, f'{L}/relay-click.flac', 'lowpass=f=3000', -28, 'stand timer starts'),
 *[(g('job') - 0.1 + 0.28 * i, 'tone:1760', 'atrim=0:0.16,afade=t=in:d=0.005,afade=t=out:st=0.1:d=0.06', -30, f'microwave beep {i + 1}') for i in range(3)],
 (F1 - WP_FAST, f'{L}/whoosh-fast.flac', 'lowpass=f=2500', -26, 'cut back to the kitchen'),
 (F1, 'syn:pink', f'atrim=0:{T - F1},bandpass=f=500:w=900,afade=t=in:d=0.05,afade=t=out:st={T - F1 - 1.2}:d=1.2', -38, 'kitchen room tone'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, gdb, note) in enumerate(CUES):
    if src.startswith('syn:'): args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration={T + 1}:seed={i + 3}']
    elif src.startswith('tone:'): args += ['-f', 'lavfi', '-i', f'sine=frequency={src[5:]}:sample_rate=48000:duration={T + 1}']
    else: args += ['-i', src]
for i, (t, src, flt, gdb, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={gdb}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4], 'src': c[1].split('/')[-1], 'dB': c[3]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
n = len([c for c in CUES if 'bed' not in c[4] and 'tone' not in c[4]])
print(n, 'cues;', round(n / T * 10, 1), 'per 10 s; total', round(T, 2))

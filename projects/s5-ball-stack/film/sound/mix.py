# s5 ball stack sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under speech, and soft sounds with
# a visible cause. Every time comes from sound/times.json, dumped from src/timeline.ts (npx tsx sound/times.mts), so a
# re-timed film re-times its sound. CC0 library (library/sfx/cstack-cc0 = sfx-29..61) + synthesized ('syn:'/'tone:').
# usage: python3 mix.py [music_dB] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
T_ = json.load(open(f'{HERE}/times.json'))
T = T_['dur']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
WP_DEEP, WP_FAST = 0.57, 0.08  # measured peak offsets: a cut whoosh starts this much early so it peaks on the cut
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
g = T_.get
CUES = [
 (0.0, 'syn:pink', f'atrim=0:{T},highpass=f=250,lowpass=f=2200,afade=t=in:d=0.6,afade=t=out:st={T - 2}:d=2', -36, 'outdoor air bed (court)'),
 (g('dropT') - 0.1, f'{L}/whoosh-deep.flac', f'{pitch(0.7)},lowpass=f=900', -27, 'slow-motion fall'),
 (g('back') + 0.05, f'{L}/glass-ting.flac', 'lowpass=f=3000,afade=t=out:st=0.4:d=0.6', -33, 'bar 1 pulses: back to your hand?'),
 (g('twice') - 0.1, f'{L}/glass-ting.flac', f'{pitch(1.12)},lowpass=f=3000,afade=t=out:st=0.4:d=0.6', -33, 'bar 2 slides in: twice as high?'),
 (g('guess') - 0.1, f'{L}/glass-ting.flac', f'{pitch(1.25)},lowpass=f=3200,afade=t=out:st=0.4:d=0.6', -33, 'the ? appears'),
 *[(tk - 0.02, f'{L}/pop-soft.flac', f'{pitch(0.9 + 0.12 * i)},lowpass=f=2400', -26, f'pause tick {i + 1}') for i, tk in enumerate(g('ticks'))],
 (g('hitA') - 0.02, f'{L}/impact-deep.flac', f'{pitch(0.85)},lowpass=f=700,afade=t=out:st=0.6:d=0.8', -17, 'the stack hits the court (slow motion)'),
 (g('hitA'), 'tone:95', 'atrim=0:0.5,afade=t=in:d=0.005,afade=t=out:st=0.02:d=0.45', -20, 'basketball "pung"'),
 (g('launchA') - 0.02, f'{L}/whoosh-fast.flac', f'{pitch(1.15)},lowpass=f=3000', -22, 'the tennis ball launches'),
 (g('bar1') - 0.01, f'{L}/glass-ting.flac', 'highpass=f=900,lowpass=f=5000,afade=t=out:st=0.2:d=0.5', -25, 'bar 1 smashed'),
 (g('bar2') - 0.01, f'{L}/glass-ting.flac', f'{pitch(1.1)},highpass=f=900,lowpass=f=5000,afade=t=out:st=0.2:d=0.5', -25, 'bar 2 smashed'),
 (g('cutWhy') - WP_DEEP, f'{L}/whoosh-deep.flac', f'{pitch(1.1)},lowpass=f=1800', -23, 'cut to the replay'),
 (g('hitB') - 0.02, f'{L}/impact-deep.flac', f'{pitch(0.6)},lowpass=f=500,afade=t=out:st=0.8:d=1.0', -21, 'replay contact (very slow)'),
 (g('cutPov') - WP_DEEP, f'{L}/whoosh-deep.flac', 'lowpass=f=1600', -24, 'cut to the chase cam'),
 (g('rushing') - 0.3, 'syn:brown', 'atrim=0:1.2,lowpass=f=140,afade=t=in:d=0.8,afade=t=out:st=0.9:d=0.3', -20, 'the basketball surges up'),
 (g('hitC') - 0.02, f'{L}/impact-deep.flac', f'{pitch(0.7)},lowpass=f=600,afade=t=out:st=0.5:d=0.8', -21, 'chase cam: contact'),
 (g('cutSide') - WP_FAST, f'{L}/whoosh-fast.flac', 'lowpass=f=2500', -25, 'cut to the frozen side view'),
 (g('with') + 0.9, f'{L}/pop-soft.flac', f'{pitch(0.8)},lowpass=f=2200', -25, 'arrow flips up'),
 (g('with') + 1.6, f'{L}/pop-soft.flac', f'{pitch(0.95)},lowpass=f=2200', -25, 'arrow doubles'),
 (g('three') - 0.05, f'{L}/pop-soft.flac', f'{pitch(1.1)},lowpass=f=2400', -24, 'third unit joins'),
 (g('and3') + 0.2, f'{L}/tile-clicks.flac', 'atrim=0.6:1.2,asetpts=PTS-STARTPTS,lowpass=f=3000,afade=t=out:st=0.4:d=0.2', -30, '3x3 square forms'),
 *[(tt, f'{L}/pop-soft.flac', f'{pitch(0.85 + 0.07 * i)},lowpass=f=2600', -28, f'tile {i + 1} stacks') for i, tt in enumerate(g('tiles'))],
 *[(tt, 'syn:brown', 'atrim=0:0.35,lowpass=f=900,highpass=f=80,afade=t=in:d=0.01,afade=t=out:st=0.05:d=0.3', -24, f'tile {9 - i} crumbles') for i, tt in enumerate(g('lost'))],
 (g('riseD') + 0.05, f'{L}/whoosh-fast.flac', f'{pitch(1.1)},lowpass=f=2800', -25, 'real ball rises'),
 (g('landD') - 0.01, f'{L}/pop-soft.flac', f'{pitch(0.55)},lowpass=f=1500', -20, 'tennis ball lands on the court'),
 (g('landD') - 0.01, 'tone:140', 'atrim=0:0.25,afade=t=in:d=0.003,afade=t=out:st=0.01:d=0.22', -27, 'tennis ball bounce body'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,adelay=0|0,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, gdb, note) in enumerate(CUES):
    if src.startswith('syn:'): args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration={max(2, T + 1) if "bed" in note else 3}:seed={i + 3}']
    elif src.startswith('tone:'): args += ['-f', 'lavfi', '-i', f'sine=frequency={src[5:]}:sample_rate=48000:duration=1']
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
n = len([c for c in CUES if 'bed' not in c[4]])
print(n, 'cues;', round(n / T * 10, 1), 'per 10 s; total', round(T, 2))

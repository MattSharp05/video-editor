# s2 Buffon's matches sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under it, and sounds with a visible
# cause, timed from the timeline's own events (sound/events.json, written by ../times.mts from src/timeline.ts).
# Effects: CC0 cstack set (library/sfx/cstack-cc0, sfx-29..61) + synthesized noise (labelled 'syn:').
# usage: python3 mix.py [music_dB] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
E = json.load(open(f'{HERE}/events.json')); B = E['B']; T = E['dur']; CUT = E['cut']; HD = E['hoopDrops']; TH = E['throws']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 6.5
STEM = len(sys.argv) > 2
WP = 0.57  # whoosh-deep peaks 0.57 s in
def creak(t, k, g, note): return (t - 0.6, f'{L}/ship-creak.flac', f'atrim=0.6:2.0,asetpts=PTS-STARTPTS,asetrate=48000*{k},aresample=48000,lowpass=f=2400,afade=t=in:d=0.1,afade=t=out:st=0.9:d=0.4', g, note)
def click(t, k, g, note): return (t, f'{L}/relay-click.flac', f'asetrate=48000*{k},aresample=48000,lowpass=f=4000', g, note)
def ting(t, k, g, note): return (t, f'{L}/glass-ting.flac', f'asetrate=48000*{k},aresample=48000,lowpass=f=4200,afade=t=out:st=0.4:d=0.8', g, note)
def taps(t, dur, k, g, note): return (t, f'{L}/tile-clicks.flac', f'atrim=0:{dur},asetpts=PTS-STARTPTS,asetrate=48000*{k},aresample=48000,highpass=f=300,lowpass=f=5200,afade=t=out:st={max(0.05, dur - 0.3)}:d=0.3', g, note)
CUES = [
 (0.0, 'syn:brown', f'atrim=0:{CUT + 0.05},lowpass=f=300,afade=t=in:d=0.5,afade=t=out:st={CUT - 0.03}:d=0.03', -37, 'room tone (synth)'),
 taps(0.0, 3.3, 1.35, -26, 'matches landing on the floor'),
 taps(0.4, 2.8, 1.1, -31, 'matches landing, second layer'),
 (E['measure'], f'{L}/pop-soft.flac', 'asetrate=48000*1.3,aresample=48000,lowpass=f=3000', -28, 'the measuring match lands'),
 ting(B['each'] + 0.9, 1.25, -30, 'ice ticks: match = board'),
 (E['demo'][0], f'{L}/pop-soft.flac', 'asetrate=48000*1.2,aresample=48000,lowpass=f=3000', -30, 'demo match lands (crosses)'),
 ting(E['demo'][0] + 0.15, 1.0, -29, 'its crack lights amber: crosses'),
 (E['demo'][1], f'{L}/pop-soft.flac', 'asetrate=48000*0.9,aresample=48000,lowpass=f=2400', -31, 'demo match lands (misses)'),
 (B['guessEnd'] + 0.05, f'{L}/clock-tick.flac', 'atrim=5.4:6.9,asetpts=PTS-STARTPTS,afade=t=out:st=1.1:d=0.3', -28, 'tick tock: pause and guess'),
 (B['most'] + 0.05, 'syn:white', 'atrim=0:1.0,bandpass=f=3000:w=1800,afade=t=in:d=0.5,afade=t=out:st=0.6:d=0.4', -35, 'amber wave across the crossers'),
 ting(B['most'] + 0.85, 0.94, -28, 'the crossers glow'),
 (B['most'] + 1.0, f'{L}/card-riffle.flac', 'lowpass=f=3200', -29, 'matches slide into two rafts'),
 (B['most'] + 1.5, f'{L}/card-riffle.flac', 'asetrate=48000*0.9,aresample=48000,lowpass=f=3000', -31, 'rafts settle'),
 creak(B['bend'] + 0.3, 1.7, -32, 'the wire bends into a hoop'),
 *[ting(HD[k] + 0.0, 1.05 + 0.08 * k, -28, f'hoop lands {k + 1}: two crossings') for k in range(4)],
 *[(HD[k], f'{L}/relay-click.flac', 'asetrate=48000*1.3,aresample=48000,lowpass=f=4000', -31, f'hoop tap {k + 1}') for k in range(4)],
 creak(B['straighten'] + 0.1, 1.9, -33, 'the hoop straightens'),
 (B['piLong'] - 0.3, f'{L}/card-riffle.flac', 'asetrate=48000*1.15,aresample=48000,lowpass=f=3200', -31, 'three matches slide in'),
 (B['cutIt'] + 0.05, f'{L}/blade-slice.flac', 'lowpass=f=4000', -29, 'the wire snaps into pieces'),
 *[taps(TH[k] - 0.02, 0.35, 1.5, -27, f'pieces land (throw {k + 1})') for k in range(3)],
 (B['still'] + 0.05, f'{L}/pop-soft.flac', 'lowpass=f=2600', -30, 'the average appears'),
 ting(B['so'] + 0.4, 1.12, -27, '2 / pi = 64%'),
 (CUT - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -25, 'cut to the big floor'),
 (CUT, 'syn:pink', f'atrim=0:{T - CUT},bandpass=f=3800:w=3000,tremolo=f=13:d=0.7,afade=t=in:d=1.5,afade=t=out:st={T - CUT - 2.5}:d=2.5', -33, 'thousands of matches pattering down (synth)'),
 taps(CUT + 0.1, 3.0, 1.2, -31, 'the first of the big rain'),
 ting(B['three14'], 0.8, -26, 'the count lands on 3.144'),
 (B['three14'], f'{L}/impact-deep.flac', 'lowpass=f=350,atrim=0:1.5,afade=t=out:st=0.6:d=0.9', -31, 'soft low hit under the answer'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.0}:d=2.0,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration={T + 1}:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4], 'src': c[1].split('/')[-1]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues;', round(len(CUES) / T * 10, 1), 'per 10 s; total', round(T, 2))

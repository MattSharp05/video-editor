# s2 Monty Hall sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under it, and sounds with a visible
# cause, timed from the timeline's own events (sound/events.json, written by ../times.mts from src/timeline.ts).
# Effects: CC0 cstack set (library/sfx/cstack-cc0, sfx-29..61) + synthesized noise (labelled 'syn:').
# usage: python3 mix.py [music_dB] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
E = json.load(open(f'{HERE}/events.json')); B = E['B']; T = E['dur']; CUT = E['cut']; BL = E['black']; OP = E['opens']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 9.5
STEM = len(sys.argv) > 2
WP = 0.57  # whoosh-deep peaks 0.57 s in
def creak(t, k, g, note): return (t - 0.9, f'{L}/ship-creak.flac', f'atrim=0.6:2.0,asetpts=PTS-STARTPTS,asetrate=48000*{k},aresample=48000,lowpass=f=2400,afade=t=in:d=0.1,afade=t=out:st=0.9:d=0.4', g, note)
def click(t, k, g, note): return (t, f'{L}/relay-click.flac', f'asetrate=48000*{k},aresample=48000,lowpass=f=4000', g, note)
CUES = [
 (0.0, 'syn:brown', f'atrim=0:{T},lowpass=f=260,afade=t=in:d=0.6,afade=t=out:st={T - 1.5}:d=1.5', -33, 'night yard: distant city rumble'),
 (0.0, 'syn:pink', f'atrim=0:6.5,bandpass=f=2600:w=3000,tremolo=f=9:d=0.8,afade=t=in:d=0.3,afade=t=out:st=5.3:d=1.2', -34, 'paper flutter: envelopes falling'),
 (0.2, f'{L}/card-riffle.flac', 'lowpass=f=3500', -30, 'envelopes landing'),
 (1.9, f'{L}/card-riffle.flac', 'asetrate=48000*0.9,aresample=48000,lowpass=f=3200', -31, 'envelopes landing'),
 (3.6, f'{L}/card-riffle.flac', 'asetrate=48000*1.08,aresample=48000,lowpass=f=3500', -32, 'envelopes landing'),
 creak(B['three'] + 0.4, 1.0, -27, 'three doors swing open'),
 (B['goats'] + 1.05, f'{L}/vault-clank.flac', 'lowpass=f=2500', -25, 'doors shut'),
 (BL[0], f'{L}/impact-deep.flac', 'lowpass=f=500,atrim=0:1.2,afade=t=out:st=0.6:d=0.6', -24, 'lights out (blackout)'),
 (BL[0], 'syn:brown', f'atrim=0:{max(0.3, BL[1] - BL[0])},lowpass=f=140,afade=t=in:d=0.05,afade=t=out:st={max(0.1, BL[1] - BL[0] - 0.1)}:d=0.1', -22, 'rumble in the dark (the car could be anywhere)'),
 click(BL[1] - 0.05, 1.0, -26, 'lights back on'),
 (B['pick'] + 0.25, f'{L}/glass-ting.flac', 'lowpass=f=4000,afade=t=out:st=0.4:d=0.8', -28, 'door 1 picked (ice)'),
 (B['host'] + 0.05, f'{L}/electrical-hum.flac', f'atrim=0:{B["didnt"] - B["host"] + 0.6},highpass=f=90,afade=t=in:d=0.3,afade=t=out:st={B["didnt"] - B["host"]}:d=0.6', -30, 'the searchlight hums'),
 (B['alwaysOpens'] + 0.2, f'{L}/servo-arm.flac', 'lowpass=f=3000', -30, 'searchlight swings to door 3'),
 creak(B['goatDoor'] + 0.3, 1.1, -27, 'door 3 opens: a goat'),
 (B['guessEnd'] + 0.05, f'{L}/clock-tick.flac', 'atrim=5.4:7.0,asetpts=PTS-STARTPTS,afade=t=out:st=1.2:d=0.3', -27, 'tick tock: pause and guess'),
 (B['fifty'] + 0.05, f'{L}/pop-soft.flac', 'lowpass=f=2400', -26, '50% (door 1)'),
 (B['fifty'] + 0.2, f'{L}/pop-soft.flac', 'asetrate=48000*1.1,aresample=48000,lowpass=f=2400', -26, '50% (door 2)'),
 (B['hundred'] - 0.15, f'{L}/vault-clank.flac', 'lowpass=f=2200', -28, 'door 3 shuts'),
 (B['hundred'] + 0.3, f'{L}/whoosh-deep.flac', 'lowpass=f=1400,asetrate=48000*0.8,aresample=48000', -26, 'pull back up the building'),
 *[click(B['hundred'] + 0.3 + i * 0.12, 0.85 + i * 0.05, -31, f'walkway lamps come on ({i + 1})') for i in range(7)],
 (B['yourPick'] + 0.5, 'syn:pink', 'atrim=0:1.8,bandpass=f=1400:w=900,afade=t=in:d=1.2,afade=t=out:st=1.3:d=0.5', -34, 'amber wraps the other 99 doors'),
 (OP[0] - 0.4, f'{L}/electrical-hum.flac', f'atrim=0:{OP[-1] - OP[0] + 0.9},highpass=f=90,afade=t=in:d=0.3,afade=t=out:st={OP[-1] - OP[0] + 0.3}:d=0.6', -31, 'the searchlight sweeps the building'),
 (OP[0], f'{L}/tile-clicks.flac', f'atrim=0:{OP[-1] - OP[0] + 0.3},asetrate=48000*1.15,aresample=48000,lowpass=f=4500,afade=t=out:st={OP[-1] - OP[0]}:d=0.3', -27, 'ninety-eight doors clatter open'),
 creak(OP[len(OP) // 2], 0.9, -31, 'door wash'),
 (OP[0] + 0.3, 'syn:white', f'atrim=0:{OP[-1] - OP[0] + 1.2},bandpass=f=3200:w=2000,afade=t=in:d=1.5,afade=t=out:st={OP[-1] - OP[0] + 0.6}:d=0.6', -36, 'amber shimmer flows to the last door'),
 (B['leftShut'] + 0.1, f'{L}/glass-ting.flac', 'asetrate=48000*0.84,aresample=48000,lowpass=f=4000,afade=t=out:st=0.6:d=1.0', -27, 'the last door glows: 99%'),
 (CUT - WP, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -24, 'cut back to three doors'),
 (B['twoTimes'] - 0.1, 'syn:white', 'atrim=0:1.0,bandpass=f=3000:w=1800,afade=t=in:d=0.4,afade=t=out:st=0.6:d=0.4', -35, 'door 3 amber flows into door 2'),
 (B['twoTimes'] + 0.8, f'{L}/glass-ting.flac', 'asetrate=48000*1.12,aresample=48000,lowpass=f=4000,afade=t=out:st=0.6:d=1.0', -27, '2/3 lands on door 2'),
 creak(B['marilyn'] + 0.45, 0.95, -26, 'door 2 opens: the car'),
 (B['alwaysSwitch'] - 0.15, f'{L}/padlock-open.flac', 'lowpass=f=3500', -24, 'headlights clunk on'),
 (B['alwaysSwitch'] - 0.1, f'{L}/impact-deep.flac', 'lowpass=f=350,atrim=0:1.5,afade=t=out:st=0.6:d=0.9', -28, 'headlights: a soft low hit'),
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

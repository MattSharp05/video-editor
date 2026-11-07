# Vegas Sphere 01 sound: voice up front, Floating Cities (Kevin MacLeod, CC BY 4.0) ducked under speech, and quiet
# sounds from the picture's events, timed from beats.json with the same offsets the picture uses (timeline.ts/world.ts).
# CC0 library (library/sfx/cstack-cc0) + synthesized noise only. usage: python3 sound/mix.py [music_db] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 8.5   # measured: voice-to-music gap ~10.5 dB in speech
STEM = len(sys.argv) > 2
hit = B['pucks'] - 0.12; strike = hit - 0.45; fire = B['manytimes'] - 1.0; back_out = B['manytimes'] + 0.05
pop_antenna = B['l9'] + 2.6
lp = lambda f: f'lowpass=f={f}'
CUES = [
 (0.0, f'{L}/city-night.flac', f'atrim=0:{B["l1"] + 1.5},{lp(3000)},afade=t=in:d=0.4,afade=t=out:st={B["l1"]}:d=1.5', -20, 'the Strip at dusk'),
 (0.9, 'syn:brown', f'atrim=0:2.0,{lp(160)},afade=t=in:d=0.8,afade=t=out:st=1.2:d=0.8', -17, 'the TV inflates into the ball'),
 (B['l1'] + 0.1, f'{L}/whoosh-deep.flac', lp(1600), -21, 'push into the smile'),
 (B['gaps'] - 0.3, f'{L}/wing-flutter.flac', f'atrim=0:1.1,{lp(5000)},afade=t=out:st=0.8:d=0.3', -21, 'the sparrow darts through a gap'),
 (B['gaps'] + 1.25, f'{L}/pop-soft.flac', 'asetrate=48000*0.8,aresample=48000', -22, 'our puck blinks out'),
 (strike, f'{L}/impact-deep.flac', f'atrim=0:0.6,{lp(2500)},afade=t=out:st=0.3:d=0.3', -17, 'the slapshot'),
 (hit, f'{L}/rubber-stamp.flac', lp(2200), -15, 'thunk: the puck lands in the slot and lights'),
 (hit + 0.25, 'syn:pink', f'atrim=0:{B["l3"] - hit - 0.4},{lp(900)},afade=t=in:d=1.5,afade=t=out:st={B["l3"] - hit - 1.4}:d=1.0', -30, 'the wave lights the field'),
 (B['apart'] - 0.25, f'{L}/whoosh-fast.flac', f'atrim=0:0.5,{lp(4000)}', -25, 'the tape whips out'),
 (B['fortyeight'] - 0.55, f'{L}/relay-click.flac', lp(3000), -20, 'the tape snaps back'),
 (B['fortyeight'] + 0.2, f'{L}/tile-clicks.flac', f'atrim=0:1.2,{lp(4500)},afade=t=out:st=0.9:d=0.3', -27, '48 LEDs count on'),
 (B['l4'] + 0.3, f'{L}/card-riffle.flac', f'atrim=0:{B["colors"] - B["l4"]},{lp(4000)},afade=t=out:st={B["colors"] - B["l4"] - 0.8}:d=0.8', -27, 'the colour reels spin'),
 (B['colors'] + 0.2, f'{L}/tile-clicks.flac', f'atrim=0:1.0,{lp(3500)},afade=t=out:st=0.6:d=0.4', -28, 'the reels land'),
 (B['l5'] + 0.1, f'{L}/whoosh-deep.flac', lp(1400), -20, 'dive through the gap'),
 (B['l5'] + 0.5, f'{L}/server-room.flac', f'atrim=0:{back_out - B["l5"] - 0.5},{lp(2000)},afade=t=in:d=0.3,afade=t=out:st={back_out - B["l5"] - 0.9}:d=0.4', -24, 'behind the frame: the computer hums'),
 (fire, f'{L}/electric-spark-crackle.flac', f'atrim=0:0.5,{lp(4000)},afade=t=out:st=0.3:d=0.2', -26, 'the computer fires its pulses'),
 (fire + 0.15, f'{L}/whoosh-fast.flac', lp(2500), -24, 'riding a pulse home'),
 (back_out - 0.1, f'{L}/pop-soft.flac', '', -21, 'the pulse lands: out to the front'),
 (B['l6'] + 0.3, 'syn:pink', f'atrim=0:{B["l7"] - B["l6"] - 0.5},{lp(700)},afade=t=in:d=2.5,afade=t=out:st={B["l7"] - B["l6"] - 2.0}:d=1.5', -30, 'the long pull-back'),
 (B['blink'], f'{L}/relay-click.flac', 'asetrate=48000*0.7,aresample=48000,' + lp(1800), -25, 'the eye blinks'),
 (B['l8'] + 0.1, f'{L}/whoosh-deep.flac', lp(1500), -20, 'through the pupil'),
 (B['l8'] + 0.9, 'syn:brown', f'atrim=0:{B["l9"] - B["l8"]},{lp(120)},afade=t=in:d=0.6,afade=t=out:st={B["l9"] - B["l8"] - 1.0}:d=1.0', -24, 'inside the dome: room tone'),
 (pop_antenna, f'{L}/pop-soft.flac', 'asetrate=48000*1.15,aresample=48000', -17, 'the antenna is blinked off'),
 (B['l9'] + 0.6, f'{L}/city-night.flac', f'atrim=0:{T - B["l9"] - 0.6},{lp(3000)},afade=t=in:d=1.0,afade=t=out:st={T - B["l9"] - 2.2}:d=1.6', -22, 'back out over the city'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=8dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.0,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=8:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt + "," if flt else ""}volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'src': os.path.basename(c[1]), 'db': c[3], 'note': c[4]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues')

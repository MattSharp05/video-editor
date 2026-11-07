# AI image 01 sound: voice up front, Floating Cities (Kevin MacLeod, CC BY 4.0) ducked gently under speech, and quiet
# CC0 / synthesized effects, each on a visible event timed from beats.json and the film's own event numbers
# (out/events.json: keystrokes and denoise steps, dumped from src/events.ts). Swipes and camera moves stay silent.
# usage: python3 sound/mix.py [music_db] [stems]   (from film/)
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']
EV = json.load(open(f'{HERE}/../out/events.json'))
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 9   # measured (sound/measure.py): +9 dB puts Floating Cities ~10.5 dB under speech, up ~4.5 dB in the pauses
STEM = len(sys.argv) > 2
T_COLLAPSE = B['static2'] + 0.42
T_LAND = B['lands'] - 0.05
SCRAP = lambda i: 0.55 + i * ((B['photos'] + 0.25 - 0.55) / 7) + 0.55
SOFT = 'lowpass=f=5000'
CUES = [
 (0.42, f'{L}/blade-slice.flac', 'lowpass=f=6000', -22, 'scissors snip'),
 (1.26, f'{L}/blade-slice.flac', 'lowpass=f=5000,asetrate=48000*0.92,aresample=48000', -24, 'scissors snip'),
 (B['photos'] + 0.45, f'{L}/rubber-stamp.flac', 'lowpass=f=3500,asetrate=48000*0.85,aresample=48000', -13, 'MYTH stamp slams onto the collage'),
 *[(SCRAP(i), f'{L}/rubber-stamp.flac', 'lowpass=f=3000', -20, 'glue stick slaps a scrap down') for i in (1, 3, 5)],
 (B['l1'] - 0.1, f'{L}/radio-static.flac', f'atrim=0:{T_COLLAPSE - B["l1"] + 0.1},lowpass=f=4500,afade=t=in:d=1.8,afade=t=out:st={T_COLLAPSE - B["l1"] - 0.05}:d=0.12', -25, 'static swallows the collage'),
 (T_COLLAPSE, f'{L}/relay-click.flac', 'lowpass=f=2500', -12, 'CRT switch-off into the text box'),
 *[(t, f'{L}/screen-tap.flac', f'lowpass=f=4000,asetrate=48000*{0.9 + 0.2 * ((i * 7) % 5) / 4:.3f},aresample=48000', -23, 'keystroke') for i, t in enumerate(EV['strokes'])],
 (B['send'], f'{L}/pop-soft.flac', 'lowpass=f=3000,asetrate=48000*0.8,aresample=48000', -11, 'send pressed'),
 *[(B['words4'] - 0.05 + i * 0.12 + 0.5, f'{L}/rubber-stamp.flac', 'lowpass=f=2500,asetrate=48000*1.1,aresample=48000', -24, 'word tile lands') for i in range(3)],
 (B['so4'] + 0.15, f'{L}/tile-clicks.flac', 'lowpass=f=3500,afade=t=out:st=1.4:d=0.8', -21, 'split-flap tiles flip and clack'),
 (B['purestatic'] - 0.05, f'{L}/relay-click.flac', 'lowpass=f=3000', -10, 'TV clicks on'),
 (B['purestatic'], f'{L}/radio-static.flac', f'atrim=0:{B["clearer"] + 0.6 - B["purestatic"]},lowpass=f=3500,afade=t=in:d=0.2,afade=t=out:st={B["wipes"] - B["purestatic"]}:d={B["clearer"] + 0.6 - B["wipes"]}', -27, 'TV static, fading as the steps clean it'),
 *[(EV['steps'][i], f'{L}/card-riffle.flac', 'lowpass=f=3500,atrim=0:0.6,afade=t=out:st=0.4:d=0.2', -21, f'sheet {i + 1} lifts off') for i in range(3)],
 (EV['steps'][4], f'{L}/wing-flutter.flac', 'lowpass=f=3000', -24, 'the sheets speed up into a stream'),
 (EV['steps'][15], f'{L}/wing-flutter.flac', 'lowpass=f=3000,asetrate=48000*1.12,aresample=48000', -24, 'stream of sheets'),
 *[(B[k], f'{L}/pop-soft.flac', f'lowpass=f=2500,asetrate=48000*{r},aresample=48000', -14, f'tape glows, blob snaps into a {k[:-1]}') for k, r in (('dog8', 0.7), ('wave8', 0.78), ('pizza8', 0.86))],
 (B['l8'] + 0.1, f'{L}/electrical-hum.flac', 'atrim=0:2.2,lowpass=f=900,afade=t=in:d=0.5,afade=t=out:st=1.2:d=1.0', -26, 'the wall of TVs powers on'),
 (B['covered'] + 0.1, f'{L}/radio-static.flac', 'atrim=3:5.6,lowpass=f=3500,afade=t=in:d=0.5,afade=t=out:st=1.6:d=1.0', -27, 'sheets land: static over the wall'),
 (B['clean'] + 0.05, f'{L}/card-riffle.flac', 'lowpass=f=3500', -20, 'sheets peel off the wall'),
 (T_LAND, f'{L}/pop-soft.flac', 'lowpass=f=2500,asetrate=48000*0.75,aresample=48000', -13, 'the picture lands in the bubble'),
 (B['phone'], f'{L}/phone-vibrate-wood.flac', 'atrim=0:0.45,lowpass=f=1500,afade=t=out:st=0.3:d=0.15', -22, 'the phone buzzes (ding shake)'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for t, src, flt, g, note in CUES: args += ['-i', src]
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4], 'src': os.path.basename(c[1]), 'db': c[3]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues')

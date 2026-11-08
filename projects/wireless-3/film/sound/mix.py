# Caught by Wireless 3 sound: voice up front (close to raw), Floating Cities (Kevin MacLeod, CC BY 4.0) ducked under
# speech the series way (+12 dB, gentle sidechain duck, fades), and effects: the kit's series sounds (sound/series/,
# copied from wireless-kit/film-kit/sound, same files and gains in every part) + CC0 library/sfx/cstack-cc0, each
# placed from beats.json at the frame its cause is visible.
# usage: python3 sound/mix.py [music_db] [stem]   -> sound/work/mix.wav, sound/cues.json
import json, os, subprocess, sys, glob
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']; FPS = 30; SR = 48000
F = lambda s: round(s * FPS)
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
LIB = '/home/user/video-editor/library/sfx/cstack-cc0'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 9.6   # voice ~10 dB over music under speech (part 2's measure)
STEM = len(sys.argv) > 2

# series sounds come from the kit (sound/series/, series.json gains, build_sfx); everything else is CC0 cstack-cc0.
sys.path.insert(0, f'{HERE}/series')
from series_sfx import build_sfx, CFG
ALIAS = {'spark': 'spark-crackle', 'morse': 'morse-beep', 'flutter': 'wing-flutter', 'click': 'moustache-click',
         'chime': 'feather-chime', 'paper': 'paper-flip', 'thunk': 'headline-thunk', 'ticker': 'type-tick', 'rubber-stamp': 'stamp'}
cues = [
    {'sound': 'paper', 'fr': F(0.6), 'what': 'recap: pull back off the brim, the page flutters'},
    {'sound': 'paper', 'fr': F(B['raced'] - 0.2), 'gain_db': -4, 'what': 'R4 panel slides in'},
    {'sound': 'rubber-stamp', 'fr': F(B['part']), 'gain_db': 0, 'what': "clerk's stamp thumps the subtitle"},
    {'sound': 'whoosh-deep', 'fr': F(B['l2'] - 0.4), 'gain_db': -14, 'what': 'push through the engraving'},
    {'sound': 'pop-soft', 'fr': F(B['dew'] - 0.05), 'gain_db': -6, 'what': 'bowler pops out of the pilot cap'},
    {'sound': 'chime', 'fr': F(B['dew'] + 0.3), 'what': 'the Feather springs into the band'},
    {'sound': 'flutter', 'fr': F(B['crippen'] - 0.1), 'what': 'the Moustache flies in the porthole'},
    {'sound': 'click', 'fr': F(B['crippen'] + 0.55), 'gain_db': -2, 'what': 'it lands on his lip'},
    {'sound': 'tile-clicks', 'fr': F(B['l4'] + 0.5), 'gain_db': -10, 'what': 'race tokens bump'},
    {'sound': 'whoosh-fast', 'fr': F(B['ethel'] - 0.3), 'gain_db': -16, 'what': 'push through the porthole into her cabin'},
    {'sound': 'paper', 'fr': F(B['l5'] + 0.6), 'gain_db': -3, 'what': 'London pops up off the page'},
    {'sound': 'paper', 'fr': F(B['trial'] - 0.2), 'gain_db': -3, 'what': 'the Old Bailey rises'},
    {'sound': 'whoosh-deep', 'fr': F(B['l6'] - 0.4), 'gain_db': -14, 'what': 'crane through the dome into court'},
    {'sound': 'paper', 'fr': F(B['drug'] - 0.3), 'gain_db': -4, 'what': 'report card raised'},
    {'sound': 'vault-clank', 'fr': F(B['bought'] + 0.4), 'gain_db': -14, 'what': 'bottle lands in the pan, it dips'},
    {'sound': 'paper', 'fr': F(B['winter'] - 0.4), 'gain_db': -4, 'what': 'poisons book pages flip'},
    {'sound': 'rope-or-cable-winch', 'fr': F(B['shopped'] - 0.3), 'gain_db': -16, 'what': 'drawer slides open'},
    {'sound': 'vault-clank', 'fr': F(B['shopped'] + 0.1), 'gain_db': -12, 'what': 'scales tip: the balloon flies off'},
    {'sound': 'thunk', 'fr': F(B['guilty'] + 0.1), 'what': 'headline GUILTY'},
    {'sound': 'card-riffle', 'fr': F(B['law'] + 0.3), 'gain_db': -8, 'what': 'ledger closes'},
    {'sound': 'ship-creak', 'fr': F(B['l9'] - 0.1), 'gain_db': -12, 'what': 'court doors swing open'},
    {'sound': 'thunk', 'fr': F(B['notguilty'] + 0.05), 'gain_db': -3, 'what': 'headline NOT GUILTY'},
    {'sound': 'wing-flutter', 'fr': F(B['free'] - 0.1), 'gain_db': -8, 'what': 'pigeons lift'},
    {'sound': 'spark', 'fr': F(B['free'] + 0.3), 'gain_db': -4, 'what': 'the Spark blinks above her'},
    {'sound': 'spark', 'fr': F(B['wireless'] - 0.2), 'what': 'the Spark leaps from ship to land'},
    {'sound': 'paper', 'fr': F(B['twist'] - 0.2), 'what': 'the page corkscrews'},
    {'sound': 'tile-clicks', 'fr': F(B['twist'] + 0.2), 'gain_db': -8, 'what': 'dateline digits spin'},
    {'sound': 'padlock-open', 'fr': F(B['sample'] - 0.2), 'gain_db': -14, 'what': 'archive box lid lifts'},
    {'sound': 'pop-soft', 'fr': F(B['match']), 'gain_db': -6, 'what': 'the piece bounces off'},
    {'sound': 'padlock-close', 'fr': F(B['reopened'] + 0.4), 'gain_db': -10, 'what': 'the padlock stays shut'},
    {'sound': 'chime', 'fr': F(B['l14']), 'gain_db': -2, 'what': 'the Feather curls into a question mark'},
    {'sound': 'flutter', 'fr': F(B['didhe'] + 0.8), 'gain_db': -3, 'what': 'the Moustache flies to the dot'},
    {'sound': 'click', 'fr': F(B['didhe'] + 1.4), 'gain_db': -4, 'what': 'it perches'},
    {'sound': 'chime', 'fr': F(B['l15']), 'gain_db': -4, 'what': 'the Feather uncurls and rises'},
    {'sound': 'relay-click', 'fr': F(B['captain'] + 0.2), 'gain_db': -10, 'what': 'hunch bulb clicks on'},
    {'sound': 'spark', 'fr': F(B['message'] - 0.1), 'what': 'mast spark gap leaps'},
    *[{'sound': 'morse', 'fr': F(B['end'] - 0.6) + i * 7, 'gain_db': -8, 'what': f'the star blinks dot-dash ({i + 1})'} for i in range(2)],
    {'sound': 'chime', 'fr': F(B['end'] - 0.1), 'what': "the Feather's tip touches the star"},
]
for c in cues: c['sound'] = ALIAS.get(c['sound'], c['sound'])
cues += json.load(open(f'{HERE}/kit_cues.json'))   # kit-timed: title plaque sting + C-B-W taps, end card typing
cues.sort(key=lambda c: c['fr'])
json.dump(cues, open(f'{HERE}/cues.json', 'w'), indent=1)
TF = round(T * FPS)
build_sfx([c for c in cues if c['sound'] in CFG], TF, f'{HERE}/work/sfx_series.wav', fps=FPS)

N = int(round(T * SR)); sfx = np.zeros((N, 2), np.float32)
def load(p):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ar', str(SR), '-ac', '2', '-f', 'f32le', '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2).copy()
for c in [c for c in cues if c['sound'] not in CFG]:
    x = load(f"{LIB}/{c['sound']}.flac")[: int(1.6 * SR)]
    fade = min(len(x), int(0.15 * SR)); x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    pk = np.abs(x).max() or 1; x = x / pk * 10 ** ((-16 + c.get('gain_db', 0)) / 20)   # peak-normalised, soft
    a0 = int(c['fr'] / FPS * SR); b0 = min(N, a0 + len(x)); sfx[a0:b0] += x[: b0 - a0]
ser = load(f'{HERE}/work/sfx_series.wav'); m = min(N, len(ser)); sfx[:m] += ser[:m]
sf.write(f'{HERE}/work/sfx.wav', sfx, SR)

args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC, '-i', f'{HERE}/work/sfx.wav']
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]',
      '[2]aresample=48000,aformat=channel_layouts=stereo[sfx]']
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
fc.append(f'[voA][mduck][sfx]amix=inputs=3:normalize=0:duration=first,atrim=0:{T}[pre]')
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[pre]', '-ar', '48000', '-c:a', 'pcm_f32le', f'{HERE}/work/pre.wav'], check=True)
# two-pass LINEAR loudnorm to -14 LUFS (keeps the voice's own dynamics), then a lookahead limiter for the true peak
m = subprocess.run(['ffmpeg', '-nostdin', '-i', f'{HERE}/work/pre.wav', '-af', 'loudnorm=I=-14:TP=-2:LRA=20:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
ln = (f"loudnorm=I=-14:TP=-2:LRA=20:linear=true:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}")
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{HERE}/work/pre.wav', '-af', f'{ln},alimiter=limit=0.79:attack=5:release=50:level=false,aresample=48000',
                '-c:a', 'pcm_s16le', f'{HERE}/work/mix.wav'], check=True)
print(len(cues), 'cues; mix ->', f'{HERE}/work/mix.wav')

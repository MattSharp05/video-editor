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
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2

# series sound names -> kit file (if the kit ships one) else a CC0 stand-in
SERIES = json.load(open(f'{HERE}/series/series.json')) if os.path.exists(f'{HERE}/series/series.json') else {}
def src(name):
    for ext in ('wav', 'flac'):
        p = f'{HERE}/series/{name}.{ext}'
        if os.path.exists(p): return p, SERIES.get(name, {}).get('gain_db', 0)
    stand = {'spark': 'electric-spark-crackle', 'morse': 'relay-click', 'flutter': 'wing-flutter', 'click': 'tile-clicks',
             'chime': 'glass-ting', 'paper': 'card-riffle', 'thunk': 'impact-deep', 'sting': 'sonar-ping', 'ticker': 'tile-clicks'}
    return f'{LIB}/{stand.get(name, name)}.flac', -6

cues = [
    {'sound': 'paper', 'fr': F(0.6), 'what': 'recap: pull back off the brim, the page flutters'},
    {'sound': 'paper', 'fr': F(B['raced'] - 0.2), 'gain_db': -4, 'what': 'R4 panel slides in'},
    *[{'sound': 'morse', 'fr': F(2.4) + i * 8, 'gain_db': -6, 'what': f'Spark taps C-B-W ({i + 1})'} for i in range(3)],
    {'sound': 'sting', 'fr': F(2.4), 'what': 'plaque burns in'},
    {'sound': 'rubber-stamp', 'fr': F(B['part'] - 0.1), 'gain_db': -6, 'what': "clerk's stamp thumps the subtitle"},
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
    {'sound': 'ticker', 'fr': F(B['end'] - 0.2), 'gain_db': -10, 'what': 'end card types THE END'},
]
json.dump(cues, open(f'{HERE}/cues.json', 'w'), indent=1)

N = int(round(T * SR)); sfx = np.zeros((N, 2), np.float32)
def load(p):
    x, sr = sf.read(p, dtype='float32', always_2d=True)
    if sr != SR:
        r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ar', str(SR), '-ac', '2', '-f', 'f32le', '-'], capture_output=True, check=True)
        x = np.frombuffer(r.stdout, np.float32).reshape(-1, 2)
    if x.shape[1] == 1: x = np.repeat(x, 2, 1)
    return x[:, :2]
for c in cues:
    p, g0 = src(c['sound'])
    x = load(p)[: int(1.6 * SR)].copy()
    fade = min(len(x), int(0.15 * SR)); x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    pk = np.abs(x).max() or 1; x = x / pk * 10 ** ((-16 + g0 + c.get('gain_db', 0)) / 20)   # peak-normalised, soft
    a = int(c['fr'] / FPS * SR); b = min(N, a + len(x)); sfx[a:b] += x[: b - a]
sf.write(f'{HERE}/work/sfx.wav', sfx, SR)

args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC, '-i', f'{HERE}/work/sfx.wav']
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]',
      '[2]aresample=48000,aformat=channel_layouts=stereo[sfx]']
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
fc.append(f'[voA][mduck][sfx]amix=inputs=3:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
print(len(cues), 'cues; mix ->', f'{HERE}/work/mix.wav')

# Wireless 2 sound: voice up front, Floating Cities (Kevin MacLeod, CC BY 4.0) at +12 dB ducked under speech (the series
# way), and soft effects, each with a visible cause, timed from src/beats.json. Series device sounds come from the kit
# palette (copied to sound/series/<name>.wav) when it exists; otherwise the CC0 library or a numpy synth of the same role.
# usage: python3 mix.py [music_db] [stems]
import json, os, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); W = f'{HERE}/work'; os.makedirs(W, exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']
KIT = f'{HERE}/series'
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 10
STEM = len(sys.argv) > 2
SR = 48000

def env(n, a=0.004, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / r)

def synth(name):
    rng = np.random.default_rng(sum(map(ord, name)))
    if name == 'morse-beep':      # one soft 800 Hz tap
        n = int(0.12 * SR); t = np.arange(n) / SR
        x = np.sin(2 * np.pi * 800 * t) * np.minimum(1, t / 0.005) * np.minimum(1, (n / SR - t) / 0.02)
    elif name == 'paper-flip':
        n = int(0.4 * SR); x = rng.normal(0, 1, n)
        x = np.convolve(x, np.ones(24) / 24, 'same') * np.sin(np.linspace(0, np.pi, n)) ** 2
    elif name == 'thunk':
        n = int(0.4 * SR); t = np.arange(n) / SR
        x = np.sin(2 * np.pi * 80 * t) * env(n, 0.002, 0.07) + rng.normal(0, 0.2, n) * env(n, 0.001, 0.015)
    elif name == 'click':
        n = int(0.08 * SR); x = rng.normal(0, 1, n) * env(n, 0.0005, 0.006); x = np.convolve(x, np.ones(5) / 5, 'same')
    elif name == 'tick':           # clue ring: soft wooden tick
        n = int(0.15 * SR); t = np.arange(n) / SR
        x = np.sin(2 * np.pi * 1200 * t) * env(n, 0.001, 0.02) * 0.6
    elif name == 'press':          # printing press rumble
        n = int(2.4 * SR); t = np.arange(n) / SR
        x = (rng.normal(0, 1, n) * 0.4 + np.sin(2 * np.pi * 55 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 4 * t)) * np.sin(np.linspace(0, np.pi, n))
        x = np.convolve(x, np.ones(40) / 40, 'same')
    elif name == 'snip':
        n = int(0.12 * SR); x = rng.normal(0, 1, n) * env(n, 0.0005, 0.01)
    elif name == 'pen':
        n = int(1.2 * SR); x = rng.normal(0, 1, n) * (0.5 + 0.5 * np.sin(np.arange(n) / SR * 2 * np.pi * 7)) * 0.3
        x = np.convolve(x, np.ones(8) / 8, 'same') * np.sin(np.linspace(0, np.pi, n))
    elif name == 'chug':           # pilot boat engine
        n = int(3.0 * SR); t = np.arange(n) / SR
        x = np.sin(2 * np.pi * 60 * t) * (np.sin(2 * np.pi * 5 * t) > 0.3) * np.sin(np.linspace(0, np.pi, n))
        x = np.convolve(x, np.ones(60) / 60, 'same')
    elif name == 'dice':
        n = int(0.7 * SR); x = np.zeros(n)
        for k, d in enumerate([0, 0.14, 0.26, 0.34, 0.4]):
            i = int(d * SR); m = 900; x[i:i + m] += rng.normal(0, 1, m) * env(m, 0.0005, 0.01) * (1 - k * 0.15)
    elif name == 'hop':
        n = int(0.15 * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * 300 * t) * env(n, 0.002, 0.03)
    elif name == 'swat':
        n = int(0.2 * SR); x = rng.normal(0, 1, n) * env(n, 0.002, 0.04); x = np.convolve(x, np.ones(10) / 10, 'same')
    else:
        raise SystemExit(f'no sound {name}')
    x = x / (np.abs(x).max() + 1e-9) * 0.7
    return np.stack([x, x], 1)

LIB = {'crackle': 'electric-spark-crackle', 'flutter': 'wing-flutter', 'chime': 'glass-ting', 'stamp': 'rubber-stamp',
       'horn': 'ship-horn-distant', 'clock': 'clock-tick', 'key': 'relay-click', 'whoosh': 'whoosh-deep', 'pop': 'pop-soft',
       'creak': 'ship-creak', 'rope': 'rope-or-cable-winch', 'sea': 'ocean-surface', 'zap': 'electric-zap', 'static': 'radio-static'}

def get(name):
    for ext in ('wav', 'flac'):
        p = f'{KIT}/{name}.{ext}'
        if os.path.exists(p): return p, 'kit'
    if name in LIB: return f'{L}/{LIB[name]}.flac', 'cc0'
    p = f'{W}/syn_{name}.wav'
    sf.write(p, synth(name), SR); return p, 'synth'

TAPS = [72 + d for d in (0, 5, 8, 13, 18, 23, 26, 29, 34, 37, 40)]  # title plaque Morse taps (kit titlePlaqueTimes, frames)
# (time s, sound, gain dB, what you see)
CUES = [(f / 30, 'morse-beep', -27, 'Spark taps the plaque') for f in TAPS] + [
    (0.9, 'paper-flip', -24, 'dateline flips to 16 July 1910'),
    (B['recap'] + 0.5, 'paper-flip', -27, 'panel: the steps'),
    (B['remains'] - 0.4, 'paper-flip', -27, 'panel: lamps on the closed floor'),
    (B['runaway'] - 0.7, 'paper-flip', -27, 'panel: the empty oval'),
    (58 / 30, 'S:sting', 0, 'title plaque rises'),
    (B['title'] - 0.05, 'paper-flip', -22, 'subtitle strip lands under the plate'),
    (B['chase'], 'whoosh', -30, '"The chase" letters sprint off'),
    (B['l2'] - 0.4, 'press', -24, 'press rollers spin'),
    (B['descr'] + 0.3, 'paper-flip', -26, 'posters fly out'),
    
    (B['shaved'] - 0.1, 'snip', -32, 'razor stroke'),
    (B['mustache'] + 0.15, 'flutter', -22, 'the Moustache flies off'),
    (B['glasses'] + 1.05, 'click', -24, 'drawer shuts on the glasses'),
    (B['hair'] - 0.05, 'snip', -24, 'scissors snip'),
    (B['hair'] + 0.25, 'snip', -26, 'snip'),
    (B['boy'] + 0.3, 'pop', -24, 'cap drops on'),
    (B['robinson'] - 0.1, 'pen', -28, 'pen writes the passenger list'),
    (B['bigship'] - 0.3, 'horn', -24, 'the Montrose sounds her horn'),
    (B['canada'] + 0.2, 'flutter', -26, 'Moustache lands on the funnel'),
    (B['watched'] - 0.2, 'creak', -28, 'telescope raised'),
    (B['clothes'], 'tick', -24, 'clue ring: trouser cuff'),
    (B['didntfit'], 'tick', -24, 'clue ring: cap'),
    (B['tenderly'] + 0.2, 'tick', -24, 'clue ring: held hands'),
    (B['l8'] - 0.05, 'S:hunch-click', -4, 'rings slide into the hunch bulb'),
    (B['wondered'] - 0.5, 'flutter', -25, 'Moustache flies down'),
    (B['wondered'] + 0.3, 'S:moustache-click', 0, 'Moustache clicks onto Robinson\'s lip'),
    (B['couldbe'] - 0.1, 'S:hunch-click', 0, 'hunch bulb clicks on'),
    (B['l9'] - 0.2, 'crackle', -24, 'the Spark at the masthead'),
    (B['air'] - 0.2, 'snip', -24, 'tin-can string snipped'),
    (B['air'] + 0.1, 'crackle', -27, 'Spark hops the gap'),
    (B['sent'] - 0.2, 'paper-flip', -28, 'captain hands the note'),
    
    (B['land'], 'zap', -28, 'Spark leaps off the ship'),
    (B['onboard'] - 0.2, 'S:ticker', 0, 'Liverpool ticker prints'),
    (B['helper'] + 1.0, 'crackle', -27, 'Spark along the wires'),
    (B['l11'] - 0.15, 'paper-flip', -24, 'telegram lands on Dew\'s desk'),
    (B['dew'] + 0.3, 'clock', -30, 'wall clock ticking'),
    (B['dew'] + 0.9, 'S:newspaper-rustle', 0, 'papers fly off the desk'),
    (B['dew'] + 1.0, 'S:feather-chime', 0, 'he grabs the bowler with Cora\'s Feather'),
    (B['jumped'] - 0.2, 'horn', -26, 'the Laurentic pulls out'),
    (B['jumped'] + 0.55, 'thunk', -24, 'Dew lands on deck'),
    (B['faster'] + 0.5, 'paper-flip', -26, 'the scene becomes the race-map page'),
    (B['everywhere'], 'S:newspaper-rustle', 0, 'the pages fly off like birds'),
    
    (B['noidea'] - 0.1, 'flutter', -24, 'Moustache flaps in front of his face'),
    (B['racing'], 'swat', -22, 'swat'),
    (B['first'] - 0.1, 'paper-flip', -28, 'page turn'),
    (B['fordays'] - 0.1, 'dice', -24, 'dice roll'),
    (B['fordays'] + 0.5, 'hop', -28, 'token hop'), (B['raced'], 'hop', -28, 'token hop'), (B['raced'] + 1.0, 'hop', -28, 'token hop'), (B['raced'] + 1.6, 'hop', -26, 'Laurentic reaches Father Point'),
    (B['smallboat'] - 0.8, 'chug', -26, 'pilot boat chugs out'),
    (B['l15'] - 0.4, 'rope', -26, 'rope ladder drops'),
    (B['climbed'], 'flutter', -24, 'Moustache squawks and flies off'),
    (B['end'] + 0.1, 'paper-flip', -24, 'end card slides up'),
]
CUES += [(B['end'] + 0.1 + 0.4 + i * 2 / 30, 'key', -34, 'end card types') for i, ch in enumerate('NEXT: THE VERDICT') if ch != ' ' and i % 2 == 0]
CUES += [((round((B['sent'] + 0.45) * 30) + d) / 30, 'S:morse-beep', 0, 'Morse key taps the message') for d in (0, 5, 8, 14, 17, 20, 26, 29)]
CUES += [(B['but'] + 0.1, 'S:clue-ring', 0, 'ring on the Feather tip'), (B['climbed'], 'S:clue-ring', -2, 'ring on the bowler shadow'),
         (B['l15'] - 0.4, 'S:ship-horn-bed', 0, 'the Montrose at Father Point'), (B['l5'], 'S:ship-horn-bed', 0, 'the Montrose at Antwerp')]
REMAP = {'morse-beep': 'morse-beep', 'paper-flip': 'paper-flip', 'flutter': 'wing-flutter', 'tick': 'clue-ring', 'crackle': 'spark-crackle'}
CUES = [(t, ('S:' + REMAP[n]) if n in REMAP else n, 0 if n in REMAP else g, w) for t, n, g, w in CUES]
CUES = [c for c in CUES if c[1] != 'horn' and not (c[1] == 'key' and 'end card' in c[3])]
# end card: one type-tick per letter (kit endCardTimes: types from at+12, 2 f a letter)
END_AT = round((B['end'] + 0.1) * 30)
CUES += [((END_AT + 14 + i * 2) / 30, 'S:type-tick', 0, 'end card types') for i, ch in enumerate('NEXT: THE VERDICT') if ch != ' ']
CUES += [((END_AT) / 30, 'S:paper-flip', 0, 'end card slides up')]
CUES.sort(key=lambda c: c[0])
sys.path.insert(0, KIT)
from series_sfx import build_sfx
SER = [c for c in CUES if c[1].startswith('S:')]
build_sfx([{'sound': c[1][2:], 'fr': round(c[0] * 30), 'gain_db': c[2]} for c in SER], round(T * 30), f'{W}/sfx_series.wav', fps=30)
ALL = CUES
CUES = [c for c in CUES if not c[1].startswith('S:')]
used = {}
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC, '-i', f'{L}/{LIB["sea"]}.flac']
fc = [f'[0]aresample={SR},aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]',
      # quiet sea bed under the sea stretches (dock → Father Point), looped
      f'[2]aresample={SR},aformat=channel_layouts=stereo,aloop=loop=-1:size=2e9,atrim=0:{T},lowpass=f=1800,volume=-30dB,'
      f"volume='if(between(t,{B['l5'] - 0.5},{B['l10']})+between(t,{B['l14'] - 0.5},{T}),1,0.25)':eval=frame,afade=t=out:st={T - 2}:d=2[sea]"]
args += ['-i', f'{W}/sfx_series.wav']
fc.append(f'[3]aresample={SR},aformat=channel_layouts=stereo[ser]')
mix = ['[voA]', '[mduck]', '[sea]', '[ser]']
for i, (t, name, g, note) in enumerate(CUES):
    p, src = get(name); used[name] = src
    args += ['-i', p]
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 4}]aresample={SR},aformat=channel_layouts=stereo,atrim=0:2.5,lowpass=f=7000,volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]alimiter=limit=0.89:attack=2:release=40:level=false[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{W}/stem_voice.wav', '-map', '[mduck]', f'{W}/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', str(SR), f'{W}/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'sound': c[1][2:] if c[1].startswith('S:') else c[1], 'gain_db': c[2], 'source': 'kit series' if c[1].startswith('S:') else used[c[1]], 'what': c[3]} for c in ALL], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(ALL), 'cues;', len(SER), 'kit series;', used)

# Stolen Smile 1 sound: voice up front (high-pass, one static gain), Floating Cities (Kevin MacLeod, CC BY 4.0) at +12 dB
# with the series' gentle sidechain duck (same chain as part 2), and the kit's series sounds (film-kit/sound, synthesized /
# CC0) placed by the kit's own helper (series_sfx.build_sfx: the series gain, identical in every part). Every cue has a
# visible cause and is timed from src/beats.json (the same numbers the picture uses). usage: python3 mix.py [music_db] [stems]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); W = f'{HERE}/work'; os.makedirs(W, exist_ok=True)
KIT = '/home/user/video-editor/projects/stolen-smile-kit/film-kit/sound'
sys.path.insert(0, KIT)
from series_sfx import build_sfx
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']; FPS = 30
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
SR = 48000
fr = lambda t: round(t * FPS)
T_ = {'louvre': B['paris'] - 0.15, 'salon3': B['nextday'] + 0.05, 'dark': B['noone'] + 0.75}

# (time s, sound, what you see)  — the picture uses the same offsets (src/Film.tsx)
CUES = [
    (B['think'], 'stamp', 'red "?" stamp thumps on the glass'),
    (B['think'] + 0.06, 'question-plink', 'the "?" appears'),
    (B['l1'] + 0.2, 'paper-flap', "today's crowd folds down"),
    (B['l1'] + 0.75, 'paper-flap', 'the 1911 paintings fold up'),
    (B['before'], 'paper-flap', 'calendar "1911" drops in'),
    (B['superstar'], 'gauge-ratchet', 'fame gauge pops in, needle at the monocle'),
    (B['stole'] + 0.75, 'cloth-swish', 'the hand zips her off the wall'),
    (B['title'] + 0.15, 'sting-smile', 'title plaque drops onto the hooks'),
    *[(B['title'] + 0.35 + i * 0.18, 'hook-clink', f'hook {i + 1} lights') for i in range(4)],
    (B['mondays'] - 0.1, 'paper-flap', 'calendar "Monday" drops in'),
    (B['monday'] - 0.5, 'paper-flap', 'the eyelid shutter lifts; push through'),
    (B['knows'] + 0.1, 'cloth-swish', 'sleeve wipes the fog'),
    *[(B['hooks'] + 0.05 + i * 0.22, 'hook-clink', f'hook {i + 1} counted') for i in range(4)],
    (B['nobody'] + 0.45, 'glint', 'her glint: "...anyone?"'),
    (B['wraps'], 'cloth-swish', 'the smock wraps her'),
    (B['wraps'] + 0.5, 'amber-shimmer', 'amber leaks from the folds (first time)'),
    (B['opens'] + 0.6, 'glint', 'her glint from the bundle at the bow'),
    (B['carrying'] + 0.35, 'paper-flap', 'the map folds down over the street'),
    (B['nextday'], 'calendar-tear', 'calendar Monday → Tuesday'),
    (T_['salon3'] - 0.45, 'paper-flap', 'the map folds up'),
    (B['empty'], 'hook-hum', 'four empty hooks'),
    (B['gone'] + 0.3, 'question-plink', 'the hooks\' shadows lean into a "?"'),
    (B['gone'] + 0.1, 'hook-hum', 'the empty hooks in the dimming room'),
    (T_['dark'] + 0.7, 'glint', 'her glint under the bed'),
    (T - 2.2, 'stamp', 'end card pinned'),
]
# title card typing: one clack per typed letter (kit titleCardTimes: typeAt = at + 16 f, 2 f per char)
label = 'Part one: the vanishing'; at = fr(B['title'] + 0.15)
CLACKS = [(at + 16 + i * 2) / FPS for i, ch in enumerate(label) if ch != ' ']
cue_list = [{'sound': s, 'fr': fr(t)} for t, s, _ in CUES] + [{'sound': 'typewriter', 'fr': fr(t)} for t in CLACKS]
sfx = build_sfx(cue_list, round(T * FPS), f'{W}/sfx.wav', fps=FPS)

args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC, '-i', sfx]
fc = [f'[0]aresample={SR},aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]',
      f'[2]aresample={SR},aformat=channel_layouts=stereo[fx]',
      f'[voA][mduck][fx]amix=inputs=3:normalize=0:duration=first,atrim=0:{T}[pre]',
      '[pre]alimiter=limit=0.89:attack=2:release=40:level=false[out]']
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{W}/stem_voice.wav', '-map', '[mduck]', f'{W}/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', str(SR), f'{W}/mix.wav'], check=True)
json.dump([{'t': round(t, 2), 'sound': s, 'what': w} for t, s, w in CUES] + [{'t': round(CLACKS[0], 2), 'sound': 'typewriter', 'what': f'{len(CLACKS)} clacks, title typed'}],
          open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(cue_list), 'cues ->', f'{W}/mix.wav')

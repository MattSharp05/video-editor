# Stolen Smile 3 sound: voice up front (close to raw), Floating Cities (Kevin MacLeod, CC BY 4.0) ducked under speech
# exactly as in the moon-tides template (+12 dB, gentle sidechain duck, fades), and the kit's series sounds (same files,
# same gains in every part: sound/series/, copied from stolen-smile-kit/film-kit/sound) placed from beats.json.
# usage: python3 sound/mix.py [music_db] [stem]   -> sound/work/mix.wav, sound/cues.json
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
sys.path.insert(0, f'{HERE}/series')
from series_sfx import build_sfx
B = json.load(open(f'{HERE}/../src/beats.json')); T = B['total']; FPS = 30
TOTAL_FR = round(T * FPS)
F = lambda s: round(s * FPS)
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2

# --- series cues (each has a visible cause; times from the same beats the picture uses) ---
title_at = F(B['title'])
label = 'Part three: the return'
clacks = [title_at + 16 + i * 2 for i, ch in enumerate(label) if ch != ' ']   # = titleCardTimes(at, 3).clacks
cues = [
    {'sound': 'hook-hum', 'fr': 0, 'what': 'recap: the four empty hooks with the web'},
    {'sound': 'question-plink', 'fr': F(1.2), 'what': 'recap: the red ? over Paris'},
    {'sound': 'sting-smile', 'fr': title_at, 'what': 'title card drops'},
    *[{'sound': 'typewriter', 'fr': c, 'what': 'title typed'} for c in clacks[::2]],
    {'sound': 'paper-flap', 'fr': F(B['l2']) - 3, 'what': 'carrier push: red silk -> Geri desk'},
    {'sound': 'gauge-ratchet', 'fr': F(B['money']), 'gain_db': -6, 'what': 'the pile of money grows (ratchet of stacking)'},
    {'sound': 'paper-flap', 'fr': F(B['money'] + 0.8), 'what': 'ceiling flap folds open'},
    {'sound': 'paper-flap', 'fr': F(B['l3']) - 3, 'what': 'pile topples into the hotel street'},
    {'sound': 'paper-flap', 'fr': F(B['l4']) - 3, 'what': 'carrier push: hotel door -> room 20'},
    {'sound': 'stamp', 'fr': F(B['room'] + 0.8), 'gain_db': -8, 'what': 'door 20 opens (latch)'},
    {'sound': 'cloth-swish', 'fr': F(B['trunk']), 'gain_db': -4, 'what': 'shirts and socks fly out of the trunk'},
    {'sound': 'paper-flap', 'fr': F(B['lifts'] + 0.2), 'what': 'false bottom lifts out'},
    {'sound': 'amber-shimmer', 'fr': F(B['underneath']), 'what': 'red silk bundle glowing amber'},
    {'sound': 'cloth-swish', 'fr': F(B['mona'] - 0.25), 'what': 'the silk is pulled away (reveal)'},
    {'sound': 'glint', 'fr': F(B['mona'] + 0.5), 'what': 'her glint at the reveal'},
    {'sound': 'paper-flap', 'fr': F(B['seal'] - 0.4), 'what': 'the panel flips to its back'},
    {'sound': 'stamp', 'fr': F(B['real'] - 0.05), 'what': '"Real!" stamp'},
    {'sound': 'question-plink-up', 'fr': F(B['vincenzo'] - 0.1), 'what': 'the ? straightens into !'},
    {'sound': 'paper-flap', 'fr': F(B['nottrue']), 'gain_db': -4, 'what': 'eraser rubs out "stolen?"'},
    {'sound': 'gauge-ratchet', 'fr': F(B['showsoff']), 'what': 'gauge climbs on the Italy tour'},
    {'sound': 'paper-flap', 'fr': F(B['showsoff'] - 0.4), 'gain_db': -3, 'what': 'Florence gallery pops up'},
    {'sound': 'paper-flap', 'fr': F(B['crowds'] + 0.2), 'gain_db': -3, 'what': 'Milan gallery pops up'},
    {'sound': 'calendar-tear', 'fr': F(B['jan'] + 0.1), 'what': 'calendar tears to January 1914'},
    *[{'sound': 'hook-clink', 'fr': F(B['wall'] + 0.2) + i * 9, 'pan': -0.3 + i * 0.2, 'what': f'hook {i + 1}'} for i in range(4)],
    {'sound': 'glint', 'fr': F(B['paris'] + 0.3), 'what': 'her glint, back home'},
    {'sound': 'paper-flap', 'fr': F(B['twodays'] - 0.15), 'what': 'gallery doors burst open'},
    {'sound': 'gauge-ratchet', 'fr': F(B['hundred'] - 0.1), 'what': 'odometer rolls to 100,000+'},
    {'sound': 'calendar-tear', 'fr': F(B['seven'] - 0.2), 'gain_db': -3, 'what': '"about 7 months" page drops in'},
    {'sound': 'gauge-ratchet', 'fr': F(B['famous'] - 0.3), 'what': 'needle goes past the end'},
    {'sound': 'gauge-boing', 'fr': F(B['famous'] + 0.1), 'what': 'gauge glass pops'},
    {'sound': 'glint', 'fr': F(B['end'] - 0.2), 'what': 'final glint'},
    {'sound': 'stamp', 'fr': F(B['end'] - 0.3), 'what': 'end card pinned'},
]
json.dump(cues, open(f'{HERE}/cues.json', 'w'), indent=1)
build_sfx(cues, TOTAL_FR, f'{HERE}/work/sfx.wav', fps=FPS)

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

# Turbulence seat 01 sound: voice (AI, m5) up front, Floating Cities (Matthew's music pick, CC BY 4.0) ducked under
# speech, and soft sounds with a visible cause, timed from the same words as the picture (src/words.json; the cue
# offsets mirror src/timeline.ts). CC0 library (library/sfx) + synthesized noise only (labelled 'syn:').
# usage: python3 mix.py [music_dB] [stem]
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
W = json.load(open(f'{HERE}/../src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
def cue(p, nth=0):
    ps = [norm(x) for x in p.split()]; hits = [W[i]['s'] for i in range(len(W) - len(ps) + 1) if all(norm(W[i + j]['w']) == ps[j] for j in range(len(ps)))]
    return hits[nth]
VO_END = W[-1]['e']; T = VO_END + 2.2   # = DUR_S in timeline.ts
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
bump, rocks, belt = cue('Same bump.'), cue('rocks,'), cue('seatbelt')
CUES = [
 (0.0, 'syn:pink', f'atrim=0:3.5,highpass=f=120,lowpass=f=700,afade=t=in:d=0.4,afade=t=out:st=2.8:d=0.7', -27, 'wind outside the plane'),
 (1.35, f'{L}/impact-deep.flac', 'lowpass=f=600', -24, 'the jolt'),
 (3.15, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -21, 'through the window'),
 (3.6, 'syn:brown', f'atrim=0:{cue("Front.") - 3.2},lowpass=f=160,afade=t=in:d=0.3,afade=t=out:st={cue("Front.") - 4.2}:d=0.8', -24, 'cabin hum'),
 (cue('watch') + 0.5, f'{L}/whoosh-deep.flac', 'lowpass=f=1400,asetrate=48000*0.85,aresample=48000', -23, 'up through the roof, hull turns to glass'),
 (cue('Front.') + 0.05, f'{L}/pop-soft.flac', 'lowpass=f=2200', -24, 'front cup lands'),
 (cue('Middle. Back.') + 0.05, f'{L}/pop-soft.flac', 'asetrate=48000*1.12,aresample=48000,lowpass=f=2200', -24, 'middle cup lands'),
 (cue('Back. Same') + 0.05, f'{L}/pop-soft.flac', 'asetrate=48000*1.25,aresample=48000,lowpass=f=2200', -24, 'back cup lands'),
 (bump, 'syn:brown', 'atrim=0:1.8,lowpass=f=90,afade=t=in:d=0.25,afade=t=out:st=0.8:d=1.0', -14, 'the bump: air rolls under the plane'),
 (bump + 0.3, f'{L}/water-plunge.flac', 'lowpass=f=2400,afade=t=out:st=1.0:d=0.8', -23, 'the back cup spills'),
 (rocks - 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=900,asetrate=48000*0.75,aresample=48000', -25, 'nose up'),
 (rocks + 1.1, f'{L}/whoosh-deep.flac', 'lowpass=f=900,asetrate=48000*0.7,aresample=48000', -25, 'nose down'),
 (cue('balanced,') - 1.0, 'syn:brown', 'atrim=0:1.6,lowpass=f=120,afade=t=in:d=0.6,afade=t=out:st=0.8:d=0.8', -22, 'the wedge rises from the clouds'),
 (cue('back rows') + 0.6, f'{L}/whoosh-deep.flac', 'lowpass=f=1200', -24, 'crane up to the seat map'),
 (cue('Book') + 0.5, f'{L}/whoosh-deep.flac', 'lowpass=f=1500', -22, 'dive into the wing row'),
 (cue('Book') + 1.3, 'syn:brown', f'atrim=0:{T - cue("Book") - 2.5},lowpass=f=160,afade=t=in:d=0.4,afade=t=out:st={T - cue("Book") - 3.3}:d=0.8', -24, 'cabin hum'),
 (belt + 0.28, f'{L}/padlock-close.flac', 'lowpass=f=2500', -22, 'seatbelt clicks shut'),
 (T - 1.4, f'{L}/whoosh-deep.flac', 'lowpass=f=1800', -21, 'out through the window'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=6:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
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

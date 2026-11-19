# s4 Sinkhole sound: voice (AI, m5) up front, Floating Cities (series song, CC BY 4.0) ducked under speech, and soft
# sounds with a visible cause, timed from the same words as the picture (src/words.json; cue offsets mirror
# src/timeline.ts). CC0 library (library/sfx/cstack-cc0) + synthesized noise only (labelled 'syn:').
# usage: python3 mix.py [music_dB] [stem]
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
W = json.load(open(f'{HERE}/../src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
def cue(p, nth=0):
    ps = [norm(x) for x in p.split()]; hits = [W[i]['s'] for i in range(len(W) - len(ps) + 1) if all(norm(W[i + j]['w']) == ps[j] for j in range(len(ps)))]
    return hits[nth]
VO_END = W[-1]['e']; T = VO_END + 2.2   # = DUR_S in timeline.ts
ROOT = '/home/user/video-editor'
L = f'{ROOT}/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = f'{ROOT}/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 7.5
STEM = len(sys.argv) > 2
B = dict(underneath=cue('But underneath,'), rain=cue('It starts'), soaks=cue('Rain soaks'), acid=cue('weak acid.'), deep=cue('Under the dirt,'),
         limestone=cue('into limestone,'), cave=cue('cracks and holes.'), clay=cue('The sticky'), arch=cue('an arch,'), grains=cue('But bit'),
         crumbles=cue('crumbles down'), climbs=cue('climbs upward.'), upTop=cue('Up top,'), until=cue('Until the'), thin=cue('too thin'),
         drops=cue('drops all'), why=cue("That's why"), overnight=cue('overnight.'), years=cue('for months,'))
CUT_DRONE = B['why'] - 0.12   # = CUT_DRONE in timeline.ts
WP = 0.55   # whoosh-deep peaks 0.55 s into the file
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
park = B['upTop'] + 1.4
CUES = [
 (0.0, 'syn:pink', f'atrim=0:{T},highpass=f=150,lowpass=f=600,afade=t=in:d=0.5,afade=t=out:st={T - 1.5}:d=1.5', -31, 'outdoor wind bed (whole film)'),
 (0.0, 'syn:brown', 'atrim=0:3.2,lowpass=f=300,afade=t=in:d=0.6,afade=t=out:st=2.2:d=1.0', -27, 'the sedan passes'),
 (B['underneath'] - 0.1, f'{L}/whoosh-fast.flac', lo(3000), -24, 'the scan line sweeps the ground away'),
 (B['underneath'] + 0.1, 'syn:brown', 'atrim=0:1.8,lowpass=f=120,afade=t=in:d=0.3,afade=t=out:st=0.8:d=1.0', -22, 'the ground opens: low rumble'),
 (B['rain'] - 0.3, f'{L}/whoosh-deep.flac', f'{lo(1200)},areverse', -27, 'time rewinds, the hole fills back in'),
 (B['rain'] - 0.1, 'syn:white', f'atrim=0:{B["cave"] - B["rain"] + 1.0},highpass=f=1200,lowpass=f=6000,afade=t=in:d=0.8,afade=t=out:st={B["cave"] - B["rain"]}:d=1.0', -31, 'rain'),
 (B['soaks'] + 0.6, f'{L}/bubbles-burst.flac', f'{lo(2500)},{pitch(1.2)}', -32, 'drops soak in (CO2 motes)'),
 (B['acid'] - 0.1, f'{L}/pop-soft.flac', lo(2400), -24, '"CO2 + water = weak acid" tag'),
 (B['limestone'] - 0.2, f'{L}/bubbles-burst.flac', f'{lo(1800)},{pitch(0.7)}', -30, 'acid eats the limestone (fizz)'),
 (B['cave'], f'{L}/underwater-deep.flac', f'{lo(900)},atrim=0:2.5,afade=t=in:d=0.6,afade=t=out:st=1.5:d=1.0', -32, 'cracks and holes open'),
 (B['arch'] - 0.4, f'{L}/glass-ting.flac', f'{lo(2800)},afade=t=out:st=0.8:d=1.2', -30, 'the arch blocks appear'),
 (B['grains'] - 0.1, f'{L}/tile-clicks.flac', f'{lo(1600)},{pitch(0.8)},afade=t=in:d=0.4', -31, 'grains crumble from the ceiling'),
 (B['crumbles'], 'syn:pink', f'atrim=0:{B["thin"] - B["crumbles"]},highpass=f=900,lowpass=f=3500,afade=t=in:d=0.6,afade=t=out:st={B["thin"] - B["crumbles"] - 0.8}:d=0.8', -35, 'trickling sand hiss'),
 (park - 1.9, 'syn:brown', 'atrim=0:2.2,lowpass=f=280,afade=t=in:d=0.8,afade=t=out:st=1.2:d=1.0', -27, 'the sedan rolls in and parks'),
 (B['until'] + 0.2, f'{L}/ship-creak.flac', f'{lo(1500)},atrim=0:1.4,afade=t=out:st=0.9:d=0.5', -26, 'the roof creaks, cracks spread'),
 (B['drops'] - 0.05, f'{L}/impact-deep.flac', lo(700), -19, 'the plug gives way'),
 (B['drops'] + 1.3, f'{L}/impact-deep.flac', f'{lo(500)},{pitch(0.8)}', -17, 'the plug and car hit the bottom'),
 (B['drops'], 'syn:brown', 'atrim=0:3.0,lowpass=f=150,afade=t=in:d=0.05,afade=t=out:st=1.2:d=1.8', -17, 'collapse rumble'),
 (B['drops'] + 1.3, 'syn:pink', 'atrim=0:2.5,highpass=f=300,lowpass=f=2000,afade=t=in:d=0.05,afade=t=out:st=0.6:d=1.9', -27, 'debris and dust'),
 (CUT_DRONE - WP, f'{L}/whoosh-deep.flac', lo(1600), -24, 'cut to the drone view'),
 (B['overnight'] - 0.1, f'{L}/pop-soft.flac', f'{lo(2400)},{pitch(0.8)}', -25, 'the bar appears'),
 (B['years'] - 0.4, f'{L}/whoosh-fast.flac', f'{lo(1500)},{pitch(0.6)}', -30, 'years fill the bar'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 1.8}:d=1.8,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=60:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
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

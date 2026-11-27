# How a suspension bridge stays up: voice (AI, r3-m07, Broadcast library) up front, "Beauty Flow" (Kevin MacLeod,
# CC BY 4.0) ducked under speech, and soft sounds with a visible cause, timed from the same words as the picture
# (src/words.json; cut times mirror src/timeline.ts CUT). CC0 library (library/sfx/cstack-cc0) + synthesized noise
# beds only (labelled 'syn:').
# usage: python3 sound/mix.py [music_dB] [stem]   (from film/) -> sound/work/mix.wav, sound/cues.json
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
W = json.load(open(f'{HERE}/../src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
def cue(p, nth=0):
    ps = [norm(x) for x in p.split()]; hits = [W[i]['s'] for i in range(len(W) - len(ps) + 1) if all(norm(W[i + j]['w']) == ps[j] for j in range(len(ps)))]
    return hits[nth]
def cue_end(p, nth=0):
    s = cue(p, nth); i = [w['s'] for w in W].index(s); return W[i + len(p.split()) - 1]['e']
VO_END = W[-1]['e']; T = VO_END + 1.4   # = DUR_S in timeline.ts
ROOT = '/home/user/video-editor'
L = f'{ROOT}/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = f'{HERE}/src/beauty-flow.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 5
STEM = len(sys.argv) > 2
B = dict(flat=cue('A flat road'), sag=cue('sag and break.'), brk=cue('break.'), so=cue('So the road'), hangs=cue('It hangs.'),
         rows=cue('Rows of'), they=cue('They hang'), steel=cue('Steel cable'), tension=cue('That pull is tension.'), run=cue('The main cables run'),
         towers=cue('The towers get'), down=cue('straight down.'), each=cue('At each end,'), anchors=cue('concrete anchors'), gg=cue('Each Golden Gate'),
         num=cue('27,572'), wires=cue('steel wires.'), rHang=cue('The road hangs,'), rPull=cue('the cables pull,'), rPush=cue('the towers push,'),
         rHold=cue('the anchors hold'), why=cue("That's why"))
pre = 0.08
CUT = {k: B[k] - pre for k in ('flat', 'so', 'rows', 'they', 'steel', 'run', 'towers', 'each', 'gg', 'rHang')}
WP = 0.55   # whoosh-deep peaks 0.55 s into the file: start it that much before a cut
lo = lambda f: f'lowpass=f={f}'
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
def bed(t0, t1, src, flt, g, note):
    return (t0, src, f'atrim=0:{t1 - t0},{flt},afade=t=in:d=0.4,afade=t=out:st={t1 - t0 - 0.4}:d=0.4', g, note)
CUES = [
 bed(0, T, f'{L}/ocean-surface.flac', 'highpass=f=120,lowpass=f=2500', -33, 'water under the bridge: bed'),
 bed(0, T, 'syn:pink', 'highpass=f=200,lowpass=f=900', -36, 'wind at height: bed'),
 (0.0, f'{L}/whoosh-fast.flac', f'{lo(1800)},{pitch(0.85)}', -29, 'the camera races along the span'),
 (1.2, f'{L}/ship-horn-distant.flac', f'{lo(1500)},afade=t=out:st=2.0:d=1.0', -34, 'the strait: a ship far off'),
 (CUT['flat'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -26, 'cut: the whole bridge from above'),
 (B['flat'] + 1.0, f'{L}/ship-creak.flac', f'{lo(1800)},{pitch(0.8)},atrim=0:2.0,afade=t=out:st=1.4:d=0.6', -22, 'the bare road groans as it sags'),
 (B['brk'] - 0.05, f'{L}/impact-deep.flac', lo(1400), -18, 'the road breaks at mid-span'),
 (B['so'] - 0.1, f'{L}/whoosh-fast.flac', f'{lo(1400)},areverse,{pitch(0.9)}', -28, 'rewind: the road snaps back'),
 (B['hangs'] - 0.5, f'{L}/rope-or-cable-winch.flac', f'{lo(2200)},atrim=0:0.8,afade=t=out:st=0.5:d=0.3', -27, 'hangers drop from the cables'),
 (B['hangs'] + 0.15, f'{L}/padlock-close.flac', lo(2400), -27, 'they catch the road'),
 (CUT['rows'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -27, 'cut: on the deck'),
 (CUT['rows'] + 0.3, f'{L}/whoosh-fast.flac', f'{lo(900)},{pitch(0.7)}', -31, 'a car passes'),
 (B['steel'] + 0.2, f'{L}/rope-or-cable-winch.flac', f'{lo(1800)},atrim=0:1.2,{pitch(0.85)},afade=t=out:st=0.8:d=0.4', -29, 'pull runs up the cables'),
 (B['tension'] + 0.4, f'{L}/glass-ting.flac', f'{lo(3200)},afade=t=out:st=0.6:d=1.0', -30, '"TENSION" lands'),
 (CUT['run'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -26, 'cut: the tower top'),
 (B['down'] - 0.1, f'{L}/impact-deep.flac', f'{lo(900)},{pitch(0.8)}', -24, 'the push goes down the tower'),
 (CUT['each'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -26, 'cut: the anchorage'),
 (B['anchors'] + 0.1, f'{L}/vault-clank.flac', lo(1800), -25, 'the anchor holds'),
 (CUT['gg'] - WP, f'{L}/whoosh-deep.flac', lo(1800), -25, 'the cable piece slides out'),
 (B['num'], f'{L}/tile-clicks.flac', f'{lo(2600)},atrim=0:{B["wires"] - B["num"] + 0.3},afade=t=out:st={B["wires"] - B["num"]}:d=0.3', -31, 'the wire ends light up'),
 (CUT['rHang'] - WP, f'{L}/whoosh-deep.flac', lo(1600), -26, 'cut: the whole bridge'),
 *[(B[k] + 0.15, f'{L}/glass-ting.flac', f'{lo(3200)},{pitch(1 + 0.06 * i)},afade=t=out:st=0.5:d=0.8', -32, f'recap part {i + 1} lights') for i, k in enumerate(('rHang', 'rPull', 'rPush', 'rHold'))],
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=50:seed={i + 3}'] if src.startswith('syn:') else ['-i', src]
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

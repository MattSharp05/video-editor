# Lactate run 01 sound: voice up front (raw take, one static gain), Floating Cities (Kevin MacLeod, CC BY 4.0) ducked
# gently by phrase, and quiet dark-warm effects with a visible cause, timed from beats.json (same formulas as world.ts T).
# CC0 library (library/sfx/cstack-cc0) + synthesized only.  usage: python3 sound/mix.py [music_db] [stems]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
B = json.load(open(f'{HERE}/../src/beats.json')); TT = B['total']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
T = dict(in1=B['e0'] + 0.08, rip=B['l1'] + 0.05, burst=B['fuel'] + 0.32, out1=B['heart'] - 0.32, in2=B['why'] + 0.8, out2=B['slow'] + 0.72)
lp = lambda f: f'lowpass=f={f}'
def seg(d, fi=0.05, fo=0.2): return f'atrim=0:{d},afade=t=in:d={fi},afade=t=out:st={max(0, d - fo)}:d={fo}'
CUES = [  # (time, source, filter, gain dB, visible cause)
 (0.0, 'syn:pink', f'{seg(T["in1"] + 0.3, 0.6, 0.6)},{lp(700)},highpass=f=120', -30, 'air on the dusk track'),
 (0.9, 'syn:buzz', f'{seg(T["in1"] - 0.7, 0.4, 0.4)},bandpass=f=400:w=300,tremolo=f=11:d=0.6', -40, 'flies round the trash bag'),
 (T['in1'] - 0.45, f'{L}/whoosh-deep.flac', lp(1600), -20, 'pass through the glass thigh'),
 (T['in1'], f'{L}/underwater-deep.flac', f'{seg(T["out1"] - T["in1"] + 0.4, 0.5, 0.6)},{lp(500)}', -26, 'inside the muscle (bed)'),
 (T['rip'], 'syn:white', f'{seg(0.32, 0.01, 0.2)},bandpass=f=1800:w=1400', -30, 'the bag rips'),
 (T['rip'] + 0.15, 'syn:brown', f'{seg(1.2, 0.5, 0.5)},{lp(160)}', -14, 'the amber drop swells'),
 (T['burst'], f'{L}/whoosh-fast.flac', f'{lp(2400)},volume=1', -24, 'the drop zips along the lane'),
 (B['sugar'] - 0.14, f'{L}/pop-soft.flac', lp(3000), -20, 'hero cube snaps'),
 (B['engines'] + 0.62, f'{L}/bubbles-burst.flac', f'{seg(0.7, 0.01, 0.3)},{lp(1800)}', -26, 'halves burned: engine puffs'),
 (B['runhard'] + 0.3, f'{L}/electrical-hum.flac', f'{seg(B["lactate"] - B["runhard"] + 0.4, 1.2, 0.8)},{lp(900)}', -30, 'engines flat out'),
 (B['superfast'] - 0.2, 'syn:brown', f'{seg(2.2, 0.8, 0.8)},{lp(120)}', -16, 'firehose of sugar'),
 (B['lactate'] + 0.1, 'syn:pink', f'{seg(1.4, 0.4, 0.8)},bandpass=f=900:w=600', -32, 'colour wave: heaps turn amber'),
 (B['spills'] - 0.2, f'{L}/water-plunge.flac', f'{seg(1.2, 0.02, 0.6)},{lp(1200)}', -24, 'lanterns drop into the blood'),
 (T['out1'] - 0.4, f'{L}/whoosh-deep.flac', f'{lp(1400)},areverse', -21, 'pull out to the glass body'),
 (B['heart'] + 0.15, f'{L}/impact-deep.flac', f'{seg(0.6, 0.01, 0.3)},{lp(300)}', -14, 'the heart gulps'),
 (B['brain'], f'{L}/pop-soft.flac', f'{lp(2200)},asetrate=48000*1.2,aresample=48000', -24, 'the brain sips (sparkle)'),
 (B['muscles'], f'{L}/pop-soft.flac', f'{lp(1800)},asetrate=48000*0.85,aresample=48000', -23, 'the arm catches one'),
 (T['in2'] - 0.45, f'{L}/whoosh-deep.flac', lp(1600), -20, 'dive back into the thigh'),
 (T['in2'], f'{L}/underwater-deep.flac', f'{seg(T["out2"] - T["in2"] + 0.4, 0.5, 0.6)},{lp(500)}', -26, 'inside the muscle (bed)'),
 (B['why'] + 1.3, f'{L}/electric-spark-crackle.flac', f'{seg(T["out2"] - B["why"] - 1.4, 0.6, 0.8)},{lp(2500)}', -34, 'acid sprites sizzle'),
 (B['together'], 'syn:brown', f'{seg(1.6, 0.3, 1.0)},{lp(90)}', -16, 'strands squeeze slower'),
 (T['out2'] - 0.4, f'{L}/whoosh-deep.flac', f'{lp(1400)},areverse', -21, 'out to the track'),
 (T['out2'] + 0.3, 'syn:pink', f'{seg(TT - T["out2"] - 0.3, 0.8, 2.0)},{lp(700)},highpass=f=120', -31, 'air on the track'),
 (B['threshold'] - 0.2, f'{L}/impact-deep.flac', f'{seg(0.8, 0.01, 0.4)},{lp(400)}', -16, 'the flag plants'),
 (B['training'] - 0.1, f'{L}/whoosh-deep.flac', f'{lp(900)},asetrate=48000*0.6,aresample=48000', -22, 'days sweep past'),
] + [(B['grow'] + 0.1 + 0.27 * k, f'{L}/pop-soft.flac', f'{lp(2600)},asetrate=48000*{0.8 + 0.08 * k:.2f},aresample=48000', -26, 'engines pop like popcorn') for k in range(5)] + [
 (B['trash'] - 0.05, f'{L}/impact-deep.flac', f'{seg(0.7, 0.01, 0.4)},{lp(600)}', -18, 'the bin tips over'),
 (B['fuel2'] + 0.12, f'{L}/pop-soft.flac', lp(2400), -19, 'runner scoops the drop'),
 (B['fuel2'] + 0.3, 'syn:brown', f'{seg(1.6, 0.4, 1.0)},{lp(150)}', -16, 'the body glows gold'),
 (B['fit'] + 0.3, f'{L}/whoosh-fast.flac', lp(1800), -25, 'gold runner pulls away'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={TT}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{TT},afade=t=in:d=1.5,afade=t=out:st={TT - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, g, note) in enumerate(CUES):
    if src == 'syn:buzz': args += ['-f', 'lavfi', '-i', 'aevalsrc=0.4*sin(2*PI*190*t)+0.25*sin(2*PI*380*t+sin(2*PI*7*t)):s=48000:d=5']
    elif src.startswith('syn:'): args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration={TT}:seed={i + 3}']
    else: args += ['-i', src]
for i, (t, src, flt, g, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{TT}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'gain_db': c[3], 'src': os.path.basename(c[1]), 'note': c[4]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
print(len(CUES), 'cues')

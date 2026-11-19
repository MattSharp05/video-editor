# s5 kettle roar sound: voice (AI, m5) up front, Floating Cities (CC BY 4.0) ducked under speech, soft sounds with a
# visible cause. Times from sound/times.json (npx tsx sound/times.mts > sound/times.json), the same numbers as the picture.
# CC0 library (library/sfx/cstack-cc0 = sfx-29..61) + synthesized ('syn:' noise, 'tone:' sine).  usage: python3 mix.py [music_dB] [stem]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
T_ = json.load(open(f'{HERE}/times.json')); T = T_['dur']; g = T_.get
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../../vo/vo.wav'
MUSIC = '/home/user/video-editor/library/music/files/Floating_Cities.mp3'
MUSIC_DB = float(sys.argv[1]) if len(sys.argv) > 1 else 12
STEM = len(sys.argv) > 2
WP_DEEP, WP_FAST = 0.57, 0.08
pitch = lambda k: f'asetrate=48000*{k},aresample=48000'
CUES = [
 (0.0, f'{HERE}/work/roar.wav', 'anull', -12, 'the kettle (synthesized from the picture\'s loudness curve; bed)'),
 (0.0, 'syn:pink', f'atrim=0:{T},bandpass=f=500:w=900,afade=t=in:d=0.3,afade=t=out:st={T - 1.2}:d=1.2', -42, 'kitchen room tone (bed)'),
 (g('jumpFwd') - 0.05, f'{L}/whoosh-fast.flac', f'{pitch(1.5)},highpass=f=600', -28, 'jump forward to the boil'),
 (g('jumpBack') - 0.1, f'{L}/whoosh-fast.flac', f'areverse,{pitch(0.8)},highpass=f=300', -28, 'rewind to the roar'),
 (g('cutX') - WP_DEEP, f'{L}/whoosh-deep.flac', 'lowpass=f=1500', -24, 'cut into the water (macro)'),
 (g('cutX'), f'{L}/underwater-deep.flac', f'atrim=0:{g("cutK2") - g("cutX")},lowpass=f=900,afade=t=in:d=0.4,afade=t=out:st={g("cutK2") - g("cutX") - 0.2}:d=0.2', -30, 'underwater (macro bed)'),
 (g('heroDetach'), f'{L}/pop-soft.flac', f'{pitch(0.6)},lowpass=f=1500', -32, 'the hero bubble lets go'),
 (g('heroGone') - 0.12, f'{L}/pop-soft.flac', f'{pitch(1.6)},highpass=f=800', -22, 'the hero bubble collapses (snap)'),
 (g('heroGone') - 0.12, f'{L}/impact-deep.flac', 'lowpass=f=900,afade=t=out:st=0.4:d=0.4', -32, 'collapse thump'),
 (g('cutK2') - WP_FAST, f'{L}/whoosh-fast.flac', 'lowpass=f=2500', -26, 'pull back to the counter'),
 (g('cutG') - WP_FAST, f'{L}/whoosh-fast.flac', f'{pitch(0.9)},lowpass=f=2500', -28, 'cut to the glass'),
 (g('cutS') - WP_FAST, f'{L}/whoosh-fast.flac', f'{pitch(1.1)},lowpass=f=3000', -28, 'cut to the split'),
 (g('click') + 0.15, f'{L}/relay-click.flac', 'lowpass=f=5000', -20, 'the kettle switch clicks off'),
]
args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', VO, '-i', MUSIC]
fc = [f'[0]aresample=48000,aformat=channel_layouts=stereo,volume=10dB,apad=whole_dur={T}[vo]', '[vo]asplit=2[voA][key]',
      f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5,volume={MUSIC_DB}dB[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700:makeup=1[mduck]']
mix = ['[voA]', '[mduck]']
for i, (t, src, flt, gdb, note) in enumerate(CUES):
    if src.startswith('syn:'): args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration={T + 1}:seed={i + 3}']
    elif src.startswith('tone:'): args += ['-f', 'lavfi', '-i', f'sine=frequency={src[5:]}:sample_rate=48000:duration={T + 1}']
    else: args += ['-i', src]
for i, (t, src, flt, gdb, note) in enumerate(CUES):
    d = int(max(0, t) * 1000)
    fc.append(f'[{i + 2}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={gdb}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{T}[pre]')
fc.append('[pre]loudnorm=I=-14:TP=-2.0:LRA=11[out]')
if STEM:
    subprocess.run(args[:9] + ['-filter_complex', ';'.join(fc[:4]), '-map', '[voA]', f'{HERE}/work/stem_voice.wav', '-map', '[mduck]', f'{HERE}/work/stem_music.wav'], check=True); sys.exit()
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{HERE}/work/mix.wav'], check=True)
json.dump([{'t': round(c[0], 2), 'note': c[4], 'src': c[1].split('/')[-1], 'dB': c[3]} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)
n = len([c for c in CUES if 'bed' not in c[4]])
print(n, 'cues;', round(n / T * 10, 1), 'per 10 s; total', round(T, 2))

# Self-driving 01 sound: one effects stem (CC0 library/sfx/cstack-cc0 + synthesized), then one mix per music track:
# voice up front (+10 dB static), music ducked under speech with its gain SET FROM MEASUREMENT so it sits ~11 dB under
# the voice while it speaks (studio-sound.md), effects, master -14 LUFS / -1.5 dBTP.
# usage: python3 mix.py            -> work/sfx.wav, work/mix_<key>.wav, work/stem_<key>.wav, report.json, cues.json
# Every cue time is a beat from ../film/src/beats.json + an offset (the picture's own numbers).
import json, os, subprocess, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); W = f'{HERE}/work'; os.makedirs(W, exist_ok=True)
B = json.load(open(f'{HERE}/../film/src/beats.json')); T = B['total']
L = '/home/user/video-editor/library/sfx/cstack-cc0'
VO = f'{HERE}/../vo/vo.wav'; WORDS = json.load(open(f'{HERE}/../vo/words.json'))
TRACKS = {  # key: (file, start s)  -- windows chosen from each track's short-term loudness curve
    'signal-to-noise': (f'{HERE}/../music/full/sb-signal-to-noise.mp3', 150.0),
    'computations': (f'{HERE}/../music/full/sb-computations.mp3', 192.0),
    'horizons': (f'{HERE}/../music/full/sb-horizons.mp3', 120.0),
}
CREDITS = {k: f'"{n}" by Scott Buckley – released under CC-BY 4.0. www.scottbuckley.com.au' for k, n in
           [('signal-to-noise', 'Signal to Noise'), ('computations', 'Computations'), ('horizons', 'Horizons')]}
P = lambda k: f'aresample=48000,asetrate=48000*{k},aresample=48000'  # pitch/speed shift by k
# (time s, source, filter, gain dB, note). 'syn:<color>' = anoisesrc; 'sine:<f>' = a sine burst.
CUES = [
 (0.0, f'{L}/city-night.flac', f'atrim=0:{B["y2004"] + 0.6},afade=t=in:d=0.3,afade=t=out:st={B["y2004"] - 0.2}:d=0.8,lowpass=f=3000', -24, 'night street ambience'),
 (B['see_you'] + 0.02, f'{L}/sonar-ping.flac', 'atrim=0:1.6,highpass=f=500,afade=t=out:st=0.9:d=0.7', -21, 'the roof lidar fires one ring'),
 (B['y2004'] + 0.1, f'{L}/whoosh-fast.flac', 'lowpass=f=3500', -16, 'down the centre line out of town'),
 (B['y2004'] + 1.4, 'syn:brown', f'atrim=0:{B["this_year"] - B["y2004"] + 0.2},lowpass=f=500,afade=t=in:d=0.6,afade=t=out:st={B["this_year"] - B["y2004"] - 1.6}:d=1.2', -20, 'desert wind (synthesized)'),
 (B['this_year'] - 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=2000', -18, 'rise over the city'),
 (B['no_wheel'] + 0.5, f'{L}/whoosh-fast.flac', f'{P(0.8)},lowpass=f=3000', -17, 'dive along a light trail to the car'),
 (B['first'] - 0.1, f'{L}/city-night.flac', f'atrim=10:{10 + B["building"] - B["first"] + 0.8},asetpts=PTS-STARTPTS,afade=t=in:d=0.6,afade=t=out:st={B["building"] - B["first"] - 0.2}:d=1.0,lowpass=f=3000', -25, 'back on the street'),
 (B['fires'] + 0.05, 'sine:2400', 'atrim=0:0.09,afade=t=out:st=0.02:d=0.07', -26, 'laser pulse leaves the dome (synthesized)'),
 (B['building'], f'{L}/tile-clicks.flac', 'atrim=0:1.6,highpass=f=1200,afade=t=in:d=0.3,afade=t=out:st=1.0:d=0.6', -27, 'the sweep fills the street with points'),
 (B['radar'] + 0.05, f'{L}/sonar-ping.flac', f'{P(0.7)},atrim=0:1.5,lowpass=f=1800,afade=t=out:st=0.8:d=0.7', -20, 'radar shell rolls out'),
 (B['rain'] - 0.6, 'syn:pink', f'atrim=0:{B["sim"] - B["rain"] + 1.2},highpass=f=1800,lowpass=f=9000,afade=t=in:d=1.0,afade=t=out:st={B["sim"] - B["rain"] - 0.2}:d=1.2', -33, 'rain (synthesized)'),
 (B['cameras'] + 0.05, f'{L}/dslr-shutter.flac', 'lowpass=f=4000', -24, 'the windscreen camera looks'),
 (B['people'], f'{L}/glass-ting.flac', 'lowpass=f=5000,afade=t=out:st=0.6:d=0.5', -28, 'your ghosts appear'),
 (B['plans'] + 0.7, f'{L}/pop-soft.flac', 'lowpass=f=3500', -22, 'ghost cars pop'),
 (B['path'], f'{L}/glass-ting.flac', f'{P(0.84)},lowpass=f=4000', -24, 'the green plan locks'),
 (B['again1'] + 0.45, f'{L}/pop-soft.flac', f'{P(1.12)},lowpass=f=3500', -23, 'replan: pops'),
 (B['again2'] + 0.45, f'{L}/pop-soft.flac', f'{P(1.26)},lowpass=f=3500', -24, 'replan: pops'),
 (B['sim'] - 0.1, f'{L}/whoosh-deep.flac', 'lowpass=f=2000', -18, 'rise to the practice tiles'),
 (B['tesla'] - 0.2, f'{L}/whoosh-fast.flac', f'{P(0.85)},lowpass=f=3000', -17, 'dive to the Tesla'),
 (B['cams_only'], f'{L}/relay-click.flac', 'lowpass=f=4000', -24, 'eight cameras open'),
 (B['one_net'], f'{L}/electrical-hum.flac', 'atrim=0:2.4,lowpass=f=1500,afade=t=in:d=0.4,afade=t=out:st=1.6:d=0.8', -28, 'the network knot hums'),
 (B['turns'] + 0.1, f'{L}/servo-arm.flac', 'lowpass=f=3500', -24, 'the beam turns the wheel'),
 (B['cracked'] - 0.05, f'{L}/whoosh-deep.flac', f'{P(0.8)},lowpass=f=1800', -16, 'rise to the whole country'),
 (B['cities'] + 0.05, f'{L}/glass-ting.flac', f'{P(1.4)},lowpass=f=6000', -26, 'fifteen cities light up'),
 (B['a_car'] - 0.6, f'{L}/whoosh-fast.flac', f'{P(0.75)},lowpass=f=3000', -16, 'dive back into the city'),
 (B['sees'] - 0.4, f'{L}/city-night.flac', f'atrim=20:{20 + T - B["sees"] + 0.4},asetpts=PTS-STARTPTS,afade=t=in:d=0.6,afade=t=out:st={T - B["sees"] - 1.4}:d=1.6,lowpass=f=3000', -25, 'back at the crosswalk'),
 (B['sees'] + 0.02, f'{L}/sonar-ping.flac', 'atrim=0:1.6,highpass=f=500,afade=t=out:st=0.9:d=0.7', -21, 'the ring finds you'),
 (B['drives'], f'{L}/glass-ting.flac', f'{P(0.84)},lowpass=f=4000', -24, 'the green path bends around you'),
]

def run(a): subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', *a], check=True)
def lufs(f):
    o = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = o[o.rindex('Summary:'):]
    g = lambda k: float(s.split(k)[1].split()[0])
    return g('I:'), g('Peak:')
def pcm(f):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768

# ---- effects stem ----
args, fc, mix = [], [], []
for i, (t, src, flt, g, note) in enumerate(CUES):
    if src.startswith('syn:'): args += ['-f', 'lavfi', '-i', f'anoisesrc=color={src[4:]}:sample_rate=48000:duration=20:seed={i + 3}']
    elif src.startswith('sine:'): args += ['-f', 'lavfi', '-i', f'sine=frequency={src[5:]}:sample_rate=48000:duration=1']
    else: args += ['-i', src]
    d = int(t * 1000)
    fc.append(f'[{i}]aresample=48000,aformat=channel_layouts=stereo,{flt},volume={g}dB,adelay={d}|{d}[c{i}]'); mix.append(f'[c{i}]')
fc.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=longest,apad=whole_dur={T},atrim=0:{T}[out]')
run([*args, '-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', f'{W}/sfx.wav'])
json.dump([{'t': round(c[0], 2), 'note': c[4], 'source': os.path.basename(c[1]) if '/' in c[1] else c[1] + ' (synthesized)'} for c in CUES], open(f'{HERE}/cues.json', 'w'), indent=1)

# speech mask (1 where a word is spoken, gaps < 0.25 s merged), for measuring the voice-to-music gap
sr = 16000; mask = np.zeros(int(T * sr), bool)
for w in WORDS: mask[int(w['s'] * sr): int((w['e'] + 0.12) * sr)] = True
def db(x): return float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9))
def stems(key, gain):
    f, st = TRACKS[key]
    VOF = f'[0]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,volume=10dB,apad=whole_dur={T},atrim=0:{T}'
    MUS = f'[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{T},asetpts=PTS-STARTPTS,volume={gain}dB,afade=t=in:d=1.5,afade=t=out:st={T - 2.5}:d=2.5'
    DUCK = 'sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700'
    run(['-i', VO, '-ss', str(st), '-i', f, '-i', f'{W}/sfx.wav', '-filter_complex',
         f'{VOF},asplit=3[vo][key][vs];{MUS}[m];[m][key]{DUCK}[md];[md]asplit=2[mdA][mdB];[vo][mdA][2]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]',
         '-map', '[out]', '-ar', '48000', f'{W}/mix_{key}.wav', '-map', '[mdB]', '-ar', '48000', f'{W}/stem_{key}.wav', '-map', '[vs]', '-ar', '48000', f'{W}/voice_stem.wav'])
    v, m = pcm(f'{W}/voice_stem.wav'), pcm(f'{W}/stem_{key}.wav'); n = min(len(v), len(m), len(mask))
    sp = mask[:n]; return db(v[:n][sp]) - db(m[:n][sp]), db(m[:n][~sp]) - db(m[:n][sp])

report = {}
for key in TRACKS:
    gain = 0.0
    for _ in range(3):  # set the music gain from measurement: target 11 dB under the voice while it speaks
        gap, lift = stems(key, gain)
        if abs(gap - 11) < 0.4: break
        gain += gap - 11
    I, pk = lufs(f'{W}/mix_{key}.wav')
    report[key] = dict(start_s=TRACKS[key][1], music_gain_db=round(gain, 1), voice_over_music_db=round(gap, 1), music_rise_in_pauses_db=round(lift, 1),
                       mix_lufs=I, mix_peak_dbfs=pk, credit=CREDITS[key])
    print(key, report[key], flush=True)
json.dump(dict(cues=len(CUES), cues_per_10s=round(len(CUES) / T * 10, 1), tracks=report), open(f'{HERE}/report.json', 'w'), indent=1)
print(len(CUES), 'cues;', round(len(CUES) / T * 10, 1), 'per 10 s')

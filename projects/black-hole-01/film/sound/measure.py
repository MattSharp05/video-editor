# Voice vs ducked music: level while he speaks and in the pauses (dB, RMS over 50 ms windows). python3 measure.py
import numpy as np, soundfile as sf, os
W = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'work')
v, sr = sf.read(f'{W}/stem_voice.wav'); m, _ = sf.read(f'{W}/stem_music.wav')
v = v.mean(1) if v.ndim > 1 else v; m = m.mean(1) if m.ndim > 1 else m; n = min(len(v), len(m)); hop = int(sr * 0.05)
rv = np.array([np.sqrt(np.mean(v[i:i + hop] ** 2)) for i in range(0, n - hop, hop)]); rm = np.array([np.sqrt(np.mean(m[i:i + hop] ** 2)) for i in range(0, n - hop, hop)])
db = lambda x: 20 * np.log10(np.mean(x) + 1e-9)
speech = rv > rv.max() * 0.1
print(f'voice in speech {db(rv[speech]):.1f} dB | music in speech {db(rm[speech]):.1f} dB (gap {db(rv[speech]) - db(rm[speech]):.1f}) | music in pauses {db(rm[~speech]):.1f} dB')

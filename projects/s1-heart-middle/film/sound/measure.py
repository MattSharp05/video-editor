# Voice-to-music gap during speech (words from src/words.json), from the stems mix.py writes with `stem`.
import json, numpy as np, soundfile as sf, os
H = os.path.dirname(os.path.abspath(__file__)); W = json.load(open(f'{H}/../src/words.json'))
v, sr = sf.read(f'{H}/work/stem_voice.wav'); m, _ = sf.read(f'{H}/work/stem_music.wav')
mask = np.zeros(len(v), bool)
for w in W: mask[int(w['s'] * sr):int(w['e'] * sr)] = True
db = lambda x: 10 * np.log10(np.mean(x[mask] ** 2) + 1e-12)
print('voice', round(db(v), 1), 'music', round(db(m), 1), 'gap in speech', round(db(v) - db(m), 1), 'dB')

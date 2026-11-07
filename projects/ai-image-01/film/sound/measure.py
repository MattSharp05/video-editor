# Music level under speech vs in the pauses, from the stems (mix.py <db> stems), using words.json for speech windows.
import json, numpy as np, soundfile as sf
v, sr = sf.read('sound/work/stem_voice.wav'); m, _ = sf.read('sound/work/stem_music.wav')
W = json.load(open('src/words.json')); n = min(len(v), len(m)); sp = np.zeros(n, bool)
for w in W: sp[int(w['s'] * sr):int(w['e'] * sr)] = True
db = lambda x: 10 * np.log10(np.mean(x ** 2) + 1e-12)
print(f"voice in speech {db(v[:n][sp]):.1f} dB | music in speech {db(m[:n][sp]):.1f} dB (gap {db(v[:n][sp]) - db(m[:n][sp]):.1f}) | music in pauses {db(m[:n][~sp]):.1f} dB")

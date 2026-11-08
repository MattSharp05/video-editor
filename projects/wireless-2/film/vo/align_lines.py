# Word timings line by line (whole-file whisper hallucinated at the start): cut vo.wav at line_starts.json, transcribe
# each line with faster-whisper (small.en, word timestamps), offset, compare with lines.json. Writes words.json.
import json, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
L = json.load(open('lines.json')); S = json.load(open('line_starts.json'))
y, sr = sf.read('vo.wav', dtype='float32'); assert sr == 24000
from scipy.signal import resample_poly
m = WhisperModel('small.en', compute_type='int8'); W = []
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
for i, line in enumerate(L):
    a = max(0, S[i] - 0.1); b = S[i + 1] - 0.05 if i + 1 < len(S) else len(y) / sr
    seg = resample_poly(y[int(a * sr):int(b * sr)], 2, 3).astype(np.float32)
    segs, _ = m.transcribe(seg, word_timestamps=True, initial_prompt=line, language='en')
    ws = [{'w': w.word.strip(), 's': round(a + w.start, 3), 'e': round(a + w.end, 3)} for s in segs for w in s.words]
    heard = [norm(w['w']) for w in ws]; want = [norm(x) for x in line.split()]
    print(i, 'MATCH' if heard == want else f'DIFF heard={heard}')
    W += ws
json.dump(W, open('words.json', 'w'), indent=0)
print(len(W), 'words; last end', W[-1]['e'])

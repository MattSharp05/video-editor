# Word timings per line (faster-whisper small.en on each line's own slice of vo.wav, offset by line_starts.json):
# whole-file transcription dropped the first 29 s on this take. Writes words.json; prints DIFF lines vs lines.json.
# usage: python align_lines.py   (from vo/, after assemble.py)
import json, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
L = json.load(open('lines.json')); S = json.load(open('line_starts.json'))
x, sr = sf.read('vo.wav', dtype='float32')
import scipy.signal as ss
m = WhisperModel('small.en', compute_type='int8')
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
W = []
for i, line in enumerate(L):
    a = int(S[i] * sr); b = int(S[i + 1] * sr) if i + 1 < len(S) else len(x)
    seg = ss.resample_poly(x[a:b], 2, 3).astype(np.float32)   # 24 kHz -> 16 kHz
    segs, _ = m.transcribe(seg, word_timestamps=True, initial_prompt=line, language='en')
    ws = [{'w': w.word.strip(), 's': round(S[i] + w.start, 3), 'e': round(S[i] + w.end, 3)} for s in segs for w in s.words]
    said = [norm(w['w']) for w in ws]; want = [norm(t) for t in line.split()]
    print(i, 'MATCH' if said == want else f'DIFF heard: {" ".join(said)}')
    W += ws
json.dump(W, open('words.json', 'w'), indent=0)

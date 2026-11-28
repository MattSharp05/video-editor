# Trim each cloned line, join with pauses (a long one before the answer: the pause-and-guess beat), write vo.wav and
# line_starts.json; then word timings with faster-whisper into ../film/src/words.json.
import json, numpy as np, soundfile as sf
SR = 24000
GAP = [0, 0.4, 0.45, 1.5, 0.55, 0.4, 0.45, 0.5]   # pause before line i (1.5 s: time to guess)
out, starts, t = [np.zeros(int(0.3 * SR), np.float32)], [], 0.3
for i in range(len(GAP)):
    x, sr = sf.read(f'line_{i:02d}.wav', dtype='float32'); assert sr == SR
    hop = 240; env = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
    on = np.where(20 * np.log10(env + 1e-9) > -42)[0]; a, b = max(0, on[0] * hop - 600), min(len(x), (on[-1] + 1) * hop + 2400)
    if i: out.append(np.zeros(int(GAP[i] * SR), np.float32)); t += GAP[i]
    starts.append(round(t, 3)); seg = x[a:b]; out.append(seg); t += len(seg) / SR
out.append(np.zeros(int(1.5 * SR), np.float32))
y = np.concatenate(out); sf.write('vo.wav', y, SR)
json.dump(starts, open('line_starts.json', 'w')); print('total', round(len(y) / SR, 2), 'starts', starts)
from faster_whisper import WhisperModel
import subprocess
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'vo.wav', '-ar', '16000', '-ac', '1', 'vo16.wav'], check=True)
m = WhisperModel('small.en', compute_type='int8')
a16, _ = sf.read('vo16.wav', dtype='float32')
segs, _ = m.transcribe(a16, word_timestamps=True, initial_prompt=' '.join(json.load(open('lines.json'))))
W = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
json.dump(W, open('words.json', 'w')); print(' '.join(w['w'] for w in W))

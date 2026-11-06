# Trim each generated line, join with pauses (longer at the turns of the chain), write vo.wav (24 kHz mono)
# and the per-line start times; then transcribe with word timestamps (faster-whisper) into words.json.
import json, subprocess, numpy as np, soundfile as sf
SR = 24000
GAP = [0, 0.3, 0.35, 0.5, 0.35, 0.4, 0.45, 0.45, 0.45, 0.55]   # pause before line i (longer at the turns)
out, starts, t = [], [], 0.25
out.append(np.zeros(int(0.25 * SR), np.float32))
for i in range(len(GAP)):
    x, sr = sf.read(f'line_{i:02d}.wav', dtype='float32'); assert sr == SR
    hop = 240; env = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
    on = np.where(20 * np.log10(env + 1e-9) > -42)[0]; a, b = max(0, on[0] * hop - 600), min(len(x), (on[-1] + 1) * hop + 2400)
    if i: out.append(np.zeros(int(GAP[i] * SR), np.float32)); t += GAP[i]
    starts.append(round(t, 3)); seg = x[a:b]; out.append(seg); t += len(seg) / SR
out.append(np.zeros(int(1.2 * SR), np.float32))
y = np.concatenate(out); sf.write('vo.wav', y, SR)
json.dump(starts, open('line_starts.json', 'w')); print('total', round(len(y) / SR, 2), 'starts', starts)

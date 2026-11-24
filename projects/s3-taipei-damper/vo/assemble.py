# Trim each generated line (RMS, -42 dB), join with pauses (longer at the turns), write vo.wav and line_starts.json.
import json, numpy as np, soundfile as sf
GAP = [0, 0.35, 0.35, 0.5, 0.4, 0.35, 0.4, 0.55, 0.3, 0.55]   # pause before line i (turns: 3 "But", 7 "Without", 9 "In 2015")
out, starts, t, SR = [], [], 0.3, None
for i in range(10):
    x, sr = sf.read(f'line_{i:02d}.wav', dtype='float32'); SR = SR or sr; assert sr == SR
    if not out: out.append(np.zeros(int(0.3 * SR), np.float32))
    hop = SR // 100; env = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
    on = np.where(20 * np.log10(env + 1e-9) > -42)[0]; a, b = max(0, on[0] * hop - SR // 40), min(len(x), (on[-1] + 1) * hop + SR // 10)
    if i: out.append(np.zeros(int(GAP[i] * SR), np.float32)); t += GAP[i]
    starts.append(round(t, 3)); seg = x[a:b]; out.append(seg); t += len(seg) / SR
out.append(np.zeros(int(0.8 * SR), np.float32))
y = np.concatenate(out); sf.write('vo.wav', y, SR)
json.dump(starts, open('line_starts.json', 'w')); print('total', round(len(y) / SR, 2), 'starts', starts)

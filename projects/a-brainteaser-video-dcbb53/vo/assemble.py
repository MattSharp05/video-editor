# Trim each generated line (vo/raw/l1.wav ... l11.wav), join with pauses (the 1.5 s guess hold sits before l5),
# write vo.wav (24 kHz mono) and line_starts.json; then words.json via faster-whisper (align step below).
# usage (from vo/): python assemble.py
import json, numpy as np, soundfile as sf
SR = 24000
GAP = [0, 0.3, 0.45, 0.5, 1.9, 0.4, 0.45, 0.35, 0.5, 0.35, 0.6]   # pause before line i; l5's includes the guess hold
out, starts, t = [np.zeros(int(0.15 * SR), np.float32)], [], 0.15
for i in range(11):
    x, sr = sf.read(f'raw/l{i + 1}.wav', dtype='float32'); assert sr == SR
    hop = 240; env = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
    on = np.where(20 * np.log10(env + 1e-9) > -42)[0]; a, b = max(0, on[0] * hop - 600), min(len(x), (on[-1] + 1) * hop + 2400)
    if i: out.append(np.zeros(int(GAP[i] * SR), np.float32)); t += GAP[i]
    starts.append(round(t, 3)); seg = x[a:b]; out.append(seg); t += len(seg) / SR
out.append(np.zeros(int(1.6 * SR), np.float32))
y = np.concatenate(out); sf.write('vo.wav', y, SR)
json.dump(starts, open('line_starts.json', 'w')); print('total', round(len(y) / SR, 2), 'starts', starts)

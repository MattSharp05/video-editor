# Trim each generated line (RMS envelope, -42 dB), join with pauses (longer at the turns), write vo.wav (24 kHz mono)
# and line_starts.json. Word timings: align_lines.py (line by line). usage: python assemble.py   (from vo/; GAP from gaps.json if present)
import json, os, re, subprocess, numpy as np, soundfile as sf
SR = 24000
L = json.load(open('lines.json'))
GAP = json.load(open('gaps.json')) if os.path.exists('gaps.json') else [0] + [0.35] * (len(L) - 1)
out, starts, t = [np.zeros(int(0.25 * SR), np.float32)], [], 0.25
for i in range(len(L)):
    fn = f'line_{i:02d}.tight.wav' if os.path.exists(f'line_{i:02d}.tight.wav') else f'line_{i:02d}.wav'
    x, sr = sf.read(fn, dtype='float32'); assert sr == SR
    hop = 240; env = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
    on = np.where(20 * np.log10(env + 1e-9) > -42)[0]; a, b = max(0, on[0] * hop - 600), min(len(x), (on[-1] + 1) * hop + 2400)
    if i: out.append(np.zeros(int(GAP[i] * SR), np.float32)); t += GAP[i]
    starts.append(round(t, 3)); seg = x[a:b]; out.append(seg); t += len(seg) / SR
out.append(np.zeros(int(1.2 * SR), np.float32))
y = np.concatenate(out); sf.write('vo.wav', y, SR)
json.dump(starts, open('line_starts.json', 'w')); print('total', round(len(y) / SR, 2), 'starts', starts)
print('next: python align_lines.py')

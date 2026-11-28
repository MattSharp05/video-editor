# Trim each cloned line (r3-m07, lab/voice-picker/library/say.py), join with pauses (longer at the turns), write
# vo.wav and line_starts.json. Then ../film/align.py vo.wav -> words.json.
import json, numpy as np, soundfile as sf
L = json.load(open('lines.json'))
GAP = [0, 0.35, 0.25, 0.3, 0.45, 0.4, 0.3, 0.4, 0.5]   # pause before line i (turns: l5 why-charge, l6 tests, l8 verdict, l9 recap)
out, starts, t, SR = [], [], 0.15, None
for i, l in enumerate(L):
    x, sr = sf.read(f'{l["id"]}.wav', dtype='float32'); SR = SR or sr
    if i == 0: out.append(np.zeros(int(0.15 * SR), np.float32))
    hop = 240; env = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
    on = np.where(20 * np.log10(env + 1e-9) > -42)[0]; a, b = max(0, on[0] * hop - 600), min(len(x), (on[-1] + 1) * hop + 2400)
    if i: out.append(np.zeros(int(GAP[i] * SR), np.float32)); t += GAP[i]
    starts.append(round(t, 3)); seg = x[a:b]; out.append(seg); t += len(seg) / SR
out.append(np.zeros(int(1.0 * SR), np.float32))
y = np.concatenate(out); sf.write('vo.wav', y, SR)
json.dump(starts, open('line_starts.json', 'w')); print('total', round(len(y) / SR, 2), 'starts', starts)

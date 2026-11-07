# Trim each generated line (RMS envelope, -42 dB), join with pauses (longer at the turns), write vo.wav (24 kHz mono)
# and line_starts.json; then word timings with faster-whisper (small.en, int8) into words.json, and the transcript
# compared with lines.json word for word. usage: python assemble.py   (from vo/; GAP from gaps.json if present)
import json, os, re, subprocess, numpy as np, soundfile as sf
SR = 24000
L = json.load(open('lines.json'))
GAP = json.load(open('gaps.json')) if os.path.exists('gaps.json') else [0] + [0.35] * (len(L) - 1)
out, starts, t = [np.zeros(int(0.25 * SR), np.float32)], [], 0.25
for i in range(len(L)):
    x, sr = sf.read(f'line_{i:02d}.wav', dtype='float32'); assert sr == SR
    hop = 240; env = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
    on = np.where(20 * np.log10(env + 1e-9) > -42)[0]; a, b = max(0, on[0] * hop - 600), min(len(x), (on[-1] + 1) * hop + 2400)
    if i: out.append(np.zeros(int(GAP[i] * SR), np.float32)); t += GAP[i]
    starts.append(round(t, 3)); seg = x[a:b]; out.append(seg); t += len(seg) / SR
out.append(np.zeros(int(1.2 * SR), np.float32))
y = np.concatenate(out); sf.write('vo.wav', y, SR)
json.dump(starts, open('line_starts.json', 'w')); print('total', round(len(y) / SR, 2), 'starts', starts)
from faster_whisper import WhisperModel
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'vo.wav', '-ar', '16000', 'vo16.wav'], check=True)
m = WhisperModel('small.en', compute_type='int8')
segs, _ = m.transcribe(sf.read('vo16.wav', dtype='float32')[0], word_timestamps=True, initial_prompt=' '.join(L)[:400])
W = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
os.remove('vo16.wav'); json.dump(W, open('words.json', 'w'), indent=0)
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
said = [norm(w['w']) for w in W]; want = [norm(x) for x in ' '.join(L).split()]
print('words', len(said), 'script', len(want), 'MATCH' if said == want else 'DIFF')
if said != want:
    import difflib
    for op in difflib.SequenceMatcher(None, want, said).get_opcodes():
        if op[0] != 'equal': print(op[0], 'script:', want[op[1]:op[2]], 'heard:', said[op[3]:op[4]])

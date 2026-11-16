# Kokoro am_puck narration for self-driving-01 (pipeline from code-history-01 vo/gen_full.py + process_full.py).
# Usage: ~/venvs/kk/bin/python gen_vo.py      (venv: kokoro, soundfile, faster-whisper, en_core_web_sm)
# lines.json: {"lines": [...], "gap_s": 0.35, "long_gap_s": 0.6, "long_gap_before": [line numbers, 1-based]}
# Writes raw/line_NN.wav, vo.wav (48 kHz mono, -16 LUFS), line_starts.json, words.json, report.json.
# Kokoro is deterministic at speed 1.0: a line whose transcript differs is listed, not retaken.
import json, os, re, subprocess, sys, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
C = json.load(open('lines.json')); L = C['lines']; VOICE = C.get('voice', 'am_puck'); SPEED = C.get('speed', 1.0)
os.makedirs('raw', exist_ok=True)
from kokoro import KPipeline
pipe = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
for i, text in enumerate(L, 1):
    f = f'raw/line_{i:02d}.wav'
    if os.path.exists(f) and open(f + '.txt').read() == text: continue
    a = np.concatenate([x for _, _, x in pipe(text, voice=VOICE, speed=SPEED)])
    sf.write(f, a, 24000); open(f + '.txt', 'w').write(text); print('gen', i, round(len(a) / 24000, 2), flush=True)

def trim(x, sr):
    hop = sr // 100; env = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
    on = np.where(20 * np.log10(env + 1e-9) > -42)[0]
    return x[max(0, on[0] * hop - int(0.03 * sr)): min(len(x), (on[-1] + 1) * hop + int(0.12 * sr))]

out, starts, t, sr = [], [], 0.25, 24000
out.append(np.zeros(int(0.25 * sr), np.float32))
for i in range(1, len(L) + 1):
    x, sr = sf.read(f'raw/line_{i:02d}.wav', dtype='float32')
    if i > 1:
        g = C['long_gap_s'] if i in C['long_gap_before'] else C['gap_s']; out.append(np.zeros(int(g * sr), np.float32)); t += g
    seg = trim(x, sr); starts.append(round(t, 3)); out.append(seg); t += len(seg) / sr
out.append(np.zeros(int(0.6 * sr), np.float32)); y = np.concatenate(out); sf.write('raw/joined.wav', y, sr)
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'raw/joined.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
      f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'raw/joined.wav', '-af', af, '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', 'vo.wav'], check=True)
json.dump(starts, open('line_starts.json', 'w'))

from faster_whisper import WhisperModel
asr = WhisperModel('small.en', device='cpu', compute_type='int8')
pcm = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', 'vo.wav', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                                   capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768
segs = list(asr.transcribe(pcm, language='en', beam_size=5, word_timestamps=True)[0])
words = [dict(w=w.word.strip(), s=round(w.start, 2), e=round(w.end, 2)) for s in segs for w in s.words]
json.dump(words, open('words.json', 'w'), indent=0)
norm = lambda s: re.sub(r"[^a-z0-9' ]", ' ', s.lower().replace('-', ' ')).split()
heard = ' '.join(s.text.strip() for s in segs); script = ' '.join(L)
nw = len(script.split()); dur = len(y) / sr
rep = dict(duration_s=round(dur, 2), words=nw, wps=round(nw / dur, 2), transcript_match=norm(heard) == norm(script), heard=heard)
json.dump(rep, open('report.json', 'w'), indent=1); print(json.dumps(rep, indent=1))

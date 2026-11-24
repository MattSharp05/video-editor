# Round 3 checks: transcript of every clip vs its line (faster-whisper small.en) and median pitch per voice.
import json, re, numpy as np, librosa
from faster_whisper import WhisperModel
V = json.load(open('voices_r3.json')); lines = {l['id']: l['text'] for l in V['lines']}
m = WhisperModel('small.en', device='cpu', compute_type='int8')
norm = lambda s: re.sub(r'[^a-z ]', '', s.lower().replace('-', ' ').replace('millimeters', 'millimetres').replace('6', 'six')).split()
for v in V['male'] + V['female']:
    f0s, notes = [], []
    for lid, text in lines.items():
        p = f"work/r3/{v['key']}_{lid}.wav"
        segs, _ = m.transcribe(librosa.load(p, sr=16000)[0], language='en'); heard = ' '.join(s.text for s in segs).strip()
        a, b = norm(text), norm(heard)
        if a != b: notes.append(f'{lid}: "{heard}"')
        y, sr = librosa.load(p, sr=16000)
        f0, vf, _ = librosa.pyin(y, fmin=60, fmax=400, sr=sr); f0s += list(f0[vf])
    print(v['key'], f"{np.median(f0s):.0f}Hz", 'OK' if not notes else ' | '.join(notes), flush=True)

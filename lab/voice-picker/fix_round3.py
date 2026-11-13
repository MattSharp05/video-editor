# Round 3 fixes: m06/m09 designs came out at ~210-230 Hz (women's range) -> redesign with seeds 11/21, keep the lowest
# median pitch under 165 Hz, re-clone both lines; m03's explainer dropped its second sentence -> re-clone with seed 11.
import json, os, shutil, sys, torch, numpy as np, librosa, soundfile as sf
from qwen_tts import Qwen3TTSModel
V = json.load(open('voices_r3.json')); by = {v['key']: v for v in V['male'] + V['female']}
load = lambda kind: Qwen3TTSModel.from_pretrained(f'Qwen/Qwen3-TTS-12Hz-1.7B-{kind}', device_map='cpu', dtype=torch.float32)
def pitch(p):
    y, sr = librosa.load(p, sr=16000); f0, vf, _ = librosa.pyin(y, fmin=60, fmax=400, sr=sr); return float(np.median(f0[vf]))
step = sys.argv[1]
if step == 'design':
    m = load('VoiceDesign')
    for k in ['r3-m06', 'r3-m09']:
        best = None
        for seed in (11, 21, 33):
            torch.manual_seed(seed); w, sr = m.generate_voice_design(text=V['ref_text'], language='English', instruct=by[k]['design'])
            p = f'work/r3/{k}_ref_s{seed}.wav'; sf.write(p, w[0], sr); hz = pitch(p); print(k, seed, f'{hz:.0f}Hz', flush=True)
            if best is None or hz < best[1]: best = (p, hz, seed)
            if hz < 150: break
        print(k, 'keep seed', best[2], f'{best[1]:.0f}Hz', flush=True)
        shutil.copyfile(best[0], f'work/r3/{k}_ref.wav')
        for ln in 'ab':
            f = f'work/r3/{k}_{ln}.wav'
            if os.path.exists(f): os.remove(f)
if step == 'clone':
    m = load('Base')
    jobs = [('r3-m06', 'a', 7), ('r3-m06', 'b', 7), ('r3-m09', 'a', 7), ('r3-m09', 'b', 7), ('r3-m03', 'b', 11)]
    for k, ln, seed in jobs:
        prompt = m.create_voice_clone_prompt(ref_audio=f'work/r3/{k}_ref.wav', ref_text=V['ref_text'])
        text = next(l['text'] for l in V['lines'] if l['id'] == ln)
        torch.manual_seed(seed); w, sr = m.generate_voice_clone(text=text, language='English', voice_clone_prompt=prompt)
        sf.write(f'work/r3/{k}_{ln}.wav', w[0], sr); print(k, ln, round(len(w[0]) / sr, 1), flush=True)
print('DONE', step)

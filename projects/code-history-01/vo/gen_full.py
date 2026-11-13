# Full locked script in each shortlisted voice. One TTS model per call (run one at a time).
# Usage: python gen_full.py <raw_dir> kokoro|check|qwen [key,...]
#   kokoro: stock voices, speed 1.0 (deterministic: no seeds; a failing line is only flagged). No ASR in that venv:
#   run `check` afterwards with the qw venv to transcribe each line.
#   qwen:   Base model clones every line from one reference clip per voice (design refs and the design-m2 hook ref as in the
#           samples; the Aiden/Ryan presets cloned from their CustomVoice hook clip). Each line is checked with faster-whisper;
#           a line that drops/changes words is regenerated with the next seed (up to 3 retakes, best take kept).
import json, os, sys, time, shutil, soundfile as sf, numpy as np
RAW, fam = sys.argv[1], sys.argv[2]; OUT = f'{RAW}/full'; os.makedirs(OUT, exist_ok=True)
C = json.load(open('full_lines.json')); L = C['lines']; S = json.load(open('lines.json'))
keys = sys.argv[3].split(',') if len(sys.argv) > 3 else [k for k in C['keys'] if fam == 'check' or k.startswith(fam)]
takes_f = f'{OUT}/takes.json'; takes = json.load(open(takes_f)) if os.path.exists(takes_f) else {}
def log(key, i, rec): takes.setdefault(key, {})[str(i)] = rec; json.dump(takes, open(takes_f, 'w'), indent=1)
if fam == 'kokoro':
    from kokoro import KPipeline
    pipes = {c: KPipeline(lang_code=c, repo_id='hexgrad/Kokoro-82M') for c in 'ab'}
    for key in keys:
        v = key.split('-', 1)[1]
        for i, text in enumerate(L, 1):
            f = f'{OUT}/{key}_{i:02d}.wav'
            if os.path.exists(f): continue
            audio = np.concatenate([a for _, _, a in pipes['b' if v[0] == 'b' else 'a'](text, voice=v, speed=1.0)])
            sf.write(f, audio, 24000); print(key, i, flush=True)
if fam == 'check':
    from asrcheck import check
    for key in keys:
        for i, text in enumerate(L, 1):
            f = f'{OUT}/{key}_{i:02d}.wav'
            if str(i) in takes.get(key, {}) or not os.path.exists(f): continue
            ok, heard, d = check(f, text); log(key, i, dict(seed=None, ok=ok, heard=heard, tries=1)); print(key, i, ok, '' if ok else heard, flush=True)
if fam == 'qwen':
    import torch
    from qwen_tts import Qwen3TTSModel
    from asrcheck import check
    m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base', device_map='cpu', dtype=torch.float32)
    REFS = {'qwen-design-m2': ('../../grand-canyon-01/vo/ref_design-m2_hook.wav', S['m2_ref_text']),
            'qwen-custom-aiden': ('refs/ref_qwen-custom-aiden_hook.wav', S['lines'][0]['text']),
            'qwen-custom-ryan': ('refs/ref_qwen-custom-ryan_hook.wav', S['lines'][0]['text'])}
    for key in keys:
        ref, ref_text = REFS.get(key, (f'refs/ref_{key}.wav', S['design_ref_text']))
        prompt = m.create_voice_clone_prompt(ref_audio=ref, ref_text=ref_text)
        for i, text in enumerate(L, 1):
            f = f'{OUT}/{key}_{i:02d}.wav'
            if os.path.exists(f): continue
            best = None
            for n, seed in enumerate(C['seeds']):
                torch.manual_seed(seed); t = time.time()
                w, sr = m.generate_voice_clone(text=text, language='English', voice_clone_prompt=prompt)
                tf = f'{OUT}/tmp_{key}_{i:02d}_s{seed}.wav'; sf.write(tf, w[0], sr)
                ok, heard, d = check(tf, text)
                print(key, i, 'seed', seed, f'{time.time()-t:.0f}s', round(len(w[0]) / sr, 2), ok, '' if ok else heard, flush=True)
                if best is None or d < best[0]: best = (d, tf, seed, ok, heard)
                if ok: break
            shutil.copy(best[1], f); log(key, i, dict(seed=best[2], ok=best[3], heard=best[4], tries=n + 1))
            for x in os.listdir(OUT):
                if x.startswith(f'tmp_{key}_{i:02d}_'): os.remove(f'{OUT}/{x}')

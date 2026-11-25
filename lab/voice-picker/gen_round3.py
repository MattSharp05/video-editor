# Round 3: 20 designed voices. Step 'design' renders one reference clip per voice (VoiceDesign, seed 7); step 'clone'
# clones both test lines from each reference (Base, seed 7), the production workflow (ai-voiceover.md: design once,
# clone every line). One model at a time. Usage: python gen_round3.py <design|clone>
import json, os, sys, time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
V = json.load(open('voices_r3.json'))
voices = V['male'] + V['female']
os.makedirs('work/r3', exist_ok=True)
load = lambda kind: Qwen3TTSModel.from_pretrained(f'Qwen/Qwen3-TTS-12Hz-1.7B-{kind}', device_map='cpu', dtype=torch.float32)
step = sys.argv[1]
if step == 'design':
    m = load('VoiceDesign')
    for v in voices:
        path = f"work/r3/{v['key']}_ref.wav"
        if os.path.exists(path): continue
        torch.manual_seed(7); t = time.time()
        w, sr = m.generate_voice_design(text=V['ref_text'], language='English', instruct=v['design'])
        sf.write(path, w[0], sr); print(v['key'], 'ref', f'{time.time()-t:.0f}s', round(len(w[0]) / sr, 1), flush=True)
if step == 'clone':
    m = load('Base')
    for v in voices:
        prompt = m.create_voice_clone_prompt(ref_audio=f"work/r3/{v['key']}_ref.wav", ref_text=V['ref_text'])
        for ln in V['lines']:
            path = f"work/r3/{v['key']}_{ln['id']}.wav"
            if os.path.exists(path): continue
            torch.manual_seed(7); t = time.time()
            w, sr = m.generate_voice_clone(text=ln['text'], language='English', voice_clone_prompt=prompt)
            sf.write(path, w[0], sr); print(v['key'], ln['id'], f'{time.time()-t:.0f}s', round(len(w[0]) / sr, 1), flush=True)
print('DONE', step, flush=True)

# Turbulence seat 01 voiceover. Voice: Matthew's Voice Match pick m5 (round 1, 2026-11-17; round 2 variations still
# open). Design once: re-render the exact clip he picked (m5 design, seed 7, setup line) as the reference, then clone
# every line from it with the Base model so the voice can't drift.  usage: python gen_vo.py design | lines [idx,..] [seed]
import json, sys, time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
DESIGN = ("A warm, friendly American male narrator in his early thirties, mid pitch, smooth and polished like a YouTube "
          "explainer voiceover. Engaging and expressive with clear articulation, medium pace.")
REF_TEXT = "Well, first you would need nearly five million people, standing three feet apart the whole way."
step = sys.argv[1]
if step == 'design':
    m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', device_map='cpu', dtype=torch.float32)
    torch.manual_seed(7); w, sr = m.generate_voice_design(text=REF_TEXT, language='English', instruct=DESIGN)
    sf.write('ref_m5.wav', w[0], sr); print('ref', round(len(w[0]) / sr, 2), flush=True)
if step == 'lines':
    m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base', device_map='cpu', dtype=torch.float32)
    prompt = m.create_voice_clone_prompt(ref_audio='ref_m5.wav', ref_text=REF_TEXT)
    only = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 and sys.argv[2] else None
    seed = int(sys.argv[3]) if len(sys.argv) > 3 else 7
    for i, line in enumerate(json.load(open('lines.json'))):
        if only and i not in only: continue
        torch.manual_seed(seed); t = time.time()
        w, sr = m.generate_voice_clone(text=line, language='English', voice_clone_prompt=prompt)
        sf.write(f'line_{i:02d}.wav', w[0], sr); print('line', i, f'{time.time()-t:.0f}s', round(len(w[0]) / sr, 2), flush=True)

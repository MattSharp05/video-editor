# The rock in the boat: clone every line from Broadcast's r3-m07 reference clip (Qwen3-TTS 1.7B Base, fixed seed).
# Usage: python gen_vo.py [only=1,3] [seed]
import json, sys, time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
REF = 'ref_r3-m07.wav'
REF_TEXT = ("Every night, while you sleep, your brain replays your day. And then it does something strange with it. "
            "The river didn't carve the canyon all at once. It cut a few millimetres a year, for six million years.")
m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base', device_map='cpu', dtype=torch.float32)
prompt = m.create_voice_clone_prompt(ref_audio=REF, ref_text=REF_TEXT)
only = [int(x) for x in sys.argv[1].split(',')] if len(sys.argv) > 1 and sys.argv[1] else None
seed = int(sys.argv[2]) if len(sys.argv) > 2 else 7
for i, line in enumerate(json.load(open('lines.json'))):
    if only and i not in only: continue
    torch.manual_seed(seed); t = time.time()
    w, sr = m.generate_voice_clone(text=line, language='English', voice_clone_prompt=prompt)
    sf.write(f'line_{i:02d}.wav', w[0], sr); print('line', i, f'{time.time()-t:.0f}s', round(len(w[0]) / sr, 2), flush=True)

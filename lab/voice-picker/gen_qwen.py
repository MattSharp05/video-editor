# Qwen3-TTS Base (Apache 2.0): clone from work/ref.wav with its transcript.
import json, sys, time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
size = sys.argv[1] if len(sys.argv) > 1 else '1.7B'
L = json.load(open('lines.json'))
m = Qwen3TTSModel.from_pretrained(f'Qwen/Qwen3-TTS-12Hz-{size}-Base', device_map='cpu', dtype=torch.float32)
for ln in L['lines']:
    torch.manual_seed(7); t = time.time()
    wavs, sr = m.generate_voice_clone(text=ln['text'], language='English', ref_audio='work/ref.wav', ref_text=L['ref_text'])
    sf.write(f"work/qwen-{size}_{ln['id']}.wav", wavs[0], sr); print('qwen', size, ln['id'], f'{time.time()-t:.0f}s', flush=True)

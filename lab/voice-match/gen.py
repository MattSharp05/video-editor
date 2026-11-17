# Voice match: Qwen3-TTS 1.7B VoiceDesign (Apache 2.0) voices designed to sound like a reference reel, same lines as the reel.
import json, time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
V = json.load(open('voices.json'))
m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', device_map='cpu', dtype=torch.float32)
for v in V['voices']:
    for ln in V['lines']:
        torch.manual_seed(7); t = time.time()
        w, sr = m.generate_voice_design(text=ln['text'], language='English', instruct=v['design'])
        sf.write(f"work/{v['key']}_{ln['id']}.wav", w[0], sr); print(v['key'], ln['id'], f'{time.time()-t:.0f}s', flush=True)
print('DONE')

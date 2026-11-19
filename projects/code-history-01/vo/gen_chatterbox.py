# Chatterbox (MIT; output carries Resemble's Perth inaudible watermark): built-in default voice. Usage: python gen_chatterbox.py <raw_dir>
import json, sys, time, torch, torchaudio as ta
from chatterbox.tts import ChatterboxTTS
RAW = sys.argv[1]; m = ChatterboxTTS.from_pretrained(device='cpu')
for ln in json.load(open('lines.json'))['lines']:
    torch.manual_seed(7); t = time.time(); wav = m.generate(ln['text'], exaggeration=0.5, cfg_weight=0.5)
    ta.save(f"{RAW}/cb-default_{ln['id']}.wav", wav, m.sr); print('cb-default', ln['id'], f'{time.time()-t:.0f}s', flush=True)

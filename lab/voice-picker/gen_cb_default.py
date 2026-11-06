# Chatterbox's built-in voice (no reference audio).
import json, torch, torchaudio as ta
from chatterbox.tts import ChatterboxTTS
m = ChatterboxTTS.from_pretrained(device='cpu')
for ln in json.load(open('lines.json'))['lines']:
    torch.manual_seed(7); wav = m.generate(ln['text'], exaggeration=0.4, cfg_weight=0.4)
    ta.save(f"work/r2_cb-default_{ln['id']}.wav", wav, m.sr); print('cb-default', ln['id'], flush=True)

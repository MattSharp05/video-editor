# Chatterbox (Resemble AI, MIT): clone Matthew's voice from work/ref.wav. Original model in two settings, plus Turbo.
import json, sys, time, torch, torchaudio as ta
from chatterbox.tts import ChatterboxTTS
from chatterbox.tts_turbo import ChatterboxTurboTTS
L = json.load(open('lines.json'))
which = sys.argv[1] if len(sys.argv) > 1 else 'all'
if which in ('all', 'cb'):
    m = ChatterboxTTS.from_pretrained(device='cpu')
    for key, kw in [('cb', dict(exaggeration=0.5, cfg_weight=0.5)), ('cb-calm', dict(exaggeration=0.35, cfg_weight=0.3))]:
        for ln in L['lines']:
            torch.manual_seed(7); t = time.time()
            wav = m.generate(ln['text'], audio_prompt_path='work/ref.wav', **kw)
            ta.save(f"work/{key}_{ln['id']}.wav", wav, m.sr); print(key, ln['id'], f'{time.time()-t:.0f}s', flush=True)
if which in ('all', 'turbo'):
    m = ChatterboxTurboTTS.from_pretrained(device='cpu')
    for ln in L['lines']:
        torch.manual_seed(7); t = time.time()
        wav = m.generate(ln['text'], audio_prompt_path='work/ref.wav')
        ta.save(f"work/turbo_{ln['id']}.wav", wav, m.sr); print('turbo', ln['id'], f'{time.time()-t:.0f}s', flush=True)

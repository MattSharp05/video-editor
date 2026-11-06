# Round 2: three categories (your clone, American male, American female). Qwen3-TTS family (Apache 2.0) + Chatterbox's
# built-in voice (MIT). Runs one model at a time so the CPU isn't shared. Usage: python gen_round2.py <clone|custom|design>
import json, sys, time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
V = json.load(open('voices_r2.json')); L = json.load(open('lines.json'))['lines']; ref = json.load(open('lines.json'))['ref_text']
part = sys.argv[1]
load = lambda kind: Qwen3TTSModel.from_pretrained(f'Qwen/Qwen3-TTS-12Hz-1.7B-{kind}', device_map='cpu', dtype=torch.float32)
def out(key, ln, wav, sr, t):
    sf.write(f"work/r2_{key}_{ln['id']}.wav", wav, sr); print(key, ln['id'], f'{time.time()-t:.0f}s', flush=True)
if part == 'clone':
    m = load('Base')
    for v in V['clone']:
        for ln in L:
            torch.manual_seed(v['seed']); t = time.time()
            w, sr = m.generate_voice_clone(text=ln['text'], language='English', ref_audio='work/ref.wav', ref_text=ref); out(v['key'], ln, w[0], sr, t)
if part == 'custom':
    m = load('CustomVoice')
    for v in [x for x in V['male'] if 'speaker' in x]:
        for ln in L:
            torch.manual_seed(7); t = time.time()
            w, sr = m.generate_custom_voice(text=ln['text'], language='English', speaker=v['speaker'], instruct=V['calm']); out(v['key'], ln, w[0], sr, t)
if part == 'design':
    m = load('VoiceDesign')
    for v in [x for x in V['male'] + V['female'] if 'design' in x]:
        for ln in L:
            torch.manual_seed(7); t = time.time()
            w, sr = m.generate_voice_design(text=ln['text'], language='English', instruct=v['design']); out(v['key'], ln, w[0], sr, t)

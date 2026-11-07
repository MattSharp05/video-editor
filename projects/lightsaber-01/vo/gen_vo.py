# Grand Canyon 01 voiceover: design the voice once (VoiceDesign, Matthew's round-2 pick design-m2), then clone every line
# from that one reference with the Base model, so the voice can't drift between lines.
import json, sys, time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
DESIGN = json.load(open('../../../lab/voice-picker/voices_r2.json'))['male'][3]['design']
REF_TEXT = "Stand on the rim and the river looks like a thin green thread, a mile below you. It took millions of years of floods to put it there."
# Used instead: the exact hook clip Matthew liked in Voice Picker round 2 (design-m2, seed 7), with its text.
HOOK_REF, HOOK_TEXT = 'ref_design-m2_hook.wav', "You've saved forty TikToks for this trip. And on the trip, you'll open none of them."
step = sys.argv[1]
if step == 'design':
    m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', device_map='cpu', dtype=torch.float32)
    for seed in (7, 11):
        torch.manual_seed(seed); w, sr = m.generate_voice_design(text=REF_TEXT, language='English', instruct=DESIGN)
        sf.write(f'ref_design_s{seed}.wav', w[0], sr); print('ref', seed, len(w[0]) / sr, flush=True)
if step == 'lines':
    ref = sys.argv[2]
    ref_text = HOOK_TEXT if ref == HOOK_REF else REF_TEXT
    m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base', device_map='cpu', dtype=torch.float32)
    prompt = m.create_voice_clone_prompt(ref_audio=ref, ref_text=ref_text)
    only = [int(x) for x in sys.argv[3].split(',')] if len(sys.argv) > 3 else None
    for i, line in enumerate(json.load(open('lines.json'))):
        if only and i not in only: continue
        seed = int(sys.argv[4]) if len(sys.argv) > 4 else 7
        torch.manual_seed(seed); t = time.time()
        w, sr = m.generate_voice_clone(text=line, language='English', voice_clone_prompt=prompt)
        sf.write(f'line_{i:02d}.wav', w[0], sr); print('line', i, f'{time.time()-t:.0f}s', round(len(w[0]) / sr, 2), flush=True)

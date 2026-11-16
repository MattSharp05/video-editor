# Qwen3-TTS 12Hz 1.7B (Apache 2.0). One model per call (run one at a time; drop from the HF cache after).
# Usage: python gen_qwen.py <raw_dir> design|clone|speakers|custom|retake <key> <line> <seed,...>
#   design: one VoiceDesign reference clip per designed voice (neutral sentence, seed 7)
#   clone:  Base model clones both test lines from each reference (design refs seed 7, Matthew seed 21, design-m2 hook ref)
#   custom: CustomVoice preset speakers with an explainer instruction
import json, sys, time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
RAW, step = sys.argv[1], sys.argv[2]
C = json.load(open('lines.json')); L = C['lines']; V = json.load(open('voices.json'))
load = lambda kind: Qwen3TTSModel.from_pretrained(f'Qwen/Qwen3-TTS-12Hz-1.7B-{kind}', device_map='cpu', dtype=torch.float32)
def save(path, wav, sr, t): sf.write(path, wav, sr); print(path.split('/')[-1], f'{time.time()-t:.0f}s', round(len(wav) / sr, 2), flush=True)
if step == 'design':
    m = load('VoiceDesign')
    for v in V['design']:
        torch.manual_seed(7); t = time.time()
        w, sr = m.generate_voice_design(text=C['design_ref_text'], language='English', instruct=v['design'])
        save(f"{RAW}/ref_{v['key']}.wav", w[0], sr, t)
if step in ('clone', 'retake'):
    m = load('Base')
    jobs = [('qwen-clone-matthew', f'{RAW}/ref_matthew.wav', C['matthew_ref_text'], 21),
            ('qwen-design-m2', '../../grand-canyon-01/vo/ref_design-m2_hook.wav', C['m2_ref_text'], 7)]
    jobs += [(v['key'], f"{RAW}/ref_{v['key']}.wav", C['design_ref_text'], 7) for v in V['design']]
    if step == 'retake':  # re-generate one line of one voice with other seeds, saved as <key>_<line>_s<seed>.wav
        key, line, seeds = sys.argv[3], sys.argv[4], sys.argv[5].split(',')
        _, ref, ref_text, _ = next(j for j in jobs if j[0] == key)
        prompt = m.create_voice_clone_prompt(ref_audio=ref, ref_text=ref_text); ln = next(l for l in L if l['id'] == line)
        for sd in seeds:
            torch.manual_seed(int(sd)); t = time.time()
            w, sr = m.generate_voice_clone(text=ln['text'], language='English', voice_clone_prompt=prompt)
            save(f"{RAW}/retake/{key}_{line}_s{sd}.wav", w[0], sr, t)
        jobs = []
    for key, ref, ref_text, seed in jobs:
        try:
            prompt = m.create_voice_clone_prompt(ref_audio=ref, ref_text=ref_text)
            for ln in L:
                torch.manual_seed(seed); t = time.time()
                w, sr = m.generate_voice_clone(text=ln['text'], language='English', voice_clone_prompt=prompt)
                save(f"{RAW}/{key}_{ln['id']}.wav", w[0], sr, t)
        except Exception as e:
            print('FAIL', key, repr(e), flush=True)
if step in ('speakers', 'custom'):
    m = load('CustomVoice')
    sp = m.get_supported_speakers() if hasattr(m, 'get_supported_speakers') else None
    print('SPEAKERS', sp, flush=True)
    if step == 'custom':
        for s in sys.argv[3].split(','):
            for ln in L:
                torch.manual_seed(7); t = time.time()
                w, sr = m.generate_custom_voice(text=ln['text'], language='English', speaker=s, instruct=V['custom_instruct'])
                save(f"{RAW}/qwen-custom-{s.lower()}_{ln['id']}.wav", w[0], sr, t)

# Clone each line of lines.json in voice m5 (Base model + ref_m5.wav). usage: say.py LINES.json OUTDIR [idx,..] [seed]
import json, os, sys, time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
HERE = os.path.dirname(os.path.abspath(__file__))
REF_TEXT = "Well, first you would need nearly five million people, standing three feet apart the whole way."
lines, out = sys.argv[1], sys.argv[2]
only = [int(x) for x in sys.argv[3].split(',')] if len(sys.argv) > 3 and sys.argv[3] else None
seed = int(sys.argv[4]) if len(sys.argv) > 4 else 7
m = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base', device_map='cpu', dtype=torch.float32)
prompt = m.create_voice_clone_prompt(ref_audio=os.path.join(HERE, 'ref_m5.wav'), ref_text=REF_TEXT)
os.makedirs(out, exist_ok=True)
for i, line in enumerate(json.load(open(lines))):
    if only and i not in only: continue
    torch.manual_seed(seed); t = time.time()
    w, sr = m.generate_voice_clone(text=line, language='English', voice_clone_prompt=prompt)
    sf.write(os.path.join(out, f'line_{i:02d}.wav'), w[0], sr)
    print('line', i, f'{time.time()-t:.0f}s', round(len(w[0]) / sr, 2), flush=True)

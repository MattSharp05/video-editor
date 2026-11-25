# Render lines in a Broadcast library voice: clone each line from the voice's reference clip (Qwen3-TTS 1.7B Base),
# so every line sounds like the voice Matthew picked. Runs in the Qwen venv (see ai-voiceover.md for the install line).
# Usage: python say.py --voice r3-m02 --lines lines.json --out ../../projects/<slug>/vo/
#   lines.json: a JSON list of strings, or of {"id","text"}. Writes <out>/line_00.wav ... (or <id>.wav).
#   --only 3,5 --seed 11 re-renders just those lines with another seed (when a line drops or changes words).
import argparse, json, os, time
import soundfile as sf, torch
from qwen_tts import Qwen3TTSModel
HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument('--voice', required=True); ap.add_argument('--lines', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--only', default=''); ap.add_argument('--seed', type=int, default=None)
a = ap.parse_args()
lib = json.load(open(os.path.join(HERE, 'voices.json')))
if a.voice not in lib['voices']:
    raise SystemExit(f"Unknown voice {a.voice}. Library voices: {', '.join(lib['voices'])}")
v = lib['voices'][a.voice]
lines = json.load(open(a.lines))
lines = [l if isinstance(l, dict) else {'id': f'line_{i:02d}', 'text': l} for i, l in enumerate(lines)]
only = {int(x) for x in a.only.split(',') if x}
os.makedirs(a.out, exist_ok=True)
m = Qwen3TTSModel.from_pretrained(lib['model'], device_map='cpu', dtype=torch.float32)
prompt = m.create_voice_clone_prompt(ref_audio=os.path.join(HERE, v['ref']), ref_text=v['ref_text'])
for i, l in enumerate(lines):
    if only and i not in only: continue
    torch.manual_seed(a.seed if a.seed is not None else lib['seed']); t = time.time()
    w, sr = m.generate_voice_clone(text=l['text'], language='English', voice_clone_prompt=prompt)
    sf.write(os.path.join(a.out, f"{l['id']}.wav"), w[0], sr)
    print(l['id'], f'{time.time() - t:.0f}s', round(len(w[0]) / sr, 2), flush=True)

# Speak lines in this library voice: clone every line from ref.wav with Qwen3-TTS Base (Apache 2.0), fixed seed.
# Usage: python say.py lines.json out_dir [seed] [only=0,3]   (lines.json: a JSON list of strings)
# Setup (one venv): uv venv -p 3.12 .venv-qw && VIRTUAL_ENV=.venv-qw uv pip install qwen-tts soundfile \
#   --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match
import json, sys, time, torch, soundfile as sf
from pathlib import Path
HERE = Path(__file__).parent
V = json.load(open(HERE / 'voice.json'))
lines, out = json.load(open(sys.argv[1])), Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
seed = int(sys.argv[3]) if len(sys.argv) > 3 else 7
only = {int(x) for x in sys.argv[4].split(',')} if len(sys.argv) > 4 else None
from qwen_tts import Qwen3TTSModel
m = Qwen3TTSModel.from_pretrained(V['clone_with'], device_map='cpu', dtype=torch.float32)
prompt = m.create_voice_clone_prompt(ref_audio=str(HERE / V['reference']['audio']), ref_text=V['reference']['text'])
for i, text in enumerate(lines):
    if only and i not in only: continue
    torch.manual_seed(seed); t = time.time()
    w, sr = m.generate_voice_clone(text=text, language='English', voice_clone_prompt=prompt)
    sf.write(out / f'line_{i:02d}.wav', w[0], sr); print('line', i, f'{time.time() - t:.0f}s', round(len(w[0]) / sr, 2), flush=True)

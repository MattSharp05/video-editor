# Kokoro-82M (Apache 2.0): stock voices only, no cloning.
import json, numpy as np, soundfile as sf
from kokoro import KPipeline
L = json.load(open('lines.json')); p = KPipeline(lang_code='a')
for v in ['am_michael', 'am_puck', 'af_heart']:
    for ln in L['lines']:
        audio = np.concatenate([a for _, _, a in p(ln['text'], voice=v, speed=1.0)])
        sf.write(f"work/kokoro-{v}_{ln['id']}.wav", audio, 24000); print(v, ln['id'], flush=True)

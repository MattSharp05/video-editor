# Kokoro-82M (Apache 2.0) stock voices. Usage: python gen_kokoro.py <raw_dir>
import json, sys, time, numpy as np, soundfile as sf
from kokoro import KPipeline
RAW = sys.argv[1]; L = json.load(open('lines.json'))['lines']; V = json.load(open('voices.json'))['kokoro']
pipes = {c: KPipeline(lang_code=c, repo_id='hexgrad/Kokoro-82M') for c in 'ab'}
for v, _ in V:
    try:
        for ln in L:
            t = time.time()
            audio = np.concatenate([a for _, _, a in pipes['b' if v[0] == 'b' else 'a'](ln['text'], voice=v, speed=1.0)])
            sf.write(f"{RAW}/kokoro-{v}_{ln['id']}.wav", audio, 24000); print(v, ln['id'], f'{time.time()-t:.1f}s', flush=True)
    except Exception as e:
        print('FAIL', v, repr(e), flush=True)

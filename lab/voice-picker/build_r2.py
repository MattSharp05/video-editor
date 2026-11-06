"""Voice Picker round 2: your clone / American male / American female. Not blind: pick one voice per category.
Same processing as round 1 (trim in Python, -16 LUFS), clips under clips/r2_*.mp3, page from picker2.src.html."""
import json, re, subprocess
from pathlib import Path
import numpy as np
HERE = Path(__file__).parent
V = json.load(open(HERE / 'voices_r2.json')); L = json.load(open(HERE / 'lines.json'))['lines']
CATS = [('clone', 'Your clone', 'Your own voice, cloned from 12 seconds of take 1. Your South African accent stays.'),
        ('male', 'American male', 'A stock AI voice, for videos where it doesn\'t need to be you speaking.'),
        ('female', 'American female', 'A stock AI voice, for videos where it doesn\'t need to be you speaking.')]
SR = 24000
def enc(src, dst):
    x = np.frombuffer(subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(src), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                                     check=True, capture_output=True).stdout, np.float32)
    hop = 240; env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    on = np.where(20 * np.log10(env + 1e-9) > -45)[0]
    a = max(0, on[0] * hop - int(0.15 * SR)); b = min(len(x), (on[-1] + 1) * hop + int(0.25 * SR))
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                    '-ar', '44100', '-ac', '1', '-b:a', '128k', str(dst)], input=x[a:b].tobytes(), check=True)
    return round((b - a) / SR, 2)
cats = []
for cid, name, about in CATS:
    opts = []
    for v in V[cid]:
        takes = {}
        for ln in L:
            src = HERE / 'work' / f"r2_{v['key']}_{ln['id']}.wav"
            if not src.exists(): continue
            dst = HERE / 'clips' / f"r2_{v['key']}_{ln['id']}.mp3"; s = enc(src, dst)
            takes[ln['id']] = {'file': f'clips/{dst.name}', 'seconds': s, 'wps': round(len(re.findall(r"[\w']+", ln['text'])) / s, 2)}
        if len(takes) == len(L):
            opts.append({'key': v['key'], 'name': v['name'], 'takes': takes,
                         'licence': 'MIT' if v['key'].startswith('cb') else 'Apache 2.0', 'how': v.get('design') or (f"preset speaker {v['speaker']}, asked to speak calmly" if 'speaker' in v else '')})
    cats.append({'id': cid, 'name': name, 'about': about, 'options': opts})
page = (HERE / 'picker2.src.html').read_text().replace('/*CATS*/[]', json.dumps(cats)).replace('/*LINES*/[]', json.dumps(L))
(HERE / 'picker.html').write_text(page)
for c in cats: print(c['id'], [(o['key'], {k: t['wps'] for k, t in o['takes'].items()}) for o in c['options']])

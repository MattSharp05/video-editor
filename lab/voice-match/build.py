"""Voice match page: the reel's two lines (reference) plus the designed voices, trimmed and matched to -16 LUFS.
Clips under clips/, page from picker.src.html (adapted from lab/voice-picker/picker2.src.html). Usage: python3 build.py <reel.wav>"""
import json, re, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / 'voice-picker'))
HERE = Path(__file__).parent
V = json.load(open(HERE / 'voices.json')); L = V['lines']; reel = sys.argv[1]
exec(re.search(r'SR = 24000\n(def enc.*?return round\(\(b - a\) / SR, 2\))', (HERE.parent / 'voice-picker' / 'build_r2.py').read_text(), re.S).group(0))
import numpy as np
wps = lambda ln, s: round(len(re.findall(r"[\w']+", ln['text'])) / s, 2)
opts = [{'key': 'reel', 'ref': True, 'name': 'The reel (reference)', 'licence': 'not ours', 'how': 'cut from the Instagram reel, music and effects included', 'takes': {}}]
for ln in L:
    cut = HERE / 'work' / f"reel_{ln['id']}.wav"
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', reel, '-ss', str(ln['reel'][0]), '-to', str(ln['reel'][1]), str(cut)], check=True)
    s = enc(cut, HERE / 'clips' / f"reel_{ln['id']}.mp3"); opts[0]['takes'][ln['id']] = {'file': f"clips/reel_{ln['id']}.mp3", 'seconds': s, 'wps': wps(ln, s)}
for v in V['voices']:
    takes = {}
    for ln in L:
        src = HERE / 'work' / f"{v['key']}_{ln['id']}.wav"
        if not src.exists(): continue
        s = enc(src, HERE / 'clips' / f"{v['key']}_{ln['id']}.mp3"); takes[ln['id']] = {'file': f"clips/{v['key']}_{ln['id']}.mp3", 'seconds': s, 'wps': wps(ln, s)}
    if len(takes) == len(L): opts.append({'key': v['key'], 'name': v['name'], 'takes': takes, 'licence': 'Apache 2.0', 'how': 'Qwen3-TTS VoiceDesign: ' + v['design']})
cats = [{'id': 'match', 'name': 'Sounds like the reel', 'about': 'Play the reel first, then each voice. Pick the closest, or "None of these fit" and say what is off.', 'options': opts}]
lines = [{k: ln[k] for k in ('id', 'name', 'text')} for ln in L]
(HERE / 'picker.html').write_text((HERE / 'picker.src.html').read_text().replace('/*CATS*/[]', json.dumps(cats)).replace('/*LINES*/[]', json.dumps(lines)))
print([(o['key'], {k: t['wps'] for k, t in o['takes'].items()}) for o in opts])

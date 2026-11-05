"""Voice Picker build: trims, level-matches and encodes every take in work/, assigns blind letters, writes picker.html.

Each voice gets one letter across both lines (so a verdict per voice is possible); the order is shuffled with a fixed
seed so the real take isn't always first. Levels: -16 LUFS integrated, so loudness doesn't decide the vote.
"""
import json, random, re, subprocess
from pathlib import Path

HERE = Path(__file__).parent
VOICES = [  # key: (name, kind, licence)
    ('real', ('Your recording (take 1)', 'real', 'yours')),
    ('cb', ('Chatterbox, clone of your voice', 'clone', 'MIT, free to publish')),
    ('cb-calm', ('Chatterbox, clone, calmer setting', 'clone', 'MIT, free to publish')),
    ('turbo', ('Chatterbox Turbo, clone', 'clone', 'MIT, free to publish')),
    ('qwen-1.7B', ('Qwen3-TTS 1.7B, clone', 'clone', 'Apache 2.0, free to publish')),
    ('kokoro-am_michael', ('Kokoro, stock voice "Michael"', 'stock', 'Apache 2.0, free to publish')),
    ('kokoro-am_puck', ('Kokoro, stock voice "Puck"', 'stock', 'Apache 2.0, free to publish')),
    ('kokoro-af_heart', ('Kokoro, stock voice "Heart"', 'stock', 'Apache 2.0, free to publish')),
]
L = json.load(open(HERE / 'lines.json'))

def dur(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)]))

out = []
for key, (name, kind, lic) in VOICES:
    takes = {}
    for ln in L['lines']:
        src = HERE / 'work' / f"{key}_{ln['id']}.wav"
        if not src.exists():
            continue
        dst = HERE / 'clips' / f"{key}_{ln['id']}.mp3"
        # trim silence at both ends (keep 0.15 s), then level-match
        af = ('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,'
              'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.25,areverse,'
              'loudnorm=I=-16:TP=-1.5:LRA=11')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', af, '-ar', '44100', '-ac', '1', '-b:a', '128k', str(dst)], check=True)
        d = dur(dst); words = len(re.findall(r"[\w']+", ln['text']))
        takes[ln['id']] = {'file': f'clips/{dst.name}', 'seconds': round(d, 2), 'wps': round(words / d, 2)}
    if len(takes) == len(L['lines']):
        out.append({'key': key, 'name': name, 'kind': kind, 'licence': lic, 'takes': takes})

random.Random(11).shuffle(out)
for i, v in enumerate(out):
    v['letter'] = 'ABCDEFGHIJ'[i]
json.dump(out, open(HERE / 'voices.json', 'w'), indent=1)
page = (HERE / 'picker.src.html').read_text()
page = page.replace('/*VOICES*/[]', json.dumps(out)).replace('/*LINES*/[]', json.dumps(L['lines']))
(HERE / 'picker.html').write_text(page)
for v in out:
    print(v['letter'], v['key'], {k: (t['seconds'], t['wps']) for k, t in v['takes'].items()})

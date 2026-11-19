# Trim silence (RMS -42 dB), join "both" with a 0.35 s gap, loudness-match to -16 LUFS (two-pass loudnorm), save 48 kHz mono
# MP3 192k into samples/; transcribe each "both" clip (faster-whisper small.en) and write samples/manifest.json.
# Usage: python process.py <raw_dir>
import json, os, re, subprocess, sys, numpy as np, soundfile as sf
RAW = sys.argv[1]; OUT = 'samples'; TMP = f'{RAW}/trim'; os.makedirs(TMP, exist_ok=True); os.makedirs(OUT, exist_ok=True)
C = json.load(open('lines.json')); V = json.load(open('voices.json'))
SCRIPT = ' '.join(l['text'] for l in C['lines']); NWORDS = len(SCRIPT.split())  # 17
QWEN, KOKORO = 'Qwen3-TTS 12Hz 1.7B', 'Kokoro-82M'
META = {'qwen-clone-matthew': ('Qwen · your voice clone (Base)', f'{QWEN} Base', 'Apache 2.0', 'Your clone',
                               'Cloned from 12.5 s of trip-social-01 take 1 (8.30-20.80 s). Line 2 seed 21; line 1 seed 7 (seed 21 said "How do people"). For your own videos only.'),
        'qwen-design-m2': ('Qwen · design-m2 (your round-2 pick) · low, understated American male, 30s', f'{QWEN} Base (clone)', 'Apache 2.0',
                           'American male', 'Cloned from the grand-canyon-01 hook reference (ref_design-m2_hook.wav), seed 7.'),
        'cb-default': ('Chatterbox · built-in voice · American female', 'Chatterbox (Resemble AI)', 'MIT', 'American female',
                       'Built-in default voice, exaggeration 0.5, cfg 0.5. Output carries an inaudible Perth watermark.')}
for v in V['design']:
    META[v['key']] = (v['name'], f'{QWEN} VoiceDesign → Base clone', 'Apache 2.0', v['category'],
                      'One VoiceDesign reference clip of a neutral sentence (seed 7), both lines cloned from it with Base (seed 7).')
for v, d in V['kokoro']:
    cat = {'am': 'American male', 'af': 'American female', 'bm': 'British male', 'bf': 'British female'}[v[:2]]
    META[f'kokoro-{v}'] = (f'Kokoro · {v} · {d}', KOKORO, 'Apache 2.0', cat, 'Stock voice, speed 1.0.')
CUSTOM = {'aiden': 'American male', 'ryan': 'American male'}
for s, cat in CUSTOM.items():
    META[f'qwen-custom-{s}'] = (f'Qwen · preset "{s.title()}" · {cat}', f'{QWEN} CustomVoice', 'Apache 2.0', cat,
                                'Preset speaker with instruction: ' + V['custom_instruct'])

def trim(x, sr):
    hop = sr // 100; env = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
    on = np.where(20 * np.log10(env + 1e-9) > -42)[0]
    return x[max(0, on[0] * hop - int(0.03 * sr)): min(len(x), (on[-1] + 1) * hop + int(0.12 * sr))]

def to_mp3(src, dst):
    m = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
    af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', af, '-ac', '1', '-ar', '48000', '-b:a', '192k', dst], check=True)

pcm16k = lambda f: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
    capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768  # decode via ffmpeg (PyAV/faster-whisper version mismatch)
norm = lambda s: re.sub(r"[^a-z0-9' ]", ' ', s.lower().replace('-', ' ').replace('nineteen forty six', '1946')).split()
from faster_whisper import WhisperModel
asr = WhisperModel('small.en', device='cpu', compute_type='int8')
keys = sorted({f.rsplit('_', 1)[0] for f in os.listdir(RAW) if f.endswith('_1.wav') and not f.startswith('ref_')})
MF = f'{OUT}/manifest.json'  # incremental: keep entries whose MP3s already exist
manifest = [m for m in (json.load(open(MF)) if os.path.exists(MF) else []) if all(os.path.exists(f'{OUT}/{f}') for f in m['files'].values())]
done = {m['key'] for m in manifest}
for key in keys:
    if key in done: continue
    if not os.path.exists(f'{RAW}/{key}_2.wav'): print('missing line 2', key); continue
    segs = []
    for i in '12':
        x, sr = sf.read(f'{RAW}/{key}_{i}.wav', dtype='float32')
        if x.ndim > 1: x = x.mean(1)
        x = trim(x, sr); segs.append(x); sf.write(f'{TMP}/{key}_{i}.wav', x, sr)
        to_mp3(f'{TMP}/{key}_{i}.wav', f'{OUT}/{key}_{i}.mp3')
    both = np.concatenate([segs[0], np.zeros(int(C['gap_s'] * sr), np.float32), segs[1]])
    sf.write(f'{TMP}/{key}_both.wav', both, sr); to_mp3(f'{TMP}/{key}_both.wav', f'{OUT}/{key}_both.mp3')
    dur = len(both) / sr
    text = ' '.join(s.text.strip() for s in asr.transcribe(pcm16k(f'{OUT}/{key}_both.mp3'), language='en', beam_size=5)[0])
    ok = norm(text) == norm(SCRIPT)
    name, model, lic, cat, notes = META.get(key, (key, '?', '?', 'Other', ''))
    if not ok: notes += f' ASR heard: "{text}"'
    manifest.append(dict(key=key, name=name, model=model, licence=lic, category=cat,
                         files={'1': f'{key}_1.mp3', '2': f'{key}_2.mp3', 'both': f'{key}_both.mp3'},
                         pace_wps=round(NWORDS / dur, 2), transcript_ok=ok, notes=notes.strip()))
    if key == 'kokoro-af_nicole': manifest[-1]['notes'] += ' A whispery, close-mic voice; much slower than the rest.'
    if key.startswith('qwen-design') and key != 'qwen-design-m2': manifest[-1]['notes'] += f' Reference clip: vo/refs/ref_{key}.wav.'
    if key == 'kokoro-af_nicole': manifest[-1]['notes'] += ' A whispery, close-mic voice; much slower than the rest.'
    if key.startswith('qwen-design') and key != 'qwen-design-m2': manifest[-1]['notes'] += f' Reference clip: vo/refs/ref_{key}.wav.'
    print(key, round(dur, 2), manifest[-1]['pace_wps'], ok, '' if ok else text, flush=True)
order = ['Your clone', 'American male', 'American female', 'British male', 'British female', 'Other']
manifest.sort(key=lambda m: (order.index(m['category']), m['key']))
json.dump(manifest, open(MF, 'w'), indent=1, ensure_ascii=False); print('wrote', len(manifest))

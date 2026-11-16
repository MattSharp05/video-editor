# Assemble each voice's full render: trim each line (RMS -42 dB), join with pauses (0.35 s; 0.6 s before the era turns),
# 0.25 s lead-in and 0.5 s tail, loudness -16 LUFS (two-pass loudnorm) -> full/<key>/vo.wav (48 kHz mono) and full/<key>.mp3
# (48 kHz mono 192k), line_starts.json, words.json (faster-whisper small.en word timestamps), then full/manifest.json.
# Usage: python process_full.py <raw_dir> [key,...]
import json, os, subprocess, sys, numpy as np, soundfile as sf
from asrcheck import transcribe, norm
RAW = f'{sys.argv[1]}/full'; OUT = 'full'; C = json.load(open('full_lines.json')); L = C['lines']
SCRIPT = ' '.join(L); NWORDS = len(SCRIPT.split())
keys = sys.argv[2].split(',') if len(sys.argv) > 2 else C['keys']
takes = json.load(open(f'{RAW}/takes.json')); samples = {m['key']: m for m in json.load(open('samples/manifest.json'))}
MF = f'{OUT}/manifest.json'; manifest = {m['key']: m for m in (json.load(open(MF)) if os.path.exists(MF) else [])}

def trim(x, sr):
    hop = sr // 100; env = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
    on = np.where(20 * np.log10(env + 1e-9) > -42)[0]
    return x[max(0, on[0] * hop - int(0.03 * sr)): min(len(x), (on[-1] + 1) * hop + int(0.12 * sr))]

def loudnorm(src, wav, mp3):
    m = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
    af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', af, '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', wav], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '48000', '-b:a', '192k', mp3], check=True)

for key in keys:
    files = [f'{RAW}/{key}_{i:02d}.wav' for i in range(1, len(L) + 1)]
    if not all(os.path.exists(f) for f in files): print('incomplete', key); continue
    os.makedirs(f'{OUT}/{key}', exist_ok=True)
    out, starts, t = [], [], 0.25
    for i, f in enumerate(files, 1):
        x, sr = sf.read(f, dtype='float32'); x = x.mean(1) if x.ndim > 1 else x
        if i == 1: out.append(np.zeros(int(0.25 * sr), np.float32))
        else:
            g = C['long_gap_s'] if i in C['long_gap_before'] else C['gap_s']; out.append(np.zeros(int(g * sr), np.float32)); t += g
        seg = trim(x, sr); starts.append(round(t, 3)); out.append(seg); t += len(seg) / sr
    out.append(np.zeros(int(0.5 * sr), np.float32)); y = np.concatenate(out)
    sf.write(f'{RAW}/{key}_joined.wav', y, sr)
    loudnorm(f'{RAW}/{key}_joined.wav', f'{OUT}/{key}/vo.wav', f'{OUT}/{key}.mp3')
    json.dump(starts, open(f'{OUT}/{key}/line_starts.json', 'w'))
    segs = transcribe(f'{OUT}/{key}/vo.wav', words=True)
    words = [dict(w=w.word.strip(), s=round(w.start, 2), e=round(w.end, 2)) for s in segs for w in s.words]
    json.dump(words, open(f'{OUT}/{key}/words.json', 'w'), indent=0)
    heard = ' '.join(s.text.strip() for s in segs); ok = norm(heard) == norm(SCRIPT)
    dur = len(y) / sr; speech = t - 0.25
    tk = takes.get(key, {}); retakes = {k: v['seed'] for k, v in tk.items() if v['tries'] > 1}
    bad = {k: v['heard'] for k, v in tk.items() if not v['ok']}
    s = samples[key]; notes = []
    if key.startswith('kokoro'): notes.append('Stock voice, speed 1.0.')
    elif key.startswith('qwen-custom'):
        notes.append(f'Every line cloned with Qwen3-TTS Base from the preset\'s own hook clip (vo/refs/ref_{key}_hook.wav, CustomVoice seed 7), '
                     'not generated per line with the preset, so the voice cannot drift. Seed 7 unless a retake is listed.')
    elif key == 'qwen-design-m2': notes.append('Cloned (Base) from the grand-canyon-01 hook reference, seed 7 unless a retake is listed.')
    else: notes.append(f'Cloned (Base) from the VoiceDesign reference vo/refs/ref_{key}.wav, seed 7 unless a retake is listed.')
    if retakes: notes.append('Retakes (line: seed kept): ' + ', '.join(f'{k}: {v}' for k, v in retakes.items()) + '.')
    if bad: notes.append(('Isolated-line ASR' + ('' if key.startswith('kokoro') else ' (after retakes)') + ' heard: ')
                         + '; '.join(f'line {k} "{v}"' for k, v in bad.items())
                         + ('. The full-file transcript matches the script, so probably ASR clipping a final -d; worth a listen.' if ok else '.'))
    if not ok: notes.append(f'Full-file ASR heard: "{heard}"')
    old = manifest.get(key, {}).get('notes_extra')
    manifest[key] = dict(key=key, name=s['name'], model=s['model'] + (' (Base clone of preset hook clip)' if key.startswith('qwen-custom') else ''),
                         duration_s=round(dur, 2), speech_s=round(speech, 2), wps=round(NWORDS / dur, 2),
                         transcript_ok=ok, retakes=len(retakes), notes=' '.join(notes))
    if old: manifest[key]['notes_extra'] = old
    print(key, round(dur, 2), manifest[key]['wps'], ok, retakes, bad, '' if ok else heard, flush=True)
    json.dump([manifest[k] for k in C['keys'] if k in manifest], open(MF, 'w'), indent=1, ensure_ascii=False)

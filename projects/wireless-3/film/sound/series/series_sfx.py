"""Series SFX track builder (the mix helper the parts call).

    import sys; sys.path.insert(0, '<kit>/sound'); from series_sfx import build_sfx
    build_sfx(cues, total_frames, 'out/sfx.wav', fps=30)

cues: list of {"sound": "morse-beep", "fr": 312, "gain_db": 0 (optional trim), "pan": -1..1, "dur_fr": n (optional:
hold/trim the sound to n frames; for morse-beep a dash uses the long beep)}. Each sound plays at the series gain from
series.json (identical in every part) plus the cue's trim. Writes a 48 kHz stereo 16-bit WAV exactly total_frames/fps
long, peak-limited to -3 dBFS. Mix it in your mix.py at 0 dB under the VO (the levels are already set under speech).

CLI: uv run --with numpy python series_sfx.py cues.json TOTAL_FRAMES out.wav    (cues.json = list or {"cues": [...]})
Unknown sound names raise. Get cue frames from the kit's TS helpers (titleCues, morseCues, endCardCues,
moustacheCues, headlineCues in src/series/sound.ts) so sound and picture match.
"""
import json, os, sys, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
CFG = json.load(open(os.path.join(HERE, 'series.json')))['sounds']

def _read(name):
    with wave.open(os.path.join(HERE, name + '.wav')) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32767

def build_sfx(cues, total_frames, out_path, fps=30):
    n = int(round(total_frames / fps * SR))
    L = np.zeros(n, np.float32); R = np.zeros(n, np.float32); cache = {}
    for c in cues:
        name = c['sound']
        if name not in CFG: raise KeyError(f'unknown series sound: {name} (have {sorted(CFG)})')
        src = name
        if name == 'morse-beep' and c.get('dur_fr', 0) * SR / fps > 0.08 * SR: src = 'morse-beep-long'
        x = cache.setdefault(src, _read(src)).copy()
        if c.get('dur_fr'):
            m = int(c['dur_fr'] / fps * SR)
            if m < len(x): x = x[:m]; r = min(len(x), int(0.01 * SR)); x[-r:] *= np.linspace(1, 0, r)
        x *= 10 ** ((CFG[name]['gain_db'] + c.get('gain_db', 0)) / 20)
        i = int(round(c['fr'] / fps * SR))
        if i >= n or i < 0: continue
        x = x[: n - i]
        p = max(-1, min(1, c.get('pan', 0))); gl, gr = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
        L[i:i + len(x)] += x * gl * 1.414; R[i:i + len(x)] += x * gr * 1.414
    st = np.stack([L, R], 1); pk = np.max(np.abs(st)) or 1; lim = 10 ** (-3 / 20)
    if pk > lim: st *= lim / pk
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
    return out_path

if __name__ == '__main__':
    cues = json.load(open(sys.argv[1])); cues = cues.get('cues', cues) if isinstance(cues, dict) else cues
    print(build_sfx(cues, int(sys.argv[2]), sys.argv[3]))

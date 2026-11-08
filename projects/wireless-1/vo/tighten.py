# Fit the 90 s ceiling (SERIES-BRIEF) without touching the words: shorten pauses inside each generated line to at most
# MAXP s (RMS < -40 dB runs), then optionally lift tempo by TEMPO with ffmpeg rubberband (pitch kept). Writes
# line_NN.tight.wav, which assemble.py prefers. usage: python tighten.py [TEMPO=1.0] [MAXP=0.3]
import json, subprocess, sys, numpy as np, soundfile as sf
TEMPO = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
MAXP = float(sys.argv[2]) if len(sys.argv) > 2 else 0.3
L = json.load(open('lines.json')); tot0 = tot1 = 0
for i in range(len(L)):
    x, sr = sf.read(f'line_{i:02d}.wav', dtype='float32'); hop = 240
    env = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
    loud = 20 * np.log10(env + 1e-9) > -40
    on = np.where(loud)[0]; a, b = on[0], on[-1]
    keep = np.ones(len(x), bool); k = a
    while k <= b:
        if not loud[k]:
            j = k
            while j <= b and not loud[j]: j += 1
            if (j - k) * hop / sr > MAXP:
                cut0 = k * hop + int(MAXP / 2 * sr); cut1 = j * hop - int(MAXP / 2 * sr)
                keep[cut0:cut1] = False
            k = j
        else: k += 1
    y = x[keep]; sf.write(f'line_{i:02d}.tight.wav', y, sr)
    if TEMPO != 1.0:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'line_{i:02d}.tight.wav', '-af', f'rubberband=tempo={TEMPO}:pitchq=quality', '-ar', str(sr), f'line_{i:02d}.tight2.wav'], check=True)
        subprocess.run(['mv', f'line_{i:02d}.tight2.wav', f'line_{i:02d}.tight.wav'], check=True)
    y2, _ = sf.read(f'line_{i:02d}.tight.wav'); tot0 += len(x) / sr; tot1 += len(y2) / sr
    print(i, round(len(x) / sr, 2), '->', round(len(y2) / sr, 2))
print('total', round(tot0, 2), '->', round(tot1, 2))

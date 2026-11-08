"""Build the Caught by Wireless series sounds (48 kHz mono 16-bit WAVs) into this folder.

uv run --with numpy python synth.py      (needs ffmpeg for the CC0 sources)

Synthesized: sting, morse-beep, spark-crackle (layered over CC0), feather-chime, paper-flip, newspaper-rustle, ticker,
clue-ring, hunch-click, type-tick, moustache-click. CC0 (library/sfx/cstack-cc0, Freesound CC0 1.0): wing-flutter,
ship-horn-bed (ship-horn-distant + ocean-surface), headline-thunk (impact-deep, shortened), stamp (rubber-stamp),
spark-crackle (electric-spark-crackle + synth). Deterministic (fixed seeds).
"""
import os, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.abspath(os.path.join(HERE, '../../../../library/sfx/cstack-cc0'))
SR = 48000
rng = np.random.default_rng(1910)

def load(name, dur=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', os.path.join(LIB, name + '.flac'), '-ac', '1', '-ar', str(SR), '-f', 's16le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype='<i2').astype(np.float32) / 32767
    return x[: int(dur * SR)] if dur else x
def save(name, x, peak_db=-3.0):
    x = np.asarray(x, np.float32); pk = np.max(np.abs(x)) or 1; x = x / pk * 10 ** (peak_db / 20)
    with wave.open(os.path.join(HERE, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
def t(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.005, r=0.1):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR)); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def fade(x, a=0.005, r=0.05): return x * env(len(x), a, r)
def lp(x, k=8):
    return np.convolve(x, np.ones(k) / k, mode='same')
def hp(x, k=8): return x - lp(x, k)
def place(dst, src, at):
    i = int(at * SR); n = min(len(src), len(dst) - i)
    if n > 0: dst[i:i + n] += src[:n]
    return dst

# morse beep: 800 Hz, 70 ms (a dot; parts get one per tap — dashes are the same sample held by the mix helper's dur_fr)
tt = t(0.07); beep = np.sin(2 * np.pi * 800 * tt) * 0.9 + 0.1 * np.sin(2 * np.pi * 1600 * tt); save('morse-beep', fade(beep, 0.003, 0.012), -4)
# a long beep for dashes (series_sfx trims to dur_fr)
tt = t(0.6); save('morse-beep-long', fade(np.sin(2 * np.pi * 800 * tt) * 0.9 + 0.1 * np.sin(2 * np.pi * 1600 * tt), 0.003, 0.012), -4)
# spark crackle: CC0 crackle + synthetic sparse clicks
cr = load('electric-spark-crackle', 0.9); n = len(cr); clicks = np.zeros(n)
for _ in range(40):
    i = rng.integers(0, n - 200); clicks[i:i + 120] += rng.normal(0, 1, 120) * np.exp(-np.arange(120) / 18)
save('spark-crackle', fade(hp(cr, 4) * 0.8 + clicks * 0.25, 0.002, 0.15), -6)
# sting: rising spark arpeggio (Morse-like C-B-W rhythm) over a low pad
d = 2.4; out = np.zeros(int(d * SR)); tt = t(d)
pad = (np.sin(2 * np.pi * 110 * tt) + 0.5 * np.sin(2 * np.pi * 164.8 * tt) + 0.35 * np.sin(2 * np.pi * 220 * tt)) * np.minimum(1, tt / 0.4) * np.exp(-tt / 1.4)
out += pad * 0.35
for k, (at, f) in enumerate([(0.0, 659.3), (0.18, 784), (0.30, 987.8), (0.52, 1318.5)]):
    nt = t(0.5); tone = (np.sin(2 * np.pi * f * nt) + 0.3 * np.sin(2 * np.pi * 2 * f * nt)) * np.exp(-nt / 0.18)
    place(out, tone * 0.5, at)
place(out, hp(load('electric-spark-crackle', 0.5), 4) * 0.25, 0.0)
save('sting', fade(out, 0.002, 0.4), -3)
# wing flutter (CC0) + moustache click (synth: small woody click)
save('wing-flutter', fade(load('wing-flutter', 1.2), 0.01, 0.3), -6)
nt = t(0.06); click = (np.sin(2 * np.pi * 2400 * nt) * np.exp(-nt / 0.006) + rng.normal(0, 0.4, len(nt)) * np.exp(-nt / 0.003)); save('moustache-click', fade(click, 0.0005, 0.01), -6)
# feather chime: one soft high glass note (synth bell partials)
nt = t(2.0); f = 1567.98; bell = sum(a * np.sin(2 * np.pi * f * m * nt) * np.exp(-nt / dcy) for a, m, dcy in [(1, 1, 0.9), (0.4, 2.76, 0.35), (0.2, 5.4, 0.18)])
save('feather-chime', fade(bell, 0.004, 0.5), -8)
# paper flip: two shaped noise swishes
d = 0.35; nz = rng.normal(0, 1, int(d * SR)); tt = t(d); e = np.exp(-((tt - 0.08) / 0.05) ** 2) + 0.6 * np.exp(-((tt - 0.2) / 0.06) ** 2)
save('paper-flip', fade(hp(nz, 3) * e, 0.002, 0.05), -6)
# headline thunk: CC0 impact-deep, first 0.7 s
save('headline-thunk', fade(lp(load('impact-deep', 0.7), 3), 0.002, 0.25), -4)
# newspaper rustle: 1.2 s crinkly bursts
d = 1.2; out = np.zeros(int(d * SR))
for _ in range(26):
    L = int(rng.uniform(0.01, 0.06) * SR); b = hp(rng.normal(0, 1, L), 2) * np.hanning(L) * rng.uniform(0.3, 1)
    place(out, b, rng.uniform(0, d - 0.07))
save('newspaper-rustle', fade(out, 0.01, 0.2), -8)
# ship horn bed: 8 s ocean with the distant horn at 1.0 s (loopable bed: parts trim/loop as needed)
oc = load('ocean-surface', 8.0); hn = load('ship-horn-distant', 6.0); bed = oc * 0.6; place(bed, hn * 0.8, 1.0)
save('ship-horn-bed', fade(bed, 0.6, 1.0), -6)
# ticker: 1.0 s of fast printer ticks
d = 1.0; out = np.zeros(int(d * SR)); nt = t(0.012)
for i in range(18): place(out, np.sin(2 * np.pi * 3200 * nt) * np.exp(-nt / 0.002) * (0.7 + 0.3 * (i % 2)), i * 0.055)
save('ticker', out, -8)
# clue ring: soft rising pluck (two notes)
out = np.zeros(int(0.6 * SR)); nt = t(0.5)
for at, f in [(0, 880), (0.07, 1318.5)]: place(out, np.sin(2 * np.pi * f * nt) * np.exp(-nt / 0.15), at)
save('clue-ring', fade(out, 0.002, 0.1), -9)
# hunch click: switch click + small bright ding
out = np.zeros(int(0.8 * SR)); place(out, click * 1.0, 0); nt = t(0.7); place(out, (np.sin(2 * np.pi * 2093 * nt) + 0.3 * np.sin(2 * np.pi * 4186 * nt)) * np.exp(-nt / 0.2) * 0.5, 0.05)
save('hunch-click', fade(out, 0.001, 0.15), -8)
# stamp: CC0 rubber-stamp
save('stamp', fade(load('rubber-stamp'), 0.001, 0.05), -5)
# type tick: telegraph typewriter tick
nt = t(0.05); save('type-tick', fade(np.sin(2 * np.pi * 1800 * nt) * np.exp(-nt / 0.004) + rng.normal(0, 0.3, len(nt)) * np.exp(-nt / 0.002), 0.0005, 0.01), -9)
print('ok', sorted(f for f in os.listdir(HERE) if f.endswith('.wav')))

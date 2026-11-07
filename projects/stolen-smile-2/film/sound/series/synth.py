"""Synthesize the Stolen Smile series sounds (all synthesized here, or processed CC0 cstack-cc0 files).
Run: uv run --with numpy python synth.py   → writes *.wav (48 kHz mono, peak-normalised to the gains in series.json).
Soft, dark-warm, short (BUILD-BRIEF: "Not big clinks or chimes")."""
import json, subprocess, wave, os
import numpy as np
SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
CC0 = os.path.join(HERE, '../../../../library/sfx/cstack-cc0')
rng = np.random.default_rng(7)

def t(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.003, d=0.3):
    x = np.arange(n) / SR
    return np.minimum(1, x / a) * np.exp(-x / d)
def lp(x, k=0.15):  # one-pole low-pass
    y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s += k * (v - s); y[i] = s
    return y
def hp(x, k=0.15): return x - lp(x, k)
def write(name, x, peak_db):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)
    fade = min(len(x), int(0.01 * SR)); x[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(HERE, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
def load(name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(CC0, name), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype='<f4').copy()
def bell(f, d, partials=((1, 1), (2.76, .35), (5.4, .12)), decay=0.5):
    x = t(d); return sum(a * np.sin(2 * np.pi * f * m * x) * np.exp(-x * m / decay) for m, a in partials)

# sting-smile: 2.5 s music box, three notes up and one down ("a smile"): E5 G5 B5 → G5
notes = [(0.0, 659.3), (0.38, 784.0), (0.76, 987.8), (1.3, 784.0)]
out = np.zeros(int(SR * 2.6))
for st, f in notes:
    b = bell(f, 1.3, ((1, 1), (3.0, .25), (4.1, .08)), decay=0.55) * env(int(SR * 1.3), 0.002, 0.6)
    i = int(st * SR); out[i:i + len(b)] += b
pad = sum(np.sin(2 * np.pi * f * t(2.6)) for f in (164.8, 246.9)) * 0.12 * np.sin(np.pi * t(2.6) / 2.6) ** 2
write('sting-smile', out + pad, -6)
# hook-clink: bright but soft metal tink (short, damped)
x = bell(2350, 0.35, ((1, 1), (2.4, .4), (3.9, .2)), decay=0.18) * env(int(SR * .35), 0.001, 0.09)
write('hook-clink', x + 0.15 * hp(rng.standard_normal(len(x)), .5) * env(len(x), 0.0005, 0.006), -12)
# hook-hum: low empty hum (the empty hooks never clink)
x = t(1.6); h = (np.sin(2 * np.pi * 98 * x) + 0.5 * np.sin(2 * np.pi * 147.5 * x) + 0.25 * np.sin(2 * np.pi * 196.7 * x)) * np.sin(np.pi * x / 1.6) ** 2
write('hook-hum', h * (1 + 0.15 * np.sin(2 * np.pi * 3 * x)), -16)
# cloth-swish: filtered noise swell
x = t(0.5); n = lp(rng.standard_normal(len(x)), 0.25); write('cloth-swish', hp(n, .05) * np.sin(np.pi * x / 0.5) ** 1.5, -14)
# glint: tiny high chime + shimmer (also the amber-leak shimmer's head)
x = t(0.7); g = bell(3136, .7, ((1, 1), (2.0, .3)), decay=.25) * env(len(x), .002, .2) + 0.4 * bell(4186, .7, ((1, 1),), decay=.18) * np.concatenate([np.zeros(int(.06 * SR)), env(len(x) - int(.06 * SR), .002, .15)])
write('glint', g, -15)
# amber-shimmer: soft looping-ish shimmer under the amber leak (1.8 s, fades in/out)
x = t(1.8); sh = sum(np.sin(2 * np.pi * f * x + p) for f, p in ((1318.5, 0), (1661.2, 1), (1975.5, 2))) * (0.6 + 0.4 * np.sin(2 * np.pi * 5.5 * x)) * np.sin(np.pi * x / 1.8) ** 2
write('amber-shimmer', sh, -22)
# question-plink: pizzicato pluck (Karplus-Strong) on A3
def pluck(f, d, damp=0.996):
    n = int(SR / f); buf = rng.uniform(-1, 1, n); out = np.zeros(int(SR * d))
    for i in range(len(out)):
        out[i] = buf[i % n]; buf[i % n] = damp * 0.5 * (buf[i % n] + buf[(i + 1) % n])
    return out
write('question-plink', pluck(220, 0.6) * env(int(SR * .6), .001, .25), -12)
# question-plink-up: the "?" straightening into "!" (two plucks up)
up = np.zeros(int(SR * .8)); a = pluck(220, .5) * env(int(SR * .5), .001, .2); b = pluck(330, .6) * env(int(SR * .6), .001, .25)
up[:len(a)] += a; up[int(.18 * SR):int(.18 * SR) + len(b)] += b; write('question-plink-up', up, -12)
# gauge-ratchet: 6 soft clicks
r = np.zeros(int(SR * .5))
for k in range(6):
    i = int(k * 0.07 * SR); c = hp(rng.standard_normal(int(.012 * SR)), .6) * env(int(.012 * SR), .0003, .003); r[i:i + len(c)] += c * (1 - k * 0.08)
write('gauge-ratchet', r, -16)
# gauge-boing: spring boing (pitch-wobbled sine) + glass tick
x = t(0.9); f = 180 + 60 * np.exp(-x * 4) * np.sin(2 * np.pi * 9 * x); ph = 2 * np.pi * np.cumsum(f) / SR
write('gauge-boing', np.sin(ph) * env(len(x), .003, .35) + 0.3 * bell(2600, .9, decay=.1) * env(len(x), .001, .05), -12)
# stamp: CC0 rubber-stamp, softened
try:
    s = load('rubber-stamp.flac'); s = s[:int(.5 * SR)]; write('stamp', lp(s, .35) * env(len(s), .001, .2), -10)
except Exception as e: print('stamp fallback', e); write('stamp', lp(rng.standard_normal(int(.3 * SR)), .1) * env(int(.3 * SR), .001, .04), -10)
# typewriter: one clack (place one per typed letter)
x = t(0.09); c = hp(rng.standard_normal(len(x)), .4) * env(len(x), .0004, .012) + 0.5 * np.sin(2 * np.pi * 900 * x) * env(len(x), .0005, .01)
write('typewriter', c, -18)
# paper-flap: fold-ups and carrier pushes (soft paper whump)
x = t(0.35); n = lp(rng.standard_normal(len(x)), .08); write('paper-flap', n * np.sin(np.pi * np.minimum(1, x / .35)) ** 0.7 * np.exp(-x * 6), -15)
# calendar-tear: paper rip (crackly noise burst)
x = t(0.4); n = hp(rng.standard_normal(len(x)), .3) * (rng.uniform(0, 1, len(x)) > 0.55) * np.exp(-x * 8) * np.minimum(1, x / .02)
write('calendar-tear', lp(n, .5), -16)
print('ok')

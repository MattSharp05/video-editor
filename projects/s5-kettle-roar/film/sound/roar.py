# Synthesize the kettle's sound from the picture's own loudness curve (sound/times.json: env, heat at 100 Hz).
# Loud phase: thousands of tiny collapse clicks (short decaying high bursts) coloured by a ringing "vessel" band and a
# hiss bed; boil: slower low "blub" pops and a soft rumble, quieter but continuous; the switch click is a cue in mix.py.
# usage: ~/.venv-qw/bin/python sound/roar.py  -> sound/work/roar.wav
import json, os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{HERE}/work', exist_ok=True)
T_ = json.load(open(f'{HERE}/times.json')); SR = 48000; N = int(T_['dur'] * SR)
tt = np.arange(N) / SR
env = np.interp(tt, np.arange(len(T_['env'])) / 100, T_['env']); heat = np.interp(tt, np.arange(len(T_['heat'])) / 100, T_['heat'])
rng = np.random.default_rng(7)
bp = lambda x, lo, hi, o=2: sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
# collapse clicks: Poisson, rate ~ env^2 * (1 - heat)
clicks = np.zeros(N); rate = 30 + 2200 * env ** 2 * (1 - heat) ** 1.5
p = rate / SR; hits = np.where(rng.random(N) < p)[0]
L = int(0.004 * SR); k = np.arange(L) / SR
for h in hits:
    f = rng.uniform(1500, 7000); a = rng.uniform(0.2, 1.0) * (0.6 + 0.4 * env[h]) * (1 - heat[h])
    seg = a * np.sin(2 * np.pi * f * k) * np.exp(-k / 0.0009); e = min(N, h + L); clicks[h:e] += seg[:e - h]
ring = bp(clicks, 1800, 3200, 2) * 2.2 + bp(clicks, 600, 9000, 1) # the vessel colours them
hiss = bp(rng.standard_normal(N), 2500, 8000, 2) * 0.05 * env * (1 - 0.6 * heat)
# boil: low blub pops and a soft rumble
blub = np.zeros(N); pr = (6 + 30 * heat) * (heat > 0.05) / SR; bh = np.where(rng.random(N) < pr)[0]
Lb = int(0.06 * SR); kb = np.arange(Lb) / SR
for h in bh:
    f0 = rng.uniform(180, 520); a = rng.uniform(0.3, 1.0) * heat[h] * (0.4 + env[h])
    seg = a * np.sin(2 * np.pi * (f0 * kb + 300 * kb * kb)) * np.exp(-kb / 0.018) * (1 - np.exp(-kb / 0.002)); e = min(N, h + Lb); blub[h:e] += seg[:e - h]
rumble = bp(rng.standard_normal(N), 80, 400, 2) * 0.06 * heat * (0.3 + env)
y = ring * 0.5 + hiss + blub * 0.35 + rumble
y = y / (np.max(np.abs(y)) + 1e-9) * 0.7
sf.write(f'{HERE}/work/roar.wav', np.stack([y, y], 1).astype(np.float32), SR)
print('roar', round(N / SR, 2), 's,', len(hits), 'clicks,', len(bh), 'blubs')

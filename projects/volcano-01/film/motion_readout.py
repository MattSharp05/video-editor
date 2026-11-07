# motion_check without a bar film (cloud sessions don't keep renders): read this film's movers per second and compare
# with the recorded bars (Grand Canyon 01 v1: median 11 movers/s; Lightsaber 01 v4: 20). Flags seconds with <= 3
# separate movers AND little change over 2 s, and writes 6-frame strips for them.
# usage: python motion_readout.py RENDER.mp4 [STRIPS_DIR]   (needs numpy, scipy)
import sys, subprocess, numpy as np
from pathlib import Path
from motion_check import readout
R = np.array(readout(sys.argv[1]))
print(f"movers median {np.median(R[:, 1]):.0f} (bars: Grand Canyon 11, Lightsaber 20); <=2 movers {(R[:, 1] <= 2).mean() * 100:.0f}% of seconds; "
      f"still {(R[:, 2] < 2.0).mean() * 100:.0f}%; change over 2 s median {np.median(R[:, 3]):.2f}")
flag = [int(s) for s, mv, en, ch in R if mv <= 3 and ch < 0.05]
print('flagged seconds:', flag)
print('per second movers:', ' '.join(f'{int(s)}:{int(m)}' for s, m, *_ in R))
if len(sys.argv) > 2:
    Path(sys.argv[2]).mkdir(parents=True, exist_ok=True)
    for s in flag:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(s), '-t', '1', '-i', sys.argv[1], '-vf', 'fps=6,scale=180:-1,tile=6x1', '-frames:v', '1', f'{sys.argv[2]}/still-{s:04d}s.jpg'], check=True)

# Motion readout for a cloud session with no bar film on disk: runs motion_check's readout on RENDER and compares with
# the recorded bar numbers (Grand Canyon 01 v1: movers median 11; Lightsaber 01 v4: 20). usage: python3 motion_readout.py RENDER [strips_dir]
import sys, json, subprocess
from pathlib import Path
import numpy as np
from motion_check import readout
R = np.array(readout(sys.argv[1]))
BAR_MEDIAN = 11
p25 = np.percentile(R[:, 1], 25)
print(f'movers median {np.median(R[:, 1]):.0f} (bar {BAR_MEDIAN}), p25 {p25:.0f}, <=2 movers {(R[:, 1] <= 2).mean() * 100:.0f}%, still {(R[:, 2] < 2.0).mean() * 100:.0f}%, change over 2 s median {np.median(R[:, 3]):.2f}')
low = [int(s) for s, mv, en, ch in R if mv < 6]
print('seconds with fewer than 6 movers:', low)
json.dump([list(map(float, r)) for r in R], open('out/motion_readout.json', 'w'))
if len(sys.argv) > 2:
    Path(sys.argv[2]).mkdir(parents=True, exist_ok=True)
    for s in low:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(s), '-t', '1', '-i', sys.argv[1], '-vf', 'fps=6,scale=180:-1,tile=6x1', '-frames:v', '1', f'{sys.argv[2]}/still-{s:04d}s.jpg'], check=True)

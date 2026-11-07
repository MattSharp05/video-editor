# Contact sheet of ../stills/s_*.png in time order -> argv[1]
import re, subprocess, sys, glob
fs = sorted(glob.glob('s_*.png'), key=lambda s: float(re.search(r's_0*([\d.]*)\.png', s).group(1) or 0))
n = len(fs); cols = 8
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y'] + sum([['-i', f] for f in fs], []) + ['-filter_complex',
  ''.join(f'[{i}]scale=216:384[v{i}];' for i in range(n)) + ''.join(f'[v{i}]' for i in range(n)) + f'xstack=inputs={n}:layout=' +
  '|'.join(f'{(i % cols) * 220}_{(i // cols) * 388}' for i in range(n)) + ':fill=white', '-frames:v', '1', sys.argv[1]], check=True)

# Contact sheet of DIR/s_*.png in time order: python3 sheet.py DIR OUT.png [cols]
import glob, subprocess, sys
fs = sorted(glob.glob(f'{sys.argv[1]}/s_*.png')); n = len(fs); cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y'] + sum([['-i', f] for f in fs], []) + ['-filter_complex',
  ''.join(f'[{i}]scale=270:480,drawtext=text=\'{fs[i].split("s_")[1][:6]}\':x=6:y=6:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.5[v{i}];' for i in range(n)) + ''.join(f'[v{i}]' for i in range(n)) + f'xstack=inputs={n}:layout=' +
  '|'.join(f'{(i % cols) * 274}_{(i // cols) * 484}' for i in range(n)) + ':fill=white', '-frames:v', '1', sys.argv[2]], check=True)

# Splice re-rendered ranges into the silent master with the concat FILTER (never -c copy concat), then check frames.
# usage: python3 splice.py BASE.mp4 OUT.mp4 A:B:patch.mp4 ...   (A..B inclusive frames replaced by patch.mp4)
import subprocess, sys
base, out, specs = sys.argv[1], sys.argv[2], [s.split(':') for s in sys.argv[3:]]
specs = sorted((int(a), int(b), p) for a, b, p in specs)
inputs, fc, labels, cur, k = ['-i', base], [], [], 0, 0
for i, (a, b, p) in enumerate(specs):
    inputs += ['-i', p]
    if a > cur: fc.append(f'[0:v]trim=start_frame={cur}:end_frame={a},setpts=PTS-STARTPTS[s{k}]'); labels.append(f'[s{k}]'); k += 1
    fc.append(f'[{i + 1}:v]setpts=PTS-STARTPTS[s{k}]'); labels.append(f'[s{k}]'); k += 1
    cur = b + 1
fc.append(f'[0:v]trim=start_frame={cur},setpts=PTS-STARTPTS[s{k}]'); labels.append(f'[s{k}]')
fc.append(''.join(labels) + f'concat=n={len(labels)}:v=1:a=0,format=yuv420p[v]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(fc), '-map', '[v]', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-r', '30', out], check=True)
n = subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout.strip()
print('frames', n)

# Build the v1.1 silent master: v1 frames outside the re-rendered ranges + the new segments (concat filter, re-encode).
import subprocess, sys
TOTAL = int(sys.argv[1])
R = [(0, 300), (1060, 1380), (1960, 2180), (2483, TOTAL - 1)]
M = 'out/wireless-2_v1.silent.mp4'
inputs, parts, fc, cur, k = ['-i', M], [], [], 0, 1
for a, b in R:
    if a > cur:
        fc.append(f'[0:v]trim=start_frame={cur}:end_frame={a},setpts=PTS-STARTPTS[p{len(parts)}]'); parts.append(f'[p{len(parts)}]')
    inputs += ['-i', f'out/seg_{a}.mp4']
    fc.append(f'[{k}:v]setpts=PTS-STARTPTS[p{len(parts)}]'); parts.append(f'[p{len(parts)}]'); k += 1
    cur = b + 1
fc.append(''.join(parts) + f'concat=n={len(parts)}:v=1:a=0[v]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(fc), '-map', '[v]', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', 'out/wireless-2_v1.1.silent.mp4'], check=True)
n = subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', 'out/wireless-2_v1.1.silent.mp4'], capture_output=True, text=True).stdout.strip()
print('spliced frames', n, 'expected', TOTAL); assert int(n) == TOTAL

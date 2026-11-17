# Splice the partial re-renders into the master over exactly their frames, then encode the delivery picture once
# (two-pass x264, ~5.4 Mbit/s: 63 s ≈ 43 MB, under the 50 MB Reel cap). Checks the frame count.
# usage: python3 splice.py   -> out/picture_final.mp4
import subprocess, json
TOTAL = round(json.load(open('src/beats.json'))['total'] * 30)
FIX = [] if __import__('os').environ.get('NOFIX') else [(120, 245, 'out/fix_truck.mp4'), (595, 730, 'out/fix_595-730.mp4'), (920, 1035, 'out/fix_920-1035.mp4'),
       (1155, 1445, 'out/fix_1155-1445.mp4'), (1655, 1762, 'out/fix_map.mp4'), (1765, 1901, 'out/fix_1765-1901.mp4')]
ins = ['-i', 'out/picture.mp4']; parts = []; cur = 0
for k, (a, b, f) in enumerate(FIX, 1):
    ins += ['-i', f]
    if a > cur: parts.append(f'[0:v]trim=start_frame={cur}:end_frame={a},setpts=PTS-STARTPTS[m{k}]')
    parts.append(f'[{k}:v]trim=start_frame=0:end_frame={b - a + 1},setpts=PTS-STARTPTS[f{k}]'); cur = b + 1
if cur < TOTAL: parts.append(f'[0:v]trim=start_frame={cur}:end_frame={TOTAL},setpts=PTS-STARTPTS[mz]')
labels = ''.join('[' + p.rsplit('[', 1)[1] for p in parts)
fc = ';'.join(parts) + f';{labels}concat=n={len(parts)}:v=1:a=0,format=yuv420p[v]'
enc = ['-c:v', 'libx264', '-preset', 'slow', '-b:v', '5400k', '-maxrate', '6500k', '-bufsize', '11000k', '-r', '30']
for p in (1, 2):
    out = ['-pass', str(p), '-passlogfile', 'out/x264pass'] + (['-f', 'null', '/dev/null'] if p == 1 else ['-movflags', '+faststart', 'out/picture_final.mp4'])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '[v]', *enc, *out], check=True)
n = subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', 'out/picture_final.mp4'], capture_output=True, text=True).stdout.strip()
print('picture_final frames', n, 'expected', TOTAL); assert int(n) == TOTAL

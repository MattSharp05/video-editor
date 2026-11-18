#!/bin/bash
# Re-render frame ranges and splice them over a silent master. usage: ./partial.sh MASTER OUT "a-b" ["c-d" ...]
set -eo pipefail; cd "$(dirname "$0")"; master=$1; out=$2; shift 2
B=out/bundle_fix; rm -rf $B; npx remotion bundle src/index.ts --out-dir $B --log=error >/dev/null
for r in "$@"; do f=out/part_$r.mp4; [ -s $f ] && continue
  ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs -r kill
  echo "$(date +%T) frames $r"; npx remotion render $B Film $f --frames=$r --codec h264 --crf 16 --concurrency=${CONC:-4} --muted --log=error --timeout=300000; done
python3 - "$master" "$out" "$@" <<'PY'
import subprocess, sys
master, out, ranges = sys.argv[1], sys.argv[2], [tuple(map(int, r.split('-'))) for r in sys.argv[3:]]
n = int(subprocess.run(['ffprobe','-v','error','-count_frames','-select_streams','v','-show_entries','stream=nb_read_frames','-of','csv=p=0',master],capture_output=True,text=True).stdout)
ins, fc, segs, cur = ['-i', master], [], [], 0
for k, (a, b) in enumerate(sorted(ranges)):
    if a > cur: fc.append(f'[0:v]trim=start_frame={cur}:end_frame={a},setpts=PTS-STARTPTS[o{k}]'); segs.append(f'[o{k}]')
    ins += ['-i', f'out/part_{a}-{b}.mp4']; fc.append(f'[{k+1}:v]setpts=PTS-STARTPTS[p{k}]'); segs.append(f'[p{k}]'); cur = b + 1
if cur < n: fc.append(f'[0:v]trim=start_frame={cur}:end_frame={n},setpts=PTS-STARTPTS[tail]'); segs.append('[tail]')
fc.append(''.join(segs) + f'concat=n={len(segs)}:v=1:a=0[v]')
subprocess.run(['ffmpeg','-y','-v','error',*ins,'-filter_complex',';'.join(fc),'-map','[v]','-c:v','libx264','-crf','18','-maxrate','6M','-bufsize','12M','-pix_fmt','yuv420p','-r','30',out],check=True)
m = int(subprocess.run(['ffprobe','-v','error','-count_frames','-select_streams','v','-show_entries','stream=nb_read_frames','-of','csv=p=0',out],capture_output=True,text=True).stdout)
print('spliced', out, m, 'frames (master', n, ')')
PY

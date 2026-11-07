#!/bin/bash
# v2 -> v3: mute-test fixes (review.md#mute-test) by partial re-render: the magma fills up instead of flashing dark,
# cards for what the judge couldn't read (heavy rock presses, a spoon stands up in it, gas trapped, the side bulges
# out, old top gone), the jet pin off the minute counter, and the ending framed on St. Helens so BOOM lands on it.
set -e; mkdir -p out/fix2
R=("180 232" "512 598" "1245 1425" "1570 1632" "1885 2036" "2060 2284")
for r in "${R[@]}"; do set -- $r; f=out/fix2/f_$1_$2.mp4; [ -s $f ] && continue
  npx remotion render src/index.ts Film $f --frames=$1-$2 --muted --props='{"audio":false}' --gl=swangle --log=error; echo "fix $1-$2 done $(date -u +%T)"; done
# splice: keep v2 outside the ranges, new frames inside (one re-encode)
python3 - <<'PY'
import subprocess
R = [(180, 232), (512, 598), (1245, 1425), (1570, 1632), (1885, 2036), (2060, 2284)]
TOTAL = 2285
ins, fc, segs, prev, k = ['-i', 'out/v2_silent.mp4'], [], [], 0, 1
for a, b in R:
    if a > prev: fc.append(f'[0:v]trim=start_frame={prev}:end_frame={a},setpts=PTS-STARTPTS[s{len(segs)}]'); segs.append(f'[s{len(segs)}]')
    ins += ['-i', f'out/fix2/f_{a}_{b}.mp4']; fc.append(f'[{k}:v]setpts=PTS-STARTPTS[s{len(segs)}]'); segs.append(f'[s{len(segs)}]'); k += 1; prev = b + 1
if prev < TOTAL: fc.append(f'[0:v]trim=start_frame={prev},setpts=PTS-STARTPTS[s{len(segs)}]'); segs.append(f'[s{len(segs)}]')
fc.append(''.join(segs) + f'concat=n={len(segs)}:v=1:a=0[v]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[v]', '-c:v', 'libx264', '-crf', '17', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', '30', 'out/v3_silent.mp4'], check=True)
PY
echo "frames: $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/v3_silent.mp4)"
ffmpeg -v error -y -i out/v3_silent.mp4 -i sound/work/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out/v3_final.mp4

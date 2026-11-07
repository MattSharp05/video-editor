#!/bin/bash
# Partial re-renders for v1 -> v2 (review.md: fix by partial re-render), then splice into the silent master.
set -e
R=("420 860" "1240 1590" "1728 2051")
for r in "${R[@]}"; do set -- $r; f=out/fix/f_$1_$2.mp4; [ -s $f ] && continue
  npx remotion render src/index.ts Film $f --frames=$1-$2 --muted --props='{"audio":false}' --gl=swangle --log=error; echo "fix $1-$2 done $(date -u +%T)"; done
# splice: original frames outside the ranges, new frames inside, re-encoded once
ffmpeg -v error -y -i out/v1/silent.mp4 -i out/fix/f_420_860.mp4 -i out/fix/f_1240_1590.mp4 -i out/fix/f_1728_2051.mp4 -filter_complex \
"[0:v]trim=start_frame=0:end_frame=420,setpts=PTS-STARTPTS[a];[0:v]trim=start_frame=861:end_frame=1240,setpts=PTS-STARTPTS[b];[0:v]trim=start_frame=1591:end_frame=1728,setpts=PTS-STARTPTS[c];\
[a][1:v][b][2:v][c][3:v]concat=n=6:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -r 30 out/v2_silent.mp4
ffmpeg -v error -y -i out/v2_silent.mp4 -i sound/work/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out/v2_final.mp4
echo "frames: $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/v2_silent.mp4)"

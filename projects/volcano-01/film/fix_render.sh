#!/bin/bash
# v1 -> v2 partial re-render (review.md: fix by partial re-render): St. Helens 1980 (earlier bulge, orbit, bigger blast
# + flash) and the recap move (no longer skims block walls). PCHIP keys move neighbouring segments, so the range covers
# from the key before the first changed key to the key after the last. Then splice into the silent master.
set -e; mkdir -p out/fix
A=1380; B=2179; f=out/fix/f_${A}_${B}.mp4
[ -s $f ] || npx remotion render src/index.ts Film $f --frames=$A-$B --muted --props='{"audio":false}' --gl=swangle --log=error
echo "fix $A-$B done $(date -u +%T)"
ffmpeg -v error -y -i out/v1/silent.mp4 -i $f -filter_complex \
"[0:v]trim=start_frame=0:end_frame=$A,setpts=PTS-STARTPTS[a];[0:v]trim=start_frame=$((B+1)),setpts=PTS-STARTPTS[c];[a][1:v][c]concat=n=3:v=1:a=0[v]" \
-map "[v]" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -r 30 out/v2_silent.mp4
echo "frames: $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/v2_silent.mp4)"

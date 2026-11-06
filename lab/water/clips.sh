#!/bin/bash
# Render each water test shot as a 3 s clip (full res, timed), then a half-size review copy. Usage: ./clips.sh [ids...]
cd "$(dirname "$0")"; mkdir -p out review
IDS=${@:-river-aerial river-bank rapids under-clear under-flood flood-front ocean-open ocean-shore waterfall}
for id in $IDS; do
  T0=$(date +%s.%N)
  npx remotion render src/index.ts $id out/$id.mp4 --codec=h264 --crf=20 --muted >/dev/null 2>err_$id.log || { echo "$id FAILED"; tail -5 err_$id.log; continue; }
  T1=$(date +%s.%N)
  ffmpeg -nostdin -v error -y -i out/$id.mp4 -vf scale=540:960 -c:v libx264 -crf 24 -preset medium -movflags +faststart -pix_fmt yuv420p review/$id.mp4
  echo "$id $(python3 -c "print(round(($T1-$T0-20)/90,2))") s/frame (90 frames, ~20 s start-up subtracted)"; rm -f err_$id.log
done

#!/bin/bash
# 2 fps captions-off frames with timestamps, 30 per sheet (15 s). usage: ./mute_sheets.sh PREVIEW.mp4 OUTDIR
set -e; in=$1; out=$2; mkdir -p $out; rm -f $out/*.png
ffmpeg -v error -i $in -vf "fps=2,scale=216:384,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{pts\:hms}':x=6:y=354:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.7" -y $out/f%03d.png
n=$(ls $out/f*.png | wc -l)
for s in $(seq 0 30 $((n-1))); do
  ffmpeg -v error -start_number $((s+1)) -i $out/f%03d.png -frames:v 1 -vf "tile=6x5:padding=4:color=white" -y $out/sheet_$(printf %02d $((s/30))).png
done
rm -f $out/f*.png; ls $out

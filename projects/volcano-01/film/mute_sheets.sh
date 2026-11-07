#!/bin/bash
# Mute-test sheets (review.md#mute-test): frames at 2 fps with the caption band blacked out (no narration leaks),
# timestamped, 4x3 per sheet. usage: bash mute_sheets.sh RENDER.mp4 OUTDIR
set -e; mkdir -p $2
ffmpeg -v error -y -i $1 -vf "fps=2,drawbox=x=0:y=0:w=iw:h=560:color=black:t=fill,scale=270:480,drawtext=text='%{pts\:hms}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black" $2/f_%04d.png
n=$(ls $2/f_*.png | wc -l); k=0
for ((i=1; i<=n; i+=12)); do k=$((k+1)); ffmpeg -v error -y -start_number $i -i $2/f_%04d.png -frames:v 1 -vf "tile=4x3:padding=4" $2/sheet_$(printf %02d $k).png; done
rm $2/f_*.png; ls $2

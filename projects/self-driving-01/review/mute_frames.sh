#!/bin/bash
# Mute-test frames (review.md): every 0.5 s from the silent picture, the caption band (y 200-620) blacked out so the
# judge can't read the narration; labels and tags stay (they are part of the picture). Sheets of 12 with timestamps.
set -e; cd "$(dirname "$0")"; mkdir -p mute; rm -f mute/*.jpg
ffmpeg -v error -y -i ../film/out/picture.mp4 -vf "fps=2,drawbox=x=0:y=200:w=1080:h=420:color=black:t=fill,scale=360:-1,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{pts\:hms}':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black" -fps_mode vfr mute/f%03d.jpg
n=$(ls mute/f*.jpg | wc -l); i=0
while [ $((i*12)) -lt $n ]; do ffmpeg -v error -y -start_number $((i*12+1)) -i mute/f%03d.jpg -frames:v 1 -vf "tile=6x2" mute/sheet_$(printf %02d $i).jpg; i=$((i+1)); done
ls mute/sheet_*.jpg

#!/bin/bash
# Full render in 300-frame chunks (skips chunks already on disk), joined with concat -c copy, muxed with the mix.
# usage: bash render_chunks.sh [out/name]   (run from film/)
set -e
N=${1:-out/v1}; mkdir -p $N
TOTAL=$(node -e "const b=require('./src/beats.json');console.log(Math.ceil(b.total*30))")
for ((a=0; a<TOTAL; a+=300)); do
  b=$(( a+299 < TOTAL-1 ? a+299 : TOTAL-1 )); f=$N/c_$(printf %05d $a).mp4
  [ -s $f ] && continue
  npx remotion render src/index.ts Film $f --frames=$a-$b --muted --props='{"audio":false}' --gl=swangle --log=error --crf=18
  echo "chunk $a-$b done $(date -u +%T)"
done
ls $N/c_*.mp4 | sed 's/^/file /;s|file |file '"$PWD"'/|' > $N/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $N/list.txt -c copy $N/silent.mp4
# AAC raises peaks (~-0.3 dBTP from a -2.0 mix): limit at -2.5 dB, oversampled, before encoding
ffmpeg -v error -y -i sound/work/mix.wav -af "aresample=192000,alimiter=limit=0.75:attack=1:release=50:level=false,aresample=48000" sound/work/mix_lim.wav
ffmpeg -v error -y -i $N/silent.mp4 -i sound/work/mix_lim.wav -map 0:v -map 1:a -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 256k -ar 48000 -shortest $N/final.mp4
echo "frames: $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 $N/silent.mp4) / $TOTAL"

#!/bin/bash
# Mux each music version onto the one silent picture (-c:v copy), AAC 192k; then measure loudness/true peak on the MP4.
# usage: ./deliver.sh   (needs ../film/out/picture_final.mp4 and work/mix_<key>.wav from mix.py)
set -e; cd "$(dirname "$0")"; R=../renders; mkdir -p $R
for k in signal-to-noise computations horizons; do
  o=$R/self-driving-01_$k.mp4
  ffmpeg -v error -y -i ../film/out/picture_final.mp4 -i work/mix_$k.wav -map 0:v -map 1:a -c:v copy -af "aresample=192000,alimiter=limit=0.70:attack=1:release=50:level=false,aresample=48000" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart $o
  m=$(ffmpeg -hide_banner -nostats -i $o -af ebur128=peak=true -f null - 2>&1 | sed -n "/Summary/,\$p" | grep -E "I:|Peak:" | tr -s " " | tr "\n" " ")
  echo "$o $(( $(stat -c%s $o) / 1000000 )) MB  $m"
done

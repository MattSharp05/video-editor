#!/bin/bash
# Silent picture in 300-frame chunks (skips chunks already on disk, so a rerun resumes), joined with the concat demuxer.
# Video capped at 6 Mbit/s like render.sh (under 50 MB per Reel). usage: ./render_chunks.sh [first last]
set -eo pipefail; cd "$(dirname "$0")"
TOTAL=$(node -e "const b=require('./src/beats.json'); console.log(Math.round(b.total*30))")
mkdir -p out/chunks; npx tsc -p .; npx remotion bundle src/index.ts --out-dir out/bundle --log=error >/dev/null
for ((s=${1:-0}; s<${2:-$TOTAL}; s+=300)); do
  e=$((s+299)); [ $e -ge $TOTAL ] && e=$((TOTAL-1)); f=out/chunks/c$(printf %05d $s).mp4
  [ -f $f ] && continue
  echo "chunk $s-$e $(date -u +%T)"
  npx remotion render out/bundle Film $f.tmp.mp4 --frames=$s-$e --muted --codec h264 --crf 18 --encoding-max-rate=6M --encoding-buffer-size=12M --concurrency=${CONCURRENCY:-1} --timeout=300000 --log=info --props='{"audio":false}' 2>&1 | tr "\r" "\n" | grep --line-buffered -E "Rendered [0-9]+0/|rror" 
  mv $f.tmp.mp4 $f
done
ls out/chunks/c*.mp4 | sed "s|^out/chunks/|file '|; s|$|'|" > out/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -c copy out/picture.mp4
n=$(ffprobe -v error -count_packets -select_streams v -show_entries stream=nb_read_packets -of csv=p=0 out/picture.mp4)
echo "picture: $n frames (expected $TOTAL)"; [ "$n" = "$TOTAL" ]

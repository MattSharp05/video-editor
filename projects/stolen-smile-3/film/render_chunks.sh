#!/bin/bash
# Full render in resumable chunks (skips chunks on disk), then concat (-c copy) and frame-count check.
set -e; cd "$(dirname "$0")"; mkdir -p out/chunks
TOTAL=$(python3 -c "import json;print(round(json.load(open('src/beats.json'))['total']*30))")
ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs -r kill
b=out/bundle; [ -d $b ] || npx remotion bundle src/index.ts --out-dir $b --log=error >/dev/null
for a in 0 820 1640; do e=$((a+819)); [ $e -ge $TOTAL ] && e=$((TOTAL-1))
  f=out/chunks/c$(printf %04d $a).mp4; [ -f $f ] && continue
  npx remotion render $b Film $f.tmp.mp4 --frames=$a-$e --codec h264 --crf 18 --concurrency=${CONC:-3} --muted --log=error && mv $f.tmp.mp4 $f; date -u +%T; done
ls out/chunks/c*.mp4 | sed 's/^/file /;s/file out\/chunks\//file /' > out/chunks/list.txt
ffmpeg -nostdin -v error -y -f concat -safe 0 -i out/chunks/list.txt -c copy out/silent.mp4
echo frames $(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 out/silent.mp4) expected $TOTAL

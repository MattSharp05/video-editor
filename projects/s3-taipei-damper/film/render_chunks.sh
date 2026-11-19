#!/bin/bash
# Silent picture in 300-frame chunks (resumable: finished chunks are skipped), joined with the concat demuxer.
# usage: ./render_chunks.sh NAME   -> out/NAME.video.mp4 (mux the mix with mux.sh)
set -eo pipefail; cd "$(dirname "$0")"; n=${1:-v1}; mkdir -p out/chunks_$n
TOTAL=$(python3 -c "import json;w=json.load(open('src/words.json'));print(round((w[-1]['e']+2.2)*30))")
npx tsc -p .
B=out/bundle_$n; [ -d $B ] || npx remotion bundle src/index.ts --out-dir $B --log=error >/dev/null
: > out/chunks_$n/list.txt
for ((a=0; a<TOTAL; a+=300)); do
  b=$(( a+299 < TOTAL-1 ? a+299 : TOTAL-1 )); f=out/chunks_$n/c_$(printf %05d $a).mp4
  echo "file '$(basename $f)'" >> out/chunks_$n/list.txt
  [ -s $f ] && continue
  ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs -r kill
  echo "$(date +%T) chunk $a-$b"; npx remotion render $B Film $f.tmp.mp4 --frames=$a-$b --codec h264 --crf 18 --encoding-max-rate=6M --encoding-buffer-size=12M --concurrency=4 --muted --log=error --timeout=300000 && mv $f.tmp.mp4 $f
done
ffmpeg -y -v error -f concat -safe 0 -i out/chunks_$n/list.txt -c copy out/$n.video.mp4
echo "frames $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/$n.video.mp4) / $TOTAL"

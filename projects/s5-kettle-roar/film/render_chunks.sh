#!/bin/bash
# Silent picture in 300-frame chunks (resumable: finished chunks are skipped, so a killed or timed-out run restarts
# where it stopped), joined with the concat demuxer. Run it in the background with a long timeout (a 40 s 3D film
# took ~1 h at concurrency 4 on the cloud container).
# usage: [CONC=n] [TOTAL=frames] ./render_chunks.sh NAME   -> out/NAME.video.mp4, then ./mux.sh NAME
# TOTAL defaults to the Film composition's own length, read from the bundle (a hard-coded VO_END + 2.2 s tail broke
# s5-microwave-myth, whose film ends 2.0 s after the VO: the last chunk asked for frames past the end).
# If Chrome dies ("Target closed"), lower CONC (heavy interiors crashed at 4, rendered at 2).
set -eo pipefail; cd "$(dirname "$0")"; n=${1:-v1}; mkdir -p out/chunks_$n
npx tsc -p .
B=out/bundle_$n; [ -d $B ] || npx remotion bundle src/index.ts --out-dir $B --log=error >/dev/null
TOTAL=${TOTAL:-$(npx remotion compositions $B 2>&1 | awk '$1=="Film"{print $4}')}
[ -n "$TOTAL" ] || { echo "could not read the Film composition's length; set TOTAL=frames" >&2; exit 1; }
: > out/chunks_$n/list.txt
for ((a=0; a<TOTAL; a+=300)); do
  b=$(( a+299 < TOTAL-1 ? a+299 : TOTAL-1 )); f=out/chunks_$n/c_$(printf %05d $a).mp4
  echo "file '$(basename $f)'" >> out/chunks_$n/list.txt
  [ -s $f ] && continue
  ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs -r kill
  echo "$(date +%T) chunk $a-$b"; npx remotion render $B Film $f.tmp.mp4 --frames=$a-$b --codec h264 --crf 18 --concurrency=${CONC:-2} --muted --log=error --timeout=300000 && mv $f.tmp.mp4 $f
done
ffmpeg -y -v error -f concat -safe 0 -i out/chunks_$n/list.txt -c copy out/$n.video.mp4
echo "frames $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/$n.video.mp4) / $TOTAL"

#!/bin/bash
# Silent picture in 300-frame chunks (resumable: finished chunks are skipped, so a killed or timed-out run restarts
# where it stopped), joined with the concat demuxer. Run it in the background with a long timeout (a 40 s 3D film
# took ~1 h at concurrency 4 on the cloud container).
# usage: [CONC=n] [TOTAL=frames] ./render_chunks.sh NAME   -> out/NAME.video.mp4, then ./mux.sh NAME
# TOTAL defaults to (last word end + 2.2 s) x 30, matching DUR_S = VO_END + 2.2; set it if your film differs.
# If Chrome dies ("Target closed"), lower CONC (heavy interiors crashed at 4, rendered at 2).
# Two guards run first (s4, 2026-11-19: both rules were in three.md / ai-voiceover.md, read, and skipped; they cost ~2 h):
# - it refuses to start while another render or a TTS run is using the CPU (both slowed ~10x); FORCE=1 overrides.
# - PROBE=a-b (a few frames of the heaviest shot, e.g. dense grass) is timed first and the projected total printed:
#   120k grass tufts ran 21 s/frame, found an hour in. PROBE=skip opts out when the cost is already measured.
set -eo pipefail; cd "$(dirname "$0")"; n=${1:-v1}; mkdir -p out/chunks_$n
TOTAL=${TOTAL:-$(python3 -c "import json;w=json.load(open('src/words.json'));print(round((w[-1]['e']+2.2)*30))")}
others=$(ps -A -o args= | awk '$1 ~ /(^|\/)(node|python[0-9.]*)$/ && /remotion.* render|say\.py|qwen/' || true)
[ -z "$others" ] || [ "${FORCE:-}" = 1 ] || { echo "another render/TTS is running (FORCE=1 to override):"; echo "$others"; exit 1; }
[ -n "${PROBE:-}" ] || { echo "set PROBE=a-b (a few frames of the heaviest shot) or PROBE=skip" >&2; exit 1; }
npx tsc -p .
B=out/bundle_$n; [ -d $B ] || npx remotion bundle src/index.ts --out-dir $B --log=error >/dev/null
: > out/chunks_$n/list.txt
if [ "$PROBE" != skip ] && [ ! -s out/chunks_$n/probe.txt ]; then
  s=$(date +%s); npx remotion render $B Film out/chunks_$n/probe.mp4 --frames=$PROBE --codec h264 --concurrency=${CONC:-2} --muted --log=error --timeout=300000
  k=$(( ${PROBE#*-} - ${PROBE%-*} + 1 )); python3 -c "d=$(date +%s)-$s-40; f=max(d,1)/$k; print(f'probe {f:.1f} s/frame (setup ~40 s excluded); worst case {f*$TOTAL/3600:.1f} h for $TOTAL frames')" | tee out/chunks_$n/probe.txt
fi
for ((a=0; a<TOTAL; a+=300)); do
  b=$(( a+299 < TOTAL-1 ? a+299 : TOTAL-1 )); f=out/chunks_$n/c_$(printf %05d $a).mp4
  echo "file '$(basename $f)'" >> out/chunks_$n/list.txt
  [ -s $f ] && continue
  ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs -r kill
  echo "$(date +%T) chunk $a-$b"; npx remotion render $B Film $f.tmp.mp4 --frames=$a-$b --codec h264 --crf 18 --concurrency=${CONC:-2} --muted --log=error --timeout=300000 && mv $f.tmp.mp4 $f
done
ffmpeg -y -v error -f concat -safe 0 -i out/chunks_$n/list.txt -c copy out/$n.video.mp4
echo "frames $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/$n.video.mp4) / $TOTAL"

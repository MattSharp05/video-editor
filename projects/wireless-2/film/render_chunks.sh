#!/bin/bash
# Full render in chunks (skip chunks on disk), join, mix, mux with apad + -t, loudness pass. usage: ./render_chunks.sh NAME
set -e; cd "$(dirname "$0")"; n=${1:-wireless-2_v1}; mkdir -p out/chunks
TOTAL=$(python3 -c "import json;print(round(json.load(open('src/beats.json'))['total']*30))")
b=out/bundle; rm -rf $b; npx remotion bundle src/index.ts --out-dir $b --log=error >/dev/null
for a in $(seq 0 700 $((TOTAL-1))); do e=$((a+699)); [ $e -ge $TOTAL ] && e=$((TOTAL-1))
  f=out/chunks/c_$(printf %05d $a).mp4; [ -f $f ] && continue
  ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs -r kill
  npx remotion render $b Film $f.tmp.mp4 --frames=$a-$e --codec h264 --crf 18 --concurrency=3 --muted --log=error && mv $f.tmp.mp4 $f
done
ls out/chunks/c_*.mp4 | sed 's/^/file ..\/..\//' | sed 's/file ..\/..\/out\/chunks\//file /' > out/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -c copy out/$n.silent.mp4
(cd sound && /home/user/video-editor/lab/voice-picker/.venv-qw/bin/python mix.py)
D=$(python3 -c "print($TOTAL/30)")
ffmpeg -v error -y -i out/$n.silent.mp4 -i sound/work/mix.wav -c:v copy -af apad -t $D -c:a pcm_s16le out/$n.raw.mov
m=$(ffmpeg -hide_banner -nostats -i out/$n.raw.mov -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
v() { printf '%s' "$m" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i out/$n.raw.mov -c:v copy -af "loudnorm=I=-14:TP=-2:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true,aresample=192000,alimiter=limit=0.75:attack=1:release=50:level=false,aresample=48000" -ar 48000 -c:a aac -b:a 192k -t $D -movflags +faststart out/$n.mp4
ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/$n.mp4; echo "expected $TOTAL"
ffmpeg -hide_banner -nostats -i out/$n.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E " I:|Peak:"

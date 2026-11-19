#!/bin/bash
# Put the finished mix on the silent picture, re-encoding the picture to fit the 50 MB Reel cap (Remotion's
# --encoding-max-rate did not hold on chunked renders: 206 MB for 41 s), then measure the delivered MP4.
# usage: ./mux.sh NAME [MIX.wav]   (out/NAME.video.mp4 + sound/work/mix.wav -> out/NAME.mp4)
# Loudness: two-pass linear loudnorm to -14 LUFS plus a limiter, as render.sh (a single-pass mix landed at -14.4 in s4),
# then it prints what the MP4 measures.
set -e; cd "$(dirname "$0")"; n=$1; mix=${2:-sound/work/mix.wav}
m=$(ffmpeg -hide_banner -nostats -i $mix -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
v() { printf '%s' "$m" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
af="loudnorm=I=-14:TP=-2:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true,aresample=192000,alimiter=limit=0.75:attack=1:release=50:level=false,aresample=48000"
ffmpeg -y -v error -i out/$n.video.mp4 -i $mix -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -maxrate 8M -bufsize 16M -pix_fmt yuv420p -af "$af" -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart out/$n.mp4
ffmpeg -hide_banner -nostats -i out/$n.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
echo "size $(( $(stat -c%s out/$n.mp4) / 1000 )) kB; duration $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$n.mp4) s"
[ $(stat -c%s out/$n.mp4) -lt 50000000 ] || { echo "over 50 MB: raise -crf" >&2; exit 1; }

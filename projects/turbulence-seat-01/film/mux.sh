#!/bin/bash
# Mux the mix onto the silent picture (re-encoded to fit the 50 MB Reel cap: the chunk render ignores its max rate), then measure the delivered MP4 (loudness, true peak, size, frames).
# usage: ./mux.sh NAME  (out/NAME.video.mp4 + sound/work/mix.wav -> out/NAME.mp4)
set -e; cd "$(dirname "$0")"; n=$1
ffmpeg -y -v error -i out/$n.video.mp4 -i sound/work/mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -maxrate 8M -bufsize 16M -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/$n.mp4
ffmpeg -hide_banner -nostats -i out/$n.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
echo "size $(( $(stat -c%s out/$n.mp4) / 1000 )) kB; duration $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$n.mp4) s"
[ $(stat -c%s out/$n.mp4) -lt 50000000 ] || { echo "over 50 MB" >&2; exit 1; }

#!/bin/bash
# Put the finished mix on the silent picture, re-encoding the picture to fit the 50 MB Reel cap (Remotion's
# --encoding-max-rate did not hold on chunked renders: 206 MB for 41 s), then measure the delivered MP4.
# usage: ./mux.sh NAME [MIX.wav]   (out/NAME.video.mp4 + sound/work/mix.wav -> out/NAME.mp4)
# The mix is padded with silence (apad) so -shortest ends on the picture's last frame (s3-jet-engine lost its last
# frame when the mix was 1/90 s shorter than the picture).
# The mix must already be -14 LUFS / true peak under -1.5 dBTP; this prints what the MP4 measures.
set -e; cd "$(dirname "$0")"; n=$1; mix=${2:-sound/work/mix.wav}
ffmpeg -y -v error -i out/$n.video.mp4 -i $mix -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -maxrate 8M -bufsize 16M -pix_fmt yuv420p -af apad -c:a aac -b:a 192k -shortest -movflags +faststart out/$n.mp4
ffmpeg -hide_banner -nostats -i out/$n.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
echo "size $(( $(stat -c%s out/$n.mp4) / 1000 )) kB; duration $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$n.mp4) s"
[ $(stat -c%s out/$n.mp4) -lt 50000000 ] || { echo "over 50 MB: raise -crf" >&2; exit 1; }

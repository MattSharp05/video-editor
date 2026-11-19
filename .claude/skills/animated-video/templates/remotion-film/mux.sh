#!/bin/bash
# Put the finished mix on the silent picture, re-encoding the picture to fit the 50 MB Reel cap (Remotion's
# --encoding-max-rate did not hold on chunked renders: 206 MB for 41 s), then measure the delivered MP4.
# usage: ./mux.sh NAME [MIX.wav]   (out/NAME.video.mp4 + sound/work/mix.wav -> out/NAME.mp4)
# The mix must already be -14 LUFS / true peak under -1.5 dBTP; this prints what the MP4 measures.
set -e; cd "$(dirname "$0")"; n=$1; mix=${2:-sound/work/mix.wav}
# The picture sets the length: pad the mix with silence (-shortest dropped the last frame when the mix ended a few ms early: s3-jet-engine, s2).
vd=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$n.video.mp4)
ffmpeg -y -v error -i out/$n.video.mp4 -i $mix -map 0:v -map 1:a -af apad -t $vd -c:v libx264 -preset slow -crf 19 -maxrate 8M -bufsize 16M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart out/$n.mp4
ffmpeg -hide_banner -nostats -i out/$n.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
echo "frames $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/$n.mp4) (picture $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/$n.video.mp4))"
echo "size $(( $(stat -c%s out/$n.mp4) / 1000 )) kB; duration $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$n.mp4) s"
[ $(stat -c%s out/$n.mp4) -lt 50000000 ] || { echo "over 50 MB: raise -crf" >&2; exit 1; }

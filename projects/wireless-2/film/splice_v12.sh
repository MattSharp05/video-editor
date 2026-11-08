#!/bin/bash
# v1.2: re-render frames 0-60 (dateline flips from 11 July) and 2050-2180 (smaller race-map page) and splice them into the
# v1.1 video with the concat filter; the v1.1 audio is copied unchanged (same length). Checks the frame count.
set -e; cd "$(dirname "$0")"
b=out/bundle12; rm -rf $b; npx remotion bundle src/index.ts --out-dir $b --log=error >/dev/null
for r in "0 60" "2050 2180"; do set -- $r; ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs -r kill
  npx remotion render $b Film out/s12_$1.mp4 --frames=$1-$2 --codec h264 --crf 18 --concurrency=3 --muted --log=error; done
M=out/wireless-2_v1.1.mp4
ffmpeg -v error -y -i $M -i out/s12_0.mp4 -i out/s12_2050.mp4 -filter_complex "[1:v]setpts=PTS-STARTPTS[a];[0:v]trim=start_frame=61:end_frame=2050,setpts=PTS-STARTPTS[b];[2:v]setpts=PTS-STARTPTS[c];[0:v]trim=start_frame=2181,setpts=PTS-STARTPTS[d];[a][b][c][d]concat=n=4:v=1:a=0[v]" -map "[v]" -map 0:a -c:v libx264 -crf 18 -pix_fmt yuv420p -r 30 -c:a copy -movflags +faststart out/wireless-2_v1.2.mp4
ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/wireless-2_v1.2.mp4; echo expected 2592
ffmpeg -hide_banner -nostats -i out/wireless-2_v1.2.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A16 Summary | grep -E " I:|Peak:"

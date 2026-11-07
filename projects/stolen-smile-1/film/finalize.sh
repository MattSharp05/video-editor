#!/bin/bash
# Mux the silent master with sound/work/mix.wav (padded, cut with -t, never -shortest), two-pass linear loudness to
# -14 LUFS with an oversampled limiter (template render.sh logic), then checks + the 1 fps sheet.
# usage: ./finalize.sh   (after out/master.mp4 exists)
set -e; cd "$(dirname "$0")"
TOT=$(python3 -c "import json;print(round(json.load(open('src/beats.json'))['total']*30))")
D=$(python3 -c "print($TOT/30)")
ffmpeg -y -v error -i out/master.mp4 -i sound/work/mix.wav -map 0:v -map 1:a -c:v copy -af "apad" -t $D -c:a pcm_s16le out/muxed.mov
m=$(ffmpeg -hide_banner -nostats -i out/muxed.mov -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
v() { printf '%s' "$m" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
mkdir -p ../renders
ffmpeg -y -v error -i out/muxed.mov -c:v copy -af "loudnorm=I=-14:TP=-2:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true,aresample=192000,alimiter=limit=0.75:attack=1:release=50:level=false,aresample=48000" -ar 48000 -c:a aac -b:a 192k -t $D -movflags +faststart ../renders/stolen-smile-1_v1.mp4
F=../renders/stolen-smile-1_v1.mp4
echo "frames: $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 $F) (expected $TOT)"
echo "duration: $(ffprobe -v error -show_entries format=duration -of csv=p=0 $F)"
ffmpeg -hide_banner -nostats -i $F -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+I:|^\s+Peak:" | tail -2
mkdir -p ../stills
ffmpeg -y -v error -i $F -vf "fps=1,scale=216:-1,tile=9x10" -frames:v 1 -q:v 3 ../stills/sheet_1fps.jpg
echo done

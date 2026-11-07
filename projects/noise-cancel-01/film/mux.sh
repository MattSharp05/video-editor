#!/bin/bash
# Mux sound/work/mix.wav onto a silent master with padded audio and an exact -t (never -shortest), then a two-pass
# linear loudnorm to -14 LUFS with an oversampled limiter (template render.sh logic). usage: ./mux.sh SILENT.mp4 OUT.mp4
set -e; cd "$(dirname "$0")"; S=$1; O=$2
N=$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 "$S"); T=$(python3 -c "print($N/30)")
ffmpeg -v error -y -i "$S" -i sound/work/mix.wav -map 0:v -map 1:a -c:v copy -af apad -t $T -c:a pcm_s16le out/raw.mov
m=$(ffmpeg -hide_banner -nostats -i out/raw.mov -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
v() { printf '%s' "$m" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i out/raw.mov -c:v copy -af "loudnorm=I=-14:TP=-2:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true,aresample=192000,alimiter=limit=0.75:attack=1:release=50:level=false,aresample=48000" -ar 48000 -c:a aac -b:a 192k -t $T -movflags +faststart "$O"
ffmpeg -nostats -i "$O" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):"
ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 "$O"

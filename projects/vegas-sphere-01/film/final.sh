#!/bin/bash
# Full render (silent) + the mix, muxed, then two-pass linear loudness to -14 LUFS with a limiter (as template render.sh).
# usage: ./final.sh   -> ../renders/vegas-sphere-01_v1.mp4
set -e; cd "$(dirname "$0")"; mkdir -p out ../renders
python3 beats.py > /dev/null && python3 sound/mix.py
npx remotion render src/index.ts Film out/v1.silent.mp4 --codec h264 --crf 18 --concurrency=${CONCURRENCY:-3} --muted --log=error
ffmpeg -y -v error -i out/v1.silent.mp4 -i sound/work/mix.wav -c:v copy -c:a pcm_s16le -shortest out/v1.raw.mov
m=$(ffmpeg -hide_banner -nostats -i out/v1.raw.mov -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
v() { printf '%s' "$m" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i out/v1.raw.mov -c:v copy -af "loudnorm=I=-14:TP=-2:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true,aresample=192000,alimiter=limit=0.75:attack=1:release=50:level=false,aresample=48000" -ar 48000 -c:a aac -b:a 192k -movflags +faststart ../renders/vegas-sphere-01_v1.mp4
echo ../renders/vegas-sphere-01_v1.mp4

#!/bin/bash
# Frames from render_stills.mjs + the sound mix -> the delivery MP4 (H.264, 30 fps), then the same two-pass loudness
# pass as render.sh (-14 LUFS, limiter). usage: ./encode.sh <name>
set -e; cd "$(dirname "$0")"; n=${1:-reel}
ffmpeg -y -v error -framerate 30 -i out/frames/f%05d.png -i public/mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a pcm_s16le -shortest out/$n.raw.mov
m=$(ffmpeg -hide_banner -nostats -i out/$n.raw.mov -af loudnorm=I=-14:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
v() { printf '%s' "$m" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i out/$n.raw.mov -c:v copy -af "loudnorm=I=-14:TP=-2:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true,aresample=192000,alimiter=limit=0.75:attack=1:release=50:level=false,aresample=48000" -ar 48000 -c:a aac -b:a 192k -movflags +faststart out/$n.mp4 && rm out/$n.raw.mov
echo out/$n.mp4

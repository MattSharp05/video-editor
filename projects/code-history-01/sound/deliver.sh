#!/usr/bin/env bash
# Put a mix onto the silent picture and encode for Reels under 50 MB.
# usage: ./deliver.sh VIDEO.mp4 MIX.wav OUT.mp4
# 58 s at <=6 Mbps video + 192 kbps AAC is ~45 MB at most; CRF 19 keeps most shots well under the cap.
set -euo pipefail
ffmpeg -v error -y -i "$1" -i "$2" -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -maxrate 6M -bufsize 12M \
  -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a aac -b:a 192k -ar 48000 -shortest "$3"
ls -la "$3" | awk '{printf "%.1f MB\n", $5/1048576}'
ffmpeg -hide_banner -nostats -i "$3" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+I:|Peak:" | tail -2

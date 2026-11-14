#!/bin/bash
# Re-render only changed frame ranges and splice them into an existing picture.
# splice.sh BASE.mp4 OUT.mp4 START-END [START-END ...]   (inclusive frame ranges, run from film/)
set -e
BASE=$1; OUT=$2; shift 2
ins=(-i "$BASE"); f=""; cat=""; prev=0; n=0; k=1
for r in "$@"; do
  a=${r%-*}; b=${r#*-}; seg=../renders/seg_$a-$b.mp4
  npx remotion render src/index.ts Film $seg --gl=swangle --scale=1 --concurrency=4 --muted --crf=16 --frames=$a-$b
  ins+=(-i $seg)
  f+="[0:v]trim=start_frame=$prev:end_frame=$a,setpts=PTS-STARTPTS[p$n];"; cat+="[p$n]"
  f+="[$k:v]setpts=PTS-STARTPTS[s$n];"; cat+="[s$n]"
  prev=$((b+1)); n=$((n+1)); k=$((k+1))
done
f+="[0:v]trim=start_frame=$prev,setpts=PTS-STARTPTS[p$n];"; cat+="[p$n]"
ffmpeg -v error -y "${ins[@]}" -filter_complex "${f}${cat}concat=n=$((2*n+1)):v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p "$OUT"
ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 "$OUT"

#!/bin/bash
# Partial re-render v1 -> v2 (review.md: fix by partial re-render): skin world 13-36 s (hero line-up legible, slot ring
# only when it matters, no spokes in the dive to the plates, softer beam). Splice into the silent master, mux the mix.
set -e
A=${A:-390}; Z=${Z:-1080}; IN=${IN:-out/v1/silent.mp4}; OUTN=${OUTN:-out/v2}
f=out/fix/f_${A}_${Z}.mp4; mkdir -p out/fix
[ -s $f ] || npx remotion render src/index.ts Film $f --frames=$A-$Z --muted --props='{"audio":false}' --gl=swangle --log=error
echo "fix $A-$Z done $(date -u +%T)"
N=$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 $IN)
ffmpeg -v error -y -i $IN -i $f -filter_complex \
"[0:v]trim=start_frame=0:end_frame=$A,setpts=PTS-STARTPTS[a];[0:v]trim=start_frame=$((Z+1)):end_frame=$N,setpts=PTS-STARTPTS[b];[a][1:v][b]concat=n=3:v=1:a=0[v]" \
  -map "[v]" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -r 30 ${OUTN}_silent.mp4
ffmpeg -v error -y -i ${OUTN}_silent.mp4 -i sound/work/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest ${OUTN}_final.mp4
echo "frames: $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 ${OUTN}_silent.mp4) / $N"

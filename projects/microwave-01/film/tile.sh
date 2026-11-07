#!/bin/bash
# contact sheet with timestamps: tile.sh DIR OUT.png [cols]
D=$1; O=$2; C=${3:-6}; L=$(mktemp -d)
for f in $D/f_*.png; do n=$(basename $f .png); fr=${n#f_}; t=$(python3 -c "print(f'{int(\"$fr\")/30:.1f}s')");
  ffmpeg -v error -y -i $f -vf "scale=270:480,drawtext=text='$t':x=8:y=8:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.6" $L/$n.png; done
N=$(ls $L | wc -l); R=$(( (N + C - 1) / C ))
ffmpeg -v error -y -pattern_type glob -i "$L/f_*.png" -vf "tile=${C}x${R}:padding=4:color=white" -frames:v 1 $O; rm -r $L

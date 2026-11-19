#!/bin/bash
# Captionless stills for the mute test (review.md): every STEP seconds at SCALE, from one bundle, numbered in order.
# usage: ./mute.sh OUTDIR [STEP=0.5] [SCALE=0.4]
set -e; cd "$(dirname "$0")"; out=$1; step=${2:-0.5}; scale=${3:-0.4}; mkdir -p "$out"
b=out/bundle_mute; rm -rf $b; npx remotion bundle src/index.ts --out-dir $b --log=error >/dev/null
TOTAL=$(python3 -c "import json;w=json.load(open('src/words.json'));print(round((w[-1]['e']+2.2)*30))")
python3 -c "
s=$step; n=$TOTAL
t=0.0
while round(t*30)<n: print(round(t*30)); t+=s" | xargs -P 2 -I{} sh -c 'f={}; npx remotion still '$b' Film '$out'/f$(printf %04d $f).png --frame=$f --scale='$scale' --props="{\"captions\":false}" --log=error'
ls "$out" | wc -l

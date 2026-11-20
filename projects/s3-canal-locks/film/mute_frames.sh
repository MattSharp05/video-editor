#!/bin/bash
# Captionless stills every STEP frames for the mute test (review.md#mute-test): out/mute/s_<sec>.png, named in seconds
# so `python3 mute_sheets.py out/mute OUTDIR` labels them right.
# usage: [STEP=15] ./mute_frames.sh
set -e; cd "$(dirname "$0")"; STEP=${STEP:-15}; mkdir -p out/mute
TOTAL=$(python3 -c "import json;w=json.load(open('src/words.json'));print(round((w[-1]['e']+2.2)*30))")
b=$(mktemp -d)/bundle; npx remotion bundle src/index.ts --out-dir "$b" --log=error >/dev/null
seq 0 $STEP $((TOTAL-1)) | xargs -P 3 -I{} sh -c 'npx remotion still "$0" Film "out/mute/s_$(awk "BEGIN{printf \"%.2f\", {}/30}").png" --frame={} --scale=0.5 --props="{\"captions\":false}" --log=error >/dev/null' "$b"
rm -rf "$(dirname "$b")"; ls out/mute | wc -l

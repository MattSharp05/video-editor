#!/bin/bash
# Render one still per KitSheet page (frame 60 of each 90-frame page) at half scale + a contact sheet.
set -e; cd "$(dirname "$0")"
N=${1:-21}; mkdir -p out/stills
for i in $(seq 0 $((N-1))); do npx remotion still out/bundle KitSheet out/stills/p$(printf %02d $i).jpg --frame=$((i*90+${2:-60})) --scale=0.5 --image-format=jpeg >/dev/null 2>&1 & if (( (i+1) % 3 == 0 )); then wait; fi; done; wait

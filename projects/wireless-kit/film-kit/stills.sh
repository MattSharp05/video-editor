#!/bin/bash
# Render every KitSheet page's listed still frames (PAGES[].still) at half scale, then a contact sheet.
# Usage: ./stills.sh [scale=0.5]   → out/stills/<page>_<frame>.jpg + out/stills/sheet.jpg
set -e; cd "$(dirname "$0")"; SCALE=${1:-0.5}
mkdir -p out/stills
npx esbuild src/pagelist.ts --bundle --platform=node --format=cjs --outfile=out/pagelist.cjs --log-level=error --jsx=automatic
node out/pagelist.cjs > out/stills/list.txt
npx remotion bundle src/index.ts --out-dir out/bundle >/dev/null 2>&1
i=0
while read name fr; do
  npx remotion still out/bundle KitSheet out/stills/${name}.jpg --frame=$fr --scale=$SCALE --image-format=jpeg >/dev/null 2>&1 &
  i=$((i+1)); if (( i % 4 == 0 )); then wait; fi
done < out/stills/list.txt; wait
echo "$(ls out/stills/*.jpg | wc -l) stills"

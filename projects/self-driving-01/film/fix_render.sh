#!/bin/bash
# Partial re-renders after the mute test (review.md: fix by partial re-render). One bundle, ranges in order, skips done ones.
set -eo pipefail; cd "$(dirname "$0")"
npx tsc -p .; npx remotion bundle src/index.ts --out-dir out/bundle4 --log=error >/dev/null
for r in "595 730" "920 1035" "1155 1445" "1765 1901"; do set -- $r; f=out/fix_$1-$2.mp4; [ -f $f ] && continue
  echo "fix $1-$2 $(date -u +%T)"
  npx remotion render out/bundle4 Film $f.tmp.mp4 --frames=$1-$2 --muted --codec h264 --crf 16 --concurrency=1 --timeout=300000 --log=error --props='{"audio":false}'
  mv $f.tmp.mp4 $f; done
echo "fixes done $(date -u +%T)"

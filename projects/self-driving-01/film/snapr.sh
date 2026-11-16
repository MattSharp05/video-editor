#!/bin/bash
# Stills via `remotion render --frames=N-N --sequence` from one bundle (here `remotion still` cold-starts far slower).
# usage: ./snapr.sh <outdir> <sec> [sec...]  -> <outdir>/t<sec>.png + sheet.png ; PROPS='{"captions":false}' optional
set -e; cd "$(dirname "$0")"; out=$1; shift; mkdir -p "$out"
npx tsc -p .
b=out/bundle; npx remotion bundle src/index.ts --out-dir "$b" --log=error >/dev/null
printf '%s\n' "$@" | xargs -P 2 -I{} sh -c 'f=$(python3 -c "print(round({}*30))"); d=$(mktemp -d)/x; npx remotion render "$0" Film "$d" --sequence --frames=$f-$f --image-format=png --muted --log=error --props="${PROPS:-{\}}" >/dev/null 2>&1; mv "$d"/*.png "$1/t{}.png"' "$b" "$out"
python3 sheet.py "$out/sheet.png" $(for s in "$@"; do echo "$out/t$s.png"; done)
echo "$out/sheet.png"

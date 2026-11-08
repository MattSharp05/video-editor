#!/bin/bash
# Stills at the given seconds from ONE bundle (rebuilt with -b), half scale, plus a contact sheet.
# usage: ./snap2.sh [-b] <outdir> <sec> [sec...]
set -e; cd "$(dirname "$0")"
[ "$1" = "-b" ] && { rm -rf out/bundle; shift; }
out=$1; shift; mkdir -p "$out"
ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs -r kill 2>/dev/null || true
[ -d out/bundle ] || npx remotion bundle src/index.ts --out-dir out/bundle --log=error >/dev/null
printf '%s\n' "$@" | xargs -P 3 -I{} sh -c 'npx remotion still out/bundle Film "$0/t{}.png" --frame=$(python3 -c "print(min(round({}*30), $1))") --scale=${SCALE:-0.5} --log=error ${PROPS:+--props=$PROPS} >/dev/null' "$out" "$(python3 -c "import json;print(round(json.load(open('src/beats.json'))['total']*30)-1)")"
python3 sheet.py "$out/sheet.png" $(for s in "$@"; do echo "$out/t$s.png"; done)
echo "$out/sheet.png"

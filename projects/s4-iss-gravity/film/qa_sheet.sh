#!/bin/bash
# QA sheet for one asset (references/assembly.md): renders views 0-9 plus two close-ups per focus point of the "QA"
# composition (src/kit/qa.tsx) and tiles them. usage: ./qa_sheet.sh <asset> <outdir> [n_focus=0]
set -e; cd "$(dirname "$0")"; a=$1; out=$2; nf=${3:-0}; mkdir -p "$out"
b=$(mktemp -d)/bundle; npx remotion bundle src/index.ts --out-dir "$b" --log=error >/dev/null
views=$(seq 0 $((9 + 2 * nf)))
printf '%s\n' $views | xargs -P 2 -I{} sh -c 'npx remotion still "$0" QA "$1/v{}.png" --props="{\"asset\":\"$2\",\"view\":{}}" --log=error >/dev/null' "$b" "$out" "$a"
python3 sheet.py "$out/sheet.png" $(for v in $views; do echo "$out/v$v.png"; done)
rm -rf "$(dirname "$b")"; echo "$out/sheet.png"

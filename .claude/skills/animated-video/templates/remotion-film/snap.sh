#!/bin/bash
# Render stills of the film at the given seconds, a contact sheet, and findings.json.
# usage: [SCALE=0.5] ./snap.sh <outdir> <sec> [sec...]
#   -> <outdir>/t<sec>.png + <outdir>/sheet.png + <outdir>/findings.json
# Renders two stills at a time (PAR=n to change) so several agents can share the machine.
# findings.json lists what the browser reported while drawing the stills (console errors and
# warnings, page errors, failed loads, remote requests, fonts not in the project), with file:line.
# Exit 1 when any finding is `fail`: fix each one before a full render, even when the stills look
# right, or allow-list a known-harmless one in findings-allow.txt (references/recover.md#findings).
set -e; cd "$(dirname "$0")"; out=$1; shift; mkdir -p "$out"; rm -f "$out/sheet.png"
npx tsc -p .
b=$(mktemp -d)/bundle; npx remotion bundle src/index.ts --out-dir "$b" --log=error >/dev/null
st=0; node snap.mjs "$b" "$out" "$@" || st=$?
shots=(); for s in "$@"; do [ -f "$out/t$s.png" ] && shots+=("$out/t$s.png"); done
[ ${#shots[@]} -gt 0 ] && python3 sheet.py "$out/sheet.png" "${shots[@]}"
rm -rf "$(dirname "$b")"
[ -f "$out/sheet.png" ] && echo "$out/sheet.png"
exit $st

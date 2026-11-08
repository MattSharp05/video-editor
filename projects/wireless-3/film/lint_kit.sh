#!/bin/bash
# Kit-redraw lint (SERIES-BRIEF lessons): any exported component here that shares a name with a kit export is a local
# redraw of a kit item. Run before every render. Exit 1 on a hit.
cd "$(dirname "$0")"
hits=$(grep -rhoE "export (const|function) [A-Z][A-Za-z0-9]*" src --include=*.tsx --exclude-dir=series | awk '{print $3}' | grep -xFf film-kit-EXPORTS.txt)
[ -z "$hits" ] && echo "kit lint: clean" || { echo "kit lint HITS: $hits"; exit 1; }

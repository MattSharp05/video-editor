#!/bin/bash
# Kit-redraw lint (SERIES-BRIEF lesson 1): any exported component in film/src (outside src/series) whose name is a kit export.
cd "$(dirname "$0")"
K=../../wireless-kit/film-kit
if [ -f $K/EXPORTS.txt ]; then cp $K/EXPORTS.txt film-kit-EXPORTS.txt; else grep -rhoE "export (const|function) [A-Z][A-Za-z0-9]*" src/series --include=*.tsx | awk '{print $3}' | sort -u > film-kit-EXPORTS.txt; fi
hits=$(grep -rhoE "export (const|function) [A-Z][A-Za-z0-9]*" src --include=*.tsx --exclude-dir=series | awk '{print $3}' | grep -xFf film-kit-EXPORTS.txt)
if [ -n "$hits" ]; then echo "KIT REDRAW: $hits"; exit 1; else echo "lint ok: no local redraws of kit exports"; fi

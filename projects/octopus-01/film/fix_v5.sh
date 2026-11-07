#!/bin/bash
# v2 -> v5: mute-test fixes by partial re-render (wider hook, labels for muscles/nerve/slot/layers, open-question
# cards, dish on open sand, look-twice card), each range spliced in turn.
set -e
IN=out/v2_silent.mp4; k=0
for r in "0 60" "400 1212" "1440 1916" "2040 2186"; do set -- $r; k=$((k+1))
  A=$1 Z=$2 IN=$IN OUTN=out/v5_$k ./fix_render.sh; IN=out/v5_${k}_silent.mp4; done
cp $IN out/v5_silent.mp4; cp out/v5_4_final.mp4 out/v5_final.mp4; echo ALLDONE $(date -u +%T)

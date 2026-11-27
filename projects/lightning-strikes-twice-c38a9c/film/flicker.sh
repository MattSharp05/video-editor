#!/bin/bash
# Flicker scan (review.md#temporal-checks): every frame-to-frame step in mean luma above a threshold, with its time.
# usage: ./flicker.sh VIDEO [threshold=3]   Expected steps: the film's CUT times. Look at a frame strip around any other.
ffprobe -v error -f lavfi -i "movie=$1,signalstats" -show_entries frame_tags=lavfi.signalstats.YAVG -of csv=p=0 | python3 -c "
import sys; v=[float(x.strip().strip(',')) for x in sys.stdin if x.strip()]
th=float(sys.argv[1])
for i in range(1,len(v)):
  if abs(v[i]-v[i-1])>th: print('step at frame',i,'t=%.2f'%(i/30),round(v[i-1],1),'->',round(v[i],1))
print(len(v),'frames')" ${2:-3}

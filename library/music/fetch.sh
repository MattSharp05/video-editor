#!/bin/bash
set -e; cd "$(dirname "$0")"; mkdir -p files
f=files/Floating_Cities.mp3
[ -s $f ] || curl -sSfL -o $f "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Floating%20Cities.mp3"
ls -la $f

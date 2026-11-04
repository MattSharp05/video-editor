#!/usr/bin/env bash
# Link this repo's profiles into $HOME, where the skills look for them.
set -euo pipefail
repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
for name in video-script video-edit animated-video asset-library; do
  dir="$HOME/.$name"
  mkdir -p "$dir"
  target="$repo/profiles/$name.md"
  link="$dir/profile.md"
  if [ -e "$link" ] && [ ! -L "$link" ]; then
    echo "skip $link (a real file exists; merge it into profiles/$name.md by hand)" >&2
    continue
  fi
  ln -sfn "$target" "$link"
done

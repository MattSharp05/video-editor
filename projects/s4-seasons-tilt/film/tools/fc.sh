#!/bin/bash
# usage: tools/fc.sh t1 t2 ...   (frame check: screen positions from timeline.ts)
cd "$(dirname "$0")/.." && npx esbuild tools/framecheck.mts --bundle --platform=node --format=esm --loader:.json=json --log-level=error --outfile=out/fc.mjs && node out/fc.mjs "$@"

# Water lab

Bench for the water kit (`.claude/skills/animated-video/templates/parts/src/kit/water/`): nine fixed 3 s test shots,
one per kind of water, in metres, with placeholder ground. Change the kit, re-render, compare.

- `node stills.mjs [scale] [ids]`: one still per shot (frame 45) with timing.
- `./clips.sh [ids]`: full-res 3 s clips (timed, s/frame printed) + half-size review copies in `review/`.
- `picker.src.html` -> `picker.html` (SHOTS injected with clip paths and costs): the Water Picker,
  https://claude.ai/artifact/QpXaaaUv123XkMUZh5bbf2 (db: `ratings/<shot>`, `meta/general`).

## Round 1 (2026-11-06)
Measured render cost, CPU only (SwiftShader, 1080x1920, 4 cores, s/frame): river-aerial 0.50, river-bank 0.81,
rapids 0.88, under-clear 0.16, under-flood 0.11, flood-front 0.27, ocean-open 0.81, ocean-shore 0.89, waterfall 1.03.
Fixes found while building (all in the kit now): fill light and ground too dark in the bench; ripples 8x too weak;
rapids a white sheet, then too regular (now a V of uneven standing waves); flood murk opaque (cheated to ~2 m);
mist as squares (now soft puffs); screen-derivative code in a vertex shader (BUMP split out); flood surface culled from
above (double-sided); muddy flood invisible on brown dirt (sheen, foam front, contrasting test ground).
Ratings: pending.

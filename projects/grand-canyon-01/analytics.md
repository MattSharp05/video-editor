# Grand Canyon 01: production analytics (from the session transcript, `analytics.py`)

| | Script (topic → fact-checked v0.2) | Production (go-ahead → delivered v1) | Total |
|---|---|---|---|
| Wall time | 20 min (02:24–02:44 UTC) | 75 min (02:44–04:00 UTC) | **95 min** |
| Responses / tool calls | 14 / 14 | 79 / 75 | 93 / 89 |
| Output tokens (main) | 20,920 | 94,923 | **115,843** |
| Input tokens (main) | 3.67 M (3.63 M cache reads, 34 k cache writes, 30 fresh) | 28.45 M (28.32 M cache reads, 135 k writes, 159 fresh) | **32.1 M** (99.5% cache reads) |
| Subagents | 1 fact-check: 7,129 out, 0.59 M in | none | |
| Web searches | 3 | 0 | |
| Code/file edits | 3 | 22 | |
| Still-check batches / images reviewed | 0 | 12 / 17 | |
| Renders | 0 | 1 full (36 min) + 3 partial re-renders (10.5, 2, 2 min) | |

Where the production hour went (approximate, from timestamps):
- Voiceover: 11 lines cloned from the approved design-m2 hook clip, ~7 min of CPU; assembly + word timings 1 min.
- Terrain: fetch, recentre, fields (plateau, river distance, side canyon): ~6 min.
- Film build (terrain module, world, camera, captions, overlays): ~15 min.
- Still checks and fixes: ~10 min before the full render; ~12 min after it.
- Full render 36 min (sound mix, caption and analytics written while it ran).

Fixes found by checking stills/frames (~20): river path direction reversed (camera, sea line and pebble flow all wrong);
boulder too dark, then fabric-like stripes; no water in the opening; layer labels off-screen (twice); flash flood
invisible (three times: pale colour, timing, broken strip -> tube); rockfall too small; dust as a grey disc; shale
too green; basement speckles; first slot too narrow to read; caption scrim too light; "5–6 million" wrapping;
underwater camera inside the pebbles, then pebbles floating; honesty tag on real terrain; dive through the ground
(twice); boulder a flat card from above; audio peak after AAC (-1.2 -> -1.8 dBTP).

Compared with Trip clip 01 (28.7 h calendar, ~6 h for v2 alone): the lab's method, the voice picker and the reusable
pieces (captions, fonts, render kit, sound rules) cut a new 77 s film to ~1.5 h from topic to delivery.

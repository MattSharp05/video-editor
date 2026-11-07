# Moon tides 01: analytics (templates/remotion-film/analytics.py over the session transcript)

| | Script (draft v0.1 -> approved v0.3, incl. Matthew's hook and reading-level rounds) | Production (go-ahead -> delivered) |
|---|---|---|
| Wall time | 11.4 min (21:42-21:53 UTC) | 48.6 min (21:53-22:42 UTC), of which the full render 25 min |
| Responses / tool calls | 13 / 8 | 53 / 50 |
| Output tokens | 20,953 (+5,692 fact-check agent) | 52,538 |
| Input tokens | 9.77 M (99.7% cache reads) (+0.48 M agent) | 42.9 M (99.8% cache reads) |
| Edits / still batches / images reviewed / renders | 2 / 0 / 0 / 0 | 13 / 8 / 10 / 1 full, no re-renders |

Compared with Grand Canyon 01 (95 min, 125 k output tokens, 1 full + 3 partial re-renders): a new film from approved
script to delivered video in ~49 min, with half the output tokens and no partial re-renders, using the kits (water,
globe, captions, beats, terrain scripts, sound mix pattern, AI voice pipeline).
Fixes found in stills (8): textures/terrain captured before drawn (preload outside the canvas: a kit-level lesson),
horizontal Earth-moon axis in a portrait frame (tilted), bumps too small, Earth terminator line, square moon sprite,
ocean shell too opaque, sun shot too tight, Fundy water reading as mud; plus the ASR "half is hard" (voice was right).

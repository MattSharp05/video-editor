# Sound effects library (studio-cc0)

Indexed by the real-sfx skill (`.claude/skills/real-sfx/config.json` -> this folder; rebuild with
`python3 scripts/build_index.py` from that skill folder). Everything here may be used commercially.

| Folder | Source | Licence |
|---|---|---|
| `cstack-cc0/` | the 33 Freesound recordings bundled with cstack's video-edit skill (sfx-29..61; sources and uploaders in `.claude/skills/video-edit/assets/sfx/catalog.json`) | CC0 1.0 |
| `remotion/` | 7 sounds from Remotion's `@remotion/sfx` (https://remotion.media/*.wav): whoosh, whip, switch, mouse-click, page-turn, shutter-modern, ding | CC0 per Remotion's sfx package rules (verify before a commercial release) |
| uisfx (inside the real-sfx skill) | 78 interface sounds x 12 packs; we use the `glass` pack | CC0 1.0 (code MIT) |

Not included: the meme sounds in @remotion/sfx and cstack's sfx-01..28 (unverified rights).

## Gaps (2026-11-05)
- No real **zipper** (round 4 uses `card-riffle` as a stand-in), no **wood knock**, no long **soft whoosh** (1–2 s),
  no **riser**. Freesound has them (CC0) but blocks automated downloads; the proper route is a free Freesound
  account + API key (`FREESOUND_API_KEY`), or packs downloaded by hand (Kenney.nl CC0, Sonniss GDC bundles).

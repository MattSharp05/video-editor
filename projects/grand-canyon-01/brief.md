# Grand Canyon 01 (brief)

Status: script v0.2 approved (2026-11-06); film v1 in production. Purpose: test the full flow on a non-Trip explainer, in
the manner of the "How does sand think?" reference (lab/references.md).

## Facts
- Topic from Matthew (2026-11-06): how the Grand Canyon was formed.
- Platform Instagram Reels 9:16; safe area as the lab principles; about 63–70 s.
- Voice: AI, from the Voice Picker round 2 picks: Matthew's clone (Qwen3-TTS, second take), designed calm low American
  female, or designed low understated American male. Designed voices drift between lines when generated per line
  (Matthew heard it on the male explainer): generate one reference clip from the design, then clone every line from it.

## Decisions (Matthew, 2026-11-06)
- Voice: American male (design-m2). Cloned for every line from the exact hook clip he liked in the picker, so the voice
  can't drift between lines. VO 77 s (the voice speaks ~2.8 words/s in full sentences, slower than in the picker).
- No call to action: finish on the payoff.
- Track time and tokens for this video (start 2026-11-06T02:44:32Z, `.start`).

## Film v1 (2026-11-06)
- `film/` (Remotion + three.js, 30 fps, 77 s). One continuous 3D shot on the real terrain: AWS Terrain Tiles (USGS
  3DEP), 31.6 km square around Grand Canyon Village, heights x1.6 (labelled). The pre-canyon plateau is a plane fitted
  to the rims; carving = depth x width around the river path (narrow slot first, then widened). Layers coloured by
  elevation, tilted 23 m/km to the north (approximate, NPS sequence). Boulder and riverbed are true-scale sets inside the
  canyon; the camera zooms metres to 60 km without cuts.
- Sound: `film/sound/mix.py`: voice +10 dB, Floating Cities ducked (sidechain), 21 cues (CC0 cstack library +
  synthesized rumble and crumble), -14.6 LUFS, -1.5 dBTP.
- Music credit in the caption (CC BY 4.0).

## Outstanding corrections
None yet.

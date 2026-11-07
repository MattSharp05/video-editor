# Moon tides 01 (brief)

Status: script v0.3 approved (hook B, grade-3 reading level); film v1 rendering. Purpose: the first video built entirely on the upgraded skills (look
pass, terrain kit, water kit, captions, AI voice, timing spine).

## Facts
- Topic from Matthew (2026-11-06): "how does the moon cause waves". The moon causes tides, which oceanographers treat as
  very long waves; beach waves are wind-driven. The script makes that the hook (flagged to Matthew).
- Voice: American male (design-m2), cloned from the approved clip. No call to action. Reel 9:16, ~60-65 s.
- Pieces: ocean kit (shore, rising tide), globe from parts (NASA Blue Marble), a water shell for the bulges, terrain kit
  for the Bay of Fundy (Canada: elevation tiles are global; USGS imagery is US-only, so imagery source to choose and
  check licence), look pass.

## Production (2026-11-06)
- VO: design-m2 cloned from the approved hook clip, 10 lines, 69.6 s; ASR misheard "half as hard" as "half is hard"
  in the full mix (line alone: "as" in 4/4 runs); words.json corrected.
- Film: `film/` (30 fps, 69.7 s). Scenes: beach (water kit ocean-shore, approved look), space (NASA Earth, ocean shell
  with the equilibrium-tide P2 shape, exaggerated; system tilted ~57 deg for the 9:16 frame), Minas Basin (terrain +
  Sentinel-2 2016 imagery, heights x6, water -7.5 -> +7.8 m), beach with the tide rising 0.7 m. Scene changes inside
  a haze the camera flies through.
- Bugs found in stills: textures/terrain loaded inside a scene were captured before being drawn (fixed: preload
  everything outside the canvas); Earth-moon axis horizontal didn't fit portrait (tilted); bumps too small; Earth
  terminator line; moon sprite square (now a sphere).
- Sound: `film/sound/mix.py`, 12 cues, -14.5 LUFS, -2.0 dBTP.

## Caption credits
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS). Earth: NASA Blue Marble.
Moon: NASA Scientific Visualization Studio (LRO). Bay of Fundy imagery: Sentinel-2 cloudless - https://s2maps.eu by
EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017), CC BY 4.0. Elevation: AWS Terrain Tiles.

## Outstanding corrections
None yet.

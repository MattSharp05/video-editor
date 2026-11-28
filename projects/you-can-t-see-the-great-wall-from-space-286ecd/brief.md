# You can't see the Great Wall from space (brief)

Broadcast routine video (routine "First routine test", slot 11, post_at 2026-11-29 00:10 UTC, approval: review),
video 286ecdc4-d9f1-4742-9e08-0c8ec7abbd93, made in one unsupervised session (STEP=all, broadcast-factory section 8).

## Goal and format
- Account @storytime_scroll. Genre: myth-buster. Goal: reach. Instagram Reel 1080x1920, 30 fps, ~39 s.
- Idea (planner): the Great Wall is not visible to the naked eye from the Space Station: only ~5-9 m wide and close to the
  colour of the land around it; cities, airports and lit roads at night are far easier to see.
- Hook (planner, myth as question): "Can you see the Great Wall from space? Astronauts say no." (v2: "Most astronauts").
- Planner note: scale demo "a hair seen from 3 km away". Wrong for 400 km (that ratio is the Moon's); replaced by the true
  ratio: a pencil (7 mm) seen from 400 m.
- Style: realistic-3d (three.js in Remotion). Hero assets: off (routine, nobody to approve).
- Voice: r3-m07, British documentary (Broadcast library). Credit: "Voice: AI (Qwen3-TTS)".
- Music: "Dreamer" by Kevin MacLeod (incompetech.com), CC BY 4.0, baked in and ducked under the voice.
- Routine rules (Matthew): "Read all the skills before starting." References: four Instagram reels (animations, style,
  colours, graphics, transitions); not downloadable here (Instagram), not studied frame by frame.
- Reading level: grade 1.6 (readability.py).

## Guidance read
- 2026-11-28, intake: broadcast-factory SKILL.md (main), CLAUDE.md, ~/.animated-video/profile.md, profiles/video-script.md;
  animated-video SKILL.md; references/direct.md, references/motion-principles.md, styles/realistic-3d/README.md,
  references/ai-voiceover.md.
- Steps 2-6: references/look-pass.md, references/remotion-pipeline.md, templates/parts/README.md, terrain kit README
  (fetch_dem.py, bake_light.py used).
- Skipped, with reason: sourcing.md (no found models: terrain from SRTM, everything else procedural), characters/water/
  compositing/assembly (none in the film), hero-assets (off for routines), three.md and review.md read only in the parts
  the steps used (time).
- Infrastructure copied from factory/what-the-northern-lights-really-are-cf5abd (same voice, style; globe kit, scripts).

## Decisions (unsupervised; logged)
- Pictures: fresh brainstorm + picker agent (one agent, two passes). Picks used: crane up off the wall (hook); the wall
  drawn as an amber ribbon across China with a counter; a car on the wall top as the road-width yardstick; wall/hills
  colour swatches and the wall's glow draining; the station 400 km up; a pencil on a football pitch with a 400 m pull
  back; the station's search ring that finds nothing; night sweeping across China; low under a watchtower at the end.
  Not built (time): the ribbon wrapping half the equator; the wall-to-pencil match morph; the end crash-zoom.
- Colour language: AMBER = the wall (and the pencil standing in for it); CYAN = the station and its eye; warm white = lights.
- Ground: real terrain at Jinshanling (40.676 N, 117.245 E; AWS Terrain Tiles, SRTM), baked sun shadow; the wall follows
  a cheapest path along the ridge crest (data/ridge.py). Colour map is procedural (no free imagery outside the US).
- Fact check (fresh agent, NASA / Britannica / SACH / Scientific American) -> script v2: line 1 "Astronauts say no" ->
  "Most astronauts say no" (Cernan, Lu said they saw it); line 7 "can't pick it out with their eyes" -> "almost never spot
  it with just their eyes"; line 8 "roads, glowing at night" -> "highways, lit up at night"; on screen "same as 6 m from
  400 km" -> "about the same as" (7 mm at 400 m is 17 % wider in angle than 6 m at 400 km).

## Outstanding corrections
- none yet (see Checks)

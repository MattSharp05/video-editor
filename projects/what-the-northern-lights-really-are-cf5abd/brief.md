# What the Northern Lights really are (brief)

Broadcast routine video (routine "First routine test", slot 10, post_at 2026-11-28 19:25 UTC, approval: review),
video cf5abd19-3012-41d8-8bb3-46142144f2ec, made in one unsupervised session (STEP=all, broadcast-factory section 8).

## Goal and format
- Account @storytime_scroll. Genre: explainer. Goal: reach. Instagram Reel 1080x1920, 30 fps, aim 25-40 s.
- Idea: charged particles from the Sun (the solar wind) are steered by Earth's magnetic field toward the poles,
  where they slam into the upper atmosphere about 100-300 km up. Oxygen glows green (red higher up), nitrogen glows
  blue and purple, painting moving curtains of light.
- Hook (planner, bold statement): "The Northern Lights are the Sun's wind crashing into our sky."
- Planner note: pull back from the curtains to field lines around a photoreal Earth.
- Style: realistic-3d (three.js in Remotion). Hero assets: off (routine, nobody to approve).
- Voice: r3-m07, British documentary (Broadcast library, cloned from `lab/voice-picker/library/`). Credit:
  "Voice: AI (Qwen3-TTS)".
- Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0, baked in and ducked under the voice.
- Routine rules (Matthew): "Read all the skills before starting." References: four Instagram reels (animations,
  style, colours, graphics, transitions).
- Reading level: about grade 3 (profile).
- Audience: curious general scrollers, teens to adults, who have seen aurora photos but not the mechanism.

## Guidance read
- 2026-11-28, intake: broadcast-factory SKILL.md (main), CLAUDE.md, ~/.animated-video/profile.md,
  ~/.video-script/profile.md; animated-video SKILL.md, styles/realistic-3d/README.md; references/direct.md,
  references/motion-principles.md, references/ai-voiceover.md; video-script references/explainers.md.
- 2026-11-28, steps 2-6: references/look-pass.md, references/three.md, references/remotion-pipeline.md (template,
  timing spine, captions, platform), references/review.md (motion, temporal, judges, stills), globe kit header.
- Skipped, with reason: references/sourcing.md (no found models: Earth from the globe kit, all else procedural),
  characters/water/compositing/assembly (none in the film), hero-assets (off for routines), real-sfx beyond
  studio-sound summary (CC0 library cues placed from words as in the sky film).
- Infrastructure copied from factory/why-the-sky-is-blue-417d62 (same voice, music, style; template scripts).

## Decisions (unsupervised; logged)
- Pictures: fresh brainstorm + picker agent (one agent, two passes). Picks: curtain over night hills with amber streaks
  pouring in (hook); the Sun shedding the stream; the stream parting round an invisible bubble that the particles
  outline, cyan field lines; particles sliding down the lines into green polar rings; a side view 100-300 km up with a
  height ruler where bits hit and the curtain builds band by band; pull back to the whole Earth.
- Colour language: amber = solar-wind particles (lead); cyan = field lines only; green/red/blue-purple only where
  particles hit the air (oxygen low, oxygen high, nitrogen at the lower edge).
- Script v1 -> v2 after the fact check (fresh agent, NOAA SWPC / NASA): the glowing particles are energised in Earth's
  night-side tail, not solar-wind particles riding straight in. Line 1 "are the Sun's wind crashing into our sky" ->
  "are powered by a wind from the Sun"; line 5 "But it steers some of it down toward the poles" -> "But it shakes the
  field, and charged bits rain down toward the poles"; line 9 -> "So every curtain of light is our air, lit up by the
  Sun's wind". Picture matched: the bits that fall now leave from the night-side tail of the field lines. Tag "down to
  the poles" -> "down toward the poles" (the light is a ring round the pole); end card adds the field.
- Mute test, stills pass (fresh judge): missed "pushes most away" (particles read as stars) -> stream drawn as a slab
  in the picture plane with trails, parting round the bubble; funnelling unclear -> steered bits with trails down the
  lines; hits sat at ~150 km -> green hits at 100-128 km with a white flash; hook card held too long -> fades earlier.
- Sound: mix.py (CC0 cstack library + synthesized noise beds), Floating Cities ducked under the voice. Measured only.

## Outstanding corrections
- none

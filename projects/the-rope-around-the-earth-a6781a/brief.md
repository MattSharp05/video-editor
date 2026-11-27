# The rope around the Earth (brief)

Broadcast routine video (routine "First routine test", slot 3, post_at 2026-11-27 09:50 UTC, approval: review),
video a6781ab0-3ed0-4ebe-8585-c40ccef9e900, made in one unsupervised session (STEP=all, broadcast-factory section 8).

## Goal and format
- Account @storytime_scroll. Genre: brainteaser. Goal: reach (comments: viewers say what they guessed).
  Instagram Reel 1080x1920, 30 fps, aim 30-40 s.
- Idea: a rope is wrapped tight around Earth's equator, then made one metre longer and lifted evenly all around.
  Pause and guess: how big is the gap? About 16 cm, enough for a cat to crawl under, because the gap is 1 m / 2 pi
  whatever the size of the ball; the same 16 cm appears around a tennis ball.
- Hook (planner, question style): "One extra meter around Earth. Could a cat crawl under?"
- Planner note: question with a pause-and-guess beat before the reveal (the pattern of the cube-hexagon teaser,
  `factory/a-brainteaser-video-dcbb53`).
- Style: realistic-3d (three.js in Remotion). Hero assets: off (routine, nobody to approve).
- Voice: r3-m07, British documentary (Broadcast library). Credit: "Voice: AI (Qwen3-TTS)".
- Music: "Lightless Dawn" by Kevin MacLeod (incompetech.com), CC BY 4.0, baked in and ducked under the voice.
- Routine rules (Matthew): "Read all the skills before starting." References: four Instagram reels (animations,
  style, colours, graphics, transitions).
- Reading level: about grade 3 (profile). Units: metres and centimetres (spelled "meter" in the spoken script and
  cards, as the planner's hook does).

## Facts
- Equator circumference about 40,075 km. Circumference C = 2 pi r, so adding 1 m to C adds 1/(2 pi) = 0.159 m to r,
  for any r: about 16 cm. Tennis ball radius about 3.3 cm: the 1 m longer ring stands the same 16 cm off it.
- A cat's body is roughly 20-25 cm tall standing; crouched it fits under gaps lower than that ("crawl under").

## Guidance read
- 2026-11-27, intake: broadcast-factory SKILL.md (main), CLAUDE.md, ~/.animated-video/profile.md,
  ~/.video-script/profile.md, animated-video SKILL.md, video-script SKILL.md, references/explainers.md,
  animated-video references/direct.md, motion-principles.md. Precedent: factory/a-brainteaser-video-dcbb53 (same
  voice, same music, pause-and-guess pattern) and factory/lightning-strikes-twice-c38a9c (same routine and style).

- 2026-11-27, steps 1-6: video-script references/hooks.json (rules), check_script.py; animated-video styles/README.md,
  styles/realistic-3d/README.md, references/look-pass.md, ai-voiceover.md, remotion-pipeline.md, templates/parts/README.md,
  references/sourcing.md, three.md, review.md; real-sfx/references/studio-sound.md; globe kit header.
- Skipped, with reason: characters/water/compositing/assembly (none in the film), hero-assets (off for routines),
  avatar-cutins (no avatar on this brief), handoffs (no revision yet).

## Decisions (unsupervised; logged)
- Pictures: one fresh agent, two passes (brainstorm, then pick), to save time against the 09:50 UTC slot (direct.md
  asks for two agents). Kept: red = the extra metre throughout, posts rising in a ripple to lift the ring, a crash
  zoom to the ground for the reveal, the cat crawling under, the square-Earth proof (the extra length lives only in
  four red corners that join into one circle of radius = the gap, unrolled along a ruler of steps), the square
  shrinking to nothing and a tennis ball. Dropped for build time: the silhouette line-up (a card of guesses instead),
  the ring of cats round the planet.
- Colour language: warm white = the rope; red (accent) = the extra metre; cyan = the gap / tape measure.
- Three worlds, hard cuts on the words: space (globe kit), savanna ground (realism kit sky; sand, pebbles, tufts,
  acacias, rope on stakes), a flat top view on a blueprint grid.
- Exaggeration labelled in every space shot ("red piece drawn far bigger", "gap drawn far bigger than real").
- Cat: "Bicolor Cat" by kenchoo, Sketchfab, CC BY 4.0 (rigged, 8.7 s clip), sourced with find_asset.py; crouch is a
  vertical squash under the rope. Credit in the caption.
- VO: say.py r3-m07, 13 lines, 1.9 s guess pause; transcript matches the script word for word after fix_words.py
  (Whisper digits 40,000 and 16 put back as words). 42.3 s.
- Music: Lightless Dawn trimmed to 75 s in film/sound/src (from incompetech; Broadcast's sample_url returned text).
  Stems at +10 dB: voice -9.6 LUFS, music -24.7 (15 dB under); raised the music to +13 dB (about 12 under).
- Template fix: parts captions.tsx gave adjacent scaled key words no gap ("sixteencentimeters"); key words now get
  16 px margins.

## Checks before the render (2026-11-27)
- Script: check_script.py flags only slot timing (timing comes from the VO) and "1" not shown on two rows (shown as
  "1 M" / "1 STEP"); grade 3.4.
- Fact check (fresh agent): nothing wrong; applied "1 M ÷ 40,000 KM?", "≈ 16 CM" on the shrink and tennis tags,
  "SAME ≈ 16 CM", script card ≈ 40,000 KM. Kept "about six steps" (2 pi = 6.28; the card says 6.28).
- Stills: three rounds. Fixed: the far half of the ring showing through the Earth (globe kit surface shader lacked the
  log-depth chunks, added from the template), grass tufts 3x too tall and pebbles too big, the cat walking through the
  rope (crouch was inverted), mushroom acacias, the splice shot only a red line (camera pulled back), the shrink
  shot tiny (camera zooms in), "6.28 STEPS" and "1 M" overlapping.
- Mute test, stills pass (fresh judge, 1 s spacing): recovered the rope, +1 m, the even lift, the guess, the 16 cm
  gap with the cat under, the corners-make-a-circle proof, size doesn't matter, the tennis ball. Fixed: the km counter
  stopping at 38,868 (now reaches 40,000 before the cut), the smeared red metre vanishing (kept thicker and opaque),
  small print too small (42 px), the top-view arcs near the caption band (diagram moved down), the "16 CM" ghost
  label on the tennis tape (shows when the tape is out). Not changed: the hook shows the finished ring before the
  wrap draws it (the hook is the question), the roll-back at "a sixth of a meter" (it is the reverse step, 1 m back
  into a circle of radius 16 cm), the cat entering cropped at the frame edge (it walks in).

## Outstanding corrections
- none yet

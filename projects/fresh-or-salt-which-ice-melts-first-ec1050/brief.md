# Fresh or salt: which ice melts first (brief)

Broadcast routine video (routine "First routine test", slot 6, post_at 2026-11-28 00:10 UTC, approval: review),
video ec1050c4-1cd1-483a-bfc8-779608ca61ab, made in one unsupervised session (STEP=all, broadcast-factory section 8).

## Goal and format
- Account @storytime_scroll. Genre: brainteaser. Goal: reach. Instagram Reel 1080x1920, 30 fps, aim 25-35 s.
- Idea: two identical ice cubes go into two glasses at room temperature, one fresh water, one salt water. Pause and
  guess. The fresh-water cube wins: its cold meltwater sinks and stirs the glass, bringing warm water up; in salt
  water the fresh meltwater floats on top in a cold layer that insulates the cube.
- Hook (planner, question with pause-and-guess): "Two ice cubes, fresh water and salt water. Which melts first?"
- Planner note: dye the meltwater blue so the sinking vs floating layer reads.
- Audience: curious scrollers, kids to adults; the trap is "salt melts ice" (road salt), so most guess salt.
- Style: realistic-3d (three.js in Remotion). Hero assets: off (routine, nobody to approve).
- Voice: r3-m07, British documentary (Broadcast library, say.py). Credit: "Voice: AI (Qwen3-TTS)".
- Music: "Lightless Dawn" by Kevin MacLeod (incompetech.com), CC BY 4.0, baked in and ducked under the voice.
- Routine rules (Matthew): "Read all the skills before starting." References: four Instagram reels (animations,
  style, colours, graphics, transitions).
- Reading level: about grade 3 (profile).

## Guidance read
- 2026-11-27, intake: broadcast-factory SKILL.md (origin/main), CLAUDE.md, ~/.animated-video/profile.md,
  ~/.video-script/profile.md, animated-video SKILL.md, video-script SKILL.md, references/direct.md,
  motion-principles.md, styles/README.md, styles/realistic-3d/README.md, look-pass.md, water.md. Precedent:
  factory/goldfish-remember-for-months-aff640 brief, script and caption (same routine, style and voice).
- 2026-11-27, steps 1-5: video-script explainers.md, hooks via check_script.py --hooks, check_script.py;
  animated-video ai-voiceover.md; review.md (stills, mute test, fact check, motion).
- Skipped, with reason: remotion-pipeline.md and templates/parts/README.md (the copied goldfish scaffold follows
  them), three.md (read by the sibling films; nothing beyond meshes, points and canvas textures), sourcing.md (no
  focal object with a real recognisable shape: glasses, cubes and a road are built in code), characters.md (no
  characters), studio-sound (mix.py copied from the sibling film follows it), hero-assets (off for routines),
  avatar-cutins (no avatar).

## Decisions (unsupervised; logged)
- Pictures: no brainstorm agent (time; the planner's picture note is concrete: blue-dyed meltwater sinking vs
  floating). Picks: two labelled glasses on a kitchen counter, ice dropping in on the hook; question marks for the
  pause; a cutaway to road salt on ice with dark melt spots (the trap); a time-lapse race (GONE vs STILL HERE); a
  close replay of each glass: fresh = blue streams sinking and amber warmer water rising to the cube; salt = blue
  layer spreading on top, amber held below it; pull-back to both glasses.
- Colour language: BLUE = cold meltwater (dyed, as in the home experiment); AMBER = warmer water; GOLD = the winner
  / the guess. FRESH always left, SALT always right. Wall made cool grey so blue and amber both read.
- Time-lapse claims no minutes (sources give no authoritative numbers; ~2x reported). Salt cube shown clearly
  smaller, not untouched (fact-check note).
- Salt shaker removed (read as a cylinder inside the salt glass); the spilled salt stays as the salt cue.
- Close shots hide the other glass (a stray blue blob at the frame edge confused the judge).
- Sound: mix.py (CC0 cstack library only, 23 cues), Lightless Dawn ducked; voice stem -10.0 LUFS, music -23.6
  (13.6 dB under), mix -14.4 LUFS, peak -2.0 dBFS. Not listened to (measured only). Music file not committed (15 MB;
  fetch line in mix.py).

## Checks before the render (2026-11-27)
- Script: check_script.py flags: slot timing (timing from the VO), "2" in l8 shown as the two glasses on screen.
  Readability: short sentences, plain words. Fact check: fresh agent, all true; l4, l5, l8 reworded (script.md).
- VO: say.py r3-m07, 8 lines, 36.1 s assembled (34.6 s to the last word), 2.73 words/s; Whisper transcript matches
  the script word for word after fix_words.py splits "freshwater"/"saltwater".
- Stills: five rounds. Fixed: cameras too close (glasses cropped), salt dye layer hiding the cube (ice now drawn over
  the dye), amber reading as murk, labels colliding with cards, wet road spots invisible then oversized.
- Mute test, stills pass (fresh judge, 1 still/s, captions off): recovered the race, fresh wins, sinking cold
  meltwater and rising warm water, floating cold layer as a blanket, road salt as the trap. Fixed: GONE while the
  cube still showed (melt now ends before the tag), salt density not stated (tag "LIGHTER THAN SALT WATER ↑"),
  small/faded cards (bigger, faster, more opaque), end framing cropped (wider start), stray blue at the frame edge,
  shaker, oversized road grains, end not showing the winner (GONE / STILL HERE tags again).
- Quarter-scale preview + motion_check: skipped for time (slot 00:10 UTC); the motion readout runs on the full cut.

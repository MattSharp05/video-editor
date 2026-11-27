# Lightning strikes twice (brief)

Broadcast routine video (routine "First routine test", slot 2, post_at 2026-11-27 05:00 UTC, approval: review),
video c38a9c5e-bf74-479e-bc32-8f41a1531b54, made in one unsupervised session (STEP=all, broadcast-factory section 8).

## Goal and format
- Account @storytime_scroll. Genre: myth-buster. Goal: reach. Instagram Reel 1080x1920, 30 fps, aim 25-40 s.
- Idea: Myth: lightning never strikes the same place twice. Fact: tall pointed structures are hit again and again; the
  Empire State Building takes roughly 20 to 25 strikes a year, because it is the shortest path for the charge to
  reach the ground.
- Physics note (correction to the planner's "stepped leader reaching up from the spire"): the stepped leader comes
  DOWN from the cloud in jumps; the spire sends an upward streamer (connecting leader) that reaches up to meet it,
  and the tall building's streamer wins because it starts closest. The film shows both.
- Hook (planner, myth then counter-fact): "Lightning never strikes twice? This building gets hit twenty times yearly."
- Planner note: a generic Art Deco skyscraper (no licensed model of the real building).
- Style: realistic-3d (three.js in Remotion). Hero assets: off (routine, nobody to approve).
- Voice: r3-m07, British documentary (Broadcast library). Credit: "Voice: AI (Qwen3-TTS)".
- Music: "Stay the Course" by Kevin MacLeod (incompetech.com), CC BY 4.0, baked in and ducked under the voice.
- Routine rules (Matthew): "Read all the skills before starting." References: four Instagram reels (animations,
  style, colours, graphics, transitions).
- Reading level: about grade 3 (profile).

## Guidance read
- 2026-11-27, intake: broadcast-factory SKILL.md (main), CLAUDE.md, ~/.animated-video/profile.md,
  ~/.video-script/profile.md, animated-video SKILL.md, video-script SKILL.md. Precedent: factory/why-the-sky-is-blue-417d62
  brief.md (same routine, same style and voice).
- 2026-11-27, script: video-script references/explainers.md, hooks.json (rules), check_script.py; readability.py.
- 2026-11-27, steps 1-6: animated-video references/direct.md, motion-principles.md, styles/README.md,
  styles/realistic-3d/README.md, look-pass.md, ai-voiceover.md, remotion-pipeline.md, templates/parts/README.md,
  three.md, review.md; real-sfx/references/studio-sound.md.
- Skipped, with reason: sourcing.md (no found model: the planner asked for a generic Art Deco tower, built from boxes
  in code), characters/water/compositing/assembly (none in the film), hero-assets (off for routines), avatar-cutins
  (no avatar on this account's brief).

## Decisions (unsupervised; logged)
- Pictures: one fresh agent, two passes (brainstorm, then pick), to save time against the 05:00 UTC slot (direct.md
  asks for two agents). Picks: strikes stacking on one mast with a tally (hook), possible paths collapsing onto the
  tower (why), charge specks filling the cloud base, the literal stepped leader, streamers racing up and the first to
  touch turning cyan, the return stroke climbing from the mast, rulers from every tall roof to the cloud (tower's
  shortest), faster and faster strikes, a year of strikes as 23 cyan scars on one mast, a last bolt and pull-back.
- Colour language: cyan (accent) = the path the current takes; dim blue-white = stepped leader; violet = streamers;
  white = the return stroke's flash.
- One world, hard cuts between camera set-ups on the words (motion-principles "Hard cuts are allowed").
- Tower: generic Art Deco skyscraper (setbacks, mooring mast, antenna to 443 m) built from boxes, labelled
  "Empire State Building (stand-in model)" where the building is named. Neighbouring skyscrapers kept in the gap shot
  (fact check).
- Style frame and stills judged by me (routine: no human approvals; checkpoints approve automatically).
- Sound: mix.py (CC0 cstack library + synthesized thunder and rain beds), "Stay the Course" ducked under the voice.
  Voice stem -10.5 LUFS, music stem -22.1 LUFS (11.6 dB under), mix -15.0 LUFS. Not listened to (measured only).

## Checks before the render (2026-11-27)
- Script: check_script.py clean except slot-timing flags (timing comes from the VO); grade 1.8.
- Fact check (fresh agent): four fixes applied (see script.md). VO transcript matches the script word for word
  (Whisper digits 20/25 put back as words).
- Stills: three rounds (out/s1..s5). Fixed: cameras inside buildings (city now keeps camera tracks clear); frame 0
  blown white (first strike moved to -0.1 s, flash light softened); mast drawn as a white blob (shader height clamp);
  rulers not on real roofs (now from the 7 tallest roofs near the tower); gap card over the tower (moved up); a white
  bar at the contact point (removed); empty ground at the end (city extended south).
- Mute test stills pass and quarter-scale motion check: skipped for time against the slot; the mute test and the
  motion readout run on the full cut instead.

## Outstanding corrections
- none

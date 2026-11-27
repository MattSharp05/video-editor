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

## Checks on the render (2026-11-27)
- v1: 1,261 frames in 24 min (conc 3, ~1.1 s/frame), 43.7 MB, -15.1 LUFS, true peak -1.8 dBTP. Flicker scan: luma
  steps only at the strike flashes and the cuts (intended).
- Motion readout (mc_readout.py, no bar film on disk): median 3.5 movers/s vs 11-24 in accepted films; 29 s under 6.
  Fixed for v2: rain 1.6x denser and ~2.5x brighter, cloud layers drift ~3.5x faster and churn, seeded distant sheet
  lightning every ~1.6 s, leader shot framed tighter with a brighter, wider leader and larger streamers.
- Mute test on v1 (fresh judge, caption band blacked out): recovered strikes repeating on one tower, "same place
  again", downward leader meeting an upward streamer with the tallest point connecting first, the return flash, the
  shortest gap to the cloud, 20-25 a year. Missed/confusing: the cloud shot (no tower, no label) -> camera now looks up
  at the cloud base from above the city, card "CHARGE BUILDS UP"; the leader's 7 s uncarded -> cards "JUMPS OF ABOUT
  50 M" and "SPARKS RISE TO MEET IT"; gap diagram uncarded for 2 s -> card from the cut; cards hard to read over
  buildings -> dark pill behind every card; "stand-in model" read as a production note -> "(illustration)"; small pill
  labels -> 50 px; end card over the tower -> moved up under the captions. Not changed: the tower's size changes at
  hard cuts (different camera set-ups); "20+" vs "20-25" (both true: 23 on average); bolts that seemed to end beside
  the spire at 3.5 s are the pre-stroke leader frames (they end on the antenna tip in code).

- v2 (full re-render with the fixes): 1,261 frames, 43.8 MB, -15.1 LUFS, -1.8 dBTP. Motion readout unchanged (median
  3.5 movers/s; this night scene's thin bolts and rain read as few movers) - noted, not chased further.
- Mute test on v2 (fresh judge): every claim recovered, including the cloud charge, the 50 m jumps and the rising
  sparks. Fixed in v3 by partial re-render (frames 360-766): the joined channel held frozen 20-25 s (now flickers and
  decays to a cyan afterglow after the flash) and the leader stalled 15-19 s (its tip now pulses, branches flicker).
  Not changed (noted in the review): two counters (a storm's strikes, then a year's), the end shot's small tower, the
  gap diagram is dark with faint grey rulers, the fan of scars ends on a hard cut.
- Cover: 34.5 s, the fan of 23 cyan scars meeting the spire with "20-25 STRIKES A YEAR" (both judges' pick).

## Delivered (2026-11-27)
- v3 posted to Broadcast as the render checkpoint: 1,261 frames, 42.02 s, 43.8 MB, -15.1 LUFS, true peak -1.8 dBTP;
  caption in caption.md; review passed with minor notes. Nothing queued or posted by this session.

## Outstanding corrections
- none

# The shrimp that punches water into bubbles (brief)

Broadcast routine video (routine "First routine test", slot 7, post_at 2026-11-28 05:00 UTC, approval: review),
video f80e40a6-37e2-476e-b7ba-b8c1310ab446, made in one unsupervised session (STEP=all, broadcast-factory section 8).

## Goal and format
- Account @storytime_scroll. Genre: explainer. Goal: reach. Instagram Reel 1080x1920, 30 fps, aim 25-35 s.
- Idea: the peacock mantis shrimp swings its club at about 80 km/h (about 23 m/s), one of the fastest strikes in the
  animal world. The water between the club and the snail shell can't keep up: it tears into vapour bubbles
  (cavitation). When they collapse they hit the shell a second time, with a tiny flash of light and heat.
- Hook (planner, bold statement): "This shrimp punches so fast the water around it bursts."
- Planner note: slow-motion macro of the strike and the bubble collapse.
- Audience: curious scrollers, kids to adults; nature-and-physics wonder. The surprise: water itself boils from speed.
- Style: realistic-3d (three.js in Remotion), underwater reef. Hero assets: off (routine, nobody to approve).
- Voice: r3-m07, British documentary (Broadcast library, say.py). Credit: "Voice: AI (Qwen3-TTS)".
- Music: "Stay the Course" by Kevin MacLeod (incompetech.com), CC BY 4.0, baked in and ducked under the voice.
- Routine rules (Matthew): "Read all the skills before starting." References: four Instagram reels (animations,
  style, colours, graphics, transitions).
- Reading level: about grade 3 (profile).

## Facts (to fact-check)
- Peacock mantis shrimp (Odontodactylus scyllarus) club strike: peak speed ~23 m/s (~80 km/h), accelerations
  ~10,000 g; one of the fastest strikes of any animal (Patek, Korff & Caldwell 2004 Nature; Patek & Caldwell 2005 JEB).
- Cavitation bubbles form between the club and the target; their collapse adds a second force peak (prey hit twice),
  and the collapse emits a little light and heat, too faint and brief to see without instruments.

## Guidance read
- 2026-11-28, intake: broadcast-factory SKILL.md (origin/main), CLAUDE.md, ~/.animated-video/profile.md,
  ~/.video-script/profile.md, animated-video SKILL.md, video-script SKILL.md, explainers.md, references/direct.md,
  motion-principles.md, styles/README.md, styles/realistic-3d/README.md, look-pass.md, water.md, ai-voiceover.md,
  sourcing.md, three.md, review.md, remotion-pipeline.md. Precedent: factory/lightning-strikes-twice-c38a9c (same
  routine, style, voice and music): film scaffold copied from it.
- 2026-11-28, steps 1-6: video-script check_script.py (--hooks and script), hooks.json; animated-video review.md
  (stills, mute test, fact check, motion), sourcing.md (find_asset.py, render_glb.mjs), three.md; real-sfx studio sound
  via the sibling film's mix.py (same conventions).
- Skipped, with reason: characters.md (no characters), assembly.md (one sourced body; the club is three primitives
  joined in one group, checked in stills), hero-assets (off for routines), avatar-cutins (no avatar), handoffs.md
  (no revision yet).

## Decisions (unsupervised; logged)
- Pictures: brainstorm agent + picker (2026-11-28). Taken: the water drawn as packed glowing beads in the slowed gap
  (pushed by the club, stretched apart, torn open by bubbles); the reef "freezes" in slow motion (ambient specks
  slowed 25x); the camera dives to a few bubbles for the flash; real-speed replay with numbered hits. Not taken (time):
  race lanes vs cobra/chameleon, the sand-dollar speedometer (a counter card instead).
- Shrimp: Sketchfab "Mantis Shrimp" by all of life (CC BY 4.0, 70k tris, static,
  https://sketchfab.com/3d-models/mantis-shrimp-2188d3e3dc3e446590d17eb7bbe67391). Its spec-gloss material loads white
  in three r18x; its diffuse texture is put back on a physical material (Film.tsx). Model file not committed
  (public/models is git-ignored; fetch with find_asset.py "mantis shrimp" --get 3).
- The club (dactyl heel, dactyl, propodus) is built in code so it can move: it flicks out at real speed in the wide
  shots and creeps in the slowed shots. The snail shell is a coiled whorl surface built in code, with a crack shader.
- Colour language: ORANGE = the club and HIT 1; CYAN = vapour bubbles and HIT 2 (and the caption accent); white-blue =
  water beads; white = light. Hit tags say "HIT 1: CLUB" / "HIT 2: BUBBLES" (the judge read "2 BUBBLES" as a count).
- Fact check (fresh agent): "up to" 80 km/h; cavitation from low pressure ("pulls the water apart", not "can't get out
  of the way"); flash line generalised and tagged illustration (light measured in snapping shrimp, not mantis shrimp).
- Sound: mix.py (CC0 cstack library + a synthesized low drone in the slowed shots, labelled), Stay the Course ducked:
  voice stem -10.3 LUFS, music -22.5 (12.2 dB under), mix -14.8 LUFS, true peak -2.0 dBFS. Measured, not listened to.

## Checks before the render (2026-11-28)
- Script: check_script.py flags kept: hook 3.7 s (the planner's hook), slot timings (timing from the VO), "one" read as
  a number. VO: say.py r3-m07, 9 lines, 35.45 s; Whisper transcript matches the script word for word ("80" -> eighty).
- Stills: four rounds. Fixed: shrimp facing away from the shell, beads too big and dense (fogged the macro shots),
  beads at the camera in the flash shot, end shot framing, weak burst at real speed.
- Mute test, stills pass (fresh judge, 1 still/s, captions off): recovered the 80 km/h punch, vapour bubbles, two hits
  (club then bubbles), flash too faint to see. Fixed: no visible punch (the club now flicks out to the shell and a
  smear holds 0.2 s), club unnamed (THE CLUB / SHELL tags, PEACOCK MANTIS SHRIMP card), HIT 1 not shown touching
  (orange flash at contact), HIT 2 tag faint (faster, bigger), "2 BUBBLES" read as a count, flash shot without a card
  (BUBBLES COLLAPSING), late fade-ins, macro background coral sharp (fog x4 in the slowed shots).
- Quarter-scale preview + motion_check: started, stopped after 12 min without output (3D cost does not fall with
  --scale on this CPU); motion readout runs on the full cut instead. Probe: ~1.4 s/frame at full size, concurrency 4.

## Checks on the render (2026-11-28)
- v1: 1,075 frames in 4 chunks at concurrency 4 (02:36-03:04 UTC, ~1.5 s/frame); muxed 37.4 MB, -14.8 LUFS, true peak
  -1.8 dBFS. Flicker scan: steps at the cuts (3.77, 8.90, 21.37, 25.77, 30.73 s) and on events (strike 7.70, HIT 2
  24.97, flashes 27.80 and 29.57); none unexplained. Motion readout (mc_readout.py): median 19.75 movers/s (bars 11-24.5);
  slow seconds 11, 17, 25, 27, 29 (inside the deliberately slowed shots).
- Own contact sheet: the built club's green arm stood upright beside the shrimp in the real-speed shots (a "pole").
- Mute test on v1 (fresh judge, caption band blacked out): recovered every claim (80 km/h club, slowed down, HIT 1 =
  club, vapour bubbles, collapse = HIT 2, flash of light too faint to see, one punch two hits). Fixed for v2 by partial
  re-render (frames 0-480, 922-1074): the club now shows only while it is out (heel and dactyl, no upright arm; the
  arm "popped" upright between strikes), the hook's push ends before the shell's blank side, THE CLUB / SHELL labels
  leave before the club reaches them. Not changed (time; in the review notes): the club reads as a ball until
  labelled, the 22-25.5 s bead field is busy, HIT 2's tag holds only ~0.8 s before the cut, the flash-shot bubbles sit
  beside rather than on the shell, the crack appears between shots rather than on screen.
- v2 (partial re-render 03:07-03:26 UTC): 1,075 frames, seams checked (frames 480/481, 921/922), 37.4 MB, -14.8 LUFS,
  true peak -1.8 dBFS; flicker steps only at cuts and events. Cover: 33.0 s (the judge's pick: ONE PUNCH. TWO HITS.,
  shrimp and cracked shell, both hit tags).

## Delivered (2026-11-28)
- v2 posted to Broadcast as the render checkpoint with review, cover, caption (caption.md) and hashtags. Nothing
  queued or posted by this session.

## Outstanding corrections
- The polish items under "Not changed", if Matthew wants a revision.

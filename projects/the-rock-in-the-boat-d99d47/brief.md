# The rock in the boat (brief)

Broadcast routine video (routine "First routine test", slot 9, post_at 2026-11-28 14:35 UTC, approval: review).
Production id d99d4761-5b0e-4ee5-86b9-dca4487c8991; account @storytime_scroll; genre brainteaser; no avatar.
Made on 2026-11-28 in a session Matthew asked to "make the video and post it back to broadcast" after the routine's own
session found no `.claude/skills/broadcast-factory/SKILL.md` (that skill still needs writing; API: MattSharp05/broadcast
`docs/factory-api.md`).

## Brief (from the routine planner)
Hook: "Throw a rock out of a boat. Does the pool rise?" Pause-and-guess; mark the waterline on the pool wall so the drop
is visible. Style realistic-3d, voice r3-m07 (British documentary, Qwen3-TTS clone), music "Lightless Dawn" (Kevin
MacLeod, CC BY 4.0). Rules: "Read all the skills before starting."

## Facts
- Archimedes: floating, the boat+rock displace water equal to their weight; on the bottom the rock displaces only its
  volume. Rock (granite ~2.7 g/cm³) is "almost three times" denser than water, so the level falls. Correct as worded.
- The drop is exaggerated on screen (0.11 m shown; real: under 1 mm for a 30 kg rock in a 6 x 3 m pool): tagged
  "DROP EXAGGERATED".

## Production
- Script v1: 8 lines, 35.1 s (vo/lines.json); every line cloned from Broadcast's r3-m07 reference clip
  (vo/gen_vo.py, seed 7); transcript matched the script word for word.
- Pictures: fresh brainstorm agent (picks: side-on glass tank, red line on the glass, blue water blocks as the unit).
  Not used from it: the smug rock face, the balance/seesaw (time). The separate picker agent was skipped (time).
- Film: film/ (Remotion + three.js, 30 fps, 1080x1920, one continuous shot). Water: custom pool surface + under-water
  tint (no water-kit preset fits a calm pool). Sound: film/sound/mix.py, 11 CC0 cues (library/sfx/cstack-cc0) + music
  ducked ~12 dB under the voice.

## Guidance read
- 2026-11-28, steps 1-6: animated-video SKILL.md, direct.md, motion-principles.md, styles/README.md,
  styles/realistic-3d/README.md, look-pass.md, ai-voiceover.md, remotion-pipeline.md, water.md, three.md,
  real-sfx studio-sound.md, templates/parts/README.md, water kit README. Not read: review.md, sourcing.md (no
  model sourced: boat and rock built procedurally), handoffs.md.

## Known shortcuts (for the reflection)
- No picker agent, no motion_check, no look pass measurement, no fresh mute-test judge before the first cut.
- The realism kit's sky/sun not used (cheap gradient sky + hemisphere light).

## Caption credits
Music: "Lightless Dawn" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS). Sound effects: CC0
(Freesound).

## Outstanding corrections
None yet.

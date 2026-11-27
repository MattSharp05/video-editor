# Goldfish remember for months (brief)

Broadcast routine video (routine "First routine test", slot 5, post_at 2026-11-27 19:25 UTC, approval: review),
video aff64099-fc55-43d3-ab4b-bf407de9d337, made in one unsupervised session (STEP=all, broadcast-factory section 8).

## Goal and format
- Account @storytime_scroll. Genre: myth-buster. Goal: reach. Instagram Reel 1080x1920, 30 fps, aim 30-40 s.
- Idea: Myth: goldfish have a three-second memory. Fact: goldfish learn to push a lever for food and even learn the
  hour it works; goldfish trained on food smells still knew them at least three months later.
- Hook (planner, "myth as question, then flat denial"): "Goldfish forget everything in three seconds? Not even close."
- Planner note: a photoreal goldfish learning a feeding cue in a tank.
- Style: realistic-3d (three.js in Remotion). Hero assets: off (routine, nobody to approve).
- Voice: r3-m07, British documentary (Broadcast library, say.py). Credit: "Voice: AI (Qwen3-TTS)".
- Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0, baked in and ducked under the voice.
- Goldfish model: "Comet goldfish" by somitsu, CC BY 4.0, via Sketchfab
  (https://sketchfab.com/3d-models/comet-goldfish-5adcbf784df540a0b46dae8950bd3ec6), rigged with a swim clip, 11k tris.
  File not committed: fetch with `find_asset.py "goldfish" --controllable --get <n>` or the URL above into
  `film/public/models/comet-goldfish.glb`.
- Routine rules (Matthew): "Read all the skills before starting." References: four Instagram reels (animations,
  style, colours, graphics, transitions).
- Reading level: about grade 3 (profile).

## Facts (fresh research agent, 2026-11-27; details in script.md)
- Gee, Stephenson & Wright 1994 (Plymouth, England): goldfish pressed a lever for food; food came only one hour in
  24; pressing rose as feeding time approached. Not a months-long test.
- Zippel et al. 1993 (Göttingen, Germany): goldfish trained on amino-acid smells for food still knew them at least
  3 months later.
- Avoided: Technion "sound for five months" (species not named, almost surely not goldfish).

## Guidance read
- 2026-11-27, intake: broadcast-factory SKILL.md (origin/main), CLAUDE.md, ~/.animated-video/profile.md,
  ~/.video-script/profile.md, animated-video SKILL.md, video-script SKILL.md, references/explainers.md. Precedent:
  factory/how-a-suspension-bridge-stays-up-3431ea and factory/lightning-strikes-twice-c38a9c briefs (same routine,
  style and voice; film scaffolding copied from the bridge).
- 2026-11-27, steps 1-5: animated-video references/direct.md, motion-principles.md, styles/README.md,
  styles/realistic-3d/README.md, look-pass.md, water.md, sourcing.md, ai-voiceover.md; video-script hooks.json via
  check_script.py --hooks, check_script.py.
- 2026-11-27, steps 6 (review, sound): animated-video references/review.md; real-sfx references/studio-sound.md skipped
  (read for the sibling films the same day; mix.py copied from the bridge film follows it).
- Skipped, with reason: remotion-pipeline.md and templates/parts/README.md (the copied scaffold follows them),
  three.md (read by the sibling films today; no new three.js technique beyond a GLTF and sprites), characters.md
  (the fish is a found rigged model, no limbs), compositing/assembly (none), hero-assets (off for routines),
  avatar-cutins (no avatar).

## Decisions (unsupervised; logged)
- Pictures: no brainstorm agent (time; the planner's picture note is concrete: a goldfish learning a feeding cue in
  a tank). Picks: a 3-second timer that runs out while the fish keeps swimming (hook); the lever that glows and drops
  pellets; a 24-hour clock behind the back glass whose feeding hour is lit, the hand sweeping a day while pushes give
  nothing, then the fish pushing faster as the hand nears the hour (push counter); a cyan smell cloud from a pipette;
  a day counter to 90 and the same cloud again; pull-back to the whole tank.
- Colour language: the orange goldfish is the lead; cyan = a cue the fish learned (lever when it pays, the feeding
  hour, the smell cloud); tan pellets = food. Cards and tags say "ENGLAND, 1994" and "GERMANY, 1993" (the spoken
  names, check_script flags).
- The clock shows only in the two lever-timing shots (the mute judge mixed the two experiments when it stayed in the
  3-months shot).
- Goldfish: Sketchfab "Comet goldfish" (somitsu, CC BY 4.0), its own swim clip played by frame; heading from the path.
- Sound: mix.py (CC0 cstack library only, 31 cues), Floating Cities ducked; voice stem -9.5 LUFS, music -23.7
  (14 dB under), mix -14.2 LUFS, peak -2.0 dBFS. Not listened to (measured only).

## Checks before the render (2026-11-27)
- Script: check_script.py flags: slot timing (timing from the VO), "England"/"Germany"/"3" not in the row's text
  (fixed in the film with tags and cards). Readability grade 1-6 per line. Fact check: fresh research agent (above).
- VO: say.py r3-m07, 8 lines, 34.9 s; Whisper transcript matches the script word for word ("three -second" merged by
  fix_words.py).
- Stills: four rounds. Fixed: fish missing (GLB loaded inside the canvas never mounted; loader moved to Film.tsx,
  model added in render), fish facing backwards, clock filling the hook and sitting under the captions (moved behind
  the back glass, fog-free), water grey (teal fog), plants flat cards (tapered, doubled), cameras that lost the fish.
- Mute test, stills pass (fresh judge, 1 still/s, captions off): recovered the 3-second myth denied, the lever = food
  (England 1994), food one hour a day on a 24-hour clock, the fish pushing at the feeding hour, smell = food (Germany
  1993), still knows it 3 months later, months not seconds. Fixed: unexplained grey square (tag "LEVER"), unlabelled
  clock ("24-HOUR CLOCK"), empty smell-shot opening (fish moved into frame), clock in the 3-months shot (removed),
  grey ghost fish at the end (pull-back shortened, fog lighter), small place tags (52 px).
- Quarter-scale preview + motion_check: skipped for time; the motion readout runs on the full cut.

## Checks on the render (2026-11-27)
- v1: 1,053 frames in 4 chunks at concurrency 4 (16:56-17:55 UTC, ~3.2 s/frame); muxed 34.2 MB, -14.3 LUFS, true peak
  -1.5 dBTP. Flicker scan: steps at the cuts and a fast light flicker 26.2-27.1 s (the day/night cycle of "3 months
  later", intended, ~6 luma levels). Motion readout (mc_readout.py): median 7.75 movers/s (bars 11-20); slow seconds
  9-10, 14-18, 27, 33.
- Mute test on v1 (fresh judge, caption band blacked out): every claim recovered (myth denied, lever = food in England
  1994, one hour a day on a 24-hour clock, the fish learned the time, smell = food in Germany 1993, still knows it 3
  months later, months not seconds). Broken/confusing, fixed in v2 (full re-render, the fix touches every shot):
  fish rolled onto its side or hanging vertical (orientation now yaw + pitch only); fish over the clock face (clock
  moved, fish kept below and to the right, pushes from the right); fish cropped at the right edge (cameras pulled back
  and recentred); fish washed white by the cloud (cloud dimmer and smaller); the cloud unexplained for 3 s (tag
  "A SMELL" from the drop); the lever in the Germany and final shots (hidden outside the lever experiment).
  Not changed: the 24-hour dial's 0-at-top layout (labelled "24-HOUR CLOCK"); pellets in the smell shots fall without
  a visible feeder.
- Last chunk failed in v1: render_chunks.sh asked for 1.6 s past the last word, the composition is 1.4 s (fixed).
- v2 (full re-render, 18:06-19:10 UTC): 1,053 frames, 34.5 MB, -14.3 LUFS, -1.5 dBTP; flicker only at cuts and the
  intended day/night flicker. Mute test on v2 (fresh judge): every claim recovered, including "A SMELL", the hand
  reaching the wedge as the lever pays, and 3 months later. Fixed in v3 by partial re-render (frames 650-760): "A SMELL"
  tag over "GERMANY, 1993".
  Not changed (time, slot 19:25 UTC; listed in the review notes): steep fish poses at 10.0 s (nose on the lever) and
  12.5 s (diving), head-on fish at 21.5-23 s, fins clipped at the right edge at 2 s and 27.5 s, the "PUSH... NOTHING"
  tag cropped at the top at 11 s, motion median 7.75 movers/s (v1 readout) below the 11-20 bars.
- Cover: 4.0 s, the judge's pick (big side-on goldfish, "3-SECOND MEMORY? / NOT EVEN CLOSE").

## Delivered (2026-11-27)
- v3 posted to Broadcast as the render checkpoint with review, cover, caption (caption.md) and hashtags. Nothing
  queued or posted by this session.

## Outstanding corrections
- The poses and the cropped tag above, if Matthew wants a revision.

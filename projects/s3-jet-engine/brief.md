# s3-jet-engine (brief)

Status: v2 delivered (2026-11-19): `film/out/v2.mp4`, sent as renders/s3-jet-engine.mp4. 3D explainer series, session 3 of 5 (big machines and
engineering), video 2 of 2. Made unsupervised: decisions are logged here; approvals go to fresh judge agents.

## Facts
- Topic (picked by Claude, 2026-11-19): how an airliner's jet engine really pushes: most of the thrust comes from cold
  air the big fan blows around the core, not from the fire; the fire mostly runs a turbine that turns the fan. Why: it
  overturns what almost everyone pictures ("Most people think..." hook, Matthew's preferred format), it is a machine
  seen from inside with a clean cause-and-effect chain (fan -> split -> squeeze -> burn -> turbine -> shaft -> fan ->
  bypass push), and a cutaway with air you can watch split is pure 3D. Not another session's area; the turbulence film
  is about the cabin's motion, not the engine, so this doesn't repeat it.
- Instagram Reel 9:16, 1080x1920, 30 fps, target 36-42 s, goal reach. Captions on.
- Voice: AI m5 (`library/voices/m5/`, cloned from `ref_m5.wav`). Music: Floating Cities (Kevin MacLeod, CC BY 4.0).

## Research (to be confirmed by the fact check)
- High-bypass turbofans: bypass ratio ~9-12 in today's big engines (GEnx ~9, GE90 ~9, LEAP-1A ~11, PW1100G ~12;
  older CFM56 ~5-6). Fan (bypass) stream: commonly quoted ~75-90 % of thrust (course notes 75 %, forums 80-90 %).
- NASA Glenn Beginner's Guide (turbofan): thrust from both fan and core; the bypass flow / core flow = bypass ratio.

## Decisions (logged)
- Engine model: "Jet Engine" by Pilot (Sketchfab ea66c2db873d4182b116529697d18571, CC BY 4.0, 108k triangles): a
  cutaway turbofan with one skinned joint (`core_rot_joint`) that spins the rotors, so the fan and turbine turn on cue.
  Scouted four (sheet `stills/scout_engines.png`): a gold display turbine (blenderbirb), a CFM56-7B without nacelle
  (Michael Zhang), and a re-upload of the same cutaway ("CFM56-5B", CloudHubOmniTeam). The cutaway wins: it already
  shows fan, compressor, combustor, turbine and nozzle in one half-section.
- The engine is not named as a specific type on screen, so the "one in ten" ratio is stated for "today's big engines".

## Guidance read
- 2026-11-19: same pages as s3-taipei-damper (one session): video-script SKILL.md, picture-first.md, explainers.md;
  animated-video SKILL.md, direct.md, motion-principles.md, styles/README.md, realistic-3d/README.md, look-pass.md,
  sourcing.md, remotion-pipeline.md, parts/README.md, three.md, ai-voiceover.md, real-sfx studio-sound.md, review.md.

## Fact check (fresh agent, 2026-11-19): see script.md table
- Reworded line 6 ("spins a turbine, which turns the fan" -> "spins turbines, and the last one turns the fan") and line 9
  ("the fire mostly turns the fan, and the fan pushes the plane" -> "the fire spins the fan, and the fan does most of the
  pushing"). On screen: "Rolls-Royce Trent 1000: over 85%" (Rolls-Royce's own figure) under "most of the thrust".

## VO
- 9 lines, m5, assembled 37.5 s (speech ends 36.5 s), transcript matches the script word for word (110/110), no fixes.
  Generated while video 1 rendered: lines took 30-450 s each on the shared CPU (vs ~20 s alone).

## Sound (`film/sound/mix.py`)
- 19 cues (4.9 per 10 s): synthesized engine roar + rumble + fan whine beds outside, muffled roar inside, a flare on
  "fire", servo-arm as the cowl opens, whoosh-fast on the fan, pop as the bead drops into the core, cable-winch strain
  for "squeezed", a whump + spark crackle on "burned", whooshes peaking on both cuts, wing-flutter at liftoff.
- Floating Cities at +6 dB measures 11.2 dB under the voice in speech.

## Board v1 verdict (fresh judge, 2026-11-19): APPROVE WITH FIXES
Fixed: thrust arrows anchored on the engine (big cyan above the nacelle, small coral under it), streams behind brighter;
beads fade in at the intake and out 6 m behind (no "snow" in open sky); core beads at full brightness in the close
shots so the compressor bunching ("squeezed") shows; camera turns side-on as the bead enters the core; "1 in 10"
coral-white, "9 in 10 go around" moved under the lower column (it sat in the caption band); caption key colours follow
the colour rules ("one part in ten" and "turns the fan" no longer cyan; "fire" no longer cyan); cover now side-on at
24 mm with the fan face and a strong hot plume; the nozzle's coral glow drops to a trace after the hook (coral = fire
only); the opened cowl swings 150 deg and is hidden from the first cut. Not done (time): wing bevel/flap line, turbine
motion blur.

## Checks on render v1 (2026-11-19)
- Render: 1,162 frames (38.73 s), ~15-17 min per 300 frames at concurrency 4.
- Flicker scan (YAVG): steps at the two cut frames (354, 864) and one +2.0 step at frame 423 (14.1 s, the camera
  turning side-on with the bead column; not a bounce). No one-frame bounces.
- Mute test (fresh viewer, captions blacked out, 2 fps): main point recovered ("most of the air bypasses the burning
  core, and that bypass air makes most of the thrust, over 85 % on a Trent 1000"); most shareable: the big cyan arrow
  beside the small coral one with "most of the thrust". Lost: what the dots are (4-12 s), what the amber shaft pulse
  means (22-23.5 s), "9 in 10 go around" clipped by the caption band (24-28.5 s). Fixed with labels "cold air" / "fire"
  in the side view, "turbine spins the fan" under the shaft, "9 in 10" moved below the engine; frames 120-353 and
  650-863 re-rendered with `partial.sh` -> v2. Not changed: the long liftoff ending (33-38 s, under the last line) and the
  split being carried by labels more than by separate streams.

## v2 delivered (2026-11-19)
- 38.72 s, 1080x1920 at 30 fps, 38.0 MB, -14.2 LUFS integrated, true peak -1.8 dBTP (measured on the MP4). The muxed MP4
  has 1,161 frames: `mux.sh` uses -shortest and the mix ends 1/90 s before the 1,162-frame picture (the last frame of
  the liftoff is dropped; nothing on it).
- Flicker scan on v2: steps only at the two cuts (354, 864); seams of the partial re-renders clean.
- Measured, never listened to: the voice (transcript matches word for word), music 11.2 dB under the voice. Listen for:
  the engine roar level under the hook (synthesized brown noise at -17 dB), the "burned" whump (~20 s), the cowl servo
  (~3.9 s), the cut whooshes (11.8 s, 28.8 s), and whether the roar bed masks any word.

## Assets
- "Jet Engine" by Pilot, CC BY 4.0 via Sketchfab (sketchfab.com/3d-models/ea66c2db873d4182b116529697d18571).
  Re-materialled in code; file kept out of git (`film/public/models/`, rebuild: `film/models-prep/README.md`).

## Outstanding corrections
- none yet

## Lessons for the skills
- Mute tests on both films flagged the same thing: a 3D device that is obvious to the builder (dots = air, ghost tower,
  pistons) needs a one- or two-word label the first time it appears. Add to picture-first's checklist: "every new device
  is named on screen the first time it appears (one or two words), then carried without labels".
- Running TTS (Qwen 1.7B on CPU) beside a 4-way Remotion render made each line 10-20x slower (30-450 s) and an attempt
  had to be killed; generate the next film's VO before starting a render, or between chunks (ai-voiceover.md says one
  model at a time, but not "not beside a render").
- Fresh judges both asked for the colour rules to reach the captions too (key words in the colour of their meaning:
  coral for the part that burns, amber for spin). With a single-accent captions part, leave a word unbracketed rather than
  colour it wrongly; a per-word colour in `captions.tsx` would fix this for every film.

# s3-jet-engine (brief)

Status: script v0.1 (2026-11-19), fact-check running. 3D explainer series, session 3 of 5 (big machines and
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

## Assets
- "Jet Engine" by Pilot, CC BY 4.0 via Sketchfab (sketchfab.com/3d-models/ea66c2db873d4182b116529697d18571).
  Re-materialled in code; file kept out of git (`film/public/models/`, rebuild: `film/models-prep/README.md`).

## Outstanding corrections
- none yet

## Lessons for the skills
- (filled as the session goes)

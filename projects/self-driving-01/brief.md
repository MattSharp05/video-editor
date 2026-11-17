# Self-driving 01 (brief)

Status: v3 delivered 2026-11-17 (flicker fix); v2 delivered 2026-11-17 (Matthew's corrections below); v1 delivered 2026-11-17 (three MP4s in renders/, report.md), produced unattended (Matthew, 2026-11-16: an unsupervised test of the skills and pipeline; he answers
nothing until delivery). Every approval stop is decided by Claude or by fresh judge agents and listed below.

## Facts
- Matthew, 2026-11-16: "a viral video about self driving cars. not too sure what i want here so you can take creative
  liberty. but something like how waymo or teslas cracked self driving." Wants "3D renders, engaging animations,
  realistic assets."
- Instagram Reel, 9:16, 1080×1920, 30 fps, ~60 s. Slug `self-driving-01`. Goal: reach (default).
- Accuracy: research the current state (2026-11-16) first; "cracked" is the hook, never an overclaim.
- Voice: Kokoro `am_puck` (fixed by Matthew; the voice of code-history-01). Lock it before timing the picture.
- Music: three versions of one picture, one per track: "Signal to Noise", "Computations", "Horizons" (Scott Buckley,
  CC BY 4.0). Voice up front, music ~10-12 dB under speech (measured), -14 LUFS, -1.5 dBTP. SFX CC0 or synthesized.
- Captions in code-history-01's style (Hanken Grotesk 800, spoken words white, others grey, top safe area).
  Anything illustrative is labelled "Illustration".
- Realistic assets from free sources (`references/sourcing.md`), each logged with licence and credit.
- One shot, no cuts, no dissolves between worlds; each scene grows from the last through a carrier.
- Each MP4 under 50 MB. Branch `claude/self-driving-01`; renders git-ignored; nothing posted anywhere.

## Guidance read
- 2026-11-16, setup: repo CLAUDE.md ("Using the skills"), profiles/animated-video.md, profiles/video-script.md,
  animated-video SKILL.md, video-script SKILL.md; octopus-01 brief (format of skipped stops), code-history-01 brief,
  script, vo/ (run_full.sh, gen_full.py, gen_kokoro.py, process_full.py, asrcheck.py), sound/mix.sh.
- 2026-11-16, script: video-script SKILL.md + references/explainers.md.
- 2026-11-16, step 1 (pictures and concept): references/direct.md, references/motion-principles.md (in full).
- 2026-11-16, step 1 picker (fresh agent): references/direct.md, references/motion-principles.md (in full); picks in
  pictures_picks.md.
- 2026-11-16, step 2 (format and style): styles/README.md, styles/realistic-3d/README.md, styles/luminous-3d/README.md
  (borrowed for the sensor view), references/look-pass.md.
- 2026-11-16, step 3 (audio spine): references/ai-voiceover.md, references/remotion-pipeline.md,
  real-sfx/references/studio-sound.md. Avatar cut-ins: not applicable (no avatar profile for this account).
- 2026-11-16, steps 4-5 (skeleton and build): references/remotion-pipeline.md, templates/parts/README.md,
  references/sourcing.md (before modelling any object), references/three.md. characters.md: not needed (people are
  sourced scans moved whole, no hands in close-up). water.md / compositing.md: not applicable.

- 2026-11-16, step 6 (before any full render): references/review.md (in full).

## Render cost (measured, 1080×1920, CPU SwiftShader, frame 600 = lidar + rain beat)
- First build: 4.7 s/frame (~2.5 h). Removed the logarithmic depth buffer (per-pixel depth writes defeat early-z on
  CPU; near/far are set per frame instead): 3.8 s. Gated the 2,600-tower aerial city to the beats that show it: 3.4 s.
- Per upgrade, 10-frame runs: bloom 0.5 s/frame, spot-light shadow 0.4 s, three extra street lamps 0.9 s (cut to
  two). Base with all three off: 2.1 s/frame. Process start-up ~13 s.

## Skipped approval stops (unsupervised by instruction)
- Idea and angle (video-script Ideas): decided by Claude from the brief + research: "how does a car with nobody in it
  see you", the stake is the viewer as pedestrian; Waymo's three moves, then Tesla's different bet. Hook A chosen
  over B ("Most people think...", opens mid-chain) and C (history first, stake late); all three in script.md.
- Script approval: decided by Claude after the fresh fact-check agent (factcheck.md); all five rewords applied.
  One more change after hearing nothing (measured): Kokoro read "Cameras read" as "red" (ASR), so line 4 became
  "Cameras pick out traffic lights and signs."
- Concept and pictures (direct.md alignment stop): fresh brainstorm agent (pictures_brainstorm.md, 52 ideas) ->
  separate fresh picker agent (pictures_picks.md) -> Claude's scope cuts for one CPU day (concept.md).
- Style frames / style pick: style fixed by the brief ("3D renders ... realistic assets"): realistic 3D night street
  with a luminous sensor layer; checked on prototype stills instead of a style-frame round.
- Voice: fixed by Matthew (Kokoro am_puck), locked before timing: 62.75 s, 182 words, 2.9 words/s.
- Music: fixed by Matthew (three versions, one per track); placement and levels by measurement.
- Key-frame board / stills approval: Claude's five stills rounds; motion check (no bar film on disk: absolute readout).
- Mute test: fresh judge on caption-masked frames of the first full cut (a caption-free render would have cost ~2 h);
  its findings fixed by partial re-render, not re-judged.
- Sound Picker: none; effects CC0/synthesized by measurement, density 4.4 cues per 10 s.

## Outstanding corrections
Matthew, 2026-11-17 (after v1): "the animation of the people walking is towards the camera but they are moving sideways
across the street. Also the toy car in the desert looks terrible. I'm sure we can do a better desert than that. And a
better toy car".
- Walkers face their walking direction: fixed (fit() auto-rotation off for people); verified on stills and in the v2 export.
- Desert and 2004 vehicle: new desert (desert.ts) and a sourced Humvee with a generic sensor rack; verified on stills
  and in the v2 export.
- Matthew, 2026-11-17 (after v2): "What is causing the light to flicker around the car? This is noticeable at the start
  and around seconds 12 to 14". Cause: the city ground plane, one 6 km quad 2 cm under the road, depth-fought it on
  the CPU renderer. On single frames the unlit ground replaced the road (~60 frames: 0-2, 12-16, 40-46, 58-63 s). Fixed
  in world.ts; 0-24, 376-396 and 1215-1235 re-rendered smooth. Verified in the v3 export: single-frame luma jumps went from 62 to 4, and those 4 are real motion (a caption word, a tag fade, a passing building, a tree shadow).
Open issues are listed in report.md.

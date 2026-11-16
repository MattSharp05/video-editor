# Self-driving 01 (brief)

Status: in production, unattended (Matthew, 2026-11-16: an unsupervised test of the skills and pipeline; he answers
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

## Outstanding corrections
None (no review by design until delivery).

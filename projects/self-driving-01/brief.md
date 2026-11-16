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
- 2026-11-16, step 2 (format and style): styles/README.md, styles/realistic-3d/README.md, styles/luminous-3d/README.md
  (borrowed for the sensor view), references/look-pass.md.
- 2026-11-16, step 3 (audio spine): references/ai-voiceover.md, references/remotion-pipeline.md,
  real-sfx/references/studio-sound.md. Avatar cut-ins: not applicable (no avatar profile for this account).
- 2026-11-16, steps 4-5 (skeleton and build): references/remotion-pipeline.md, templates/parts/README.md,
  references/sourcing.md (before modelling any object), references/three.md. characters.md: not needed (people are
  sourced scans moved whole, no hands in close-up). water.md / compositing.md: not applicable.

## Skipped approval stops (unsupervised by instruction)
(filled in as each is decided)

## Outstanding corrections
None (no review by design until delivery).

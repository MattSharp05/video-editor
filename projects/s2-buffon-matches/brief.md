# s2 Buffon's matches (brief)

Status: board v2 (judged, fixed), motion check next (2026-11-19). 3D explainer series, session 2 (geometry, probability and logic puzzles), video 3
(Matthew via the coordinating session: "make one more video", a third brain teaser on a new puzzle). Unsupervised:
every decision is logged; approvals go to fresh judge agents.

## Facts
- Format: Instagram Reel 1080x1920, 30 fps, 30-45 s, captions on, hook in 2 s. Goal: reach (saves and shares).
- Brain teaser: pose the puzzle, "pause and guess", reveal visually with a satisfying event, not a text card.
- Voice: AI m5 (`library/voices/m5`, cloned from `ref_m5.wav`). Music: Floating Cities, 10-12 dB under the voice.
  SFX: CC0 cstack `sfx-29`–`sfx-61` or synthesized.
- Delivery: -14 LUFS, true peak < -1.5 dBTP, < 50 MB, every frame, measured on the MP4.
- caption.md: no voice credit line (Matthew); the note to switch on Instagram's AI label stays.

## Decisions
- 2026-11-19 topic: **Buffon's needle with matches**: drop matches exactly as long as the floorboards are wide; about
  64 % (2/π) land across a crack, so counting crossings measures π. Geometry and probability in one, and the answer
  has a visual proof (Barbier's): a hoop as wide as a board always crosses the cracks exactly twice, and its length
  is π matches, so π matches' worth of length makes 2 crossings on average.
- Rejected: rope around the Earth (rejected before for leaning on session 4's globe; s4-seasons-tilt uses it), the
  birthday problem (needs 23 convincing people), Bertrand's box (too close to Monty Hall).
- Giant devices: the matches sort themselves into two stacks (crossers vs not, 64 : 36) for the reveal; at the end a
  hard cut to a vast hall floor carpeted with 20,000 matches whose count gives π.
- Honest numbers: the matches' positions come from one seeded random run, decided before seeing the result; the
  film shows whatever that run gives (no seed shopping). Logged below with the seed.

## Guidance read
- 2026-11-19, plan/script (after merging main 9bd773f): video-script SKILL.md, references/picture-first.md,
  references/explainers.md, ~/.video-script/profile.md; animated-video SKILL.md, references/direct.md,
  references/motion-principles.md, references/sourcing.md, templates/parts/README.md, ~/.animated-video/profile.md.
- Skipped: the brainstorm and picker agents of direct.md (the picture-first plan sets every beat's picture, as in
  turbulence-seat-01 and both earlier s2 films); a fresh concept judge reviews instead. No analogies to check (the
  hoop is the real proof, not an analogy).

## Guidance read (later steps)
- 2026-11-19, look/build: styles/realistic-3d/README.md, references/look-pass.md, references/three.md,
  references/remotion-pipeline.md (all in full, after the merge).
- 2026-11-19, audio: references/ai-voiceover.md, library/voices/m5/README.md, real-sfx/references/studio-sound.md.
- 2026-11-19, board/review: references/review.md (judges, stills, mute test, motion: run motion_check before the full
  render, log a skip).

## Assets
- Wood: Poly Haven "Wood Table" diffuse (CC0), cut into seven plank strips (`film/public/tex/boards.jpg`, made by the
  snippet in this session; strips between the texture's own seams, warmed toward oak). Boards, cracks, matches, wire,
  hoop, labels and the count: built in code. No CC BY models: nothing to credit but the music.

## VO
- 12 lines in m5 (`vo/lines.json`, cloned from `library/voices/m5/ref_m5.wav`), 10–39 s a line with the CPU free.
  Assembled with 1.5 s after "Pause and guess": 41.54 s. Aligned with faster-whisper; `vo/fix_words.py` restores
  "it's", "pi", "two-in-pi", "sixty-four percent", "Twenty thousand": 101 = 101 words.
- Not listened to: "two-in-pi", "pi" (the ASR heard "pie" once), "floorboard".

## Sound
- `film/sound/mix.py`: 35 cues (8.2 per 10 s; most are short match taps), CC0 cstack set + synthesized room tone and
  a pattering bed in the hall. Floating Cities at +6.5 dB measures 10.7 dB under the voice during speech (stems,
  speech-masked RMS). Mix -14.3 LUFS, -2.0 dBTP before the MP4.

## Judges
- Fact-check and concept judge: script.md.
- Board judge (board v1): approve with changes. Fixed: the π row at the wire's depth (the wire read shorter than the
  matches through perspective); the scattered pieces turn into matches, "this throw: n" and "1,000 throws: 1.98 on
  average" in the lead band; the pile dims to let the crosses/misses pair lead; darker caption scrim; bigger crossing
  dots with a flash; the bending wire kept in frame; π row shifted left of the right-rail zone; hall crossers more
  amber. Not done: a rolling last match in the pause (extra match would change the count of 200).

## Lessons for the skills
- A demonstration that compares two lengths must put them at the same depth: one board further from the camera, the
  wire read shorter than the row of matches it equals (board judge measured 830 vs 908 px). picture-first frame maths.
- The fact-checker couldn't reproduce numbers from an uncommitted snippet: commit the generator the film uses and
  print its numbers from the same code (`film/src/sim.ts`, `sim_report.mts`) before they enter the script.

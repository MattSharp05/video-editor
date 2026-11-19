# s2 Coin rotation (brief)

Status: script v0.1 (2026-11-19). 3D explainer series, session 2 of 5 (geometry, probability and logic puzzles), video 1
of 2. Unsupervised: every decision below is logged; approvals go to fresh judge agents.

## Facts
- Format: Instagram Reel 1080x1920, 30 fps, 30-45 s, captions on, hook in 2 s. Goal: reach (shares: a brain teaser).
- Brain teaser: pose the puzzle, "pause and guess", reveal visually with a satisfying event.
- Voice: AI m5 (`library/voices/m5`, cloned from `ref_m5.wav`). Music: Floating Cities, ducked 10-12 dB under the voice.
- SFX: CC0 `sfx-29`-`sfx-61` (`library/sfx/cstack-cc0`) or synthesized only.
- Delivery: -14 LUFS integrated, true peak < -1.5 dBTP, < 50 MB, measured on the final MP4.

## Decisions
- 2026-11-19 topic: **the coin rotation paradox and the 1982 SAT question with no right answer.** Roll a coin around an
  identical coin: it turns twice, not once. The SAT (May 1982) asked it with circle A one third the radius of circle B;
  the right answer (4) wasn't among the five choices, and 300,000 tests were rescored. Why: a true, checkable story with
  a stake (a test everyone trusts was wrong), a puzzle anyone can try with two coins, and a reveal that is pure motion.
  Alternatives considered for this slot: rope around the Earth (+1 m lifts it 16 cm; leans on Session 4's Earth),
  slicing a cube into a hexagon, ant on a cube (unfold). The probability slot goes to video 2 (Monty Hall).
- Not a repeat: no other project covers it (projects/: code-history, grand-canyon, moon-tides, trip-social, turbulence).
- The coin is the lead and must turn exactly on cue with a marked arrow: built in code (sourcing.md: build the lead).
  The stage is a school desk with an exam sheet (our own paraphrase of the question, no logos).

## Research (sources)
- Education Week, June 1982, "Students outsmart S.A.T. again; 300,000 tests will be rescored": College Board said the
  answer should have been 4, not 3; scores could change by up to 10 points.
  https://www.edweek.org/education/students-outsmart-s-a-t-again-300-000-tests-will-be-rescored/1982/06
- The Battalion (UPI), 26 May 1982 p. 6: 300,000 math tests to be rescored; ETS "human error".
  https://newspaper.library.tamu.edu/lccn/sn86088544/1982-05-26/ed-1/seq-6/ocr
- Michigan Daily 1982: three students challenged the question on the May 1 test.
- Coin rotation paradox: a circle of radius r rolling around a circle of radius R turns (R + r)/r times (R/r from the
  rolling, +1 from going around). Equal coins: 2. r = R/3: 4. https://en.wikipedia.org/wiki/Coin_rotation_paradox
- The 1982 question's choices: 3/2, 3, 6, 9/2, 9 (Wikipedia; Scientific American "The SAT problem that everybody got
  wrong").

## Guidance read
- 2026-11-19, plan/script: video-script SKILL.md, references/picture-first.md, references/explainers.md,
  ~/.video-script/profile.md; animated-video SKILL.md, references/direct.md, references/motion-principles.md,
  ~/.animated-video/profile.md.
- 2026-11-19, look/scout: styles/README.md, styles/realistic-3d/README.md, references/look-pass.md,
  references/sourcing.md, references/three.md, templates/parts/README.md.
- Skipped: the fresh brainstorm + picker agents of direct.md "Find the pictures" (picture-first plan replaces them, as
  in turbulence-seat-01); a fresh judge agent reviews the concept instead (unsupervised rule).

## Assets
- Built in code: coins (silver, reeded edge, raised rim, amber marker arrow), exam sheet (canvas texture), ghost coins,
  peeling edge track.
- Scouted (2026-11-19): Sketchfab coins (none with a controllable mark; fantasy/game styles) -> build. Pencil: three
  CC BY candidates downloaded for a test render (see Assets used). Desk wood: Poly Haven CC0 "Wood Table" textures.

## Lessons for the skills
- (filled in as they happen)

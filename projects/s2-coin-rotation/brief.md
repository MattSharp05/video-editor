# s2 Coin rotation (brief)

Status: v1 delivered (2026-11-19, `film/out/s2-coin-rotation.mp4`); script v0.2, board v1 judged (approve with changes, all fixed). 3D explainer series, session 2 of 5 (geometry, probability and logic puzzles), video 1
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
- 2026-11-19, audio: references/ai-voiceover.md, references/remotion-pipeline.md, real-sfx/references/studio-sound.md,
  library/voices/m5/README.md, library/music/README.md.
- 2026-11-19, board/review: references/review.md, references/handoffs.md not needed (no revision yet).
- Skipped: the fresh brainstorm + picker agents of direct.md "Find the pictures" (picture-first plan replaces them, as
  in turbulence-seat-01); a fresh judge agent reviews the concept instead (unsupervised rule).

## Assets
- Built in code: coins (lathe body with reeded edge, raised rim, embossed generic legend "ROUND AND ROUND / ONE COIN /
  TWO TURNS", amber marker arrow), exam sheet and bubble sheets (canvas), graphite ink layer, paper tape strip, pencil,
  answer-sheet stacks.
- Desk: Poly Haven "Wood Table" textures (diffuse + normal, 1k), CC0, no credit needed. Not in git
  (`film/public/models/`, gitignored); rebuild: `python3 .claude/skills/animated-video/templates/sourcing/find_asset.py
  "wood table" --kind material --get 1 --out <dir>` and copy `wood_table_diff_1k.jpg`, `wood_table_nor_gl_1k.jpg`.
- Scouted and rejected (2026-11-19): Sketchfab coins (fantasy/game styles, no controllable mark); three CC BY pencils
  (cartoon or untextured in the test render) -> built in code. No CC BY asset ships, so no model credits.

## VO
- 11 lines in m5 (`vo/lines.json`, `library/voices/m5/say.py`, seed 7), assembled with a 1.5 s pause after "Pause and
  guess" (`vo/assemble.py`): 42.45 s. Aligned (`film/align.py`); `vo/fix_words.py` joins "S .A .T." and spells "300
  ,000" as "three hundred thousand"; `vo/check_words.py`: 103 script words = 103 heard.
- Not listened to: whether m5 says "S.A.T." as letters (ASR heard "S .A .T.", so probably yes) and "1982" as
  "nineteen eighty-two".

## Sound
- `film/sound/mix.py`, 26 cues (5.9 per 10 s): synthesized coin roll (band noise with tremolo), pencil scribbles,
  glass-ting per counted turn (rising pitch), card-riffle for the tape, whoosh-deep peaking on the cut (0.57 s in),
  whoosh-fast for the strike. Times read from `sound/events.json` (exported from the timeline by `times.mts`).
- Floating Cities at +9.5 dB measures 11.0 dB under the voice in speech (stems). Mix -14.2 LUFS before the MP4.

## Judges
- Concept judge: approve with changes (all taken; see script.md).
- Board judge (board v1): approve with changes. Fixed: hook closer (d 18) and brighter paper; stamps get ghost coin
  outlines; strip rebuilt as a flat paper tape that slides out from under B and curls back under it, start/end stamps
  for the straight roll; tallies as hand-drawn strokes; question 8 lower so the caption band sits on blank paper; one
  amber 4, thicker coral strike; pencil off the sheet; bubbles 1.6x; stacks as offset sub-stacks with bubble-sheet
  tops and a travelling amber wave. Not taken: d 16-17 for the hook with the question above the coins (frame maths:
  only 7.2 cm of usable height at d 17, so the question sits below the bubbles at y ~1450-1550, spoken anyway); the
  first caption's grey unspoken words at frame 0 (the caption kit's behaviour).
- Motion check: not run (no accepted bar film on this machine, as in turbulence-seat-01); the flicker scan and the
  mute test cover it.

## Lessons for the skills
- picture-first.md frame maths: in 9:16 at macro distances the usable lead height (y 520-1500 = 51 % of the frame) is
  what limits a tabletop layout, not the width: check that the question text, the subject and the answer row all fit
  that band before placing print on a prop. Stack layouts vertically (the board judge caught a side-by-side layout).
- A thin object seen from above (a band standing on its edge) reads as a wire: lay it flat or lower the camera.
- Text drawn into a canvas texture should use strokes, not a font, when it must look handwritten (bevelled glyphs
  read as stickers); a small glyph table (digits, +) in the scene works and writes on stroke by stroke.
- The reflection environment's background colour shows in mirror-like metal at some angles: a near-black env
  background made a coin go dark at the edge of a pan; keep it mid-grey.

## Checks on v1 (2026-11-19)
- Render: `render_chunks.sh v1`, 1,312 frames (43.73 s) at CONC 4, 02:09–02:57 (≈2.2 s/frame including a parallel
  still job and the Monty Hall VO on the same 4 CPUs).
- Flicker scan (YAVG per frame): the only large step is the cut at 27.10 s (-11). One bug: +9 at 39.03 s, the nearest
  answer-sheet stack's amber glow popping on in one frame (the wave's Gaussian front was cut off at x = -1). Fixed with
  a smooth onset; frames 1140-1311 re-rendered (`partial.sh` -> `out/v1b.video.mp4`). No one-frame bounces.
- Mute test (fresh judge, captionless frames at 2 fps): main point recovered ("a coin rolling round an equal coin turns
  twice; the test's 3 was wrong, it's 4"). Shareable: the struck (B) 3 with the amber 4 (36.5–37.5 s), then 1 → 2 with
  the amber bubble (~20 s). Fixed: question 7 cut off at the left in the opening 15 s (smaller type, shifted right);
  8.5–11 s hold (the route circle now draws from "Pause"). Frames 0-460 re-rendered -> `out/v1c.video.mp4`.
  Not changed (captions and voice carry them): red "1" read as maybe the answer (the line is "Looks like once,
  right?"); the strip argument at 21–27 s hard to follow muted; the 38–44 s pull-back without its caption context.
- Motion check: not run (no accepted bar film on this machine).
- Payoff glow re-fixed: the smooth onset let the nearest stacks glow before the wave started (a 2.1 step at the 38.0 s
  seam); gated on the wave's start, frames 1140-1311 re-rendered (`out/v1d.video.mp4`). Scan: only the cut (27.10 s).

## v1 delivered (2026-11-19)
- `film/out/s2-coin-rotation.mp4` (`mux.sh`): 1,312 frames, 43.73 s, 44.3 MB, -14.2 LUFS integrated, true peak
  -1.9 dBTP, measured on the MP4. Mix: music 11.0 dB under the voice in speech (stems).
- Not listened to (measured only): whether m5 says "S.A.T." as letters and "1982" naturally; the synthesized coin
  roll (band noise with tremolo) — it may sound like static rather than a coin; the glass-ting counts' pitch steps; the
  whoosh on the 27.1 s cut; the music level against the voice.

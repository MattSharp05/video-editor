# Run log, round 2: three more videos (cat landing, noise-cancelling headphones, microwave), 2026-11-07

Matthew: "Make me 3 more videos with improvements from the process of the last 3. You pick the topics."
Unattended again: every approval gate is self-approved by the orchestrator.

## Process improvements applied before building (from round 1)
- Per-line VO alignment shipped in templates + each project's vo/ (align_lines.py); av==16.0.1 pinned in the venv line.
- Motion bar: no more re-rendering Grand Canyon 01 (75-90 min per session). motion_check.py now reads a saved readout
  (lab/motion-bar/grand-canyon-01_q.json, measurements only; the Sphere session declined to commit the mp4 because the
  repo rule says no renders, which was right).
- Mute test required before delivery, re-judged after fixes; one printed word per key object.
- "Many separate movers" rule (the Sphere failed motion_check with one big moving field).
- Never-idle rule for sessions (run_in_background / Monitor; 60-min job cap -> chunk renders); sessions message the
  orchestrator when done, so no polling.
- Mux with apad + -t (never -shortest); stale-canvas gotcha.
- Brainstorm agents write their own files (fewer hand-offs).

## Timeline (UTC)
- 19:17 start. Topics picked by the orchestrator. Research x3 in parallel.
- 19:2x scripts drafted (cat 160 -> 146 words, grade 1.2; headphones 137, grade 2.9; microwave 149, grade 3.4);
  fact-check + 3 brainstorms launched in parallel.
- 19:3x fact-check (fresh agent): nothing false; rewords applied. All three hooks "Most people think" -> "Lots of people
  think" (no source counts "most"). Cat: "each half can turn on its own" -> "a different way"; "front spins fast" ->
  "turns a lot" (sources measure angle, not speed); "spreads and bends its legs" -> "reaches its legs down and bends
  them" (spreading is for drag). Headphones: music line -> "The chip knows your music, because it's the one playing it.
  So it only flips the noise."; "Sudden sounds" -> "Quick, changing sounds". Microwave: "heats the outside first" ->
  "heats the outer layer" (thin food heats through at once); "plus end" -> "plus side"; "so the outside gets hot first"
  -> "so in thick food, the middle has to wait".

# s2 Monty Hall (brief)

Status: v1 rendering (2026-11-19); script v0.2, board v1 judged (approve with changes, fixed). 3D explainer series, session 2 of 5 (geometry, probability and logic puzzles), video 2
of 2. Unsupervised: every decision below is logged; approvals go to fresh judge agents.

## Facts
- Format: Instagram Reel 1080x1920, 30 fps, 30-45 s, captions on, hook in 2 s. Goal: reach (shares, comments: it
  starts arguments).
- Brain teaser: pose the puzzle, "pause and guess", reveal visually with a satisfying event.
- Voice: AI m5 (`library/voices/m5`). Music: Floating Cities, 10-12 dB under the voice. SFX: CC0 cstack set or synthesized.
- Delivery: -14 LUFS, true peak < -1.5 dBTP, < 50 MB, measured on the MP4.

## Decisions
- 2026-11-19 topic: **the Monty Hall problem** (switching wins 2/3). Probability, the session's other half; the most
  argued-about puzzle there is, with a true stake: in 1990 Marilyn vos Savant's Parade column gave the right answer and
  about 10,000 readers, nearly 1,000 of them PhDs, wrote in to say she was wrong. Visual in 3D: the 100-door version
  makes the answer obvious when 98 doors swing open at once.
- Not a repeat of any project in projects/ and inside session 2's area. The coin video (s2-coin-rotation) is geometry.
- The world is ours, not a recreation of any TV game show: free-standing panelled doors in a dark hall, no curtains,
  no host, no show branding. The "host" is only a voice-described rule; doors open on their own.
- Giant device: the three doors are the bottom row of a 10×10 wall of 100 doors (pull back); 98 open in a wave and
  their amber light flows into the one door left shut.

## Research (sources, to be checked by the fact-check agent)
- vos Savant, "Ask Marilyn", Parade, 9 Sep 1990 (and follow-ups Dec 1990, Feb 1991).
- John Tierney, "Behind Monty Hall's Doors: Puzzle, Debate and Answer?", New York Times, 21 July 1991: about 10,000
  letters, nearly 1,000 from PhDs, most saying she was wrong.
- Steve Selvin, letters to The American Statistician, 1975 (first statement of the problem).
- Probability: with the host who always opens a goat door he knows about, staying wins 1/3, switching 2/3; with 100
  doors and 98 opened, staying 1/100, switching 99/100.

## Guidance read
- 2026-11-19 (carried from s2-coin-rotation the same day, re-read for this film's steps): video-script SKILL.md,
  references/picture-first.md, references/explainers.md; animated-video SKILL.md, references/direct.md,
  references/motion-principles.md, styles/realistic-3d/README.md, references/look-pass.md, references/sourcing.md,
  references/three.md.

## Assets
- Goat: "Goat" by hendrikReyneke (sketchfab.com/3d-models/2624ac2ce2364930ba2d5f70eb7aa1ea), CC BY 4.0, 5.3k triangles,
  static; instanced in all 100 units, varied by turn, size and mirror. Chosen over the Boer goat (10k) and Tolibjon's
  goat (50k) for the 98 copies.
- Car: "Classic Vintage Car" by dammne (sketchfab.com/3d-models/104c6dcf9e3c43c1a28592ea7fd2a2c2), CC BY 4.0, 173k
  triangles, static; a generic 1950s sedan (no make shown); body re-materialled as clearcoat paint, headlights added.
- Rejected: two sports cars copying real brands' shapes (McLaren-like, Bugatti-like).
- Built in code: the storage building (facade, units, double doors, walkways, stairs), envelopes, searchlight, frame
  glows, projected numbers, amber flow particles. Asphalt procedural.
- Model files are not in git (`film/public/models/`, gitignored); `film/models-prep/README.md` rebuilds them.

## Guidance read (this film's steps)
- 2026-11-19, audio: references/ai-voiceover.md, references/remotion-pipeline.md, real-sfx/references/studio-sound.md
  (read for s2-coin-rotation the same session), library/voices/m5/README.md, library/music/README.md.
- 2026-11-19, board/review: references/review.md, references/three.md.

## VO
- 12 lines in m5 (`vo/lines.json`, seed 7; generated while the coin film rendered, so ~3–5 min a line), assembled
  with a 0.8 s pause before "You pick door one" (the blackout) and 1.5 s after "Pause and guess": 40.68 s. Aligned;
  `vo/fix_words.py` turns "50 -50", "one in a hundred", "98", "99" back into the script's words; 101 = 101 words.
- Not listened to: "PhDs", "Marilyn vos Savant" and "fifty-fifty" (the ASR heard them right; pronunciation unheard).

## Sound
- `film/sound/mix.py`, 38 cues (9.1 per 10 s, many of them a 7-click cascade of lamps): paper flutter (synthesized) and
  card-riffle for the envelopes, ship-creak for doors (pitched per door), vault-clank shut, impact + rumble for the
  blackout, electrical-hum for the searchlight, servo-arm for its swing, clock-tick in the pause, pop-soft for the
  50 %s, tile-clicks for 98 doors, synthesized shimmer for the amber flow, whoosh-deep peaking on the cut, padlock-open
  + soft low hit for the headlights. Music +9.5 dB measures 11.3 dB under the voice; mix -14.1 LUFS.

## Judges
- Fact-check and concept judge: see script.md (all fixes taken but tiered bleachers and a replay montage).
- Board judge (board v1): approve with changes. Fixed: the 100-door light logic (opened units dim to 30 %, the shut
  door blazes amber, a big "99%" over the building from the grouping, travelling with thicker amber streams onto the
  last door, no reset before the cut); ice → #8CCBFF; searchlight neutral and tighter (no spill on door 1); the car is
  revealed behind door 2 and stays there (the blackout hides, it doesn't shuffle), so door 3 opening on a goat can't
  read as "he opened the car door"; three-door framing wider (d 18) so door 1, the car and door 3's goat sit inside the
  safe area; the building framed inside y 520-1480 and locked from the flow to the cut; the frame-0 bottom filled
  (yard work light, envelopes tumbling past the lens); envelope pile with soft edges; door z-fighting (dashed lines)
  fixed; off lamps grey; a night-sky gradient; caption wraps split ("Nearly a thousand PhDs / wrote in…", "The host
  knows / where the car is,", "holds the other / ninety-nine chances."); only "switch." accented at the end.
  Not done: a visible pole in the wide shots; edge wear on doors.

## Lessons for the skills
- A "flow of odds" picture must change brightness the right way: when doors open, the opened (losing) units must get
  darker and the remaining one brighter. Our first board lit the 98 opened units warm and left the winner dark, so the
  picture argued against the line; the board judge caught it (review.md could add: check that the lead is the
  brightest thing at the end of each beat, not just at its start).
- A blackout used to hide a reveal confuses if the reveal showed the prize behind a door the host later opens;
  show it where it will stay (or show no positions at all).
- Scene scale for props that must fit: a car needs 2.6 m wide doors and 6 m units; check every prop against the set
  before the board (frame maths for objects inside objects, not only for the camera).
- Rendering stills or TTS while a chunk render runs slows both roughly 2x (TTS went from ~25 s to ~3-5 min a line):
  queue CPU jobs on this 4-core container rather than overlapping them.

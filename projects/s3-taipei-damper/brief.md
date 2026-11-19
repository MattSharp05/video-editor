# s3-taipei-damper (brief)

Status: board v1 judged (approve with fixes, fixed), full render v1 running (2026-11-19). 3D explainer series, session 3 of 5 (big machines and
engineering), video 1 of 2. Made unsupervised: decisions are logged here; approvals go to fresh judge agents.

## Facts
- Topic (picked by Claude, 2026-11-19): the 660-tonne tuned mass damper inside Taipei 101: how a hanging steel ball
  stops a 508 m tower swaying. Why: a giant golden ball inside a skyscraper stops the scroll on its own, it is a true
  machine with a cause-and-effect mechanism (pendulum tuned to the tower, swinging against the sway, pistons turning
  motion into heat), and it is pure 3D (cutaway tower, ball, cables, pistons, sway trails). Not another session's area
  (not body, puzzles, Earth/space or kitchen physics) and not an existing project.
- Instagram Reel 9:16, 1080x1920, 30 fps, target 36-42 s, goal reach. Captions on.
- Voice: AI m5 (`library/voices/m5/`, cloned from `ref_m5.wav`). Music: Floating Cities (Kevin MacLeod, CC BY 4.0).
- Series model: `projects/turbulence-seat-01` (timeline as pure functions of t, cued from words.json, CUT_* constants).

## Research (sources)
- Damper: 660 t steel sphere, 5.5 m diameter, 41 welded steel plates (125 mm each), hung between floors 87-92
  (sources vary 87-91 / 88-92). Taiwan News 3683775; Guinness "Largest tuned mass damper".
- Biggest swing: ~100 cm, Typhoon Soudelor, 8 Aug 2015 (Taiwan News; Guinness: farthest swing 1 m, max extension
  1.5 m). Second: 70 cm, Typhoon Soulik 2013.
- Sway reduction: "up to 40 %" (Taipei 101 via Taiwan News / Business Insider; others 30-40 %).
- Eight hydraulic viscous dampers under the sphere dissipate its energy (Structure magazine "Dynamic Loading
  Solutions in Taipei 101"; vibrationdata Dec 2005 newsletter). Designed by Motioneering.
- Tower: 508 m architectural height, 101 floors; design natural period ~6.8 s (vibrationdata newsletter); the pendulum
  is tuned to the building's period.

## Decisions (logged, unsupervised)
- Tower built in code, not sourced: the three Sketchfab "Taipei 101" models scouted (Renee 21k CC BY, Amyyu 263k
  CC BY, Romain Perrone 2.9k CC BY) were massing toys or broken (stray text blocks); the tower is the lead and must
  bend, turn to glass and carry the ball, so it is ours. City, storm sky, rain, ball, cables, pistons also built in code.
  Scout sheet: no "tuned mass damper" model exists on the free sources.
- Motion is exaggerated (tower sway ~20x, a stylised 2-DOF simulation with mass ratio 0.05 and a 4 s period instead
  of 6.8 s so several swings fit) and says so on screen ("motion exaggerated").
- Colours: gold/amber = the ball and the calmer sway (the answer); coral = sway without the ball / the wind's push;
  orange = heat in the pistons.

## Guidance read
- 2026-11-19, step 3 (audio): references/ai-voiceover.md, real-sfx/references/studio-sound.md, library/voices/m5/README.md, library/music/README.md.
- 2026-11-19, step 6 (review): references/review.md.
- 2026-11-19, step 1 (plan/concept/script): video-script SKILL.md, references/picture-first.md, references/explainers.md;
  animated-video SKILL.md, references/direct.md, references/motion-principles.md (incl. "Hard cuts are allowed").
- 2026-11-19, step 2 (look): styles/README.md, styles/realistic-3d/README.md, references/look-pass.md.
- 2026-11-19, scout/build: references/sourcing.md, references/remotion-pipeline.md, templates/parts/README.md,
  references/three.md.

## Fact check (fresh agent, 2026-11-19; Guinness, Taiwan News citing Taipei 101, Cambridge phase-trans page, Motioneering, Structure 2006 snippet)
- Holds: 660 t sphere of 41 plates; hung from cables (8: "four pairs") as a pendulum; 8 main hydraulic viscous dampers
  below turn motion into heat; "up to 40 %" (Taipei 101's own figure, no paper found); 100 cm in Typhoon Soudelor,
  8 Aug 2015, largest on record (design limit 1.5 m); wind and earthquakes both.
- Reworded: caption "660-ton" -> "660-tonne" (spoken "ton" kept); "one beat behind" -> "swinging just behind it" (the
  real lag is about a quarter swing; "a beat" can mean a full cycle); "the ball pulls the other way" -> "the ball tugs
  against it" (it is not exactly opposite). The waves panel shows the quarter-swing lag explicitly.
- Could not open: Taipei 101's own damper page (404), the Arup WCEE paper (403), Structure 2006 (Scribd).

## Board v1 verdict (fresh judge, 2026-11-19): APPROVE WITH FIXES
Fixed: cover now shows the ball through the glass (x-ray 40 % at frame 0, camera 70 m); ghost tower opaque coral and
two tip arcs (coral wide above, amber narrow below) with "up to 40% less sway" at y 1330; the 3D trace pens (read as
exhaust trails) replaced by one glass wave panel on a shared time axis with dashed peak markers and "a quarter swing
later"; pull-side cables glow brighter, chevrons moved next to the ball and deck; 1 m bar bigger with the plumb track;
caption scrim 0.78; ball less emissive and rougher; deck railing for scale. Not changed: facade realism (box modules,
uniform windows; judge: not worth the time), floating slab look in the wide x-ray (partly).
- Loop: the sway was still at typhoon size after the last cut (the tower stood 29 m off its base): the film now calms
  to the cover's sway after CUT_END, and the 1 m bar is switched off on that cut.

## Sound (`film/sound/mix.py`)
- 19 cues (5.2 per 10 s): storm wind + rain beds outside, room hum inside (synth), glass-ting on the x-ray, gust on
  "Wind", whoosh-deep peaking on each of the 4 cuts, ship-creak on "cables", piston hiss (synth), vault-clank on "meter".
- Floating Cities at +7.5 dB measures 11.1 dB under the voice during speech (stems, speech spans only).

## Assets
- All built in code (tower, city, sky, rain, ball, cables, pistons). No CC BY model used.

## Outstanding corrections
- none yet

## Lessons for the skills
- picture-first / review: a film that loops back to its cover must reset every state that grew during the film (here the
  typhoon sway) on the loop cut; the "stills either side of every cut" check caught it. Add to motion-principles' cut list.
- A comparison of two motions' timing (phase) reads in 2D on one shared axis, not as 3D pens drawing in perspective:
  the judge read the 3D traces as exhaust trails.
- Skipped: the quarter-scale preview + motion_check before the full render (the preview of an older build was killed
  to save the CPU for the final; no accepted bar film is on this machine either). Motion was judged from stills and the
  flicker scan instead.

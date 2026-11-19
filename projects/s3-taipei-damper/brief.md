# s3-taipei-damper (brief)

Status: script v0.1 (2026-11-19), fact-check pending. 3D explainer series, session 3 of 5 (big machines and
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
- 2026-11-19, step 1 (plan/concept/script): video-script SKILL.md, references/picture-first.md, references/explainers.md;
  animated-video SKILL.md, references/direct.md, references/motion-principles.md (incl. "Hard cuts are allowed").
- 2026-11-19, step 2 (look): styles/README.md, styles/realistic-3d/README.md, references/look-pass.md.
- 2026-11-19, scout/build: references/sourcing.md, references/remotion-pipeline.md, templates/parts/README.md,
  references/three.md.

## Assets
- All built in code (tower, city, sky, rain, ball, cables, pistons). No CC BY model used.

## Outstanding corrections
- none yet

## Lessons for the skills
- (filled as the session goes)

# s3-taipei-damper (brief)

Status: v2 delivered (2026-11-19): `film/out/v2.mp4`, sent as renders/s3-taipei-damper.mp4. 3D explainer series, session 3 of 5 (big machines and
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

## Checks on render v1 (2026-11-19)
- Render: 1,106 frames (36.9 s) in 4 chunks, ~11 min per 300 frames at concurrency 4 (with a TTS job beside it).
- Flicker scan (YAVG): steps only at the four CUT frames (337, 758, 934, 1068) plus one bounce at frame 934: the first
  frame of the last close shot had every piston white-hot (the heat speed was a finite difference across the cut).
  Fixed (one-sided difference after CUT_IN2), frames 930-945 re-rendered with `partial.sh` -> v1b.
- Mute test (fresh viewer, captions blacked out, 2 fps): main point recovered ("a giant hanging ball swings against the
  sway and cuts it by up to 40 %"); most shareable: the ghost tower with "up to 40% less sway". Lost: what the ball is
  (11-15 s), what the pistons do (23-25 s), what the ghost tower is (25.5-30 s), the 1 m bar. Fixed with labels:
  "660-tonne ball on cables", "pistons: swing -> heat", "without the ball" / "with the ball" at the two arcs, "1 m swing";
  frames 355-450 and 680-1067 re-rendered -> v2. Not changed: "a quarter swing later" (the viewer read it with the
  markers), the hook (0-3.5 s) reads as pretty-not-explained muted; the voice carries it.

## v2 delivered (2026-11-19)
- 1,106 frames (36.87 s), 1080x1920 at 30 fps, 34.7 MB, -14.3 LUFS integrated, true peak -1.9 dBTP (measured on the MP4).
- Flicker scan on v2: steps only at the cut frames 337, 758, 1068 (and 934 under the threshold); the seams of the partial
  re-renders (355, 450, 680, 1067) show no step.
- Measured, never listened to: the voice (transcript matches the script word for word), music 11.1 dB under the voice.
  Listen for: "six hundred sixty ton" (line 1), the gust on "Wind" (~8.3 s), the piston hiss (~23 s) and the clank on
  "meter" (~34 s), and the four cut whooshes.

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

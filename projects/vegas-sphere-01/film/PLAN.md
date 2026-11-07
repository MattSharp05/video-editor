# Vegas Sphere 01 — build plan (builder session, unattended)

## Decisions
- Engine: one WebGL2 fragment shader ("PuckField") draws the Sphere: a real lon/lat puck grid on a ball
  (orthographic camera, 1.2 M-puck density: dθ = sqrt(4π/1.2e6)), dots with dark gaps, steel bars in the gaps at
  close range, smooth blend when a puck is under ~2 px (analytic coverage, no moiré), limb darkening and shading.
  Inside one puck at extreme zoom: 48 LEDs in rings of 8/16/24 (exactly 48, countable). The TV is the same shader
  with a rounded-box→circle SDF morph. Why WebGL instead of the pick's 2D pattern mask: the brief asks for a
  convincing ball with foreshortened dots near the edge; per-pixel projection gives that for one quad per frame.
- 2D canvas layers: sky + generic Strip skyline (behind), props (TV cabinet, antenna, stick, puck, tape, bird, car,
  tourist, counters) in front, backstage (wires + computer) and interior (dome + seats) as their own 2D worlds,
  entered through a gap / the pupil (pass-through carriers), never cut.
- Line 4 change vs pick: no separate trip behind the frame for the steel frame; the frame is visible through the gaps
  at close range and the tape measures centre-to-centre in front. The one backstage trip is line 6 (computer), entered
  through the gap beside our puck. Saves a world change and build time.
- Counter: rolls "0.1 million … 1.2 million" (matches "one point two million"). Tape reads "8 in". LED counter "48".
- Interior tagged "Illustration". The eye and emoji are our own drawings.

## Visual language (state → look, whole film)
| Thing | State | Look |
|---|---|---|
| Our puck (the lead dot) | followed | the brightest dot, warm gold rim glow (#FFC56E accent) |
| Puck | lit | emissive picture colour, hot centre, dark gap around |
| Puck | unlit | dark grey body, faint top highlight |
| Puck | receiving a command | flicker of random colours, then lands on its new colour |
| Pulse (command) | travelling | small bright accent dot with a short tail along a wire |
| Numbers (1.2 million, 8 in, 48) | shown | white Hanken 800, accent on the number, attached to the moving object |
| Caption key word | spoken | accent gold, lifted, glow |

## Thread (lead → move → next lead → carrier)
| # | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 1 | TV screen (emoji) | transform: box inflates to ball | the smile | the emoji itself |
| 2 | smile | push in; picture breaks into dots; bird darts through a gap | our puck | the dot we land on blinks out |
| 3 | empty slot | slapshot puck fills it; wave lights the field | our puck in the field | the puck |
| 4 | tape between our puck and its neighbour | dive into our puck face | 48 LEDs | the puck face |
| 5 | LEDs | blur to one glow, reel spins; ease back, neighbours land | patch, our puck one dot | our puck |
| 6 | gap beside our puck | pass through to backstage; follow wire; computer fires; ride pulse back | repainting patch | the pulse |
| 7 | patch | long pull-back | the eye on the Sphere | the patch becomes the eye |
| 8 | eye | looks, blinks (row-by-row), winks | pupil | pupil dilates |
| 9 | pupil | fly through gaps into the dome; tilt up; push to fine dots | dome top | the dome |
| 10 | dome top | rise out; eye blinks off the antenna; pull back to city | wide Strip (loops to frame 0) | the antenna |

## Beat → time map
From src/beats.json (lines l0..l9 and phrase beats); every picture event is beat + offset.

## Timeline (machine clock, UTC)
- 14:16 start; VO job + music started
- 14:19 PLAN; 14:20–14:28 engine (shader, pictures, timeline, worlds, Film)
- 14:23 VO lines generated; whisper on the joined file failed (PyAV API), then dropped 29 s → wrote vo/align_lines.py
  (per-line alignment, all 10 lines MATCH). Re-timed from the real VO (50.2 s).
- 14:29 bar render (grand-canyon-01, quarter scale) started; 14:30–14:34 stills round 1 + 2 (fixes: gap colour warm all
  film, our puck never returned after "missing", dome picture in the wrong half, empty ground, blank rise-out at 46 s,
  antenna pop off-frame)
- 14:35 sound mix (24 cues, music +8.5 dB → voice-to-music gap 10.5 dB in speech, measured)
- 15:27 bar render still running after ~58 min (software GL, 3D); preview started alongside it (deviation from
  one-heavy-job rule, to keep the build moving)

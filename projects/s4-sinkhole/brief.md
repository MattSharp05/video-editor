# s4 Sinkhole (brief)

Status: script v0.1 (2026-11-19). 3D explainer series, session 4 of 5 (Earth, space and nature), video 2 of 2: the
**explainer**. Made unsupervised; every decision Matthew would make is logged here with its reason.

## Goal and format
- How a (cover-collapse) sinkhole forms: rain turns weakly acidic, dissolves limestone into a cave; the clay and sand
  above bridge it like an arch; grains ravel down into the cave so the void climbs toward the surface while the road
  looks fine; when the roof is too thin it drops all at once. Why they "open overnight": years of hidden growth.
- Instagram Reel 1080x1920, 30 fps, 30-45 s, goal reach. Hook in the first 2 s, captions on.
- Voice m5, music Floating Cities, CC0 sfx-29..61 or synthesized only. Series model: `projects/turbulence-seat-01`.

## Decisions (unsupervised; logged)
- 2026-11-19 Topic: sinkholes. Why: a fear strangers recognise (a road or house swallowed "overnight"), a mechanism
  that is invisible above ground and pure 3D underneath (a cut-away), and an "it was there for years" turn. Not taken:
  no other project covers geology underground (Grand Canyon is erosion by a river, above ground); inside session 4's
  area. Sources: USGS Water Science School "Sinkholes"; USGS Circular 968 / Florida Geological Survey material on
  cover-collapse sinkholes; Winter Park, Florida (1981) for scale context only.
- Device (picker agent, 2026-11-19): one world, the ground sliced open like a cake (a vertical cut face through road,
  clay and limestone), revealed by an X-ray scan line; acid tint down the cracks; stone arch blocks traced in the clay;
  grains crumbling from the void's ceiling so it climbs while the road stays flat; the plug and the car drop; a bar
  'months to years' vs 'one second'. The hourglass was the picker's pick for beat 5; the fact check removed it.
- Car: "Generic Sedan Car" by MMC Works (Sketchfab 58c33766470d46e7b2aed542650494e5, CC BY 4.0, 113k triangles,
  static), scouted 2026-11-19 against "Low-Poly Sedan car" (scailman) and a 1953 Cadillac (ROH3D): the only one that
  reads as a modern real car; no brand badge.

## Fact check (fresh agent, 2026-11-19; sources: USGS Water Science School "Sinkholes"; USGS WRI 85-4126 Sinclair
et al., "Sinkholes in the karst of west-central Florida", Table 2; USGS Circular 968, Newton 1987)
- Holds: rain + CO2 (mostly from soil) -> weak carbonic acid; cohesive clay bridges solution-widened joints "until bearing
  strength of clay is exceeded"; "cavity moves upward by roof spalling until it appears abruptly at land surface"; roads
  and houses on top; cover 5-100+ ft (11 m used); hole size set by the clay.
- Reworded: line 3 "Deep down ... carves out a cave" -> "Under the dirt ... opens up cracks and holes" (dissolution is
  at the limestone top and along joints; cover collapse needs widened joints, not a big deep cave); line 4 "clay and
  sand" -> "sticky clay" (sand is incohesive; the clay holds the bridge); line 5 "So grains trickle ... like sand in an
  hourglass" -> "But bit by bit, its ceiling crumbles down into the cracks" (an hourglass sinks from the top, which is
  the gradual cover-subsidence type; cover collapse spalls from the ceiling while the surface stays flat; the
  hourglass outline is dropped, the falling grains kept); line 8 "for years" -> "for months, or years" (one cavity was
  watched growing over 5 months).
- On screen: counter "1,000s of years" (Circular 968: "thousands of years"); the water-table line cut (in this setting
  the limestone's water level sits above the limestone top, so the line at -15 m was wrong); the limestone opening is a
  few metres of widened cracks, the clay void carries the size; the plug falls ~9 m in 1.35 s (free fall), not 16 m
  in 1.1 s.

## Guidance read
- 2026-11-19: same pages as s4-seasons-tilt this session (video-script SKILL, picture-first, explainers; animated-video
  SKILL, direct, motion-principles, styles README, realistic-3d, look-pass, ai-voiceover, remotion-pipeline,
  studio-sound, sourcing, three, parts README, review), each read in full earlier in this session; explainers.md
  (the chain, written to be seen, analogies) applied to this script.

## Board (fresh judge in place of Matthew's approval)
- Board v1 (2026-11-19, `stills/board_v1.png`): APPROVE WITH FIXES. Fixed: the collapse read as a lift car in a box
  shaft -> the void stays egg-shaped and after the fall reaches past the surface (the hole is its section at the road,
  r 2.85 m), a ragged hole edge, the plug and the car tilt as they fall into it; void meshes poked out of the cut face
  -> clipped at z = 0; the void shrank between beats -> its width now grows with its height; wallpaper joints -> irregular
  near-vertical ones; joints cut through as sky-blue holes (a sign error) -> filled dark cracks; "1,000s of years" in
  lime (= acid) -> white "over thousands of years"; amber arch blocks (= void) -> pale tan; caption key words "months,
  or" -> "years"; hook car clipped -> rolls through the middle; bar inside the hole and the right rail -> top of frame,
  x 140-940; acid tag low contrast -> dark backing; limestone brightest in frame -> darker, amber rim on the void.
  Not changed: the scan doesn't start before 2 s (it lands on "underneath", the cue it shows); no caption scrim change
  (series caption kit).
- Board v2 (`stills/board_v2_sheet.png`): checked against the list by me and accepted; the mute test on the render is
  the second check.

## Render budget (measured 2026-11-19)
- Six frames: 87 s with all grass, 29 s without -> grass is ~95 % of the frame cost. Near grass hidden once the scan has
  swept it (hook only), far grass 12k: hook frames ~9 s, face shots ~2.5 s each.

## Checks on the render (2026-11-19)
- v1 full render: 1,268 frames (06:33 to 08:25, CONC 3). Flicker scan (signalstats YAVG): one step >4, at 2.07-2.17 s,
  the scan line sweeping past the camera on "underneath" (the camera dips through the grass for 3 frames, then the cut
  face; intended). No step at the drone cut (35.0 s): both sides have similar luma, the change is in content.
- Stills either side of the drone cut (frames 1050/1051): the road and the hole from above, dust over it.
- Contact sheet `stills/contact_v1.png`.
- Mute test (fresh judge, caption band masked, 2 fps): **PASS**. It retold rain, CO2 acid, the limestone cavity "over
  thousands of years", the void climbing through the clay, the collapse, "months to years vs seconds". Fixed in v2
  (partial re-render of frames 805-930 and 1048-1267): "empty space" label larger on a dark chip; the bar's labels
  larger on a dark backing; dust in the drone shot at 35 % so the car in the hole shows. Not changed (cost: rebuild of
  the void beats): the limestone cave and the clay dome don't visibly connect at 17-18 s; the arch ring's meaning is
  only spoken; the cold open (hollow, then rewind) pops rather than dissolves; the fallen road plug under the car can
  read as a ledge.
- v2 still check: the bar's two labels collided at 42 px ("years" ran into "collapse"). v3: bar 900 px wide, 34 px
  text with a 24 px gap, checked on a `remotion still` before re-rendering frames 1090-1267.
- Audio: v1 mux measured -14.4 LUFS; mix.py now tops up 0.45 dB and limits (mix_final.wav: -14.0 LUFS, -1.8 dBTP as AAC).

## Outstanding corrections
- none open beyond the "not changed" list above

## Lessons for the skills
- **The fact check can remove the picker's best picture.** The hourglass (the script's own analogy, the picker's top
  pick) pictured the wrong mechanism (cover-subsidence, not cover-collapse). explainers.md "Analogies" already says
  to check an analogy's steps against the real process; the route that failed is the order: brainstorm and picker ran
  before the fact check. For explainers, fact-check the analogies in the draft lines before the brainstorm, so the
  pictures are invented for the true mechanism.
- **A cut-away void needs three things the board caught:** meshes behind the cut face clipped at the face plane
  (`material.clippingPlanes` + `gl.localClippingEnabled`), a void that only ever grows (width tied to height), and the
  post-collapse void keeping its shape (a box shaft read as "a lift car"). Worth a short "cut-away world" note in
  three.md or the parts README, with this film's `FACE_SDF` (layers, joints, void SDF, discard) as a starting part.
- **Measure what costs before optimising.** I rewrote the face shader for speed (5-octave fbm x 20 per pixel -> ~6
  noise calls) and gained nothing; switching parts off showed the grass was ~95 % of the frame. An `off` prop on the
  scene (here `--props='{"off":["grass"]}'`) makes the per-part cost a 1-minute measurement; look-pass.md describes
  this switch, and it should be in the template's Scene from the start.
- **A captionless mute-test render costs a full render on the CPU.** Masking the caption band on frames of the real
  render (ffmpeg drawbox over y 225-495) gave the judge the same evidence in seconds; review.md could offer it.
- **Check a label edit on one still before the partial re-render.** Enlarging the bar text for the mute test made its
  two labels collide, which cost a second partial render (~20 min). A `remotion still` of the busiest frame takes
  seconds; review.md's partial re-render section could say so.
- **Single-pass loudnorm lands short.** -14.4 LUFS on the MP4 for a -14 target; a 0.45 dB top-up plus limiter fixed it.
  The template's mix step could measure the result and apply the remaining gain itself.

## Delivered (2026-11-19)
- `renders/s4-sinkhole_v3.mp4` (git-ignored; sent in the session): 1,268 frames, 42.27 s, 44.0 MB, -14.0 LUFS integrated,
  -1.8 dBTP true peak, measured on the MP4. Splice seams (frames 1089/1090, 1180/1181) checked on stills.
- Music under voice: 11.1 dB (stems measured).
- Never listened to (measured only): the collapse rumble and debris against the line "Then it drops all at once"
  (33.1-35 s); the rain and acid bubble layer under 5-12 s (busy?); the cut whoosh at 34.9 s; the reversed-whoosh
  "rewind" at ~4 s; the music level in the last 2 s after the voice ends; whether the m5 voice sounds natural on
  "carbon dioxide" and "limestone".

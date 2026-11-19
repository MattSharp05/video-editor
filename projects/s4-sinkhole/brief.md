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

## Outstanding corrections
- none yet

## Lessons for the skills
- (filled in as the session goes)

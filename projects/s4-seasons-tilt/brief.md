# s4 Seasons tilt (brief)

Status: script v0.1 (2026-11-19). 3D explainer series, session 4 of 5 (Earth, space and nature), video 1 of 2: the
**mythbuster**. Made unsupervised; every decision Matthew would make is logged here with its reason.

## Goal and format
- Myth: "it's summer when Earth is closest to the Sun". Truth: Earth is closest in early January (northern winter);
  seasons come from the tilt, which changes how straight sunlight hits the ground (and day length, left out: one idea).
- Instagram Reel 1080x1920, 30 fps, 30-45 s, goal reach. Hook in the first 2 s, captions on.
- Voice m5 (cloned from `library/voices/m5/ref_m5.wav`), music Floating Cities, CC0 sfx-29..61 or synthesized only.
- Series model: `projects/turbulence-seat-01` (one three.js world, one device, cues from words.json, hard cuts).

## Decisions (unsupervised; logged)
- 2026-11-19 Topic: seasons myth. Why: a belief most strangers hold, a one-line reversal ("closest in January") that
  stops the scroll, and a mechanism that is pure 3D geometry (tilt + a beam spreading on the ground). Not taken by any
  project (moon tides is gravity; turbulence, Grand Canyon, trip, code history are unrelated) or another session's area.
- Device (picker agent's pick, combined): one beam of sunlight = **100 glowing marbles** (countable heat). They rain
  onto a meadow: steep in summer onto one tile, slanted in winter across ~2.2 tiles. Two worlds: space (globe kit) and
  a meadow (realism kit + a found barn); hard cuts between them on the words.
- Numbers used (New York, 40.7 N): noon Sun 72.7 deg high at the June solstice, 25.9 deg at the December solstice;
  the same beam covers sin 72.7 / sin 25.9 = 2.19x the ground -> "twice the ground", "about half the heat" (46 %).
  Distance: perihelion ~147.1 million km (Jan 3), aphelion ~152.1 million km (Jul 6): ~3 % closer in January.
- Brainstorm and picker were fresh agents (direct.md "Find the pictures"); verdicts summarised under Concept.

## Concept (from the picker, 2026-11-19)
- B1 exaggerated oval orbit, Earth glows warm near the Sun ("the myth" acted out) | B2 the oval deflates to the real
  near-circle, Earth at its closest point with a "JAN 3" flag, snow on the north, "only ~3 % closer" | B3-4 the axis
  snaps to 23.4 deg and points at Polaris; a time-lapse lap shows the axis fixed in space, north toward the Sun in June
  | B5 a beam leaves the Sun, resolves into 100 marbles, cut to the meadow | B6 high sun, marbles rain straight down on
  one tile, it glows hot | B7 low winter sun, long shadows, snow, the same 100 marbles skid in at a slant over ~2 tiles,
  dimmer, summer outline kept | B8 counts per tile 100 vs ~46 | B9 back to the globe in June: New York pin under a steep
  beam (summer), Sydney under a slanted smeared beam (winter) | B10 "distance" crossed out, the two patches with the
  angle drawn. Rejected: marshmallow on a stick, scarf-wearing Earth, butter/pizza (cartoon worlds that clash).

## Assets
- Earth: globe kit (`src/kit/globe.tsx`), NASA Blue Marble / Black Marble textures, public domain (credit NASA).
- "Red Barn" by volvor, Sketchfab 906b74a1b8d7443eb66545dcc8a1b1c7, CC BY 4.0 (CC Attribution), 22.7k triangles,
  static. Scouted 2026-11-19 against "Farmhouse _low-poly" (Raphael Escamilla) and "Farmhouse" (sp00kydraws): the barn
  reads real and rural at mid distance. Model files stay out of git; `film/models-prep/README.md` rebuilds them.
- Built in code: Sun, orbit, axis, Polaris line, marbles, tiles, meadow (realism kit grass, trees, sky), snow.

## Guidance read
- 2026-11-19, plan/step 1: video-script SKILL.md, references/picture-first.md, references/explainers.md,
  ~/.video-script/profile.md; animated-video SKILL.md, references/direct.md, references/motion-principles.md
  (incl. "Hard cuts are allowed"), ~/.animated-video/profile.md.
- 2026-11-19, step 2 (look): styles/README.md, styles/realistic-3d/README.md, references/look-pass.md.
- 2026-11-19, step 3 (audio): references/ai-voiceover.md, references/remotion-pipeline.md,
  real-sfx/references/studio-sound.md, library/voices/m5/README.md, library/music/README.md.
- 2026-11-19, steps 4-5: references/sourcing.md, references/three.md, templates/parts/README.md.
- 2026-11-19, step 6: references/review.md (fact-check, stills before renders, mute test, partial re-render).

## Board (fresh judge in place of Matthew's approval)
- Board v1 (2026-11-19, `stills/board_v1.png`): REJECT. Fixed: beat 9 read backwards (camera on the night side,
  New York's beam grazing) -> side view, light shafts that end on the surface, New York head-on, Sydney grazing, tags
  centred; beat 8 winter patch as bright as summer -> normal-blended fills 0.9 vs 0.28, winter dots 0.3, "summer patch:
  100%" kept over the 46 % tiles; June lap ~20 px -> camera with the Sun above Earth (+X up), "JAN" tag, thicker ghost
  axes; hook static -> warm glow and "closest = summer?" land on "summer" (1.4 s), Earth bigger and racing in;
  meadow cheap -> leaf-cluster texture (the kit's leaf() cut-out drew squares), grass buried under snow, Rayleigh 1.7
  sky; Sun washed grey -> warmer, brighter limb; 23.4 deg arc amber -> white (amber = sunlight); end frame "angle" with
  the beam into New York dropped (New York is at night by then). Not changed: captions "ahead" (they follow the VO;
  the judge read the board's approximate labels), the beat-2 inset (the deflate already shows the position).
- Boards v2, v3 (`stills/board_v2.png`, `board_v3.png`): checked by me against the judge's list; v3 + the beat-9
  shaft fix accepted. The mute test on the render is the second independent check.

## Outstanding corrections
- none yet

## Lessons for the skills
- (filled in as the session goes)

## Fact check (fresh agent, 2026-11-19; sources: timeanddate perihelion/aphelion and New York sun tables, NASA Space
Place seasons, Weber State, Parkland lab, Ohio State, Polaris)
- Holds: perihelion Jan 3 2026 (147.10 M km) / aphelion Jul 6 (152.09 M km), 3.3 % -> "only 3 % closer"; tilt 23.44
  deg from the orbit normal; axis fixed toward Polaris over a year; NY noon Sun 72.7 / 25.9 deg -> 2.19x the ground,
  46 % per patch (the atmosphere makes winter even weaker, so "about half" understates); Sydney June noon 32.7 deg.
- Reworded: "Most people think" -> "Lots of people think" (no source for "most"; Matthew likes "Most people think",
  accuracy wins); "the middle of winter" -> "in winter" (Jan 3 is 12 days after the solstice); "twice the ground" ->
  "about twice"; last line -> "It's mostly how straight its light hits" (day length also matters; angle is the bigger
  share: 0.46 vs ~0.61 for day length at 40 N).
- On-screen counts: marbles land in discrete rows (0.92 m apart), so a tile can't literally hold 46. Tiles now show
  heat: "100 %" summer, "46 %" on each winter tile. Beat 9 beams are each city at its own noon (Earth turns between).

# Cat landing 01: build plan

Builder session, unattended (Matthew asked for the whole film without approval). Source of truth: `../lines.txt`
(locked), `../pictures-pick.md` (beat ideas), `../research.md` (facts). Decisions are noted here as made.

## Concept in one line
Miso, an original orange tabby (big eyes, cream belly patch, stripes on the back), bats a slice of toast off a sunny
kitchen windowsill and falls with it. Time slows for the explanation; the camera rides the fall down one tall,
warm kitchen wall (shelves, plants, clock, a sunbeam full of dust); she lands on the rug, warns us, the wide view
recaps the flip down the whole wall, and she leaps back to the sill so the last frame loops to the first.

## Decisions
- 2D SVG rig (`src/Cat.tsx`), no three.js (pick's advice; cheap renders). Roll about the spine is projected per half:
  legs swing from paws-up to paws-down, the cream belly patch slides, the head rotates in plane. One rig for the star
  and the grey Manx (parameters only).
- Accent = teal `#14B8C8`: "the half that is turning / follow this", turn-ring beads, caption key words. Front half
  rim = teal, back half rim = violet `#8B6CF0` (the two halves' identities, lines 5-7). Everything else warm.
- Cut list taken up front (budget ~90 min): no figure skaters (turn rings + leg poses carry lines 6-7), no chalk ladder
  (the chalk wall stays), no paw-pad close-up (dust puffs and squash stay). The cockpit keeps loops, portholes, dial
  and a tiny pilot drawn as a simple shape.
- Physics guard (research): phase 1 front turns ~190 deg one way while back turns ~10 deg the other; phase 2 back turns
  ~200 deg the front's way while front gives back ~7 deg. Halves always counter-rotate at the same time.
- Honesty tags: "Slowed down" over the slow-motion stretch (lines 2-7), "Simplified" over the mechanism (lines 5-7),
  "Not to scale" on the tall wall in the recap.

## Language (state -> look, whole film)
| State | Look |
|---|---|
| Key object named by the voice, first time | white hand-lettered tag (Permanent Marker, ink) pops on the object with a tick, fades after ~1.6 s |
| A half is turning | its ring's beads orbit (teal front / violet back) at that half's roll speed and direction; still beads = not turning |
| Front half / back half identity | teal rim / violet rim (lines 5-7 only), merge into plain orange at the click |
| Slow motion | warm vignette deepens + "Slowed down" tag; motes drift slowly |
| Real speed | motes streak, vignette lifts |
| Myth | thought bubbles, chalky doodle tails |
| Caption key word | teal, lifted, glow |

## Thread (lead -> move -> next lead -> carrier)
| Line | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 1 | cat batting toast on sill | travel (falls, camera rides down) | spinning tail | tail rotor blur |
| 2 | Manx dropping past | travel (passes through frame) | star's ear | ear twitch |
| 3 | ear | pass through (into the head) | cockpit dial | the ear's pink opening |
| 3->4 | porthole | transform (porthole becomes her pupil) | cat in the air | the eye |
| 4 | cat paddling in motes | transform (body curls to a "?") | waist | the curl |
| 5 | waist joint | split (two rings) | front ring | front half |
| 6 | front half spin | travel (camera tracks to back) | back half | back ring |
| 7 | back half catching up | merge (click at waist) | whole cat upright | the click |
| 8 | afterimage fan | collapse into her | paws down | paws |
| 9 | paws hit rug | land | face | dust settles |
| 10 | stop paw "never" | pull back / tilt up | wall height | the hand leaving |
| 11 | ghost cat down the wall | travel, words stack | real cat leaps to sill | loop to frame 0 |

## Beat -> time map
See `src/beats.json` (from `beats.py` over the aligned VO). Filled after alignment below.

## Timeline (machine clock, UTC)
- 19:25 start; voice job + music download started in background
- 19:26-19:33 read brief, final report, skills, worked film; film/ set up; cat rig + model sheet (`out/sheet.png`)
- 19:31 pictures-pick.md arrived (pulled)
- 19:32-19:33 VO done: 11 lines generated (seed 7), assembled 51.25 s, aligned line by line: 11/11 MATCH; beats.json
- 19:33-19:37 Film.tsx (whole timeline), World.tsx, Props.tsx; stills round 1 (30 beats) -> `../stills/board_v1_sheet.png`
- 19:37-19:39 stills round 2/3: cat bigger in the mechanism (zoom 1.5-1.7), recap camera follows the ghost down the wall
  at 0.75 instead of a 0.4 wide (unreadable), hand moved off the face, "?" over the curl, raised "never" paw drawn in
  front of the head, verbs moved clear of the ghost, camera follows the leap back to the sill
- 19:40 quarter preview + motion_check: movers 20 vs bar 18; FAIL seconds 39, 41 (standing on the rug) -> settling dust,
  tail swish, head tilt -> re-run 19:43: PASS (movers 20 vs 18, <=2 movers 0% vs 11%)
- 19:41 sound/mix.py: 29 cues; music 10.1 dB under the voice in speech, up in the pauses; mix -14.4 LUFS
- 19:42-19:43 mute test 1 (fresh agent, captions off, 2 fps sheets): recovered 8/11 claims. Missed/partial: myth bubbles
  meaningless; "nothing to push on" only guessed from AIR; "½ second" confused with the toast tag; "can get hurt /
  never drop a cat" missed (read as a fist bump); a worried tear for ~12 s read as distress; tiny honesty text.
- 19:43-19:45 fixes: "myth?" tag on the bubbles; "nothing to push on" tag at the crumbling chalk wall; stopwatch tag
  "flip < ½ second", toast tag removed; a gentle thought bubble (cartoon cat with a plaster, "ouch", tag "can get
  hurt") on "badly hurt"; paw pad reads "never / drop a cat"; tear only for 1 s; honesty text 40 px.
- 19:45 mute test 2 (second fresh agent) on 0-16 s and 32.5-45 s; full render started

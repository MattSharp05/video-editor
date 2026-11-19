# s2 Monty Hall: script (v0.2, picture-first)

**Idea:** after the host opens a goat door, switching wins two times out of three; with a hundred doors and 98 opened,
your door is still a one-in-a-hundred guess and his last door carries the other 99. **Goal:** reach (shares and
comments). **Format:** Reel 1080×1920, 30 fps, ~42 s. **Voice:** m5. Stand-in timing 2.8 words/s.

Numbers in shot notes are starting values; the board tunes them.

---

## Look sheet

**Style.** Realistic 3D (`styles/realistic-3d`, look pass: ACES once, a sky-less interior: hemisphere fill + spotlights,
env map on brass and the car only, vignette + light grain). A vast dark hall, a theatre with no audience.

**World and scale.** 1 unit = 1 m. Door 0.9 × 2.1 m in a 1.1 × 2.3 m frame, panelled wood painted deep blue-grey
#3C4654, brass knob and brass number plate. Each door fronts a booth 1.3 wide × 2.6 tall × 2.4 deep (dark plaster).
Three doors 1.7 m apart. The wall of 100: 10 × 10 booths, cell 1.4 × 2.75 m: 14 m wide, 27.5 m tall. Floor: dark
polished wood (CC0 texture). Goat ~0.75 m at the shoulder (CC BY model). Car ~4.6 m long (CC BY model).

**Light.**
| Setting | Value | Why |
|---|---|---|
| Key | three warm spotlights (#FFD9A6), 6 m up, one over each door, 28° cone, soft penumbra | pools on the floor; the doors glow out of the dark |
| Fill | hemisphere #8FA3C0 / #2A2018 at 0.25 | the dark reads as a room, not a void |
| Haze | fog #15171C from 12 m to 70 m | depth; the wall of 100 fades up into the dark |
| Booth interior | a warm bulb inside each booth (#FFE6C0) | contents read the moment a door opens |
| Exposure | ACES 1.0 (tuned on the board) | |

**Colour meanings (fixed).**
| Colour | Means | Used on |
|---|---|---|
| Ice #CFE6FF | your pick | the picked door's frame glow and its floor number (1/3, 1 %) |
| Amber #FFB547 | the odds you gain by switching, the answer | light flowing from opened doors into the last closed one, "2/3", "99 %", the car's lights |
| Coral #FF5A4E | the intuition that's wrong | the "50/50" projected under both closed doors |
| Wood, plaster, brass | neutral | everything else |

**Camera rules.** 35 mm on a 36 mm gauge (vertical FOV 54.4°: frames 1.03·d tall, 0.58·d wide). Three doors (4.9 m
with frames) fit at d ≥ 8.5 m; the 100-door wall (27.5 m tall) needs d ≈ 30 m. The camera never parks: slow dolly or
crane per beat. One hard cut: from the wall of 100 back to the three doors (a change of world and scale).

**Frame and safe areas.** Captions y 250–470. Lead inside x 60–1020, y 520–1500. Nothing important below y 1500 or
right of x 930 below y 1100.

**Visual language: states.**
| Item | States | Look |
|---|---|---|
| Door | closed → picked → opened | closed: dark, brass glints; picked: ice glow on its frame and an ice number on the floor; opened: swings 100° inward-left, booth light spills out, goat (or car) visible |
| Odds | spread → flowing → pooled | a soft amber light on the floor in front of each door; when doors open their light streams along the floor (or up the wall) into the last closed door, whose pool grows and its number rises |
| Envelopes | falling | white envelopes with a red stamp tumble from above and pile on the floor (the 10,000 letters) |

**Thread.**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| Falling envelopes | settle | three doors | the envelopes land in front of the doors |
| Doors open / close / shuffle | travel | door 1 (picked) | the shuffle ends, door 1 lights ice |
| Door 3 opens | open | the two closed doors | the goat inside door 3 |
| Two closed doors | pull back | the wall of 100 | the three doors become the bottom row's middle |
| 98 doors open | flow | the last door | amber light streams into it |
| Wall of 100 | cut | three doors again | the same amber flow, door 3 → door 2 |
| Door 2 | open | the car | headlights come on |

---

## Beats (v0.2: after the fact-check and the concept judge; times from the aligned VO once it exists)

World change (judge): a storage building at night, 10 floors × 10 units (3.0 m wide, 3.2 m floors) with wide double
doors (2.6 × 2.5 m, two leaves swinging outward 100°), walkways with railings on floors 1–9, stairs at both ends; units
6 m deep so the car (4.6 m) fits. Doors 1, 2, 3 are the middle of the ground floor. The rest of the building stays dark
until the hundred-door beat. The host is a searchlight from high front-right.

| # | Voice | Picture | Lead |
|---|---|---|---|
| 1 | "Nearly a thousand PhDs wrote in to say this answer was wrong." | Low camera (1 m, 16 m back, 35 mm, looking up 9°): three wide doors under pole lights, the dark building looming above; ~500 envelopes rain through the light and pile on the asphalt. | the envelopes |
| 2 | "Three doors: a car behind one, goats behind the others." | The doors swing open: goat, goat, car (lit units); they shut; the yard lights black out for ~0.55 s with a rumble; lights on: three closed doors (the car may be anywhere). | the contents, then the dark |
| 3 | "You pick door one." | Door 1's frame lights ice. | door 1 |
| 4 | "The host knows where the car is, and always opens a goat door you didn't pick." | The searchlight comes on over door 2 (never touching door 1), lingers (a faint amber gleam under door 2), swings to door 3; door 3 swings open: a goat. | the beam, then door 3 |
| 5 | "Should you switch to door two?" "Pause and guess." + 1.5 s | Door 3's goat steps forward and turns; the camera drifts; ticking. | doors 1 and 2 |
| 6 | "It feels like fifty-fifty." | Coral "50%" projected on doors 1 and 2. | the coral numbers |
| 7 | "Now try a hundred doors. Your pick is a one-in-a-hundred chance." | Door 3 shuts; walkway lamps switch on outward; the camera pulls back and cranes up to the whole building (level camera, 63 m). Door 1 stays ice ("1%"); every other door's frame glows amber: your 1 against the other 99 ("99%" across the building). | ice door vs the amber 99 |
| 8 | "The host always opens ninety-eight goat doors." | The searchlight sweeps top floor down; each door it touches swings open on a goat (98 in ~2.3 s), skipping door 1 and one door on floor 7. Each opened door's amber streams across the façade into that last shut door. | the wave and the streams |
| 9 | "The one door he left shut holds the other ninety-nine chances." | "99%" travels onto the last shut door, now bright amber. | the 99 % door |
| 10 | "With three doors, switching wins two times out of three." | Hard cut to the three doors (door 3 open on its goat): door 1 ice "1/3", doors 2+3 amber "2/3"; door 3's amber streams into door 2, "2/3" settles on door 2. | the stream → door 2 |
| 11 | "Marilyn vos Savant was right: always switch." | Door 2 swings open: the car; headlights clunk on toward us. Push in. | the car |

## Captions
Sense units as in `film/src/Film.tsx` (`LINES`), key words [switch], [ninety-nine], [two], [always] [switch.] in amber.

## Sound cue list (CC0 cstack set or synthesized)
Hall room tone (synth brown noise), paper flutter for the envelopes (card-riffle, wing-flutter, filtered), door swings
(ship-creak, short, pitched per door), booth slide rumble (synth), door 1 pick (soft glass-ting), door 3 open + goat
(no animal sound in the CC0 set: none), the wave of 98 (a cascade of soft clicks, tile-clicks, rising), the odds flow (a
rising synthesized shimmer), whoosh-deep peaking on the cut, door 2 open + headlight clunk (relay-click) + soft hit.

## Claims to verify (fresh agent, before the board)
1. In 1990 (Parade, "Ask Marilyn", 9 Sep 1990) vos Savant answered the puzzle: switch.
2. Nearly 1,000 PhDs wrote in to say she was wrong (of ~10,000 letters).
3. "one columnist" — vos Savant wrote the column.
4. Rules as stated: the host knows where the car is and always opens a goat door you didn't pick.
5. Switching wins 2/3 with three doors; with 100 doors and 98 opened, staying wins 1/100 and switching 99/100.
6. "It feels like fifty-fifty" (framing, not a claim about most people).
7. "The columnist was right."

## Assets
| Asset | Source | Licence |
|---|---|---|
| Goat | "Boer Goat 🐐 3D Model Free" by iRahulRajput, Sketchfab | CC BY 4.0, caption credit |
| Car | "Classic Vintage Car", Sketchfab (author on download) | CC BY 4.0, caption credit |
| Floor wood | Poly Haven | CC0 |
| Doors, booths, hall, envelopes, light flows, numbers | built in code | ours |

## Fact check (fresh agent, 2026-11-19)
Opened: Tierney, NYT 21 Jul 1991 (full text via the Notre Dame CHANCE reprint), R. Williams "Appendix D: The Monty
Hall Controversy" (Notre Dame), Wikipedia "Monty Hall problem". Not opened: marilynvossavant.com (503), nytimes.com and
web.archive.org (blocked), the Parade originals.
- Holds: "close to 1,000 [of the critical letters] carried signatures with Ph.D.'s" (Tierney); ~10,000 letters, most
  disagreeing (her estimate; not shown as a number); column September 1990; 2/3 and 99/100 under the rule; "it feels
  like fifty-fifty" (intuition); "she was right" (Tierney, Monty Hall himself).
- Reworded: the host rule says "always opens a goat door you didn't pick" (Gardner: not well-formed unless the host
  must always open an empty door and offer the switch); the hook no longer pins the letters to 1990 (they came over
  1990–91); "the other ninety-nine" → "the other ninety-nine chances"; she is named "Marilyn vos Savant".

## Concept judge (fresh agent, 2026-11-19): approve with changes
Taken: shuffle → blackout; the host's rule in the narration and a body (a searchlight that never touches your door and
lingers over the car's door); the grouping step (your 1 vs the other 99 in amber before the doors open; 1/3 vs 2/3 at
three doors); wide doors and 6 m units so the car fits; the 10-high wall → a storage building with walkways and stairs;
a ~3.5 s hook; "chances"; vos Savant named; door 1 stays your pick through the pull-back; goats varied (turn, size,
mirror). Not taken: tiered bleachers (the storage building reads as real and keeps every door facing the camera); a
many-games replay (no room in 45 s); headlights blowing the envelopes away.

## What the board changed (board v1 → v2)
| Beat | Script/board said | Stills/judge showed | Now |
|---|---|---|---|
| 2 | car revealed behind door 3, blackout "shuffles" | muted: "he opened the car door?" | car behind door 2 throughout; the blackout only hides |
| 7–9 | 99 doors' frames thin amber; opened units lit | the 98 opened units outshone the one shut door | opened units dim to 30 %, the shut door blazes, 99 % travels onto it |
| 7 | 99 % appears at "chance" | 99 % missing at the grouping | 99 % (9 m wide) over the building from "Your pick" |
| 9–10 | doors reset before the cut | a one-frame reset of the amber frames at 33.0 | opened doors stay open; framing locked from the flow to the cut |
| 1–6, 10–11 | camera 15.6 m | door 1 and door 3's goat at the frame edges | 18 m, look up 9° |
| all | ice #CFE6FF | read as white, same as the searchlight | ice #8CCBFF; searchlight warm-neutral, 0.04 rad |
| 1 | envelopes 22 cm, pile rectangle | small at phone size; pile reads as a decal | 30 cm, a soft-edged pile, ten tumbling past the lens |
| all | doors with raised mouldings | dashed lines (z-fighting) | moulding offset from the panel |

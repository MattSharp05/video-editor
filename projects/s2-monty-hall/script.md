# s2 Monty Hall: script (v0.1, picture-first)

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

## Beats

### Beat 1 · 0.0–5.6 s · hook
**Voice:** "In 1990, nearly a thousand PhDs wrote in to say one columnist got this puzzle wrong."
**Start frame (cover):** low angle (1.2 m up, 9 m back, 35 mm) on three tall panelled doors under three spotlight pools,
dark hall, haze. Envelopes already falling through the light beams (≈400 visible, tumbling, landing in drifts).
**Action:** envelopes keep raining (soft paper flutter) and pile up to 15 cm on the floor in front of the doors.
**Camera:** slow push 9 → 8 m, rising 1.2 → 1.6 m.
**Lead:** the envelopes, then the doors.
**End frame:** three doors centred y 700–1300, a drift of envelopes at their feet.

### Beat 2 · 6.0–9.4 s · the set-up
**Voice:** "Three doors. A car behind one, goats behind the others."
**Action:** all three doors swing open (0.5 s, staggered): goat, car (nose toward us, chrome glints), goat. 1.2 s later
they swing shut, and the three booths slide and swap places twice (1.2 s, like a shell game) so nobody knows where the
car is now.
**Camera:** hold at 8 m, slight orbit.
**End frame:** three closed doors, numbered 1 2 3 on brass plates.

### Beat 3 · 9.9–15.0 s · the pick and the host
**Voice:** "You pick door one. The host, who knows where the car is, opens a goat door."
**Action:** on "door one" door 1's frame lights ice and "1" glows on the floor. On "opens" door 3 swings open: a goat,
lit by its booth bulb, looks at us.
**Lead:** door 1 → door 3's goat.

### Beat 4 · 15.4–19.4 s · the question + pause
**Voice:** "Should you switch to door two? Pause and guess." + 1.5 s pause
**Action:** the camera slowly dollies along the line of doors; door 2's brass knob glints; a slow pulse of light under
doors 1 and 2 alternately (tick, tock) during the pause.
**Lead:** doors 1 and 2.

### Beat 5 · 19.9–21.5 s · the intuition
**Voice:** "It feels like fifty-fifty."
**Action:** coral "50%" is projected onto the floor in front of door 1 and of door 2 (gobo light, soft edges).
**Lead:** the two coral numbers.

### Beat 6 · 22.0–24.2 s · a hundred doors
**Voice:** "Now play it with a hundred doors."
**Action:** doors 1 and 3 close, all lights reset; the camera pulls back and cranes up: the three doors are the middle
of the bottom row of a wall of 100 doors (10 × 10), each with its own booth light behind its window-less door, numbered.
**Camera:** 8 m → 31 m, rising to 13 m (look at the wall's centre).
**End frame:** the whole wall in frame (y 520–1480).

### Beat 7 · 24.6–28.4 s · 98 goats
**Voice:** "You pick one. The host opens ninety-eight goat doors."
**Action:** one door (row 4, column 3) lights ice. On "opens" 98 doors swing open in a wave (from the far corner,
0.02 s apart, 2.2 s total), each revealing a goat in a lit booth. Only the ice door and one other (row 7, column 8)
stay shut.
**Lead:** the wave.
**End frame:** a wall of 98 lit goat booths and two dark doors.

### Beat 8 · 28.9–33.6 s · the odds flow
**Voice:** "Your door was a one-in-a-hundred guess. His door carries the other ninety-nine."
**Action:** "1%" in ice beside your door. Then the amber glow from all 98 open booths streams across the wall face
toward the other closed door (streaks of light along the mortar lines), its frame brightens amber and "99%" appears.
**Camera:** slow push in 31 → 24 m toward the two doors.
**Lead:** the streams → the 99 % door.

### Beat 9 · 34.0–37.3 s · back to three
**Voice:** "With three doors, switching wins two times out of three."
**Action:** hard cut to the three doors (door 1 ice "1/3", door 3 open with its goat). Door 3's amber light streams along
the floor into door 2: "2/3" in amber in front of door 2.
**Lead:** the amber stream → door 2.

### Beat 10 · 37.7–40.6 s · payoff
**Voice:** "The columnist was right: always switch."
**Action:** door 2 swings open: the car, headlights flicking on toward us (amber-white), chrome in the spot.
**Camera:** push toward door 2.
**End frame:** the car in the open doorway, headlights on; 1.5 s tail.

---

## Captions (sense units)
In 1990, nearly a thousand PhDs / wrote in to say one columnist got this puzzle wrong. / Three doors. / A [car] behind
one, goats behind the others. / You pick door one. / The host, who knows where the car is, / opens a goat door. / Should
you [switch] to door two? / Pause and guess. / It feels like fifty-fifty. / Now play it with a hundred doors. / You pick
one. / The host opens ninety-eight goat doors. / Your door was a one-in-a-hundred guess. / His door carries the other
[ninety-nine.] / With three doors, switching wins [two] times out of three. / The columnist was right: [always] [switch.]

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

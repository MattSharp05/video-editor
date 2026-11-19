# s2 Coin rotation: script (v0.2, picture-first; board v1)

**Idea:** a coin rolled once around an identical coin turns twice, not once: rolling along the edge gives one turn and
travelling around the circle adds one more; the 1982 SAT asked this with a coin a third as wide and the right answer
(four) wasn't among its choices. **Goal:** reach / shares. **Format:** Reel 1080×1920, 30 fps, ~40 s. **Voice:** m5.
Stand-in timings at 2.8 words/s until the VO is aligned; every time below is approximate until then.

Numbers in the shot notes are **starting values**; the board tunes them.

---

## Look sheet

**Style.** Realistic 3D macro (`styles/realistic-3d`, look pass: ACES once, sky-coloured hemisphere + a warm key, env
map on the coins only, vignette + light grain). A tabletop world: no sky, the "air" is a soft dark falloff.

**World and scale.** 1 unit = 1 cm. Coins: radius 1.2 (24 mm, quarter-sized), thickness 0.175, reeded edge (119
reeds), raised rim 0.06. SAT pair: small coin radius 0.9, big coin radius 2.7 (a 54 mm medal: exactly 3×). Exam sheet
21.6 × 27.9 (US letter) on a wooden desk. Pencil: 19 long, hexagonal 0.72 across flats.

**Light.**
| Setting | Value | Why |
|---|---|---|
| Key | warm desk-lamp/window light from frame-top-left, 35° above the desk, #FFE2B8 | long soft shadows of the coins on the paper, rim on the reeds |
| Fill | hemisphere, top #DDE6F5, bottom #6B5440 (wood bounce) | faces away from the key stay readable |
| Environment | soft studio env (RoomEnvironment PMREM) on coins only | real metal needs something to reflect |
| Exposure | ACES 0.9 (tuned on the board) | paper reads white, not grey |
| Falloff | the desk darkens to #1A1410 beyond 25 cm from the coins | depth without DOF |

**Colour meanings (fixed for the film).**
| Colour | Means | Used on |
|---|---|---|
| Amber #FFB547 | the turns we count (the answer) | the marker arrow on the rolling coin, ghosts whose arrow points up, the counter, bubble "2", "4" |
| Coral #FF5A4E | the wrong / expected answer | bubble "1" glow, the five SAT choices struck |
| Ice #BFE3FF | a path, a length | the centre's route, the unrolled edge track |
| Silver / paper / wood | neutral | everything else |

**Materials.** Coins: metal 1.0, roughness 0.28 (faces) / 0.2 (rim), colour #C9CDD2, fine radial brushed noise, rim
brighter. Arrow: amber marker ink on the face, slightly translucent, roughness 0.6. Paper: #F4F1EA, roughness 0.9, faint
print. Desk: Poly Haven CC0 wood (or procedural oak if the texture costs too much), roughness 0.55.

**Camera rules.** 50 mm on a 36 mm gauge (vertical FOV 39.6°: frames a height of 0.72·d, a width of 0.405·d). The
coin pair's orbit (7.2 cm across) needs d ≈ 22 cm; SAT orbit (10.8 cm) needs d ≈ 30 cm. Looking down 55–70° from
horizontal. The camera never parks: slow orbit (≤ 15° per beat) or push. Hard cuts allowed between set-ups (none
cross a solid here; cuts are for changes of puzzle).

**Frame and safe areas.** Captions y 250–470. Lead inside x 60–1020, y 520–1500. Nothing important below y 1500 or
right of x 930 below y 1100.

**Visual language: states.**
| Item | States, in order | Look |
|---|---|---|
| Rolling coin | resting → rolling → counted | resting: still, arrow north; rolling: rolls without slipping; counted: each time the arrow points north again, an amber pulse on the arrow and a ghost |
| Ghost | stamped → kept | every 1/16 of the trip a translucent silver copy stays where the coin was (arrow kept); ghosts whose arrow points north glow amber |
| Answer bubble | empty → guessed (coral) / filled (amber) | pencil-graphite fill; coral glow for the guess, amber fill for the answer |
| Track | ring → straight | the fixed coin's reeded edge peels off into a straight ice-lit strip and curls back |

**Thread.**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| Exam question on paper | push in | the two coins printed beside it become real coins | the question's picture of two circles |
| Coins at rest | travel | the arrow | the roll starts, arrow amber |
| Arrow | transform | ghost ring | each stamp leaves a ghost |
| Ghost ring | open | unrolled track | the fixed coin's edge peels off |
| Track | merge | carried coin (no roll) | the strip curls back into the ring |
| Coins | cut | SAT pair (1:3) on the question sheet | the arrow, same place in frame |
| SAT pair | pull back | answer choices on the sheet | the counter "4" lands next to the choices |

---

## Beats (v0.2: after the fact-check and the concept judge; times from the aligned m5 VO)

| # | Time | Voice | Picture (start → action → end) | Lead |
|---|---|---|---|---|
| 1 | 0.0–4.0 | "In 1982, a puzzle like this tripped up the S.A.T." | Cover: exam sheet on a wooden desk, warm key from top-left; two silver coins touch, A (amber marker arrow) already rolling round B; bubbles 1 2 3 below, question 7 printed under them. 50 mm, d 25 cm, 60°. | coin A's arrow |
| 2 | 4.4–8.5 | "Roll one coin around another the same size. How many times does it turn?" | A rolls a fifth of the way round and rolls back to the start (a rewind, no slide). Camera settles at d 23. | coin A |
| 3 | 9.6–12.2 | "Pause and guess." + 1.5 s pause | Bubbles lift; in the pause a pencil circle (A's centre route) draws itself round B. | the route circle |
| 4 | 12.4–13.7 | "Looks like once, right?" | Bubble 1 shades itself in graphite with a coral glow (the expected answer). | bubble 1 |
| 5 | 14.2–18.4 | "Watch the arrow. Halfway round, it's already turned once." | A rolls round B (spin = 2 × trip angle); every 1/8 of the trip a graphite arrow stamp stays where A was. At halfway (A on the far side) the arrow points up the page: arrow pulses amber, an amber "1" writes itself top-right. Camera d 26, 72°, look shifted up so A stays below the captions. | the arrow |
| 6 | 18.5–20.4 | "All the way round: twice." | A completes the trip: second pulse, the tally becomes "2", bubble 2 shades amber, bubble 1 dims. The ring of 8 stamps shows the arrow cycling round twice (two amber, up). | the ring of stamps |
| 7 | 20.9–23.3 | "Roll it along a straight strip: just once." | Stamps fade; B's edge peels off as a paper strip (2πR = 7.54 cm, ice tick line) and straightens east. A rolls along it: one turn, arrow up, amber "1" at the strip's end. Camera d 28–29 pans right. | the strip, then the arrow |
| 8 | 24.2–26.8 | "Bend the strip into a circle, and the bend adds a turn." | The strip curls back into B's edge with A riding its end; the bend turns A once more (spin = rolled + tangent turn). A lands at the start, arrow up; "1 + 1" writes itself. | A on the bending strip |
| 9 | 27.1 cut | "The 1982 test used a circle a third as wide. Three turns, plus one for the circle." | Hard cut down the sheet to question 8: a small coin (r 0.9) beside a coin three times as wide (r 2.7). The small coin rolls round; an amber tally writes 1, 2, 3, 4 on each arrow-up (spin = 4 × trip). d 34–35. | the small coin's arrow |
| 10 | 33.7–37.4 | "Four. The key said three, and four wasn't a choice." | The printed choices (A) 3/2 (B) 3 (C) 6 (D) 9/2 (E) 9: graphite circles (B) 3 on "key said three", a coral strike crosses it on "wasn't", an amber 4 writes itself beside the row. | the choices |
| 11 | 37.6–41.5 | "Three students caught it, and three hundred thousand scores were recalculated." | Pull back and up: the sheet on the desk among stacks of answer sheets receding into the dark; an amber wave runs out across their tops from ours. | the wave |
| end | 41.5–43.7 | (music) | Wide on the stacks, the wave fading. | |

## Captions (sense units, as in `film/src/Film.tsx`)
In 1982, a puzzle like this tripped up the S.A.T. / Roll one coin around another the same size. / How many times does it
[turn?] / Pause and guess. / Looks like once, right? / Watch the [arrow.] / Halfway round, it's already turned [once.] /
All the way round: [twice.] / Roll it along a straight strip: just [once.] / Bend the strip into a circle, / and the bend
adds a [turn.] / The 1982 test used a circle a third as wide. / Three turns, plus one for the circle. / [Four.] The key
said three, / and four wasn't a choice. / Three students caught it, / and three hundred thousand scores were recalculated.

## Sound cue list (CC0 sfx-29–61 or synthesized)
Room tone (soft synthesized brown noise, low), coin twitch tick (tile-clicks, pitched), roll: a soft metallic rolling
purr (synthesized band noise) while A rolls, one glass-ting per arrow-north count (rising pitch 1, 2, 3, 4), ghost
stamps silent (restraint), the peel (rope-or-cable-winch, filtered, quiet), pencil scribble for the bubble fill
(synthesized), five soft strikes for the struck choices (pop-soft, low), whoosh peaking on the cut to the SAT set-up.

## Claims to verify (fresh agent, before the board)
1. A coin rolled without slipping around an identical fixed coin makes two full rotations.
2. Halfway round, it has already made one full rotation.
3. Rolled along a straight line as long as the fixed coin's circumference, it makes one rotation.
4. The second rotation comes from going around the circle (carried round without rolling it still turns once).
5. The 1982 SAT question used a circle one third the radius ("a third as wide") of the other.
6. Rolling outside a circle three times as wide: 3 + 1 = 4 rotations.
7. Four was not among the answer choices (3/2, 3, 6, 9/2, 9).
8. "Three students caught it" (three students challenged the question).
9. 300,000 tests were rescored.
10. "this question broke the S.A.T." — framing: the question had no correct answer and forced a rescoring.

## Assets
| Asset | Source | Licence |
|---|---|---|
| Coins, arrow, ghosts, track, exam sheet, bubbles, counter, pencil | built in code | ours |
| Desk wood texture | Poly Haven "Wood Table" (or procedural) | CC0 |

## Fact check (fresh agent, 2026-11-19)
Sources opened: Education Week 2 June 1982 ("Students Outsmart S.A.T. Again; 300,000 Tests Will Be Rescored"), ETS
research report 1983 ("Was There One Distractor Too Many?"), Scientific American ("The SAT Problem That Everybody Got
Wrong"), Wikipedia "Coin rotation paradox". Not opened (403/blocked): NYT/UPI 25 May 1982, Michigan Daily, The Battalion.
- Holds: equal coins 2 turns, halfway 1, straight strip 1, the second from going round (College Board: "contributes an
  extra revolution"); 1/3 radius → 4; choices 3/2, 3, 6, 9/2, 9 with the key at 3; three students (Doug Jungreis, Shivan
  Kartha, Bruce Taub, found separately); 300,000 students' maths scores recalculated (most unchanged, some up to 10 pts).
- Reworded: "this question broke the S.A.T." → "a puzzle like this tripped up the S.A.T." (the sheet shows the
  equal-coin version, and "broke" overstated it); "used a coin" → "used a circle"; "tests were rescored" → "scores were
  recalculated"; added "The key said three"; the sheet's item numbers are ours (7 and 8), not presented as the real one.
- Caveat for the caption: ETS noted the item is ambiguous in its frame of reference (seen from circle B, 3 is
  defensible). On screen, "turn" is relative to the page (the arrow points up the page).

## Concept judge (fresh agent, 2026-11-19): approve with changes, all taken
Hook made true and opened on a moving coin; ghost coins (16 overlapping) → 8 graphite arrow stamps; beats 6–7 (edge
peel + carried round, a Moon comparison) merged into one event (the strip straightens, A rolls once, the strip bends
back carrying A a second turn); "The key said three" added; the payoff gets a change of scale (stacks of answer sheets
and an amber wave) instead of a wide shot; "spin" → "turn" throughout; counter as self-writing graphite on the sheet,
not 3D type; text sized for a phone; one "self-drawing graphite" look for every mark.

## Alternative hooks (not used)
- "Even the people who write the S.A.T. got this one wrong." / "Roll one coin around another…"
- "How many times does this coin turn? The S.A.T. got it wrong." / "Roll one coin around another…"

## What the board changed (v0.1 → v0.2)
| Beat | Script said | Stills showed | Now |
|---|---|---|---|
| 1 | question text above the coins at z −6 | under the caption scrim, and cut off at frame left (frame is 9.5 cm wide at d 24) | question 7 under the bubbles, 0.42 cm type, inside x ±4 |
| 5–6 | tally at x 4.3 | off the frame's right edge | x 3.7, z −3.3 |
| 5 | look at the coin pair's centre | A at the far side sits under the captions | look shifted 0.6–0.8 cm up the page, d 26 |
| 9–10 | 1982 pair and choices side by side | 14 cm wide: doesn't fit 9:16 | stacked: question 8 / coins / choices in a row; sheet made legal-length (35.6 cm) |
| all | studio environment (RoomEnvironment) | flat, evenly lit coins | a dark room env with a warm softbox, a cool window, the desk's bounce |
| 9–10 | the first pair stays on the sheet | its amber arrow competes in the 1982 shot | the first pair hides on the cut |
| 11 | stacks as plain boxes | read as foam blocks, over-bright tops | paper-edge banding, same falloff as the desk, slight skew, wave at 40 % |
| all | pencil at lower left | lay across question 7/8 | right margin, pointing up the page |

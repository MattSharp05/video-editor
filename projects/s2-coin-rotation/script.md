# s2 Coin rotation: script (v0.1, picture-first)

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

## Beats

### Beat 1 · 0.0–2.6 s · hook
**Voice:** "In 1982, this question broke the S.A.T."
**Start frame (cover):** top-down at 62°, 50 mm, d = 26 cm. The exam sheet fills the frame; printed question 14 at
y 560–760: "Circle A rolls around circle B, which is the same size. How many times does A turn?" (our own wording of the
equal-coin version; the 1982 wording comes in beat 7). Below it two real silver coins touch at y≈1050, the right one
(A) carrying an amber marker arrow pointing up the page. A yellow pencil lies diagonally lower-left, tip toward the
coins. Warm key from top-left; coin shadows long toward lower-right.
**Action:** at 0.3 s coin A twitches (a 3° rock), as if about to roll. The answer bubbles 1, 2, 3 under the question
are printed, empty.
**Camera:** push from 26 to 21 cm, orbit 6°.
**Lead:** the coins (brightest metal, amber arrow).
**End frame:** the two coins centred at y≈1000, ~300 px each.

### Beat 2 · 2.9–8.3 s · the puzzle
**Voice:** "Roll one coin around another coin the same size. How many times does it spin? Pause and guess."
**Action:** on "Roll" coin A rolls a quarter of the way round B and stops (it hints the motion) then glides back to
start without rolling (reset, 0.4 s). On "Pause and guess" the bubbles 1 / 2 / 3 lift and glow softly white.
**Pause:** 1.6 s of silence after "guess": a thin ice ring (the centre's route, radius 2.4) draws around B once in
1.4 s, like a clock hand, then holds.
**Camera:** orbit 8° slowly; hold distance 21 cm.
**Lead:** coin A → the bubbles.
**End frame:** coins at rest, route ring drawn, bubbles glowing.

### Beat 3 · 9.9–11.4 s · the expected answer
**Voice:** "It looks like the answer is one."
**Action:** bubble "1" glows coral; a faint coral "1?" does not appear (no text): only the bubble.
**Camera:** slight push toward the bubbles, back.
**Lead:** bubble 1.

### Beat 4 · 11.8–15.9 s · the reveal
**Voice:** "Watch the arrow. Halfway round, it has already turned once."
**Action:** coin A rolls round B (no slipping: spin angle = 2 × the trip angle) at constant speed, half the trip in
2.6 s. Every 22.5° of trip a ghost stays behind. At halfway (A on the far side of B) the arrow points north again:
the arrow pulses amber, the ghost there glows amber, counter "1" appears at the top of the coin group in amber 3D type.
**Camera:** rises from 62° to 75° above the desk so the full ring of ghosts reads; d 21 → 24 cm.
**Lead:** the arrow.
**End frame:** A at the far side, arrow up, eight ghosts in a half ring.

### Beat 5 · 16.3–18.0 s · twice
**Voice:** "All the way round: twice."
**Action:** A completes the trip in 2.4 s; second amber pulse, the start ghost glows amber, counter → "2", bubble "2"
fills with pencil graphite and glows amber; bubble "1" dims.
**Camera:** settles at 75°, d 24.
**End frame (the screenshot):** sixteen ghosts in a flower round B, arrows cycling up/right/down/left twice; two amber.

### Beat 6 · 18.5–22.6 s · unroll
**Voice:** "Unroll the edge into a straight line, and it only turns once."
**Action:** ghosts fade. B's reeded edge peels off as a thin ice-lit strip and straightens to the right, 7.54 cm long
(B's circumference), along the paper. A rolls along it (2.6 s): exactly one turn, arrow back to north, one amber pulse.
**Camera:** pans right with A; d 24 → 26 so the strip fits (7.5 cm < 0.405·26 = 10.5 cm).
**Lead:** the strip peeling, then A's arrow.
**End frame:** A at the strip's end, arrow up; the strip straight.

### Beat 7 · 23.1–26.4 s · the second turn
**Voice:** "The second turn comes from travelling around the circle."
**Action:** the strip curls back onto B. A is carried round B *without rolling* (it slides, keeping the same point
against B, like the Moon's face to Earth): its arrow still sweeps a full turn (2.2 s); ice route ring glows under it.
**Camera:** pans back, orbit 6°.
**Lead:** the arrow sweeping round.
**End frame:** A back at start; counter "1 + 1" in amber.

### Beat 8 · 26.9–31.6 s · the SAT version
**Voice:** "The 1982 test used a coin a third as wide. Three turns, plus one."
**Action:** cut (same camera framing) to a new set-up on the same paper: a small coin (r 0.9) beside a big medal-sized
coin (r 2.7). The small coin rolls round in 3.4 s; counter climbs 1, 2, 3, 4 (each arrow-north pulse).
**Camera:** d 30 cm, 70°, slow orbit.
**Lead:** the small coin's arrow.
**End frame:** small coin back at start, counter "4".

### Beat 9 · 32.1–34.2 s · no right answer
**Voice:** "Four. And four wasn't one of the answers."
**Action:** pull back (d 30 → 40) to reveal the printed choices beside the coins: (A) 3/2 (B) 3 (C) 6 (D) 9/2 (E) 9.
On "wasn't" a coral pencil stroke strikes each choice in turn (0.15 s apart); the amber "4" hangs beside them.
**Lead:** the choices.

### Beat 10 · 34.7–37.6 s · payoff
**Voice:** "Three students caught it, and three hundred thousand tests were rescored."
**Action:** continue the pull back to the whole sheet on the desk (d 40 → 60): the pencil, the coins, the struck
choices; the sheet's corner is stamped "RESCORED"? (no: no text card; the strikes are enough). Coin A rolls once more
round its partner in the background (loop back to the opening).
**End frame:** the desk wide, coins small, amber counter "4" still glowing; 1.5 s tail.

---

## Captions (sense units; [key] words in the accent)
1. In 1982, this question broke the S.A.T.
2. Roll one coin around another coin the same size.
3. How many times does it spin?
4. Pause and guess.
5. It looks like the answer is one.
6. Watch the [arrow.]
7. Halfway round, it has already turned [once.]
8. All the way round: [twice.]
9. Unroll the edge into a straight line, and it only turns once.
10. The second turn comes from travelling around the circle.
11. The 1982 test used a coin a third as wide.
12. Three turns, plus one.
13. [Four.] And four wasn't one of the answers.
14. Three students caught it, and three hundred thousand tests were rescored.

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

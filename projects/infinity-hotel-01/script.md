# Infinity hotel 01: script (v0.1, picture-first)

**Idea:** you can't picture infinity as a number, but you can walk through it: a full hotel with endless rooms still
fits one more guest and even an endless bus, yet the numbers between 0 and 1 can't all get a room, so some infinities
are bigger than others. **Goal:** reach (saves, shares). **Format:** Reel 1080×1920, 30 fps, ~55 s. **Voice:** m5,
stand-in 2.8 words/s. **Title:** "Trying to conceptualize infinity".

Numbers are starting values; the board tunes them.

---

## Look sheet

**Style.** Luminous 3D (`styles/luminous-3d`, look pass: ACES once, height fog, sky dome = fog colour, vignette +
grain, glow as additive halos). A roadside motel at night on a flat plain; the light comes from the rooms, the sign
and the bus.

**World and scale.** 1 unit = 1 m. One straight row of rooms along −z: room n's door centre at z = −3.2·(n − 1),
door in the wall x = 0, facing +x. Each room: door 1.0 × 2.1 m, a window 1.2 × 1.0 m beside it, a number plate above
the door, a wall lamp. Flat roof with an overhang 1.6 m deep, posts at the walkway edge (x = 1.6). Walkway concrete
x 0–1.8; road x 5–11 (asphalt, dashed centre line); desert beyond. Rooms drawn: 1–400 (1.28 km; fog hides the end).
Sign "NO VACANCY" on a pole at (3.4, 0, 4): panel 3.2 × 1.4 m, top at 6 m. Guests: capsule figures 1.7 m (body
capsule r 0.22, head sphere r 0.16). Bus: 2.6 m wide, 3.2 m tall, one front at z = +2, its body continuing to −∞
along the road (x 6.5–9.1), window band with a passenger per seat (2 per 1.6 m).

**Light.**
| Setting | Value | Why |
|---|---|---|
| Sky / fog | night blue #0B1322 → horizon #1C2A44; exp² fog density 0.012 | the row fades to a vanishing point: infinity reads as "goes on past where you can see" |
| Room window, occupied | warm #FFD9A0, emissive, a point-light pool on the walkway every room near the camera | light = someone is home |
| Wall lamps | dim #FFC98A over each door | rhythm along the row |
| Moon | cool key #9DB4FF, 0.35, from frame right-back | rim on figures and bus roof |
| Neon | #FF4F6A, the sign's own light on the ground | the "full / not full" state |

**Colour meanings (fixed).**
| Colour | Means | Used on |
|---|---|---|
| Warm white #FFD9A0 | a room is taken | windows, resident figures (dim emissive) |
| Dark window | a room is free | — |
| Amber #FFB547 | the one we follow: the new guest, later the new number | figure, suitcase, its trail, the built number |
| Blue #7CC4FF | the bus's guests | bus windows, its passengers, their trails |
| Neon red #FF4F6A | "NO" on NO VACANCY: the hotel is full | the sign only |

**Camera rules.** 35 mm (vertical FOV 54.4°: frames 1.03·d tall at distance d). Home view: camera at (10, 3.2, 9)
looking at (0, 1.4, −22): the row climbs the frame diagonally from bottom-left to the vanishing point near
(520, 760); the road runs beside it. A guest at room 1 (~11 m) is ~300 px tall; room 10 ~110 px; room 60 ~20 px.

**Frame and safe areas.** Captions y 250–470. Lead in x 60–1020, y 520–1500; keep the right rail (x > 930, y > 1100)
free of text.

**Visual language: states.**
| Item | States | Look |
|---|---|---|
| Room | free → taken | window dark → warm (fades up 0.3 s), lamp pool on the walkway |
| Guest | resident / newcomer / bus guest | warm-white / amber / blue capsule figure |
| Move | one look for every move | the figure lifts, travels along an arc with a short light trail in its own colour, lands at its new door with a soft bob |
| Sign | full / room free | "NO" lit red / "NO" dark (flicker off), "VACANCY" stays lit |
| Number (part 2) | plain / digit picked / built | plate digits warm white / the picked digit lifts in amber / the new number in amber |

**Thread.**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| The endless row (flythrough) | travel back to room 1 | the sign "NO VACANCY" | the lit windows |
| Sign | pan down the road | the amber newcomer walking up | the sign's red light on the road |
| Newcomer | stops at room 1 | every guest moving up one | the move wave starting at room 1 |
| Wave | travels to the horizon, returns | room 1 dark, "NO" off | the camera follows the wave and comes back |
| Room 1 | newcomer walks in | "NO" back on | the amber figure |
| Sign | the bus's headlights sweep in | the endless bus | headlights |
| Bus | guests jump n → 2n | odd rooms dark | the arcs |
| Odd rooms | blue guests stream in | the full hotel again | the blue trails |
| Full hotel | camera rises; guests turn into numbers | numbers above the doors | each figure dissolves into its plate |
| Plates 1–8 | travel along the row | the diagonal digits | the amber picked digit |
| Built number | walks the row | it has no room | the amber number |
| The row | pull back high | rooms as dots vs the solid line of every number | the row of lights |

---

## Beats (v0.1: stand-in times at 2.8 words/s)

| # | Voice | Start frame / action / camera | Lead | End frame |
|---|---|---|---|---|
| 1 | "Trying to picture infinity? Picture a hotel that never ends." | Frame 0: camera already flying fast along the walkway, 2.5 m up, past lit doors 1, 2, 3… numbers on the plates rising; the row runs into fog. Decelerates and pulls back out to the home view. | the endless row | home view, sign in frame |
| 2 | "It has endless rooms, and every room is full." | Each room's window lights in a wave racing from room 1 to the horizon; a guest steps out to stand at every door. The sign flickers on: "NO VACANCY", red "NO". | the wave, then the sign | all lit, sign on |
| 3 | "A new guest shows up. Where do they go?" | An amber figure with a suitcase walks up the road into the sign's red light and stops at room 1. Camera pans down to it. | amber newcomer | newcomer at room 1 |
| 4 | "Easy. Everyone moves up one room." | Every guest lifts and moves one door along, all at once; camera rides the wave (crane up a little) to see it ripple to the horizon. Labels over the first doors: "1 → 2", "2 → 3", "3 → 4". | the wave | everyone one door on |
| 5 | "Room one is free, so the new guest gets it." | Room 1's window is dark; "NO" flickers off. The amber guest walks in; the window lights amber-warm; "NO" relights. | room 1 | full again |
| 6 | "Now an endless bus pulls up, full of new guests." | Headlights sweep the walkway; a bus slides in along the road; its body never ends (into fog). Blue passengers in every window. | the bus | bus stopped |
| 7 | "Everyone moves to double their room number." | Every guest jumps along an arc from room n to room 2n (far ones fly high). Labels: "1 → 2", "2 → 4", "3 → 6". | the arcs | guests at even rooms |
| 8 | "One goes to two, two to four, three to six." | (continues 7) the camera follows guest 3's arc to room 6; odd rooms are left dark: 1, 3, 5 marked. | odd dark rooms | odd rooms dark |
| 9 | "Now every odd room is empty, and the whole bus fits." | "NO" goes dark. Blue guests stream from the bus into odd rooms 1, 3, 5… at once; windows light; "NO" relights. | the blue trails | full again |
| 10 | "So is every infinity the same size? No." | Turn: camera rises; the sign's "NO" pulses on the word "No". | the sign | — |
| 11 | "Try giving a room to every number between zero and one." | Each guest dissolves into a glowing number on its plate: room 1 "0.14159265…", 2 "0.50000000…", 3 "0.71828182…", 4 "0.33333333…", 5 "0.25000000…", 6 "0.61803398…", 7 "0.41421356…", 8 "0.86602540…", far rooms "0.…". Label "every number from 0 to 1". | the numbers | camera at room 1, close |
| 12 | "Then build a new number. Change the first digit of room one, the second digit of room two, and so on forever." | Camera tracks along rooms 1–8; in each, the nth digit lifts amber, changes (+1), and flies up to build the new number in the top band: 0.2 1 9 4 1 4 6 1… | the amber digits | the new number built |
| 13 | "Your new number is different from every number in the hotel. So it has no room." | The amber number walks the row; at each door the digit where they differ flashes; every door stays shut. "NO VACANCY" lit. | the amber number | it stands outside |
| 14 | "Some infinities are bigger than others. Even an endless hotel is too small for them." | Pull back high: the rooms become a dotted line of lights ("rooms 1, 2, 3…"); a solid amber line of light floods in along it, filling every gap and more ("every number from 0 to 1"). Hold 1.5 s. | dots vs line | end |

Numbers on the plates are real numbers in (0, 1) people may recognise: π − 3, 1/2, e − 2, 1/3, 1/4, φ − 1 (golden ratio
− 1), √2 − 1, √3/2. Diagonal digits 1, 0, 8, 3, 0, 3, 5, 0, each +1 → new number 0.21941461… (no 9 → 0 wrap and no
trailing 9s, so the new number has one decimal form).

## Captions
Sense units; key words in amber: [infinity], [full], [one room], [double], [the whole bus fits], [No], [bigger].

## Sound cue list (CC0 cstack set or synthesized)
Night ambience (crickets-free soft wind, distant road hum), neon buzz under the sign and its flicker (synth),
door-light "on" ticks (soft, pitch rising along the wave), the move whoosh (soft air, one per wave, not per guest),
footsteps for the newcomer (CC0), bus engine idle and air-brake hiss (synth), arc whooshes (doubling), digit lift
(soft glass ting rising), the built number's steps (soft ticks), a low swell on the pull back.

## Claims to verify (fresh agent, before the board)
1. A hotel with infinitely many rooms, all full, can fit one more guest if each guest moves from room n to n + 1
   (Hilbert's paradox of the Grand Hotel).
2. It can fit infinitely many (countably many) new guests if each guest moves from n to 2n, freeing the odd rooms.
3. "Every odd room is empty" after the doubling.
4. Not every infinity is the same size: the numbers between 0 and 1 can't all be given rooms (uncountable; Cantor).
5. The diagonal construction: changing the nth digit of room n's number builds a number different from every listed
   number (with a rule avoiding 0.999… = 1 issues).
6. "Some infinities are bigger than others."
7. The plate numbers: π − 3 = 0.14159265…, e − 2 = 0.71828182…, φ − 1 = 0.61803398…, √2 − 1 = 0.41421356…,
   √3/2 = 0.86602540….
8. Hilbert introduced the hotel in a 1924 lecture; Gamow popularised it (1947); Cantor's diagonal argument 1891
   (caption only).

## Fact check and concept judge (fresh agent, 2026-11-25)
Opened: Wikipedia "Hilbert's paradox of the Grand Hotel" and "Cantor's diagonal argument", MathWorld "Cantor Diagonal
Method"; digits recomputed. Holds: plates, the diagonal 0.21941461…, n → n+1, n → 2n (odd rooms free; passenger k
→ room 2k−1), "some infinities are bigger". Rule written as: each diagonal digit replaced by a different digit, never
0 or 9 (the built number then has one decimal form). Caption dates: Hilbert 1924–25 lectures, Gamow 1947, Cantor 1891.
Changes taken (v0.2, `vo/lines.json`):
- Hook → "This hotel is full, but it still has room for you." (the paradox in 3 s; the title rides on screen).
- "moves up one room" → "moves to the next room" (not upstairs).
- "So is every infinity the same size?" → "So can every endless crowd fit in?"
- The numbers arrive as a last bus of guests after a checkout wave empties the hotel (guests turning into numbers
  implied they had been numbers all along).
- The digit is copied up, "+1" shown, the plate unchanged; mismatches shown as "1 ≠ 2" side by side.
- Added "However you fill the hotel, some numbers are left out." Picture: the numbers reshuffle and each time a new
  amber number is left outside. The v0.1 ending (a line of light filling the gaps between rooms) was cut: it implied the
  left-out numbers are the ones between the rooms, which is false (the rationals are dense and all fit).

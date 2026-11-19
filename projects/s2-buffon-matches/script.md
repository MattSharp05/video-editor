# s2 Buffon's matches: script (v0.2, picture-first)

**Idea:** drop matches as long as the floorboards are wide and about two in three land across a crack (exactly 2/π
on average), because a hoop as wide as a board always crosses the cracks twice and is π matches long; so counting
crossings measures π. **Goal:** reach (saves, shares). **Format:** Reel 1080×1920, 30 fps, ~43 s. **Voice:** m5,
stand-in 2.8 words/s.

Numbers are starting values; the board tunes them.

---

## Look sheet

**Style.** Realistic 3D (`styles/realistic-3d`, look pass: ACES once, warm window light, contact shadows, light grain
and vignette). A quiet wooden room in late-afternoon sun; then a vast empty hall floor.

**World and scale.** 1 unit = 1 cm. Oak strip floor, boards **d = 6 cm** wide running across the frame (cracks
horizontal on screen), dark 1.5 mm gaps between boards (the cracks). Matches **L = 6 cm** (= d): pale wood stick
2.4 × 2.4 mm, a 4 mm red-brown head (#7A2A1E). Copper wire 1.4 mm thick (#C87A4A) that bends into a hoop **6 cm
across**. Hall: the same floor, 8 × 8 m, 20,000 matches.

**Seeded run (honest numbers).** mulberry32 seed 1777, chosen before the result was seen. Centres uniform, angles
uniform in [0, π). First 200: 137 cross (68.5 %), π estimate 2.92. 1,000: 3.06. 5,000: 3.136. 20,000: 12,704 cross
(63.5 %), 2 × 20,000 ÷ 12,704 = **3.1486**. Theory: 2/π = 63.66 %.

**Light.**
| Setting | Value | Why |
|---|---|---|
| Key | sun through a window, 18° above the floor from frame top-left, #FFD7A0 | long match shadows make them read as 3D sticks, not lines |
| Window pattern | soft bars of light on the floor (gobo), 60 % contrast | the room is real; the pattern is the background world |
| Fill | hemisphere #B8C8E0 / #4A3424 at 0.35 | shadows stay wood-brown, not black |
| Hall | high clerestory light, cooler (#FFE8CC key, fog toward the far walls) | a change of world on the cut |

**Colour meanings (fixed).**
| Colour | Means | Used on |
|---|---|---|
| Amber #FFB547 | a crossing: a match (or the hoop) over a crack | a glow along the crack under the match, the match's rim light, crossing dots, counts, the answer |
| Ice #8CCBFF | a measurement | the ticks showing match length = board width, the "π matches" ruler |
| Wood, copper, red heads | neutral | everything else; non-crossing matches dim to 70 % at the reveal |

**Camera rules.** 35 mm (vertical FOV 54.4°: frames 1.03·h tall and 0.58·h wide at distance h). Rain: h ≈ 70 cm,
pitched 55° down (frame ~40 cm across, a match ~160 px). Close measure: h ≈ 25 cm (a match ~450 px). Hoop: h ≈ 35 cm
(the 18.85 cm straight wire needs ≥ 22 cm width). Hall: crane from 1 m to 9 m (a match ~12 px: the floor turns to a
woven amber texture). One hard cut, room → hall, on "Turn that round".

**Frame and safe areas.** Captions y 250–470. Lead in x 60–1020, y 520–1500. Counts and labels sit in that band.

**Visual language: states.**
| Item | States | Look |
|---|---|---|
| Match | falling → landed → crossing / clear | falling: spins, slight motion blur; landed: bounces once, settles with a shadow; crossing: amber glow on the crack under it + amber rim; clear: dims to 70 % |
| Crack | dark → lit | an amber segment where a match crosses it |
| Hoop / wire | straight ↔ bent; landed | copper; each crossing point gets an amber dot |
| Count | — | amber numerals standing on the floor (in-world, lit) |

**Thread.**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| Rain of matches | push in | the measuring match at the floor's edge | one match landing square |
| Measuring match | pull back | the whole floor | the ice ticks fading |
| The 200 matches | sort | two rafts, 137 amber vs 63 | the matches themselves |
| Rafts | travel (camera) | a straight copper wire beside them | the amber glow |
| Wire | bend | the hoop | the wire |
| Hoop | drop ×4 | two amber dots each time | the hoop |
| Hoop | straighten | a wire π matches long beside 3 matches + a 0.14 stub | the wire |
| Wire's two dots | flow | the 3.14 matches, each filling 64 % amber | amber light |
| Room floor | hard cut | the hall floor | the same floor and amber |
| Hall | crane up | the count 3.15 vs π | the amber carpet |

---

## Beats (v0.2: after the fact-check and the concept judge; times from the aligned VO)

| # | Voice | Start frame / action / camera | Lead | End frame |
|---|---|---|---|---|
| 1 | "Drop matches on a floor, and counting them can find pi." | h 70 cm, 55° down. Frame 0: matches already falling through the sunlight; 200 land over 3 s, plain (no amber yet: the answer is not given away). Camera sinks 70 → 62 cm. | the rain | 200 matches settled |
| 2 | "Each match is exactly as long as a floorboard is wide." | Push in to the floor's near edge (h 25 cm): one match lies square across a board, head on one crack, tail on the next; ice ticks drop on its ends and the cracks; ice label "match = board". | the measuring match | ticks fade |
| 3 | "What share land across a crack?" | Two matches beside it: one lies over a crack, its crack lights amber, label "crosses"; one lies inside a board, dims, label "misses". Pull back to the whole floor (h 65 cm). | crosses vs misses | the 200, plain |
| 4 | "Pause and guess." + 1.5 s | Slow orbit 8°; the window light's shadows creep; the last match rolls and stops with a tick. | the 200 | — |
| 5 | "Most of them: about two in three." | Crossers light amber in a wave from the top; misses dim. All 200 lift and slide into two rafts: amber 129 and dim 71, counts at their ends ("129 cross", "71 miss"). | the amber raft | rafts settle |
| 6 | "Here's why: bend a wire into a hoop as wide as a board." | Camera travels right (h 35 cm); a straight copper wire (18.85 cm) bends into a hoop 6 cm across. | the wire | hoop lifted |
| 7 | "Wherever it lands, it crosses the cracks twice." | The hoop drops four times (different places); each landing lights two amber dots where it crosses a crack; "2" each time. | the dots | hoop down, "2" |
| 8 | "Straighten it: it's pi matches long." | The hoop unbends into a straight wire; three matches slide in beside it end to end plus an ice stub 0.14 long; ice ruler "π matches". | wire vs matches | row of 3.14 |
| 9 | "Cut it into matches and scatter them: still two crossings, on average." | The wire snaps into 3 match lengths + the stub; the pieces scatter and land three times, amber dots where they cross (seeded); label "bent or straight: 2 on average" (the average of 1,000 seeded scatters, computed). | the scattered pieces | pieces down |
| 10 | "So each match has a two-in-pi chance: sixty-four percent." | The row of 3.14 matches returns; "2 ÷ π = 64 %" builds over it (the two amber dots slide onto it). No part-amber matches. | 64 % | — |
| 11 | "Count the crossings, and you can estimate pi." | **Hard cut** to the hall (h 1 m, along the floor): matches rain across the hall, crossers amber; the formula stands up: "π ≈ 2 × matches ÷ crossings" with live numbers from the run (200: 3.10, 1,000: 3.14, 5,000: 3.13). Camera cranes up. | the amber carpet + count | 9 m up |
| 12 | "Twenty thousand matches: three point one four." | Count settles at 20,000 / 12,723 → 3.144; ice "π = 3.14159" beside it. Slow push. End hold ~1.5 s. | 3.144 | end |

Seeded run used by the film (`film/src/sim.ts`, printed by `film/sim_report.mts`): first 200: 129 cross (64.5 %),
π estimate 3.10; 1,000: 3.140; 5,000: 3.125; 20,000: 12,723 cross (63.6 %), 3.1439. (The v0.1 numbers came from an
uncommitted snippet with a different draw order and are void.)

## Captions
Sense units in `film/src/Film.tsx`; key words in amber: [pi], [two out of three], [twice], [sixty-four percent],
[three point one five].

## Sound cue list (CC0 cstack set or synthesized)
Room tone (synth, faint birds-free hush), match taps (tile-clicks / card riffle, short, pitched, density following the
rain), measure ticks (soft glass-ting), crossing wave (rising shimmer), rafts sliding (paper slide, filtered noise),
wire bend (synth creak), hoop drops (metal tick, two pings per landing for the two dots), unbend, the flow (shimmer),
whoosh-deep peaking on the cut, the hall rain (dense soft patter), count ticks.

## Claims to verify (fresh agent, before the board)
1. With matches as long as the boards are wide, the chance a match lands across a crack is 2/π ≈ 63.7 % (Buffon).
2. "Most of them: about two out of three" (shown: 137 of 200 in our run).
3. A hoop whose diameter equals the board width crosses the cracks exactly twice wherever it lands (almost surely).
4. The hoop's circumference is π board-widths = π match lengths.
5. "On average, only length counts" (Buffon's noodle / Barbier: expected crossings proportional to length for any
   rigid curve).
6. "Each match gets two out of pi: sixty-four percent."
7. Counting gives an estimate of π: 2 × matches ÷ crossings; our run of 20,000: 3.15 (3.1486).
8. Buffon (Georges-Louis Leclerc, Comte de Buffon) posed it in 1733 and published 1777 (caption only).

## Fact check (fresh agent, 2026-11-19)
Opened: Wikipedia "Buffon's needle problem" and "Buffon's noodle", MathWorld "Buffon's Needle Problem", Barbier 1860
(numdam, JMPA 2e sér. t.5, 273–286). Not opened: Buffon 1777 itself (dates via MathWorld and Wikipedia).
Holds: equal length (spacing measured crack centre to crack centre), "most / about two in three" (2/π = 63.7 %), the
hoop crossing twice (one crack, twice; tangency has probability zero), π matches long, length-only on average (Barbier).
Reworded: "they'll work out pi" → "counting them can find pi"; "each match gets two out of pi" → "each match has a
two-in-pi chance" (an expected count equals the probability only because a match crosses at most one crack);
"the floor counts out pi" → "you can estimate pi". It could not reproduce v0.1's numbers: the generator is now
committed (`film/src/sim.ts`) and the film's numbers come from it. Crossing is decided from crack centre lines; the
measuring match (beat 2) is not lit as a double crossing.

## Concept judge (fresh agent, 2026-11-19): approve with changes
Taken: no amber before the question (plain rain; amber introduced on one "crosses" vs one "misses" match); name the
ice device ("match = board"); picture "only length counts" as an event (the wire cut into matches and scattered, the
average shown); no part-amber matches (64 % as "2 ÷ π" over the row); build the formula on screen and run the count
slower; the shown share now equals the theory (64.5 % from the committed run). Ending CTA in the caption ("try it
with toothpicks"). Not taken: a loop back to the rain (the end holds on the result).

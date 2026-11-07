# Stolen Smile 3: "The return": build plan

Builder session for part 3 of 3. Unattended (Matthew asked for no approval gates); every decision is noted here.
Inputs: `../lines.txt` (locked), `../../stolen-smile-kit/pictures-pick.md` (series beat sheet, §4 Part 3),
`research.md`, `factcheck.md`, `film-kit/` (shared look, adopted at READY; commit noted below).

## Format
1080×1920, 30 fps, one continuous camera, 70–89 s including tail (SERIES-BRIEF), last word + ~1.2 s.
Toy-theatre paper look from the kit (tokens, SeriesGrade, CameraRig planes, captions, cards). No three.js.

## Decisions (with reasons)
- **No "500,000 lire" on the stack.** The script says "a huge pile of money"; BUILD-BRIEF says every on-screen number
  must equal the narration, and the factcheck notes the sum is Geri's account only. Band reads "Lire".
- **No "December 1913" calendar** at the arrest for the same reason (not narrated; the arrest date is disputed 11/12 Dec).
- **No "secretly" picture** (the factcheck removed it): Poggi carries the giant magnifier openly; the gag is
  its size, not hiding it. Geri's wink stays (he *pretends* to buy).
- **Line 9 honesty tag** "He said this" (script: "He said … He said …"), not "He believed this".
- **Line 10** keeps "and a French king bought her": a small paper king with a crown receives her at the end of
  Leonardo's arrow and hands over a coin purse. Tag "Illustration".
- **Captions** use the kit's caption strip (bottom, y 1480), not BUILD-BRIEF's top-safe-area look: the series look wins
  (SERIES-BRIEF "same caption style"); the strip stays inside the Reels safe area.
- **Music level**: the series setting (+12 dB, the moon-tides duck) for continuity; measured 8.6 dB under the voice
  (1–4 kHz, voiced windows) and 4.5 dB up in the pauses.
- **Carrier pushes** are built as camera dives (zoom ≥4.5 into the carrier) + a 0.2 s fill of the carrier's colour at the
  swap (silk red, note green, door blue, trunk, amber, stamp red, chalk white, route amber, Paris red ring, calendar/card).
  The kit's `<CarrierPush>` is DOM-based (screen-space); my scenes are one SVG camera each, so the dive is done in-camera.
- Everything else follows the pick's beat sheet; any swap is noted under "Swaps".

## Kit adoption
- 20:47 first snapshot (45d7521: cast, Mona Lisa, cards, captions, grade) copied into `src/series/`.
- 20:55 re-copied at 16bed4d (props, sets, sound); scenes switched to kit sets: SalonCarre, GeriDesk, PrisonCell,
  ModernLouvre, PaperMap; props Hooks, QuestionMark (straighten → "!"), FameGauge, Calendar, Trunk, Letter, Magnifier,
  Newspaper, Postcard, Stamp; sounds via `series_sfx.build_sfx` with series.json gains.
- 20:59 **READY ce6aa37** re-copied (series/, public kit + fonts + monalisa.jpg, sound/). Compiles unchanged.
- Part-only (built here in the kit style, `src/p3/`): Poggi, Leonardo, the French king, two workers (kit `Puppet` + Look);
  hotel front, door 20, top-down trunk interior with false bottom and red silk, lira stack, crack pattern + "Louvre photo"
  reference card, handcuffs-free arrest (the "!" carries it), tour poster, pop-up galleries, eraser, doors, ink map of Florence,
  red ribbon, pigeon.

## Visual language (state → one look, whole film)
| State | Look |
|---|---|
| She is here (visible or hidden) | amber glow (`amber`/glow token); amber leak from what hides her (trunk crack, red silk) |
| She reacts | `glint` 4-point star on her eye + `glint` sound; halo brightness = fame (smile meter) |
| The question / clue | `clueRed`: the "?" (part 2) → falls and straightens into "!" (line 8), stamps ("Real!"), chalk "stolen?" |
| Words you read | `card` strips/tags, Special Elite; first naming of a person = swinging luggage NameTag |
| Old things / furniture | `sepia`; frames and the fame gauge `oldGold` |
| The law / hidden / dark | `nightBlue` (police uniforms, cell shadow) |
| Hung on the hooks | clink + number tag 1–4, identical to part 1 line 7 |
| Disputed / simplified | HonestyTag, Special Elite 28 px bottom-left, 2–3 s |
| Today | white phone flashes; 1911 → today is a sepia wash sweeping off (not a cut) |

## Thread (lead → move → next lead → carrier)
| # | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 1 | recap flats (hooks+web, "?" over Paris, letter) | push into the letter's ink drop | ink map of Florence | the ink drop (spreads) |
| 2 | red silk ribbon | travel down the ribbon, lowers TitleCard | Geri's desk | ribbon wraps the lira stack |
| 3 | lira stack | grows, camera tilts up past the Duomo | hotel steps | stack topples into steps |
| 4 | Geri + Poggi (giant magnifier) | travel up the steps | door 20 | the hotel stair / door |
| 5 | door "20" | open, push through | trunk | trunk lid up |
| 6 | red silk bundle | magician's pull; she is revealed | magnifier/loupe | the loupe descends on her |
| 7 | cracks under loupe | macro push, card match, board flip, stamp | handcuffs | stamp ring → handcuffs |
| 8 | the "?" (from part 2) | drops on Vincenzo, straightens into "!" | chalk | the "!" becomes chalk |
| 9 | chalk arrow on the map | Vincenzo draws Italy→France "stolen?" | eraser | eraser enters |
| 10 | Leonardo | walks the map, fixes the arrow to France, king | tour route | arrow → route line |
| 11 | tour route | pop-up galleries Florence/Rome/Milan, gauge climbs | Paris | route runs on to Paris, circled |
| 12 | four hooks | spider leaves, web swept, she is hung: clink 1–4 | gallery doors | doors burst open |
| 13 | crowd + gauge odometer | flood in, "100,000+", tiles pop | calendar tile | a tile shrinks into "7 months" |
| 14 | cell postcard | push into the postcard | real painting | postcard grows into her |
| 15 | crowd + art lovers | gauge glass pops; art lovers crushed | today | sepia wash sweeps off; phones rise |
| 16 | today's room, phones | push in (reverse of 1.1) | her smile | push through the flashes |
| 17 | her smile + ghost Vincenzo | long push into the smile; EndCard "The end" on the hooks | — | — |

## Beat → time map (src/beats.json, from the aligned VO; total 81.25 s = 2438 frames)
| beat | s |
|---|---|
| l0 | 0.25 |
| l1 | 4.63 |
| l2 | 8.47 |
| l3 | 13.99 |
| l4 | 19.93 |
| l5 | 24.21 |
| l6 | 29.53 |
| l7 | 35.38 |
| l8 | 38.67 |
| l9 | 45.38 |
| l10 | 51.47 |
| l11 | 56.33 |
| l12 | 61.72 |
| l13 | 65.86 |
| l14 | 68.87 |
| l15 | 72.41 |
| l16 | 75.89 |
| florence | 2.29 |
| leonardo | 3.21 |
| title | 4.54 |
| part | 6.42 |
| alfredo | 9.23 |
| money | 12.39 |
| pretends | 14.55 |
| expert | 17.07 |
| hotel | 18.18 |
| room | 20.07 |
| thin | 21.41 |
| opens | 22.51 |
| trunk | 23.29 |
| lifts | 24.32 |
| underneath | 26.11 |
| silk | 27.11 |
| mona | 28.04 |
| cracks | 30.53 |
| seal | 32.45 |
| real | 34.35 |
| police | 35.27 |
| vincenzo | 37.35 |
| why | 38.57 |
| italy | 41.43 |
| stolen | 43.95 |
| nottrue | 45.65 |
| leo | 47.24 |
| france | 48.37 |
| king | 49.98 |
| tour | 51.37 |
| showsoff | 52.79 |
| crowds | 54.47 |
| jan | 57.12 |
| wall | 59.56 |
| paris | 60.47 |
| twodays | 62.04 |
| hundred | 63.68 |
| jail | 65.77 |
| seven | 67.11 |
| famous | 70.91 |
| today | 72.31 |
| millions | 73.33 |
| year | 74.69 |
| stole | 76.43 |
| smile2 | 78.57 |
| end | 79.95 |
| total | 81.25 |

## Swaps
- 3.7: the crack "match" is a red-lined reference card ("Louvre photo") sliding over the drawn cracks (the pick's idea,
  without a fingerprint overlay); the magnifier sits on the lower right of the panel, never over her face.
- 3.8: handcuffs dropped; the police reach and the "?"→"!" carry the arrest (cleaner, one lead).
- 3.13: crowd from above in the shape of a smile skipped (cost); the flood through the doors + popping odometer tiles carry it.
- 3.17: the end card is pinned under her face in today's room (no hooks there), not hung on the four hooks.

## Timeline (machine clock, UTC)
- 20:30:38 start; VO job + music download started in background; briefs read.
- 20:37:21 pictures-pick.md landed (pull); read.
- 20:40 VO done (17/17 MATCH, 81.25 s); beats.py; committed.
- 20:47 kit first snapshot; 20:52 first stills sheet (all beats); 20:57 second sheet on kit sets.
- 20:58 quarter-scale preview started; sound mix + cues written.
- 20:59 kit READY ce6aa37 adopted.
- 21:02 preview 1: motion_check movers median 17 vs bar 18; flagged 2, 10-12, 28, 41-43. Redesign: recap twinkling
  windows/stars/birds; Geri desk stack starts early + pigeon flock; amber motes from the silk; map clouds + gulls + bubble crowd.
- 21:07 preview 2: median 17; flagged 2, 10, 41-43. Redesign: the letter writes itself with a quill; Geri lifts and reads the
  letter, camera pushes in, pigeons strut on the sill; her copy hops Paris -> Italy with a heart; camera push on the map.
- 21:12 preview 3: **median 18 = bar**; flagged 2, 41. Drapes sway + ink motes in the recap; bubble earlier and larger.
- 21:16 mute render (0.4 scale, captions off) -> 2 fps sheets -> fresh judge 1; preview 4 started.
- 21:22 preview 4: **movers median 19 vs bar 18**; flagged only second 28 (the silk-pull reveal: one big cloth leaving
  and a light flood; it has amber motes, two leaning heads and the camera rise; kept as defensible).
- 21:22 mute judge 1 (fresh agent, 2 fps captions-off sheets). Recovered: recap (empty hooks, ?, letter "Leonardo"), title,
  Geri + money, hotel, Poggi as museum expert, room 20 + white trunk, false bottom + Mona Lisa, cracks/seal/"Real!", arrest
  of Vincenzo, his claim and its erasing, Leonardo carrying her to France, the Italy tour, January 1914 back on the hooks,
  100,000+ in 2 days, about 7 months in jail, "She's back!", millions every year.
  Missed / unsure -> fixes: letter's destination (tag "Florence, 1913" on the letter); what the money means (tag "He wants:"
  on the pile); "pretends to buy" (tag "Pretend buyer" on Geri's air-handshake); the red silk read as a curtain (tied cord +
  knot + tag "red silk"; tag "false bottom" on the board); "bought" unclear (coins on the purse + tag "bought"); the ghost
  unnamed (name tag "Vincenzo"); the payoff (museum wall label "The most famous smile in the world" above her).
- 21:24 full render started (3 chunks, crf 18).
- 21:53 delivered; REPORT.md written.
- 22:00 v1.1 fixes from the continuity judge; 22:14 full re-render, motion PASS (median 20), 2438 frames, -14.2 LUFS / -1.8 dBTP.

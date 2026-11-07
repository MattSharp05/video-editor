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
- Everything else follows the pick's beat sheet; any swap is noted under "Swaps".

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

## Beat → time map
(filled from `src/beats.json` once the VO is aligned)

## Swaps
(none yet)

## Timeline (machine clock, UTC)
- 20:30:38 start; VO job + music download started in background; briefs read.
- 20:37:21 pictures-pick.md landed (pull); read.

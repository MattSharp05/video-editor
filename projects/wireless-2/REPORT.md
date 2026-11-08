# Caught by Wireless, Part 2: "The chase": report (v1)

**Final file:** `projects/wireless-2/renders/wireless-2_v1.mp4`. It is git-ignored and was delivered with SendUserFile.
- 1080×1920, 30 fps, **2556 frames = 85.20 s**. The last word ends at 82.77 s, followed by a 2.45 s tail for the end card. That is inside the series range of 70–89 s.
- **Loudness:** −14.0 LUFS integrated, **−2.6 dBTP** true peak, LRA 2.0 LU. Measured on the MP4 with `ebur128=peak=true`.
- **motion_check vs `lab/motion-bar/grand-canyon-01_q.json`: PASS** on the final render, downscaled to quarter size:

| Measure | This film | Bar |
|---|---|---|
| Movers, median | 19 | 18 |
| Seconds with ≤2 movers | 0 % | 11 % |
| Nearly still | 36 % | 36 % |
| Change over 2 s | 0.49 | 0.36 |

**Kit:** film-kit READY **899f6dd** (READY d08d857 / 25550bc). Before READY I adopted the WIP 8883021 early. The kit-redraw lint (`film/lint_kit.sh` against `film-kit-EXPORTS.txt`) is clean.

## Stills (committed)
- `stills/sheet_1fps.jpg`: 1 fps contact sheet of the final.
- Hero stills:
  - `stills/hero_3.9s.jpg`: the plaque burns in over the recap page with panels R1/R2.
  - `stills/hero_43.5s.jpg`: "could this be him?". The captain holds the WANTED poster up, with the hunch bulb lit.
  - `stills/hero_84.9s.jpg`: the "pilot" at the rail, the Feather tip ringed, and the end card "NEXT: THE VERDICT".
- Recap stills for part 3 (pick §2.6):
  - `stills/R4.jpg` (71.5 s): race map, the Laurentic token past the Montrose token, which carries the Moustache.
  - `stills/R5.jpg` (80.6 s): rope ladder, the pilot climbing, and the bowler-shaped shadow on the hull, ringed.

## Checks
| Check | Result |
|---|---|
| VO | AI clone design-m2, seed 7 (`gen_vo.py all 7`). All 16 lines MATCH and no words.json fixes were needed. The gaps were not tightened: the voice came in at 82.8 s. |
| Plaque by 4.0 s | Kit TitlePlaque, at = 72. The burn settles at 4.0 s and the corner tab shows from frame 0. |
| Labels above captions | Honesty tags sit at y 1170–1250. The captions are the kit's (y 1300–1470). |
| Colour floods | None. Hand-offs are 9-frame push-throughs (a circle reveal from the carrier), so the frame is never one flat colour. |
| Real artefacts | None are used in this part, so nothing is covered. |
| Mute test 1 | A fresh agent saw captions-off sheets at 2 fps. Recovered: the whole chase. Missed: the recap panels, what the clue rings mean, the tin-can "no wires" gag (it was off camera), the link between Ethel and the doctor, and the pilot reveal (the shadow read as a ghost). |
| Fixes | Labels on the recap panels. Mirror name plates: "The doctor" and "Ethel, his typist". Clue labels: "baggy suit", "cap too big", "holding hands". The camera now frames the tin cans, with a "still talking!" label. The shadow on the hull is a flat bowler silhouette, and ClueRings sit on the shadow and on the Feather tip. The end card now comes after the last word, so it no longer hides the climber. |
| Mute test 2 | A second fresh agent saw the reworked shots. It recovered the recap (partly: the cellar picture is small), Ethel and the doctor, the clues and "no wires". **The pilot reveal was still not recovered.** I added the rings and moved the end card after that judgement, and no third judge was run. |
| Frame 0 | A legible cover that is already moving: a close-up of the Daily Wire masthead with the porthole engraving and the Spark circling it. |
| Last second | The end card is fully typed with the spark cursor. The pilot sits below it. No black frames and no blur. |
| Frame count | 2556 = round(85.20 × 30). Four chunks were joined with the concat demuxer, and the audio was muxed with `apad` and `-t`. |
| Temporal | I checked 30 consecutive frames at 60 s (Dew's leap): no popping or sliding. Every YAVG jump over 8 falls on a push-through hand-off: 16.8, 24.0, 50.4 (into the dark wireless room, −47), 52.7, 58.1, 65.9, 69.4 and 72.5 s. |
| Music under the voice | At the series +12 dB, the music was only 8.4 dB under speech (broadband, speech windows), so I set it to **+10 dB**, about 10 dB under. Parts 1 and 3 may differ by 2 dB here: check by ear. |

## What is synthetic or AI
- The voice is AI (a Qwen3-TTS clone of the approved design-m2 reference).
- All art is drawn in code with the series kit.
- Sounds:
  - The kit's series palette (CC0 plus synth, levels from `series.json`) drives 69 of the 90 cues.
  - Other cues come from the CC0 `library/sfx/cstack-cc0` library: whoosh, pop, creak, zap, clock, rope, and the ocean bed.
  - The rest are numpy synth: press, snip, pen, click, thunk, swat, dice, hop, the boat engine.
  - None of sfx-01–28 are used.
- Music: "Floating Cities", Kevin MacLeod (incompetech.com), CC BY 4.0.

## Instagram caption (draft)
> Part 2 of 3: The chase. 1910: the doctor shaved, his typist dressed as a boy, and a ship's captain got a hunch… then used a brand-new trick: a wireless message from the middle of the sea. 📡🚢
> Notes: Captain Kendall's observations are his own 1910 accounts (crew members also claimed they noticed first). The wireless message is paraphrased; its exact text is disputed. The "race" is simplified: the two ships never sailed side by side. Ethel Le Neve was later found not guilty.
> Voice: AI. Music: "Floating Cities" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0.

## Decisions and redesigns (times are UTC machine clock; full timeline in `film/PLAN.md`)
- **Kit swap at 04:00.** When READY landed, every shared set and prop was swapped in for my part-drawn versions:
  - DailyWire, WantedPoster, Montrose, Laurentic, Sea, MontroseDeck, WirelessRoom
  - ScotlandYard (outside and inside), Telegram, TickerTape, RaceMap, FatherPoint, PilotBoat, RopeLadder
  - ClueRing, HunchBulb, SeaBirds, Spark, Moustache, the cast and the cards
- **Part-only pieces** (in kit tokens):
  - the printing press, the street of WANTED tiles, the two mirrors, the Antwerp quay and passenger list
  - the tin-can phones, the Liverpool receiving hut, the Cornish lighthouse, the wireless hut on deck, three city skylines
  - Hughes, the Liverpool clerk and the sailor (on the kit Puppet)
- **The race is never shown side by side.** It stays on the race map and is tagged "Short version", following the factcheck caveat.
- **Deck stage.** It uses the kit MontroseDeck lifted 620 px, extended to the right with matching rail and planks for the tin-can gag. The wireless hut on deck is part-only.
- **Recap panels.** They are built from the kit sets: Hilldrop in snow with the Feather, CellarFloor, and the empty WantedPoster. Part 1 had no stills committed when I built them, so they follow the pick's R1–R3 rather than part 1's frames.
- **Motion.** The median went 14 → 16 → 18 → 19 across previews. The additions were strollers, pennants, outlined smoke, soap bubbles, sea-mist flecks, a clock pendulum, ripples on the map and more gulls.

## Open issues
- **Pilot reveal.** It is ringed now, but no third mute judge confirmed it.
- **Mirror shots, 17–23 s.** They are the stillest stretch, though they pass.
- **Hard brightness jump at 50.4 s.** The push-through into the dark wireless room is visible as a sharp drop.
- **Continuity findings from part 1.** None had arrived before this render. Apply them by partial re-render when they come.
- **Music level.** It is +10 dB here, not +12; see the music check above.

## Errors hit
- tsc errors in the kit WIP copy (fixed upstream in 899f6dd). The template `three-canvas`/`finish` files were removed.
- The lint flagged the template's `Layer`/`Captions` exports and my `Sea` wrapper; they were removed or renamed.
- `mix.py` needed the voice venv for soundfile, and the stems call had a wrong argument slice.
- One `rm` with a glob after `cd` was refused by the safety check; I worked around it without deleting.

## Production analytics (`film/analytics.py` over this session's transcript)
| Phase | min | responses | tools | edits | still batches | image reviews | out tokens | errors |
|---|---|---|---|---|---|---|---|---|
| Setup | 3.0 | 21 | 23 | 1 | 2 | 0 | 8542 | 1 |
| Build | 15.0 | 35 | 35 | 10 | 3 | 3 | 87905 | 1 |
| Kit adoption | 3.0 | 11 | 13 | 6 | 3 | 2 | 12501 | 1 |
| Review+motion | 17.0 | 56 | 54 | 14 | 5 | 6 | 47021 | 7 |
| Kit READY swap | 8.0 | 31 | 30 | 10 | 4 | 5 | 38269 | 1 |
| Render+deliver | 8.0 | 19 | 20 | 2 | 1 | 4 | 9911 | 1 |

# Caught by Wireless 2: "The chase" — build plan

Builder session for part 2 of 3. Follows `projects/BUILD-BRIEF.md`, `projects/SERIES-BRIEF.md` (70–89 s, hard ceiling
90 s, Stolen Smile lessons), `projects/wireless-kit/SERIES.md` (care rules) and the series pick
`projects/wireless-kit/pictures-pick.md` (look "Wireless Night", devices, part 2 beats). Script: `../lines.txt` (locked,
fact-checked; 16 lines). Unattended: every decision is recorded here.

## Timeline (machine clock, UTC)
| Time | Step |
|---|---|
| 03:22 | Start: branch checked out; VO venv + `gen_vo.py all 7` + assemble + align started in background; music downloaded |
| 03:23 | Read BUILD-BRIEF, SERIES-BRIEF, SERIES.md, lines, factcheck (P2 caveats), research, Stolen Smile 2 plan/report |
| 03:24 | film/ scaffold (template + Stolen Smile 2 shell scripts), npm install, fonts (Abril Fatface, Old Standard TT, Courier Prime from google/fonts), stand-in timings: 89.5 s at 3.1 w/s (over; real VO decides) |
| 03:25 | pictures-pick.md landed and read; film-kit not started yet |

## Decisions
- **Script lines vs the pick.** The locked script has 16 lines; the pick's P2 L13 + L14 are one line here (l12:
  "Newspapers everywhere wrote about the chase. But the doctor had no idea Inspector Dew was racing to get there first.").
  Line l9 says "a fairly new way to send messages", l7 "the 'son' tenderly held his 'father's' hand", l14 "on a big
  river in Canada", l15 "A man dressed as a ship's pilot". The pictures follow those words.
- **The race is never shown side by side** (factcheck caveat: the two ships never sailed side by side). l13 stays on
  the board-game race map (tokens, dice, date squares); the real ships are seen only one at a time. Tag "Short version".
- **Tags:** "As the captain told it" (l7), "Short version" (l10 ticker text, l13 race map). All at y ≤ 1250, clear of
  the corner tab.
- **Ethel** is never ringed as a suspect: the clue rings in l7 sit on the cap, the trouser cuffs and the held hands.
  She is calm and a little amused at the mirror.
- **Care:** "human remains" only in the VO of l0; the R2 panel shows lamps on a closed brick floor, nothing else.
- **Kit not started at planning time.** Part-only pieces (press, mirrors, razor, scissors, Antwerp dock, passenger list,
  tin-can phones, Liverpool hut, readers, dice) are built now in the pick's tokens. Shared cast/sets/devices get local
  stand-ins named `Tmp*` (never a kit export name) until `film-kit/READY`, then are swapped for the kit's.
- **Transitions:** push-through = the next stage is revealed inside a circle that grows from the carrier while the old
  stage zooms into it (≤ 10 frames), so there is never a colour flood.
- **Length:** VO + 1.25 s tail must land 70–89 s; if over, gaps.json pauses get tightened (no words cut).

## Visual language (one look per state)
| Thing | State | Look | Sound |
|---|---|---|---|
| Spark | the thing to follow / the wireless | cyan core + corona + trail | crackle; Morse beep per tap |
| Moustache | the doctor's identity (runaway) | `deep` moustache with wings when flying | flutter; click on landing |
| Feather | Cora's cause (Dew carries it) | `cora` plume (hatband, pennant, pocket tip) | soft glass chime |
| Daily Wire | news / time / race | newsprint page, Abril masthead | paper flip + thunk |
| Clue | noticed by the captain | `clue` ring drawn on in 8 frames | soft tick |
| Hunch | the captain wonders | `clue` outline bulb clicks on | click |
| Hand-off | push-through | carrier circle grows, old stage zooms | silent (Spark trail carries) |

## Thread (lead → move → next lead → carrier)
| # | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| l0 | porthole engraving | pull back | Daily Wire page + recap panels | the page itself |
| l1 | plaque + subtitle | travel | running letters → press | "The chase" letters sprint |
| l2 | press | pull back | WANTED mosaic | posters fly out |
| l3 | mirror tile | push-through | razor, Moustache bird | the mirror |
| l4 | Moustache bird | travel | second mirror, scissors | bird flies past |
| l5 | pair at gangway | crane up | funnel, Moustache perched | the hull |
| l6 | captain's cap | push-through | telescope circle | the lens |
| l7 | circle on hands | hold | clue rings | rings slide together |
| l8 | hunch bulb | — | Spark at masthead | bulb click → crackle |
| l9 | Spark | crane down aerial | wireless room | the Spark |
| l10 | Spark | ride | Liverpool hut → Dew's desk | the Spark |
| l11 | Dew's bowler | follow, crane up | race map tokens | the leap |
| l12 | flock of papers | ride | deck, Robinson reading | the flock |
| l13 | page → race map | push-through | lighthouse square | the token |
| l14 | lighthouse | drift | pilot boat at hull | the boat |
| l15 | ladder, pilot | push in | cap brim + end card | the brim |

## Timeline (cont.)
| Time | Step |
|---|---|
| 03:35 | VO done: 16 lines, all MATCH, 82.77 s last word → total 84.02 s (tail 1.25). No gap tightening needed. |
| 03:38 | Stages A–F built on stand-ins; first real-timing stills sheet |
| 03:39 | All 12 stages built (G ride to land, H Dew's desk, I dock → race page → flock, J deck chair, K race map, L Father Point) |
| 03:40 | film-kit WIP commit 8883021 found (no READY): adopted early: `src/series/` copied; cast via adapter (`cast.tsx` TmpPerson → kit characters, part-only people on the kit Puppet), kit Moustache, Spark, Grade, Captions, CornerTab, TitlePlaque, Subtitle, HonestyTag, EndCard |
| 03:43 | Quarter preview 1: motion_check median 14 vs 18; 13 flagged seconds |
| 03:44 | Sound mix written (`sound/mix.py`, 73 cues; CC0 library + numpy synth; kit sound palette not shipped yet). Music measured 8.4 dB under speech at +12 dB → set to +10 dB (~10 dB under, brief's 10–12) |
| 03:46 | Strollers, pennants, smoke; kit-redraw lint script (`lint_kit.sh`): template `Layer`/`Captions` exports removed → lint ok |
| 03:47 | Preview 2 (captions off): median 14, flagged 27 31 36–39 41 44 64 76. Mute test 1 (fresh agent, 2 fps sheets) |
| 03:49 | Mute-test fixes: recap panel labels ("Cora vanished", "The cellar", "He ran away"), mirror name plates ("The doctor", "Ethel, his typist"), clue labels ("baggy suit", "cap too big", "holding hands"), "still talking!" on the tin-can gag (the gag was off-camera: camera re-keyed), hull shadow with a bowler (was a see-through ghost), pilot now climbs the kit `climb` pose up the ladder to the rail, end card clear of his face; foreground life (porters, walkers, spray, foam) |

## Mute test 1 (fresh judge, captions off, 2 fps): claims
| Line | Claim | Recovered? | Fix |
|---|---|---|---|
| l0 | recap: Cora vanished, cellar, he ran away | partly (panels meaningless) | panel labels |
| l1 | title, part two: the chase | yes | — |
| l2 | description sent, pictures printed | yes | posters arrive sooner (12.5–15 s was empty) |
| l3 | shaved moustache, no glasses | yes | — |
| l4 | Ethel cut hair, dressed as a boy | yes, but not linked to the doctor | name plates on both mirrors |
| l5 | Mr Robinson and son, ship to Canada | yes | — |
| l6 | Captain Kendall watched closely | yes | — |
| l7 | clothes didn't fit, held hands | partly (rings unexplained) | ring labels |
| l8 | read about him, could this be him | yes | — |
| l9 | wireless, no wires | partly (pulse yes, tin cans unseen) | camera now frames the gag + "still talking!" |
| l10 | secret message to land | yes | — |
| l11 | Dew, faster ship | yes | — |
| l12 | newspapers everywhere; doctor didn't know | yes | — |
| l13 | ships raced for days | yes | — |
| l14 | river in Canada, small boat | yes | — |
| l15 | a pilot climbed aboard, not really a pilot | no (shadow read as a ghost) | flat hull shadow wearing a bowler + Feather tip |
| 03:51 | Preview 3: median 16, flagged 31, 76 → mist flecks, bigger strollers/gulls, soap bubbles, clock pendulum, ripples |
| 03:57 | Preview 6: motion median **18.0 vs bar 18.5**, no flagged seconds, ≤2-mover seconds 0 % (bar 11 %), still 42 % (bar 36 %) |
| 03:58 | Mute test 2 (fresh judge, reworked shots): recap labels, Ethel ↔ doctor, clues, "no wires" recovered; pilot reveal still missed and covered by the end card → ClueRings on the bowler-shaped hull shadow and on the Feather tip; end card moved after the last word (tail 1.25 → 2.45 s, total 84.0 → **85.2 s**); page flies sideways (not through the plaque) |
| 04:00 | **film-kit READY (899f6dd)** landed. Re-copied `src/series`, `public/{fonts,kit}`, `film-kit-EXPORTS.txt`, `sound/` → `film/sound/series/`. Swapped every shared set/prop the kit now ships: DailyWire (recap page with R1–R3 panels drawn from kit Hilldrop snow + Feather, CellarFloor, WantedPoster empty; race-map page; the flock), WantedPoster, Montrose, Laurentic, Sea (tiled), MontroseDeck (deck stage lifted 620 px; deck-chair stage native), WirelessRoom (+ WirelessKey taps, TickerTape), ScotlandYard outside (clipped) and inside, Telegram, TickerTape (Liverpool), RaceMap, FatherPoint, PilotBoat, RopeLadder, ClueRing, HunchBulb, SeaBirds. Lint: no local redraws. My `Sea` wrapper was renamed `SeaBand` (lint caught the name). |
| 04:08 | Full render (4 chunks of 700, concurrency 3) + mix (kit series_sfx for 69 of 90 cues) + loudness |
| 04:13 | Final: 2556 frames = 85.20 s, −14.0 LUFS, −2.6 dBTP; motion_check on the quarter downscale **PASS** (median 19 vs 18) |
| 04:15 | Stills (sheet_1fps, 3 heroes, R4/R5 for part 3), temporal check, delivered with SendUserFile; REPORT.md |

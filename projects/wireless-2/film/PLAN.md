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

# Stolen Smile 2: "The hunt" — build plan

Builder session for part 2 of 3. Follows `projects/BUILD-BRIEF.md`, `projects/SERIES-BRIEF.md` (length 70–89 s,
hard ceiling 90) and the series pick `projects/stolen-smile-kit/pictures-pick.md` (look, devices, beats).
Script: `../lines.txt` (locked, fact-checked). Unattended: every decision is recorded here.

## Timeline (machine clock, UTC, `date -u +%T`)
| Time | Step |
|---|---|
| 20:30 | Start: VO job (Qwen3 design-m2 clone, seed 7) and music download in the background; read briefs |
| 20:31 | film/ scaffold, npm install, stand-in timings (3.1 w/s → ~82 s), beats.py |
| 20:37 | pictures-pick.md landed; read |
| 20:38 | Plan written; building on own kit-style pieces until film-kit/READY |
| 20:40 | VO done: 18 lines, all MATCH except line 7 ("well-known" split by ASR: words.json fixed to the script word) |
| 20:49 | All 11 stages built on local pieces; first stills sheet (34 beats) |
| 20:51 | Kit core committed (45d7521, not READY yet): adopted early (cast, Mona Lisa, cards, captions, grade) |
| 20:53 | Sound mix written (stand-ins), then moved onto the kit's series_sfx gains when kit/sound landed |
| 20:58 | Quarter preview 1: motion_check median 16 vs bar 18; flagged s 40, 74 |
| 21:07 | Life added (pacing officers, clue notes, kettle steam, clocks, birds, pigeons, moths); flagged s 74 only |
| 21:08 | Mute test 1 (fresh agent, captions off, 2 fps sheets) |
| 21:10 | Kit READY (ce6aa37): re-synced series/ and sound/; swapped shared props and sets in |
| 21:15 | Mute-test fixes re-judged by a second fresh agent on the reworked shots |
| 21:19 | motion_check final preview: median 16 vs 18, flagged s 74; full render started (4 chunks) |

## Decisions
- **Kit not ready at planning time.** I build every scene in the pick's look (tokens copied from pick §1.1 into
  `src/look.ts`) with simple split-pin puppets, so the timing spine and part-only sets exist early. When
  `film-kit/READY` exists I copy `film-kit/src/series/` into `src/series/` and swap in the shared pieces (MonaLisa,
  Hooks, QuestionMark, FameGauge, Calendar, TitleCard, EndCard, CornerTab, Caption, NameTag, HonestyTag, SeriesGrade,
  Vincenzo, Crowd, Detective, Geri, sets). Kit commits copied: 45d7521 (early core) at 20:51, then **ce6aa37 (READY)** at 21:10 for `src/series/`, `public/{fonts,kit,monalisa.jpg}` and `sound/` (copied to `film/sound/series/`).
- **Captions follow the series caption look** (pick §1.5: torn card strip, baseline y≈1480) rather than BUILD-BRIEF's top
  band, because SERIES-BRIEF says the caption style comes from the kit and must match across parts. The strip stays
  above the bottom 420 px Reels zone (strip bottom ≤ 1500).
- **Mona Lisa** is the PD photo the pick names (Wikimedia Commons, C2RMF retouched, PD-Art); fetched at 960 px and
  saved 600×894 to `public/monalisa.jpg` until the kit's copy replaces it.
- **Script wording wins over the pick:** line 7 is "who later became a famous writer" → Kafka's tag reads
  "Franz Kafka (later a famous writer)"; line 11 is "never match it to him"; line 12 "body measurements" → drawer
  labels are measurements (Head: long, Arm: short, Ear: big); line 18 "signs it with the painter's name".
- **Honesty tags:** "Some say: a trunk" on the room (where she was kept is disputed); "Illustration" on postcards
  and the letter; "Illustration" on Picasso's face gag.
- No dates printed beyond the calendar years 1911/1912/1913 and "Day 1…7".

## Visual language (one look per state)
| Thing | State | Look | Sound |
|---|---|---|---|
| Mona Lisa | present (seen or hidden) | amber glow `#F2A93B` / leak from whatever hides her | `glint` when she "reacts" |
| Hooks | empty | four ink S-hooks, no glow | `hook-hum` low |
| The question | open | clueRed "?" with hook-shaped curl, hops | `question-plink` |
| Suspect | cleared | red rubber stamp "Not him" | `stamp` |
| Clue | found | dusted print pops ink-dark, card label | soft `paper-flap` |
| Person named | first time | card luggage tag on a string (Special Elite) | none |
| Time passing | tick | tear-off calendar page flies | `calendar-tear` |
| Fame | grows | gauge needle swings toward the globe | `gauge-ratchet` |
| Scene change | carrier push | camera pushes into the carrier until it fills the frame; new scene grows from it | `paper-flap` (quiet) |

## Thread (lead → move → next lead → carrier)
| # | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 1 | empty hooks + recap flats | transform | "?" | hooks twist into the "?" |
| 2 | "?" + title plaque | travel | magnifier | the magnifier swings, drops; lens shows boots |
| 3 | lens → doll's-house Louvre | open | calendar | calendar page tears to Day 7, flies |
| 4 | page → press front page | transform / pull back | paper birds over map | pages fold into birds; gauge to globe |
| 5 | bird → song sheet on lamp-post | travel | postcard stand | stand spins to the last card (empty wall) |
| 6 | postcard → real wall + queue | pass through | Kafka | camera slides down the queue |
| 7 | Kafka's pen line | transform | red string on pinboard | the line becomes the string |
| 8 | "?" hops photo to photo | travel | poet in cell, Picasso at lamp | "?" hop along string |
| 9 | stamps "Not him" | — | thumbprint card | "?" points at the last card |
| 10 | thumbprint on glass | pass through | maze → drawers | ridges straighten into drawers |
| 11 | drawer | open | Vincenzo's room | a drawer slides out: the room inside |
| 12 | trunk glow (hot/cold) | pull back | "?" over Paris | out through the window, up |
| 13 | "?" in the sky | tilt down | lit window → lid lifts, her face | the amber window |
| 14 | window light | pass through | hooks + web | window frame becomes the empty spot |
| 15 | web | travel | Missing poster | web glistens → poster fades |
| 16 | poster | transform | paper plane over map → envelope | a gust tears it off; flies south |
| 17 | envelope | open | letter, signature, ink drop | letter fills frame; end card |

## Beat → time (from `src/beats.json`; stand-in until VO aligns)
Lines l0…l17 start at the beats of the same name; stages switch at line starts minus ~0.4 s, with the carrier push
spanning the switch.

## Kit adoption (what is shared vs part-only)
- **From the kit (ce6aa37):** SeriesGrade (paper, grain, vignette, flicker, sepia), Captions, CornerTab, LastTime, TitleCard,
  NameTag, HonestyTag, EndCard; every person is the kit Puppet (Vincenzo, Detective, Police, Guard, Geri, ArtLover by
  role; part-only cast as kit `Person` looks via `look.tsx`'s adapter); MonaLisa (PD photo, eyes crop, glint); Hooks
  (empty / bend / web), QuestionMark, FameGauge, Calendar, Magnifier, Thumbprint, Trunk, Letter (+ envelope), Newspaper,
  Postcards, Spider; sets SalonCarre (drawn 140 px higher so her spot sits at y 900 here), LittleRoom (120 higher),
  GeriDesk, PaperMap (europe, Paris→Florence route); series sounds via `series_sfx.build_sfx` at the series gains.
- **Part-only, in the kit's tokens and line:** doll's-house Louvre, printing press + world map, cabaret stage + postcard
  stand, pinboard, interrogation lamp, cell door made of poem lines, the files wall, the window-of-seasons close-up,
  Missing poster, Rooftops. **Not swapped for lack of time:** my own prison cell, back staircase and Paris street
  (drawn in the kit tokens; the kit's `PrisonCell`, `Staircase`, `ParisStreet` exist and would be the continuity-correct
  choice in a revision). Part-only synthesized sounds: knock, door, camera flash, ink drop.
- Picasso's nervous "cubist" face is a part-only overlay on the kit head (honesty tag "Illustration").
- Mute test 1 asked for: a label on the press, a clean signature (the kit Letter replaced my glitching stroke text), and
  the alias made explicit ("Leonardo = the painter's name!" tag). Judge 2 recovered all three.

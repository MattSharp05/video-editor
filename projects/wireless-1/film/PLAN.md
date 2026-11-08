# Caught by Wireless · Part 1: The missing singer — build plan

Builder session (part 1). Inputs: `../lines.txt` (locked, 17 lines), `../../wireless-kit/pictures-pick.md` (look "Wireless
Night", devices, cast, §4 Part 1 beats), `SERIES.md` (care rules), `research.md`, `factcheck.md`, `BUILD-BRIEF.md`,
`SERIES-BRIEF.md` (70–89 s incl. tail, ceiling 90; Stolen Smile lessons). Unattended: every decision is made and noted here.

## Format
1080×1920, 30 fps, one continuous shot, total = last word + ~1.2 s (≤ 89 s). Remotion SVG/DOM, no three.js.
Captions: the kit's caption look (pick §1.5: block y 1300–1470, Morse dash), `captions` prop for the mute test.

## Decisions
- **Captions position.** BUILD-BRIEF says top y 250–470; the series pick (§1.5) puts them at y 1300–1470 and
  SERIES-BRIEF says the caption style comes from the kit. Series wins (same call Stolen Smile 1 made). Labels and honesty
  tags stay at y ≤ 1250, above the caption block.
- **Hand-offs** are push-throughs: the next stage opens inside the round carrier (a circular window that grows from the
  carrier's screen position while the old stage's camera pushes into it). No colour floods, no cuts.
- **Care rules.** The cellar is only a closed brick floor with lamp beams; nothing under it, ever. "human remains" is in
  the VO only; the headline says "CELLAR DISCOVERY". Ethel is a smiling young woman at a ball; the ClueRing sits on the
  brooch only, never on her. Cora is warm and lively throughout; no ghost.
- **L4 wording.** The pick's L4 still has the v0.1 "round glasses"; the locked line is "He wore glasses and had a big
  mustache" (factcheck). The door-plate word is "Dr. H. H. Crippen"? No: he could not practise as a doctor in Britain, so
  the plate reads "H. H. Crippen" and the honesty is carried by the voice ("everyone called Doctor Crippen").
- **L5 wording.** "said goodbye from the top of the front steps" (not a wave): Cora calls goodbye with one hand raised
  at the top step (a small raise, not a big wave).
- **L10.** "was seen wearing": Clara's opera glasses *see* the brooch (the seeing is the event).
- **L12.** "Chief Inspector Walter Dew": the notebook cover reads "Ch. Insp. W. Dew · Scotland Yard" only if the kit's
  Notebook text is a prop; otherwise the kit's text is used as is (noted at adoption).

## Visual language (state → one look; pick §1.1, §2)
| Thing | State | Look |
|---|---|---|
| The Spark | the thing to follow / carrier | `spark` point, 3-prong corona, trail; Morse tap = flash + beep |
| The Spark | hidden in the story | a glint on the doctor's lens, a glint in the brooch (nobody notices) |
| Cora / her cause | present | `cora` plume on her hat; after the goodbye, the Feather (Clara's flag → Dew's hatband) |
| Clue | spotted | `clue` ClueRing drawn on in 8 frames (wet-paint drips, the brooch); never a flood, never on Ethel |
| Doctor's stories | told | a story balloon / card with a painted picture; the paint is wet (clue drip) |
| Doctor's tell | lying / nervous | the Moustache: twitch (America), sob (died), wiggle (fuzzy), bristle (Dew), sweat (Story 2) |
| Time | passes | the kit WallCalendar page flips (February → March 1910; once more before Dew comes back) |
| Light | lamp | `lamp` peach glows only (windows, gas lamps, footlights, police lamps) |
| Name/place | first said | printed on the object (dateline 1910, BELLE ELMORE playbill, "39", HILLDROP CRESCENT, AMERICA, NEW SCOTLAND YARD, notebook, RAN AWAY, COAL, CELLAR DISCOVERY, WANTED) |
| Words | spoken | kit captions, Morse dash under the active word |

## Thread (lead → move → next lead → carrier)
| # | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 1 | Spark star in the night sky | ride down the telegraph wire, crane to the street | the newsboy's Daily Wire | the Spark |
| 2 | Spark on the paper (Montrose ad, portrait lasso) | ride up the wall | the BELLE ELMORE playbill | the Spark |
| 3 | playbill's lit stage picture | push-through | the music-hall stage (Cora sings) | the footlights |
| 4 | Cora's growing hat brim | tilt down its shadow | the small doctor | the brim shadow |
| 5 | the doctor's lens (Spark glint) | push-through | lit parlour window of 39 | the round lens glow |
| 6 | the goodbye, the Feather on the step | snow → day, hold | empty steps, calendar | the Feather |
| 7 | the flying calendar page | caught at the door | the doctor's balloons | the page |
| 8 | the wet drip / telegram / brow | travel | the friends' question balloons, fog | Clara's brow "?" |
| 9 | fog | parts on one sparkle | the brooch | the Spark glint |
| 10 | the brooch | pull-back | Ethel at the ball, Clara's opera glasses | the glint |
| 11 | the two lenses | push-through | Scotland Yard's two door lamps | round lenses |
| 12 | the Feather flag | hand-off | Dew's hatband, Dew walks to Albion House | the Feather |
| 13 | the doctor's pocket | push into the dark | the front doorway of 39 | the pocket |
| 14 | the dolls'-house section | crane down and up | front door | the lamp |
| 15 | the open door: steam | curls through the floorboards | the cellar | the steam |
| 16 | lamp beams on the closed floor | crane up through the house | the newsboy's board | the rising camera |
| 17 | the WANTED oval, empty | push-through | night sea, a porthole with the Spark; end card | the oval |
- 03:35 VO done: 17/17 MATCH, 84.41 s last word, total 85.61 s (2568 frames). No tightening needed (tighten.py dropped).

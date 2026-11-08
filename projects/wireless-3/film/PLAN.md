# Caught by Wireless 3: "The verdict": build plan

Builder session for part 3 of 3. Unattended (Matthew asked for no approval gates); every decision is noted here.
Inputs: `../lines.txt` (locked), `../../wireless-kit/pictures-pick.md` (§4 Part 3), `SERIES.md` (care rules),
`research.md`, `factcheck.md`, `film-kit/` (adopted at READY; commit noted below).

## Format
1080×1920, 30 fps, one continuous camera, 70–89 s including the tail (hard ceiling 90 s), last word + ~1.3 s.
"Wireless Night" look from the kit (tokens, Print/Halftone, Grade, FogBand, captions, cards). No three.js.

## Decisions (with reasons)
- **Script wins over the pick.** lines.txt (after the fact check) differs from the pick's P3 beat sheet: there is no
  "taken back to London" line (L6 merged into "Back in London, the doctor said he didn't do it…"); L8 says "an unusual,
  dangerous drug" (not "traces of a rare drug"); L12 says "wireless message"; L14 "people believed to be Cora's family";
  L17 is "And he was caught thanks to a sharp-eyed captain and a message sent through the air." So the final crane
  passes **two** stations (the captain's telescope with the hunch bulb = "sharp-eyed captain", the mast Spark = "a
  message"), not three, and the Feather tip touches the Spark star.
- **On-screen numbers equal the narration** (BUILD-BRIEF). Dropped from the pick: the poisons-book date "19 Jan 1910"
  (the line says "that winter": the chemist window shows snow and the book line reads "Hyoscine · H. H. Crippen"), the
  "November 1910" calendar (unnarrated, and it points at the execution), "Traces found" (the line no longer says
  traces: the card reads "Drug found"). Kept: the Daily Wire dateline "31 July 1910" (the series device; the date of the
  arrest in research.md) and "2007" (narrated). The archive box reads "Trial sample" (no year).
- **"The remains" is said twice** (L7, L8, locked script). Nothing is ever shown: the scales of Justice carry the
  evidence as objects only (closed bottle, clean striped cloth scrap).
- **Execution:** "put to death" is only in the voice. The picture: the jury leans, the foreman stands, the headline
  flips "GUILTY", the clerk closes the ledger, the court lamp dims. No prison, no rope, no judge's black cap.
- **DNA twist is never proof:** the jigsaw piece bounces off ("no match?"), then the two experts tug it; it never clicks
  in and never flies away. Tag "Some say…".
- **Ethel** walks out calmly into daylight; she is never ringed, never in the dock beside him.
- **"Good morning, Doctor Crippen."** balloon + tag "Illustration" (the exact words differ between sources).

## Kit adoption
(filled in when READY lands)

## Visual language (state → one look, whole film; from the pick)
| State | Look |
|---|---|
| Follow this / the wireless | `spark` cyan: the Spark, its trail, the caption's Morse dash, plaque rivets |
| Cora and her cause | `cora` rose: the Feather (hatband, bookmark, question mark, rising) and Cora's cameo |
| A clue / evidence | `clue` yellow ClueRing drawing on, label rims (bottle, pyjama label); never a flood |
| Light | `lamp` peach: court lamp, daylight through the doors, dawn; never a solid object |
| Words you read | `newsprint` paper: the Daily Wire, labels, balloons, tags |
| The law | `deep` silhouettes: judge, jury, the dock rail |
| Doubt | the Feather's question mark with the Moustache perched on its dot |
| Today | the modern sky: satellites and signal arcs in `mist`, the 1910 Spark the brightest |

## Thread (lead → move → next lead → carrier)
| # | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 0 | P2's brim close-up | pull-back: it is the R5 engraving on the Daily Wire, R4 panel slides in | plaque | the Spark taps C-B-W |
| 1 | subtitle strip | clerk's stamp thumps it; ripple lifts the engraved pilot's cap | the deck | push-through the R5 engraving |
| 2 | the pilot | cap lifts, bowler pops; Feather into the band | Dew walks | camera at his shoulder |
| 3 | captain's cabin | Robinson rises, balloon, Moustache flies in the porthole, click | his wide eyes | push-through a porthole |
| 4 | race-map tokens bump, flag; Ethel's cabin | policeman, she stands calmly | the dotted line | the line runs back east |
| 5 | token sails back, London rises, the dome | crane down through the dome into court | the scales | Justice's scales |
| 6 | the left pan | report card, snowy chemist, poisons book, bottle drops | right pan | the striped scrap drifts down |
| 7 | the right pan | scrap, shop front, drawer, stripes align, scales tip | jury | twelve heads lean in |
| 8 | jury | lean, foreman stands, GUILTY, ledger closes, lamp dims | door | daylight behind the ledger |
| 9 | Ethel | walks out into daylight, NOT GUILTY, pigeons | the sky | the Spark blinks above her |
| 10 | the Spark | pull-back: today's sky of signals | odd star | one star flickers |
| 11 | the Daily Wire | corkscrew twist 1910 → 2007 | lab | the twist unwinds into the lab |
| 12 | archive box | lid lifts; family tree, Cora cameo, piece bounces off | 2nd hand | a hand turns the piece |
| 13 | tug-of-war | two experts, padlocked CASE CLOSED box | the ribbon | bends into a question mark |
| 14 | the Feather "?" | Moustache on the dot; jury nods YES; experts argue | the Feather | it uncurls and rises |
| 15 | the Feather | crane up past Kendall's telescope + bulb, the mast Spark, to the star | end card | the Feather tip touches the star |

## Beat → time map
From the aligned VO (16/16 lines; ASR fixes "Dr"→"Doctor", "sharp eyed"→"sharp-eyed" in fix_words.py). Total 83.14 s = 2494 frames.

| beat | s |
|---|---|
| l0 | 0.25 |
| l1 | 7.20 |
| l2 | 11.50 |
| l3 | 14.88 |
| l4 | 19.71 |
| l5 | 24.88 |
| l6 | 31.31 |
| l7 | 38.56 |
| l8 | 42.57 |
| l9 | 48.38 |
| l10 | 53.12 |
| l11 | 57.30 |
| l12 | 59.86 |
| l13 | 68.31 |
| l14 | 73.17 |
| l15 | 77.88 |
| raced | 2.01 |
| pilot0 | 4.17 |
| climbed | 5.11 |
| title | 7.09 |
| part | 9.21 |
| verdict | 10.31 |
| really | 11.90 |
| dew | 12.56 |
| disguise | 13.72 |
| near | 15.62 |
| goodmorning | 18.00 |
| crippen | 18.66 |
| over | 19.81 |
| ethel | 21.87 |
| boy | 23.73 |
| london | 24.77 |
| didnt | 26.41 |
| trial | 28.09 |
| bailey | 29.61 |
| scientist | 31.21 |
| drug | 33.43 |
| remains1 | 34.19 |
| bought | 36.19 |
| winter | 37.39 |
| pajama | 39.70 |
| store | 40.37 |
| shopped | 41.30 |
| jury | 42.47 |
| guilty | 43.91 |
| death | 45.51 |
| law | 46.93 |
| ethel2 | 48.28 |
| notguilty | 50.87 |
| free | 52.06 |
| first | 53.36 |
| wireless | 54.46 |
| catch | 55.76 |
| twist | 58.02 |
| y2007 | 59.76 |
| sample | 62.46 |
| match | 65.42 |
| family | 67.02 |
| experts | 68.22 |
| wrong | 69.67 |
| reopened | 71.69 |
| didhe | 73.07 |
| yes | 74.73 |
| argue | 76.67 |
| caught | 78.00 |
| captain | 79.22 |
| message | 80.56 |
| air | 81.50 |
| end | 81.83 |
| total | 83.14 |


## Timeline (machine clock, UTC)
- 03:23 start; VO env install + music download in background.
- 03:25 TTS started (line 7 already carries the orchestrator's "And with them" care fix); briefs, pick, factcheck read; film/ set up from the template; stand-in timing spine (89.3 s).
- 03:33 VO done: 83.14 s total, 14/16 MATCH + 2 ASR spellings fixed; real beats.
- 03:35 first full stills sheet on placeholder cast (layout OK); sound mix draft (44 cues).

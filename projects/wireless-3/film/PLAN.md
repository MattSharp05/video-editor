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
(written from src/beats.json once the VO is aligned)

## Timeline (machine clock, UTC)
- 03:23 start; VO env install + music download in background.
- 03:25 TTS started; briefs, pick, factcheck read; film/ set up from the template; stand-in timing spine (89.3 s).

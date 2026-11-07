# The Stolen Smile · Part 1: The vanishing — build plan

Builder session: session_01WProZXRvhK5SwKUZiHT2oC. Inputs: `../lines.txt` (locked), `../../stolen-smile-kit/pictures-pick.md`
(look, devices, beats §4 Part 1), `research.md`, `factcheck.md`, `BUILD-BRIEF.md`, `SERIES-BRIEF.md` (70–89 s, ceiling 90).
Unattended: every decision is made here and noted, nothing waits for Matthew.

## Format
1080×1920, 30 fps, one continuous shot, total = last word + ~1.2 s (must be ≤ 89 s). Remotion SVG + DOM, no three.js
(series rule). Captions top safe area y 250–470 per BUILD-BRIEF (decision below), `captions` prop for the mute test.

## Decisions
- **Captions position.** The pick (§1.5) puts torn-card captions at y = 1480; BUILD-BRIEF says top safe area y 250–470.
  Series continuity wins for the *look* (the kit's `<Caption>` card strip); position follows whatever the kit's component
  does, so all three parts match. If the kit has no caption component yet, I use the template captions in the pick's
  colours (ink on card strip). Noted for the continuity judge.
- **Kit adoption.** Until `film-kit/READY` exists I build part-only pieces (plumber, Béroud + easel, box camera, doorknob,
  sleeping Louvre details) in the kit style (tokens from pick §1.1, 3.5 px ink outline, paper rim, offset paper shadow,
  poses on twos). Shared characters/sets come from `film/src/series/` copied from the kit; I never redraw them.
- **Her eyes.** Pick §2.5: the painting is never warped; she "reacts" via glint, glow and crops only. The bundle "eyes
  peek" = the top band crop of the real photo showing over the smock edge.
- **Title in the first 4 s:** CornerTab "The Stolen Smile · Part 1 of 3" from frame 0 (pick §2.6).
- **Honesty tags:** "Illustration" on the dark room (1.16); "Some say he hid overnight" is a caption caveat only (the
  line doesn't say how he got in, factcheck #5), not on screen.

## Visual language (state → one look)
| Thing | State | Look |
|---|---|---|
| Mona Lisa | present | real PD photo, amber halo |
| Mona Lisa | hidden (bundle/room) | amber leak at the folds, top-band eye crop |
| Mona Lisa | reacts | `glint` star on her left eye, 8 frames + chime |
| Hooks | holding | ink S-hooks, each lit once with number tag + `hook-clink` |
| Hooks | empty | same hooks, no tags, `hook-hum`, dimmer wall light |
| Mystery | question | `clueRed` "?" (stamp on 1.1, shadows on 1.16) + `question-plink` |
| Fame | who knows her | brass gauge, needle trembling at the monocle |
| Time | passes | tear-off calendar page (1911 → Monday → Tuesday) + `calendar-tear` |
| Name | first said | luggage name tag swinging in (upper third) |
| Words | spoken | caption card; "Mona Lisa" in amber |

## Thread (lead → move → next lead → carrier)
| # | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 1.1→1.2 | modern Mona Lisa + phones | sepia wash sweeps, crowd folds down, 1911 room folds up | Salon Carré wall | the painting itself (stays put) |
| 1.2→1.3 | the hand zipping her off | camera stays on the gap | floating smile crop | the empty spot |
| 1.3→1.4 | smile crop / title plaque | smile curve stretches, turns blue | the Seine | smile curve |
| 1.4→1.5 | sleeping Louvre | one eyelid-shutter lifts, push through | gallery | the window |
| 1.5→1.6 | walking Vincenzo | push in on his face in the glass | his reflection | pane of glass |
| 1.6→1.7 | glass box | glass edge leads to the wall | four hooks | glass edge |
| 1.7→1.8 | hooks | his hands on her edges | lift | his hands |
| 1.8→1.9 | her under his arm | travel through service door | staircase | the painting |
| 1.9→1.10 | empty frame on steps | pass through the frame | thin board | the frame opening |
| 1.10→1.11 | white smock | white fills the frame → white-lit door | door | smock white |
| 1.11→1.12 | locked door | plumber's pliers shadow slides in | plumber | shadow |
| 1.12→1.13 | open door | daylight fills frame | street | daylight |
| 1.13→1.14 | amber dot on map | map folds into Louvre roof, calendar "Tuesday" | Béroud | calendar page |
| 1.14→1.15 | four empty hooks | guard steps in, shrugs | guards + bubble | guard |
| 1.15→1.16 | photo bubble | pop leaves the empty wall | hooks' shadows "?" | the pop |
| 1.16 end | "?" | push through hooks into dark room, eyes, glint | EndCard "Next: The hunt" | the hooks gap |

## Beat → time map
Filled from `src/beats.json` once the VO is aligned (see Timeline).

## Timeline (UTC, machine clock)
- 20:30 start; VO job + music download in background; briefs read.
- 20:37 pictures-pick.md arrived; PLAN written.

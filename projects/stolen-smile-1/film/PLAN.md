# The Stolen Smile · Part 1: The vanishing — build plan

Builder session: session_01WProZXRvhK5SwKUZiHT2oC. Inputs: `../lines.txt` (locked), `../../stolen-smile-kit/pictures-pick.md`
(look, devices, beats §4 Part 1), `research.md`, `factcheck.md`, `BUILD-BRIEF.md`, `SERIES-BRIEF.md` (70–89 s, ceiling 90).
Unattended: every decision is made here and noted, nothing waits for Matthew.

## Format
1080×1920, 30 fps, one continuous shot, total = last word + ~1.2 s (must be ≤ 89 s). Remotion SVG + DOM, no three.js
(series rule). Captions top safe area y 250–470 per BUILD-BRIEF (decision below), `captions` prop for the mute test.

## Decisions
- **Captions position.** The pick (§1.5) puts torn-card captions at y = 1480; BUILD-BRIEF says top safe area y 250–470.
  SERIES-BRIEF ("same caption style… all of these come from film-kit/") wins: I use the kit's `<Captions>` unchanged
  (strip baseline y 1480, inside the bottom-420 safe line). Built first on top-placed captions, switched at adoption.
- **Kit adopted early.** `film-kit/READY` had not been written when I adopted (20:52); the kit's first commit (45d7521:
  tokens, grade, camera, cards, captions, puppets, Mona Lisa PD photo, sound palette) was usable, and the pick says the
  kit only adds after it exists, so I copied `film-kit/src/series/` → `film/src/series/` at **kit commit 45d7521** rather
  than wait. My scenes use my own camera/plane rig (`p1/rig.tsx`, same plane factors as the kit's) and part-only sets
  (Louvre exterior, gallery, staircase/door, street, map, little room) drawn with the kit's tokens, since the kit's sets
  were not built yet. Characters (Vincenzo, guards, art lovers, all extras via the kit `Puppet`), the Mona Lisa, the
  corner tab, title card, name tags, honesty tags, end card, captions and the grade are the kit's.
- **Sound.** Kit palette through the kit's `series_sfx.build_sfx` (series gains, identical across parts); voice and music
  chain identical to part 2's mix.py (VO high-pass + 10 dB, music +12 dB, sidechain threshold 0.06 ratio 3).
- **Name tag for the plumber** ("Sauvet, plumber"): the voice doesn't name him, but research names him (Hoobler); the
  tag keeps the "every key person labelled" rule for muted viewers.
- **Her reflection** (1.6) sits beside her on the glass, not over her face (pick §5: never anything over her face).
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
VO total 81.84 s (16/16 lines MATCH). Line starts: 0.2, 4.4, 12.7, 16.2, 22.5, 27.8, 34.8, 39.3, 42.1, 48.7, 54.2, 57.1, 62.9, 67.6, 73.2, 77.5.
Key beats: think 0.87 · stole 10.85 · title 12.60 · paris 16.12 · monday 22.42 · name 27.66 · room 34.68 · hooks 37.68 · lifts 39.19 · staircase 43.02 · board 48.59 · door 54.06 · plumber 56.97 · walksout 62.82 · nextday 67.53 · guards 73.10 · gone 78.05 · end 80.64.

## Timeline (UTC, machine clock)
- 20:30 start; VO job + music download in background; briefs read.
- 20:37 pictures-pick.md arrived; PLAN written.
- 20:38 Mona Lisa PD image fetched (Wikimedia rate-limited the full file; 960 px thumb worked; later replaced by the kit's).
- 20:41 VO generated (16 lines, seed 7), 81.97 s assembled; 20:43 aligned, 16/16 MATCH; beats.py.
- 20:45–20:48 all 16 beats built (8 stages, one camera, carrier irises/folds); first stills sheet (out/s1).
- 20:49 fixes (crowd, art lovers, gauge out of the right rail, bundle off his face, dark room under the end card).
- 20:50 kit's first commit seen; 20:52 adopted (series/ at 45d7521); second sheet (out/s2) checked.
- 20:54 mix.py (kit sounds, 51 cues); quarter-scale captions-off preview for motion_check + mute test.

# AI image 01: build plan (builder session, unattended)

Script: `../lines.txt` (locked). Beat sheet: `../pictures-pick.md` (followed; changes noted below). VO: AI design-m2 clone
(`../vo/`), 1497 frames = 49.9 s (last word 48.67 s + 1.2 s tail).

## Worlds and pass-throughs (one shot)
| World | Lines | Into the next world through |
|---|---|---|
| Desk: craft table under a lamp, phone with our own app "Picture Maker" | 1-3 | the paper plane flies at the lens and fills the frame |
| Room: dim warm room, shelf, old CRT, later a wall of CRTs | 4-9 | the dog TV's glass (camera dives until the screen fills the frame) |
| Corridor: the denoise steps hanging one behind another inside the TV | 10 | the last frame is placed exactly where the phone's picture bubble is (900 px wide, centred) |
| Desk again: same phone, now with the picture | 10 end | end |

## Visual language (state → one look, whole film)
| Thing | State | Look |
|---|---|---|
| Accent `#FFB547` | "follow this" | send button, user bubble, caret, number readouts on the tiles, tape glow + pulses, caption key words |
| Static | noise | chunky grey-colour grain from the one engine (`engine.ts`), always the same grid (200×150) |
| Noise sheet | removed noise | see-through grain sheet = x_k − x_{k+1}, lifts toward camera with a glint, lands on the pile |
| Picture | denoising | the engine's step image; coarse colour blobs → detail; counter `STEP nn` |
| Word | words → numbers | split-flap tile: cream word → flips → amber numbers clacking, cream tape of decimals |
| Paper | message | plane (folded) / sheet with the prompt (unfolded); always the same paper colour |
| Training photo | covered / clean | photo on a CRT; static overlay level 0→1→0 |

## Thread (lead → move → next lead → carrier)
| Lead | Move | Next lead | Carrier |
|---|---|---|---|
| scissors snipping the dog photo (frame 0) | scraps fly to the phone slot | collage | scraps |
| collage | static fizzes out of the slot, fills the screen | static | grain |
| static | CRT switch-off squeezes to a bright line | text box | the line |
| text box + thumb typing | send pressed, bubble rises, folds | paper plane | the bubble |
| plane | flies at the lens (fills frame), recedes into the room, unfolds | prompt sheet | paper |
| sheet | words drop as tiles, flip to numbers | tapes | tapes spool right |
| tapes | run into the TV, TV clicks on | static on TV | tapes |
| static | trembles, sheets lift (50 steps) | picture | sheets / counter |
| picture (dog/wave/pizza) | pull back: neighbours power on | wall of TVs | ripple of power-ons |
| wall | pile flocks onto screens, peels back off | red-car TV | sheets |
| dog TV brightens | rewinds to static, camera dives in | corridor | the glass |
| corridor, plane leading | last (sharp) frame | phone bubble | the picture |

## Beat → time (from `src/beats.json`)
l1 0.25 myth · l2 3.71 static (full at 5.88, switch-off 6.30) · l3 7.15 typing, send 10.51 · l4 11.44 plane fills 11.56,
tiles 12.36, numbers 13.8 · l5 15.82 TV on 16.92 · l6 19.55 sheet 1 on "wipes" 22.07 · l7 23.58 steps accelerate to 28 by
28.4 · l8 28.86 steps 29-50, tape pulses every step, tapes glow on dog/wave/pizza · l9 35.07 wall, covered 40.03, clean
42.43 · l10 43.66 dive, corridor 44.54, land 47.71, ding on "phone" 48.27.

## Decisions
- 2D/2.5D in CSS + Canvas 2D, no three.js: cheap frames, sharp art. Phone drawn 2D with titanium frame and glass highlight.
- Typing: 26 keystrokes incl. a typo ("pizzs" → backspace → "a"), seeded irregular intervals, key balloons, a drawn thumb.
- Denoise engine (`engine.ts`): x_k = a_k·blur(target, r_k) + b_k·noise_k on a 200×150 grid (nearest-neighbour upscale);
  a = sin^0.75, b = cos^1.35 of (π/2·k/50); blur radius shrinks with k (coarse before fine). Noise is a fixed field plus
  a fresh per-step part, so the whole picture changes every step. Sheets are computed differences, not drawn.
- Step counter: 01 on "wipes", 28 at the end of line 7 (inside 20-50, said in line 7), 50 by "pizza".
- Honesty tag "Illustration: real models clean a small hidden grid, then enlarge it" on screen during lines 6-7 (~8 s).
- The plane is not lost in lines 5-9: after the words drop out it refolds and perches on the TV, then leads the dive.
- Line 10 "words become numbers": the dive swings past the tapes plugged into the dog TV (no separate tapes in the corridor).
- Corridor uses 18 of the 50 frames (0,3,…,48,50): cut-order item 5 (cheaper, reads the same).
- Cut (picker's order, item 1): the droplet splash at the end. Kept: the ding shake.
- Wall of TVs: 87 CRTs with 6 captioned training photos (our own drawings), static overlay by a wave from the pile.

## Timeline (machine clock, UTC)
- 14:16 start; VO + music jobs launched
- 14:24 VO done (whole-file Whisper hallucinated: re-aligned per line, MATCH; 20/50 heard as digits → script words)
- 14:25 bar render started (Grand Canyon, quarter scale)
- 14:28-14:31 film source written; 14:31 first stills

# Noise cancel 01: build plan (builder session, unattended)

Script: `../lines.txt` (locked). Beat sheet: `../pictures-pick.md` (followed; changes noted under Decisions). VO: AI
design-m2 clone (`../vo/`). 1080×1920, 30 fps, one shot.

## Worlds (one master camera in cabin units; each world is its own layer with a computed flat transform)
| World | Lines | Into the next world through |
|---|---|---|
| Thought bubble (above the passengers, in the cabin) | 1 | the bubble pops; its shards fall onto the hero's real ear cup |
| Cabin: side cutaway of a plane cabin at dusk, windows, ENGINE outside, 4 passengers | 1, 7b, 9, 10, 11 | push into the hero's ear cup until it fills the frame |
| Machine room: the cutaway cup (mics on the shell, chip, music box, speaker, eardrum) | 2, 4–6, 7a, 8, 11 | pull back out of the cup (the cup shrinks to the head) |
| Air: balls inside one orange squiggle (screen-space canvas whose spacing grows with the dive zoom) | 3 (and the strips in 5, 7a) | the balls shrink to dots and their crowding draws the squiggle again |
| Sky: the whole plane from outside (end frame) | 11 end | the hero's window: pull back through it |

## Visual language (state → one look, whole film)
| Thing | State | Look |
|---|---|---|
| Noise squiggle | travelling | orange `#FF8A3D` sine path with two grumpy eyes; NOISE printed the first time |
| Copy squiggle | made by the chip / speaker | same path flipped (eyes upside down), cobalt `#4C8DFF`; COPY printed the first time |
| Voice squiggle | changing | orange but jagged, shape keeps changing; VOICE printed the first time |
| Cancel | push meets pull | both flatten into one straight line, then puff into 10 soft grey-white particles (the "pop") |
| Got through | not cancelled | squiggle survives smaller and keeps wobbling |
| Air ball | push / pull | crowded = PUSH (balls squash, warm tint), spread = PULL (gap, cool tint); calm = even spacing, neutral |
| Music note | playing | warm yellow-green `#D8E86A` note, bounces, never flipped, never orange; MUSIC printed once |
| Calm bubble | quiet zone | soft pale-teal glow around the ear |
| Caption key words | the line's point | orange accent (the colour of the lead: the noise) |

## Thread (lead → move → next lead → carrier)
| Lead | Move | Next lead | Carrier |
|---|---|---|---|
| brick BLOCK cup in the bubble, hail of NOISE pinging off | pull back: it is a thought bubble over nodding passengers | bubble | the bubble's trail of circles |
| bubble | pops into shards that fall onto the hero's real cup | real cup | shards |
| real cup | push in, cup opens into the cutaway | speaker firing COPY twins (backflip) | a leaking NOISE squiggle |
| lead NOISE squiggle | camera dives into its line | AIR balls (PUSH/PULL bands) | the line breaking into balls |
| balls | pull back, crowding draws the wave | squiggle flies to the cup shell | the squiggle |
| MIC stalks catch 3 squiggles | traces merge into one belt | CHIP flipping slices | the orange belt |
| chip | cobalt belt runs right | SPEAKER cone trampoline + MUSIC notes from the music box | COPY slices |
| one COPY flies to the EAR drum, meets NOISE | push meets pull, pop, drum stops | calm bubble round the ear in the cabin | pull back out of the cup |
| MUSIC note inside the bubble | camera follows it back in | music box / chip sparing notes | the note |
| a COPY flies out | pull out to the window: ENGINE metronome pops | neighbour's VOICE squiggles | the stream |
| a VOICE squiggle slips past | plunges into the CUSHION | cushion (brick flash) | the squiggle |
| cup | glide: mics, flip, punch-pop | the whole plane in the sky, one calm bubble | pull back through the window |

## Beat → time
Filled from `src/beats.json` after alignment (see Timeline).

## Decisions
- 2D only (SVG + one canvas for air). No three.js. Every layer gets one flat transform computed from the master camera
  (nested CSS scales blur and lose precision at 1000×).
- The cup cutaway is laid out left → right: outside (engine side) | shell with 3 mics | chip + music box | speaker |
  eardrum. Honesty tag "Illustration · not to scale" while inside the cup; "Real mics sit flush in tiny holes" when the
  stalks sink back.
- The neighbour is the passenger in the row in front, turned round over the seat back to chat (side cutaway of the cabin).

## Timeline (machine clock, UTC)
- 19:25 start; VO install + generation and music download launched in the background
- 19:27 film/ set up from templates; stand-in words (2.8 w/s)
- 19:30 pictures-pick.md arrived; 19:32 PLAN.md

## Rewrites and redesigns

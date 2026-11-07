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
From `src/beats.json` (VO 11/11 lines MATCH, last word 51.24 s, total 52.44 s = 1574 frames):
l1 0.25 bubble pull-back, BLOCK 2.85 · l2 4.00 pop 4.16, twins 5.5/6.8, MORE SOUND 5.1 · l3 8.99 dive 7.96→9.4, air
9.4–12.2, climb out by 13.5 · l4 14.09 mics up 14.3, catches 14.9/15.9/16.4 · l5 17.62 chip wakes 17.76, flips, PUSH/PULL
inset 19.9–23.1 · l6 22.88 speaker + music box notes · l7 25.79 meet at the eardrum, pop 27.43, calm bubble 28.8 ·
l8 31.59 note leads back in, MINE! spares from 32.4 · l9 37.62 engine metronome, voices from 41.1 · l10 44.31 cushion
dents, BLOCK flash 45.4 · l11 46.82 recap in the whole cup, punch 50.3, out to the plane 50.7–51.5, hold.

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
- 19:33 VO done: 11/11 lines MATCH (no fixes); beats.json
- 19:33–19:42 source written (common, Squiggle, Cabin, Machine, Air, events, Film)
- 19:42 stills round 1 (out/s1), 19:43 round 2 fixes
- 19:44–19:47 preview q1 + motion_check: movers 16 vs 18, flagged 41, 49
- 19:47–19:50 motion fixes, preview q2: movers 18 vs 18, flagged 41 only
- 19:51 L9 reframed; 19:53 preview q3 (captions off): no flagged seconds, movers 17 (captions off) vs 18
- 19:53 mute test (fresh judge) started; full render started and then stopped (fixes coming)
- 19:54 sound/mix.py; music +7.5 dB → 10.9 dB under speech; hum moved to 98/196/294 Hz (phone speakers)
- 19:55 mute-test fixes; stills s4, s5; 19:56–20:00 full render (4 min, 1574 frames)
- 20:00 mux + loudness (-14.0 LUFS, -2.0 dBTP); motion_check on the final: PASS (19 vs 18); YAVG scan → dive gap fixed by
  partial re-render 230–299; the first -c copy concat splice broke timestamps (271 frames) → redone with the concat filter
- 20:05 second fresh mute judge on the fixed shots (4–13, 31–38, 40–47): all fixed claims recovered; label clutter fixed
- 20:09–20:12 final full render, mux, checks: 1574 frames, -14.0 LUFS, -2.0 dBTP, motion PASS 18 vs 18
- 20:13 delivery

## Rewrites and redesigns
- 19:43 frame 0's HEADPHONES label sat in the top 220 px: camera lowered. A reversed-range bug (`pr` with a > b) drew a
  giant note at the end: fixed. The EAR label collided with the ball strip: strip moved down. End framing cropped the tail.
- 19:48 motion (movers 16 vs 18; seconds 1, 5–8, 13, 27–28, 33, 41, 43, 45–51 low): air motes inside the cup and dust in the
  cabin, each drifting and jostling on its own; denser hail (22 squiggles); line-8 items start at "knows"; the belt and
  notes keep running through the recap; the engine stream continues under the voices.
- 19:51 second 41 (L9 wide shot: squiggles tiny, half the frame floor): reframed to window–hero–neighbour (z 0.72 → 1.0–1.12),
  cabin squiggles 1.4× bigger.
- 19:55 mute test misses: line 8 read as "a repeat" → a dashed link from the music box to the spared note and MINE! over it,
  MUSIC printed on the box; line 2 "more sound" → cobalt rings pour out of the speaker with MORE SOUND; AIR label tiny →
  72 px AIR with a ring round the hero ball; voices ambiguous → TOO LATE on a late copy, GETS THROUGH on survivors;
  VOICE, ENGINE, CUSHION and the honesty tag enlarged; L2 squiggles moved off the chip; end holds the plane ~0.9 s.

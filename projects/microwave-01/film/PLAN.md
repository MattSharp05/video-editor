# Microwave 01: build plan

Script locked (`../lines.txt`, 146 words). Pictures from `../pictures-pick.md` (Spud the potato, the myth chef,
magnetron, ant-scale door, molecule crowd, hot-spot map). 1080×1920, 30 fps, one shot, SVG in Remotion (no three.js).

## Decisions (made without Matthew, per the brief)
- **2D SVG only**, one camera in "oven space" (S1). Spaces nest or are entered through a named carrier:
  S0 kitchen + microwave front (contains S1 through the door window; the door mesh is the carrier),
  S1 oven interior side view (Spud cutaway, magnetron behind an X-ray side wall, waves bouncing),
  S3 door mesh close-up (ant scale; entered riding the lead wave), S2 molecule crowd (entered through a water bead on
  Spud's skin, left through the same bead), S4 top-down oven floor (entered by a crane up: side view squashes as the
  floor view opens).
- Molecule crowd drawn as SVG (about 70 molecules with faces, not 150 on canvas): faces need to read at phone size and
  SVG keeps it in one renderer. Each rocks within ±55° from its own lag, never spins; BONK stars where neighbours swing
  toward each other.
- Microwave: original sage-green rounded box, cream knobs, small display; no brand, no logo. Printed "MICROWAVE" under it
  on first appearance.
- Kitchen at dusk: plum wall, tiled backsplash, window with a sunset, swaying lamp and plant, steaming kettle. Never black.
- Numbers on screen: "2,450,000,000" swings per second = research's 2.45 GHz, voiced as "billions" (match).
- On-screen counter ends at 2,450,000,000 (research: 2.45 GHz) under BILLIONS; the voice says "billions", so it matches.
- Cut from the pick (time): the thin cracker in line 9 (THICK FOOD + MIDDLE kept).
- Honesty tags: "Illustration · not to scale" on the molecule world, "Not to scale" on the door mesh.

## Visual language (one look per state)
| Thing / state | Look |
|---|---|
| Wave (any time) | cyan-mint `#7FF0E6` glowing ribbon/arc; dashed + faint while "invisible" |
| Heat / hot | orange → red fill (`tempC`), steam wisps |
| Cold / waiting | blue `#7DB6FF`, icicles/scarf |
| Myth | red rubber stamp "MYTH?" → flips "NOPE" |
| Plus side / minus side | pink ears with white "+" / blue belly with white "−" |
| Bump | small yellow BONK star, turns orange as heat builds |
| Printed name of a key object | cream bold caps on/next to the object, first appearance only |
| Accent (follow this) | the wave cyan while waves lead; heat orange while heat leads |

## Thread (lead → move → next lead → carrier)
| Line | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 1 | microwave in kitchen | push through the door window (pass through) | Spud cutaway, chef's flame | the door mesh |
| 1→2 | chef's flame | sputters; cutaway turns thermal | outer layer band | smoke puff |
| 2→3 | heat creeping in | ghost ripple washes in from the right; camera travels right | magnetron | the ripple |
| 3→4 | magnetron rings | rings become waves; travel into the box | bouncing fronts | one wave front |
| 4 | lead wave | travels to the door; scale shrinks (pass into mesh) | mesh holes + ant | the lead wave |
| 4→5 | wave at mesh | freezes into a sine, swings faster | ribbon + stopwatch | the wave |
| 5→6 | ribbon | dives back to Spud's skin, onto a bead | water bead | the ribbon |
| 6 | bead | camera passes through the bead film | molecule crowd | the bead surface |
| 7 | field band | sweeps through crowd | rocking molecules, BONKs | the + / − band |
| 8 | BONK stars | glow orange, crowd heats | heat | the stars |
| 8→9 | the crowd | pull back out through the bead | Spud cutaway outer band | the bead |
| 9→10 | cutaway | crane up over the plate (side view squashes, floor opens) | hot-spot map | the turntable |
| 10→11 | turning plate | tilt back + pull out through the door | whole microwave, ding | the door mesh |

## Beat → time map
From `src/beats.json` (AI VO aligned line by line, all 11 lines MATCH). Total 51.59 s = 1548 frames.

| beat | s |
|---|---|
| l0 | 0.25 |
| l1 | 3.88 |
| l2 | 8.23 |
| l3 | 12.90 |
| l4 | 17.62 |
| l5 | 21.61 |
| l6 | 28.27 |
| l7 | 34.13 |
| l8 | 36.01 |
| l9 | 41.30 |
| l10 | 45.73 |
| myth | 2.81 |
| actually | 3.79 |
| outer | 5.11 |
| creeps | 6.92 |
| oven | 8.13 |
| magnetron | 10.33 |
| invisible | 11.31 |
| bounce | 13.30 |
| metal | 14.12 |
| door | 15.40 |
| holes | 15.85 |
| keep | 16.45 |
| swings | 18.16 |
| billions | 19.26 |
| second | 20.30 |
| water | 22.18 |
| molecules | 23.45 |
| plus | 26.05 |
| minus | 27.00 |
| tugs | 29.09 |
| other | 30.49 |
| wiggle | 31.57 |
| bump | 32.49 |
| heat | 34.91 |
| reach | 36.39 |
| thick | 38.55 |
| middle | 39.81 |
| wait | 40.07 |
| spots | 41.20 |
| more | 42.09 |
| why | 43.78 |
| spins | 44.27 |
| r_waves | 45.63 |
| r_wiggle | 46.23 |
| r_bump | 47.51 |
| r_heat | 48.11 |
| leftovers | 49.21 |
| hot | 49.85 |
| end | 50.39 |
| total | 51.59 |

## Timeline (machine clock, UTC)
- 19:26 start: voice job + music download started; read brief, report, skills.
- 19:29 pictures-pick.md landed (pulled); plan written.
- 19:33 VO done: 11/11 lines MATCH, 51.72 s incl. 1.2 s tail (under 60 s). words.json copied; beats.py run.
- 19:35 film v1 written (S0/S1/S2/S3/S4); first stills sheet 19:36 (43 stills at 0.25): layout fixes (wave bracket off-screen,
  field band under the caption scrim).
- 19:38 preview 1 (quarter scale, ~1 min render): motion_check FAIL, movers 11 vs 18; flagged 4, 7, 20, 28, 42-47, 50.
- 19:40 redesign 1: steam droplets off Spud, waves crossing the floor + steam puffs in the top-down view, livelier
  molecules, sparks/specks on the mesh, steam out of the open door -> movers 14, flagged 4, 7, 42-47.
- 19:42 redesign 2: droplets bigger + blue-white (they were invisible on the lit cavity), chunkier floor waves -> 16.
- 19:43 redesign 3: the heat mechanism as motion (sparks popping in the outer layer, heat specks creeping band by band),
  stamp moved off the chef -> 18 vs 18, flagged 4 only.
- 19:44 redesign 4: sparks start on "but actually"; heat shimmer off the magnetron fins -> PASS on movers (18 vs 18);
  one flagged second: 45 (the crane back from the top-down plate to the side view; defensible, a deliberate move).
- 19:45 mute test: captions-off frames at 2 fps (5 sheets) to a fresh judge. Mix v1: -13.9 LUFS, music 11.6 dB under voice.

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
Filled from `src/beats.json` after the VO aligns (see Timeline).

## Timeline (machine clock, UTC)
- 19:26 start: voice job + music download started; read brief, report, skills.
- 19:3x pictures-pick.md landed; plan written.

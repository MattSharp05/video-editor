# s5 microwave myth: script (v0.1, picture-first)

**Idea:** a microwave doesn't cook from the inside out: it heats the outer inch or so, and the middle waits for that
heat to creep in. **Goal:** reach. **Format:** mythbuster Reel, 1080x1920, 30 fps, ~40 s. **Voice:** AI m5.
"Most people think..." then the picture proves otherwise: the same lasagne, cut open under heat vision.

Numbers are **starting values**; the stills tune them.

---

## Look sheet

**Style.** `styles/realistic-3d` + look pass (ACES once, hemisphere fill, environment on the food, glass and the
microwave only, vignette, light grain). One luminous layer on top: heat vision (a thermal shader on the cut face), the
microwave wave fronts, the ruler, the molecules.

**World and scale.** 1 unit = 1 m. A white countertop microwave (found model, ~0.5 m wide, animated door) on the
counter of a small modern kitchen (found model, evening). Inside: a white ceramic plate on the glass turntable, and a
thick slab of frozen lasagne, 0.15 m wide x 0.09 m tall x 0.15 m deep (found "Lasagna" scan, scaled). One inch =
2.54 cm: on the cut face the heated rim is ~1/6 of the width on each side.

**Light.** Kitchen at night: warm ceiling downlights (3000 K) on the counter, cool blue window fill from the left,
the microwave's interior lamp warm yellow (#FFD28A) when it runs. Exposure ~0.8 in the kitchen, set per shot.

**Colour meanings.**
| Colour | Means | On |
|---|---|---|
| Thermal ramp: deep blue #1B2A8C (frozen) -> violet #6A2C9C -> red #E0322A -> orange #FF8A1E -> yellow-white #FFF2B0 (boiling) | temperature | the cut face in heat vision, the colour scale |
| Cyan #6FE7FF | the myth (a hologram) | the myth's heat map and its label |
| Microwave gold #FFD27A | the microwaves themselves | wave fronts, the field arrows |
| White | labels, the ruler | |
Everything else (kitchen, microwave body) natural and desaturated. Heat vision is the lead whenever it is on.

**Camera rules.** 35 mm sensor lens (portrait). Continuous moves inside a shot; hard cuts between scales (kitchen ->
cut face -> molecules), on the words. The camera never parks.

**Safe areas.** Captions y 250-470 over a scrim. Lead inside x 60-1020, y 520-1500. Nothing important below y 1500
or right of x 930 below y 1100.

**Visual language: states.**
| Item | States | Look |
|---|---|---|
| Food cut face | real -> heat vision -> real | real: pasta, sauce and cheese layers (frost in the frozen middle); heat vision: the thermal ramp by temperature, a scale bar on the right |
| Wave front | travelling -> absorbed | a thin gold sheet moving in from a wall; it dims as it enters the food (power falls ~e^-x over ~1 cm), gone ~2.5 cm in |
| Water molecule | still -> flipping | red O + two white H; flips back and forth with the field (gold arrows) |
| Temperature | frozen -> hot | blue -> yellow-white along the ramp |

**Thread.**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| Myth hologram (hot core) | glitch + door opens | the lasagne itself | the hologram breaks up as the door swings open |
| Lasagne | **cut** (on "Watch") + split | the cut face in heat vision | a scan line sweeps the slab; the front half slides away |
| Wave fronts | absorbed | hot rim band | the fronts die where the rim lights up |
| Rim band | **cut** (scale) | molecules flipping | the band's orange edge is the boundary between flipping and still molecules |
| Molecules | **cut** back | the cut face, rim creeping inward | the band boundary moves inward |
| Heat vision | switches off | the real cut face: bubbling edge, frosty middle | a scan line sweeps back |
| Real face | heat vision on again | waves crossing the icy core | the scan line |
| Rim + cold core | evens out | the whole face warm | the stand timer |

---

## Beats (stand-in at 2.84 words/s)

### Beat 1 · 0-3.8 s · the myth
**Voice:** "Most people think a microwave cooks food from the inside out."
**Start frame (cover):** the microwave on the counter, 3/4 view from front-left, filling ~85 % of the frame width,
door glass at frame centre (y~980). Inside, lit warm, the lasagne turns on its plate. Over it, a cyan hologram heat map:
a red-hot core in the middle of the slab with rings pulsing outward, the label "the myth?" in cyan.
**Action:** the plate turns; the hologram's core pulses outward twice.
**Camera:** slow push in 0.9 m -> 0.6 m.
**End frame:** door glass ~70 % of the frame width, the hologram bright.

### Beat 2 · 3.9-5.6 s · watch
**Voice:** "Watch what really happens."
**Action:** the hologram glitches and breaks into scan lines; the door swings open (the model's animation); cut on
"really" to the cut face.
**Cut:** to the slab at 0.32 m, 35 mm, level with it. A gold scan line sweeps top to bottom; behind it the slab is cut
through the middle: the front half slides away (down-left, out of frame), the back half's cut face fills ~70 % of the
frame width, in heat vision (all deep blue: frozen, -18 C), a temperature scale bar on the right edge (x~900).
**End frame:** blue cut face, scale bar, "-18 C" readout.

### Beat 3 · 5.8-9.4 s · an inch
**Voice:** "Microwaves mostly heat the outer inch or so of the food."
**Action:** gold wave fronts roll in from the top, left and right (12 fronts, 0.25 s apart), each dimming as it enters
the slab and gone ~2.5 cm in. Where they die, the rim warms: a band ~2.5 cm wide turns red -> orange around the top
and sides (and the bottom, through the turntable). A clear ruler slides in along the top edge with "1 inch" marked.
The middle stays blue.
**Camera:** slow push 0.32 -> 0.28 m.
**End frame:** orange rim band, blue core, ruler.

### Beat 4 · 9.6-14.6 s · molecules flip
**Voice:** "They make the water molecules there flip back and forth, billions of times a second, and that layer gets hot."
**Cut on "They":** molecule scale: a dark field of ~400 water molecules (red O, white H), half of them in the rim (lit
orange behind), half in the core (blue). Gold field arrows sweep across, reversing; the rim molecules flip back and
forth in step; the core molecules sit still. Label: "2.45 billion times a second" (the wave frequency).
**Camera:** slow track along the boundary.
**End frame:** flipping rim molecules glowing, still core.

### Beat 5 · 14.8-20.4 s · creeps in
**Voice:** "The middle gets almost none of it. It only warms as heat creeps in from the outside."
**Cut on "The middle":** back to the cut face. On "almost none" a soft pulse shows the core blue. On "creeps in" a
timelapse: the warm band bleeds inward a few millimetres per beat, a small clock spinning in the corner.
**Camera:** slow pull back 0.28 -> 0.36 m.
**End frame:** hot rim, a narrower blue core.

### Beat 6 · 20.6-25.8 s · frozen meal
**Voice:** "That's why a frozen meal can be boiling at the edges and still icy in the middle."
**Action:** a scan line sweeps up: heat vision off, the real cut face: the rim sauce bubbles and steams, the middle is
pale and frosted with ice crystals that glint. Two metal probes push in: rim "98 C", middle "-4 C".
**Camera:** slow orbit 10 deg.
**End frame:** bubbling rim, frosted core, two readouts.

### Beat 7 · 26.0-30.6 s · runaway
**Voice:** "Ice barely soaks up microwaves, so the thawed edges keep taking the heat."
**Action:** heat vision back on. Wave fronts again: in the frozen core they pass straight through, barely dimming
(ice absorbs little); in the thawed rim they die fast and the rim flares yellow-white.
**End frame:** yellow-white rim, blue core.

### Beat 8 · 30.8-36.5 s · stand
**Voice:** "So follow the label: let it stand a few minutes, and the heat finishes the job."
**Action:** a "STAND 3:00" timer counts down fast; the rim cools to orange as the core warms through violet to red and
orange; the last blue spot fades. Pull back out to the kitchen view: door open, the lasagne steaming on its plate.
**Camera:** pull back from the face to the kitchen (a cut back to the opening angle on "and the heat").
**End frame:** the microwave with its door open, steaming lasagne, warm light (bookends the cover).

---

## Frame maths
- Microwave 0.5 m wide in a 9:16 frame at 85 % width: frame width 0.59 m -> height 1.05 m; at 24 mm (vertical FOV
  73.7 deg) d = 0.70 m; at 35 mm d = 1.0 m.
- Cut face 0.15 m wide at 70 % frame width: frame width 0.21 m, height 0.38 m; 35 mm: d = 0.37 m. An inch (2.54 cm) =
  0.0254/0.21*1080 = 130 px: reads.
- Molecules: abstract scale (not to scale), stated by the cut.

## Captions (sense units)
1. Most people think a microwave cooks food from the [inside] [out.]
2. Watch what really happens.
3. Microwaves mostly heat the [outer] [inch] or so of the food.
4. They make the water molecules there flip back and forth,
5. billions of times a second, and that layer gets hot.
6. The [middle] gets almost none of it.
7. It only warms as heat creeps in from the outside.
8. That's why a frozen meal can be boiling at the edges
9. and still [icy] in the middle.
10. Ice barely soaks up microwaves, so the thawed edges keep taking the heat.
11. So follow the label: let it stand a few minutes,
12. and the heat finishes the job.

## Sound cue list (CC0 sfx-29-61 or synthesized)
Kitchen room tone + microwave hum (synth: 60/120 Hz + fan noise) while it runs; a hologram shimmer (synth); the door
latch (padlock-open, soft) and door swing; scan-line whoosh; soft electrical hum swelling with the waves; molecule
flutter (synth tremolo); clock ticks for the creep; bubbling (bubbles-burst) and a sizzle (filtered noise) on the edge;
frosty glass tings (very soft) on the ice glints; the microwave's three beeps (synth sine) at the end of "stand".

## Claims to verify (fresh agent before the board)
1. Microwaves don't cook from the inside out (FDA).
2. "Microwaves mostly heat the outer inch or so of the food" (USDA 1-1.5 in; penetration depth ~1-2 cm in water).
3. They make water molecules flip back and forth, billions of times a second (2.45 GHz), and that heats the layer.
4. The middle gets almost none; it warms by conduction from the outside.
5. A frozen meal can be boiling at the edges and icy in the middle.
6. Ice barely absorbs microwaves; the thawed edges keep taking the heat.
7. Label advice: let it stand a few minutes (USDA: at least 3 minutes) and the heat finishes cooking.
8. On screen: "2.45 billion times a second", "1 inch", "-18 C", "98 C", "-4 C", "STAND 3:00".

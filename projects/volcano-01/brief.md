# Volcano 01 (brief)

Status: in production, unattended (Matthew, 2026-11-07: "just make the whole thing don't ask for my approval. Make
them interesting, entertaining, informative, 3rd grade reading level."). Every approval stop in the skills is skipped by
his instruction and recorded here:
- Concept and pictures approval: skipped (fresh brainstorm agent + separate picker agent decided; `pictures_brainstorm.md`).
- Key-frame board approval: skipped (board rendered and fixed by Claude only).
- Voice choice: skipped (American male design-m2, cloned from the approved Grand Canyon hook clip, as on three earlier films).
- Sound picks (Sound Picker): skipped (effects chosen by measurement from the CC0 library + synthesized rumbles, labelled).
- Listening: Claude can't hear; moments to check are listed in `benchmark.md`.

## Facts
- Topic: "Why do some volcanoes explode while others just ooze?" Reel 9:16, 30 fps, ~70 s, 3rd-grade reading level
  (Flesch-Kincaid 2.8). No call to action.
- Style: 3D (three.js in Remotion) with the look pass. Real places from the terrain kit approach: USGS 3DEP elevation
  (AWS Terrain Tiles) and USGS National Map imagery (public domain) for Kilauea (18.5 km square) and Mount St. Helens
  (27 km square). St. Helens' pre-1980 summit (2,950 m) is reconstructed from the surviving flanks (`data/prep.py`),
  labelled in the caption. Heights x1.5, labelled on screen. Original models only; no footage or photos.

## The device and the world (picker's choice)
Both volcanoes are real-terrain blocks floating over a sea of cloud at dawn. Each block can be cut open along a
north-south plane through its summit (a knife sweep), showing the rock inside, the magma chamber and its pipe outlined
as a faint glass soda bottle (body = chamber, neck = pipe, cap = summit). The lead is the gas: one bubble ("Fizz") and
its kind. Rejected by the picker: a kitchen soda world (leaves the geology), a pipe forking to both volcanoes (false: they
are fed separately), beach-ball kids and hands (faces and hands are expensive).

## The thread (one shot; lead -> move -> next lead, carrier)
| # | Line | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|---|
| 1 | Watch this volcano ooze... | lava rivers on Kilauea | pull across | St. Helens' cone | the camera slides from one block to the other; the blast rewinds |
| 2 | The secret is gas | Kilauea's summit | open (knife cut) | the magma, full of silver specks | the cut sweeps toward the camera's subject |
| 3 | ...magma... like the fizz in a soda | the magma | transform | the glass bottle | the bottle's outline draws itself around the magma |
| 4 | the heavy rock above squeezes | rock layers | travel down | the shrinking bubbles | layers slide in and press; specks shrink on each thud |
| 5 | as magma rises... bubbles | Fizz | travel up | the neck | camera rides Fizz up the neck as it swells |
| 6 | depends on the magma | Fizz | pull back | the second bottle | camera retreats; St. Helens' cut opens beside |
| 7 | In Hawaii... pop | Fizz | travel up | the vent | bubbles stream up and pop out of the summit |
| 8 | glowing rivers | the vent's glow | travel | the lava rivers | the camera follows the lava down the slopes |
| 9 | more silica... peanut butter | the second magma | travel across | the spoon | the camera crosses to St. Helens; a spoon stands upright in it |
| 10 | Bubbles get stuck | the stuck bubbles | push in | the cap | bubbles jam and swell under the cap |
| 11 | Mount St. Helens 1980... side out | the cap's pressure | pull back | the north flank | the bulge grows out of the pressure point |
| 12 | earthquake... boom / shaken soda | the bulge | transform | the blast | the flank slides; the cap pops; ash surges north |
| 13 | Ash 15 miles... top gone | the ash column | travel up / down | the crater | camera rides the column up past the markers and back down to the horseshoe |
| 14 | runny lets gas out... blow its top | both blocks | pull back | end | camera circles both: Kilauea oozing, St. Helens' crater |

## One visual language
| Thing | State | Look (one per state) |
|---|---|---|
| Gas | dissolved / bubble / escaping / trapped | silver-white specks / silver-cyan spheres growing / spheres popping into a puff at the surface / spheres pressed together, wobbling |
| Runny magma (basalt) | in the rock / at the surface | bright orange-yellow glow / orange lava rivers with a dark crust edge |
| Sticky magma (dacite) | in the rock | dull red-brown, stiff, pale glinting silica grains |
| Rock | squeezing | grey-brown slabs sliding in on top |
| Bottle | outline | faint glass edges, white; the cap on the summit |
| Ash | blast / column | grey-brown billows, low and sideways first, then up |
| Accent | captions, cards | silver-cyan (#9fe8ff), the gas colour: the gas is what the film follows |

## Outstanding corrections
None yet (no review by design).

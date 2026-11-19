# s4 Sinkhole: script (v0.2, picture-first; stand-in timings at 2.84 words/s until the m5 VO is aligned)

**Idea:** a sinkhole is a hole that grows upward from below for years, hidden under a road that looks fine, and only
the last step is sudden. **Goal:** reach. **Format:** Reel 1080x1920, 30 fps, ~40 s. **Voice:** m5. **Music:**
Floating Cities.

## The chain (explainers.md)
Road looks solid (the experience) -> why is it hollow? rain becomes a weak acid -> the acid dissolves limestone into a
cave -> problem: why doesn't the ground fall in? the cover bridges like an arch -> but grains ravel into the cave and
the void climbs -> nothing shows on top -> the roof gets too thin and drops at once -> recap: "overnight" is the last
second of years (lands back on the road).

## Lines (fact-checked v0.2, ~112 words)
1. This road looks solid. But underneath, it's hollow.
2. It starts with rain. Rain soaks up carbon dioxide from the air and soil, and turns into a weak acid.
3. Under the dirt, that acid eats into limestone, a little every year, and opens up cracks and holes.
4. The sticky clay above can hold up like an arch, even with empty space underneath.
5. But bit by bit, its ceiling crumbles down into the cracks, and the empty space climbs upward.
6. Up top, nothing looks wrong.
7. Until the roof gets too thin to hold the weight. Then it drops all at once.
8. That's why sinkholes seem to open overnight. The hole was growing for months, or years.

Numbers are **starting values**; the board tunes them.

---

## Look sheet

**Style.** Realistic 3D (`styles/realistic-3d`): one suburban road at the edge of a field (realism kit sky, sun,
grass, trees; the found sedan), and the ground under it **sliced open like a cake**: a vertical cut face at z = 0
showing the layers. Luminous layer on top: the scan line, the acid tint, the arch blocks, the hourglass outline, the
grains. Look pass: ACES once, exposure per shot, environment map on the car only, `Finish` vignette + light grain.

**World and scale (1 unit = 1 m).**
| Layer (on the cut face) | Depth | Look |
|---|---|---|
| Asphalt + road base | 0 to -0.6 m | dark grey asphalt over pale gravel |
| Cover: clay and sand | -0.6 to -11 m | warm tan/orange-brown, faint bedding, scattered pebbles |
| Limestone | -11 to -30 m | pale cream-grey, bedding planes every ~2.5 m, near-vertical fractures |
| Water table | -15 m | below it the limestone is darker and blue-tinted (wet) |
- Road: two lanes along x, z from -7.5 to -0.5, lane lines; grass and trees behind it (z < -9). The front face of the
  ground is the cut (z = 0). The car (4.9 m) on the road at x = 0 over the cave.
- Cave (in limestone, centre x 0, y -17): grows from fractures to ~12 m wide, 7 m tall. Throat: a widened fracture at
  x 0 up to the limestone top (-11).
- Void in the cover ("raveling dome"): base at -11, half-width 4.5 m, top climbing from -11 to -1.0 m (0.4 m of soil
  + 0.6 m road left). Rubble cone on the cave floor grows as the dome climbs.
- Plug (collapse): road + soil disc of radius 4.5 m (half of it is cut by the face), 1.0 m thick, drops 16 m in 1.1 s.

**Light.** Afternoon sun 38 deg high from frame-left-behind (azimuth 150 relative to the camera), Preetham turbidity 3;
exposure 0.12 above ground. The cut face is lit by the same sun plus a soft fill (it faces the camera and the sun), so
the layers read; the cave and the void inside are dark (0.08) with a warm rim where the face meets them.

**Colour meanings (whole film).**
| Colour | Means | On |
|---|---|---|
| Lime #B8F25C | acid (rain that dissolves rock) | acid drops, the dissolving front in the limestone |
| Rain blue #7CC8FF | plain rain water | raindrops before they pick up CO2 |
| Amber #FFB547 | the hidden void / the answer | the scan line, the arch blocks, the hourglass, the grains' glow, "years" |
| Coral #FF5A4E | failure / danger | cracks in the asphalt, the "seconds" sliver |
| White #EAF6FF | labels, neutral geometry | CO2 motes, tags |

**Camera rules.** One world; continuous moves (the camera never passes through the ground: it floats in front of
the cut face). Lens 35 mm on a 36 mm gauge (frame height = 1.03 x distance). One hard cut: to the drone view right
after the collapse (on "That's why"). The camera never parks.

**Safe areas.** Captions y 250-470 over a scrim. Lead inside x 60-1020, y 520-1500.

**Visual language: states.**
| Item | States | Look |
|---|---|---|
| Ground in front of the cut | solid -> scanned away | grass and soil; a glowing amber scan line sweeps down, removing it |
| Drop | rain -> acid | blue streak -> lime bead (after passing CO2 motes) |
| Limestone | solid -> dissolving -> cave | pale rock; lime glow at the eating front; dark hollow |
| Cover | holding -> raveling | arch blocks outlined amber (holding); grains falling (raveling) |
| Road | fine -> cracked -> gone | asphalt; coral cracks; a hole |

**Thread.**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| Road + car | open (scan line sweeps the near ground away) | the cut face with the cave | the scan line |
| Rain over the road | travel (drops sink into the soil) | acid drops in the soil | each drop, tinted lime as it gathers CO2 |
| Acid drops | travel down fractures | dissolving front, cave | the lime tint |
| Cave roof | transform (stone blocks traced) | the arch | the dome's underside |
| Arch blocks | melt into grains | hourglass | the grains |
| Void top | climb | road just above it, car rolling on | the void's tip vs the asphalt |
| Car | drops with the plug | the hole from above | the car (cut on "That's why") |

---

## Beats (stand-in times)

### Beat 1 · 0-2.9 s · hook
**Voice:** "This road looks solid. But underneath, it's hollow."
**Start frame (cover, moving):** street level, 1.6 m up, 14 m in front of the road, looking along it slightly; the
sedan rolls left to right at 8 m/s, trees, sun flare frame-left. 35 mm.
**Action:** on "underneath" a bright amber scan line sweeps down the frame across the near ground: behind it the
ground in front of the cut vanishes, revealing the cut face and, under the car, a huge dark cave (~12 m wide) and the
void climbing toward the road.
**Camera:** cranes down 4 m and back 6 m as the ground opens, tilting to frame road on top and cave below.
**End frame:** road and car at y ~620, the cave at y ~1250 (the whole story in one frame).

### Beat 2 · 3.3-9.6 s · rain becomes acid
**Voice:** "It starts with rain. Rain soaks up carbon dioxide from the air and soil, and turns into a weak acid."
**Action:** time rewinds to before the cave (the cave and void are gone; the car is gone). Rain falls (instanced
streaks); white CO2 motes drift in the air and the topsoil; drops passing through them turn from blue to lime; on the
cut face hundreds of lime beads seep down through the cover. Tag "CO₂ + water = weak acid".
**Camera:** pushes from 30 m to 20 m in front of the face, framing the top 14 m.
**Lead:** one hero drop, then the seeping beads.

### Beat 3 · 10-15 s · limestone dissolves
**Voice:** "Deep down, that acid eats into limestone, a little every year, and carves out a cave."
**Action:** lime beads reach the limestone and run down its fractures; the fractures glow lime and widen; they join
into a cave (shader threshold over the fracture field). Counter "years: 0 -> 10,000+".
**Camera:** tilts and cranes down the face to centre the limestone (y -17).

### Beat 4 · 15.5-20 s · the arch
**Voice:** "The clay and sand above it can hold together like an arch, even with nothing underneath."
**Action:** the cave's top opens into the cover; the cover's underside over the throat curves as a dome. Translucent
amber stone blocks (a keystone arch) trace the dome; light streams flow round the curve into the sides.
**Camera:** rises to centre the dome (y -9).

### Beat 5 · 20.5-26 s · the hourglass
**Voice:** "So grains trickle down into the cave, like sand in an hourglass, and the hole climbs upward."
**Action:** the blocks melt into grains; grains fall from the dome's ceiling into the cave (hundreds), the rubble cone
grows, the dome top climbs from -10 to -3 m; an amber glass hourglass outline glows around dome (top bulb), throat
(neck) and cave (bottom bulb).
**Camera:** slow pull back to frame road to cave.

### Beat 6 · 26.5-28.3 s · nothing looks wrong
**Voice:** "Up top, nothing looks wrong."
**Action:** the sedan rolls in and parks right above the void; the road surface is intact; the void's tip is a hand's
width under the asphalt (dome top -1.0 m).
**Camera:** rises to road level, the cut face below: split frame at the ground line.

### Beat 7 · 28.8-33.5 s · collapse
**Voice:** "Until the roof gets too thin to hold the weight. Then it drops all at once."
**Action:** coral cracks ring out from under the car (0.8 s); on "drops" the plug (road + 1 m of soil) and the car fall
16 m into the void in 1.1 s; grains and dust burst; the camera shakes.
**Camera:** holds wide, shake on the impact.

### Beat 8 · 34-39 s · overnight vs years
**Voice:** "That's why sinkholes seem to open overnight. The hole was growing for years."
**Start frame (cut on "That's why"):** drone view from above-front at 25 m: a round hole in the road, the car at the
bottom in the rubble, dust settling.
**Action:** a bar across the lower frame: a long amber section "years of hollowing" and a coral sliver at its end
"one second". **Camera:** slow rise.

## Captions (sense units; [key words] in the accent)
1. This road looks solid. / But underneath, it's [hollow.]
2. It starts with rain. / Rain soaks up carbon dioxide / from the air and soil, / and turns into a weak [acid.]
3. Deep down, that acid eats into limestone, / a little every year, / and carves out a [cave.]
4. The clay and sand above it / can hold together like an [arch,] / even with nothing underneath.
5. So grains trickle down into the cave, / like sand in an [hourglass,] / and the hole climbs upward.
6. Up top, nothing looks wrong.
7. Until the roof gets too thin to hold the weight. / Then it drops [all] [at] [once.]
8. That's why sinkholes seem to open overnight. / The hole was growing for [years.]

## Sound cue list (CC0 sfx-29-61 or synthesized)
Street: wind bed (synth), car pass (synth noise swell). Scan: whoosh-fast + riser. Rain: synth rain hiss (filtered
white noise) + water-plunge drips low. Dissolving: bubbles-burst very soft. Arch: glass-ting. Grains: tile-clicks soft
loop (sand trickle) + synth hiss. Cracks: relay-click / glass-ting pitched down. Collapse: impact-deep + whoosh-deep +
synth rumble. Cut: whoosh peaking on the cut. End: soft pop on the bar.

## Claims to verify (fresh agent, before the board)
1. Rainwater absorbs CO2 from the air and from soil, forming weak carbonic acid.
2. That acid slowly dissolves limestone (and similar rock), widening fractures into caves/cavities.
3. Clay-rich cover sediments can bridge (arch over) a cavity below.
4. Sediment ravels/spalls down into the cavity so the void migrates upward ("like an hourglass").
5. The surface can show nothing until the roof is too thin; then it collapses suddenly (cover-collapse sinkhole).
6. "Seem to open overnight" / "growing for years".
7. On screen: "years: 0 -> 10,000+" counter for cave formation; "CO₂ + water = weak acid"; the depth numbers.

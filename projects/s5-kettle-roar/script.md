# s5 kettle roar: script (v0.2, picture-first; lines and pictures revised by the fact check)

**Idea:** a kettle is loudest before it boils, because steam bubbles collapse in the cooler water above the element;
once all the water is near 100 °C they survive to the top and the roar fades. **Goal:** reach. **Format:** explainer
Reel, 1080x1920, 30 fps, ~35 s. **Voice:** AI m5 (pace 2.7 words/s from the profile).

Chosen hook: 1 (Cold Open Demo: the whole loud-then-quiet arc plays in the first 3 s, so the trap "a result that takes
twelve seconds to arrive" is avoided). Alternatives in `notes/hooks.txt` (checker clean):
- "Why is your kettle loudest below 100 degrees?" | LOUD, BUT NOT 100 °C YET. Second sentence: "Because that roar is
  steam bubbles dying before they reach the top."
- "Loud versus quiet: only one is 100 degrees." | LOUD VS QUIET: WHICH BOILS? Second sentence: "And it's not the loud
  one."

## Script

| Time | Spoken line | On-screen text | What the viewer sees | Capture |
|---|---|---|---|---|
| 0-3 | Watch this kettle get loud, then go quieter. | LOUDEST BEFORE IT BOILS | Counter, glass kettle on its base, fairly still water with bubbles dying low down, a warm sheen on the steel plate; a phone on the counter shows a noise bar climbing into red while pale sound rings pulse off the glass; on "quieter" (a jump forward in time) the bar drops to a steady low green, only a few rings, the water rolls and a plume rises | 3D: kettle, kitchen, phone meter |
| 3-6.5 | That roar means your kettle isn't boiling yet. | KETTLE NOT BOILING YET | Rewind tick back to loud; push in on the glass: bubbles bead on the bottom and vanish a few cm up; the water is tinted blue, a thin red layer on the plate | 3D |
| 6.5-12.5 | Here's why. The water touching the hot element boils first, into tiny bubbles of steam. | | Hard cut to macro at the element plate: red layer hugging the metal (label "over 100 °C"), blue water above ("cooler"); bubbles bead in pits and swell; camera drifts in, then the labels appear | 3D macro |
| 12.5-19 | But the water above it is cooler, so each bubble rises, cools, and collapses back into water. | STEAM → WATER | One hero bubble lifts out of the red into the blue, slows, crumples, snaps shut to nothing and fires a bright ring; the camera tracks up with it, then holds on the ring | 3D macro, tracking camera |
| 19-23.5 | All those tiny collapses, ringing through the kettle: that's the roar. | | Pull back: a glittering band of collapses above the element, rings overlapping, hitting the glass; then a cut to the counter, phone bar in the red, rings off the glass | 3D macro → counter |
| 23.5-29.5 | Once all the water is near 100 degrees, the bubbles survive to the top and pop gently. | NEAR 100 °C: BUBBLES SURVIVE | The whole blue column warms evenly to orange; the height where bubbles die climbs until they ride to the surface, popping softly; rings fade to a few; then the label "100 °C" on the water | 3D macro (side view of the column) |
| 29.5-36 | So the roar means not yet. The quieter bubbling is the boil, right before the click. | | Counter: bar low-mid (not zero), rolling boil in the glass, plume, then ~1.5 s later the switch light clicks off; then a cut to a split of the same framing: left loud kettle "ROAR: NOT YET", right "QUIETER: BOILING" | 3D |

Spoken numbers: "100 degrees" (row 6) shows as "100 °C" on the card and the water label. No other numbers are spoken.
No rate, dB, Hz or peak temperature anywhere (no measured source; research and fact-check agents 2026-11-19).

---

## Look sheet

**Style.** `styles/realistic-3d` + look pass (ACES once, hemisphere fill, environment map on the glass and steel,
vignette, light grain). One luminous layer: the temperature tint in the water, the bubbles' collapse flashes and rings,
the sound rings in the air, labels.

**World and scale.** 1 unit = 1 m. "Glass Kettle" (found, ~0.22 m tall, glass jug on a black base) on the counter of
"Small Modern Kitchen" (found), morning. A phone (built in code: black rounded slab 0.075 x 0.155 m, screen drawn each
frame) lies flat beside the kettle, screen angled to camera, showing a noise bar. Macro set: the element plate
(brushed steel disc at the jug's floor, built in code, matched to the model) and the water volume above it, seen at
~1:8 (frame ~4 cm wide).

**Light.** Morning kitchen: warm key from the window right (5000 K), soft fill; the base's switch light blue when on,
off at the click. Macro: dark water, warm glow off the plate, the tint carries colour.

**Colour meanings.**
| Colour | Means | On |
|---|---|---|
| Red #FF3A22 | superheated water, over 100 °C | only the thin layer on the plate |
| Orange #FF9A3A | the whole column near 100 °C | the column tint at the end |
| Blue #2A7BFF | cooler water | the water above |
| White-gold flash + ring #FFE7A8 | one collapse = a click of sound | collapses, rings in water |
| Pale white rings | sound leaving the kettle | air around the glass (counter shots) |
| Phone bar green → red | loudness | the phone |
Everything else natural.

**States.**
| Item | States | Look |
|---|---|---|
| Water | cooler → near 100 °C | blue tint, red layer 3 mm on the plate; the whole column warms evenly to orange (convection mixes it), the collapse height climbs |
| Bubble (near the plate) | beads → swells → detaches | small clear spheres with a bright rim |
| Bubble (in blue) | rises → slows → shrinks/crumples → gone, flash + ring | noise-displaced sphere scaling to 0 |
| Bubble (all red) | rises → swells → pops at the surface | grows, reaches top, small splash ring |
| Sound | many rings / a few (a boil still bubbles) | rings in air, the phone bar |

**Thread.**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| Phone bar + kettle | push in | bubbles at the glass bottom | the bubbles were visible through the glass in the wide |
| Glass bottom | **cut** (on "Here's") | element macro | the red layer at the bottom |
| Element macro | tracking camera up | hero bubble collapse | the bubble the camera follows |
| Collapse ring | pull back + **cut** | counter, phone bar red | the rings become rings in air |
| Counter | **cut** (on "Once") | macro side view, column warming | the bubbles |
| Surface pops | **cut** (on "So") | counter, bar low, click | the plume |

## Frame maths

1080x1920. Captions top 250-470 (kit). Reels covered: top ~220, bottom ~420, right rail ~120. Cards sit at y ~1300-1400
(left 80, right 960). Labels in world clamped to x 50-1010 (kit/label.tsx). Kettle in the wide: jug ~700 px tall,
centre x 540, y 760-1460; phone low-left, screen visible y ~1350-1480 (above the 1500 cover line).

## Claims to verify (fact-check agent)
- Water touching the element boils first while the water above is cooler (subcooled nucleate boiling): Naked Scientists
  2013/2016; US 4,869,233.
- Bubbles collapse in cooler water; those collapses make the noise and set the vessel ringing: Aljishi & Tatarkiewicz,
  Am. J. Phys. 59, 628 (1991); Katona KFKI-1981-14.
- Near 100 °C bubbles survive to the surface, pop gently, quieter: Naked Scientists.
- Quiet comes at the boil, just before the switch clicks off (steam on a bimetal disc): Ingenia; Strix.

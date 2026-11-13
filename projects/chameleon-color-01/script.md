# Chameleon color 01: script v1 (option A, myth-buster; Matthew picked A on 2026-11-13)

**Idea:** Chameleons mostly change color to send messages, and they do it without any green paint: tiny crystals under
a yellow layer bounce back blue (which reads green) when packed close, and orange-red when spread apart. **Goal:**
reach (default). **Format:** Instagram Reel 9:16, narrated explainer, one continuous 3D shot (three.js in Remotion, the
Octopus 01 kit), rainforest branch → into the skin → back out. **Voice:** American male design-m2, cloned from
`projects/grand-canyon-01/vo/ref_design-m2_hook.wav` (same as Octopus 01). **Music:** "Floating Cities" (Kevin
MacLeod, CC BY 4.0). **No call to action.** **Runtime:** ~68 s (179 words at ~2.8 words/s plus pauses).
Reading level: Flesch-Kincaid grade 2.2, 7.2 words a sentence (`python3 ../moon-tides-01/readability.py lines.txt`).

## The chain (each part answers the problem the one before made)
1. Hook: you think they change color to hide; a lot of the time they change color to talk (shown: two males meet).
2. What the colors say: bright = back off; dark = you win; dark also warms a cold chameleon.
3. Problem: how? Twist: the green skin has no green paint.
4. Answer: a yellow layer over tiny crystals in rows.
5. Calm: crystals close → blue bounces back → through yellow → green.
6. Excited: crystals spread → the skin glows yellow-orange.
7. Dark: dark color spreads up from the bottom layer.
8. Recap through every part, landing back on the branch: it might be talking.

## Script
| Time | Spoken line | On-screen card | What the viewer sees |
|---|---|---|---|
| 0:00 | Most people think chameleons change color to hide. | | Frame 0, already moving: leaves sway; a green chameleon on a mossy branch, almost lost among the leaves. The camera drifts in. [hide] in gold. |
| 0:03 | But a lot of the time, they change color to talk. | | A second male climbs up the branch toward it. The two turret eyes swivel to look. [talk] in gold. |
| 0:06 | This one turns bright. It's saying, back off! This is my branch. | Bright = back off | The hero flushes red-orange with yellow bars from the head back, flattens itself sideways to look bigger, opens its mouth a little. |
| 0:11 | The other one turns dark. That means, okay, you win. | Dark = you win | The rival darkens from head to tail, turns and climbs away. |
| 0:15 | Dark skin can also help a cold chameleon warm up in the sun. | | A sunbeam falls on the dark rival as it leaves; a soft heat shimmer over its back. |
| 0:19 | So how does it change color? Here's the strange part. Its green skin has no green paint in it. | No green pigment | The hero calms back to green. The camera pushes into its flank: the scales grow until one fills the frame. |
| 0:26 | Under the clear outer skin is a yellow layer. Under that are tiny crystals in neat rows. | Iridophores · crystal cells | Through the scale into the cut-away block: the yellow layer lights up as it's named, then the crystal lattice below it. |
| 0:32 | When the chameleon is calm, the crystals sit close together. They bounce back blue light. | | A sunbeam (white wave) comes in, hits the packed crystals; a short blue wave bounces back up. |
| 0:37 | The blue light shines up through the yellow layer. And blue and yellow make green! | Blue + yellow = green | The blue wave passes the yellow layer and leaves the skin green. |
| 0:42 | When it gets excited, the crystals spread apart. | | The lattice breathes out: every crystal moves apart (camera holds on one row). |
| 0:46 | Now the skin glows yellow and orange instead. | Spread apart = orange | The same beam now bounces back as a long orange wave and leaves the skin yellow-orange. |
| 0:50 | And to turn dark, dark color spreads up from the bottom layer. | Melanophores · dark cells | Dark cells at the bottom reach up branching arms between the crystals; the block dims. |
| 0:55 | So crystals close together make green. Crystals far apart make orange. Dark color from below makes it dark. | | Recap at speed, one beat per clause: lattice closes (green), opens (orange), dark arms rise (dark). |
| 1:02 | Next time a chameleon changes color, look closely. It might be talking! | | Camera climbs back out of the skin to the branch: the hero, green again, turns one turret eye to the camera. |

Times are the stand-in estimate; the film times every beat from the generated voice (`film/src/beats.json`).

## One visual language
| Thing | State | Look (one per state) |
|---|---|---|
| Chameleon | calm / bright / dark | green with soft yellow-green bars / red-orange, yellow bars, blue spots / brown-black |
| Light | sunlight / bounced | white wave / colored wave (short wiggles = blue, long = red) |
| Yellow layer | named | flattened golden cells, glowing |
| Crystals | close / apart | tight lattice tinted blue / wide lattice tinted orange |
| Dark cells | spreading | branching dark arms rising from the bottom |
| Cards | science names | centred card, white text; key words in captions take gold |

## Draft caption
Chameleons don't change color only to hide. Their fast, dramatic color changes evolved mostly as signals to other chameleons
(Stuart-Fox & Moussalli 2008); darkening also helps them warm up, and some species do adjust camouflage. Panther chameleon green comes from structure, not green pigment: guanine nanocrystals in
iridophore cells reflect blue, seen through a yellow pigment layer. When excited, the crystals move apart and reflect
longer wavelengths, so the skin turns yellow-orange (Teyssier et al. 2015, Nature Communications; shown in adult male
panther chameleons). Red patches come from red pigment. Original 3D
model, not a specific animal. Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS).

## Claims to verify
Fact-check by a fresh agent (2026-11-13, claims as worded), applied:
- "But mostly, they change color to talk" -> "But a lot of the time": signalling drove the fast changes, but colour change
  also serves camouflage (dwarf chameleons match differently for birds and snakes) and warming up.
- "its skin cells swell, and the crystals spread apart" -> "the crystals spread apart": the cell mechanism is still
  open (Teyssier reproduced the spread with salt levels).
- "bounce back orange and red light" -> "the skin glows yellow and orange": the lattice shifts to long (red/infrared)
  light, but the skin turns yellow/orange; red patches are red pigment cells.
- Recap "Crystals far apart make red" -> "make orange" (same reason). Wrong as worded.
- "it isn't hiding. It's talking." -> "look closely. It might be talking!": absolute; some change is camouflage.
OK as worded: hook belief (the PLoS Biology paper argues against exactly it), bright = winning/aggression and dark =
submission (Ligon & McGraw 2013; Ligon et al. 2018), dark helps warming (Stuart-Fox & Moussalli 2009), no green
pigment (Teyssier lists melanin, a dark-blue pigment, yellow and red), layer order (Teyssier; Bagnara 1968 dermal
chromatophore unit), calm lattice reflects blue (~30 % closer), blue under yellow = green, dark pigment spreads up.

| Claim | Source (opened unless marked) |
|---|---|
| Crystal lattice, spacing, blue/long-wave shift, pigments | Teyssier et al. 2015, Nat Commun 6:6368, https://pmc.ncbi.nlm.nih.gov/articles/4366488/ |
| Colour change evolved for social signalling | Stuart-Fox & Moussalli 2008, PLoS Biol, https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.0060025 |
| Darkening aids heat absorption; camouflage roles | Stuart-Fox & Moussalli 2009, Phil Trans R Soc B, https://pmc.ncbi.nlm.nih.gov/articles/PMC2674084 |
| Layer order (dermal chromatophore unit) | Bagnara et al. 1968, https://pmc.ncbi.nlm.nih.gov/articles/PMC2107474 |
| Dark = submission in veiled chameleons | Ligon et al. 2018 via Inside Science (paper not opened) |
| Brighter, faster change predicts winners | Ligon & McGraw 2013, Biol Lett (press coverage only; paper not opened) |

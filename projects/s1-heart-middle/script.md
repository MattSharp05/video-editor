# s1 Heart in the middle: script (v0.2, picture-first; board rendered from the real scene)

**Idea:** your heart isn't off on the left: it sits behind your breastbone near the middle of the chest, leaning
left, so CPR goes on the lower half of the breastbone. **Goal:** reach (saves second). **Format:** Instagram Reel,
1080x1920, 30 fps, ~38 s. **Voice:** m5. **Music:** Floating Cities. Times below are the stand-in (2.8-3 words/s)
until the VO is aligned; every picture event is cued from a word in `film/src/timeline.ts`.

Numbers are **starting values**: the stills tuned them, and the board is the reference over the text.

---

## Look sheet (every beat)

**Style.** Realistic 3D (`styles/realistic-3d`) in a dark studio, with one luminous layer: the glass skin, the amber
centre line, the axis and the pulses. Look pass: ACES once (exposure 1.0), a RoomEnvironment PMREM on the hero
objects only, hemisphere fill, vignette and light grain (`Finish`, bloom 0.3).

**World and scale.** 1 unit = 1 m. A man 1.94 m tall stands at the origin facing +Z; his left is +X. Chest front at
the midline z = 0.188 m; heart centre (0.012, 1.36, 0.075); heart 14.5 cm tall with its vessels (real: ~12 x 8 x 6 cm);
ribcage fitted to the chest (~31 cm wide). Studio: floor at y = 0, back wall at z = -3.6.

**Light.**
| Setting | Value | Why |
|---|---|---|
| Key | warm #FFE2C4, 2.6, from front-left above (-1.6, 3.2, 2.4) | models the chest muscles, lights the side we show |
| Rim | cool #9FD8E6, 2.2, from behind right | separates the glass body from the wall |
| Fill | hemisphere #A9C4CC / #2A2420, 0.55 | lifts the shadow side |
| Wall | teal #0F1E21 centre falling to #030507 at the top, a faint ECG trace beating with the heart | the film's world: the heartbeat, dimmed |
| Floor | #2B2A2C, roughness 0.42, a soft pool of light under the man | grounds him |

**Colour meanings (whole film).**
| Colour | Means | Used on |
|---|---|---|
| Coral #FF5A4E | the myth / the left / "don't" | heart glow on the left chest, the apex pulse, the "no" glow under the hand on the left |
| Amber #FFB547 | the answer / where it really is / push here | centre line, breastbone glow, axis, push spot, blood to the brain, "⅔ left", rate |
| Heart red (model) | the heart itself (the lead) | the heart |
| Glass white #EAF6FF | the body, neutral | skin rim, ribs (ivory, 62 %) |

**Camera rules.** 50 mm standing (36 mm sensor, vertical FOV 39.6°: framed height = 0.72 x distance), 35 mm lying.
The camera never parks. One hard cut, on "And that matters" (`CUT_CPR`): standing glass body -> the same body lying
on the floor seen from above; a camera move can't carry a standing body to a lying one without a fake.

**Frame and safe areas.** Captions y 250-470 over a top scrim. Lead inside x 60-1020, y 520-1500.

**Visual language: states.**
| Item | States | Look |
|---|---|---|
| Body | skin -> glass | warm matte skin; glass = dark tint, bright rim |
| Heart | upright on the centre line -> leaning (45° left, 18° forward) -> squeezed (CPR) | beats ~70 bpm while standing; front-to-back squash with each push lying |
| Glow | coral = myth/left, amber = right answer | soft additive sprites, never boxes |

**Thread.**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| Coral heart glow on the left chest | transform (skin to glass) | the real heart near the middle | the glow fades as the heart appears behind it |
| Heart | orbit 3/4 | breastbone glow in front of it | the camera move |
| Breastbone | back to front | amber centre line sweeping down through the heart | the line starts at the breastbone |
| Heart on the line | lean | axis line, "⅔ left / ⅓ right" | the axis is drawn through the heart |
| Apex | pulse | coral rings on the skin below-left | the apex glow |
| (cut on "And that matters") lying body from above | hand lands on the left (coral "no") | slides to the centre (amber spot) | the hand |
| Hands | push | heart squeezes, blood to the brain | each push |

## Frame maths (checked before writing distances)
- Hook: chest at 1.85 m, 50 mm: framed height 1.33 m, width 0.75 m: shoulders to hips. The coral glow (0.12 m) = ~170 px.
- Lean/tip: 0.95 m: height 0.68 m, width 0.39 m: the 31 cm ribcage fills ~85 % of the width; heart ~260 px tall.
- Lying: 35 mm (vertical FOV 54°) from ~1.1 m: height 1.1 m, width 0.63 m: chest and hands. A 5 cm push = ~90 px.

## Beats (stand-in times)
| # | Time | Line | Start frame / action / camera / lead / end frame |
|---|---|---|---|
| 1 | 0.0-4.4 | Most people think your heart is on the left side of your chest. | Chest mid shot, 50 mm at 1.85 m from front-right, pushing in to 1.45 m. A coral heart-shaped glow pulses at 70 bpm on the left chest (x +0.115 m, y 1.355). Lead: the glow. |
| 2 | 4.9-5.6 | Look inside. | Skin turns to glass in 0.95 s; the glow fades; ribs and the real heart appear behind it, near the midline. Lead: the heart. |
| 3 | 6.1-9.8 | It sits behind your breastbone, near the middle of your chest. | Orbit to 3/4 (camera -0.78, 1.44, 1.0): the breastbone glows amber in front of the heart. Back to front: an amber centre line sweeps down head to toe and runs through the heart. |
| 4 | 10.4-14.4 | It just leans left, so its tip points down to the left. | Closer (0.95 m). The heart tips 45° to the left and 18° forward; an amber axis line draws base -> apex; labels "⅔ left" (amber) and "⅓ right" either side. The apex glows coral. |
| 5 | 15.0-17.5 | That tip is the beat you can feel. | Coral rings pulse on the skin where the apex beat is felt (5th rib gap, ~8.8 cm left of the midline), in time with the beat. Camera drifts right toward the tip. |
| 6 | 18.1-21.3 | And that matters if you ever need to do CPR. | **Cut** to the same glass body lying on the floor, seen from above at 35 mm. A rescuer's hand comes in from above. |
| 7 | 21.9-23.8 | Don't push on the left side. | The hand settles over the left chest; a coral glow under it. |
| 8 | 24.3-27.2 | Push hard on the lower half of the breastbone. | The hand slides to the amber spot on the lower half of the breastbone; the second hand stacks; pushing starts (110/min, 5 cm). |
| 9 | 27.8-31.0 | Each push squeezes your heart and chest against your spine, | Camera lowers to the side: each push sinks the chest wall, the heart squashes front to back. |
| 10 | 31.6-33.8 | and pushes blood out to the brain. | Amber beads run from the heart up the neck to the head on each push. |
| 11 | 34.4-37.5 | Push about two times a second, until help comes. | Pull up and away to the whole body; "100-120 a minute"; pushing continues to the end. |

## Captions (key words in amber)
1. Most people think your heart is on the [left] side of your chest. 2. Look inside. 3. It sits behind your
[breastbone,] near the [middle] of your chest. 4. It just [leans] left, so its tip points down to the left. 5. That
[tip] is the beat you can feel. 6. And that matters if you ever need to do [CPR.] 7. Don't push on the left side.
8. Push hard on the [lower half] of the [breastbone.] 9. Each push squeezes your heart and chest against your spine,
10. and pushes [blood] out to the brain. 11. Push about [two times a second,] until help comes.

## On screen
"⅔ left" / "⅓ right" (Gray's Anatomy 1918: two-thirds of the heart left of the median plane); "100–120 a minute"
(ERC 2025 / AHA 2025).

## Sound cue list (CC0 sfx-29-61 or synthesized)
Heartbeat lub-dub (synth) under beats 1-5 on the beat times; glass shimmer on "Look inside"; sweep whoosh on the centre
line; soft tick on the axis; deep whoosh peaking on the cut; soft thump on the hand landing; dull chest thump per push
(synth, from `pressTimes`); low swell under the blood beads. Music: Floating Cities, ducked under the voice.

## Assets
| Asset | Source | Licence |
|---|---|---|
| Human Heart 3D Model, Mesh-Magnet | Sketchfab 5da08bb1... | CC BY 4.0 |
| Thorax, valchanov | Sketchfab c918b12c... (simplified to 154k) | CC BY 4.0 |
| Human Base Mesh 01, 3D Sculpt Daily | Sketchfab a2a8c76b... | CC BY 4.0 |
| Hands | kit (WebXR generic-hand) | MIT |
| Studio, glass, glows, lines | built in code | ours |

## Claims to verify
1. Most people think the heart is on the left side of the chest (framing; no survey: Weinman 2009, ~half can't place it).
2. It sits behind the breastbone, near the middle of the chest (mediastinum; two-thirds left of the midline).
3. It leans left; its tip points down and to the left (apex: down, forward, left).
4. The tip (apex) is where you can feel the beat (apex beat / point of maximal impulse).
5. CPR: push hard on the lower half of the breastbone, not on the left.
6. Each push squeezes the heart and chest against the spine and pushes blood to the brain.
7. About two pushes a second; 100-120 a minute; 5-6 cm deep (shown: 5 cm).
8. ⅔ left / ⅓ right of the midline.

## What the board changed (v0.1 -> v0.2)
| Beat | Script said | Stills showed | Now |
|---|---|---|---|
| 1 | a hand slaps on the left chest | a separate hand on a standing man reads as someone else's | the myth is a coral heart glow on the skin; the hand is the CPR rescuer's |
| 3 | a giant sheet of light seen from 3/4 | a plane seen at 3/4 washes the whole frame amber; edge-on it is a line | front view: the sheet edge-on + a line on the skin = one bright line through the heart |
| 3 | breastbone glow at z 0.17 | at 3/4 it floated 10 cm in front of the ribs | placed on the ribcage's front (measured) |
| 4 | lean 52° | axis read nearly horizontal | 45°, 18° forward |
| 5 | rings at the myth spot | the felt apex beat is lower and more central than the hand-on-heart spot (research) | rings at the 5th rib gap, 8.8 cm left |
| 8-9 | camera on the rescuer's side | the arms filled the frame | camera on the far side; arms go away from it |
| all | body mesh used as loaded | its node is rotated: shader "local" axes were wrong (line, press) | node transforms baked into the geometry |

## Fact check (fresh agent, 2026-11-19)
Sources: OpenStax A&P 2e §19.1; Gray's Anatomy 1918 (via IMAIOS); Radiopaedia "Heart"; STS Cardiac Anatomy; ERC 2025
adult BLS (RCUK); AHA 2025 Heartsaver summary; ILCOR BLS 2502; Prinzing et al. 2015 J Thorac Dis; Weinman et al. 2009
BMC Fam Pract.
| Line | Verdict | Change |
|---|---|---|
| 1 "Most people think..." | reword: no survey measures the belief (Weinman 2009: only ~half could place the heart) | "Lots of people think..." (keeps the series' mythbuster format; "lots" is supported, "most" is not). Logged decision: the checker proposed "You might think" |
| 3 behind the breastbone, near the middle | holds | |
| 4 leans left, tip down-left | holds | "just" dropped (two-thirds of the mass is left: on screen) |
| 5 "That tip is the beat you can feel" | reword: palpable in only 25-73 % of adults | "That tip is where you can often feel the beat." |
| 7 Don't push on the left | holds with caveat (guidelines: central, not over the ribs) | kept next to line 8 |
| 8 lower half of the breastbone | holds (ERC 2025, AHA 2025) | picture depth 5 cm -> 5.5 cm (inside 5-6 cm and >= 2 in) |
| 9 "squeezes your heart and chest against your spine" | reword (heart-pump theory: heart between sternum and spine) | "Each push squeezes your heart between your breastbone and spine," |
| 10 "pushes blood out to the brain" | reword: CPR gives about a third of normal brain flow | "and pushes some blood up to the brain." |
| 11 about two a second | holds (100-120/min) | |
| ⅔ left / ⅓ right; 100-120 a minute | hold | |
| picture: 45° lean, 5th rib gap 8.8 cm | hold; 18° forward tilt is a visual only (no number on screen) | |

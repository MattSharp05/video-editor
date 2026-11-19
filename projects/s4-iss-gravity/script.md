# s4 ISS gravity: script (v0.1, picture-first; brain teaser)

**Idea:** astronauts on the Space Station float, but gravity there is still about 90 % of the ground's; they float
because the station and everything in it are falling together while flying sideways fast enough to keep missing
Earth. **Goal:** reach (shares, comments: people argue about "zero gravity"). **Format:** Reel 1080×1920, 30 fps,
~42 s. **Voice:** m5. Pace for drafting 2.8 words/s (m5 measured in s4-sinkhole: 114 words in 41 s with pauses).
Numbers in the shot notes are **starting values**; the board tunes them.

## Hooks (`hooks.txt`, `check_script.py --hooks`)
1. **Chosen (Cold Open Demo):** "Watch this astronaut float. How much gravity is up here?" | card HOW MUCH GRAVITY UP HERE?
   1.4 s; the picture is already doing the thing.
2. Alt: "Zero gravity on the Space Station is a myth." | NOT ZERO GRAVITY (3.2 s: shorten if used).
3. Alt: "Nobody tells you the Space Station has 90% gravity." | 90% GRAVITY UP HERE (gives the answer away; 3.2 s).

## Lines (v0.1)
| # | Spoken | Card (on screen) | Picture (summary) |
|---|---|---|---|
| 1 | Watch this astronaut float. How much gravity is up here? | HOW MUCH GRAVITY UP HERE? | astronaut floating above a bathroom scale outside the station; the scale reads 0.0; a pen hangs beside him |
| 2 | None? Half? Almost all? Pause and guess. (1.5 s pause) | NONE? / HALF? / ALMOST ALL? | the scale's dial fills the frame, needle sweeps to each option as said, then trembles in the pause |
| 3 | Build a tower four hundred kilometres tall, and step off the top. | 400 km | a needle-thin tower grows out of the globe up to the station's height; cut to its top: the astronaut on the scale at the edge |
| 4 | You'd fall, fast. Gravity up there is still about ninety percent as strong. | ~90% | the needle swings to ~90 %; he steps off and drops away down the tower |
| 5 | So why does the crew float? The station is falling too. | FALLING | globe wide: the station's straight-ahead path (dashed) peels away above its real, curving path |
| 6 | It's also flying sideways at almost eight kilometres a second. | 7.7 km/s | cannon shots from the tower top, each faster, land farther round the globe |
| 7 | As it falls, the curved Earth drops away beneath it. It keeps missing. | | the last shot never lands: it laps the planet and passes the tower: the station's orbit |
| 8 | The crew falls with it, so the scale reads zero. | 0.0 | back at the station: astronaut, scale and pen all fall together; equal amber arrows on each; the scale reads 0.0 |
| 9 | Not zero gravity. Free fall, all the way around the planet. | ~~ZERO G~~ FREE FALL | pull out to the whole orbit glowing round the globe |

~97 words → ~35 s speech + 1.5 s pause + ~3 s gaps + 2 s tail ≈ 41.5 s.

---

## Look sheet

**Style.** Realistic 3D in orbit (`styles/realistic-3d` finish: ACES, exposure per shot; vignette + grain) with
luminous-3D accents for the paths (emissive lines, additive halos). Earth from the globe kit (NASA Blue Marble /
Black Marble; it is November: the day texture's northern-winter snow is right for the season, no melt).

**World and scale.** 1 unit = 1 km. Earth centre at the origin, R = 6371. Station orbit r = 6771 (400 km up).
The station model is 109 m wide (0.109 units). **Camera-relative rendering:** every shot has a fixed origin (the
station, the tower top, or Earth's centre) and the whole world is drawn shifted by −origin, so close shots have
small coordinates (float32 at 6771 km is ~0.5 m: a 2 m astronaut would jitter). Log depth buffer, near 0.0005.

**Light.**
| Setting | Value | Why |
|---|---|---|
| Sun | directional, white #FFF6E8, from frame-left-above in the station shots (≈ 35° above the station's horizon) | hard space light, rim on the suit |
| Fill | none from space; Earthshine hemisphere #6FA8DC from below at 0.35 | the side facing Earth reads blue, not black |
| Exposure | ACES 0.9 close shots, 1.0 globe shots | white suit not clipped |
| Background | stars (globe kit), black | |

**Colour meanings (fixed for the film).**
| Colour | Means | Used on |
|---|---|---|
| Amber #FFB547 | gravity / the answer | ~90% readout, the needle at the answer, pull arrows, "FREE FALL" |
| Ice #8CCBFF | a path, a speed | dashed straight-ahead path, cannon trails, the orbit line, 7.7 km/s |
| Coral #FF5A4E | the wrong idea | "ZERO G" struck through, the "NONE?" option glow |
| White/grey/Earth | neutral | suit, station, tower, scale |

**Materials.** Tower: thin white lattice (procedural) with a soft emissive edge so a 6 km-wide needle reads at globe
scale (exaggerated ×15 in width; real width is not the point). Scale: white plastic body, glass dial face, black
ticks, amber needle.

**Lens and camera.** 35 mm (filmGauge 36) close, 50 mm globe. The camera never parks: slow orbit/dolly in every shot.

**Safe areas.** Captions y 250–470; lead in y 520–1500; bottom 420 px and right rail clear.

**Visual-language states.**
| Item | States and look |
|---|---|
| Scale | floating, reads 0.0 (needle at 0, white) → standing on the tower, needle swings to ~90 % (amber) → falling with the crew, 0.0 again |
| Paths | straight-ahead (dashed ice) · real (solid ice) · orbit (ice glow, full ring) |
| Cannon shot | fired (flash at the tower top) → trail (ice) → lands (small dust flash) / never lands (laps, joins the orbit) |

**Thread.**
| Lead | Move | Next lead | Carrier |
|---|---|---|---|
| astronaut above the scale | push in | the scale dial | the needle |
| dial | cut (CUT_TOWER) | tower growing from the globe | the station (amber dot) at the tower's height |
| tower | cut (CUT_TOP) | the scale on the tower top | the scale |
| falling astronaut | cut (CUT_GLOBE) | the station on its orbit | downward fall → the station's downward-bending path |
| path | the tower fires | cannon trails | the tower top |
| last trail | becomes | the orbit | the trail itself |
| orbit | cut (CUT_CREW) | the crew and scale | the station |
| crew | pull back (no cut) | the whole orbit | the station |

## Beats and shot notes (times approximate until the VO is aligned)

**1 (0–3.2 s) "Watch this astronaut float. How much gravity is up here?"**
- Start frame: astronaut (2 m) floating, centre at (540, 1000), head up; under his boots, 0.4 m below, a white
  bathroom scale (0.3 × 0.3 × 0.05 m) floating flat, dial facing camera (needle at 0, reads "0.0"); a pen turning
  slowly by his right glove. Behind: the station's truss and solar arrays across the upper frame; Earth fills the
  bottom 40 % (blue, clouds). Camera 5 m from the astronaut, 35 mm, slightly below, slow orbit 8°/s.
- Action: the float loop plays; the pen tumbles; card HOW MUCH GRAVITY UP HERE? from frame 0.
- Lead: the astronaut, then the scale on "gravity".

**2 (3.2–7.8 s incl. 1.5 s pause) "None? Half? Almost all? Pause and guess."**
- Push in to the scale dial (fills ~700 px). The dial: 0 to 100 % of ground gravity, three marks labelled NONE (0),
  HALF (50), ALMOST ALL (90–100). The needle sweeps to each on its word; each label lights (NONE coral). Pause: the
  needle trembles between, a ring ticks round the dial (1.5 s).
- End: the dial, needle wobbling.

**3 (7.8–11.8 s) "Build a tower four hundred kilometres tall, and step off the top."**
- CUT_TOWER on "Build": globe shot. Camera 2,300 km from the surface over the Atlantic at dawn line, Earth's limb
  across the lower frame; a white needle tower rises from the surface (300 km/s of growth over 1.3 s) to 400 km;
  label "400 km" beside it. The station (amber dot with a halo, model too small) slides along its orbit to pass the
  top. Everest marked as a 9 km speck at the base for scale (a tiny cone, label "Everest").
- CUT_TOP on "and step off": the tower top, a 6 m platform with a rail, Earth 400 km below filling the lower frame,
  the astronaut standing on the scale at the edge.

**4 (11.8–16.5 s) "You'd fall, fast. Gravity up there is still about ninety percent as strong."**
- On "fall": he tips forward off the edge and drops (4.3 m/s² … true ~8.7 m/s²) away down the tower side, the camera
  tilting to follow; the scale is left on the edge. On "ninety": a second take of the same top: the needle swings to
  ~90 %, readout "~90%" in amber, the empty scale... (board decides: one shot with the scale reading before the fall).
- Order in the shot: needle swings to ~90 % (stood on) → he steps off → falls away, small within 2 s.

**5 (16.5–20.5 s) "So why does the crew float? The station is falling too."**
- CUT_GLOBE: wide globe, camera 9,000 km out, the orbit plane tilted 25°; the station (amber dot + model glints) moves
  along its orbit; a dashed ice line runs straight ahead from it (where it would go without gravity); its real path
  (solid ice) bends below the dashed line, the gap growing; label FALLING with a small amber arrow down.

**6 (20.5–24 s) "It's also flying sideways at almost eight kilometres a second."**
- The tower on the globe fires shots horizontally: 3, 5, 6.5 km/s; their trails curve down and land farther round
  the globe (flash on landing); readout counts up in ice.

**7 (24–29 s) "As it falls, the curved Earth drops away beneath it. It keeps missing."**
- The last shot at 7.7 km/s never lands: its trail laps the globe (time-compressed) and passes behind the tower,
  then glows as the orbit; the station rides it.

**8 (29–33 s) "The crew falls with it, so the scale reads zero."**
- CUT_CREW: back at the station (as beat 1, other side): astronaut, scale and pen; equal amber arrows down on the
  station, astronaut, scale and pen; the scale reads 0.0.

**9 (33–39.5 s) "Not zero gravity. Free fall, all the way around the planet."**
- No cut: pull back from the crew to the whole Earth with the orbit ring glowing; card ZERO G (coral) struck through,
  FREE FALL (amber) along the orbit. Hold to the end (+2 s).

## Claims to verify
| Claim | Source |
|---|---|
| The station orbits about 400 km up | NASA ISS facts and figures |
| Gravity at 400 km is about 90 % of the surface value (≈ 88.5 %: (6371/6771)²) | NASA "What is microgravity?"; inverse-square law |
| A person stepping off a 400 km tower would fall | NASA microgravity (falling, not absence of gravity) |
| The station flies at almost 8 km/s (≈ 7.66 km/s, 17,500 mph) | NASA ISS facts |
| Astronauts float because they and the station are in free fall together | NASA |
| The station keeps falling around Earth, missing the ground (Newton's cannonball) | NASA "What is microgravity?" / Newton's Principia |
| A scale under a free-falling astronaut reads zero | standard mechanics |
| Everest is ~8.8 km (for the speck) | National Geographic 2020 survey 8,848.86 m |

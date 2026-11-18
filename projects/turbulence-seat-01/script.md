# Turbulence seat 01: script (v0.3, picture-first format test; board v1 rendered)

**Idea:** a plane rocks like a seesaw around a point near its wings, so the seats over the wing move
least and the back rows move most. **Goal:** reach. **Format:** Instagram Reel, 1080×1920, 30 fps,
~44 s. **Voice:** to choose (Matthew or the AI voice); timings below are a stand-in at 2.8 words/s
(`film/standin_words.py`), so beat times are approximate until the VO is aligned.

Numbers in the shot notes are **starting values**: the reference stills tune them, and an approved
still becomes the reference over the text.

---

## Look sheet (applies to every beat)

**Style.** Realistic 3D world (`styles/realistic-3d`, realism kit sky) with one luminous layer on top:
the glass hull, the giant cups and the trails. Look pass applies (ACES once, sky-coloured hemisphere
light, environment on hero objects only, vignette and light grain).

**World and scale.** 1 unit = 1 m. Boeing 757-200: 47.3 m long, 38 m span. Cruise above a cloud
deck: cloud tops 300 m below the fuselage, gently rolling, extending to the horizon. No ground visible.

**Light.**
| Setting | Value | Why |
|---|---|---|
| Time | Golden hour, sun 10° above the horizon | Long warm light, rim on the hull, coloured cloud tops |
| Sun direction | From frame-left and slightly behind the camera (azimuth ~35° off the camera axis) | Light the side we show; the camera-facing fuselage reads white, not grey |
| Sun colour | from `skyLight()` at 10° (≈ #FFD7A0) | Matches the sky, never picked by eye |
| Sky | Preetham, turbidity 3: deep blue #2E5D9A overhead → peach #F3C7A0 at the horizon | Air and depth |
| Cloud tops | lit side #FFE6CC, shadow side lavender #9A9CC4 | Warm/cool split carries depth |
| Haze | horizon colour, visibility ~40 km | Clouds fade to the sky at the horizon |
| Cabin | warm ceiling strip 3000 K (#FFD9A8) + sunlit windows on the right (the sun side) | Inside feels like a real evening flight |
| Exposure | exterior 0.30, cabin 0.62 (ACES; tuned on the board) | Set per shot like a camera |

**Colour meanings (fixed for the whole film).**
| Colour | Means | Used on |
|---|---|---|
| Amber #FFB547 | calm / the answer | the pivot, the middle cup's glow and trail, wing rows, "smoothest rows" |
| Coral #FF5A4E | rough | the back cup's spill and trail, tail rows |
| Orange #FF8A4C | in between | the front cup's trail, front rows |
| Glass white #EAF6FF | the plane itself, neutral | hull rim, cup glass |
| Water #BFE8F2 | water | clear water with a bright highlight |
Everything else stays desaturated. The lead of each beat is the brightest, most saturated thing in frame.

**Materials.** Hull paint: white #F2F2EE, roughness 0.35, clearcoat. Glass hull: tint #CFE6F5 at 12 %
opacity, Fresnel rim #EAF6FF (bright at grazing angles), seats inside visible at 70 % contrast. Giant
cups: clear plastic tumblers, slight blue tint, thick bright rim, water inside with a moving surface.
Seats (found model): navy fabric, white plastic shell, red-and-grey seatbelt.

**Camera rules.** Continuous moves, with four hard cuts where the camera would cross the hull (v3, Matthew
2026-11-18: "we dont need a single shot in this one"): into the cabin before "But watch", out to the plane before
"Front.", from the seat map to the seat before "and keep", out to the plane 0.7 s after the last word. Lens on a 36 mm sensor: 50 mm exterior, 24 mm cabin,
35 mm top-down. The camera never parks: every beat has a slow move with parallax (clouds against
plane). Moves ease through keys (PCHIP), no stops. Zooms never crop the lead.

**Frame and safe areas.** Captions y 250–470 over a top scrim. Lead inside x 60–1020, y 520–1500.
Nothing important below y 1500 or right of x 930 below y 1100 (Instagram UI).

**Visual language: states.**
| Item | States, in order | Look |
|---|---|---|
| Cup | calm → sloshing → spilling | calm: flat water, soft glow; sloshing: tilted surface, ripples; spilling: water leaps over the rim, droplets, coral flash on the rim |
| Row of seats | neutral → coloured by distance | neutral: seat colours; coloured: soft emissive glow in the gradient amber → orange → coral |
| Trail | appears with motion, covers the last 3 s | a glowing bead 1.2 m above each cup draws a line in the cup's colour, brightest at the newest point |

**Thread (hand-offs).**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| Plane in clouds | cut (was pass through the window) | back cup in cabin | push toward the back window, cut on "But" |
| Back cup | cut to the plane (was up through the roof) + hull turns to glass | three giant cups | the back cup grows into its giant |
| Giant cups | travel (pitch) | trails | each trail leaves its cup |
| Trails | converge | pivot | the trails visibly circle the pivot |
| Pivot | transform | fulcrum wedge | the pivot glow extends down into the wedge |
| Fulcrum | open | coloured rows | colour spreads from the wedge tip along the rows |
| Rows | pull back to top-down | seat map | the glass fuselage flattens into the map |
| Wing rows on map | cut (was the dive) | seat + belt | the map holds through "over the wing", cut on "and keep" |
| Buckle | cut (was pull back through the window) | plane in clouds (= first frame) | cut 0.7 s after the last word |

---

## Beats

### Beat 1 · 0.0–3.4 s · hook
**Voice:** "Most people think turbulence shakes the whole plane the same."
**Start frame (also the cover):** exterior, golden hour. The white 757 crosses the frame left to right,
nose at frame-right, tail at x≈60, fuselage centred at y≈980, filling 90 % of the frame width. Camera
level with the windows, 50 mm, 46 m out, 2° below the fuselage looking slightly up. Cloud deck below,
lit peach; sun flare off the fuselage near the wing root.
**Action:** at 1.4 s a jolt: the whole plane drops 0.6 m in 0.25 s and recovers (heave only, no
pitch: the "same everywhere" belief). A wisp of cloud tears off the left wingtip. The camera reacts
0.08 s late with a small shake (it rides in the air beside the plane).
**Camera:** dolly in from 46 m to 20 m across the beat, drifting toward the rear third of the cabin
(window row 32).
**Lead:** the plane, then the window at row 32 (brightest window: warm cabin glow inside).
**End frame:** a single window fills 30 % of the frame width, the cabin glowing warm behind it.

### Beat 2 · 3.9–7.1 s · three cups
**Voice:** "But watch these three cups. Front. Middle. Back."
**Start frame:** camera passes through the row-32 window (0.3 s of frame-filling glass glare, the carrier).
**Action:** inside, 24 mm at seated eye height (1.15 m above the floor), behind row 32 looking forward
down the aisle. Foreground: a clear plastic cup of water on row 32's open tray table, 0.6 m from the
lens, sharp. Rows of navy seats recede; warm ceiling strip; sun shafts from the left windows. On
"watch" the camera rises straight up through the ceiling (0.6 s), and while it pulls back to the side
view the hull fades from white paint to glass (opacity 1 → 0.12 over 1.2 s). On "Front." "Middle."
"Back." a giant glass tumbler grows out of each row, 6 m tall, standing on the fuselage roof: front at
row 6, middle at row 18 (over the wing root), back at row 36. The back one grows from the very cup we
were looking at (it scales up along a glowing stem from its tray).
**Camera:** ends at the side view: 50 mm, 62 m out, level with the fuselage, nose to frame-right.
**Lead:** the real cup → each giant cup on its word (soft glow pulse as it lands).
**End frame:** glass 757 side-on across the frame at y≈1150, seat rows visible inside, three giant cups
standing on top (y 760–1060), all water calm. Clouds drift right to left beneath.

### Beat 3 · 7.6–11.5 s · same bump
**Voice:** "Same bump. The back cup spills. The middle one moves least." (fact check: "barely moves" overstated; the middle cup still rises with the plane)
**Action:** on "Same bump" a band of rising air rolls in under the plane from frame-right: cloud wisps
under it are pushed upward and a faint bright shimmer runs along the band. The plane heaves up 0.8 m
and pitches nose-down 4° (the tail rises). The back cup lurches most: its water leaps 1.5 m above the
rim, sheets over the side and breaks into ~40 droplets that fall past the hull; the rim flashes coral.
The front cup sloshes (water climbs one side, no spill). The middle cup's surface only trembles with
fine ripples, its glow staying amber.
**Camera:** slow push from 62 m to 55 m, sliding 3 m toward the tail to favour the spill on "back cup".
**Lead:** the back cup's spill (on "spills"), then the middle cup (on "moves least": the camera eases
toward it).
**End frame:** plane level again; droplets still falling below the back cup; the middle cup's water flat.

### Beat 4 · 12.1–16.3 s · a seesaw
**Voice:** "That's because a plane doesn't just bounce. It rocks, like a seesaw."
**Action:** on "bounce" the plane bobs straight up and down once (all three cups move together). On
"rocks" it pitches nose-up 6° over 1.2 s, then nose-down to −6° over 1.5 s, then settles. Each giant
cup draws a glowing trail behind it in its own colour: the back cup's trail is a tall coral arc, the
front one's a shorter orange arc, and the middle one's an amber smudge barely longer than a dot.
Trails fade over 1.5 s.
**Camera:** pull back from 55 m to 70 m so the full arcs fit (back arc ≈ ±2.5 m vertically).
**Lead:** the trails (brightest elements in frame).
**End frame:** plane level; three trails still faintly visible: a tall arc, a smaller arc, a dot.

### Beat 5 · 16.9–20.1 s · the middle of the seesaw
**Voice:** "And the middle of that seesaw is near the wings."
**Action:** the fading trails curve inward: their centres sit on one point. An amber glow blooms on
the fuselage at the wing root (the pivot), a small bright core with a soft 3 m halo, visible through
the glass. The plane rocks once more, gently (±3°), visibly turning around that glow.
**Camera:** glide from the side view toward the wing root: 70 m → 32 m, orbiting 20° so the near wing
sweeps across the frame (parallax with the clouds).
**Lead:** the pivot glow.
**End frame:** the wing root and pivot centred at y≈1000, the middle cup above it, the near wing
reaching toward the camera at lower-left.

### Beat 6 · 20.6–24.7 s · balanced
**Voice:** "That's where the plane's weight is balanced, so that's where it pivots."
**Action:** the pivot's glow runs straight down and forms a tall amber glass wedge (a fulcrum) rising
out of the cloud deck, its tip touching the fuselage at the pivot. The plane rests on it like a toy on
a fingertip: it tips nose-down 5°, back up, and settles level. The giant cups ride along.
**Camera:** crane down and back (32 m → 58 m, from level to 8° below the fuselage looking up) so the
wedge reads tall against the sky.
**Lead:** the wedge tip and the plane balancing on it.
**End frame:** the plane balanced level on the wedge; the wedge fades down into the clouds.

### Beat 7 · 25.3–29.4 s · farther = more
**Voice:** "The farther your seat is from that point, the more it moves."
**Action:** from the wedge tip, colour spreads along the seat rows inside the glass in both directions:
amber over the wing, turning orange toward the nose and coral toward the tail. Thin glowing lines run
from the pivot to the base of each giant cup. The plane rocks ±4° once more and the cups' new arcs
redraw: arc height visibly matches line length (the back line longest, its arc tallest).
**Camera:** slow pull back to 72 m, rising to 10° above the fuselage so the rows read.
**Lead:** the colour front as it travels along the rows, then the back cup's arc.
**End frame:** the full plane, rows coloured, three lines and arcs, clouds below.

### Beat 8 · 29.9–35.0 s · the seat map
**Voice:** "So the back rows feel it most. The seats over the wing feel it least."
**Action:** the giant cups shrink back into their rows. The camera cranes up to straight overhead and
the glass fuselage flattens into a seat map: the plane's outline in glass white, rows as seat blocks
in their colours. On "back rows" the tail rows pulse coral; on "over the wing" the wing rows lift
slightly and glow amber, and "smoothest rows" fades in beside them in amber type (no box).
**Camera:** crane from the side to top-down (35 mm), the plane rotating to nose-up in frame so it fills
the 9:16 height (nose at y≈560, tail at y≈1480).
**Lead:** the tail rows, then the wing rows and their label.
**End frame:** top-down seat map, wing rows glowing amber with the label, tail rows coral.

### Beat 9 · 35.5–39.3 s · book it, buckle up
**Voice:** "Book a seat over the wing, and keep your seatbelt on."
**Action:** the camera dives into one amber wing-row seat (row 18, window seat). The map regains
depth, the hull turns solid around us. We land at the found seat: navy fabric, open belt across the
cushion, a cup of water on the tray, calm. On "seatbelt" the buckle slides across and clicks shut
(0.4 s), a tiny amber glint on the latch.
**Camera:** 35 mm top-down → 24 mm in the cabin, low over the armrest looking down at the buckle at 40°.
**Lead:** the amber row → the buckle.
**End frame:** buckled belt sharp in the lower-middle of frame (y≈1150), cup on the tray behind it.

### Beat 10 · 39.8–44.0 s · why the belt
**Voice:** "Most passengers seriously hurt by turbulence weren't wearing one." (fact check: NTSB 2009–2018, 17 of 26 seriously injured passengers documented unbelted; 1 of 123 people documented belted)
**Action:** hold on the buckle with a slow push-in. Through the gap between seats, far back in the
cabin and out of focus, a coral flash: the back cup spills again. At 39.4 s the camera turns to the
window and pulls out through it, landing on the opening frame: the plane in the clouds (loop).
**Camera:** push 0.4 m on the buckle, then pan 70° to the window and pull out to 46 m.
**Lead:** the buckle, then the window.
**End frame:** = beat 1's start frame (loops cleanly).

---

## Captions (draft sense units, key words in amber or coral)
1. Most people think turbulence shakes the whole plane the same.
2. But watch these three cups.
3. Same bump.
4. The [back] cup spills. (coral)
5. The [middle] one moves least. (amber)
6. A plane doesn't just bounce. It [rocks], like a seesaw.
7. The middle of that seesaw is near the [wings]. (amber)
8. The plane's weight is balanced there, so it [pivots] there. (amber)
9. The farther your seat, the more it moves.
10. The back rows feel it most. The seats over the [wing] feel it least. (amber)
11. Book a seat over the wing. Keep your [seatbelt] on.
12. Most passengers seriously hurt by turbulence weren't wearing one.

## Sound cue list (CC0 sfx-29–61 or synthesized; published film)
Wind bed (exterior), cabin hum bed (interior), jolt thud (1.4 s), glass glare whoosh (pass through),
three soft pops rising in pitch (cups landing), air rumble (bump), water slosh + droplet ticks (spill),
soft whoosh per pitch swing, low hum for the pivot glow, glass chime (wedge forms), seatbelt click,
pull-out whoosh.

## Assets
| Asset | Source | Licence / credit |
|---|---|---|
| Boeing 757 (transparent) | "Airliner Boeing 757 Transparent" by Arion Digital, Sketchfab 761a094f… | CC BY 4.0, caption credit |
| Economy seat | "Seat" by maximmus, Sketchfab 8336f7cd… | CC BY 4.0, caption credit |
| Cups, water, clouds, pivot, wedge, trails, seat map | built in code | ours |
| Sky | realism kit `skyLight()` | ours |

## Claims to verify (fresh-agent fact check before the board)
1. A plane in turbulence both heaves and pitches, and pitches around its centre of gravity.
2. The centre of gravity of an airliner sits near the wings (wing root).
3. Seats farther from the centre of gravity move more; the rear moves most, over-the-wing least.
4. Most people seriously hurt by turbulence were not wearing a seatbelt.
5. Boeing 757-200 dimensions (47.3 m length, 38.05 m span).

---

## What the board changed (v0.2 → v0.3)

Each of these was a written value the stills proved wrong; the numbers below are now the reference.

| Beat | Script said | Stills showed | Now |
|---|---|---|---|
| 1, 10 | 50 mm at 46 m | a 47 m plane needs ~98 m at 35 mm to fit a 9:16 frame's width | 35 mm, camera at (−2.5, −3.5, 98), looking at (−2.5, 0.6, 0) |
| 2–7 | side view 50 mm at 62 m | same width problem | 35 mm at 92–100 m |
| 2 | real cups visible in the cutaway | a real cup is ~2 px at that distance | giant 6 m tumblers on the roof, each on a glowing stem from its row |
| 4 | trails drawn by the cups | 1–2 m of motion hid inside 6 m cups; the trails were invisible | a bead 1.2 m above each cup draws the trail; rock raised to ±8°; trail = last 3 s |
| 2–7 | seats visible through glass | the model's ceiling panels read as black bars | ceiling, vents and bins hidden; seats navy-grey |
| 1 | engines | dark internals showed as black boxes | engine cowls take the hull paint/glass |
| 9 | 24 mm low over the armrest | too close to the seat in front, buckle unreadable | 24 mm from the aisle, 1.5 m up, looking down at the window seat (0.62, 0.12, 0.62) → (0.18, −0.93, 1.5) |
| 10 | coral flash far back, seen past the buckle | the camera faces forward; the back of the cabin is behind it | open: cut the flash, or turn the camera toward the tail before the pull-out |
| 8 | seat map from the glass plane | from above the rows wash to a pale band; the amber→coral gradient barely reads | open: draw the map as a flat coloured layer in code over the top-down plane |
| 1→2, 2→3, 8→9, 9→10 | fly-throughs of the hull (window, roof, aisle dive, window) | v1/v2: one-frame flashes, the camera clipping bins and the cabin wall, even under glare | hard cuts on the words; the glare overlay removed (v3) |

Fact-check option (not yet in the script): NASA flight tests on a 757-200, quoted by NTSB SS-21-01 p. 55,
measured loads 40 % higher at the aft galley than at the centre of gravity (12 % higher at the pilot seat).
A strong on-screen number for beat 8 ("back rows: +40 %"), with the caveat that NASA notes part of it is
tail flex and the data were never published.

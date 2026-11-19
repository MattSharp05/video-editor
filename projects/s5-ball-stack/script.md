# s5 ball stack: script (v0.1, picture-first)

**Idea:** a tennis ball dropped on top of a basketball flies several times higher than you let go, because it bounces
off a ball that is already rushing up at it. **Goal:** reach. **Format:** Reel 1080x1920, 30 fps, ~40 s.
**Voice:** AI m5. Stand-in timing 2.8 words/s until the VO is aligned.
Format: **brain teaser**: pose it (0-6 s), "pause and guess" (a 1 s hold), the reveal is an event (the ball shoots
up through the guesses and over the rim), then why.

Numbers below are **starting values**; the stills tune them, and an approved still beats the text.

---

## Look sheet

**Style.** `styles/realistic-3d` with the realism kit sky and the look pass (ACES once, sky-coloured hemisphere fill,
environment only on the balls and the glass, vignette + light grain). One luminous layer on top: the height tower,
the guess bars, the speed arrows, the tiles.

**World and scale.** 1 unit = 1 m. Origin on the court at the drop spot; +y up; the wall is behind (z = -1.6),
facing the camera (+z). Basketball 0.24 m (size 7), tennis ball 0.067 m. Release: the basketball's bottom at
d = 1.10 m (the tennis ball's centre at 1.37 m). Contact/launch height of the tennis ball's centre: 0.27 m.
Hoop: rim 3.05 m, rim centre 0.75 m right of the drop line, 0.25 m behind it; backboard 0.4 m behind the rim.
Wall: red brick (Poly Haven Brick 4), 13 m tall, 40 m long. Court: asphalt (Asphalt 01), painted lines in faded
white, a weathered green court paint inside the key. Beyond the court on the right: a chain-link fence and low trees
(soft). Sky above the wall.

**Light.**
| Setting | Value | Why |
|---|---|---|
| Time | golden hour, sun 12 deg up | long warm light rakes the brick, long ball shadows |
| Sun direction | from behind camera-left (azimuth 330 in `skyLight`, sun toward +z/-x) | lights the wall and the camera side of the balls |
| Sun colour | `skyLight()` at 12 deg | matches the sky |
| Sky | Preetham turbidity 3: blue overhead -> peach at the horizon | air |
| Exposure | 0.30 (ACES), tuned on the board | |

**Colour meanings (whole film).**
| Colour | Means | On |
|---|---|---|
| Lime #D8FF3E | the tennis ball's motion / the answer | its speed arrow, the height tiles, the real peak |
| Orange #FF8A3D | the basketball's motion | its speed arrow, its strobe ghosts |
| Glass white #EAF6FF | a guess / a ruler | guess bars, the "your hand" line, tower rungs |
| Coral #FF5A4E | lost bounce (heat) | crumbling tiles, the warm spots at the contacts |
Everything else (wall, court, hoop) stays natural and desaturated. The lead is the brightest thing in frame.

**Materials.** Balls: found models (basketball roughness 0.6, pebble normal map; tennis ball fuzz). Glass bars/tiles:
rim-lit glass, 0.04 m thick, bright edge, 15 % body. Arrows: emissive tube + cone, additive halo.

**Camera rules.** Lens on a 36 mm sensor (portrait: vertical FOV at 24 mm = 73.7 deg, 35 mm = 54.4 deg). Continuous
moves inside a shot; hard cuts between viewpoints, on the words (CUT_* constants). The camera never parks. Zooms never
crop the lead.

**Frame and safe areas.** Captions y 250-470 over a top scrim. Lead inside x 60-1020, y 520-1500. Nothing important
below y 1500 or right of x 930 below y 1100.

**Visual language: states.**
| Item | States, in order | Look |
|---|---|---|
| Guess bar | appears -> waiting -> smashed | snaps in from the tower with a label; a soft pulse; breaks into ~30 glass shards that fall |
| Speed arrow | grows -> pointed -> combines | tube grows from the ball in its colour; length = speed (one unit = 0.45 m); arrows join tip to tail |
| Height tile | one -> nine -> real | lime glass square, 1 drop height (1.10 m) per tile, stacking in the ball's plane |
| Lost tile | lime -> coral -> crumbles | turns coral, cracks, falls in shards |

**Thread (hand-offs).**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| Stack at the release line | freeze mid-fall | guess bars | bars grow from the tower at the stack's height |
| Guess bars | smashed | rising tennis ball | the ball breaks each bar as it passes |
| Tennis ball over the rim | **cut** (replay) | strobe ghosts, side view | same ball, rewound; "Here's why" |
| Ghosts | **cut** | chase cam riding the tennis ball | the basketball rushing up into the lens |
| Two arrows nose to nose | **cut** (side, frozen) | one lime arrow, three units | the down arrow flips, two units join |
| Three units | transform | 3x3 tile square | each arrow unit becomes a tile side |
| Nine tiles | travel up | the ideal tower, 9 high | the tiles fly up the wall; ghost ball rides to the top |
| Tower | crumble | real tower, 3.5 high | coral tiles fall; the real ball lands at its top, over the rim |
| Real ball | falls back | the court, wide | it bounces once on the court |

---

## Beats (stand-in times)

### Beat 1 · 0.0-5.4 s · hook + question
**Voice:** "Drop a basketball with a tennis ball on top. How high does the tennis ball fly?"
**Start frame (cover):** low camera, 24 mm, 0.35 m above the court, 2.4 m in front of the stack, looking up at it.
The stack (basketball + tennis ball) hangs at the release line, centred at y~1000, filling ~25 % of the frame width.
Behind: sunlit brick wall, the hoop and backboard top-right (rim ~y 560), sky above the wall. Long shadow of the
stack on the court. A glass line at the stack's height, labelled "your hand".
**Action:** at 0.3 s the stack drops in slow motion (0.2x: the 0.47 s fall takes ~2.2 s), the shadow closing in.
At "How high" the fall freezes 0.12 m above the court (dust hasn't happened yet).
**Camera:** slow push in and down from 2.4 m to 1.8 m, ending level with the frozen stack.
**Lead:** the stack, then the tennis ball (it gets a faint lime rim light on "tennis ball fly").
**End frame:** the frozen stack low in frame (y~1250), the release line above it, the hoop top-right.

### Beat 2 · 5.6-9.8 s · guesses + pause
**Voice:** "Back to your hand? Twice as high? Pause and guess." (+1.0 s silent hold)
**Action:** the camera tilts up the drop line. On "Back to your hand" a glass bar slides out of the tower at 1.37 m
(label "back to your hand"); on "Twice as high" a second at 2.47 m ("twice as high"); on "guess" a glass "?" marker
pulses above the rim at 3.6 m. During the hold the three marks pulse once, in order, with soft ticks.
**Camera:** tilt + crane from the frozen stack up to frame court-to-rim (stack at y~1420, "?" at y~560).
**Lead:** each bar on its word.
**End frame:** both bars and the "?" in frame above the frozen stack, the rim between them.

### Beat 3 · 10.0-12.0 s · reveal
**Voice:** "Way over the rim!"
**Action:** time resumes at 0.15x for the contact (0.1 s of sim over 0.7 s: the basketball squashes 12 % on the
court, a ring of dust, the tennis ball dents into it), then ramps to 0.6x: the tennis ball shoots up, breaking the
"back to your hand" bar and the "twice as high" bar into shards (one hit each, 1 frame flash), passes the rim
0.3 m to its left and peaks at 4.1 m, ~1 m over the rim, where it hangs (top of the arc, near zero speed). The
basketball barely leaves the court.
**Camera:** follows the ball up with a whip tilt (8 frames), overshoots slightly and settles with the ball at y~700,
the rim at y~1000, the tiny "your hand" line low in frame.
**Lead:** the tennis ball (brightest: lime rim light).
**End frame:** tennis ball at its peak, ~1 m above the rim; shards falling.

### Beat 4 · 12.4-18.6 s · floor first
**Voice:** "Here's why. The basketball hits the ground and springs back up, while the tennis ball is still coming down."
**Cut on "Here's":** side view, 35 mm, 2.2 m away, camera at 0.6 m height, frame from the court to 1.6 m: a replay
of the fall at 0.1x. Each ball leaves strobe ghosts every 0.03 s of sim time (orange ghosts for the basketball, lime
for the tennis ball, 35 % opacity, fading over 1.5 s). On "springs back up" the basketball's ghosts turn upward
(squash, then rise) while the tennis ball's ghosts keep stepping down: two ghost trails pointing at each other.
**Camera:** slow dolly left 0.4 m, keeping the contact at frame centre.
**Lead:** the basketball's turning ghosts, then the tennis ball's falling ones.
**End frame:** the two balls touching, trails pointing at each other, time almost frozen.

### Beat 5 · 18.9-23.5 s · head-on
**Voice:** "So the tennis ball gets hit by a ball that's already rushing up at it."
**Cut on "So":** chase cam riding the tennis ball: 0.5 m above and 0.4 m out from it, looking down at 55 deg past it,
24 mm. Time runs at 0.1x from just before the floor contact. The court rushes up, the basketball squashes and comes
back up into the tennis ball. A lime arrow grows from the tennis ball pointing down (1 unit); an orange arrow grows from
the basketball pointing up (1 unit, on "rushing up"). The arrows meet nose to nose at the contact.
**Camera:** rides down with the ball, then holds as it is struck.
**Lead:** the orange arrow and the basketball surging up.
**End frame:** contact, two arrows nose to nose, frozen.

### Beat 6 · 23.8-28.6 s · three times as fast
**Voice:** "With perfectly bouncy balls, it would leave up to three times as fast as it fell."
**Cut on "With":** side view (as beat 4), frozen at contact. The lime arrow flips to point up (its bounce: 2 units
relative to the basketball, shown as the down arrow flipping and doubling), then the orange arrow's unit slides onto
its tail: one lime arrow 3 units long, labelled "3x speed".
**Camera:** slow pull back 2.2 -> 3.0 m and up, keeping the arrow and the balls in frame.
**Lead:** the arrow.
**End frame:** a 3-unit lime arrow standing on the tennis ball.

### Beat 7 · 28.9-32.6 s · nine times the height
**Voice:** "And three times the speed means nine times the height."
**Action:** the three arrow units swing out into a 3x3 square of lime glass tiles (side 3 units; each tile 1 drop
height square) beside the drop line: "3 x 3 = 9". On "nine times the height" the nine tiles fly up one by one and
stack into a column 9 drop heights tall (9.9 m) beside the ball path; a glass ghost of the tennis ball (perfect
bounce) rises to its top.
**Camera:** crane up and back to 12 m from the wall, 35 mm, framing court to 10.5 m (the tower fills y 520-1500).
**Lead:** the tiles stacking, then the ghost at the top.
**End frame:** a 9-high lime tower, the ghost ball at 10.2 m, the rim tiny at the tower's foot third.

### Beat 8 · 32.9-38.4 s · real balls
**Voice:** "Real balls lose some bounce, so it's more like three to four times. Still way over the rim."
**Action:** on "lose some bounce" the top tiles turn coral one by one from the top and crumble; tile 4 cracks in half.
The tower stops at 3.5 drop heights (4.1 m). Two coral warm spots glow at the contact points on the court. On "Still way
over the rim" the real tennis ball rises (replay of the reveal) to the top of the real tower, ~1 m over the rim.
**Camera:** crane back down to frame the court to 5 m (rim at y~1000).
**Lead:** the crumbling tiles, then the real ball.
**End frame:** the real tower (3.5) next to the rim, the ball at its top.

### Beat 9 · 38.6-40.6 s · try it
**Voice:** "Try it outside."
**Action:** the tower fades; the tennis ball falls back and bounces once on the court; the basketball rolls a little.
**Camera:** pull back and down to the low hook angle, wide: the court, the wall, the sky (bookends the opening).
**End frame:** the stack's opening framing, the balls at rest, golden light. Loops toward frame 0.

---

## Frame maths (checked before writing)
- Hook: 24 mm portrait FOV 73.7 deg; at 2.4 m the frame is 3.6 m tall: the 0.31 m stack is ~165 px tall. Rim at 3.05 m
  from a 0.35 m camera 2.4 m away is 48 deg up: outside the frame unless the camera tilts up ~25 deg. Look target set
  at (0.3, 1.9, -0.6); check in the still.
- Reveal: peak 4.1 m and court in one frame needs ~4.5 m tall: 24 mm at 3.5 m or 35 mm at 4.5 m.
- Ideal tower 10.2 m + court: 35 mm (54.4 deg) frames 1.03 d -> d ~11.5 m.
- Arrow units 0.45 m: from 2.2 m at 35 mm (frame 2.26 m tall) one unit = 380 px, three units = 1140 px: fits.
- Tennis ball at 2.2 m, 35 mm: 0.067 m = 57 px. Fine for the side view; the chase cam makes it large.

## Captions (sense units; key words in lime)
1. Drop a basketball with a tennis ball on top.
2. How high does the tennis ball fly?
3. Back to your hand? Twice as high?
4. Pause and guess.
5. Way over the [rim!]
6. Here's why. The basketball hits the ground and springs back up,
7. while the tennis ball is still coming down.
8. So the tennis ball gets hit by a ball that's already [rushing] [up] at it.
9. With perfectly bouncy balls, it would leave up to [three] [times] as fast as it fell.
10. And three times the speed means [nine] [times] the height.
11. Real balls lose some bounce, so it's more like three to four times.
12. Still way over the [rim.]
13. Try it outside.

## Sound cue list (CC0 sfx-29-61 or synthesized)
Outdoor bed (soft wind + distant birds if CC0 has them, else pink noise), slow-motion whoosh into the freeze, glass
"tink" per guess bar, three ticks in the pause, deep impact + dust on contact, glass shatter x2 on the bars, rising
whoosh for the launch, rewind whoosh on the replay cut, bass thump at the arrows' meeting, glass clicks for the tiles
stacking (rising pitch), crumble for the lost tiles, a final bounce.

## Claims to verify (fresh agent before the board)
1. A tennis ball dropped on a basketball flies several times higher than its drop: "three to four times" for real balls.
2. "Way over the rim": from a 1.1 m drop (basketball bottom), a 3.5x rise peaks ~4.1 m vs a 3.05 m rim.
3. "The basketball hits the ground and springs back up, while the tennis ball is still coming down."
4. "So the tennis ball gets hit by a ball that's already rushing up at it."
5. "With perfectly bouncy balls, it would leave up to three times as fast as it fell."
6. "Three times the speed means nine times the height."
7. On screen: "3x speed", "3 x 3 = 9", the 9-high tower labelled as a perfect bounce, the real tower at 3.5.

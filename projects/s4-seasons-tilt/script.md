# s4 Seasons tilt: script (v0.1, picture-first; stand-in timings at 2.84 words/s until the m5 VO is aligned)

**Idea:** summer isn't when Earth is closest to the Sun (we're closest in January); it's when the tilt makes sunlight
hit your ground straight on, packing the same beam onto less ground. **Goal:** reach. **Format:** Reel 1080x1920,
30 fps, ~40 s. **Voice:** m5. **Music:** Floating Cities.

## Lines (110 words)
1. Lots of people think it's summer when Earth is closest to the Sun.
2. But we're closest in early January, in winter up north.
3. The real reason is Earth's tilt.
4. In June, the north leans toward the Sun.
5. Follow one beam of sunlight.
6. In summer, it hits almost straight down. All its heat lands on one small patch.
7. In winter, the Sun sits low. The same beam hits at a slant and spreads over about twice the ground.
8. So every patch gets about half the heat.
9. That's why it's summer in New York while it's winter in Sydney.
10. It's not how close the Sun is. It's mostly how straight its light hits.

Numbers are **starting values**; the board tunes them and an approved still wins over the text.

---

## Look sheet

**Style.** Realistic 3D (`styles/realistic-3d`), two worlds joined by hard cuts: **space** (globe kit Earth with its
real day side, a built Sun, star field) and **the meadow** (realism kit sky, grass, trees, a found red barn). One
luminous layer on top: the marbles of light, the orbit line, the axis. Look pass: ACES once, exposure per world,
sky-coloured hemisphere light, environment map on hero objects only, `Finish` vignette + light grain, glows as
additive sprites (no bloom pass).

**World and scale.**
- Space is a diorama, not to scale (said by nothing, but never claimed either): Earth radius 1, Sun radius 5, orbit
  radius 30. The true orbit is drawn with the real eccentricity 0.0167 (closest 29.5, farthest 30.5): it reads as a
  circle, which is the point of beat 2. The myth orbit is an ellipse with eccentricity 0.6.
- Axis tilt 23.44 deg, fixed in space toward Polaris (a star placed far along the axis).
- Meadow: 1 unit = 1 m. Tiles 4 x 4 m drawn faintly on the grass (a 5 x 5 grid). The beam is 4 x 4 m in
  cross-section: 100 marbles (10 x 10, spacing 0.4 m, radius 0.13 m). Barn 20 m long, 30 m behind the tiles. Trees
  9-12 m tall at the field edge.
- Beam geometry (New York, 40.7 N): summer elevation 72.7 deg, footprint 4 x 4.19 m (1.05 tiles); winter elevation
  25.9 deg, footprint 4 x 9.16 m (2.29 tiles). Per-tile share 100 vs 46 (counts on screen).

**Light.**
| Place | Sun | Sky | Exposure | Why |
|---|---|---|---|---|
| Space | the built Sun, white-gold core #FFF4D6, corona #FFB547 | black with stars (globe kit `Stars`) | 1.0 (shader-lit Earth) | the Sun is the only light; Earth's day side faces it |
| Meadow, summer | elevation 72.7, azimuth from frame-left-behind (azimuth 160 relative to camera) | Preetham turbidity 2.5, deep blue | 0.32 | high noon, short shadows |
| Meadow, winter | elevation 25.9, from frame-left | turbidity 3.5, pale | 0.40 | low gold light, long blue shadows |

**Colour meanings (whole film).**
| Colour | Means | On |
|---|---|---|
| Amber #FFB547 | sunlight / heat / the answer | the marbles, the beam, lit tiles, "tilt", New York's summer pin |
| Ice blue #8FD3FF | cold / winter | the snow tint on the north in beat 2, Sydney's winter pin, the dim winter tiles' edge |
| Coral #FF5A4E | the myth / wrong | the myth orbit line, the "closest = summer?" stamp, the strike over "distance" |
| White #EAF6FF | neutral geometry | the true orbit, the axis, tile lines |
The lead of each beat is the brightest, most saturated thing in frame.

**Materials.** Earth: globe kit `day=1.2, night=0.6, air=1.2` with `sun` = the subsolar point of the moment.
Sun: emissive sphere with noise granulation + two additive glow sprites. Marbles: emissive amber spheres
(#FFD27A core) with a soft halo sprite each; on landing they flatten into a glowing dot that stays 1.2 s.
Tiles: thin bright lines (#EAF6FF at 35 %); a lit tile fills with amber light whose brightness = marbles per tile.
Grass: realism kit tufts, summer #5C8A3A, winter covered by snow (#F2F5FA, roughness 0.9) with tips poking through.

**Camera rules.** Continuous moves inside a world; hard cuts between worlds on the words (`CUT_*` constants):
space -> meadow on "In summer", meadow -> space on "That's why". Lens on a 36 mm gauge (vertical): 35 mm
(vFOV 54.4 deg, frame height = 1.03 x distance). The camera never parks.

**Frame and safe areas.** Captions y 250-470 over a scrim. Lead inside x 60-1020, y 520-1500. Nothing important
below y 1500 or right of x 930 below y 1100.

**Visual language: states.**
| Item | States | Look |
|---|---|---|
| Earth's north | neutral -> warm (myth) -> snowy (truth, Jan) -> summer-lit (June) | warm: amber rim glow; snowy: ice-blue tint over the north; June: bright day side over the north |
| Marble | travelling -> landed -> fading | travelling: amber bead + halo; landed: flattened glowing dot on the ground; fades 1.2 s |
| Tile | neutral -> lit (heat = marbles on it) | neutral: faint white lines; lit: amber fill, brightness proportional to the count |
| Pin (beat 9) | summer / winter | amber glow + "summer" | ice blue + "winter" |

**Thread.**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| Myth orbit, warm Earth | transform (oval deflates) | true orbit, Earth at JAN 3 | the orbit line itself |
| Earth | transform (axis snaps to tilt) | axis to Polaris | the axis line shoots out of the pole |
| Axis | travel (time-lapse half lap) | Earth in June, north toward the Sun | ghost Earths along the orbit, all tilted alike |
| Sun | travel (beam leaves the Sun) | 100 marbles over Earth | the beam narrows into marbles |
| Marbles (space) | cut on "In summer" | marbles raining on the meadow | the same amber marbles, falling the same way (down-frame) |
| Summer tile | transform (sun sinks, snow spreads) | winter tiles | the beam swings to a slant while the summer outline stays |
| Winter tiles | cut on "That's why" | the globe in June with two pins | each pin carries its own small marble beam |
| Two pins | pull back | the near-circle orbit, "distance" struck, "angle" | the beams |

---

## Beats (stand-in times)

### Beat 1 · 0.0-4.0 s · the myth
**Voice:** "Lots of people think it's summer when Earth is closest to the Sun."
**Start frame (cover, already moving):** space. The Sun at upper left (centre x 300, y 640, radius ~170 px). A coral
myth orbit, an ellipse with e 0.6, climbs the frame diagonally. Earth (radius ~70 px) races along it toward the
Sun from lower right. Camera 35 mm, 75 units from the orbit centre, 40 deg above the orbit plane.
**Action:** as Earth swings in to its closest point (at 2.6 s) its north glows warm amber and grows a warm rim;
a coral tag "closest = summer?" pops beside it at 2.9 s.
**Camera:** slow orbit 10 deg around the Sun, following Earth.
**Lead:** Earth.
**End frame:** Earth at the myth's closest point, warm, tag on.

### Beat 2 · 4.4-8.8 s · closest in January
**Voice:** "But we're closest in early January, in winter up north."
**Action:** on "But" the coral oval deflates over 1.0 s into the true white orbit (nearly a circle); Earth slides to
the real closest point. On "January" a white flag tag "JAN 3" rises from Earth; on "winter" ice-blue snow sweeps over
the northern hemisphere (the day side shows the north tipped away). Small label under the orbit: "only 3 % closer".
**Camera:** push from 75 to 30 units, ending on Earth with the Sun bright at frame-left.
**Lead:** the deflating orbit, then the snowy north.
**End frame:** Earth large (radius ~260 px) at y 1000, north snowy, Sun glare at the left edge.

### Beat 3-4 · 9.2-15.0 s · the tilt
**Voice:** "The real reason is Earth's tilt. In June, the north leans toward the Sun."
**Action:** on "tilt" a white axis line shoots out of both poles; a thin line runs from the north pole up-frame to a
bright star (Polaris) and a "23.4°" arc appears between the axis and the orbit's upright. On "In June" Earth travels
half its orbit in 2.5 s (a time-lapse), leaving 5 ghost Earths, each tilted the same way, axis lines parallel. It stops
on the June side: the north now leans toward the Sun, the north is in daylight all the way round the pole; the snow
melts off on arrival; a white tag "JUN 21".
**Camera:** pull back to 55 units above and outside the orbit so the half lap fits (diagonal layout), then push to
Earth at June with the Sun behind the camera's left shoulder.
**Lead:** the axis line, then the travelling Earth.
**End frame:** Earth in June, north lit, axis to Polaris.

### Beat 5 · 15.4-17.5 s · one beam
**Voice:** "Follow one beam of sunlight."
**Action:** a square beam of amber light leaves the Sun's surface; as it nears Earth it resolves into 100 marbles in a
10 x 10 block, streaming toward New York (40.7 N) on the lit north.
**Camera:** rides beside the beam, from the Sun toward Earth, ending looking down the beam onto New York.
**Lead:** the beam / marbles.
**End frame (cut on "In summer"):** marbles about to land on New York, seen from above and behind.

### Beat 6 · 18.0-23.4 s · summer: straight down
**Voice:** "In summer, it hits almost straight down. All its heat lands on one small patch."
**Start frame (after the cut):** the meadow at noon in summer: green grass, the red barn 30 m back, trees at the
edge. A faint 5 x 5 grid of 4 m tiles. Camera 35 mm, 22 m from the centre tile, 9 m up, looking down 22 deg.
**Action:** the 100 marbles rain in from 72.7 deg (almost vertical), 10 x 10, landing as one block on the centre tile
(footprint 4 x 4.2 m). The tile fills with bright amber; a count "100" rises over it. Short shadows under the trees.
**Camera:** slow orbit 15 deg around the tile.
**Lead:** the marbles, then the bright tile.
**End frame:** one bright tile, "100".

### Beat 7 · 24.0-31.0 s · winter: slanted, spread
**Voice:** "In winter, the Sun sits low. The same beam hits at a slant and spreads over about twice the ground."
**Action:** on "In winter" a 2 s time-lapse: the sun swings down to 25.9 deg, shadows stretch long and blue, snow
spreads across the meadow from the far edge, the trees turn bare (leaf cards fade). The summer tile keeps a white
outline. On "same beam" the 100 marbles come in at 25.9 deg and land in a long block 4 x 9.2 m over ~2.3 tiles.
**Camera:** rises to 16 m and pulls back to 28 m so the long patch fits (diagonal).
**Lead:** the sun drop, then the slanted marbles.
**End frame:** the long, dimmer patch beside the summer outline.

### Beat 8 · 31.4-34.2 s · half the heat
**Voice:** "So every patch gets about half the heat."
**Action:** counts rise over the winter tiles: "46" "46" (+ "8" on the partial tile); the winter tiles' amber is
visibly half as bright as the summer tile was. Marbles keep raining at the slant.
**Camera:** slow push toward the counts.
**Lead:** the counts.
**End frame:** the counts over the dimmer tiles.

### Beat 9 · 34.6-38.8 s · New York vs Sydney
**Voice:** "That's why it's summer in New York while it's winter in Sydney."
**Start frame (cut on "That's why"):** space, Earth in June, the Sun off frame-left. Two pins: New York (40.7 N,
74 W) and Sydney (33.9 S, 151.2 E), each fed by a small marble beam from the Sun's direction: New York's beam hits
steep and tight, Sydney's slanted and smeared. On "New York" an amber "summer" tag; on "Sydney" an ice-blue "winter".
**Camera:** orbit 25 deg so both cities show (they're on opposite sides of the globe in longitude; the camera
looks from over the Pacific edge so the limb shows both, or the globe turns).
**Lead:** New York's pin, then Sydney's.
**End frame:** both pins, two beams.

### Beat 10 · 39.2-43.0 s · the answer
**Voice:** "It's not how close the Sun is. It's mostly how straight its light hits."
**Action:** pull back to the near-circle orbit; a coral word "distance" over the orbit gets struck through on
"close"; on "straight" an amber "angle" with the beam into New York.
**Camera:** pull back from 20 to 70 units.
**End frame:** the true orbit, Earth tilted at June, "angle". Loops toward the opening (Earth and Sun).

## Captions (sense units; [key words] in amber)
1. Lots of people think it's summer / when Earth is closest to the Sun.
2. But we're closest in early [January,] / in winter up north.
3. The real reason is Earth's [tilt.]
4. In June, the north leans toward the Sun.
5. Follow one beam of sunlight.
6. In summer, it hits almost [straight] down. / All its heat lands on one small patch.
7. In winter, the Sun sits low. / The same beam hits at a [slant] / and spreads over about twice the ground.
8. So every patch gets about [half] the heat.
9. That's why it's summer in New York / while it's winter in Sydney.
10. It's not how close the Sun is. / It's mostly how [straight] its light hits.

## Sound cue list (CC0 sfx-29-61 or synthesized)
Space: a soft low drone bed (synth brown noise, low-passed). Myth tag: rubber-stamp. Deflate: whoosh-deep reversed
feel (pitched down). Snow sweep: soft synth air hiss. Axis shoots out: glass-ting. Time-lapse lap: whoosh. Beam:
riser of filtered noise. Cuts: whoosh-deep peaking on each cut. Meadow bed: wind (synth pink, low-passed) + summer
birds? (none in CC0: skip). Marbles landing: tile-clicks (soft, low-passed), pitched up for summer, sparse for winter.
Counts: pop-soft rising. Winter time-lapse: wind up. Pins: pop-soft. "distance" strike: rubber-stamp low.

## Claims to verify (fresh agent, before the board)
1. Earth is closest to the Sun in early January (perihelion ~Jan 3) and farthest in early July.
2. Closest vs farthest distance differs by about 3 % (147.1 vs 152.1 million km).
3. The cause of the seasons is the axial tilt (23.4 deg), not the distance.
4. The axis keeps pointing the same way in space (toward Polaris) through the year; in June the north leans toward
   the Sun.
5. At New York the noon Sun is ~72.7 deg high at the June solstice and ~25.9 deg at the December solstice.
6. The same beam then covers ~2.2x the ground ("twice the ground"), so each patch gets ~46 % ("about half the heat").
7. When it is summer in New York it is winter in Sydney.
8. "It's how straight its light hits" as the summary (day length also matters: is the line still true as worded?).

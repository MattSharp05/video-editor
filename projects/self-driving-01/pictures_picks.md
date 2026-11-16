# Pictures picks: self-driving-01

Picker's verdict on `pictures_brainstorm.md`, judged for clarity (sound off), surprise (screenshot?), spectacle (does
the motion hold the eye) and cost on the route: one person-day, three.js inside Remotion on CPU (~2-3 s per 1080x1920
frame, so a full 60 s render is ~1-1.5 h and previews must be quarter-scale), night city from the sourced models in
`film/public/models/` (robotaxi = I-PACE concept, tesla, walker with a walk cycle, cyclist moved whole, props,
downtown). Cheap: shaders (lidar rings on every surface, colour masks), instancing, particles, transparent clones.
Expensive: render-to-texture camera feeds, new characters, seated or hand-acting people, new worlds with new models.
Guidance read: animated-video `references/direct.md` (find the pictures), `references/motion-principles.md`.

## The film's language (what the picks share)

One night street, one white robotaxi, one person crossing: **you** (the walker). Every mechanism is drawn on that
street in one look each, introduced once and kept:

| Thing | Look | First shown |
|---|---|---|
| You (the thing we follow) | hot orange accent, the brightest thing in frame | 1 |
| Lidar sees | cool cyan rings / points laid on every surface by a shader; the photo layer dims under them | 3 (teased in 1) |
| Radar | wide, soft violet shells from the bumper, passing through rain | 4 |
| Camera | a cone that gives back true colour where it looks (lidar has shape but no colour) | 4 |
| A possible future | translucent white ghost copy | 5 |
| The chosen plan | green ribbon on the road | 6 |

The excursions (desert edge in 2, simulation tile field in 7, US night map in 10) are each a change of **scale or
place in the same world**, entered and left along a carrier, and each earns its place with a fact (2004, 20 billion
miles, 15 cities). The Tesla section is legible because of the language: it gets camera cones and **no rings**.
The end replays rings, ghost and ribbon on you at the first crosswalk, closing the loop.

## Picks, one per beat

**1. "There's nobody driving this car. So how does it see you?" -> 1a + 1d (tag) + 1b (one blink).**
Low at the kerb, the white robotaxi glides into the crosswalk and stops; the camera slides to the driver's window:
empty seat, wheel turning by itself (on "nobody driving"). The camera rises over the roof to the spinning dome, which
fires one cyan ring across the street; it washes over you stepping off the kerb, and for a beat you alone burn orange
in points with a small tag `PEDESTRIAN` (on "see you"), then the ring passes.
Why: the first frame must be a real, readable thing (a driverless car), which pure 1d (grey dots first) is not at
feed size, and the claim "nobody driving" needs the empty seat. The ring-and-tag answers the question in ~3 s and
teases the language without spending beat 3. Cost: low-medium. Risk: the I-PACE *concept* model may have no
interior; if so, darken the glass and add a proxy seat + wheel seen through tinted glass (night hides it).
Runners-up: 1d pure (strongest screenshot, weak first frame, loses "nobody driving"); 1b the blinking eye-dome
(fun, but makes the car a creature the rest of the film doesn't keep).

**2. "In 2004 ... half a million rides a week" -> 2a (one road, as place not time) + 2b (the swarm).**
The camera cranes off the dome and follows the street's centre line out past the last buildings; the asphalt runs
out into a dirt track and dunes. Down on it, a boxy 2004 robot truck sits nosed into a berm, steaming, label
"DARPA Grand Challenge, 2004 - no finisher". The camera whips round and rises: behind it the city now streams with
thousands of white light-trails on every street, a glittering grid as far as the fog goes, label
"Waymo, ~500k rides/week (Alphabet, April 2026)".
Why: the swarm is the only picture that makes half a million felt, and the dead truck on the same road as today's
cars makes the 22 years a single continuous move with no time-warp shader. Cheap: sand shader on an extended ground
plane, instanced light trails along street splines, far city as instanced emissive boxes. Cost risk: the truck has
no sourced model; at night from 10 m in dust it can be a primitive-built box truck with a roof rack, or a sourced
pickup.
Runners-up: 2b alone (spectacular but loses "2004 failure"); 2c trophy as the desert becomes a city around it (most
surprising, but a full rewind/regrow of the city is a day on its own, and adds a trophy that means nothing later);
2e flip counter (clear, thin motion, a gadget outside the world).

**3. "First, the car has to see you ... lidar ... times each bounce ... 3D picture" -> 3d + 3a.**
The camera rides one cyan pulse out of the dome, slowed a billion times: it streaks across the street, hits your
shoulder, leaves one dot, and snaps back to the dome; a small clock reads `0.000 000 07 s`. A second pulse to a far
building is still travelling when ours is home, and its clock runs longer (near = fast, far = slow). Then pull back:
millions fire, rings sweep every surface, the photo street dims and the street exists as points, you among them,
orange.
Why: "times each bounce" is the hard idea; two racing pulses with clocks make it inferable with sound off, and the
pull-back to the full point cloud is the film's big spectacle moment. Cost: medium (pulse streaks and the ring shader
are cheap; the point world is the ring shader + dimmed base material, which also works on the skinned walker; no
per-frame mesh sampling).
Runners-up: 3b tennis balls (best for timing, but needs a throwing character on the roof: cost and tone); 3a alone
(beautiful, but shows "builds a picture" and not "times the bounce"); 3c paint gun (fun, same gap as 3a).

**4. "Radar tracks speed, even in rain. Cameras read traffic lights and signs." -> 4a + 4c, with the camera cone.**
Rain starts on the point street; the cyan points go speckled and noisy as drops catch them. Time freezes: drops hang
in the air, a violet radar shell rolls from the bumper straight through them, hits the cyclist and comes back
squeezed; a tag `14 mph ->` pins to the cyclist; time restarts. Then a cone from the windscreen camera sweeps up the
street, and wherever it passes, true colour returns: the traffic light goes from grey points to a burning red, the
stop sign to red and white with its word.
Why: rain particles and the frozen moment are spectacle for free; "cameras read colour" is shown as the one thing
lidar couldn't give, which also sets up Tesla. Cost: low-medium (rain particles, a shell shader, a frustum mask in
the surface shader).
Runners-up: 4d X-ray of the bumper radar (clear but a small, static place); 4b three superheroes (characters, cost).

**5. "But seeing isn't enough. It predicts where every person, bike and car might go next." -> 5a + 5b's tell.**
The light holds red; translucent ghosts fan out ahead of every road user: the cyclist's ghosts peel left and
straight, a car's ghosts edge into the lane, and you get three: crossing, stopping, turning back. Your shoulder turns
toward the road and the "crossing" ghost brightens while the others fade.
Why: instantly readable, many parts moving at once, and the ghost is the same object the next beat needs. The
shoulder tell turns "predicts" into an inference the viewer makes too. Cost: low (clones with a fresnel transparent
material; walker clones offset in the walk cycle; the cyclist's ghosts slide whole, which is fine for a ghost).
Runners-up: 5e the ball and a predicted ghost child (most surprising, but needs a child and a ball; possible upgrade
if time remains); 5d chessboard (a world change that adds nothing ghosts don't); 5c thought bubbles (cute, 2D).

**6. "Then it plans a path around all of them, again and again as they move." -> 6c + 6a.**
From the robotaxi's bumper, hundreds of tiny ghost robotaxis burst down every possible route; those that touch
anyone's ghost pop into sparks; one survives, turns green and leaves a green ribbon, and the real car rolls onto it.
The cyclist drifts; a new burst, a new survivor, the ribbon snaps; again, faster, until the bursts are a flicker and
the ribbon is a living line.
Why: trial and elimination is the mechanism, and "again and again" is shown, not said. It keeps the language: ghost
= possible future, green = chosen. Cost: medium (instanced low-LOD car, spline fan, collision test against ghost
positions precomputed, spark particles).
Runners-up: 6a ribbon alone (clear, thin: one line moving); 6d the 0.1 s clock (a diagram).

**7. "Waymo has practised over 20 billion miles in simulation." -> 7a.**
The camera rises along the green ribbon; the street's edge turns out to be the edge of a tile, a lit diorama, and the
pull-back keeps going: thousands then millions of tiles to the horizon, each with its own car, ribbon and weather
(snow on some, a flicker of rain, a stray obstacle), an odometer racing to `20,000,000,000 mi`, label "Waymo, 20B+
simulated miles".
Why: the most surprising reveal in the film (the street we've watched was practice), huge scale, and it grows from the
ribbon with no new world to build. Cost: medium. Do **not** render-to-texture the tiles: use instanced low-poly copies
of the street in the point (ring-shader) look, which is also what a simulation should look like; variety comes from
per-instance weather particles, ribbon shapes and tints.
Runners-up: 7c the car's dream (funniest, but a dream bubble world, a giraffe and a sofa are new models and a second
scene; it also stops the car); 7b road to the Sun (one line unrolling: thin).

**8. "Tesla bet differently: cameras only, no lidar, one neural network that turns video into steering." -> 8a +
8c in the film's language.**
Back down into our tile: at the red light a Tesla Model Y pulls up beside the robotaxi. A ghost copy of the lidar dome
appears on the Tesla's roof and pops off, falling away. No rings touch anything around the Tesla; instead eight
camera cones open from its body, giving the street its colour inside each cone. Streams of light are pulled from every
cone into one glowing knot in the cabin (the network), which sends a single beam to the steering wheel; the wheel
turns, the light goes green, the Tesla pulls away.
Why: the comparison is read entirely from the language already taught (rings = lidar, cones = cameras), and the
funnel (8c) becomes cones-into-one-knot-into-wheel: video in, steering out. Cost: medium, and far cheaper than eight
camera-view tiles, which are ruled out (eight extra renders per frame on CPU).
Runners-up: 8c literal funnel of video (needs video textures, render-to-texture); 8d inside the network (abstract,
a world change); 8e poker table (fun pun, off-world, characters).

**9. "Most Teslas still need a driver watching. But some ... in Texas now run with no employee on board." -> 9a,
reworked.**
The camera rides with the Tesla: through its windscreen, a driver's head and shoulders, eyes on the road, and a small
cabin camera cone on his eyes (watching the watcher). Teslas stream past, each with a driver and an eye cone. The road
passes an overhead sign `AUSTIN, TX`; the next Tesla's front seats are empty, the wheel turning by itself, the exact
framing of shot 1.
Why: literal, but the cabin cone keeps it in the language and the empty seat rhymes with the hook. Cost: medium-high:
a seated person is the riskiest asset; use the walker scan on a frozen frame, cropped by the dash and seen through
tinted glass, never hands.
Runners-up: 9d US map with driver icons (cheaper on people, but icons at map scale don't read, and the map belongs to
beat 10); 9c the driver evaporates at the state line (great surprise, but needs a convincing seated human and
over-implies all of Texas).

**10. "So, is it cracked? Not everywhere. But in about 15 US cities ... sees you, guesses your next step, and drives
around you." -> 10a, entered from Austin.**
The camera rises off the empty Tesla until Austin is a point of light on a dark US map; about 15 cities glow, the rest
stays dark ("not everywhere"). The camera glides to another glowing city and dives into it, down a light trail, onto
the first crosswalk: you step out; a ring finds you (orange points, "sees you"), your crossing ghost leads ahead
("guesses your next step"), a green ribbon bends around it and the empty robotaxi follows ("drives around you"). End
on the empty driver's seat as you walk past.
Why: the three verbs replay the three looks on the first street; the film ends where it began. Cost: medium (a
public-domain night-lights map such as NASA Black Marble or a Natural Earth outline as a ground plane, 15 emissive
points; source and log it).
Runners-up: 10e orbit to your shoelace (same idea, bigger zoom, no recap); 10b cracked egg (good pun, but a new world
in the last 5 s and "hatching" overclaims).

## Hand-offs (carrier at each)

| From -> to | Move | Carrier |
|---|---|---|
| 1 -> 2 | travel | the street's centre line: from under the robotaxi, out of downtown, into a dirt track |
| 2 -> 3 | pull back, then dive | one white light-trail of the swarm, which resolves into the robotaxi's headlights pulling up at the crosswalk; camera lands on the dome |
| 3 -> 4 | transform | the point-cloud street: rain falls into it and speckles the points; the bumper's radar shell takes the lead |
| 4 -> 5 | hold, then split | the red traffic light the camera cone just coloured: under it, the ghosts fan out of everyone waiting |
| 5 -> 6 | split | the ghosts: the car's own ghost-cars burst out among the others' ghosts, same look |
| 6 -> 7 | pull back | the green ribbon: the camera rises along it past the street's edge, which becomes a tile's edge |
| 7 -> 8 | dive (push through) | our tile: back into it at the red light; then the Waymo's dome, copied onto the Tesla as a ghost, pops off |
| 8 -> 9 | travel | the Tesla's steering wheel / the network's beam: the camera rides with the Tesla to the driver whose hands are near it |
| 9 -> 10 | pull back, then dive | the empty Tesla's light becomes Austin's dot on the map; a second city's dot becomes the robotaxi's headlights at the first crosswalk |

## Set check

- One world, three scale changes, each tied to a number. The desert is the only change of place and it is reached
  by road, so it reads as "out of town", with the 2004 label carrying the time.
- Rhymes: empty seat (1, 9, 10); light-trail becomes headlights (2->3 and 10); the red light hosts radar, prediction
  and the Tesla.
- Accent discipline: orange belongs to you only; never on the Tesla or the labels.
- Order of looks: rings (1 tease, 3), radar (4), cone (4), ghost (5), ribbon (6). The cone is used for Tesla (8) and
  the cabin camera (9) only after it is taught.

## Cost and fallbacks (one person-day)

Build in this order, so the film exists early: street + robotaxi + you + ring shader (1, 3, 10) -> ghosts and ribbon
(5, 6) -> rain, radar, cone mask (4) -> tile field (7) -> Tesla cones and knot (8) -> desert + swarm (2) -> seated
driver (9) -> map (10).
If the day runs short, cut in this order: the 2004 truck becomes tyre tracks into a steaming berm (2); 9 drops the
driver and shows only the cabin cone on an empty-looking seat vs the empty Austin Tesla; 7's weather variety becomes
tint variety. Never cut 3's two racing pulses or 6's pop: they carry the mechanisms.
Asset gaps to source and log: a 2004-style robot truck (or primitives), a US night map (public domain), interiors
for the robotaxi and Tesla (both are exterior-first Sketchfab models; check before planning 1 and 9's framings).

# Self-driving 01: concept, thread and visual language (2026-11-16)

Concept (from `pictures_picks.md`, fresh picker over `pictures_brainstorm.md`, fresh brainstormer): one night street in
a US city, one continuous camera. You, the pedestrian about to cross, are the thing the viewer follows (orange).
The empty robotaxi sees you, guesses you, plans around you; the camera rides its pulses and plans, rises to the
scale of the numbers, drops to a Tesla on the next block, and finally rises to the country before diving back to
the first crosswalk. Style: realistic 3D night street (sourced cars, scan pedestrian, downtown buildings) with a
luminous sensor layer (lidar points drawn by a shader on every surface). Labelled "Illustration".

## Director's scope decisions (in place of approval; reasons)
- Desert 2004 beat: the picker's dirt road + stuck truck is kept, built at the far end of our own street (no new
  set loaded); the truck is built from simple shapes (no fitting free model; a generic 2004-era SUV with a roof
  rack, not a replica of any team's vehicle). Labelled "DARPA Grand Challenge, 2004 · Illustration".
- Beat 2 "half a million rides": an aerial of a procedural city grid with streaking light trails (instanced), not
  the picker's "500,000 cars" swarm count (a count we can't show 1:1). Label carries the number and its source.
- Beat 3 "times each bounce": one pulse to your shoulder and back with a running nanosecond clock; the second far
  pulse is kept (near = fast, far = slow) since the picker marked it essential.
- Beat 7 practice tiles: copies of our street block drawn as point tiles on a grid running to the horizon; the
  counter rises to 20B. No live camera views anywhere (render cost).
- Beat 9 driver: a seated silhouette behind tinted glass, framed from outside; no hands, no face close-up
  (realistic-3d: frame around people). No "AUSTIN" sign: the label "Some Tesla robotaxis · Texas · 2026" carries
  the place (the map later places our street in Phoenix, Waymo's first city; one city per film).
- Beat 10 map: the camera rises from the street to a flat night map of the US (NASA Black Marble, public domain,
  from the parts globe), true scale, log depth; 15 Waymo metros light as dots; it dives back into the same city.

## The thread (one shot: lead -> move -> next lead, carrier)
| # | t (s) | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|---|
| 1 | 0-3.3 | the empty driver's seat | pull back | you at the kerb, ring lights you | the lidar ring from the roof dome |
| 2 | 3.3-7.5 | you / the street's centre line | travel | the 2004 truck stuck at the berm | the centre line, running out of town into dirt |
| 3 | 7.5-12.4 | the truck's dust | pull back (rise) | the city of light trails | the camera rises out of the dust over the city |
| 4 | 11.4-12.5 | one light trail | travel (dive) | the robotaxi's headlights | that trail becomes our car's headlights |
| 5 | 12.5-19.7 | the roof dome | travel (ride a pulse) | you; then the whole street as points | the laser pulse out and back; the sweep |
| 6 | 20.4-24.6 | the point street | transform | radar shell on the cyclist; colour on the light | rain falls into the points; the shell rolls out |
| 7 | 24.6-30.6 | the red light | split | ghosts of you, the bike, a car | ghosts fan out under the red light |
| 8 | 30.7-34.4 | the ghosts | split | ghost cars from our bumper; the green ribbon | the car's own ghosts burst among them |
| 9 | 34.4-38.5 | the green ribbon | pull back | the grid of practice tiles + counter | the ribbon's end becomes a tile edge |
| 10 | 38.5-45 | our tile | travel (dive) | the Tesla on the next block, camera cones | the camera lands beside the Tesla; no dome |
| 11 | 45-52.9 | the Tesla's wheel | travel | a driver watching; then a Tesla with empty seats | the beam into the wheel; the car drives on |
| 12 | 53-57 | the empty seat | pull back (rise to map) | 15 cities lit | our city's lights become one dot |
| 13 | 57-63.4 | the dot | pass through (dive) | you at the crosswalk; ring, ghost, ribbon | the dot opens back into our street |

## One visual language
| Thing | State | Look (one per state, whole film) |
|---|---|---|
| You (pedestrian) | seen / predicted | orange outline glow + "PEDESTRIAN" tag; orange is yours only |
| Lidar | pulse / ring / points | cyan bead / cyan ring along the ground / cyan-to-blue dots by distance on every surface |
| Radar | shell / moving thing | violet expanding shell / violet tag with speed |
| Camera | looking | pale warm-white translucent cone; inside it the world keeps true colour |
| A future | possible | see-through white ghost copy; brighter = likelier |
| The car's plan | candidate / chosen | small white ghost cars that pop on contact / one green ribbon on the road |
| Tesla's network | thinking | camera-coloured streams into one knot; one beam to the wheel |
| Labels | fact | small white text with a short line; source in grey; "Illustration" bottom-left |

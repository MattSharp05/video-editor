# Self-driving 01: production report (unsupervised run, 2026-11-16)

Deliverables (git-ignored, sent through the session):
- `projects/self-driving-01/renders/self-driving-01_signal-to-noise.mp4`
- `projects/self-driving-01/renders/self-driving-01_computations.mp4`
- `projects/self-driving-01/renders/self-driving-01_horizons.mp4`

One picture (63.4 s, 1080×1920, 30 fps), three sound mixes muxed with `-c:v copy`. Branch `claude/self-driving-01`.
Measurements of the finals: see "Delivery checks" (filled from the files themselves).

## The script (locked after the fresh fact-check; voice Kokoro am_puck, 62.75 s, 182 words, 2.9 words/s)

| # | t (s) | Spoken line | Picture |
|---|---|---|---|
| 1 | 0.25 | There's nobody driving this car. So how does it see you? | A white robotaxi glides to a crosswalk at night; the camera holds on its empty front seats, pulls back as the roof sensor fires one cyan ring that finds you (orange, tagged PEDESTRIAN). |
| 2 | 3.32 | In 2004, not one robot car could finish a desert race. This year, Waymo passed half a million rides a week, with nobody at the wheel. | The camera runs down the centre line out of town to a 2004-era robot truck stuck on a desert berm; rises out of the dust over a city streaming with light trails (label: 500,000+ fully autonomous rides a week, Alphabet, April 2026); dives back down one trail to the robotaxi. |
| 3 | 12.46 | First, the car has to see you. On its roof, lidar fires laser pulses and times each bounce, building a 3D picture of the street. | A laser bead leaves the dome, hits your shoulder and comes home (label: to you and back, about 60 billionths of a second) while a second pulse to a far building is still out; the sweep turns the street into rings of points. |
| 4 | 20.42 | Radar tracks speed, even in rain. Cameras pick out traffic lights and signs. | Rain falls into the point world; a violet radar shell rolls out and the cyclist turns violet with BIKE · 6 MPH; a pale camera cone from the windscreen gives colour back to the red light and the 25 sign. |
| 5 | 25.57 | But seeing isn't enough. It guesses where the people, bikes and cars around it might go next. | See-through ghosts fan out under the red light: three futures of you (crossing, waiting, turning back), the bike's, a cross car's; "CROSSING · LIKELY" brightens. |
| 6 | 30.75 | Then it plans a path around all of them, again and again as they move. | You start to cross; ghost cars burst from the bumper down every route, the ones that would go now pop at your path, the one that waits turns into a green ribbon; it re-plans twice and the ribbon extends once you are clear. |
| 7 | 34.44 | Waymo has practised over 20 billion miles in simulation. | Rising along the ribbon, the street is one tile in a grid of practice tiles to the horizon, cars moving in each; a counter runs to 20 billion. |
| 8 | 38.52 | Tesla bet differently: cameras only, no lidar, and one neural network that turns video into driving. | The camera drops to a Tesla on the next block; the point world switches off; eight camera cones open (2 windscreen, bumper, 2 pillars, 2 fenders, rear), a ghost lidar dome lifts off and vanishes, light streams from the cones into one knot, a beam goes down to the wheel and the car moves. |
| 9 | 45.10 | Teslas people buy still need a driver watching. But some Tesla robotaxis in Texas now run with no employee on board. | Front three-quarter of the Tesla: a camera-coloured eye cone from the driver's seat through the windscreen, DRIVER WATCHING; the camera travels on to a Tesla robotaxi, NO ONE AT THE WHEEL. |
| 10 | 53.09 | So, is it cracked? Not yet. But in parts of about 15 US cities, a car with no driver already sees you, guesses your next step, and drives around you. | Rise from the street to a night map of the US (NASA Black Marble); 15 Waymo metros light up; dive back into the city to the first crosswalk: the ring finds you, your ghost steps ahead, the green path bends around you and the robotaxi pulls away. |

Captions (code-history-01 style: Hanken Grotesk 800, top safe area, spoken words white, unspoken grey) follow the
VO word timings; on-screen labels carry sources; "ILLUSTRATION" sits on every sensor drawing.

## The thread (one shot, no cuts, no dissolves)
In `concept.md` (lead -> move -> next lead, carrier) with the visual language table. Every change of place is a
camera move through the world: centre line -> desert; rise out of the dust -> city; dive down a light trail ->
car; sweep -> point world; rise along the ribbon -> tiles; dive -> Tesla; travel -> Tesla robotaxi; rise in log
altitude -> US map; dive into the city -> crosswalk. No fades or dissolves anywhere (checked in code: no opacity
dips between sets; overlays only fade labels).

## Decisions made in place of approvals (and why)
| Stop | Decided by | Decision and reason |
|---|---|---|
| Idea / angle | Claude, from research | "How does a car with nobody in it see you": the viewer as pedestrian is the stake; Waymo's see/guess/plan chain, then Tesla's different bet. "Cracked" is asked and answered "Not yet" so it never overclaims. |
| Hook | Claude | Hook A (empty seat + "how does it see you?") over B ("Most people think..." opens mid-chain) and C (2004 first: stake comes late). |
| Script | fresh fact-check agent | 5 of 10 lines reworded as it proposed (factcheck.md); line 4 changed again after Kokoro voiced "read" as "red" (ASR caught it). |
| Pictures and concept | fresh brainstorm agent -> fresh picker agent | 52 ideas -> picks (pictures_picks.md); Claude cut scope for a one-day CPU build (concept.md "Director's scope decisions"). |
| Style frames | brief | "3D renders ... realistic assets": realistic 3D night street + luminous sensor layer; prototype stills judged instead of a style-frame round. |
| Key-frame board | Claude's stills review | Five stills rounds (s1-s5, ~90 stills) fixed before the full render; no board shown (no reviewer). |
| On-screen claims | fresh fact-check agent | factcheck_screen.md: 3 rewords applied ("fully autonomous", "To you and back", Tesla camera layout redrawn to the current Model Y: 2 windscreen + bumper + 2 pillar + 2 fender + rear). |
| Voice | Matthew (fixed) | Kokoro am_puck, speed 1.0, locked before timing. |
| Music | Matthew (fixed) | Three versions; windows from each track's loudness curve: Signal to Noise from 150 s (its swell lands on the map), Computations from 192 s, Horizons from 120 s. Gains set by measurement. |
| Sound effects | Claude, by measurement | CC0 library/sfx/cstack-cc0 + synthesized (pulse blips, rain, desert wind); 28 cues; no Sound Picker round (no listener). |
| Mute test, motion check | fresh judge / tool | See "Judges". |

## Assets
| Asset | Source | Licence / credit | Static or controllable | Changes |
|---|---|---|---|---|
| Robotaxi body | "Jaguar I-Pace" by Mona x Supercars, Sketchfab (sketchfab.com/3d-models/296a97a6c07041cf9c48f8a303315ed2) | CC BY 4.0 | Static, moved whole | Decimated 275k -> 153k tris (gltf-transform simplify); repainted white; our roof sensor dome and side pods added (generic, no logos). Wheel split into pivots was tried and dropped (stray shards): wheels static, framing keeps them out of moving close-ups. |
| Tesla (x4: FSD car, robotaxi, cross-street car, ghost copies) | "Tesla Model Y" by Man City Fan, Sketchfab (…/3593508ee9764ad3b7016861ea97707a) | CC BY 4.0 | Static, moved whole | 40k tris; repainted; baked texture has opaque windows, so the driver is shown by an eye-cone and a tag, not seen through glass. |
| You (pedestrian) | "Nathan Animated 003 - Walking 3D Man" by Renderpeople, Sketchfab (…/143a2b1ea5eb4385ae90a73657aca3bc) | CC BY 4.0 | Controllable (skinned, 2.2 s walk clip sampled by time) | 21.5k tris; ghosts are clones with an additive white material. |
| Cyclist | "Rigged cyclist" by novusod, Sketchfab (…/ff9f413898844f1d8ee7318f048b3619) | CC BY 4.0 | Rigged but no animation: moved whole | 49k tris. |
| Street, buildings, lamps, traffic light, speed sign, desert, 2004 truck, aerial city, tiles, cones, network, map dots | Ours (procedural, this film) | — | Built in code | — |
| US night map | NASA Black Marble 2016 via the parts globe (`earth_night.jpg`) | Public domain; NASA asks for credit | Static texture | Cropped by UV to the US. |
| Loaded but unused | "Street and City Props" (Spookyghostboo), "Downtown Buildings Set" (Daniel Zhabotinsky), both CC BY, Sketchfab | — | — | Tested, not in the picture: no credit needed; remove from `assets.ts` next time. |
| Music | Scott Buckley, "Signal to Noise", "Computations", "Horizons" (scottbuckley.com.au) | CC BY 4.0 | — | Windows and gains in sound/report.json. |
| Effects | library/sfx/cstack-cc0 (city-night, sonar-ping, whoosh-fast, whoosh-deep, tile-clicks, dslr-shutter, glass-ting, pop-soft, relay-click, electrical-hum, servo-arm) + synthesized (sine blips, pink rain, brown wind) | CC0 / ours | — | cues in sound/cues.json |

Model files are git-ignored (`projects/*/film/public/models/`); the table keeps the URLs to fetch them again.

## Caption text (draft, with all credits)
A car with nobody in it, at night, at a crosswalk. How does it know you're there?

It sees: lidar times laser pulses to build a 3D picture of the street, radar tracks speed (even in rain), cameras
read the lights and signs. It guesses where everyone might go next, and plans a path around them, again and again.
Waymo says it has practised over 20 billion miles in simulation and passed 500,000 fully autonomous rides a week
this year. Tesla bet on cameras only and one neural network; the FSD you can buy still needs a driver watching,
while some Tesla robotaxis in Texas now run with no employee on board.

Is self-driving cracked? Not yet. But in parts of about 15 US cities, it already works without a driver.

Sources: Alphabet Q1 2026 release; waymo.com; Tesla Q3 2026 update; CNBC (Jan 2026); DARPA. Illustrations, not
footage.

#selfdriving #waymo #tesla #robotaxi #lidar #ai #tech

Music: "<TRACK>" by Scott Buckley – released under CC-BY 4.0. www.scottbuckley.com.au
3D models (CC BY 4.0, via Sketchfab): "Jaguar I-Pace" by Mona x Supercars; "Tesla Model Y" by Man City Fan;
"Nathan Animated 003 - Walking 3D Man" by Renderpeople; "Rigged cyclist" by novusod.
Night map: NASA Earth Observatory (Black Marble). Voice: AI (Kokoro). Visuals: 3D illustrations.
(Use the track line matching the version posted.)

## Judges and checks
(filled after the full render)

## Open issues
(filled at delivery)

## Production analytics
(filled at delivery from the transcript with templates/remotion-film/analytics.py)

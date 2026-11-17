# Self-driving 01: production report (unsupervised run, 2026-11-16)

Deliverables (git-ignored, sent through the session):
- `projects/self-driving-01/renders/self-driving-01_signal-to-noise.mp4`
- `projects/self-driving-01/renders/self-driving-01_computations.mp4`
- `projects/self-driving-01/renders/self-driving-01_horizons.mp4`

One picture (63.4 s, 1080×1920, 30 fps), three sound mixes muxed with `-c:v copy`. Branch `claude/self-driving-01`.
Measured on the delivered MP4s (2026-11-17): 63.40 s, 1902 frames, h264 1080×1920 + AAC 48 kHz; 44 MB each;
Signal to Noise −14.4 LUFS / −2.7 dBTP, Computations −14.5 / −2.8, Horizons −14.5 / −1.9. Music 11.0–11.3 dB under
the voice while it speaks, rising 5–6 dB in pauses (sound/report.json). 28 effect cues (4.4 per 10 s).

## The script (locked after the fresh fact-check; voice Kokoro am_puck, 62.75 s, 182 words, 2.9 words/s)

| # | t (s) | Spoken line | Picture |
|---|---|---|---|
| 1 | 0.25 | There's nobody driving this car. So how does it see you? | A white robotaxi glides to a crosswalk at night; the camera holds on its empty front seats, pulls back as the roof sensor fires one cyan ring that finds you (orange, tagged PEDESTRIAN). |
| 2 | 3.32 | In 2004, not one robot car could finish a desert race. This year, Waymo passed half a million rides a week, with nobody at the wheel. | The camera runs down the centre line out of town to a 2004-era robot Humvee stuck on a desert berm; rises out of the dust over a city streaming with light trails (label: 500,000+ fully autonomous rides a week, Alphabet, April 2026); dives back down one trail to the robotaxi. |
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
| 2004 robot vehicle (v2) | "Humvee Transport" by karmy2k, Sketchfab (…/48336bc41caf4fa1bdf147823a774111) | CC BY 4.0 | Static, moved whole (rocks on its springs) | Fitted to 4.6 m; our generic roof sensor rack (bars, two boxes, domed pod, mast), no team markings. A photo-scanned Humvee was tried first and dropped (holes, melted roof up close). |
| Desert rocks (v2) | "Desert Rock" by James (…/143b7212ee38401694cdfae452c3529e); "Desert rock" by SeGook (…/4d3c4e8bbc394c6797c24e12520c7c66), Sketchfab | CC BY 4.0 | Static | 4 large + 26 scattered copies. |
| Desert ground (v2) | "Gravelly Sand", Poly Haven | CC0 | Texture | Toned to Mojave colours; on a procedural height field (track, ruts, berm, distant ranges). |
| Street, buildings, lamps, traffic light, speed sign, desert terrain and scrub, aerial city, tiles, cones, network, map dots | Ours (procedural, this film) | — | Built in code | — |
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
"Nathan Animated 003 - Walking 3D Man" by Renderpeople; "Rigged cyclist" by novusod;
"Humvee Transport" by karmy2k; "Desert Rock" by James; "Desert rock" by SeGook. Ground texture: Poly Haven (CC0).
Night map: NASA Earth Observatory (Black Marble). Voice: AI (Kokoro). Visuals: 3D illustrations.
(Use the track line matching the version posted.)

## v2 (2026-11-17, Matthew's notes)
Matthew: "the animation of the people walking is towards the camera but they are moving sideways across the street.
Also the toy car in the desert looks terrible. I'm sure we can do a better desert than that. And a better toy car".
- **Walkers:** `fit()` turned any model wider than deep by 90° (a walking person is wider at the shoulders than front
  to back), so you, the ghosts and the finale walker walked sideways. People now skip the auto-rotation and face the
  way they move. Checked on stills at the crossing and the ending.
- **Desert and vehicle:** new `desert.ts`: gravel ground (Poly Haven texture) on a height field with a dirt track and
  ruts continuing the road, a berm, scrub, scanned rocks, distant ranges in haze, a low dusk sun with shadows, soft
  round dust. The box truck is replaced by a sourced Humvee with a generic sensor rack, nosed up the berm, rocking and
  spraying sand (CMU's Sandstorm, the 2004 leader, was a modified Humvee stuck on a berm).
- **Whole film re-rendered** in one clean pass (no splices); the three music versions remuxed onto it.

## Judges and checks
- **Fact-check, script** (fresh agent, factcheck.md): 5 OK, 5 reworded, all applied.
- **Fact-check, on-screen text** (fresh agent, factcheck_screen.md): 9 OK, 3 reworded/redrawn, all applied. Map's 15
  metros match waymo.com/rides; Denver and Las Vegas are still invite-based (the label says "parts of").
- **Stills before the render:** five rounds, ~90 stills (s1–s5). Fixed: road missing (double shader patch), camera
  inside a building, wheel shards (wheel split dropped), desert lighting, city towers in the desert, lidar pulse
  invisible, ghosts too faint, rain drops at the lens, rise to the map flying 75 km sideways into empty sky, cyclist
  rider parked at the origin (skinned clone), Tesla leaving frame.
- **Motion check** (motion_check.py readout on the full cut; no accepted bar film exists in this container, so read
  against absolute thresholds): median 24.5 separate movers a second; flagged seconds 5–6 (stuck vehicle hold) and
  55–56 (map hold). Fixed: the vehicle now spins its wheels and sprays sand; the map dots send out rings and the camera
  drifts over the map.
- **Mute test** (fresh judge, frames every 0.5 s, captions blacked out; review/mute_test.md): recovered the hook, 2004,
  scale, the lidar timing (clearest beat), the scan, prediction, simulation, Tesla's supervised/robotaxi points and
  the map. Could not follow: what the radar dome, the white/green plan and Tesla's burst meant; the bike; the ending
  cut you off. Fixed by partial re-render (tags RADAR, POSSIBLE PATHS, PLAN: WAIT / GO, CAMERAS, NO LIDAR, ONE NEURAL
  NETWORK, STEERING, NEXT STEP, PLAN; Tesla reframed; ending camera keeps you in frame; tags clamped inside the frame).
- **Splice:** six partial re-renders (frames 120–245, 595–730, 920–1035, 1155–1445, 1655–1762, 1765–1901) spliced into
  the master, one two-pass encode; frame count checked (1902); seam frames compared with the master.

## Open issues
- **Not re-judged after the fixes.** The mute-test fixes were checked on stills only; no second mute test was run on
  the final cut.
- **Small grey source lines** (28 px) and the ILLUSTRATION tag are hard to read at phone size, and labels sit over busy
  backgrounds (mute judge). Fixing needs a full re-render (~2.5 h on this CPU); next time: 34 px sources and a
  scrim behind the label block.
- **4–5 s, the run to the desert:** at ~400 m/s some frames show bare dark ground, which reads as a flicker; 7–8 s the
  rise passes close over sand (an orange frame). Half-second each.
- **The bike** is hard to find in the radar beat (dark, small); the tag carries it.
- **Tesla windows are opaque** in the sourced model: the driver and the empty seat are told by tags and the eye-cone,
  not seen. A Tesla model with an interior would fix it.
- **Robotaxi wheels don't spin** (the wheel split failed on this model); moving shots keep them out of frame or slow.
- **Not in the asset library yet:** the four models are logged here with URLs; asset-library registration not done.
- **No listener:** music windows, effect choices and levels were set by measurement only. Listen to: 0–3 s (ring),
  15–18 s (pulse blips), 30–34 s (pops), the map swell at 53–57 s in each version.
- Re-check before posting (research.md): any newer Waymo weekly-ride figure; the FSD point release.

## Production analytics (templates/remotion-film/analytics.py on the session transcript; analytics_raw.json)
| Phase (start, UTC) | Wall time | Output tokens | Cache reads | Subagents (out / in tokens) | Notes |
|---|---|---|---|---|---|
| Research + script (11-16 22:27) | 6.4 min | 22.8 k | 7.1 M | 1 (16.9 k / 2.46 M) | research agent ran in parallel with sourcing |
| Pictures + voice (22:33) | 8.3 min | 33.5 k | 6.9 M | 3 (36.7 k / 1.79 M) | brainstorm, picker, fact-check; Kokoro VO 50 s |
| Build (22:42) | 11.2 min | 58.1 k | 7.9 M | 0 | world, cars, lidar shader, fx, timeline |
| Stills + fixes (22:53) | 62.8 min | 57.7 k | 29.3 M | 1 (12.3 k / 1.27 M) | 5 stills rounds; perf hunt (4.7 -> 3.4 s/frame) |
| Full render (23:56) | 245.7 min | 28.4 k | 37.5 M | 0 | ~110 min lost: a stray preview render starved the CPU, then a bug rebuilt the scene every frame, then a worker restart; the clean render took 105 min (02:16–04:01) |
| Review + partial re-renders + delivery (11-17 04:01) | ~60 min | ~25 k | ~15 M | 1 mute judge (13.4 k / 0.60 M) | 6 partial ranges (~45 min of rendering), splice, mix, mux |

Topic to delivery: about 6 h 30 min wall time, of which roughly 4 h was render or render-related waiting. Biggest
lessons (folded into three.md / the template): never use a fresh array as a memo dependency in a film shell; kill
stray renders before starting a long one; `remotion still` is ~4x slower than a one-frame render for heavy scenes.

# s3-canal-locks: script (v0.1, picture-first)

**Idea:** the Panama Canal lifts ships 26 m over the country with no pumps: lake water falls through tunnels in the lock
walls into each chamber, and the rising water floats the ship up a step. **Goal:** reach. **Format:** Reel
1080x1920, 30 fps, ~39 s. **Voice:** AI m5 (measured 2.6-2.9 words/s on the last two films).

## Hooks (three formulas, `hooks.txt`, `check_script.py --hooks`: 0 flags)
1. **Chosen, Cold Open Demo:** "Watch this ship rise eight meters. Not one pump is lifting it." | card NO PUMPS.
   Second sentence: "The canal's middle is a lake, twenty-six meters above the sea." Proof at frame 0: the ship is
   already rising against the wet lock wall (a time-lapse of the real 8 minutes).
2. Alternative: "Eight meters in eight minutes. That's how fast this lock lifts a ship." | 8 M IN 8 MINUTES
3. Alternative: "200 million liters. That's what one ship spends crossing Panama." | 200 MILLION LITERS
Chosen because its proof is the film's first picture and it states the surprise (no pumps) the whole film explains.

## Plan
- **Angle:** an ocean liner-sized ship climbs a mountain of water; gravity, not machines, does the lifting. Stake:
  everyone has seen a cargo ship; few know it climbs a staircase on its way across Panama.
- **Key moments:** (1) the ship rising against the lock wall, "NO PUMPS"; (2) the staircase seen from above: sea,
  three chambers, the lake 26 m up; (3) the cutaway: the gate shuts, a valve opens, lake water pours down a glowing
  tunnel inside the wall and bursts up through the floor; (4) the ship floats up and sails into the next step; (5) a
  58 m cube of water (one ship's 200,000 m3) tips into the sea, and rain refills the lake.
- **Thread:** the lake's water (cyan glow): it falls, fills, lifts, drains, and returns as rain.
- **Build or source:** the ship is sourced ("Container Ship" by RM02, Sketchfab, CC BY 4.0, 189k triangles); locks,
  gates, culverts, water, hills, lake, cube and rain are built in code (they must fill, open, glow and move on cue).

## Scout result
Three ships rendered in one light (`stills/scout_ships.png`): RM02's long red-and-black container ship reads as a
real Panamax; Styx's small cargo ship is too toy-like; gogiart's (539k) is heavy and stubby. Re-plan: none needed.

---

## Look sheet
**Style.** Realistic 3D (`styles/realistic-3d`), tropical afternoon, with one luminous layer: the moving lake water
(cyan glow in the tunnels and floor jets), the level lines (amber) and the water cube. Look pass: ACES once, realism-kit
sky and sun, environment on the water and ship only, vignette, light grain.

**World and scale.** 1 unit = 1 m. Gatun-style flight of three chambers along +X (ships climb toward +X): each chamber
320 m long, 33.5 m wide, walls 25 m tall; sea-level channel at y = 0, steps of 8.67 m, lake at y = 26 m. Ship 290 m
long, 32 m beam, draft 12 m. Side walls hold a 5.5 m culvert each; cross culverts under the floor with rows of holes.
Mitre gates: two leaves, 20 m tall. Green hills either side, lake to the horizon at +X, sea at -X.

**Light.** Sun 35 deg high from frame-left behind the camera (azimuth 300), sky deep blue to pale haze, cumulus, sun
#FFF1DC; concrete #9C978C with wet dark band below the waterline #4F5A5A; water #2F6B6A (deep) to #6FB7B0 (shallow).

**Colour meanings.**
| Colour | Means | Used on |
|---|---|---|
| Cyan #6FD6FF | the lake's water moving by gravity (the answer) | culvert flow, floor jets, the falling sheet, the cube, rain |
| Amber #FFB547 | level / step | level lines on the wall, "26 M", step outlines |
| Coral #FF5A4E | "no pump" / cost | the crossed-out pump card, the water lost to the sea |
| Glass white #EAF6FF | neutral | section cut edges, labels |

**Camera rules.** 35 mm (24 mm for the aerials). Cuts between worlds: CUT_SECTION before "The gate" (exterior ->
section cutaway), CUT_BACK before "Three steps" (section -> aerial), CUT_SEA before "Each ship" (-> sea outfall).

**Frame maths.** Flight of three chambers ~1.1 km: a 9:16 frame needs it diagonal (the long axis climbing the frame) at
~900 m distance with 24 mm. Ship 290 m long at that distance ~ 200 px: fine for the wide. Chamber section: 33.5 m
wide x 25 m tall section, framed 40 m tall at ~39 m (35 mm). Culvert 5.5 m = 270 px in that frame. Hook: the ship's
hull rising against the wall from 60 m away: 8 m rise = 250 px.

**Safe areas.** Captions y 250-470; lead in y 520-1500; nothing below y 1500 or right of x 930 below y 1100.

**Visual language.**
| Item | States | Look |
|---|---|---|
| Lake water | still -> falling -> filling -> draining -> cube -> rain | dark green-blue -> cyan glowing flow in the tunnel -> jets -> level rising -> cube tips -> rain streaks |
| Gate | open -> closed | leaves swing on their hinges |
| Valve | shut -> open | a glowing ring turns cyan |
| Level line | — | amber line on the wall at the next step's height |

**Thread.**
| From | Move | To | Carrier |
|---|---|---|---|
| Ship rising (close) | pull back / up | aerial staircase | the ship stays the lead as the frame widens |
| Staircase | cut (section) | chamber section | the chamber the ship sits in |
| Valve | open | water in the tunnel | the cyan flow |
| Tunnel flow | burst | floor jets -> rising level | the water |
| Rising level | travel | ship rises to the amber line | the ship |
| Section | cut (aerial) | ship stepping up three chambers | the ship |
| Lake | cut (sea outfall) | 58 m cube tips into the sea | the water |
| Cube | pull up | rain clouds over the lake | the rain |

---

## Script table
| Time | Spoken line | On-screen text | What the viewer sees | Capture |
|---|---|---|---|---|
| 0-4.2 | Watch this ship rise eight meters. Not one pump is lifting it. | 8 METERS UP. NO PUMPS | The red-black container ship in a lock chamber rises 8 m against the wet concrete wall (time-lapse) | 3D: ship model + lock |
| 4.2-8 | The canal's middle is a lake, twenty-six meters above the sea. | LAKE: 26 METERS UP | Pull up to the aerial: sea at the bottom, three chambers stepping up, the lake at the top | 3D aerial |
| 8-12 | So ships climb to it in steps: concrete boxes called locks. | | The three chambers outline amber one after another as steps | 3D aerial |
| 12-17 | The gate behind the ship closes. A valve opens, and the lake falls in. | | CUT: section through the chamber; the mitre gate swings shut; a valve ring turns cyan; lake water drops into the wall tunnel | 3D section |
| 17-21.5 | It rushes through tunnels in the walls and bursts up through the floor. | | Cyan flow races down the 5.5 m tunnel (17-18.5 s), along cross tunnels under the floor (18.5-20 s), and jets up through rows of holes (20 s) | 3D section |
| 21.5-26.5 | In about eight minutes the box fills, and the ship floats up a step. | 8 MINUTES | The water level climbs to the amber line (21.5-25 s); the ship rises with it; the camera pulls back to show the whole section | 3D section |
| 26.5-29.8 | Three steps, and it sails out onto the lake. | | CUT: aerial; time-lapse of the ship rising through three chambers and sailing onto the lake | 3D aerial |
| 29.8-33 | Going down, the water just drains to the sea. | | The last chamber drains; the outflow runs toward the sea | 3D aerial |
| 33-38.5 | Each ship spends about two hundred million liters, and the rain refills the lake. | 200 MILLION LITERS | CUT: a 58 m cube of water beside the ship (33-35 s) tips into the sea (35-36 s); pull up: rain falls on the lake (36.5 s) | 3D sea + lake |

## Claims to verify
1. Panama Canal locks lift ships with no pumps: gravity-fed from Gatun Lake (and Miraflores/Gatun systems).
2. Gatun Lake is about 26 m above sea level; ships climb to it in three steps (Gatun locks: three chambers).
3. A lock chamber fills in about 8 minutes; one step lifts a ship about 8 m (8.5-8.7 m).
4. Water flows through culverts (tunnels) in the lock walls and rises through openings in the chamber floor.
5. The gate behind the ship closes; valves open.
6. Going down, the water drains (to the sea / the lower level).
7. Each ship transit uses about 200 million liters (52 million US gallons) of fresh water, released to the sea.
8. Rain refills Gatun Lake (the canal's water supply depends on rainfall).
9. On screen: chamber 320 x 33.5 m, culvert 5.5 m, ship ~290 m (Panamax).

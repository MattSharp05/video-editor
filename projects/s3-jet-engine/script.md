# s3-jet-engine: script (v0.1, picture-first)

**Idea:** in an airliner's jet engine most of the push comes from cold air the big fan blows around the core; the fire
inside mostly spins the turbines that turn the fan. **Goal:** reach. **Format:** Reel 1080x1920, 30 fps, ~38 s.
**Voice:** AI m5 (~2.8 words/s).

## Plan
- **Angle:** "Most people think a jet engine pushes with fire" (Matthew's favourite hook shape), then watch the air.
- **Hook picture:** an airliner engine on its takeoff roll at blue hour, the exhaust glowing hot; the cowling opens.
- **Key moments:** (1) the cowling halves and the cutaway shows the air; (2) ten glowing beads of air arrive at the
  fan: one drops into the core, nine go around; (3) the core bead is squeezed (bunches, brightens), burns (turns
  coral-hot); (4) an amber pulse runs from the last turbine along the shaft to the fan, which spins up; (5) behind the
  engine a wide cold cyan stream next to a thin hot jet, with a big cyan thrust arrow and a small coral one; (6) the
  runway falls away: liftoff.
- **Thread:** the air beads (cyan = cold bypass air, the answer; coral = burned core air, the belief), carried
  through every shot.
- **Build or source:** the engine is sourced (a cutaway turbofan with a spinning rotor joint: "Jet Engine" by Pilot,
  CC BY); the wing, pylon, runway, sky and every bead, stream, arrow and glow are built in code.

## Scout result
Four engines rendered in one light (`stills/scout_engines.png`): the cutaway (Pilot; a re-upload exists under another
name) shows fan, compressor, combustor, turbines and nozzle in one half-section and its rotors spin from one joint:
chosen. The CFM56-7B (no nacelle, cables) and a gold display turbine were rejected. Re-plan: the model's nacelle is a
half shell (the open side faces the camera), so the hook adds a mirrored copy of the shell that swings away on "But".

---

## Look sheet

**Style.** Realistic 3D (`styles/realistic-3d`), blue hour on a runway, with one luminous layer: the air beads, the
streams and the thrust arrows. Look pass: ACES once, exposure per shot, realism-kit sky + environment on the engine
only, vignette, light grain, glows as additive sprites.

**World and scale.** 1 unit = 1 m. Engine axis along +X (air flows +X, so the plane moves toward -X), fan face at
x = 0, axis at y = 2.2 m over the runway, z = 0. Nacelle 2.5 m across, engine 4.4 m long (fan lip to tail cone).
Fan radius 1.1 m, core inlet radius ~0.4 m, bypass duct 0.55-1.15 m. Wing underside 3.9 m up, pylon above the
engine. Runway 45 m wide, edge lights every 60 m, centre line lights every 15 m.

**Light.** Sun 3 deg below the horizon behind the camera-left; sky deep blue #1B2C55 overhead to a peach band
#F0A070 on the horizon; runway lights white #FFF3DC, taxiway blue; engine metal (titanium/steel #9AA3AD, roughness
0.35), nacelle white paint #E8EAEC, inner duct grey #6C737B; combustor glows coral when burning. Exposure: exterior
0.9, close inside 1.1.

**Colours (fixed).**
| Colour | Means | Used on |
|---|---|---|
| Cyan #6FD6FF | cold air, the bypass stream, the answer | air beads, bypass stream, big thrust arrow, "most of the thrust" |
| Coral #FF5A3C -> amber #FFB547 | fire, burned air (the belief) | core beads after the combustor, hot jet, small thrust arrow |
| Amber #FFB547 | spin / energy carried to the fan | the shaft pulse, the fan's glow ring |
| Glass white #EAF6FF | labels, neutral | labels |

**Camera rules.** 35 mm. Inside one world continuous moves; cuts where the camera would pass through the nacelle:
CUT_IN before "In today's" (into the intake close-up), CUT_BACK before "That huge" (out behind the engine).

**Frame maths.** Side cutaway of the whole engine: 4.4 m across 1080 px needs ~8 m at 35 mm (0.58 x 8 = 4.6 m wide);
frame height 8.2 m, so the nacelle (2.5 m) is ~590 px tall at y 700-1290: the wing fills the top, the runway the
bottom. Beads 0.05 m = 12 px; the ten big counting beads 0.18 m = 40 px. Fan close-up: 3.5 m away -> 3.6 m tall frame.

**Safe areas.** Captions y 250-470 (top scrim); lead inside x 60-1020, y 520-1500.

**Visual language.**
| Item | States | Look |
|---|---|---|
| Air bead | cold -> squeezed -> burned -> spent | cyan -> white-cyan, bunched -> coral-hot -> dim amber |
| Bypass bead | cold -> pushed | cyan -> cyan with a streak (faster after the fan) |
| Shaft | idle -> carrying spin | steel -> amber pulse running forward |
| Thrust arrow | — | cyan (big) / coral (small) |

**Thread.**
| From | Move | To | Carrier |
|---|---|---|---|
| Hot exhaust (the belief) | open (cowling swings away) | cyan streams in the bypass | the streams are already flowing past the opening |
| Bypass streams | travel upstream (camera) | fan face | beads flow toward the fan |
| Fan face | cut (close at the intake) | ten counting beads | the beads arrive at the fan |
| One core bead | travel | compressor -> combustor -> turbines | the bead itself |
| Last turbine | amber pulse along the shaft | fan | the pulse |
| Fan | pull back along the bypass | nine beads leaving | the beads |
| Exits | cut (behind the engine) | two streams + arrows | streams continue out of the nozzles |
| Arrows | pull back | the wing lifting off | the cyan arrow points along the motion |

---

## Beats (stand-in times; re-timed from the VO)
1. **"Most people think a jet engine pushes the plane with fire."** Start (cover): low front 3/4 of the engine on the
   takeoff roll, the fan spinning, runway lights streaking, hot coral glow and heat shimmer from the exhaust. Camera
   slides back along the side. On "fire" the exhaust glow flares.
2. **"But most of the push comes from air that never touches the flame."** The near half of the cowling swings up and
   away; inside, cyan streams run around the core. Camera: side view, 8 m.
3. **"Watch the air. The giant fan at the front pulls in a huge gulp."** Beads stream in from the front; the fan
   spins up. Camera drifts toward the intake.
4. **CUT "In today's big engines, only about one part in ten goes into the core."** Close at the fan face: a column of
   ten big beads arrives; the one nearest the middle drops into the core, nine go into the bypass ring. Labels
   "1 in 10" (coral-white) and "9 go around" (cyan).
5. **"There it's squeezed, mixed with fuel and burned."** Camera tracks the core bead back: it bunches and brightens
   through the compressor, then flares coral in the combustor.
6. **"The hot blast spins turbines, and the last one turns the fan."** The turbines glow; an amber pulse runs from the
   last turbine forward along the shaft to the fan, which glows amber at its hub.
7. **"The other nine parts never burn. The fan just shoves them backward, around the core."** Pull back along the
   bypass: the nine cyan beads streak backward and leave the duct.
8. **CUT "That huge, slower stream makes most of the thrust."** Behind and below the engine: a wide cyan stream and a
   thin, fast coral jet; a big cyan arrow and a small coral arrow push forward on the engine; label "most of the
   thrust" (+ small "Rolls-Royce Trent 1000: over 85%").
9. **"So the fire spins the fan, and the fan does most of the pushing."** Pull back to the whole wing and engine; the
   runway drops away: liftoff.

## Fact check (fresh agent, 2026-11-19)
| Line | Verdict | Source |
|---|---|---|
| 2 never touches the flame | holds: bypass air never enters the combustor | NASA Glenn aturbf |
| 4 one in ten | holds: GE9X ~10:1, GEnx 8.8-9.0, Trent 1000 10:1, LEAP-1A 11 (secondary), PW1100G 12 (secondary) | GE, Rolls-Royce pages |
| 6 turbines | reworded "spins a turbine, which turns the fan" -> "spins turbines, and the last one turns the fan" (LP turbine drives the fan) | NASA Glenn "fan turbine" |
| 8 slower, most of the thrust | holds: fan air leaves only slightly faster than free stream; Trent 1000 fan "over 85%" of thrust | NASA Glenn; Rolls-Royce Trent 1000 |
| 9 | reworded "the fire mostly turns the fan, and the fan pushes the plane" -> "the fire spins the fan, and the fan does most of the pushing" (the HP turbine drives the compressor; the core jet makes ~15 %) | fact-checker |
Not usable: "about 80 %" (only Flying magazine / forums).

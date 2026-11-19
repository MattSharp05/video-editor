# s3-taipei-damper: script (v0.2, picture-first; board v1 judged and fixed)

**Idea:** Taipei 101 stays steady in a typhoon because a 660-tonne ball hangs near its top like a pendulum, tuned to
swing a beat behind the tower so it always pulls against the sway, while pistons turn the swing into heat.
**Goal:** reach. **Format:** Instagram Reel 1080x1920, 30 fps, ~40 s. **Voice:** AI m5 at ~2.84 words/s.

Numbers in the shot notes are **starting values**; the reference stills tune them.

## Plan (picture-first step 1)
- **Angle:** a giant golden ball hangs inside a skyscraper, and it's there so the tower doesn't sway. Stake: everyone
  has felt a building or bridge move; the fix is a hanging ball.
- **Hook picture:** a green-glass tower top in a dusk storm; its wall turns to glass and a glowing gold ball appears.
- **Key moments:** (1) the facade turns to glass on "ball"; (2) the wind bends the whole tower, a coral trail at the
  tip; (3) the cutaway: tower and ball swinging out of step, two pens drawing a coral and an amber wave a quarter
  wave apart (a seismograph made of light); (4) pistons glowing hot as they slide; (5) a coral ghost tower swinging
  wide next to the real one swinging less.
- **Thread:** the ball (its gold glow is in every shot) and the sway trail.
- **Build or source:** everything is the lead or must bend/swing (tower, ball, cables, pistons, traces): built in code.
  Scouted Sketchfab for the tower and a damper (see brief): nothing usable.

## Scout result (step 2-3)
Three "Taipei 101" models rendered in one light (`stills/scout_taipei.png`): massing toys or broken. No damper model.
Re-plan: build the tower as stacked frustums with a facade shader (floor lines, mullions, lit floors) so it can bend
in the vertex shader and dissolve to glass on cue.

---

## Look sheet

**Style.** Realistic 3D (`styles/realistic-3d`), dusk typhoon, with one luminous layer: the ball's glow, the trails,
the traces, the piston heat. Look pass: ACES once, exposure per place, sky-coloured hemisphere light, environment on
the ball only, vignette and light grain, glow as additive sprites.

**World and scale.** 1 unit = 1 m. Tower axis at x = z = 0, ground y = 0, sway along +X (wind from frame-left).
Taipei 101: base trunk (floors 1-26) 0-112 m, tapering 62 -> 44 m wide; eight flared modules of 8 floors, 34.3 m tall
each (112-386 m), each flaring from 40 m wide at its foot to 50 m at its top (the "bamboo" segments); crown
386-448 m (34 -> 26 m wide); spire to 508 m. Floor height 4.29 m. Ball: 5.5 m sphere (41 stacked 0.125 m plates
visible as fine rings), centre at y = 380 m (floor 88-89), hung from a frame at floor 92 (y 395) by 8 cables in
4 pairs; under it a ring of 8 pistons to the floor of 87 (y 369).

**Light.**
| Setting | Value | Why |
|---|---|---|
| Time | Dusk under typhoon cloud, sun just set (elevation -2 deg) | Storm mood, city lights on, the gold ball is the warmest thing |
| Sky | Overcast dome: #1C2638 overhead -> #4A5568 at horizon, a faint orange band #C27A4A low in the west (frame-left behind the tower) | Rim behind the tower, depth |
| Cloud | Two fbm layers racing left to right at 40 and 70 m/s, dark slate #2A3344, lit edges #6B7488 | Typhoon wind you can see |
| Tower glass | Blue-green #3F7F86 at roughness 0.25, reflects sky; mullions every 2.2 m; floor lines every 4.29 m; 30 % of floors lit warm #FFC98A | Taipei 101's green glass |
| City | Blocks 10-120 m tall over 3 km, dark #1A1E26 with warm and cool window dots; streets of sodium #FFB070 lines | Scale and dusk |
| Rain | Streaks slanted 20 deg with the wind, white #CFE6F5 at 15 % | Air and wind direction |
| Interior (damper floors) | Warm work light 3200 K #FFD3A0 from above; dark steel #2B2F36; concrete #6E6A64 | The ball glows gold |
| Exposure | exterior 0.55, interior 0.75 (ACES, tuned on the board) | per place |

**Colour meanings (fixed).**
| Colour | Means | Used on |
|---|---|---|
| Gold/amber #FFB547 | the ball, the answer, the calm | ball glow, ball trace, cable glow on the pull, "with it" trail |
| Coral #FF5A4E | the tower's sway / the problem | tip trail, tower trace, ghost tower |
| Orange #FF8A4C -> #FFD08A hot | heat | piston glow |
| Glass white #EAF6FF | neutral structure | cutaway edges, glass rim |
Everything else desaturated blue-grey.

**Camera rules.** 35 mm (36 mm gauge; vertical FOV 54.4 deg, frames a height of 1.03 x distance). Continuous moves
inside a world; **hard cuts** between exterior and the cutaway interior (the camera would pass through the wall):
CUT_IN before "But the ball", CUT_OUT before "Without", CUT_IN2 before "In a 2015". Never parks.

**Frame maths.**
- Upper tower wide (y 150-510 m): needs ~380 m of height -> d = 370 m. 1080 px across 214 m -> 5 px/m. Sway shown
  +-15 m at the tip (with the ball) and +-25 m (ghost, without) -> +-75 / +-125 px: readable with a trail. Real typhoon
  sway is far smaller: **"motion exaggerated"** tag on screen in every exterior sway shot.
- Ball in the wide: 5.5 m = 28 px: carried by a 30 m gold glow sprite through the glass.
- Cutaway: frame 34 m tall -> d = 33 m: ball 5.5 m -> 310 px. Tower motion at that height shown +-2.5 m (80 px),
  ball swing relative to the floor +-2 m: a quarter wave behind.

**Frame and safe areas.** Captions y 250-470 over a top scrim. Lead inside x 60-1020, y 520-1500. Nothing important
below y 1500 or right of x 930 below y 1100.

**Visual language: states.**
| Item | States | Look |
|---|---|---|
| Facade | solid -> x-ray | green glass -> 8 % tint with bright rim, floors as thin lines |
| Ball | resting -> swinging -> pulling | gold metal with soft glow -> + amber trace pen -> + the cables on the pull side glow amber |
| Tower | still -> swaying | + coral trail at the tip (last 3 s) / coral trace pen in the cutaway |
| Piston | idle -> sliding hot | dark steel -> orange-white glow by speed |
| Ghost tower | — | coral glass copy, 1.67x the real sway |

**Thread.**
| From lead | Move | To lead | Carrier |
|---|---|---|---|
| Tower top | transform (wall to glass) | ball | the glass dissolve opens on the ball |
| Ball | pull back | whole tower | the ball's glow stays in frame as the tower grows around it |
| Tower | sway | tip trail | the trail leaves the tip |
| Tip trail | cut (into the cutaway) | ball and floor | push toward the ball's glow, cut on "But" |
| Ball | pens draw | two traces | each pen hangs from its object |
| Traces | crane down | pistons | the ball's trace pen points down at them |
| Pistons | cut out | ghost + real towers | heat glow -> the ball's glow in the wide |
| Towers | cut in | ball and the 1 m mark | the ball's glow |

---

## Beats (times from stand-in words; re-timed from the VO)

### 1 · hook · "There's a 660-ton steel ball hanging inside this skyscraper."
**Start frame (cover):** dusk storm, camera at (0, 372, 95) looking at (0, 375, 0), 35 mm: three upper modules fill
the frame (y 330-420 m), green glass, lit floors, rain streaks, clouds racing behind. **Action:** on "ball" the wall of
floors 86-93 dissolves to glass over 0.6 s from the middle out: the gold ball appears, glowing, with its cables.
**Camera:** push 95 -> 75 m. **Lead:** the tower top -> the ball. **End frame:** ball at screen centre (y ~ 960).

### 2 · "It's how Taipei 101 rides out typhoons."
**Action:** wind and rain thicken; "Taipei 101" in small white type beside the crown. **Camera:** pull back and down to
the upper-tower wide (0, 300, 370) looking at (0, 330, 0). **Lead:** the tower with its gold glint. **End:** the
upper tower over the city, clouds racing.

### 3 · "Wind shoves the tower, and the top starts to sway."
**Action:** on "Wind" a band of rain streaks sweeps in from frame-left; on "shoves" the tower bends right (tip +15 m),
then sways at a 4 s period; a coral trail draws at the tip. "motion exaggerated" tag at y ~1440. **Camera:** slow
orbit 8 deg. **Lead:** the tip trail.

### 4 · CUT · "But the ball hangs from cables, like a giant pendulum."
**Start frame:** the cutaway of floors 86-93 (front wall gone, floor slab edges glowing glass white), camera at
(0, 380, 33) looking at (0, 380, 0): ball centre frame, 8 cables rising to a steel frame, storm windows behind.
**Action:** on "cables" a light runs up the cables; the ball swings +-2 m relative to the floor. **Lead:** the ball.

### 5 · "It's tuned to swing in time with the tower, one beat behind."
**Action:** two pens appear: a coral one on the floor slab edge (the tower), an amber one under the ball; each draws a
wave on a glowing strip that scrolls down below the floor: two waves of the same rhythm, the amber a quarter wave
behind. **Camera:** pull back to 40 m and down 4 m so the waves show. **Lead:** the waves.

### 6 · "So as the top swings one way, the ball pulls the other way."
**Action:** each time the floor moves, the cables on the opposite side glow amber (the pull), with a soft amber
chevron on the ball pointing against the floor's motion. **Camera:** push in to 30 m.

### 7 · "Pistons below soak up the swing as heat."
**Action:** 8 pistons under the ball slide in and out; each glows orange to near-white with its speed, heat shimmer
above. **Camera:** crane down to (0, 369, 22) looking at (0, 368, 0).

### 8 · CUT · "Without the ball, the top would sway much farther."
**Action:** exterior wide (as beat 3): a coral glass ghost of the tower sways 1.67x as far, with a wide coral trail.
**Lead:** the ghost's trail.

### 9 · "With it, the sway drops by up to 40 percent."
**Action:** the real tower's narrower amber trail draws inside the coral one; the ghost fades; label "up to 40% less
sway" near the crown. **Camera:** slow push.

### 10 · CUT · "In a 2015 typhoon, it swung a full meter."
**Action:** low cutaway on the ball; a 1 m amber scale bar on the floor under it; the ball swings out to the bar's end
on "full meter" (the bar lights). Hold, then cut to the cover frame (loop).

## Captions (sense units; key words amber)
1. There's a 660-ton steel [ball] hanging inside this skyscraper.
2. It's how Taipei 101 rides out typhoons.
3. Wind shoves the tower, and the top starts to [sway.]
4. But the ball hangs from cables, like a giant [pendulum.]
5. It's tuned to swing in time with the tower, one beat [behind.]
6. So as the top swings one way, the ball pulls the [other] way.
7. Pistons below soak up the swing as [heat.]
8. Without the ball, the top would sway much farther.
9. With it, the sway drops by up to [40 percent.]
10. In a 2015 typhoon, it swung a full [meter.]

## Sound cue list (CC0 sfx-29-61 or synthesized)
Wind/rain bed (exterior: pink noise high-passed + rain hiss), interior hum bed (brown noise), glass shimmer for the
x-ray (glass-ting), gust whoosh on "Wind", whoosh peaking on each cut, cable creak (ship-creak, low), a soft pendulum
tick at each turn of the ball (clock-tick, low), hydraulic hiss for the pistons (synth filtered noise), steel clank on
the 1 m mark (vault-clank, soft).

## Claims to verify (fresh-agent fact check before the board)
1. Taipei 101 has a 660-ton (metric: 660 t) steel ball hanging near its top (floors ~87-92).
2. It's a tuned mass damper: a pendulum tuned to the tower's sway rhythm, moving out of step with it (lagging).
3. As the top swings one way, the ball pulls the other way (the damper force opposes the motion).
4. It hangs from cables.
5. Pistons (hydraulic viscous dampers) below it absorb its motion as heat. (8 of them)
6. The ball reduces sway by up to 40 %.
7. In a 2015 typhoon (Soudelor, Aug 2015) it swung about 1 m, its largest recorded movement.
8. It helps the tower ride out typhoons (wind). Taipei 101 = 508 m, 101 floors.

---

## Spoken lines as recorded (after the fact check)
1. There's a six hundred sixty ton steel ball hanging inside this skyscraper. (caption: 660-tonne)
2. It's how Taipei 101 rides out typhoons.
3. Wind shoves the tower, and the top starts to sway.
4. But the ball hangs from cables, like a giant pendulum.
5. It's tuned to the tower's own rhythm, swinging just behind it.
6. So as the top sways, the ball tugs against it.
7. Pistons below soak up the swing as heat.
8. Without the ball, the top would sway much farther.
9. With it, the sway drops by up to forty percent.
10. In a twenty fifteen typhoon, it swung a full meter.

## What the board changed (v0.1 -> v0.2)
| Beat | Script said | Stills / judge showed | Now |
|---|---|---|---|
| 1 | cover: facade solid, wall turns to glass on "ball" | a grey-green box, nothing stops the scroll | x-ray at 40 % from frame 0 (ball visible), full on "ball"; camera 70 -> 56 m |
| 1-9 | 2.2 m bays, 30 % floors lit | windows read as white slashes (sheared bays on the flared faces) | 1.6 m bays measured on each section's mid width (vertical columns), ~10 % lit, dim |
| 5-6 | two 3D pens drawing on a strip below the floor | read as exhaust trails; lag not comparable; labels below y 1500 | one glass panel (y 1080-1390) with both waves on a shared time axis, dashed peaks, "a quarter swing later" |
| 8-9 | ghost tower + trails at the tip | ghost ~60 px off, label at 15 % behind the caption | ghost opaque coral (tip sway 18 m x 1.67), coral arc above, amber arc below, label y 1330 |
| 10 | 1 m bar on the floor | a tiny glyph | bar 0.42 m wide, plumb spot with its track, label above the bar end |
| loop | cut to the cover | tower 29 m off its base (typhoon sway kept) | sway calmed to the cover's after CUT_END |

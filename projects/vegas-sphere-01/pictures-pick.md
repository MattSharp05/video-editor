# Vegas Sphere 01: picture pick

Source: `pictures-brainstorm.md` and `lines.txt` (10 lines, about 55 s, 9:16 Reel, 3rd-grade reading level).
Route: everything drawn in code in Remotion, rendered on a 4-core CPU with no GPU, by one builder in about 1.5 h.
Not allowed: AI video, stock footage, show content, Sphere logos. We draw our own emoji, eye, TV, skyline and so on.

## The build insight that decides most picks

Lines 1, 2, 3, 5, 6, 7, 8 and 10 can all run on one engine: a **PuckField** canvas. It takes a
source picture (our emoji, then our eye, both drawn into an offscreen canvas at "puck
resolution") and a camera (centre and zoom). It always draws that picture as dots with gaps:

1. Draw the low-res source scaled up with nearest-neighbour sampling.
2. Mask it with a tiled one-puck pattern (`createPattern` + `destination-in`).
3. When the dot pitch falls below about 3 px, crossfade to the smooth, slightly blurred picture.

Each frame costs about the same at every zoom. A per-puck override layer handles the wave fill,
the colour reels, the pulse arrivals and the blink. This gives the film's main mechanism (dots
up close, one picture from far away) as real on-screen behaviour instead of a label, and it is cheap.

Consequences:
- Stay in 2D canvas and SVG. No three.js. Software WebGL at 1080×1920 is the main render risk,
  and nothing here needs it. The Sphere far away is a shaded circle. Close up it is flat (the
  building is huge). The interior dome is faked perspective.
- Render estimate: about 1,650 frames at roughly 0.2–0.4 s each over 4 cores, so a few minutes.
- Build estimate: engine 25 min · Strip, CRT and Sphere sets 15 · puck close-ups (slapshot,
  lattice, tape, 48 diodes, reel) 20 · wires and computer 10 · eye rig 10 · interior 10 · outro 5.
  That is about 95 min, so it is tight. If time runs out, cut these first, in order:
  (a) the car the eye follows in line 8,
  (b) the trip to the computer in line 6 (the pulses arrive from off-frame instead),
  (c) the counter in line 3.

## One film: the camera thread

There is one continuous move with no cuts. Wide shot of the Strip → push into the screen →
land on one puck → slip behind it → into its face → out along its wire → ride a pulse back →
long pull-back → the eye → through the pupil → up through the roof → back to the wide shot.
**The point of focus is always a single dot**, the same one where we can. It is the puck in the
emoji's smile line that we land on in line 2. We meet it again in lines 3, 4, 5 and 6. In line 7
it ends up as part of the eye.

Two devices link the sections, and both come from the beats' own pictures:
- **The picture swap.** We go in on the emoji (line 2). While we are close, the computer's
  pulses (line 6) repaint the patch white, blue and black. The pull-back (line 7) reveals that the
  building now shows an eye. This proves line 6 without a single label. It is also the twist that
  makes the long pull-back pay off.
- **The rabbit-ear antenna.** The line-1 "it's a TV" gag stays on top of the Sphere in every wide
  shot. In line 10 the eye glances up at it and blinks it off. That closes the myth.

Changes of world, and why each one earns its place:
- **Behind the frame (line 4).** The line is about the frame. We enter through the same gap the
  bird used in line 2.
- **The computer (line 6).** The line names it. We get there along the puck's own wire from line 4.
- **The interior (line 9).** The line demands it. We enter through the pupil of the eye we have
  just watched.

Each of these grows from the previous frame through one point. None of them is a cut to a new set.

## Judgement per line

Each line was rated on four things:
- clarity: with the sound off, can you work out the mechanism?
- surprise: would someone screenshot it?
- spectacle: does the motion hold the eye?
- cost

### 1. "Most people think the Sphere … is one giant TV."
- **Pick: the CRT inflates into the Sphere (#2), with the screen showing our emoji.** A boxy TV
  with rabbit ears stands on the dusk Strip. It swells and rounds into the Sphere while the emoji
  on its screen grins wider. The antenna stays poking out of the top.
  - Clarity: the TV turns into the Sphere, so you read "people think it's a TV" at once.
  - Surprise: high.
  - Spectacle: one big change of shape, with Strip lights around it.
  - Cost: low. It is a rounded-rect radius tween plus a clip.
- Runner-up: the remote flips channels (#1). It is clear and fun. But it only shows "a TV doing TV
  things", which is less surprising than the transformation, and it adds a second prop. The
  screen-protector peel (#3) is unclear with the sound off. The personified "I'm a TV" (#4) needs
  text. The kid's drawing (#5) is a change of world on the very first frame.

### 2. "But actually, it's over a million glowing dots, with gaps between them."
- **Pick: the literal continuous push (#1), plus a small bird darting through a gap (a cheaper,
  scale-safe version of #2's pigeon).** The camera pushes into the emoji's smile. The smooth
  picture breaks into glowing dots with dark gaps. That is the engine doing its job, live. Then a
  sparrow silhouette flicks through one gap, which proves the gaps are real holes.
  - Clarity: maximal, because this is the mechanism.
  - Surprise: the break-up itself, plus the bird.
  - Spectacle: thousands of dots expanding past the camera.
- Runners-up:
  - Finger poke (#2): funny, but a finger breaks the scale (a finger next to a 366-ft building).
  - Climbing tourist (#4): good scale, but a character rig costs too much.
  - Lite-Brite (#3): clear, but a change of world we don't need, because the literal version is just as clear.

### 3. "… lights shaped like hockey pucks. There are about one point two million."
- **Pick: the slapshot (#2) folded into the stadium-fill wave (#1/#5).**
  1. The push ends on one empty, dark slot in the grid (our dot has "fallen out").
  2. A hockey stick swings in and slapshots a puck into the slot. *Thunk.* It lights up.
  3. The camera tilts slightly so the pucks show their thickness. You see the hockey-puck shape
     with no label.
  4. The camera rises along the surface while a wave of pucks lights slot by slot across the
     whole field, like a stadium filling up.
  5. A small counter rolls to 1,200,000 as it goes. It is attached to the wave, not floating on a still frame.
  - Clarity: the hockey stick names the shape instantly.
  - Surprise: high, and very screenshot-able.
  - Spectacle: a huge field filling with light.
  - Cost: low. The puck is an ellipse plus a side band, and the wave is a threshold sweep in the
    override layer.
- Runners-up:
  - Puck tower or football fields (#4): it makes the number felt, but it is a change of world and
    needs a second scale model.
  - Disco ball (#3): pretty, but it says "mirror", not "puck".

### 4. "They sit on a steel frame, about eight inches apart. Each puck holds forty eight tiny lights."
- **Pick: literal (#1), staged as a journey.**
  1. The camera dips through the same gap the bird used and slides *behind* the pucks.
  2. Two parallax layers (pucks in front, steel lattice behind) show the pucks mounted on bars.
  3. A tape measure whips out between two pucks, reads 8 in, and snaps back with a recoil wobble.
  4. The camera swings round to the front and dives into one puck face: a honeycomb of 48 tiny
     LEDs that light in a fast counting sweep.
  - Clarity: high, because both facts are shown as objects.
  - Surprise: medium. The snap-back and the 48 lights popping on carry it.
  - Cost: low to medium.
- Runners-up:
  - Sandwich in the gap (#3): fun, but "8 inches apart" means centre to centre, so the sandwich
    misreads the gap, and food is a change of world.
  - Egg carton or pomegranate (#2) and muffin tin (#4): these hide the real object. Here the
    literal picture is clearer and just as interesting.

### 5. "Each puck is one dot of the picture. It can glow in millions of colors."
- **Pick: the slot-machine reel (from #3) inside the literal puck, pulled back into the mosaic (#2).**
  1. The 48 LEDs blur together into one glow.
  2. The face spins through colour like a slot-machine reel (vertical stripes of colour scrolling, then slowing).
  3. The camera eases back so the patch of neighbours shows. They are all spinning their own reels.
  4. They land one after another. Together they re-form the yellow-and-black smile edge we
     zoomed into in line 2, and our puck is one dot of it.
  - Clarity: "one dot of the picture" is shown by the patch re-forming.
  - Surprise: medium-high, thanks to the reel and the near-miss stops.
  - Spectacle: hundreds of reels at once.
- Runners-up:
  - The plain colour cycle (#1): one object, too thin on its own.
  - The paint-chip wall (#3, in full) and the crayon box (#5): changes of world.
  - The chameleon (#4): it hides the mechanism.

### 6. "A computer tells every puck what color to show, many times a second."
- **Pick: literal (#1), made spectacular.**
  1. A wire runs from the back of our puck (we saw the backside in line 4).
  2. The camera whips along it (motion streaks) as it joins thicker and thicker bundles, ending at
     our own friendly computer box.
  3. The computer fires coloured pulses back out along a branching tree of thousands of wires.
  4. The camera **rides one pulse home**.
  5. Pulses land on pucks and flip their colours in waves. They come faster and faster until the
     patch strobes ("many times a second").
  6. The colours they deliver are white, pale blue and black. They are quietly painting the eye.
  - Clarity: high. The pulses are the commands, and arrival means a colour change, which you can
    see with the sound off.
  - Surprise: the ride-the-pulse move, and the swap paid off in line 7.
  - Spectacle: thousands of moving lights along branching paths.
  - Cost: low. SVG paths with dash-offset pulses.
- Runners-up:
  - Card stunt (#2): it is the clearest "one tells many" analogy, but it needs a crowd rig and a
    change of world.
  - Conductor and choir (#3): charming, but it swaps the literal computer for a metaphor that is
    no clearer.
  - Flipbook (#5): reads as "animation", not "commands".
  - This line is the main "presentation" risk. The pick keeps the camera and thousands of pulses moving the whole time.

### 7. "Up close, you see dots and dark gaps. From far away, your eyes blend them into one picture."
- **Pick: literal (#1). One long continuous pull-back, and it reveals that the picture is now an
  eye, not the emoji.**
  1. We start nose-to-pucks on the strobing patch.
  2. We pull back through every scale. The dots shrink, the gaps close, and the dot-to-smooth
     crossfade happens on screen.
  3. At the far end the Sphere, with its antenna, shows a giant eye where the emoji used to be.
  4. A foreground silhouette of a tourist holding up a phone enters at the bottom in the last
     second. That anchors "your eyes" and "far away".
  - Clarity: maximal. The line is a description of this shot.
  - Surprise: the swap. You went in on a smiley and come out on an eye.
  - Spectacle: the biggest scale change in the film.
- Runners-up:
  - Squint split-screen (#4): very clear, and a nice "try it on your phone" moment, but it breaks
    the camera thread and is a static gag.
  - Seurat painting (#2): a change of world for a point the real Sphere already makes.
  - Shy magnet dots (#5): untrue (the dots don't move), so it teaches the wrong mechanism.

### 8. "That's how a giant eyeball can blink on the whole building."
- **Pick: personified (#3) with a stadium-wave lid (#2).**
  1. The eye wakes up and looks left, then right, following a little car along the Strip.
  2. It blinks. The camera holds at a mid distance where the rows of pucks can just be seen, so
     the lid comes down as a visible row-by-row wave of pucks switching to lid colour.
  3. It winks at the camera.
  - Clarity: it shows that the blink is just pucks changing, with no need to zoom back in.
  - Surprise: high. The building looking at you is the screenshot.
  - Cost: low. The eye is one parametric drawing (gaze x/y, lid amount) fed into PuckField.
- Runners-up:
  - The literal zoom into the lid (#1): it repeats line 2's zoom and makes the camera yo-yo.
  - The tissue and tear (#4): funny, but it costs a hand rig and pulls focus.
  - The flipbook (#5): a change of world.

### 9. "Inside, there's a second screen. It's much sharper, and it wraps over your head."
- **Pick: fly through the pupil (#1, from the line-8 hand-off), with the "sharper" proof built into the move (#5).**
  1. The pupil dilates and becomes a doorway. The camera flies in.
  2. Going through the shell, we pass *through* the coarse puck layer, which looks like a screen door
     of big dots and gaps.
  3. Inside, the dome picture is crisp. A quick push towards the dome finds dots only at about 4×
     the zoom, and they are tiny and tightly packed.
  4. The camera tilts up from rows of small audience heads to the dome curving overhead. That
     tilt-up is what shows "wraps over your head".
  5. The dome shows our own picture: a desert sunrise with a hot-air balloon drifting across.
  - Clarity: high. You see the coarse layer and the fine layer in one move, and you look up.
  - Surprise: high. Flying through an eye into a building.
  - Spectacle: the dome is the biggest single picture in the film.
  - Cost: medium. A faked-perspective arc of seats plus an ellipse-clipped dome image. No WebGL.
- Runners-up:
  - VR headset (#4): it is a big surprise, but with the sound off it reads as "VR" and not as "a
    screen inside a building".
  - The egg (#3): clear about outside versus inside, but it is a change of world and cracking it
    breaks the building.
  - The planetarium or umbrella (#2): the literal dome already is the planetarium.

### 10. "So the Sphere is a million little lights, and your eyes do the rest."
- **Pick: literal rise-out (#1) plus the antenna callback (a cheaper, in-world version of #2's remote).**
  1. The camera rises through the top of the dome and back through the puck layer.
  2. It pulls back to the Sphere on the Strip. The eye looks up at the rabbit-ear antenna, blinks,
     and the antenna pops off with a wobble (the myth is busted).
  3. The camera keeps rising until the whole city is a field of little lights. That wide frame
     matches the line-1 composition, so the Reel loops cleanly into the CRT for rewatches.
  - Clarity: high. Surprise: the antenna gag. Spectacle: a whole city of lights.
  - Cost: low. The skyline is reused, and the city's lights are one more PuckField-style dot layer.
- Runners-up:
  - Bowing pair of eyeballs (#3): cute, but it adds characters at the very end.
  - Zooming into a skyline light to find a puck (#4): good for a loop, but it sends the camera
    back in just as the film should be resolving outwards.
  - Fridge drawing (#5): a change of world.

## The set check

- **One world.** Every pick takes place on, in or behind our drawn Sphere. The world changes only
  three times, and each time the line requires it (frame, computer, interior). Each is entered
  through an object already on screen: the gap, the wire, the pupil.
- **No presentation moments.** Every line has a state change you can watch:
  1. inflate
  2. break-up and bird
  3. slapshot and wave
  4. tape snap and 48 LEDs popping on
  5. reels landing
  6. pulses repainting
  7. blend and swap
  8. gaze and blink wave
  9. fly-through and tilt-up
  10. antenna pop and city
  
  The only on-screen text is the 8 in on the tape and the rolling 1,200,000. Both are attached to
  moving objects.
- **Rhythm of scale.** Wide → closest (lines 2–5, ending inside one puck) → mid (line 6) → widest
  so far (line 7) → mid (line 8) → inside (line 9) → widest (line 10). In and out once, then a
  second in-and-out that is earned by the pupil.
- **Fun quotient.** The slapshot, the bird, the slot reels, the eye following a car, the wink and
  the antenna pop. That is one physical gag roughly every 5 seconds.

## Beat sheet

Timings are approximate for about 55 s. Adjust them to the voiceover alignment.

| # | Time | Picture: what moves / changes state | Camera | Hand-off / carrier to next line |
|---|---|---|---|---|
| 1 | 0.0–4.5 | Dusk Strip skyline (our drawing). A boxy CRT with rabbit ears shows our yellow emoji. It inflates: corners round, the box swells into a ball as tall as the casinos, and the emoji grins wider. The antenna stays on top and wobbles. | Static wide at first, then a slow push-in starts as the inflation finishes. | The push heads for the emoji's smile line. The **smile-line dot** is the point of focus. |
| 2 | 4.5–10.0 | The smooth emoji breaks into thousands of glowing dots with dark gaps (PuckField crossfade, live). A sparrow silhouette darts through one gap and away. | A continuous push-in that decelerates. | The push slows onto one slot in the smile line. That dot blinks out and leaves an **empty dark slot**. |
| 3 | 10.0–16.5 | A hockey stick swings in and slapshots a puck into the empty slot. *Thunk*: it lights up. A slight tilt shows the pucks' thickness (hockey-puck shape). A wave of pucks then lights slot by slot across the whole field while a counter rolls to 1,200,000. | Hold on the slot, then tilt by about 15°, then rise and pan along the surface, riding ahead of the wave. | The camera drifts back down beside the **gap the bird used**. |
| 4 | 16.5–23.0 | We slip through the gap. Behind it, a steel lattice (parallax layer) holds the pucks on bars. A tape measure whips out between two pucks, reads 8 in, and snaps back with a wobble. Around the front again, one puck face is a honeycomb of 48 tiny LEDs that pop on in a counting sweep. | Dolly through the gap, slide sideways behind the frame, swing round to the front, then dive into one puck face until it fills the frame. | The 48 LEDs **blur into one glow** that fills the frame. |
| 5 | 23.0–28.5 | The glow spins through colour like a slot-machine reel and decelerates. Neighbouring pucks appear, all spinning their own reels. They land one after another and re-form the yellow-and-black smile edge, with our puck as one dot of it. | Slow ease back from full-frame puck to a patch of about 12×12 pucks. | Our puck's **back-wire** lights up behind the frame (we know the backstage from line 4). |
| 6 | 28.5–35.0 | Follow the wire as it merges into thicker bundles and arrives at our friendly computer box. The computer fires coloured pulses out along a branching tree of thousands of wires. Pulses hit pucks and flip their colours in waves, faster and faster until the patch strobes. The colours delivered are white, pale blue and black (quietly painting the eye). | Whip-pan along the wire (motion streaks), hold briefly on the computer, then **ride one pulse** back home to the patch. | We arrive nose-to-pucks on the **strobing patch**, now in eye colours. |
| 7 | 35.0–42.0 | Pull back through every scale: the dots shrink, the gaps close, and the picture blends smooth on screen. The far end reveals a **giant eye** on the Sphere where the emoji was (the swap). The antenna is still on top. A tourist silhouette with a raised phone rises into the bottom of the frame. | One long continuous pull-back that eases out. It is the slowest and most satisfying move in the film. | The eye is the focus. Its **pupil** sits at the centre of the frame. |
| 8 | 42.0–46.0 | The eye wakes up, looks left, then right, following a little car along the Strip. It blinks: the lid comes down as a visible row-by-row wave of pucks. Then it winks at the camera. | Small push-in to the mid distance where the rows of pucks can just be read. Hold. | The eye opens wide and the **pupil dilates** into a doorway. |
| 9 | 46.0–51.5 | Fly through the pupil. Pass through the coarse puck layer (a screen door of big dots and gaps). Inside, the dome's desert-sunrise picture with a drifting hot-air balloon is crisp. A quick push towards it finds tiny, tight dots only at extreme zoom. Rows of small audience heads face up. | Fly-through, then a short push towards the dome and back, then a tilt up from the seats to the dome curving overhead. | Continue the tilt up to the **top of the dome**. |
| 10 | 51.5–55.0 | Rise through the roof and the puck layer. The Sphere sits on the Strip showing the eye. The eye glances up at the rabbit-ear antenna, blinks, and the antenna pops off with a wobble. Keep rising: the whole city becomes a field of little lights. | Continuous rise and pull-back that ends on a wide frame matching line 1's composition. | Loop: the final wide frame matches the opening, so a rewatch flows straight into the CRT. |

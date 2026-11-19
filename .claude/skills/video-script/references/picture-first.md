# Picture first: plan, scout, then write what the viewer sees and hears

For a video made in code (animated-video owns the timeline), every image is ours to control, so
the script settles the picture as precisely as the words. The order is reversed from writing words
and then looking for assets: **plan → scout assets → write the script around what was found → fix
the claims → render reference frames from the real scene**. Proven on `projects/turbulence-seat-01`
(Matthew, 2026-11-17): scouting changed the film's two best ideas (a see-through 757 found on
Sketchfab became the cutaway; a seat model with a seatbelt became the ending), and the first stills
corrected nine written values.

## 1. Plan (before any search)

A short plan the user can react to:
- **Angle:** the one idea in a sentence, its goal, and the stake.
- **Hook picture:** what the first 3 seconds show, already moving.
- **Key moments:** the 3–6 pictures the video will be remembered for, each as an event (something
  happens to something), not a diagram.
- **Thread:** the one device carried through the film (here: three cups), and each hand-off's carrier.
- **Build or source, per moment:** build in code what is abstract, diagrammatic, typographic, an
  exact interface, or must bend and change on cue (it is the film's lead or thread); source what
  is natural, organic or a recognisable real thing (animals, vehicles, landmarks, old tech, props).

## 2. Scout (only what code can't make well)

Follow animated-video's [sourcing](../../animated-video/references/sourcing.md) (`find_asset.py`,
`render_glb.mjs`, the licence table). On top of it:
- **Scout the hook first.** If the hook picture can't look great, change the angle before scouting
  anything else.
- **Judge by rendered sheets, never by names.** Download up to three per need and render them in
  one light; a hero asset also gets a view from the angle the film needs (inside a cabin, side-on).
- **Time-box each need (~10 min) and allow a partial find.** "Find a piece, build the rest" is a
  normal outcome: full cabins failed (1.4M triangles, no usable camera inside), one good seat
  instanced into rows was better.
- **Record what was found** (source, author, licence, triangles, static or controllable) in the
  project's `brief.md` while the provenance is known.

## 3. Re-plan from the finds

Moments with a great asset get stronger, moments with nothing usable get reworked, and an
unexpected find can become a moment. Say in one line what the scout changed.

## 4. The script: a look sheet and shot notes

Write it to `script.md`. Two layers:

**Look sheet (once per film).** Style (name the animated-video style pack and the look pass instead
of restating them); world and scale (1 unit = 1 m, real dimensions); light as a table (time of day,
sun direction relative to the camera, colours, exposure per place); colour meanings (one colour per
role, kept all film: here amber = calm/the answer, coral = rough); materials; lens and camera rules;
safe areas; the visual-language states (each item's states and one look per state); the thread table
(lead → move → next lead → carrier).

**Per beat:** time, the spoken line, then
- **Start frame:** what fills the frame, where (pixel positions in the 1080×1920 frame), lens, camera
  position and distance.
- **Action:** what happens, to what, when (seconds or the cue word), how big.
- **Camera:** the move across the beat.
- **Lead:** what the eye is on, word by word if it changes.
- **End frame:** the state the next beat starts from.

Write numbers, not moods: "low sun 10° above the horizon from frame-left, #FFD7A0" builds; "moody
golden light" doesn't. Mark the numbers as **starting values**: the stills tune them, and an
approved still becomes the reference over the text.

### Frame maths before writing distances

Most wrong numbers on the first board were sizes nobody checked. With a vertical field of view F,
a camera at distance d frames a height 2·d·tan(F/2); in 9:16 the width is 0.5625 of that. Check
before writing a shot:
- **The subject fits:** a 47 m airliner across a 9:16 frame needs ~98 m at 35 mm (the script said
  46 m at 50 mm, which shows half the plane).
- **The lead fits the usable band:** captions take y 250–470 and the platform's interface the bottom, so the lead
  lives in y 520–1500, about half the frame's height. A layout of several parts (print, subject, answer row) must fit
  that band: stack it vertically (s2-coin-rotation's side-by-side board layout didn't fit).
- **Props fit the set:** check each prop against the opening it passes through and the space it stands in (a 4.6 m
  car needs 2.6 m doors and 6 m deep units; s2-monty-hall's first set had 0.9 m doors).
- **Small things stay visible:** at that distance a real cup is ~2 px. A thing the beat depends on
  must be at least ~30 px, so scale it up as a device (giant cups on the roof) or move the camera.
- **Motion reads:** a 1–2 m movement next to a 6 m object reads as nothing. Make the moving thing
  smaller or the motion bigger, and carry it with a mark that leaves a trail.
- **The camera can see what the line names:** a coral flash "far back in the cabin" can't be seen
  from a camera facing forward.
- **A plane reads by its angle:** a sheet of light seen edge-on is a line; at 3/4 it washes the whole frame. Show a
  dividing plane edge-on (plus a line where it meets the surface) and turn the camera before it sweeps.
- **A point above a surface, seen at a low angle, lands in the wrong place:** hands on a chest filmed along the body
  from the feet read as "near the collarbone". Check a contact point from near overhead.

### Checklist (on top of the script checklist in SKILL.md)
- Every line's picture is an event a muted viewer could follow.
- Every colour, shape or position that carries meaning is shown once before it is relied on.
- Each beat's end frame is the next beat's start frame (one continuous shot unless a cut is chosen).
- A camera move that passes through a solid (a hull, a wall, a window into a lit interior) is written as a
  cut, not a fly-through: the near plane clips the surface and the exposure jumps between inside and out.
  The turbulence film's four crossings glitched through two renders of glare patches and shipped as cuts on
  the words (Matthew, 2026-11-18: one continuous shot is not required).
- Every new device (a ghost copy, dots that stand for air, pistons, a graph) is named on screen in one or two words
  the first time it appears, then carried without a label. Both s3 films' mute tests (2026-11-19) lost exactly the
  devices that were never named: the ghost tower, the pistons, the dots of air, the shaft pulse.
- A comparison of two motions in time (in step, a quarter swing behind) is drawn flat on one shared time axis. One
  instance: s3-taipei-damper's two pens drawing waves in 3D perspective read as exhaust trails to the board judge.
- Every sourced asset in the shot notes is named, with its licence.

## 5. Fix the claims before the frames

A fresh agent fact-checks every claim as worded, spoken and on screen, against primary sources
(animated-video [review: fact-check](../../animated-video/references/review.md#fact-check)). Here it
reworded two lines ("barely moves" → "moves least"; "most people hurt" → "most passengers
seriously hurt") and found an on-screen number (NASA 757 tests: +40 % load at the aft galley).
A myth-buster hook ("Most people think ...") is itself a claim: no survey supported "most" for either s1 topic
(heart on the left; knuckle cracking and arthritis), and both were reworded to "Lots of people think ...". Find the
poll before writing "most", or word the hook so it claims nothing ("You might think ...").
Analogies are checked earlier, before the pictures are brainstormed ([direct](../../animated-video/references/direct.md#find-the-pictures)).

## 6. Reference frames from the real scene

The frames are stills rendered from the film's actual three.js/Remotion scene (animated-video step
4, key-frame board), not generated or drawn 2D images, so they grow into the finished shots. Build
the scene from the look sheet and shot notes, render one still per beat at its key moment
(`snap.sh`, then `board.py` with each beat's line), and judge them. Then add a **"What the board
changed"** table to `script.md`: beat, what the script said, what the still showed, the value now
used. The next film's first draft starts from those lessons.

Stop at the board for the user's approval before animating.

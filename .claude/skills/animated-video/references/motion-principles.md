# Motion principles

How a film moves, whatever it shows. Proven in the motion lab on app videos (9:16) and carried
into the Grand Canyon explainer; the evidence, verdicts and studies are in `lab/PRINCIPLES.md`,
`lab/TASTE.md` (the user's words) and `lab/round-0*/`. Principles are a vocabulary for inventing
shots, never shots to copy.

## One shot, one thread

- At every moment exactly one thing is **the lead**: it carries the accent and is the brightest,
  sharpest, most-moving thing in frame. Everything else supports it or waits.
- The next frame grows from this one. A new scene is born from the lead by a named move:
  **transform** (it becomes something else), **travel** (it moves, the camera rides with it),
  **open** (it opens onto the next world), **pass through** (the camera flies into it and out the
  other side), **pull back** (it turns out to be part of something bigger), **split / merge**.
- Every hand-off names its **carrier**: the thing that takes focus from the old lead to the new
  one at a touch point. A transition with no carrier is a cut; cut it or find one.
- The new lead starts in the direction and at the speed the old one was going.
- Swapping a 3D scene for a flat overlay mid-move is a hidden cut: it reads as one.
- Pace comes from changes of scale, speed and state landing on the words, not from cuts.
- The camera keeps the lead inside the safe area; a zoom never crops the thing being shown.
- Before building, write the **thread**: one row per hand-off, lead → move → next lead → carrier
  (example: `lab/round-02/THREAD.md`).

## A movie, not a presentation (Matthew, 2026-11-06)

"There are a few frames in the middle where the moon is shown next to the earth, and there are arrows showing the
tide. This is pretty boring because nothing changes in the frame except the arrows showing and disappearing. Feels
more like a presentation rather than a movie." (Moon tides 01, 16-29 s; motion_check flagged exactly those seconds.)

- **Show the mechanism acting, never a diagram with labels.** An explanation beat is an event in the world: the cause
  visibly moves the thing it acts on. Tides: water streams across the ocean toward the bulges while the pull grows,
  the ocean swells as you watch, the moon travels its orbit, Earth keeps turning. Arrows and labels are accents on a
  moving picture, never the event themselves.
- **The camera never parks.** Through every explanation it orbits, dollies or cranes slowly, so there is always
  parallax (near things against far ones). A drift alone is not enough if nothing in the world changes.
- **Several things move at once, at different scales:** the subject, the medium around it (water, air, particles), the
  background (stars, clouds), the camera. One mover at a time reads as slides.
- **Many separate movers, not one big one.** motion_check counts separately moving things: a whole field moving as one
  (a wall of LED dots panning, a camera push on one object) reads as one mover even when every pixel changes (Vegas Sphere
  01 failed at 10-12 vs the bar's 18). Give the close-ups independent life: neighbours twinkling, particles, props, a
  character reacting.
- **No more than ~3 s where only overlays change.** If a line needs longer, the world must keep doing something
  that the line is about.
- **Each step changes the state of the world** (the ocean is a different shape after "two bumps" than before), so the
  picture at the end of a line is not the picture at its start with arrows added.
- **Check it, don't trust it:** before the full render, render a quarter-scale preview and run
  `templates/remotion-film/motion_check.py film PREVIEW.mp4 --bar BAR.mp4` (bar: an accepted film of the same kind; the committed one is
  `lab/motion-bar/grand-canyon-01_q.mp4`, Grand Canyon 01 at quarter scale: never re-render it per film, it took 75-90 min on
  a 4-core container).
  Every flagged second gets redesigned with the rules above, not patched with camera drift; re-run until it passes.

## One visual language per film

- Before building, declare the states things can be in (idle, being read, found, travelling,
  placed, pressed...) and exactly one look for each, as a short table (example:
  `lab/round-03/LANGUAGE.md`).
- Every item of one kind passes through the same states in the same order with the same look. A
  look never changes meaning during the film; the accent means "follow this / found / chosen".
- Show a new look clearly once before relying on it. A second idea that needs its own look ("not
  found") is cut from a short reel unless it is the point.
- Check: list every state change in the film and confirm each item of a kind goes through the
  same ones. One word highlighted without the accent read as "very obvious because it was
  inconsistent".

## Emphasis without boxes

- Emphasise by lifting, glow, weight or colour; never draw a box around a word.
- A scan must look like reading: it leaves highlighted words behind as it passes.
- Caption key words take the film's "found" look, so captions and picture speak one language.

## Material: real glass, fluid motion

- Interface layers are physical glass: thickness, a bright edge where light catches, frosted blur
  of what is behind, soft contact shadows. Panes that carry UI get a dark tint so text stays legible.
- 3D components have depth, light and shadow; not flat cards in space.
- Motion is fluid: no mechanical stops. Anything that leaves its place returns smoothly and lands.

## Panes never intersect

Glass cutting into what's behind it reads as broken. Keep each pane's gap to its neighbours larger
than its thickness plus half its width × sin(tilt); folded panes rest a few px apart, never on one
plane; moving pieces pass in front of panes, never through them.

## The background is the film's world

Never an empty black slide (it reads as a presentation, and glass on black shows nothing).
- Same story, bigger scale: the foreground is the detail, the background the context (travel: the
  globe and the journey; finance: money flowing; fitness: terrain; messaging: a network). Finding
  this world is part of intake.
- It never competes: darker, blurred, lower contrast; the accent appears there only as a dim echo
  of what the lead does.
- About a fifth of the foreground's speed; drifts with the camera for depth.
- Continuous: it never cuts, and changes on the thread's beats.

## Sound follows the visual language

- Each state in the language table gets one sound, used every time it happens (found = a soft pop
  rising in pitch item by item; placed = a soft drop rising the same way); a camera move gets a
  whoosh sized to the move, or silence.
- Times come from the code's own numbers (beats or exported events), never from the picture. A
  one-shot film has no cuts, so frame-analysis "sync" warnings there are false alarms.
- Every sound has a visible cause; restraint (about 7 weighted events per 10 s in the lab's app
  reel); vary repeats by pitch or file.
- With no music, a quiet ambience bed from the background's world.
- Until a voiceover exists, deliver two versions: effects only, and effects over a ducked music bed.

## The user's ear picks; Claude places

Claude can't hear. Sound, music and voices are chosen by the user from a shortlist of level-matched
options, and placed by Claude from measurements. Sound: [studio sound](../../real-sfx/references/studio-sound.md).
Voices: [AI voiceover](ai-voiceover.md). Every round lists the moments the user should listen to.

## Where to look

- Reference films studied frame by frame: `lab/references.md`.
- Technique verdicts (exploded interface, component macro, under the hood, map becomes a floor,
  push-through, icon performs its verb): the table in `lab/PRINCIPLES.md`.
- A number becomes a rule after it holds in two films; record verdicts in `lab/TASTE.md` verbatim.

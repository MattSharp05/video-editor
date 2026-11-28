# Bulls don't see red: pictures (2026-11-28)

## Pass 1: brainstorm

Kinds: **L**iteral, **A**nalogy, **W**acky, **S**cale, **P**ersonified, **K**id.

1. **Hook.** L: split line across one red cape. W: the bull's gaze is a visible searchlight cone, and every red thing it touches drains to olive. S: an arena hung with forty red capes and flags; the gaze sweeps and drains them in a wave. K: the cartoon angry bull with steam, which deflates. A: sunglasses dropping onto the bull.
2. **Three cells vs two.** L: glowing capsules in two rows. A: three paint tubes vs two; three RGB spotlights mixing on a wall vs two. S: dive through the pupil into a retina of thousands of cones; red light washes over, and on the bull half the red sockets stay dark. P: cones as lamp-holders, one missing from the bull's team.
3. **Red = green.** L: a red cape and a green cape merge. A: a traffic light where stop and go look the same. W: the arena floor is a colour-blindness test plate of thousands of dots with a red cape shape on green; the gaze passes and the shape vanishes. K: red strawberries hidden in leaves. Shell game: red and green cups shuffle and can't be tracked.
4. **Red looks dull.** L: the camera arcs across the split. A: a dimmer turned down. W: the dye bleeds out of the fabric. Edge: the cape flaps in and out of the gaze cone, red outside and brown inside.
5. **Why charge?** L: the cape flicks and the bull lowers its head. Gaze snap: the wide searchlight narrows into a lock-on.
6. **Blue/white the same.** L: three capes, three charges. S: a three-lane race, one bull per colour, photo-finish tie. W: one cape cycles colours mid-charge and the bull doesn't break stride. A: a speedometer reading the same three times.
7. **Chases motion.** L: three still red capes and one moving blue cape. S: a forest of eighty still red capes on poles; the bull weaves through them to the one moving. W: in bull vision the still capes fade into the sand and only the mover keeps an outline.
8. **Not colour, motion.** L: impact, sand burst. W: time freezes on the hit and the sand hangs in the air.
9. **Recap.** L: pull back to the split. Bookend: crane up over the hook's arena, the gaze sweeping the forty red flags while the bull chases the swing.

## Pass 2: pick

**Linking device: the bull's gaze cone.** Instead of an abstract split line, the bull's sight is a soft volumetric cone. Inside it the dichromat filter applies, and outside it the world stays human. It reads with the sound off: where the bull looks, red dies. It also connects the beats' own pictures, because the gaze drains the hook's flags, the dive enters through that same eye, it erases the floor plate and it locks onto the cape. Cost: render the cone into a screen mask and run the dichromat post-pass through that mask. One shader, reused all film. This also covers the planner's split view, just in a moving form.

- **Hook: S + W.** A wave across forty fluttering capes is more spectacle than one cape on a stand, and the searchlight makes the mechanism obvious. Runner-up: the literal split, which is clear but static. Cost: instanced cloth (vertex-shader flutter), fine.
- **Cells: S (retina field).** It beats the two rows of capsules on every axis: red light arrives and has nothing to catch it, and thousands of instanced capsules lighting together give scale and light. Runners-up: RGB spotlights (a clear analogy, but a change of world) and the literal rows (thin). Cost: about 20k instanced capsules plus emissive bloom, cheap.
- **Red = green: W (test plate).** It is screenshot-worthy, viewers already know the test, and the "cape" figure vanishing under the gaze shows the confusion directly. It stays in the arena (it's the floor). Runner-up: an alternating red/green cape fence that becomes one band. Cost: 30k instanced discs, colours from a mask texture.
- **Dull: Edge.** The cape flapping across the cone's edge shows both states at once on one object, which is clearer than the camera arc. Bleeding dye was rejected because it implies the colour physically leaves.
- **Why charge: gaze snap.** The searchlight collapses onto the flick, so the "trigger" is visible.
- **Same charge: S (race).** A tie at the photo-finish line reads "just as hard" with no words. It's one bull model instanced three times on one walk/run clip. Runner-up: the colour-cycling cape (wacky but ambiguous about comparison).
- **Motion: S + W.** The forest gives many parts and a route, and fading the still capes inside the gaze shows why the bull ignores them. The moving cape is blue, as in the script.
- **Impact: L + freeze.** A frozen sand burst holds the eye and gives the on-screen text room. The literal picture is enough here because it's the payoff. No contact with any person.
- **Recap: bookend.** We return to the hook's world, so the film closes its loop.

The set feels like one film: one sandy arena, one bull, one gaze. The only change of world is the retina dive, and it earns its place by entering and exiting through the bull's pupil.

## Timed beat list

| Time | Picture | What moves | Hand-off |
|---|---|---|---|
| 0-3 | Arena ringed with ~40 red capes/flags; bull centre | Capes flutter; the bull's gaze cone sweeps left to right, draining each red to olive in a wave | Gaze ends on the camera; push into the bull's eye |
| 3-8 | Retina field of thousands of cones, split human/bull | Red light washes across; human half ignites blue/green/red, the bull half's red sockets stay black | Pull back out through the pupil, camera tilts down to the floor |
| 8-11.5 | Arena floor as a dot test plate: red cape figure on green | Crane up reveals the figure; the gaze passes and the figure dissolves into the dots | The gaze lifts to the hero cape on its stand |
| 11.5-15 | Hero cape on the cone's edge | Wind flaps the cape in and out of the cone: vivid red outside, dull brown inside | The cape flicks hard |
| 15-17.5 | Bull and cape, low angle | The cape snaps; the gaze cone collapses onto it; the bull lowers its head and launches | Whip-pan into the lanes |
| 17.5-22 | Three lanes, red/blue/white capes at the ends | Three bulls charge side by side; photo-finish line, all hit on the same frame | Flash-cut on the tie to the cape forest |
| 22-27 | Forest of ~80 still red capes, one blue sliding on a rail | Inside the gaze, still capes fade toward sand colour; the bull weaves through to the mover | Bull reaches the blue cape |
| 27-29.5 | Impact, slow motion | Sand burst freezes mid-air; text lands in the hang | Time resumes; crane up and back |
| 29.5-34 | The hook's arena from above | The gaze cone sweeps the 40 flags (red outside, dull inside) while the bull chases one swinging cape | End frame |

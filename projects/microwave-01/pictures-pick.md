# Microwave 01: picture pick

Source: `pictures-brainstorm.md` (written against an earlier draft) judged against the locked
`lines.txt`. Where they differ, lines.txt wins. The main differences: line 2 is now "the outer layer" (not
"the outside first"), and line 9 is now "in thick food, the middle has to wait" (not "the outside gets hot
first"). The picks below follow the new wording.

Format: 9:16 Reel, about 54 s, all built in Remotion (SVG + one canvas layer). No three.js: software WebGL
on 4 cores is too slow for the time available, and nothing here needs real 3D.

## The film in one sentence

One hero, **Spud** (a fat leftover baked potato with a face, sitting on a plate in an original, unbranded
microwave). One camera that never cuts. It goes into Spud, back to the magnetron, along a wave to the
door, rides the wave down into a drop of water on Spud's skin, comes back out to a cutaway of Spud, rises
to a top-down view of the spinning plate, and pulls out through the door at the "ding". A running gag
ties it together: a **tiny chef with a blowtorch** stands for the myth. He lives in Spud's middle, his
torch fails in line 2, he waits there, cold, in line 9, and he climbs out warm at the end.

## How the ideas were judged

Every candidate was scored on clarity with the sound off, surprise (would someone screenshot it?),
spectacle (how many separately moving things, how much scale and light) and build cost in Remotion for
one builder in about 90 minutes. The rules applied:

- **Label key objects.** Each object the voice names gets one printed word the first time it appears:
  MAGNETRON, WAVES, DOOR, WATER, + and −, HEAT, MIDDLE, HOT SPOT.
- **Several movers per beat.** Every beat has at least four independent movers. A field that moves as
  one counts as one.
- **The mechanism acts.** No arrow diagrams. The waves bounce and squash against things. The molecules
  rock and collide. The heat creeps in band by band.
- **Accuracy:**
  - Molecules twist back and forth and bump each other. They never spin all the way round, and the
    word "resonance" is never used.
  - The waves fade out a short way into the food.
  - The door holes are drawn smaller than one wave.
  - Hot spots explain the spinning plate.
  - The myth in line 1 is clearly marked as a myth, so muted viewers don't learn it as fact.

**Where the literal picture lost, and why:**

- **Line 1.** The glowing core spreading outward is clear, but it shows the myth as if it were true,
  and it isn't surprising. The chef is just as clear, more fun, and gives the myth a body we can
  overturn.
- **Line 3.** A bare finned cylinder is clear but static. It stays literal (a muted viewer needs to know
  what the real part looks like), but it is brought to life: the fan spins, the core glows, the antenna
  pings, the rings ripple out.
- **Lines 4, 5 and 9.** The literal pictures won on clarity. Each was boosted with one non-literal idea:
  the ant-scale door, the stopwatch against the counter, and the chef waiting in the middle.

**Rejected as wrong or misleading:**

- Compass needles "spinning wildly" and dancers being "spun" (line 7): they spin, the molecules don't.
- The stadium wave and the parachuting gnomes (line 2): they suggest heat particles travelling in from
  outside.
- The meatball planet (lines 2 and 9): a change of world that line 2 doesn't earn.
- Sunburn and sunlight in the sea: they need sound to land.

## Runners-up for the biggest beats

**Line 1 (the hook)**
- **Pick:** chef with a blowtorch inside a cutaway Spud, with a MYTH? stamp.
- **Runner-up:** the lava cake broken open on the turntable. It's an instantly readable "melts from the
  middle" picture, but it's food porn rather than a joke, and it doesn't come back later.
- **Third:** the crowd of thought bubbles that merge into one. A good "lots of people think" picture,
  but it needs many characters and a separate world.

**Line 4 (bounce and door)**
- **Pick:** the pinball web of several glowing wave fronts, ending in the ant-scale squash against the
  mesh.
- **Runner-up:** the beach ball against a tennis net, with a marble of light slipping through. Very
  clear, and it answers "how can I still see my food?", but it's a change of world in the middle of
  the oven that the line doesn't need.
- **Third:** the wave-balls with faces, one stuck in a hole up to its waist. Funny, but it blurs "a
  wave" into "a ball".

**Line 7 (wiggle and bump)**
- **Pick:** a crowd of about 150 Mickey-head molecules with tiny faces. Each one rocks back and forth as
  a + / − band of the wave sweeps through, slightly out of step with its neighbours, and BONK stars
  pop where they collide.
- **Runner-up:** the lurching subway car. It's the clearest analogy for "tugged one way, then the
  other", but it's a second change of world on top of the molecule world.
- **Third:** the magnet-sunflowers slapping their neighbours. It looks great but suggests whipping
  round (spinning).

**Line 10 (the plate spins)**
- **Pick:** a top-down hot-spot map. A still plate first: a chocolate bar melts in polka dots and
  Spud's left cheek bubbles while his right side grows icicles. Then the turntable spins and everything
  evens out.
- **Runner-up:** marshmallows turned over a campfire. Clear and warm, but it leaves the oven.
- **Third:** the plate as a DJ turntable with a "ding" per hot spot. Fun, but it needs the sound to
  land.

## Shared build kit (keeps it inside ~90 minutes)

- **Microwave set (SVG).**
  - Original cream-and-graphite box, rounded, with a dial and a door window.
  - Interior cavity and a glass turntable.
  - Side wall that can turn X-ray transparent.
  - Door mesh drawn as a hole grid.
- **Spud rig (SVG).**
  - Body, face (eyes, brows, mouth states), and a cutaway mask.
  - Concentric layer bands that each take a colour from a temperature (blue → orange → red).
  - A steam emitter: 6–10 wisps, each with its own noise seed.
- **Chef (SVG).** Hard hat, torch with a flame flicker, and a scarf state for when he's cold. Two or
  three poses.
- **Wave component.**
  - A ribbon sine with phase, amplitude and a glow.
  - Used as the ring ripple (line 3), the bouncing front with a fading trail (line 4), the fast
    blurred ribbon (line 5) and the + / − field band (line 7).
- **Molecule field (one canvas).**
  - About 150 water sprites: a big O with two H "ears", "−" printed on the O and "+" on the H's, and
    an optional face.
  - Each molecule's angle = field drive × its own lag + noise, clamped to about ±60° so they rock and
    never spin.
  - Simple neighbour collision spawns BONK sprites. Colour follows a heat value.
- **Words.** IBM-Plex-like sans, sentence case for captions, but key-object labels printed ON the
  objects as single words (as in the earlier films). The label set is in the beat sheet.

## Beat sheet

Timings are estimates from the word count (140 words over about 54 s). Line 8 is short, so it runs on
the same molecule state as line 7.

### 1. "Lots of people think a microwave cooks food from the inside out." (0:00–0:04.2)

- **Event:**
  - We start already moving: the camera pushes through the microwave's door window toward Spud on the
    turning plate. Spud looks smug, and steam curls up.
  - Spud splits into a clean cutaway. In his middle stands a tiny chef in a hard hat, firing a
    blowtorch outward.
  - Warm rings pulse from the centre toward the skin.
  - A rubber stamp slams on: **MYTH?** The ? wobbles.
- **Movers:** the plate turning, steam wisps, the chef's arm and torch flame, the pulsing rings, Spud's
  eyes darting down at his own belly, and the stamp.
- **Words:** MYTH? and INSIDE OUT (on the rings).
- **Camera:** a continuous push-in from the door window to Spud's middle.
- **Hand-off:** the chef's flame, at the centre of frame.

### 2. "But actually, it heats the outer layer. Then the heat creeps inward." (0:04.2–0:08.8)

- **Event:**
  - On "But actually", the torch sputters into a puff of smoke. The stamp flips to **NOPE**.
  - The cutaway changes to a thermal palette. The skin band flushes red first (label: **OUTER LAYER**).
  - The red then creeps inward band by band, each band warming on its own delay.
  - The middle stays blue. The chef pulls on a scarf and shivers.
  - Spud's forehead sweats while his chin is still blue.
- **Movers:** the smoke puff, the warming bands, the shivering chef, the sweat drops, the steam.
- **Words:** NOPE (replaces MYTH?), OUTER LAYER, HEAT on the creeping front. HEAT gets its full
  introduction in line 8, so here it is small.
- **Camera:** a slow pull back to frame the whole cutaway.
- **Hand-off:** a faint, ghostly ripple washes across Spud from the right. The camera turns to look
  where it came from.

### 3. "Inside the oven, a part called a magnetron makes invisible waves." (0:08.8–0:13.0)

- **Event:**
  - The camera follows the ripple upstream to the oven's side wall. The wall turns X-ray translucent.
  - Behind it sits the **MAGNETRON**: a finned copper cylinder. It hums (a fast small shake), its
    core glows orange, the cooling fan beside it spins, and its antenna pings.
  - Each ping sends out a ring that is see-through at first: drawn as a heat-haze shimmer with a dashed
    edge, under the label **INVISIBLE**.
  - Then the rings "turn on" into glowing cobalt lines, labelled **WAVES**, as they flow down a short
    channel into the box.
- **Movers:** the fan, the shake, the glow, the antenna, the rings (each its own mover), the haze.
- **Words:** MAGNETRON, INVISIBLE, then WAVES.
- **Camera:** a pan right along the ripple, then a gentle push in on the magnetron.
- **Hand-off:** one bright wave front leaves the channel. The camera locks onto it.

### 4. "The waves bounce around the metal box. The door's tiny holes keep them in." (0:13.0–0:18.8)

- **Event:**
  - **Bounce:** five or six wave fronts ricochet off the walls, ceiling and floor like pinballs. Each
    leaves a fading glowing trail, and together the trails knit a tangled web. Each wall flashes where
    it is hit (label on the first wall: **METAL**).
  - **Door:** the lead wave heads for the **DOOR**. The camera rides it, and the scale shrinks as it
    goes until the mesh holes are manholes and a tiny ant on the mesh looks up.
  - **The squash:** the wave arrives as wide as a bus, with a bracket showing its width against one
    hole. It squashes against the holes like a whale against a fence and bounces back. The ant gives a
    thumbs-up.
- **Accuracy:** the hole is clearly far smaller than one wave.
- **Movers:** each wave and trail, the wall flashes, the mesh rippling, the ant.
- **Words:** METAL, DOOR, TINY HOLES.
- **Camera:** an orbiting follow on one wave, then a long continuous scale-down to the mesh.
- **Hand-off:** the camera holds on the bounced-back wave right at the mesh.

### 5. "Each wave swings back and forth billions of times every second." (0:18.8–0:22.3)

- **Event:**
  - The wave freezes into a single clean sine. Then it is let go and swings up and down faster and
    faster until it blurs into a glowing ribbon.
  - A stopwatch slides in (label **1 SECOND**). Its hand creeps a single tick.
  - Meanwhile a counter races, each digit rolling on its own wheel: 1 … 1,000 … 1,000,000 …
    2,450,000,000.
  - Sparks flick off the ribbon's crests.
- **Movers:** the ribbon, the stopwatch hand, ten independent digit wheels, the sparks.
- **Words:** 1 SECOND and BILLIONS (on the counter).
- **Camera:** a quick push in to the sine, then a tilt to fit in the stopwatch.
- **Hand-off:** the blurred ribbon shoots back into the oven and dives down onto Spud's skin. The camera
  rides it, landing on a single bead of moisture on his outer layer.

### 6. "Your food has water in it, made of tiny molecules. Each one has a plus side and a minus side." (0:22.3–0:29.2)

- **Event:**
  - The bead is labelled **WATER**. The camera dives into it (this is the earned change of world). The
    bead swells and breaks into a crowd of about 150 water molecules, each shaped like a Mickey head: a
    big oxygen head with two small hydrogen ears.
  - At rest, each one jiggles a little on its own and has a tiny face (some sleepy, some chatty).
  - On "plus side and a minus side", the ears light up with a printed **+** and the heads with a
    printed **−**. The labels ripple across the crowd, molecule by molecule.
  - A big hero molecule in the front shows **MOLECULE**. It is the same character every time.
- **Movers:** each molecule separately, the label ripple, faces blinking, and the bubble film of the
  bead peeling away.
- **Words:** WATER, MOLECULE, + and −.
- **Camera:** a continuous dive through the bead's surface, then settling on the hero molecule.
- **Hand-off:** from the frame's edge, the swinging wave ribbon from line 5 slides in toward the crowd.

### 7. "The swinging wave tugs them one way, then the other. So they wiggle and bump into their neighbors." (0:29.2–0:35.8)

- **Event:**
  - The wave sweeps through as a band with a **+** half and a **−** half. The halves swap sides with
    every swing.
  - Each molecule's + ears are tugged toward the − half, and they rock back the other way as it swaps.
    Each molecule rocks within about ±60° (never all the way round). Each is slightly out of step with
    its neighbours, so they clack together.
  - **BONK** stars pop at the collisions.
  - The hero molecule's face goes from surprised to giggling.
- **Movers:** about 150 independent rockers, the field band, many BONK stars, and the hero's face.
- **Words:** WIGGLE (riding the hero for one moment) and BONK. The + / − signs carry over from line 6.
- **Camera:** a slight handheld-style sway in time with the tug, then pulling back to show the whole
  crowd.
- **Hand-off:** the BONK stars start to glow orange.

### 8. "All that bumping makes heat." (0:35.8–0:37.7)

- **Event:**
  - The glowing stars spread. The crowd shifts from cool blue to orange to red, molecule by molecule.
  - The molecules sweat. Shimmering heat waves rise between them under a big printed **HEAT**.
- **Movers:** the colour spreading molecule by molecule, the stars, the sweat drops, the rising
  shimmer.
- **Words:** HEAT.
- **Camera:** a fast pull back out through the bead's surface. The film closes up behind us.
- **Hand-off:** the bead turns out to sit in the red outer band of Spud's cutaway. Steam is rising off
  it.

### 9. "The waves only reach a little way in, so in thick food, the middle has to wait." (0:37.7–0:43.9)

- **Event:**
  - We're back on the cutaway. Waves dive into Spud from all sides, but each one fades out like a torch
    beam in fog after a short way. A dashed line marks the limit: **WAVES STOP HERE**.
  - The outer band glows red. In the cold blue **MIDDLE**, the chef from line 1 sits on an upturned
    bucket, with his scarf on and the torch dead, tapping his watch. A thought bubble shows **…**.
  - Heat creeps in from the edge, band by band, and finally reaches him: he smiles and loosens the
    scarf.
  - Beside Spud, a thin cracker on the same plate glows evenly all the way through. Its label is
    **THIN**, and Spud's is **THICK**.
- **Accuracy:**
  - The waves heat only the outer layer.
  - The middle warms later, by heat creeping in.
  - Thin food heats through.
- **Movers:** wave fronts fading, the creeping bands, the chef tapping, the cracker, the steam.
- **Words:** WAVES STOP HERE, MIDDLE, THICK, THIN.
- **Camera:** framing the whole cutaway, then a short push in on the chef.
- **Hand-off:** the cutaway closes, and the camera cranes up and over to look straight down on the
  plate.

### 10. "Some spots get more waves than others. That's why your plate spins." (0:43.9–0:48.5)

- **Event:**
  - Top-down view of the oven floor. The bouncing waves stack into a polka-dot map of glowing spots
    (**HOT SPOT**) and dark spots (**COLD SPOT**). Each spot pulses on its own.
  - **Still plate:** a chocolate bar melts in neat dots exactly over the hot spots, Spud's left cheek
    bubbles, and his right side grows icicles. He looks alarmed.
  - **Spinning plate:** the turntable starts. Everything sweeps through hot and cold. The dots blur
    into an even glow, the icicles drip away and the chocolate melts evenly.
  - Spud's grin goes dizzy, then happy.
- **Movers:** the pulsing spots, the chocolate puddles, the bubbles, the icicles, the turntable, and
  Spud's face.
- **Words:** HOT SPOT, COLD SPOT, SPIN (on the turntable rim as it starts).
- **Camera:** top-down, then a slow rotation against the plate (so the spin reads). The camera then
  begins to tilt back.
- **Hand-off:** the turning plate. The camera keeps rising and tilting to look out through the door.

### 11. "So waves wiggle the water, the bumping makes heat, and your leftovers get hot." (0:48.5–0:54)

- **Event:** one continuous pull back from the plate, out through the door mesh, to the whole
  microwave. Each phrase hits an object already in frame:
  - "Waves": a wave crosses the cavity, and **WAVES** prints on it.
  - "Wiggle the water": a steam wisp lifting off Spud swells for a moment and shows a tiny rocking
    molecule inside it (**WIGGLE**).
  - "Bumping makes heat": a BONK star flashes into **HEAT**.
  - "Leftovers get hot": the door pops open with a "ding". Spud puts on sunglasses, steam pouring off
    him (**HOT**). The chef climbs out of a hatch in his top, warm at last, and waves at camera.
- **Movers:** the plate, the steam, the molecule bubble, the star, the door swinging, Spud, the chef.
- **Words:** WAVES, WIGGLE, HEAT, HOT.
- **Camera:** a single pull back from the plate, through the mesh, to the full microwave front. Hold
  for the last half-second on Spud and the chef.
- **Hand-off:** the end card, or a loop: the closing push could match frame 1's push through the door
  window, so the Reel loops.

## The set, checked as one film

- **One camera, no cuts.** Every move grows out of the previous frame through one point of focus:
  - the chef's flame (1→2)
  - the ripple (2→3)
  - one wave front (3→4)
  - the wave at the mesh (4→5)
  - the ribbon landing on the bead (5→6)
  - the incoming ribbon (6→7)
  - the BONK stars (7→8)
  - the bead in the outer band (8→9)
  - the crane up over the plate (9→10)
  - the turning plate (10→11)
- **Changes of world, and why they're earned.**
  - The molecule world (lines 6–8) is the mechanism itself, and the script asks for "tiny
    molecules". We enter it through the bead and leave through the same bead.
  - The ant-scale door (line 4) is a change of scale, not of world. It is the only way to make "the
    holes are smaller than the wave" readable with the sound off.
  - Everything else stays inside one microwave.
- **Callbacks.**
  - The chef: myth (1), busted (2), waiting (9), freed (11).
  - The cutaway: 1, 2 and 9.
  - The wave ribbon: 3, 4, 5 and 7.
  - Spud's face: the reaction in every outside beat.
- **Pacing.** The busiest beats (4, 7, 10) are spread out, and the quiet 1.9 s of line 8 is a release
  rather than something new to build.

## Build order and risk (one builder, ~90 min)

1. **Microwave set and Spud rig, with cutaway bands and steam (25 min).** Used in 1, 2, 9, 10 and 11.
2. **Wave component (15 min).** Used in 3, 4, 5, 7 and 11.
3. **Molecule canvas (20 min).** Used in 6, 7 and 8.
   - Biggest risk: about 150 sprites with collisions. Fallback: 80 molecules, with collisions faked by
     neighbour distance.
4. **Chef and stamp (10 min).**
5. **Line 4 mesh scale-down and line 10 hot-spot map (15 min).**
6. **Camera path and word timing (5 min).**

**Cut list if time runs short, in this order:**
1. The ant.
2. The cracker in line 9 (keep THICK and MIDDLE).
3. The chocolate bar in line 10 (keep Spud's bubbling cheek and icicles).
4. The molecule faces (keep + and −).

# Picture picks (fresh picker agent, 2026-11-19)

Picks for s5-kettle-roar. Before judging I read the "Find the pictures" and "Checks" sections of animated-video's references/direct.md, plus motion-principles.md. The project's brief.md should record those under Guidance read.

The film in one line: one real glass kettle in one kitchen, seen at two scales (the counter and a macro view inside the water). Two devices tie the beats together and both come from the beats' own pictures. Colour is temperature: the water is tinted red where it is past boiling and blue where it is cooler, and the red line climbs. A bright ring is sound: every bubble collapse fires one. A mug of water on the counter acts as the meter you can see in the world.

How sound shows with the sound off:
- Each collapse fires a thin glowing ring that runs out to the glass.
- In the kitchen, the rings leave the kettle as faint air ripples.
- The mug of water beside the kettle shudders in concentric ripples (the Jurassic Park water glass) and a spoon in it rattles.
- Quiet means the rings stop, the mug goes flat and the spoon goes still.

This is clear, it's the one image people would screenshot, and it's cheap to build (a ripple shader and a small jitter on rigid objects).

Beat 1, hook: wide shot of the glass kettle on the counter. The mug ripples grow, the spoon chatters and rings pulse out of the kettle. Then on "goes quiet" the mug snaps flat and a steam plume rolls up.
- Runner-up: a sound-level meter. It's clear but it's an overlay (a presentation, not a movie).
- Runner-up: an apartment block of kettles going quiet window by window. It's big, but it's a second world, costs more and explains nothing.
- Cut: the tea-sipping cartoon kettle. It breaks the realistic world.

Beat 2, "Here's why": push in toward the glass, then a hard cut to the macro view at the heating element. The real glass already does the X-ray, so the zipper and cutaway ideas add nothing. Cut rather than fly through the glass, because flying through it clips the camera.

Beat 3, element boils first: the macro view combines the heat map with nucleation.
- A glowing red layer hugs the plate, with blue water above it. This is the first legible showing of the colour code, before the film relies on it.
- Dozens of tiny pits in the metal each bead and blow a bubble.
- Instanced bubbles and light make this cheap. The hot-sidewalk molecules are a world change for no gain.

Beat 4, rise and collapse, the biggest beat: one hero bubble lifts out of the red into the blue and slows down. It crumples like a crushed can, snaps shut to nothing and fires the first bright ring. Leaving nothing behind is what says "steam turning back into water, not air", because an air bubble would survive.
- Runner-up: a house-sized bubble rising from lava into an icy ocean. It has great scale and a great screenshot, but it's a new world and costly. The macro view already gives us the change of scale.
- Runner-up: breath on a cold window. It explains condensation but shows neither the collapse nor the sound.
- Cut: balloons hitting a cactus ceiling. It's wrong physics, since a pop is not an implosion.

Beat 5, the roar, the biggest spectacle: pull back from that one collapse to thousands at once. A glittering band of flashes sits above the element, and the rings overlap until the water shimmers. Keep pulling back through the glass, then cut to the counter, where the mug is shuddering again. A small counter going "1 … 5,000 per second" is the only overlay, and the world is moving under it.
- Runner-up: bubble wrap under a steamroller. It's screenshot-worthy but it's a new world, and it says "popping", not "collapsing".
- Cut: the tiny cymbal players. They need character animation.
- Cut: the waveform strip. It's a second, flat meter competing with the mug.

Beat 6, quiet: the red climbs from the bottom up through the whole body of water (the "boiling line"). Bubbles stop dying halfway and ride all the way up, swelling, to pop softly at the surface. The rings die out row by row as the red passes them. This changes the state of the world, not just a label.
- Runner-up: soda fizz on the pull-back. It's a nice texture, but it means CO2 and air, which the physics note warns against.

Beat 7, payoff: back on the counter. The kettle's switch light clicks off and the plume rolls up. The mug is dead still beside a rolling boil you can see through the glass. Then the hook comes back beside the answer, per the checks rule: a split of the same framing, rippling mug labelled "loudest: not boiling yet" against still mug labelled "quiet: 100 °C, boiling". It's the same objects and the same visual language, so the guess is replaced in place.

As a set, it holds as one film. There is no change of world, only a change of scale, made with hard cuts on the words. Each device is born in one beat: the colour in beat 3, the ring in beat 4, the mug in beat 1. Each then pays off in a later one: the mug in beat 5 and the ending, the colour in beat 6.

What I dropped and why:
- All the analogy worlds (lake, cactus, steamroller, toddler). The real kettle is already surprising once it's made of glass, and the mug-as-meter gives the screenshot without leaving the kitchen.
- Matching shots. Every line has an event, and the camera never parks.

Cost, for one agent in about a day on a CPU:
- Cheap: the found kettle and kitchen, the temperature tint as a shader on the water volume, instanced bubbles, additive ring sprites, the mug ripple shader, the spoon jitter and the steam particles.
- Watch: real-glass transmission is the expensive render, so for the macro shots fake it with a refraction shader and keep the glass small in the wide shots.
- Watch: the crumpling bubble (a noise-displaced sphere collapsing to zero) is the one procedural piece worth a test clip early.

For the remembered beats (4, 5 and the ending's split), show Matthew rendered stills plus a few seconds of motion before building them in full.

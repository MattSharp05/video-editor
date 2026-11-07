# AI image 01: picture picks

Sources: `pictures-brainstorm.md` and `lines.txt` (10 lines, about 52 s, 9:16 Reel). I read nothing else.

The judging tests are clarity (with the sound off, can you tell how it works?), surprise (would someone screenshot it?), spectacle (does the motion itself hold the eye?) and cost. The cost limit is Remotion only, a 4-core CPU with software WebGL, one builder and about 90 minutes for the whole film.

## The decisions that shape everything

1. **The film is a round trip, not a single room.** The brainstorm keeps the picture inside the phone, so the trip has no reason to exist. Real generation happens away from the phone (on a server) and comes back. Line 10 says it "lands on your phone". So the film leaves the phone on line 3 (the message flies out) and comes back on line 10. That gives two changes of world. Both are earned by the script, and one paper plane carries both.
2. **The denoiser is a sheet lifted off the whole picture, never a wipe.** The brainstorm's best bet for line 6 is the mirror wipe. It is clear, but it is wrong: a hand clearing one patch at a time teaches piece-by-piece building, and that isn't how these generators work. Every step must change the whole frame at once. So the AI's guess is a full-screen, see-through sheet of grain. It lifts straight off toward the camera, all at once. What is left underneath is slightly less noisy everywhere. Everyone knows peeling a screen protector, so it reads with the sound off. It also stays honest: the sheet's pixels are exactly the noise removed in that step (computed, not drawn).
3. **Three linking devices, each made of a beat's own picture:**
   - **Paper plane:** the send arrow. It carries the words out (3→4), then leads the camera home (10).
   - **Number tapes:** what the words turn into (4). They plug into the TV (5), pulse on every step to show the steering (8), and are flown past in the recap (10).
   - **Noise sheets:** peeled off in 6–8 and piled beside the TV. In 9 they are laid back onto the training photos ("covered in static"). In 10 they fan out into the corridor the camera flies through.

   No device is decoration. Each one is a picture of the mechanism, and it comes back when the script calls it.
4. **One real denoise engine drives lines 2, 5–9 and 10.** Here is how it works:
   - A seeded canvas computes `x_t = a(t)·target_t + b(t)·noise` on a chunky 270×480 grid, scaled up with nearest-neighbour. The chunky pixels are a style and also cut the cost.
   - `target_t` is the drawn picture, blurred less as `t` falls, so coarse blobs come before fine detail.
   - The target is drawn straight with Canvas 2D path calls, not an SVG loaded as an image. That avoids async image loading in Remotion.
   - Each step's image is fixed by its step number, so it can be cached per tab. The same step images build the peeled sheets, the pile and the line 10 corridor. No three.js is needed: the sheets, plane and corridor are CSS 3D transforms on canvases.
5. **One camera.** Everything lives in one world. One keyframed camera (x, y, scale, plus CSS perspective for the corridor) moves through it, with no scene cuts. Each line's first frame is a push or pull through an object from the line before.

## Picks per beat, with the reasoning

**Line 1, the myth** (rewritten after the fact-check: "glues together bits of real photos"). Pick: the phone lies on a craft table covered in real-looking printed photos: a dog, a pizza, a surfer on a wave. Scissors snip scraps out of them. The scraps fly in, a dozen at once, and a glue stick slaps them onto the phone's picture slot. The result is a lumpy collage with crooked white edges and mismatched lighting: a dog's head on the wrong-sized body, half a pizza, a wave cut from a postcard. To end the beat, one scrap peels at a corner and flaps. The collage is funny because it looks bad, and it is a screenshot moment: everyone recognises a ransom-note collage.
- The scraps flying in from many photos together give the beat its spectacle.
- The "photos" are flat drawn pictures (simple Canvas 2D or SVG scenes with a white photo border). No stock images.
- Rejected: a photocopier or a stamp that stamps photo bits. Less clear with the sound off than scissors and glue, which a child already knows.
- Accuracy: the scissors, glue and collage appear only in the myth. Nothing later cuts or pastes.

**Line 2, the thesis.** Pick: static swallows the collage. Grain fizzes out of the cut seams first, the place the eye is already on, and in one burst the whole screen is static. The scraps dissolve into it, and the scissors and glue stick are knocked off the table. The static then collapses like an old TV switching off, into a thin line, and the line settles as the frosted fill of the chat's text box, cursor blinking.
- The "many AI picture makers" wording needs no extra on-screen text. Don't add "all".
- Snow globe and marble block: good metaphors, but each is a new world for 3.5 s.

**Line 3, the creator's request** (literal, and required). Pick: a thumb types "a dog surfing on a pizza" with key pops and one typo fixed with backspace. The thumb hits send, with a squash. The send arrow folds into a paper plane around the message bubble. It flies out through the screen and the camera chases it.
- Words hopping out as little characters: charming, but three character rigs is the most expensive option and adds nothing to how it works.

**Line 4, words to numbers.** Pick: the plane unfolds in mid-air on a warm background, and the three words drop out as split-flap tiles. Each tile flips as a whole word. Its flaps keep clacking and spool out a long tape of decimals (0.82 −1.30 0.07 …) that runs past the edge of the frame. One word becomes hundreds of numbers. That is the scale shot, and it is honest.
- Do **not** map letters to digits. That would teach the wrong (ASCII-like) idea.

**Line 5, pure static, like an old TV.** Pick: the three tapes snake into the back of an old CRT TV standing on the same warm floor. Click: the screen bulges with live static, scanlines and glow. The camera pushes in until the screen fills the frame. The TV earns its change of world because the script names it, and the "inside the AI" space needs a body. Its glow is the only light source, which gives the beat its spectacle.
- Phone sprouting rabbit ears: cheap and funny, but it keeps everything on the phone and spoils the round trip.

**Line 6, the guess and the wipe.** Pick: the grain trembles all over at once (the guess). Then a full-screen see-through sheet of grain lifts off toward the camera, curling slightly and catching a glint, and drifts out of frame. The picture behind is a little calmer everywhere. Faint warm blotches show.
- Mirror wipe (brainstorm best bet): rejected because it clears one patch at a time.
- Detective plus vacuum: tagging individual grains suggests pixel-by-pixel removal, the same error.

**Line 7, 20 to 50 times, the whole picture clearer.** Pick: the peels repeat and speed up. First about one per second, then a fluttering stream of sheets, each thinner than the last, flying past the camera onto a growing pile beside the TV. A small step counter ticks. The frame changes every frame: big colour blobs gather, and they stay ambiguous on purpose. Stop at about step 28 with clear blobs and no detail.
- Lens focus or Polaroid: both read as blur or chemistry, not noise, and neither shows repetition.
- Flipbook: good, and it is used in line 10 instead (as the corridor).

**Line 8, the steering.** Pick: the camera pulls back just far enough to show the TV, the three tapes and the pile of sheets. On every peel a pulse of light runs down the tapes into the TV. As the VO names each one, the matching tape glows and its blob snaps into shape: the "dog" tape gives the dog blob ears and a snout, the "surfing" tape curls the wave, the "pizza" tape gives the disc its pepperoni. The counter reaches 50 and the image is sharp.
- The finished picture stays a still (it is an image generator). Life comes from the camera move and a light sweep across the CRT glass.

**Line 9, training.** Pick: pull back from the dog TV. It is one TV in a wall of old TVs. Each TV shows a captioned photo ("red car", "cat on a sofa", "beach at sunset"). The wall keeps going past every edge of the frame (billions). For "covered each one in static", the pile of sheets lifts and spreads across the wall like a flock, landing on the screens, and a wave of static ripples across them. For "learned to clean it up", a wave of peels runs back across the wall, and the photos come back clean. The camera keeps a slow push on one "red car" TV so one example stays readable inside the mass. This is the gym-reps idea and the rewind trick combined, without the gym.
- Rewind of one photo (brainstorm best bet): true, but small for the longest line (about 8.7 s).
- Gym robot doing reps: adds a character and a new world.

**Line 10, the recap and the landing.** Pick: the dog TV lights up brighter than the rest of the wall, and the camera pushes into its screen. Inside, the 50 step frames hang in a row like a corridor. The paper plane is back (refolded from the line 4 sheet) and leads the camera:
- past the three number tapes ("words become numbers");
- down the corridor of frames from static to sharp, each frame clearer than the one before ("static gets cleaned");
- through the last frame, which turns out to be the phone's screen in the chat, pulling back to the phone in hand.

The plane unfolds into the picture in the chat bubble. The phone gives a small "ding" shake, and a few cartoon water droplets splash off the picture onto the glass (end button, cuttable).
- Dog surfing out of the TV onto the phone: needs a rigged dog and suggests the AI made a video.
- Conveyor belt: it is a diagram. That is the "presentation" moment the creator dislikes.

## Runners-up for the biggest beats

| Beat | Pick | Runner-up | Why the runner-up lost |
|---|---|---|---|
| 1 Myth | Scissors and glue stick building a lumpy photo collage on the phone, scraps flying in from many photos | Photocopier or stamp pasting photo bits | Less clear with the sound off; scissors and glue are a child's own picture of "glues bits together" |
| 4 Numbers | Split-flap word tiles spooling long number tapes | **Meaning map** (dog lands near puppy and wolf) | The most surprising idea in the brainstorm, but the VO never mentions meaning, it adds a world, and in about 2 s a 3rd grader can't read the labels. Keep it for a sequel video on embeddings |
| 6 Wipe | Full-sheet lift (screen-protector peel) | Mirror wipe | Clears one patch at a time, which breaks the accuracy guard |
| 7 Repeat | Accelerating sheet stream plus pile, real denoise | Flipbook | The idea survives as the line 10 corridor, where it doubles as the recap |
| 8 Steer | Tape pulses plus named blobs snapping into shape | **Fork** (same static, "cat on a cake" on a split screen) | Clearest proof of steering, but it needs a second target picture and a second run, and it splits the frame while the VO names dog, wave and pizza. Use it if a future cut gets an extra line |
| 9 Training | Wall of TVs, sheets flock on then peel off in a wave | Single photo rewind | True but thin for the longest line; it survives as the "red car" TV inside the wall |
| 10 Landing | Plane plus corridor fly-through into the phone | Dog surfs onto the phone | Character rig; suggests a moving image |

## The picks as one film

- **Worlds:** phone (1–3), then warm open space with the plane (3–4), then the CRT (5–8), then the wall of TVs (9), then back into the CRT, down the corridor and out on the phone (10). Every change is a push or pull through one object: the send arrow, the plane, the tapes, the TV glass, the dog TV, the last corridor frame.
- **Rhymes:** line 1's collage uses the same three subjects (dog, pizza, wave) that the denoiser later makes as one clean, seamless picture. Line 10's ending answers line 1: the same phone slot, no seams. Line 2's static is the same static the film builds properly in line 5. Line 3's plane comes back in line 10.
- **Accuracy:**
  - The scissors, glue and collage appear only in the myth.
  - No step clears one region at a time.
  - The sheets are the computed removed noise.
  - Words become long tapes of numbers, not letter codes.
  - No on-screen text says "all" or "never". The VO's "many" (line 2) and "often" (line 7) stand.
  - The finished picture doesn't move by itself.
- **Something moves in every frame:** the step counter in lines 7–8 and the photo captions in line 9 are the only labels, and in both the picture is changing underneath them.

## Build budget (about 90 min), with what to cut first

- Denoise engine plus target drawing (dog, pizza board, wave): 25 min. This is the core and is reused six times.
- Phone, chat, keyboard and thumb typing: 15 min.
- Camera rig: 5 min.
- Plane and split-flap tapes: 10 min.
- CRT TV and peel sheets: 10 min.
- Wall of TVs: 10 min. Only about 9 nearby TVs are detailed SVG; the rest is canvas tiles with shared noise.
- Corridor: 10 min. About 50 cached step canvases at 135×240.
- Collage (three drawn photos, scissors, glue stick, scraps flying in): 10 min. This reuses the dog, pizza and wave drawing code.
- Splash: 2 min.

Cut in this order if the clock runs out:
1. The droplet splash.
2. The flapping scrap and the scissors snipping (keep the scraps flying in and landing).
3. The split-flap clacks (use a simple cross-fade flip).
4. The 3D curl on the sheets (keep a flat lift).
5. Reduce the corridor to 20 frames.

Never cut the real per-frame denoise or the whole-sheet peel. They are what the film explains.

## Beat sheet

Times are rough, from word counts (132 words in about 52 s).

| # | Line (≈s) | Picture as an event | Camera | Hand-off / carrier |
|---|---|---|---|---|
| 1 | "Most people think AI glues together bits of real photos." (0–4.0) | Scissors snip scraps out of printed photos (dog, pizza, surfer on a wave) on a craft table. A dozen scraps fly in together, and a glue stick slaps them onto the phone's picture slot as a lumpy collage with crooked white edges and mismatched lighting. One scrap peels at a corner and flaps. | Opens tight on the scissors' blades mid-snip, then pulls back with the flying scraps to frame the phone and its collage. | The glued seams, where the eye already is. |
| 2 | "But actually, many AI picture makers start with fuzzy static." (4.0–7.8) | Grain fizzes out of the seams first, then bursts across the whole screen with a flash. The scraps dissolve into it, and the scissors and glue stick are knocked off the table. Full-screen live static. Then a CRT switch-off: the static squeezes into one bright line. | Small push into the burst, then a settle. | The bright line settles as the chat's text box, frosted with leftover grain. The cursor blinks. |
| 3 | "You type: a dog surfing on a pizza. Then you hit send." (7.8–11.7) | The thumb types with key pops. Letters appear in the box, one typo is fixed by backspace. The thumb hits send (squash). The message bubble rises, and the send arrow folds it into a paper plane. | Tilts down to the keyboard, rises with the bubble. The plane flies out through the screen glass and the camera chases it off the phone. | The paper plane, carrying the words. |
| 4 | "The AI can't use words directly, so it turns them into numbers." (11.7–16.0) | The plane unfolds in mid-air on a warm background. "dog", "surfing" and "pizza" drop out as split-flap tiles. Each tile flips as a whole word and keeps clacking, spooling a long tape of decimals that runs past the edge of the frame. | Follows the falling tiles, then tracks sideways along the tapes. | The three tapes run off to the right into the back of a TV. |
| 5 | "Then it makes a picture of pure static, like an old TV." (16.0–20.3) | The tapes plug into an old CRT on the same warm floor. Click: the screen bulges with live static, scanlines and glow, the only light in the scene. | Swings round the TV to its front and pushes in until the glass fills the frame. | The grain on the screen. |
| 6 | "It guesses which part is just noise, and wipes a little away." (20.3–24.6) | The whole screen's grain trembles at once (the guess). A full-screen see-through sheet of grain (the computed noise for step 1) lifts off toward the camera, curls, glints and drifts out. Behind it the whole picture is a bit calmer, with faint warm blotches. | Holds on the glass with a slow drift. A slight pull-back as the sheet passes the lens. | The next sheet starting to lift. |
| 7 | "It often does that twenty to fifty times. Each time, the whole picture gets clearer." (24.6–30.5) | The peels repeat and speed up into a stream of thinner and thinner sheets flying past and stacking out of shot. The counter ticks 2 → 28. The whole frame changes every frame: big orange, blue and white blobs gather, still ambiguous. | Slow push-in, matched to the speeding rhythm. | The pile of sheets, which grows just out of frame. |
| 8 | "Your words steer every guess. So the blobs become a dog, a wave, and a pizza." (30.5–36.4) | On each peel a pulse of light runs down the three tapes into the TV. On "dog" that tape glows and the brown blob grows ears and a snout. On "wave" (the "surfing" tape) the blue curls into a wave. On "pizza" the disc gets crust and pepperoni. The counter reaches 50; the picture is sharp and stays still. A light sweep crosses the glass. | Pulls back to frame the TV, the tapes (left) and the pile of sheets (right). | The dog TV, about to be shown as one of many. |
| 9 | "How did it learn? It practiced on billions of pictures with captions. It covered each one in static, then learned to clean it up." (36.4–45.1) | The TV gains neighbours: a wall of old TVs showing captioned photos ("red car", "cat on a sofa", "beach at sunset") that runs past every edge. On "covered", the pile of sheets lifts and flocks across the wall, landing on the screens, and a wave of static ripples through them. On "clean it up", a wave of peels runs back and the photos come back clean. One "red car" TV is followed close enough to see. | A big pull-back for the scale, then a slow push toward the "red car" TV while the waves pass. | The dog TV in the middle of the wall lights up brighter than the rest. |
| 10 | "So words become numbers, static gets cleaned, and a brand new picture lands on your phone." (45.1–51.8) | The camera dives into the dog TV. The paper plane refolds and leads the way: past the three number tapes ("numbers"), then down a corridor of the 50 step frames from static to sharp ("cleaned"). The last frame is the phone screen. The plane lands, unfolds into the picture in the chat bubble, and the phone gives a "ding" shake. Optional: a few water drops splash off the picture onto the glass. | One continuous flight: push in, fly through the corridor, pull back out to the phone in hand. | End. The last frame answers the first: the same phone slot that held the lumpy collage now holds one seamless picture. |

# Microwave 01: report (v1)

**Final file:** `projects/microwave-01/renders/microwave-01_v1.mp4` (git-ignored; delivered from this session)
- 1080×1920, 30 fps, **51.6 s = 1548 frames** (last word 50.39 s + 1.2 s tail), one shot, made in code (Remotion, SVG).
- **Loudness −13.9 LUFS integrated, true peak −1.8 dBTP** (measured on the final MP4 with `ebur128=peak=true`).
- Muxed with padded audio and `-t 51.6`; the frame count was checked (1548), never `-shortest`.

## The film
Spud, a leftover baked potato with a face, sits in an original sage-green microwave in a dusk kitchen. There is no brand
and no black background. The camera:
1. **Pushes through the door window into a cutaway of Spud.** A tiny chef with a blowtorch in his middle gets stamped
   **MYTH?**, then **NOPE**. The **OUTER LAYER** flushes red while heat specks creep inward band by band.
2. **Follows a ripple to the X-ray side wall.** There the **MAGNETRON** hums, its fan spins, and its fins shimmer with
   heat. Its rings are dashed and **INVISIBLE**, then turn on as cyan **WAVES**.
3. **Rides six wave fronts bouncing off the METAL walls.** It shrinks to ant scale at the **DOOR**: **ONE WAVE** is far
   wider than the **TINY HOLES**, squashes, and bounces back (**TOO BIG TO GET OUT**).
4. **Watches the wave swing faster and faster into a blur** beside a 1-second stopwatch. A counter rolls up to
   2,450,000,000 under **BILLIONS** ("wave swings every second").
5. **Follows the ribbon down onto a water bead on Spud's skin and dives through it** into a crowd of water molecules with
   faces (pink **+** ears, blue **−** bellies, **WATER MOLECULE**). The flipping wave (**THE WAVE TUGS**, with a + disc
   and a − disc that swap sides) rocks each molecule back and forth within ±55°, never all the way round. They knock
   neighbours (**BONK**, **WIGGLE**) and heat up (**HEAT**, orange, sweat).
6. **Pulls back out through the bead to the cutaway.** Waves dive in and fade at a dashed **WAVES STOP HERE** ring.
   **THICK FOOD**: the chef sits in the cold **MIDDLE** tapping his watch until the heat reaches him.
7. **Cranes up to the oven floor from above.** It shows **HOT SPOT** and **COLD SPOT**: chocolate melts in dots, one cheek
   bubbles, the other side ices over. Then the **PLATE SPINS** and everything evens out.
8. **Tilts back for the recap** (waves → wiggle → heat) and pulls out through the door at **DING!**. The door swings open,
   Spud wears sunglasses (**HOT**), and the chef climbs out of him, warm and waving.

## Checks
- **Stills:** 43 beats at 0.25 scale (`stills/board_v1_0.25.png`), plus full-size heroes (`stills/hero_frames.png`), the
  fixed top-down board (`stills/topdown_fixed.png`), and frame 0 / the last frame (`stills/first_last.png`).
- **Motion check vs Grand Canyon 01** (saved bar readout, not re-rendered):
  - **Result: pass.** Movers median **18 vs 18**, ≤2-mover seconds 0% (bar 11%), still frames 32% (bar 36%), change over
    2 s 0.29 (bar 0.36).
  - **Path to the pass:** started at 11 movers with 11 flagged seconds; four redesigns, listed below.
  - **One flagged second, 45:** the crane back from the top-down plate to the side view. It is a deliberate move and I
    kept it.
- **Mute test (required), run twice:**
  - **Judge 1:** a fresh agent, captions off, 2 fps sheets. It recovered the myth, the outer layer, the magnetron
    making waves, the bouncing off metal, the billions of swings, the molecules wiggling and bumping into heat, the
    waves stopping short, and the ending. It missed or was unsure about:
    - the door ("implied, not stated");
    - "billions of swings of what?";
    - the molecules (read as mice);
    - the + / − band (didn't read as the wave tugging);
    - the top-down hot-spot board (couldn't identify the objects);
    - a giant chef flashing past during the exit from the bead.
  - **Fixes, each in its own shot:** TOO BIG TO GET OUT; WAVE on the ribbon plus "wave swings every second"; WATER
    MOLECULE; THE WAVE TUGS; OVEN FLOOR · TOP VIEW and CHOCOLATE; Spud in his real skin colour from above with steam
    kept off his face; PLATE SPINS; the chef hidden while zoomed past.
  - **Judge 2:** a second fresh agent on the fixed stretches. It recovered the door, the swings, the wave tugging the
    molecules, heat, uneven heating and the spinning plate. Its remaining notes:
    - the HOT SPOT and COLD SPOT labels were drawn under the translucent plate (fixed: moved above it);
    - NOT TO SCALE overlapped TINY HOLES (fixed);
    - a grey box behind the blurred wave meant nothing (removed).

    The last fixes were checked in the final render's stills, not re-judged.
- **Temporal check:**
  - **Strip:** consecutive frames 660–689 (the dive into the bead).
  - **Flicker (YAVG):** two real pops were fixed. The caption scrim appeared on frame 1, so the first caption now shows
    from frame 0. In line 5 the oven popped in behind a part-transparent mesh, now a smooth 7-frame crossfade.
  - **Remaining jump (35.7 s, 7–10 levels over 3 frames):** the pull back out through the bead, a deliberate
    pass-through.
- **Voice/music (measured, not listened to):** music 11.6 dB under the voice while he speaks, about 6 dB up in the
  pauses.

## What is synthetic or credited
- **Voice:** AI (Qwen3-TTS clone of Matthew's design-m2 pick). Every line matches the locked script (line-by-line
  alignment, 11/11 MATCH, no regenerations).
- **Music:** "Floating Cities" by Kevin MacLeod (incompetech.com), licensed CC BY 4.0.
- **Sound effects:** 26 cues (`film/sound/cues.json`), from the CC0 library (`library/sfx/cstack-cc0`) or synthesized
  (noise swells, a soft 1046 Hz ding). None of `sfx-01`–`28`.
- **Art:** all drawn in code. No logos, brands or borrowed characters.

**Listen-for list (nobody has heard the mix):**
- the MYTH stamp at 2.8 s;
- the mesh squash at 16.1 s;
- the clock tick at 20.5 s;
- the BONK clicks from 31 to 36 s;
- the door click and ding at 49.7 s.

## Instagram caption (draft)
> Does your microwave cook food from the inside out? Nope. 🥔
> The magnetron makes invisible waves that bounce around the metal box (the door's tiny holes are too small for them to
> get out). They swing back and forth about 2.45 billion times a second, tugging the water molecules in your food so
> they wiggle and bump into each other, and that bumping is heat. The waves only reach a short way in (roughly a
> centimetre in moist food like a potato), so the middle of thick food heats more slowly as the heat creeps in. Hot and
> cold spots are why the plate spins.
> Simplified illustration: microwaves also heat fats and sugars, not only water, and it's not a "resonance" with water.
> Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI.

## Decisions made without Matthew (also in `film/PLAN.md`)
- **2D SVG only (no three.js).** The scenes are nested so the door window is exactly the oven cavity. Each space is
  entered through a carrier: the door mesh, a ripple, the lead wave, the bead surface, the crane.
- **About 54 SVG molecules with faces,** not 150 on a canvas, so the faces read at phone size.
- **The counter shows 2,450,000,000** (research: 2.45 GHz) under BILLIONS; the voice says "billions".
- **Cut from the pick for time:** the thin cracker in line 9 (THICK FOOD and MIDDLE kept).
- **Kept from the pick:** the ant.

## Errors, redesigns and rewrites (UTC)
- **19:26:** Started the voice venv + TTS and the music download in the background. The branch was a detached HEAD;
  checked out `claude/generate-three-videos-02e0kn`. `pictures-pick.md` wasn't pushed yet, so I polled until it landed
  (19:29).
- **19:3x:**
  - `lib.ts` from the template imports a `vo_env.json` that doesn't exist, so I removed it (unused).
  - I wrote the npm log to `/home/user/tmp_npm.log` (outside the repo) by mistake. Harmless.
- **19:36, first stills:**
  - The wave bracket ran off screen, so the wave got shorter.
  - The + / − field band sat under the caption scrim, so I moved it down.
- **19:38–19:44, motion:** four redesigns.
  1. Steam droplets, floor waves, steam puffs, livelier molecules, mesh sparks/specks, steam from the open door.
  2. Droplets bigger and blue-white (they were invisible on the lit cavity), chunkier floor waves.
  3. The heat mechanism as motion: sparks in the outer layer, specks creeping inward. Also moved the stamp off the chef.
  4. Sparks start on "but actually"; heat shimmer off the magnetron fins.
- **19:45:** Full-size heroes. INSIDE OUT? covered Spud's eyes (moved). The + signs were faint (bigger, darker ears).
- **19:46–19:50:** Mute-test fixes (above). The top-down board was the biggest redesign: steam was burying Spud's face.
- **19:50–19:56:** The first master (1:50 render) was missing the last fixes, so I re-rendered the whole film rather
  than splicing (2 min). The flicker scan found two pops (fixed, above); re-rendered and re-muxed.
- **Skipped:** no splice was needed. The second judge's last three notes were verified in stills, not re-judged.

## Open issues
- **Nobody has listened to the mix.**
- **The mute test showed these points stay weak with the sound off:**
  - why a + or − pulls on a molecule;
  - BONK stars are small;
  - the chef's identity is clear only through the MYTH? stamp;
  - heat creeping inward reads but is not labelled as conduction.
- **The exit from the bead (35.7 s)** is fast: a short bright blur before the cutaway.
- **The music is the same Floating Cities track as the other films.**

## Timeline (machine clock, UTC; from `film/PLAN.md`)
19:26 start → 19:29 pick → 19:33 VO done → 19:36 first stills → 19:38–19:44 motion passes → 19:45–19:50 mute test ×2 + fixes →
19:50–19:56 final render, mux and checks → 19:57 delivered. **About 31 minutes of wall time**, render waits included
(the full render is 2 min).

## Production analytics (`film/analytics.py` over this session's transcript)
| Phase | Min | Responses | Tools | Renders | Agents | Output tok | Cache read |
|---|---|---|---|---|---|---|---|
| Setup | 4.0 | 20 | 21 | 0 | 0 | 16,862 | 2,676,623 |
| Build | 8.0 | 14 | 14 | 0 | 0 | 49,959 | 2,788,947 |
| Checks | 9.5 | 26 | 27 | 5 | 1 | 26,771 | 6,503,124 |
| Final | 9.2 | 22 | 21 | 4 | 1 | 9,873 | 6,226,472 |

Subagents (two mute judges): about 550 k input and 5 k output tokens.

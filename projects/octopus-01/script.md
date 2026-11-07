# Octopus 01: script v1 (written and produced unattended: Matthew, 2026-11-07, "just make the whole thing don't ask for my approval. Make them interesting, entertaining, informative, 3rd grade reading level.")

**Idea:** An octopus blends in by opening and closing millions of tiny color sacs with its muscles and nerves, with
shiny and white cells below and bumps that change its skin's texture; yet it is thought to be color-blind, and how it
matches is still an open question. **Goal:** reach (default). **Format:** Instagram Reel 9:16, narrated explainer, one
continuous 3D shot on a reef (three.js, underwater water kit). **Voice:** American male design-m2 cloned from the
approved clip. **No call to action.** **Runtime:** ~70 s (195 words at ~2.8 words/s). Reading level: Flesch-Kincaid
grade 1.6 (`python3 ../moon-tides-01/readability.py lines.txt`).

## The chain (each part answers the problem the one before made)
1. Hook: the rock is an octopus (a find-it game the viewer plays at frame 0).
2. Problem: it changes its whole look in about a blink. How?
3. Answer: millions of color sacs, one color each, pulled open by muscles, run by nerves from the brain (why it's fast).
4. New problem: sacs only make yellow, red and brown. Answer: shiny cells (blue, green), white cells (any light).
5. New problem: color isn't enough on a bumpy rock. Answer: bumps (papillae).
6. Twist: it's thought to be color-blind. Open question; one clue: skin that reacts to light on its own (slow, unknown use).
7. Recap through every part, landing back on the rock.

## Script
| Time | Spoken line | On-screen text | What the viewer sees | Capture |
|---|---|---|---|---|
| 0:00 | Watch this rock. It's an octopus. | FIND THE OCTOPUS | Frame 0, moving: a sunlit reef slab with algae and coral; the camera drifts in. On "octopus" the rock flashes pale and an octopus's eye opens; its outline appears. | code (three.js) |
| 0:03 | It can change its colors in as little as a fifth of a second. That's about as fast as a blink. | 0.2 SECONDS | The octopus flicks back to rock and out again; a blink of an eye beside it (an eyelid closing) takes the same time. | code |
| 0:09 | How? Its skin is full of millions of tiny bags of color. | CHROMATOPHORES | The camera dives at its skin: the color resolves into thousands of dots. | code |
| 0:13 | Each bag holds a single color, like yellow, red or brown. |  | Deep in the skin: sacs of yellow, red and brown, each lighting in turn. | code |
| 0:16 | Tiny muscles pull a bag wide open, like stretching a balloon. When they let go, it shrinks back to a dot. |  | Thin muscles around one sac shorten like spokes and stretch it into a wide disc; they relax and it springs back to a dot. | code |
| 0:23 | Nerves from the brain tell the muscles when to pull. That's why it's so fast. |  | A spark races down a nerve from the brain to the muscles; a whole field of sacs opens at once. | code |
| 0:29 | But the bags can't make blue or green. So under them are shiny cells that bounce those colors back. | IRIDOPHORES | Below the sacs: stacked thin plates; a light beam hits them and bounces back blue-green. | code |
| 0:35 | And under those are white cells. They take on the color of the light around them. | LEUCOPHORES | The bottom layer of white cells turns blue in blue light, then gold in gold light. | code |
| 0:41 | Color is not enough. Rocks are bumpy. So the octopus pushes up little bumps to make its skin rough. | PAPILLAE | Back out on the reef: smooth skin beside rough rock; bumps rise all over the octopus until its skin is as rough as the rock. | code |
| 0:49 | Here's the strange part. Most scientists think octopuses are color-blind. | COLOR-BLIND? | Into its eye: the reef seen through it goes grey. | code |
| 0:54 | So how does it match? Nobody knows for sure. |  | The grey view; the real reef behind blooms back into color; a question mark. | code |
| 0:57 | Here's a clue: in a test, a bit of octopus skin in a dish reacted to light, with no eyes or brain. But it was slow, and nobody knows if it helps. | SKIN SENSES LIGHT? | A light beam falls on a patch of skin; its sacs open slowly; a stopwatch counts seconds. | code |
| 1:04 | So that's color bags, shiny cells, white cells and bumps. |  | Pull back: each part flashes in the skin as it is named. | code |
| 1:08 | Next time you see a rock, look twice. |  | The octopus fades into the rock again; the rock's eye blinks once. | code |

Times are the stand-in estimate; the film times every beat from the generated voice (`film/src/beats.json`).

## Alternative hooks (`hooks.txt`, checked with `check_script.py --hooks`, 0 flags)
1. Chosen: "Watch this rock. It's an octopus." / FIND THE OCTOPUS (Cold Open Demo: the viewer plays find-it at frame 0, and the reveal pays off by 0:03).
2. "This tiny octopus can hide in 0.2 seconds." / 0.2 SECONDS / second sentence: "Its skin is full of millions of tiny bags of color." (The Reveal.)
3. "The best hider on this reef is color-blind." / COLOR-BLIND? / second sentence: "So how does it match the rocks?" (The Superlative.)
Matthew's favourite format ("Most people think...") was not used: nothing common is believed wrongly here; the find-it game shows the claim on screen.

## Draft caption
How does an octopus blend in? Its skin has millions of chromatophores: elastic sacs of yellow, red or brown pigment
opened by tiny muscles that nerves from the brain control, so it can change in as little as 200 ms (Hanlon, MBL).
Under them, iridophores reflect blues and greens and leucophores reflect whatever light falls on them; papillae raise
bumps for texture. Octopuses are thought to be color-blind (one kind of light receptor), and how they match colors is
still open. In one study (Ramirez & Oakley 2015), skin of the California two-spot octopus opened its chromatophores in
light on its own, slowly; whether this helps camouflage is unknown. Original 3D model, not a specific animal.
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS).

## Claims to verify
See `research.md` (sources) and the fact-check table below (filled in by a fresh agent).

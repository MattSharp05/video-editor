# Black hole 01 (brief)

Status: in production, unattended (Matthew, 2026-11-07: "just make the whole thing don't ask for my approval. Make them
interesting, entertaining, informative, 3rd grade reading level."). Topic: "What would happen if you fell into a black
hole?" (spaghettification, time slowing as seen from far away, why light can't escape, the glowing disk).

## Skipped by instruction (each approval stop in the skills)
- Concept and pictures approval (video-script / animated-video step 1): skipped; fresh brainstorm + picker agents decided.
- Key-frame board approval (step 4): skipped; boards kept in `stills/` (v1-v4) and read by Claude only.
- Voice choice (profile says ask per video): skipped; American male design-m2 cloned from
  `projects/grand-canyon-01/vo/ref_design-m2_hook.wav` as instructed.
- Sound Picker picks: skipped; effects chosen by measurement from the CC0 library and synthesis, music as instructed.

## Facts
- Reel 9:16, 30 fps, ~72.6 s (VO 72.1 s, 211 words, 2.9 words/s). Reading level: Flesch-Kincaid grade 1.9.
- Voice: American male design-m2 (Qwen3-TTS Base, CPU), cloned for every line from the hook clip. No call to action.
- Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Effects: CC0 `library/sfx/cstack-cc0` and
  synthesized only.
- Everything is modelled in code: an original toy astronaut, an original small ship, a procedural star, and a
  ray-traced black hole (light bent by a Schwarzschild hole in a shader; the disk, the shadow and the lensed stars all
  come from the tracing). No footage, stills or copyrighted designs.
- The film's main hole is a SMALL (star-sized) one, per the fact-check: the astronaut is stretched before reaching its
  edge; the giant hole appears only at line 15, where the hole grows and swallows the stretch zone.

## The thread (one shot; lead -> move -> next lead, carrier)
| # | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 1 | you (toy astronaut) | travel | the hole behind you | you drift toward it, boots stretching, snapping back |
| 2 | you | transform | the "YOU" sticker | you turn to the camera; the sticker appears on your chest |
| 3 | the hole | pull back + transform | the giant star | the camera pulls back; the star fills the hole's place, swells, flashes, caves in to the hole |
| 4 | the hole's edge | travel | the light fan | the edge lights cyan; a rock falls in; light from you bends in or around |
| 5 | the light | pass on | the river of space | the rays fade into dots streaming inward; two light pulses: one creeps out, one slides in |
| 6 | the river | push in | the black shadow | the dots fade as the camera pushes at the black |
| 7 | the shadow | crane up | the gas | the camera rises over the disk; gas spirals down the drain, faster |
| 8 | the gas | skim | the hot inner disk | the camera skims low; the inner disk goes white-hot, sparks |
| 9 | the disk | travel | you | the camera rides the disk's light back to you; you tip feet first |
| 10 | you | transform | the noodle | violet pull arrows (long at the feet); you stretch long and thin |
| 11 | the noodle | pull back | the friend's ship | the camera flies back along the line of sight to the ship and zooms like binoculars |
| 12 | you (seen from far) | transform | the two clocks | your seen clock slows and stops; you turn red, dim and fade |
| 13 | the clocks | travel | your watch | the camera dives back to you: your watch ticks normally, you fall in |
| 14 | the hole | pull back | the stretch zone | a violet shell around the small hole, far outside its edge, a ghost noodle inside it |
| 15 | the hole | transform (grow) | the giant hole | the hole grows giant; its edge swallows the stretch zone; a second "you" crosses whole |
| 16 | the giant hole | pull back | the end | the camera drifts back; NO WAY BACK |

## One visual language
| Thing | State | Look (one per state) |
|---|---|---|
| The hole | always | black shadow, lensed orange disk, bent stars (ray-traced) |
| The edge | named / shown | cyan ring on the shadow's rim; cyan means only the edge |
| Light | travelling | white-blue glowing rays and pulses |
| Gravity's stretch | acting | violet: pull arrows and the stretch zone |
| Gas | swirling / hot | orange points spiralling in / white-hot inner disk, sparks |
| You | as you see yourself / as your friend sees you | white suit, YOU sticker / red, dim, fading |
| Time | ticking / slowing | white dial / red dial whose ticks slow and stop |
| Cards | must be read | centred cards, never pins beside a subject (lightsaber lesson) |

## Production log
- Research: subagent report (NASA, ESO, Hamilton/JILA, Baez/UCR); fact-check by a fresh agent: reworded lines 3 ("Some
  black holes"), 7 ("gas near it can glow"), 11 ("seem to slow down"), 12 ("seem to stop... fade away fast"), 13
  (dropped "you feel normal", which contradicted the stretching), 14 ("like this one"); made the main hole a small one.
- Pictures: fresh brainstorm agent -> separate picker agent (device: one toy astronaut "you" plus matching clocks).
- VO: 16 lines, CPU, ~7 min. ASR misheard "it can't" as "you can't" in the joined VO (line alone: "it can't");
  fixed in words.json by `film/fix_words.py`.
- Black hole shader: 7.7 s/frame at full size on the CPU; traced at half size into a render target (quarter of the
  pixels) and upscaled: ~2.5 s/frame.
- Boards: v1 (hole too close, disk blown out, rays/gas invisible, square flash sprite, visor hidden), v2 (hole at half
  scale, exposure down; fall shots lost the astronaut), v3/v4 (camera keys placed from the astronaut's real position,
  friend's ship in view, star exposure, giant-hole framing, fill light on the astronaut).

## Caption credits
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS). Original 3D models;
black hole simulated in code (not a photo). Sources: NASA Science, ESO/EHT, Andrew Hamilton (JILA), John Baez (UCR).

## Outstanding corrections
None yet (no review by design).

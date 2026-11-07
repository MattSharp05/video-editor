# Volcano 01: benchmark notes (unattended run, 2026-11-07)

Matthew: "just make the whole thing don't ask for my approval. Make them interesting, entertaining, informative, 3rd
grade reading level." Topic: why some volcanoes explode while others ooze. Second unattended run after Lightsaber 01,
this time with its lessons and tooling to start from. These are Claude's notes for the reflect step; nothing in the
skills was changed; each item is a proposal.

## Result
RESULT_LINE

## Time (machine clock, UTC)
- 04:35 start: read CLAUDE.md, profiles, lab notes, the skills, the lightsaber benchmark.
- 04:37-04:55 research subagent (USGS/NPS, 2 min), script + hooks (checker clean, grade 2.8), fresh fact-check
  (7 rewordings), terrain data (USGS 3DEP via AWS tiles + USGS imagery), pre-1980 St. Helens reconstruction.
- 04:47-04:52 voice: 15 lines on CPU (~25 s each), one line regenerated for clarity; brainstorm + picker agents ran in
  parallel with this.
- 04:52-05:12 film source written, 6 rounds of stills (each round 1-2 min), mix.
- 05:12 first full render started; 05:45 stopped after 3 chunks: frames showed the bottle's neck (the pipe) missing
  everywhere (a profile-slicing bug) and a 10 s hold at 10-20 s. Fixed, render restarted 05:48.
- TIMES_TAIL

## What the skills did well
- **The fact-checker earned its keep again**: 7 of 25 sentences reworded, two of them real errors as worded: "like cold
  honey" (dacite is millions of times stiffer; now peanut butter) and "all that trapped gas burst out at once" (the
  eruption ran 9 hours). The ending changed from "It explodes" to "It can blow its top" (gas-poor sticky magma builds
  domes instead).
- **Brainstorm + separate picker** turned a list of good analogies into one world: the picker rejected a kitchen soda
  world and, importantly, a pipe forking to both volcanoes ("teaches something false: they are fed separately"). The
  glass soda-bottle outline inside the cut-open volcano (cap = summit) came from combining two ideas.
- **The terrain kit approach** (public DEM + USGS imagery + baked light) gave the two most striking shots for almost
  no modelling: the snow-capped pre-1980 cone and today's horseshoe crater under a wireframe ghost of the old summit.
  Reconstructing the pre-1980 summit from the surviving flanks took ~15 lines of numpy.
- **Stills before the render** caught ~15 problems: clipping planes in world space (St. Helens never opened), custom
  shaders vs the logarithmic depth buffer (clouds painted over rock), linear colours in a ShaderMaterial (ash nearly
  black), the camera parked inside the magma, the 1980 blast framed without the mountain (three rounds), the camera
  flying through a block that was healing shut.
- **Checking each finished chunk as a strip during the render** caught the missing bottle neck after 3 of 8 chunks;
  stopping and restarting cost 33 min instead of ~60 min of partial re-renders afterwards.

## What broke or was missing (proposals)
1. **Clipping planes are world-space.** A cutaway helper in the terrain kit (clip + cut-face strip from the profile)
   would have saved two rounds; the kit has no cutaway today.
2. **ShaderMaterial gotchas belong in `three.md`:** custom shaders must include the log-depth chunks when the canvas
   uses `logarithmicDepthBuffer` (or turn it off when the scene's depth range allows), and they get no colour-space
   conversion (author colours in output space or add `colorspace_fragment`).
3. **Read 6-frame strips of every chunk as it lands**, not only the final cut: it found the neck bug mid-render. Worth
   a line in `review.md` next to "stills before renders".
4. **Framing math for 9:16**: the horizontal half-FOV is only ~0.56 x the vertical one; three rounds of the 1980 shot
   put the summit off-screen sideways. A helper that projects named points and warns when one leaves the safe area
   (the overlay projector already exists in Film.tsx) would catch it in the stills script.
5. **Voice pace**: design-m2 ran 2.65 words/s on this 3rd-grade script (short sentences = more pauses), slower than the
   profile's 2.8; 201 words gave 75.9 s. For a 60-70 s target, draft ~170-185 words at this reading level.
6. **ASR vs TTS ambiguity**: "the stuff glass is" transcribed as "the stuffed glass" twice; rewording to "the stuff
   that glass is" fixed both the ASR and, likely, the listener. Cheap rule: transcribe each line alone and reword any
   line ASR mishears twice.
7. **motion_check still needs a bar film** that cloud sessions don't keep (same as Lightsaber proposal 2):
   `film/motion_readout.py` compares against the recorded bar numbers instead.

## Skipped by instruction or environment (say so in delivery)
Concept and pictures approval, key-frame board approval, voice choice (design-m2 by default), Sound Picker picks
(effects chosen by measurement from the CC0 library plus synthesized rumbles), the bar film for motion_check (recorded
numbers used), and listening (Claude can't hear).

## Moments Matthew should listen to
LISTEN

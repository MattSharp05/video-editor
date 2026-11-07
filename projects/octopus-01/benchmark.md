# Octopus 01: benchmark notes (unattended run, 2026-11-07)

Matthew: "just make the whole thing don't ask for my approval. Make them interesting, entertaining, informative, 3rd
grade reading level." Topic: how an octopus turns invisible. Claude's notes for the reflect step: what worked, what
broke, what each skill is missing. Nothing here changes the skills; each item is a proposal.

## Result
`film/out/octopus-01_final.mp4` (git-ignored; delivered through the session). See "Final numbers" below.

## Time (machine clock, UTC; the container restarted once mid-render)
- 04:40-05:00 read the skills/profiles/lightsaber run; research agent, script, three hooks, checker runs, fact-check
  agent, brainstorm agent, picker agent; voice venv + model download in parallel.
- 04:58-05:05 voiceover (14 lines, ~25 s each on CPU) while the film shell was written.
- 05:05-05:13 stills board: three fix rounds + joint QA.
- 05:13-06:28 full render in 300-frame chunks (reef ~3.3 s/frame, skin world ~1 s/frame); the container restarted
  at ~05:50 with 5/8 chunks on disk; render_chunks.sh resumed from them (skips finished chunks) at 06:07.
- 06:28-07:15 review of the render as strips, motion readout, mute test, three partial re-renders + splices, delivery.

## What worked
- The lightsaber tooling reused as is: render_chunks.sh (and its skip-what-exists resume saved ~50 min after the
  container restart), fix_render.sh pattern, align.py with the ffmpeg decode fix, mix.py/measure.py, gen_vo/assemble.
- Fact-check agent made five real rewordings (0.2 s is the fastest case, not the usual speed; sac colours are not
  only yellow/red/brown; iridophores make blue/green, not white; "can't see color at all" too strong; the skin test
  used skin cut off in a dish).
- Brainstorm + picker produced the film's best ideas (the fish resting on the "rock", blinks as the unit of time,
  the empty slot in the line of sacs that the camera later drops through, the dish of skin with a slow stopwatch,
  rocks that open eyes).
- One shader idea carried the whole film: the octopus's "hidden" pattern copies the reef rock's own colour function
  (`REEF_COLOR` in both shaders), so the camouflage is genuinely seamless from above.
- Reviewing each 300-frame chunk as a 3 fps strip while the next chunk rendered found every problem the stills
  missed (camera through a coral, a dark pass under a muscle spoke, a ring that stayed on screen).
- Joint check (three-mesh-bvh) on mount: arms, web and eyes vs the body; it never fired, and the QA views agree.

## What broke or was missing (proposals)
1. **Back-face winding on hand-built tubes.** The arms rendered as thin dark blades for two rounds because the
   triangle winding was inverted (FrontSide culled the outside). Proposal for `three.md`: after building any custom
   geometry, render it once with `side: FrontSide` from outside and check `normal · (vertex - centre) > 0`.
2. **A component that sets `scene.background` in `useMemo` overrides the per-frame value on the first frame** of every
   still/chunk (the skin world showed the reef's blue). Rule: only the scene shell sets scene-wide state, per frame.
3. **Uniform name clashes in chained `onBeforeCompile` patches** (`uTime` in both the skin and the water kit: GLSL
   redefinition + `Object.assign` overwriting). Proposal: prefix uniforms per patch.
4. **motion_check still needs a bar film the cloud doesn't have.** Wrote `film/mc_readout.py` (readout only) and
   compared with the recorded medians (Grand Canyon 11, Lightsaber 20). Same proposal as lightsaber: commit bar
   readouts as JSON.
5. **Stills miss what the camera passes through between keys.** The dish move went through a brain coral and then a
   branching coral; neither key frame showed it. Proposal: for each camera segment render 3 in-between stills, or
   check the camera path against prop bounding spheres in code.
6. **The container can restart mid-render.** Chunked renders with skip-existing made it cheap; keep the rule.
7. The profile still says "ask per video" for the voice; unattended runs need a default (as lightsaber noted).

## Skipped by instruction or environment (say so in delivery)
Concept and pictures approval, board approval, style pick (given), voice choice (given), Sound Picker picks (sounds
chosen by measurement), the bar film for motion_check (recorded numbers used), and listening (Claude can't hear).

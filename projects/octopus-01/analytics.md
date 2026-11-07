# Octopus 01: production analytics (unattended run, 2026-11-07)

Measured from the session transcript with `film/analytics.py` (phase starts = git commit times), not from memory.
Render times from the render logs. Machine clock, UTC.

## Totals
- Wall time, topic to delivery: **3 h 13 min** (04:40:24 -> 07:53:30). No time waiting on the user (no approval stops).
- Claude output tokens: **176 k** (main) + **37 k** (5 subagents) = **213 k**.
- Input: 63.4 M cache reads + 0.43 M cache writes + ~400 fresh (main); 3.2 M input across subagents.
- 179 responses, 170 tool calls, 46 file edits, 18 still batches, 25 images reviewed, 5 subagents.
- Render compute: **~2 h 12 min of the 3 h 13 min (68%)**.

## Per phase
| Phase | Clock | Minutes | Output tok | Cache reads | Tools | What it was |
|---|---|---|---|---|---|---|
| Script | 04:40-04:54 | 13 | 72 k (+33 k agents) | 12.4 M | 60 | read skills, research / fact-check / brainstorm / picker agents, hooks, script checks, venv + music |
| Build | 04:54-05:13 | 20 | 62 k | 13.9 M | 39 | VO (14 lines, CPU, ran in parallel), octopus + reef + skin code, 11 still batches, joint QA |
| Full render | 05:13-06:29 | 76 | 16 k | 16.9 M | 32 | chunked render + reviewing each chunk as a strip; container restart ~05:50, resumed 06:07 |
| Fixes + delivery | 06:29-07:53 | 85 | 25 k (+4 k agent) | 20.2 M | 39 | motion readout, mute test, 5 partial re-renders + splices, loudness, share copy, notes |

## Where the render time went
| Render | Frames | Minutes | Note |
|---|---|---|---|
| v1 full (8 chunks of 300) | 2187 | ~58 | reef ~3.3 s/frame, skin world ~1 s/frame (4 cores, SwiftShader) |
| lost to container restart | - | ~17 | idle until restart noticed; 5 chunks on disk survived, resume skipped them |
| v2 skin 13-36 s | 691 | 11 | fixes found by watching chunk strips |
| v3/v4 (dish, ending) | - | ~3 | aborted: the mute test found more, so all fixes were batched into v5 |
| v5 four ranges | 1489 | 60 | mute-test fixes (cards, wider hook, dish, ending) |

## Errors and rewrites to avoid next time (ranked by time lost)
1. **Mute test ran after the full render (~60 min of re-render).** All its fixes were cards, a wider opening and a
   payoff size: things a mute test on the stills board would have caught before rendering. Rule: run the mute test on
   the board (stills every ~1.5 s, caption band blacked out) BEFORE the first full render; re-run on the final.
2. **Camera flew through props between keys (dish move: a brain coral, then a branching coral; ~25 min incl. an
   aborted re-render).** Key stills looked fine; the path between them didn't. Rule: render 3 in-between stills per
   camera segment, or test the path against prop bounding spheres in code before rendering.
3. **Container restart mid-render (~17 min).** Chunked render with skip-existing saved ~50 min. Keep chunking; commit
   often; check the log as soon as a session resumes.
4. **Arm triangle winding inverted (2 board rounds).** Arms looked like thin dark blades because FrontSide culled the
   outside; found only by printing the arm curve numerically. Rule: after building custom geometry, check
   `dot(faceNormal, vertex - centreLine) > 0` in code once.
5. **Hero line-up unreadable (1 re-render range).** Stills were taken mid-beat, not at the moment of the claim. Rule:
   take a still at each claim's key word time (beats.json), not at round seconds.
6. **Scaffold copied incompletely (2 failed still runs):** `src/index.ts` and `public/fonts/` missing; the realism kit's
   `.ts` import suffixes failed tsc. Rule: copy a template folder whole, then run `tsc` and one still before writing code.
7. **Shader patch collisions (1 round):** two `onBeforeCompile` patches both declared `uTime`, and a replaced line lost
   its `vec4 diffuseColor` declaration. Rule: prefix each patch's uniforms (`uSkT`), keep the declaration when
   replacing three's chunks.
8. **A child component set `scene.background` in useMemo**, overriding the shell's per-frame value on the first frame
   of every still/chunk (skin world showed blue). Rule: only the scene shell sets scene-wide state, every frame.
9. **Chromatophore cells too sparse (1 round):** Worley distances run larger than assumed (jittered features reach
   ~0.85), so "open" sacs never touched. Check a shader's coverage numerically, not by eye.
10. Tooling friction: `sleep` in Bash is blocked (use a background `until` loop), the Monitor tool needs its schema
    loaded first, motion_check needs a bar film the cloud doesn't have (wrote `film/mc_readout.py`).

## What was cheap and worth keeping
- Subagents for research, fact-check, brainstorm and picker: 37 k output tokens total, ~5 min wall time in parallel,
  and the fact-check changed five lines.
- VO generated in the background while the film code was written (~6 min, no wall-time cost).
- Reviewing each finished chunk as a 3 fps strip while the next rendered: found every v2 issue at no extra wall time.
- Partial re-render + splice: 5 fixes for ~71 min of render instead of 2-3 more full renders (~60 min each).

## If the same film were made again with these rules
Estimated ~2 h instead of 3 h 13 min: board mute test before rendering (-60 min), path checks (-25 min), no restart
(-17 min), scaffold and winding checks (-10 min of rounds).

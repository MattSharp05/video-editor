# Volcano 01: production analytics (measured from the session transcript)

Measured with `film/analytics.py` on the session transcript (`~/.claude/projects/<slug>/913b9535-....jsonl`), phase
starts taken from the transcript's own tool-call timestamps. Topic in 04:40:30 UTC, files delivered 08:59:47 UTC,
2026-11-07: **4 h 19 min wall time**, unattended (no waits on Matthew).

## Per phase
| Phase | Wall | Responses | Tool calls | Output tokens | Cache reads | Subagents (out / in) | What happened |
|---|---|---|---|---|---|---|---|
| Research + script | 4 min | 33 | 39 | 19.8 k | 5.7 M | research (7.4 k / 0.93 M) | read skills/profiles, research agent, script, hooks, terrain fetch |
| Pictures + voice | 11 min | 27 | 31 | 61.3 k | 7.0 M | fact-check, brainstorm, picker (17.5 k / 0.58 M) | 15 VO lines on CPU, brief, world.tsx + Film.tsx written |
| Build + stills | 17 min | 30 | 29 | 36.4 k | 10.2 M | - | 9 still rounds, mix |
| Full render (v1) | 149 min | 56 | 58 | 20.3 k | 22.5 M | - | 2,285 frames; stopped twice (neck bug, hidden bubbles), one orphan process |
| Fixes + mute test (v2, v3) | 66 min | 30 | 30 | 19.5 k | 13.7 M | mute judge (3.6 k / 0.38 M) | 2 partial re-renders (800 + 650 frames) |
| Delivery | 12 min | 6 | 6 | 4.9 k | 2.9 M | - | final checks, share copy, benchmark, send |
| **Total** | **259 min** | **182** | **193** | **162 k** | **62 M** | **5 agents: 28.5 k / 1.9 M** | |

Cache writes 418 k, fresh (uncached) input ~0.4 k: ~99.3% of main-session input was cache reads.

## Where the wall time went
| | Minutes | Share |
|---|---|---|
| Blocked on renders (full render + 2 partial passes, incl. restarts) | 209 | 81% |
| Stills rounds (12 batches) | 14.5 | 6% |
| Other tools (VO generation, data fetch/bake, mix, ffmpeg) | 9.7 | 4% |
| Claude thinking and writing | ~26 | 10% |

Render speed: 2.1-2.3 s/frame on 4 CPU cores (Lightsaber 01: 1.6; Grand Canyon 01: ~0.9 before the look pass).

## Time lost (about 60 min, all render time)
| Cause | Lost | Avoid next time |
|---|---|---|
| Bottle neck missing in every interior shot (profile `slice(0,-4)` also dropped the neck point); render stopped after 3 chunks | ~33 min | the stills showed it (a "jar" with no pipe) and Claude didn't check the shape against the design; read each asset against its spec in stills |
| Orphaned render process (old source) kept running after the stop, at full CPU | ~11 min, plus a risk of stale frames | kill the whole tree (`render_chunks`, `remotion render`, compositor, chrome) and check `ps` for ppid 1 before restarting |
| Bubbles (the lead) hidden behind the magma as the camera moved; stills were fine | ~15 min | solid volumes opaque; lead objects get an explicit `renderOrder` |
| Mute test found 5 unreadable beats after the full render (v3 pass) | 30 min | run the mute test on the board stills with captions blacked out, before the full render |

A pipeline with none of these: ~80 min render + one 30 min fix pass, about **2 h 45 min** topic to delivery.

## Tool errors (5)
`check_script.py` exit 1 twice (flags, by design), scipy missing in system Python (used `uv run --with scipy`), numpy
float32 not JSON-serialisable, ffmpeg two-pass `-passlogfile` placed after the output. None cost more than a minute.

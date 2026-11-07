# Black hole 01: production analytics

Measured from the session transcript with `film/analytics.py` (machine clock, UTC), not from memory.
Phases: Script 04:40, Build 04:52 (VO started), Render v1 + review 05:10, Render v2 + delivery 06:26, end 07:44.

| Phase | Wall (min) | Responses | Tool calls | Edits | Still batches | Images read | Output tokens | Cache reads | Cache writes |
|---|---|---|---|---|---|---|---|---|---|
| Script (research, hooks, fact-check, pictures, shader test) | 11.8 | 36 | 40 | 4 | 2 | 1 | 42.1 k | 6.45 M | 189 k |
| Build (VO, world + film code, 4 still boards) | 18.7 | 25 | 31 | 13 | 6 | 9 | 53.3 k | 7.35 M | 79 k |
| Render v1 + review (motion, mute test, fixes) | 75.3 | 43 | 51 | 9 | 6 | 11 | 33.7 k | 15.41 M | 65 k |
| Render v2 + delivery | 78.0 | 23 | 23 | 3 | 0 | 6 | 9.6 k | 9.32 M | 17 k |
| **Total** | **183.8** | **127** | **145** | **29** | **14** | **27** | **138.7 k** | **38.5 M** | **350 k** |

Uncached input: ~250 tokens (99.1 % of input was cache reads).
Subagents (5: research, fact-check, brainstorm, picker, mute-test judge): 26.9 k output, 1.69 M input.

Wall time split: render waits ~137 min (v1 68 min, v2 68.5 min, 2,177 frames each at ~1.9 s/frame); Claude working
~47 min; waiting on the user 0 (unattended). The voice (16 lines, ~8 min CPU) ran while the film code was written.

Compared with: Grand Canyon 01 (77 s): 96 min, 118 k output, 33 M input; Lightsaber 01: ~2 h 15 min.
Where the next film saves time: v2 was a full re-render because fixes touched every section; rendering from a frozen
bundle would let fixes start while v1 renders, and catching the mute-test issues on stills (an animatic judge) would
have saved most of v2's 68 min.

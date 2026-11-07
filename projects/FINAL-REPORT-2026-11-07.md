# Three videos: final report (2026-11-07)

Unattended run: research, scripts, pictures, voice, animation, sound, checks and delivery, with no approval from Matthew.
Nothing was posted or uploaded. Each MP4 is git-ignored and was delivered from the session that built it (open that
session to download it).

## The videos

| | Lactate in running | How the Vegas Sphere works | How AI makes an image |
|---|---|---|---|
| Final file | `lactate-run-01/renders/lactate-run-01_v1.1.mp4` | `vegas-sphere-01/renders/vegas-sphere-01_v1.1.mp4` | `ai-image-01/renders/ai-image-01_v1.mp4` |
| Session | Video: lactate in running | Video: how the Vegas Sphere works | Video: how AI makes an image |
| Length | 55.3 s (1657 frames) | 50.2 s (1507 frames) | 49.9 s (1497 frames) |
| Script | 149 words, grade 3.3 | 143 words, grade 3.4 | 139 words, grade 3.3 |
| Loudness / peak | -14.1 LUFS / -2.2 dBTP | -14.2 LUFS / -2.1 dBTP | -14.0 LUFS / -1.9 dBTP |
| Music under voice (measured) | ~12 dB | 10.5 dB | 10.5 dB |
| Motion check vs Grand Canyon 01 | pass: movers 26 vs 20; 2 defensible seconds (41, 50) | **fail on movers** (12 vs 18), but more change than the bar; 1 defensible second (31) | pass: movers 20 vs 18; 1 defensible second (46) |
| Mute test | run on v1, misses fixed in v1.1 (not re-judged) | run on v1: 9/17 claims, 4 partial, 3 missed; fixed; a 2nd judge on the fixed shots recovered most | run: 3 misses, 2 fixed |
| Look | glass-body runner on a dusk track; camera moves in and out through the thigh; sugar cube with a face, amber lanterns, acid sprites | dusk Strip; a rabbit-ear TV inflates into the Sphere; dive into the pucks; giant eye; fly inside the dome | a phone collage stamped MYTH, prompt typed and sent as a paper plane, number tapes, CRT static cleaned step by step, wall of training TVs, corridor home |

All three: 1080×1920 at 30 fps, one continuous shot (no cuts), drawn in code (Remotion, canvas/SVG/WebGL).
- **Voice:** AI (Qwen3-TTS clone of your design-m2 pick); every line matches the script.
- **Music:** "Floating Cities" by Kevin MacLeod (CC BY 4.0).
- **Sound effects:** CC0 or synthesized only.
- **Art:** no logos or brands.
- **Captions:** a draft Instagram caption with caveats and credits is in each `REPORT.md`.

## Time (machine clock, UTC)

| Step | When | Duration |
|---|---|---|
| Review repos and skills, start voice model install | 14:00–14:03 | 3 min |
| Research (3 agents), scripts, fact-check (1 agent), rewrites | 14:03–14:12 | 9 min |
| Picture brainstorm (3 agents) and picks (3 agents), builder brief | 14:05–14:15 | 10 min (overlapping) |
| Builders as in-session agents (stopped when you asked for sessions) | 14:13–14:15 | 2 min, discarded |
| Three cloud sessions build in parallel | 14:16 → | |
| AI image v1 delivered | 15:45 | 89 min after its start |
| Sphere v1 delivered | 16:08 | 112 min |
| Lactate v1 delivered | 16:45 | 149 min |
| v1.1 fixes after the mute test (lactate 17:07, Sphere 17:09) | 16:46–17:09 | 23 min |
| **Total, start to last delivery** | 14:00–17:10 | **3 h 10 min** |

About half of each session's time was spent waiting on renders, not on Claude working. The biggest wait was re-rendering
Grand Canyon 01 as the motion-check bar: 75–88 min per session, and it hit lactate's 60-min background limit.

## Tokens (from each session's usage counter)

| Session | Output | Fresh input | Cache read | Cache write | List cost |
|---|---|---|---|---|---|
| Orchestrator (this one, incl. its research/brainstorm/pick/fact-check agents) | 304,507 | 1,403,161 | 40.0 M | 1.15 M | $19.36 |
| Lactate | 156,292 | 4,830 | 38.5 M | 0.42 M | $13.92 |
| Vegas Sphere | ~138,300 (its own analytics, incl. v1.1) | 203 | 25.1 M+ | 0.24 M+ | $9.26+ (counter not yet updated for v1.1) |
| AI image | 134,963 | 4,833 | 37.0 M | 0.37 M | $12.79 |
| **Total** | **~734,000** | **1.41 M** | **~141 M** | **~2.2 M** | **~$55–58** |

The orchestrator's subagents reported these totals: research 306 k, brainstorms 254 k, picks 327 k, fact-check 110 k
(about 1.0 M, mostly input).

## Errors, rewrites and changes of plan

**Orchestrator**
- The profile-link setup script (`scripts/setup.sh`) was denied by the auto-mode permission check, so I read the profiles from `profiles/` directly.
- Renders aren't kept in git, so the motion-check bar film had to be re-rendered every time. This was the slowest part of the run.
- The stop hook kept warning that the branch wasn't pushed. The cause was the shallow clone's single-branch fetch refspec; I added the branch's refspec.
- **Change of plan:** I first started the three builders as background agents inside this session. You said you expected one session per video, so I stopped them about 2 minutes in (they had only copied templates) and started three cloud sessions instead. A side effect: each film got its own machine.
- **Script rewrites:**
  - Length cuts to stay under 60 s: AI image 165 → 139 words, lactate 162 → 145, Sphere 162 → 143.
  - Fact-check, lactate: the hook no longer claims lactate makes legs burn; "burn it all the way" → "almost all of it"; "it spills" → "some spills"; the burn comes from acid and leftovers together; "because" → "one big reason"; "backup fuel" → "fuel".
  - Fact-check, Sphere: the Statue of Liberty line was cut (only the Sphere's own claim); "a million lights" → "dots" (there are about 58 M LEDs).
  - **AI image hook:** "AI paints one dot at a time" was dropped because GPT-4o really does build images piece by piece. It became "Most people think AI glues together bits of real photos" ("most" → "many"; "computers can't read words" → "the AI can't use words directly").
- Lactate and AI image went idle while their bar renders ran, so I nudged both to keep going without stopping. After v1, I sent the Sphere and lactate sessions back for the mute test they had skipped.

**Builder sessions (full lists in each REPORT.md)**
- **All three:** `faster-whisper` crashed on a PyAV API change, and whisper on the whole joined voiceover invented words. All three switched to aligning line by line, which then matched the script exactly.
- **AI image and Sphere:** `ffmpeg -shortest` cut 4 frames at the mux; fixed with padded audio.
- **AI image:**
  - Stills fixes: see-through noise sheets, a new noise schedule, re-centred room shots, a smooth desk-to-room pass.
  - Motion fixes: a crane over the typing, a push-in on the CRT, a corridor redesign.
  - Mute-test fixes: a MYTH stamp and a bigger honesty tag.
- **Sphere:**
  - A stale-canvas bug (the tourist's phone stayed on screen to the end).
  - Pops at world changes, now faded.
  - A non-monotonic interpolation crash.
  - A splice that silently didn't apply.
  - It rendered its final alongside the bar render, against the one-heavy-job rule.
- **Lactate:**
  - The drop and the flag text were invisible (colour passed as an array), and several objects sat out of frame.
  - The bar render was stopped at the 60-min limit, so a 20 s slice became the bar.
  - Two motion redesigns (threshold run, ending).
  - A brightness spike at frame 728 (a zoom counted twice).
  - Mute-test fixes: "SUGAR", "LACTATE" and "ACID" printed on the key objects, faces on the engines.

## Open issues (for you)

1. **Nobody listened to any mix.** Every audio check was a measurement; each REPORT.md lists the moments to listen to.
2. **Sphere:** still fails the motion check on movers (the close-ups are one big puck field moving as a whole). Muted viewers still miss why it opens on a TV, the antenna gag, and the building's size.
3. **Lactate:** the mute-test fixes were checked in stills only; no second mute round was run.
4. **AI image:** muted viewers can't tell the wall of TVs is training (40–43 s), and repeated photos show on a paused frame.
5. The music is the same track (your pick) in all three. The profile says music "depends on the video", so you may want a picker round.

## Suggested lessons (not yet applied to skills or profiles)
- Keep a quarter-scale bar MP4 somewhere persistent (or a small committed exception). Re-rendering it cost about 75–90 min of each session.
- Make `vo/assemble.py` align line by line. All three sessions had to rewrite it the same way.

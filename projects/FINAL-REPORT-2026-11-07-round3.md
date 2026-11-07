# Round 3: "The Stolen Smile", a 3-part true-crime series (2026-11-07)

The 1911 theft of the Mona Lisa, in three animated Reels of about 80 s each, with continuity across the parts. It ran
unattended: story choice, research, scripts, fact-check, pictures, a shared kit, voice, animation, sound, checks,
fixes and delivery. Nothing was posted or uploaded. Each MP4 is git-ignored and was delivered from the session that
built it; the v1.1 files are the finals.

## The series

| | Part 1: The vanishing | Part 2: The hunt | Part 3: The return |
|---|---|---|---|
| Final file | `stolen-smile-1/renders/stolen-smile-1_v1.1.mp4` | `stolen-smile-2/renders/stolen-smile-2_v1.1.mp4` | `stolen-smile-3/renders/stolen-smile-3_v1.1.mp4` |
| Session | Series: The Stolen Smile, part 1 | … part 2 | … part 3 |
| Length | 81.8 s | 78.4 s | 81.3 s |
| Script | 229 words, grade 2.4 | 216 words, grade 3.8 | 226 words, grade 3.1 |
| Loudness / peak | -14.0 LUFS / -3.6 dBTP | -13.9 / -3.8 | -14.2 / -1.8 |
| Motion check (v1.1) | pass, 19 vs 18 | pass, 18.5 vs 18.5 | pass, 20 vs 18 |
| Mute test | judge 1 missed 5 → fixed → judge 2 all | judge 1 missed 3 → fixed → judge 2 all (not re-run for v1.1) | judge 1 missed 6 → fixed → judge 2 all |
| Story | Monday at the closed Louvre. Vincenzo, who helped make her glass box, lifts her off four iron hooks; frame and glass are left on the back stairs; a plumber opens the locked door; a painter finds four empty hooks. Ends: "Next: the hunt" | "Last time…" recap. Closed for a week; the world learns her name; crowds stare at an empty wall (Kafka among them); the poet jailed and Picasso questioned and let go; a thumbprint the files can't match; police search his room and miss her; a spider webs the empty hooks; a letter signed "Leonardo". Ends: "Next: the return" | "Last time…" recap. Alfredo poses as a buyer; room 20; the white trunk, false bottom, red silk; cracks and stamp checked; the arrest; "she belonged in Italy" (but Leonardo brought her to France himself); Italy shows her off; back in Paris, January 1914; ~7 months in jail; millions a year. Ends: "The end" hanging from the four hooks |

**Shared by all three:**
- **Look:** a paper toy theatre "printed in 1911", with one palette whose colours each mean something. Amber marks where she is; red is for clues only.
- **The painting:** the real public-domain Mona Lisa (Wikimedia Commons C2RMF reproduction), never redrawn.
- **Kit:** one cast, set list and card set built for the series. All three use the same corner tab ("The Stolen Smile · Part N of 3"), title plaque, "Last time…" card and end-card position.
- **Recurring devices:** the four hooks (counted, then empty, then cobwebbed, then hung again), what hides her (smock → trunk → red silk), a red "?" that becomes "!", and a "Who knows her?" gauge.
- **Sound:** the series sounds, the same AI voice (design-m2, seed 7, every line matching the script), and "Floating Cities" (CC BY 4.0).
- **Captions:** draft Instagram captions with fact-check caveats are in each REPORT.md and in `stolen-smile-kit/factcheck.md`.

## How it ran (UTC)

| Step | When |
|---|---|
| Template lessons from round 2; story research (Mona Lisa chosen over Gardner, D.B. Cooper, Antwerp) | 20:18–20:24 |
| Scripts, series brief, fact-check, series brainstorm | 20:24–20:30 |
| Part sessions start (VO, plan) | 20:30 |
| Series pick (look, devices, cast, beat sheets) → kit session starts | 20:37 |
| Kit READY (20 min) | 20:57 |
| v1 delivered: part 2, part 1, part 3 | 21:31 / 21:44 / 21:53 |
| Continuity judge on v1: 7/10 → fix lists to all parts | 21:53–22:00 |
| v1.1 delivered: part 1, part 3, part 2 | 22:10 / 22:16 / 22:45 |
| Continuity re-judge on v1.1: **8.5/10**, nothing blocking | 22:46–22:5x |
| **Total, start to finals** | **20:18–22:46, 2 h 28 min** (v1 of all three by 1 h 35 min) |

## Tokens (session usage counters)

| Session | Output | Cache read | Cost (list) |
|---|---|---|---|
| Orchestrator, round-3 share (incl. research, fact-check, brainstorm, pick, 2 continuity judges) | ~263,000 | ~48 M | ~$18.0 |
| Kit | 125,013 | 9.6 M | $7.94 |
| Part 1 | 203,753 | 69.5 M | $22.01 |
| Part 2 | 207,259 | 56.9 M | $19.81 |
| Part 3 | 181,832 | 51.0 M | $18.31 |
| **Round 3 total** | **~981,000** | **~235 M** | **~$86** |

The orchestrator's cumulative totals across all three rounds: 786,741 output tokens and $54.13. Round-3 subagents
reported these totals: research 137 k, fact-check 128 k, brainstorm 108 k, pick 147 k, continuity judges 188 k + the re-judge.
Round 3 cost more than round 2 (~$45) because each part is longer (~80 s vs ~52 s), there is a fifth (kit) session, and
there was a v1.1 continuity pass.

## Errors, rewrites and decisions

**Orchestrator**
- **Story choice:** Gardner and D.B. Cooper were dropped as unsolved (Cooper also has a bomb threat on a plane). Antwerp was dropped because it rests on one man's disputed account and its victims are private.
- **Scripts:**
  - Parts 2 and 3 were extended with sourced details (songs and postcards, Kafka at the empty wall, how police sorted their files, the pretend buyer, 100,000+ visitors in two days) to reach about 80 s.
- **Fact-check (nothing false):**
  - Kafka → "who later became a famous writer".
  - "Secretly brings a museum expert" → "brings a museum expert… to check it".
  - The money demand is now Alfredo's account.
  - "Body size" → "body measurements".
  - "Files can't match it" → "police never match it to him".
  - "Everyone knows her name" → "people all over the world".
  - "Famous poet" → "well-known poet".
  - The motive is "he said", not "he thought".
  - "Wraps her in his smock" → "in his white work clothes".
  - "Signs it with the painter's name, Leonardo".
  - Added "and a French king bought her".
- **Starting order:** part sessions started before the pick and kit (VO and planning in parallel). The kit was ready in 20 min.
- **Continuity judge on v1 (7/10):**
  - Part 2 had redrawn the staircase, cell and street.
  - Part 3's recap showed a spider web part 2 never had.
  - Her face was covered on a poster and squashed in part 1.
  - End cards sat in three different places, and in part 3 one lay over the painting.
  - Part 1 showed the bundle "under the bed", which the sources don't support.
  - There were red full-frame floods and labels over captions.

  All were fixed in v1.1 by sending each part its own fix list, with one shared end-card position (card top at y 560).
- The continuity report reached the branch only after the parts had pulled. They worked from my messages, which carried the full fix lists.

**Builder sessions (full lists in each REPORT.md)**
- **Kit:** `MonaLisa board="edge"` was documented but not implemented. Part 1 found it and drew the edge itself.
- **Part 1:**
  - A hard cut at frame 480, fixed with an iris and a partial re-render.
  - Motion fixes at seconds 3, 29 and 60.
  - Five mute misses fixed.
  - v1.1 used five partial re-renders, with the frame count checked after every splice.
- **Part 2:**
  - An ASR split of "well-known", fixed in `words.json`.
  - It drew its own sets in v1 (replaced in v1.1).
  - Motion was at 16 vs 18 in v1; 18.5 in v1.1 after more life and shorter pushes.
  - An inverted iris was fixed.
- **Part 3:**
  - A hidden cut at 4.57 s (recap → title), fixed.
  - Six mute misses fixed with printed words.
  - The red floods were replaced by paper washes of 8 frames or fewer.

## Open issues (polish; nothing blocks)
1. **Nobody has listened to any mix.** Each REPORT.md lists the moments to listen to.
2. **Empty frames:** blank or near-empty washes remain at P1 27 and 34, and P2 21, 29, 59 and 70.
3. **Part 2 street (18–20 s):** the kit's own postcard art still has red lanterns or a balloon (red should mean clues only).
4. **Part 2 poster (66 s):** a small amber blob sits on her chest. Part 2's "Some say" tag (54–55 s) is tiny.
5. **Part 1 title plaque:** arrives at 13–15 s; the brief asked for the first ~4 s. The corner tab is on from frame 0, so the series is named, but the plaque is late.
6. **Part 3 ending:** the last caption "in the world." lies over the bottom of the painting at 80 s.
7. **Part 2 mute test:** not re-run after v1.1. The events are the same, but the sets changed.
8. **Kit:** HonestyTag at y 1340 is partly covered by two-line captions, and `board="edge"` is unimplemented.

## Lessons for next time (not yet applied)
- Push the continuity report before messaging the sessions, or keep fix lists in the message (both worked this time).
- Have the kit session run a "kit-coverage" check, so parts can't silently redraw kit sets. A lint that flags part-made components whose names match kit exports would have caught part 2's staircase, cell and street.
- Put the title plaque's time in the pick's beat sheet as a number, not "first ~4 s".
- Run the continuity judge on one part's v1 as soon as it lands, not after all three, so the later parts avoid the same breaks.

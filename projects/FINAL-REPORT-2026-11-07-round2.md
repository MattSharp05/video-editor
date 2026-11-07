# Round 2: three more videos (2026-11-07), with round-1 improvements

Unattended again: topics, research, scripts, pictures, voice, animation, sound, checks and delivery, with no approval
from Matthew. Nothing was posted or uploaded. Each MP4 is git-ignored and was delivered from the session that built it.

## The videos

| | Why cats land on their feet | Noise-cancelling headphones | How a microwave heats food |
|---|---|---|---|
| File | `cat-landing-01/renders/cat-landing-01_v1.mp4` | `noise-cancel-01/renders/noise-cancel-01_v1.mp4` | `microwave-01/renders/microwave-01_v1.mp4` |
| Session | Video: why cats land on their feet | Video: noise-cancelling headphones | Video: how a microwave heats food |
| Length | 51.1 s | 52.5 s | 51.6 s |
| Script | 150 words, grade 1.4 | 142 words, grade 2.7 | 146 words, grade 3.4 |
| Loudness / peak | -14.1 LUFS / -2.2 dBTP | -14.0 / -2.0 | -13.9 / -1.8 |
| Motion check | pass, 20 vs 18 (1 deliberate hold) | pass, 18 vs 18, nothing flagged | pass, 18 vs 18 (1 crane second) |
| Mute test | judge 1: 8/11 → fixed → judge 2: all | judge 1 missed line 8 → fixed → judge 2: all | 2 judges; misses fixed |
| Story | Miso the tabby falls down a sunny kitchen wall; "myth?" tail rotor; a tailless Manx flips too; cockpit in her head; counter-turning rings; ½-second stopwatch; caring "never drop a cat" paw; loops | Plane cabin; the NOISE squiggle with eyes meets its upside-down COPY twin; air balls bunch and spread; the CHIP chef flips waves; pop = cancelled; the engine hum drops ~15 dB on the cancel; voices arrive TOO LATE | Spud the leftover potato; a blowtorch chef for the "inside out" MYTH?; waves bounce and squash at door holes too small for them; ~150 water molecules rock and BONK; the middle of thick food waits; hot-spot board, then the plate spins |

All three: 1080×1920 at 30 fps, one continuous shot, drawn in code.
- **Voice:** AI (your design-m2 clone); 11/11 lines matched, with no regenerations.
- **Music:** "Floating Cities" (CC BY 4.0).
- **Sound effects:** CC0 or synthesized.
- **Art:** no brands.
- **Captions:** a draft Instagram caption is in each `REPORT.md`.

## Round 1 → round 2

| | Round 1 (lactate, Sphere, AI image) | Round 2 (cat, headphones, microwave) |
|---|---|---|
| Start to last delivery | 3 h 10 min (14:00–17:10) | **57 min** (19:17–20:14) |
| Pre-production (research → picks) | 16 min | 13 min (sessions started before the picks landed) |
| Build sessions, start → delivered | 89 / 112 / 149 min, + 23 min v1.1 | **27 / 48 / 31 min** |
| Motion-bar re-render | 75–90 min per session (one hit the 60-min limit) | 0 (saved readout) |
| Voice alignment | crashed + hallucinated in all three; each session rewrote it | worked first time in all three (per-line aligner, pinned PyAV) |
| Mute test | 1 of 3 ran it; 2 skipped until sent back | all 3, each re-judged by a second fresh agent |
| Motion check | 1 failed (Sphere, 12 vs 18) | all 3 pass |
| Idle sessions needing a nudge | 2 | 0 (each messaged when done) |
| Script rewrites from the fact-check | hook rewritten (AI), 6 lactate/Sphere rewords | 10 rewords, nothing false |
| Cost (list) | ~$55–58 | ~$35 + headphones (see below) |

## Tokens (session usage counters)

| Session | Output | Cache read | Cost (list) |
|---|---|---|---|
| Orchestrator, round 2 share (delta since round 1's report; includes research ×3, fact-check, brainstorms ×3, picks ×3) | ~219,000 | ~34 M | ~$16.75 |
| Cat | 111,602 | 19.5 M | $8.88 |
| Microwave | 116,177 | 20.0 M | $8.66 |
| Headphones | not yet in its counter (it still reads 0 while its last turn closes) | | likely ~$9–12 by the other two |
| **Round 2 total** | **~447,000 + headphones** | | **~$34 + headphones** |

The orchestrator's cumulative totals across both rounds: 523,392 output tokens, 2.27 M fresh input, 74.5 M cache read, $36.11.
Round-2 subagents reported these totals: research 291 k, brainstorms 242 k, picks 298 k, fact-check 107 k.

## Errors, rewrites and decisions

**Orchestrator**
- **Motion bar:** I first asked the Sphere session to commit its bar MP4. It refused, rightly, citing the "don't commit renders" rule. Instead I changed `motion_check.py` to read a saved per-second readout (`lab/motion-bar/grand-canyon-01_q.json`, 2 KB, verified identical to the MP4 run). No video is in git.
- **Fact-check rewords:**
  - All three hooks: "Most people think" → "Lots of people think" (no source counts "most").
  - Cat: "each half turns on its own" → "a different way"; "front spins fast" → "turns a lot"; "spreads its legs to land softly" → "reaches its legs down and bends them".
  - Headphones: the music line → "The chip knows your music, because it's the one playing it. So it only flips the noise."; "Sudden sounds" → "Quick, changing sounds".
  - Microwave: "heats the outside first" → "heats the outer layer"; "plus end" → "plus side"; "the outside gets hot first" → "in thick food, the middle has to wait".
- **Length:** microwave trimmed 151 → 146 words, cat 160 → 146 → 150.

**Builder sessions (full lists in each REPORT.md)**
- **Cat:**
  - In stills, the cat was too small through the mechanism and a hand covered her face.
  - The motion check flagged 39 and 41 (fixed with dust, a tail swish and a head tilt).
  - Four mute misses were fixed.
  - The first full render was stopped for a late fix and re-rendered (99 s).
- **Headphones:**
  - `node --experimental-strip-types` couldn't import JSON (esbuild used instead).
  - A reversed range drew a giant note.
  - A label sat in the top safe zone.
  - Three motion redesigns.
  - A `-c copy` concat splice silently made a 271-frame file, caught by the frame-count check; the final is a clean full re-render.
- **Microwave:**
  - The template's `lib.ts` imports a `vo_env.json` that doesn't exist (removed).
  - The wave bracket ran off screen.
  - Four motion redesigns (11 → 18 movers).
  - Mute fixes for the door, "swings of what", molecules that read as mice, and the hot-spot board.
  - Two flicker pops.

## Open issues (for you)
1. **Nobody listened to any mix.** Each REPORT.md lists the moments to listen to. Headphones matters most: the film is about sound.
2. **Cat:** 2.5–5.5 s is busy (rotor, bubbles, Manx, tags).
3. **Headphones:** ~0.3 s of fine grain in the dive (8–9 s), and a small recap punch.
4. **Microwave:** muted viewers still only infer why + and − pull; the bead exit at 35.7 s is fast.
5. **Same music** in all six films (your pick). A picker round for a second track would help.
6. **Re-judged in stills only:** the last small mute-test notes in cat and microwave were checked in stills, not by a third judge.

## Lessons for the next round (not yet applied)
- Add "check the frame count after every splice" next to the `-shortest` note. The concat `-c copy` failure was new this round.
- Remove the `vo_env.json` import from the template's `lib.ts`, or ship the file.
- Starting sessions before the picks landed worked. Keep it.

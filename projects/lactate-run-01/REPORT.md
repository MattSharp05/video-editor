# Lactate run 01: v1.1 report

## Delivered
- **File:** `projects/lactate-run-01/renders/lactate-run-01_v1.1.mp4` (git-ignored; also delivered through the session). It supersedes v1 (`renders/lactate-run-01_v1.mp4`, kept).
- **Under-50 MB copy (2026-11-11, Matthew asked):** `renders/lactate-run-01_v1.1_50mb.mp4`, 47.2 MB. It is a two-pass x264 re-encode (preset slow, 6.6 Mb/s, faststart) with the audio copied untouched: 1657 frames, -14.1 LUFS, -2.2 dBTP. SSIM against the master is 0.983, and a crop of the busiest scene shows no visible difference.
- **v1.1 vs v1:** the mute-test fixes and the ribbon/flag fixes below, as one clean full re-render rather than a splice. The render includes the frame-728 zoom fix. It has the same 1657 frames, -14.1 LUFS, -2.2 dBTP and LRA 2.1, and the brightness flicker scan finds no one-frame spikes.
- **Format:** 1080×1920, 30 fps, H.264 crf 18 + AAC 192k.
- **Length:** 55.30 s, 1657 frames. That is the expected `ceil(total × 30)`: the last word ends at 54.02 s, plus a 1.2 s tail.
- **Loudness**, measured on the final MP4 with `ebur128=peak=true`:
  - integrated: -14.1 LUFS
  - true peak: -2.2 dBTP
  - LRA: 2.1 LU
- **Music against voice** (measured from the stems, not listened to): music about 12 dB under speech, about 4 dB up in the pauses.
- **Checks on the final file:** frame 0 is the cover (the glass runner sprinting at dusk with the trash bag in their thigh, already moving). The last second is the gold runner with the spark trail on the lit track. Frame count is correct.

## What it shows (one shot, the camera breathes in and out through the right thigh)

| Lines | What happens on screen |
|---|---|
| 1 | Track at dusk. A glass-body runner pushes hard (sweat, streaks). The camera pushes into their thigh in slow motion: a black bag printed "lactic acid" with flies sits inside. |
| 2 | The camera passes through the glass into the bag. It rips, and an amber drop swells and zips off along the muscle, lighting it. |
| 3–4 | Inside the muscle fibre. A hero sugar cube with a face snaps in two (each half keeps part of the face). The halves enter a bean-shaped "tiny engine", which puffs. The camera pulls back to a field of engines. A few halves turn amber and get burned too: lactate is made all the time. |
| 5 | Footstrikes double and a firehose of cubes arrives. Engines red-line with spinning rotors, shaking and steam. The surplus heaps up. Red cells and oxygen bubbles keep streaming in the capillary the whole time. |
| 6 | A colour wave turns the heaps amber, into lanterns. Some drop through pores into the blood river. |
| 7 | The camera pulls out to the glass body. Lanterns flow up the vessels: the heart squash-gulps and flares, the brain sparkles, the arm glows. |
| 8 | Dive back in. The lanterns part like a curtain to reveal red spiky acid sprites with angry eyes, plus grey grit. The red heat sits only on them. The strands' beat drags. |
| 9 | Back on the track the runner speeds up. Lanterns pour in from the legs while the heart, brain and arm drain them. An amber ribbon behind the runner stays flat, then bends up, and a flag plants there: "your lactate threshold". |
| 10 | Days sweep across the sky and engines pop into the body. The flag uproots and replants further on (the old ribbon stays as a ghost). The camera pushes into the thigh as engines pop in like popcorn. |
| 11 | A track-side bin tips and the line 1 bag falls out, scattering flies. The amber drop rolls to the runner, who scoops it up and turns gold. Engines gobble lanterns and a spark trail follows the runner. The camera pulls wide over the lit track. |

The "Illustration" tag shows whenever the view is inside the body or close on the glass body.

## Motion check (quarter-scale preview vs bar)
The bar is Grand Canyon 01's first 20 s (frames 0–599): the full-length bar render didn't finish within the 60-min background limit (see Errors).

| Run | Movers median (film / bar) | Seconds with ≤2 movers | Flagged seconds |
|---|---|---|---|
| v1 preview | 26 (self-readout before the bar existed) | 0% | thin at 38–42 s and 49–54 s |
| v2 preview | 25 / 20 | 0% | 26, 28, 38–41, 44, 49–51, 53–54 |
| v3 preview | 26 / 20 | 0% (bar 0%) | 41 and 50 |

The two seconds still flagged in v3 are kept as defensible:
- **41 s:** 14 movers against the bar's quarter mark of 16. The amber level shoots up and the ribbon bends.
- **50 s:** 15 movers. The bin tips, the bag falls, flies scatter and the drop rolls out.

The film's median change over 2 s (0.36) is below the bar's (0.51). The camera tracks the runner, so the framing changes less than the canyon film's flights.

## Stills
- `projects/lactate-run-01/stills/sheet_v1.1.jpg`: contact sheet of 14 frames from the v1.1 render. The frames themselves are `stills/f*.jpg`.
- `stills/mute/sheet_00`–`04.jpg`: the captions-off frames the mute judge saw.
- Working sheets (git-ignored): `film/out/check/sheet.png` (36 beats, pre-redesign) and `film/out/c3`–`c7`.

## Synthetic, AI and credits
- **Voice:** AI (Qwen3-TTS cloned from the approved design-m2 reference clip, seed 7). It is not a human recording.
- **Music:** "Floating Cities" by Kevin MacLeod (incompetech.com), licensed CC BY 4.0.
- **Effects:** CC0 `library/sfx/cstack-cc0` files plus synthesized noise and tones. No unverified-rights sounds.
- **Pictures:** all images are drawn in code, with no sourced images and no logos.

## Instagram caption (draft; nothing posted)
> Lactic acid isn't the trash your legs are full of after a hard run. Your body actually makes lactate, and it's fuel: your muscles, heart and brain burn it. 🏃‍♂️🔥
>
> Simplified for a 1-minute video: "tiny engines" are mitochondria; the burn and fatigue come from several things together (acidity, phosphate and other by-products), not one; next-day soreness isn't lactate (it clears within about an hour); thresholds vary a lot between people.
>
> Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI.

## Mute test (v1.1)
Method:
- Captions-off frames at 2 fps (111 stills, no sound), saved as five timestamped sheets in `stills/mute/`.
- A fresh agent that had never seen the script described what happens, second by second.

Results against the script's claims:

| Line | Claim | Result | Fix |
|---|---|---|---|
| 1 | Myth: lactic acid is waste | Recovered (the "LACTIC ACID" bag as villain/waste) | — |
| 2 | It's fuel | Missed: the amber drop was read as acid or a proton | "LACTATE" printed on the drop; amber then stays the lactate colour |
| 3 | Muscles break down sugar to make energy | Missed: the white cube was read as lactate | "SUGAR" printed on the hero cube and its half |
| 4 | Engines burn almost all of it | Partly recovered (beans light up, read as mitochondria) | Engines got calm faces |
| 5 | Sugar breaks down too fast; the engines can't keep up | Missed (read as "lots made and burned") | Flat-out engines now squeeze their eyes, gape and sweat while the surplus heaps up |
| 6 | The extra turns into lactate and some spills into the blood | Partly recovered (gold read as energy, not lactate) | Fixed by the drop's label: amber = lactate is now set up in line 2 |
| 7 | Heart, brain and other muscles burn it | Recovered ("the clearest section") | — |
| 8 | Acid and leftovers make the burn and slow you down | Missed (the red spiky haze was unidentified) | "ACID" printed on a larger lead sprite |
| 9 | The threshold | Recovered | — |
| 10 | Training grows more engines | Mostly recovered | Ribbon and flag fixes below |
| 11 | It isn't trash, it's fuel | Recovered (the trash-bin gag works; the drop is small) | — |

- **Not re-judged:** a second mute round on v1.1 was not run. I checked the fixes in stills myself.

## v1.1 fixes beyond the mute test
- **Ending ribbon:** in the ending the ribbon re-rose past the moved threshold; it now stays flat behind the trained runner.
- **Ghost ribbon:** the old dashed ribbon fades out after line 10.
- **Flag:** the camera keeps the moving flag uncropped at 44–45 s.

## Open issues
- **Mute test not repeated:** I didn't run a second fresh judge on v1.1.
- **Sound not listened to:** cues are placed from beats and the levels are measured, but nobody has heard them.
- **Line 5 heaps:** they read as scattered halves more than snowdrifts.
- **Engine rotor:** it reads a little like a "⊗" icon at small sizes.
- **Bag on the cover:** the bag in the thigh is small on frame 0, so the cover's joke depends on a close look.

## Errors and fixes (UTC)
- **14:24 alignment crash:** `assemble.py`'s whisper step crashed because PyAV 19 dropped `metadata_errors`. I pinned `av==16.0.1` in the voice venv.
- **14:25 whisper hallucination:** whole-file whisper invented the first 16 words. I wrote `vo/align_lines.py` (transcribes line by line), and all 11 lines MATCH.
- **14:31 first stills sheet:**
  - The drop and the flag text were invisible because they were drawn with a colour array instead of a string.
  - The bag halves were clipped out of view.
  - The bin was invisible against the hills.
  - The flag and bend were out of frame in line 9.
  - The bin was out of reach in line 11.
  - The body's lactate level didn't clear after training.
  - The path light had hard edges.
- **15:26 bar render stopped:** the full-length bar (a 3D film on software WebGL, sharing cores with my stills) was stopped at the 60-min background limit. I re-rendered a 20 s slice in 24 min.
- **15:37 redesign 1, threshold run and ending:** the world was slowed and nearly static. The runner went back to full speed with the ribbon drawn compressed ×0.2 behind them, the camera now frames the flag and the runner together, the flag cloth trails left of its pole, and the ending got a spark trail.
- **16:13 redesign 2, the flagged seconds:**
  - Bigger framing on the threshold run and in the ending.
  - Lanterns visibly drain to the heart, brain and arm in line 9.
  - Foreground track-side posts whip past.
  - The body view is less slow, with denser lantern flows.
  - Flies scatter from the tipped bin.
- **16:50 mute-test misses:** sugar, the drop as lactate fuel, "can't keep up" and acid; fixed as in the table above (v1.1).
- **16:39 brightness spike at frame 728:** a zoom term was counted twice in the 0.4 s before the second passage. I fixed it, re-rendered frames 700–735 and overlaid them on the master (one re-encode at crf 18). The frame count is unchanged at 1657, and the brightness curve across both seams is smooth.

## Timeline (machine clock, UTC; details in film/PLAN.md)
- 14:16 start; voice job and music download running.
- 14:21 reading and plan done.
- 14:25 voice aligned; bar render started.
- 14:27–14:40 world built; three stills rounds.
- 14:40 mix.
- 15:26 bar render stopped by the time limit.
- 15:37 preview v1.
- 16:01 bar slice ready.
- 16:12 motion check v2.
- 16:25 motion check v3.
- 16:38 full render.
- 16:43 splice fix, checks and delivery.
- 16:46 v1.1 started: mute stills.
- 16:50 mute verdict.
- 16:52 label, face, ribbon and flag fixes.
- 17:04 v1.1 render.
- 17:08 delivery.

## Production analytics (`templates/remotion-film/analytics.py` over this session's transcript)

| Phase | Minutes | Responses | Tool calls | Edits | Still batches | Image reviews | Renders | Output tokens | Errors |
|---|---|---|---|---|---|---|---|---|---|
| Setup | 10.0 | 19 | 24 | 1 | 2 | 0 | 0 | 42,783 | 0 |
| Build + stills | 34.0 | 36 | 35 | 9 | 8 | 8 | 3 | 61,704 | 2 |
| Bar + preview + motion | 85.7 | 34 | 31 | 7 | 4 | 5 | 5 | 17,987 | 1 |
| Full render + checks | 20.6 | 19 | 20 | 2 | 0 | 3 | 1 | 13,757 | 1 |
| v1.1 mute test + fixes | 19.5 | 17 | 15 | 4 | 4 | 4 | 0 | 12,827 | 0 |

The mute judge (one subagent, about 106k tokens) isn't in this table. Most of the "Bar + preview + motion" phase was render waiting: the stopped full-length bar, the 20 s bar slice, and three quarter-scale previews.

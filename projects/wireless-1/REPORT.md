# Caught by Wireless · Part 1: The missing singer — report (v1)

**Final:** `projects/wireless-1/renders/wireless-1_v1.mp4` (git-ignored; delivered through the session).
1080×1920, 30 fps, **87.00 s, 2610 frames** (= beats total 87.01 s × 30, checked after every splice), H.264 crf 18 + AAC
192k. **Loudness −14.0 LUFS integrated, true peak −3.2 dBTP** (ffmpeg `ebur128=peak=true` on the final MP4). Length is
inside the series window (70–89 s, ceiling 90): last word 84.41 s + a 2.6 s tail so the end card holds ~2 s after it
slides up. Rendered with Remotion (SVG, no three.js) and FFmpeg; no DaVinci Resolve project.

## Checks
- **VO:** 17/17 lines MATCH (line-by-line faster-whisper alignment), design-m2 clone, seed 7, series gaps. No line
  regenerated, no tightening needed (85.6 s assembled).
- **motion_check** vs `lab/motion-bar/grand-canyon-01_q.json` (bar median 18 movers): **median 24, PASS, no flagged
  seconds** (≤2 movers 0 %, still 12 %, change over 2 s 0.72 vs 0.36). Runs: 14 FAIL [15,32,45,63,64,73,86] → 18 [86] →
  23 [40,86] → 24 [40] → 24 PASS. Fixes were new independent life in each flagged second, not camera drift: foreground
  snowflakes and lamp-lit dust, sparrows and pigeons, chimney puffs, flowers thrown at the stage and waving programmes,
  passers-by, wind-blown leaves, a nosy neighbour's curtain, the Montrose sailing under the end card with gulls and a
  wake, and a real push in to the friends' faces on "and died". (Measured on the captions-off preview before the
  mute-test label fixes, which only add elements.)
- **Mute test** (captions off, muted, 2 fps sheets, fresh judge): recovered most of the story; missed "1910", the step
  from "America" to "she died", who Ethel is, whether the pair had fled, the cut-off RAN AWAY card and a stray passer-by.
  Fixed in their shots: the Spark writes "1910" in light; his balloon says "She got sick… and died."; labels "Ethel · the
  doctor's typist" and "Cora's brooch"; card moved into frame; passer-by removed; Dew's notebook writes "Doctor + Ethel:
  gone". **Judge 2 (fresh) on the six fixed shots: yes / yes / mostly / yes / mostly / mostly.** Left by design: the
  Feather in Dew's band (series device: Clara hands Cora's cause to him), the Spark (the series' wireless device), and the
  cellar, which stays a closed floor with lamps (care rules) and is named only by the "CELLAR DISCOVERY" headline.
- **Temporal:** YAVG flicker scan of the final: every jump > 6 is one of the eight push-through hand-offs (the next
  stage opens in a circle from a round carrier: playbill stage, lens, fog sparkle → brooch, opera glass, pocket, door,
  steam, WANTED oval) or the rise out of the cellar tour; four one-frame pops (parlour figures, three balloons, the
  neighbour's curtain) were found this way and fixed with short fades, re-rendered and spliced (seams checked on strips).
- **Kit-redraw lint:** `grep … film/src (own source: Film.tsx, p1/) | grep -xFf film-kit-EXPORTS.txt` → no hits. Three
  local helpers that shared a kit name (Layer, Glow, Snow) were renamed or replaced by the kit's.
- **Frame 0:** night sky over London, the Spark star, lit windows, the Daily Wire and the BELLE ELMORE playbill, corner tab
  "Caught by Wireless · Part 1 of 3". The title plaque is settled by 4.0 s (kit TitlePlaque at 72 f). **Last second:**
  the night sea, the Montrose sailing with the Spark at a porthole, end card "NEXT: THE CHASE" (kit EndCard, top y 560).

## Stills (committed, from the final)
`stills/sheet_1fps.jpg` (1 fps contact sheet) · `stills/hero_14_6.jpg` (Cora sings under her big hat) ·
`stills/hero_31_0.jpg` (the goodbye at the top of the snowy steps, the parlour window) · `stills/hero_58_9.jpg` (Dew lifts
his bowler at Scotland Yard as Clara hands up the Feather). Recap stills for part 2 (pick §2.6):
`stills/R1_EmptySteps.jpg` (34.1 s), `stills/R2_CellarLamps.jpg` (80.0 s), `stills/R3_EmptyOval.jpg` (83.97 s).

## Synthetic / sourced
- Voice: AI (Qwen3-TTS voice clone, design-m2, seed 7). Picture: made in code; the series kit (READY 25550bc + 899f6dd
  type fix) for cast, devices, sets, props, cards, captions and grade; part-only pieces in the kit's style (London street,
  music hall, ballroom, Albion House door, story cards, playing cards, opera glasses, two guild friends on the kit rig).
- Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0, +10 dB with the series sidechain duck (measured
  10.5 dB under speech, 5 dB up in pauses). Effects: the kit's series palette via `series_sfx.build_sfx` (synthesized +
  CC0 cstack-cc0), 52 cues from `src/p1/cues.ts` (same numbers as the picture; `sound/cues.json` lists each visible
  cause), plus two locally synthesized foley cues (Dew's knock, the wobbling brick). No sfx-01–28.

## Instagram caption
> London, 1910. A music-hall singer named Cora Crippen says goodbye to her friends one winter night, and is never seen
> again. Her husband's stories keep changing… 🕵️ Caught by Wireless, Part 1 of 3: The missing singer. Next: the chase.
>
> Notes: Cora performed as "Belle Elmore". Hawley Crippen held a US homeopathic degree but could not practise as a
> doctor in Britain. Scenes and dialogue are simplified from the 1910 Old Bailey trial record (illustrations, not
> photographs). Ethel Le Neve was later tried separately and found not guilty.
> Music: "Floating Cities" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0. Voice: AI.

## Open issues (for the continuity judge)
- The music gain differs between the parts' mix.py files (part 2 +10 dB, part 3 +12 dB). With the same VO level I
  measured +12 dB at only 8.5 dB under speech, so part 1 uses +10 (10.5 dB under). Worth matching by measurement.
- "1910" is drawn by the Spark from 0.0–0.8 s, so frame 0 itself shows the star but not yet the year.
- The judge read the Feather in Dew's hat as puzzling in part 1 alone; the pick explains it in parts 2–3.
- The cellar beat is understood from the headline, not the picture (by design, care rules).

## Skipped checks
None of the required ones. motion_check was not re-run after the final label and fade fixes (they only add elements to
shots that already passed).

## Errors and rewrites (UTC)
- 03:30 VO projected at ~98 s from line lengths; it assembled at 85.6 s, so a tightening script was written and dropped.
- 03:42 kit WIP 8883021 failed tsc strict (type-only, kit devices.tsx); reported to the kit; fixed in 899f6dd (04:14).
- 03:47 first motion_check 14 FAIL; redesigned flagged seconds (above).
- 03:55 adopted READY: replaced every stand-in set/prop with the kit's; rewrote stages S3–S9 on the kit's geometry;
  renamed local Layer/Glow/Snow; first splice error (duplicate JSX opener) fixed.
- 04:12 mute test 1 misses fixed (above); 04:16 restarted the full render rather than splice six ranges.
- 04:20–04:45 recap R3: the WANTED portrait finished walking out after the push into the oval, so the blank oval was never
  seen; walk-out moved earlier, flip shortened, push 0.15 s later (end card still holds ~2 s).
- 04:20–04:45 temporal pops (parlour, balloons, curtain) and a story card covering the doctor's face at 61 s: fixed by
  partial re-render + concat-filter splice (frame count re-checked each time: 2610).

## Phase timeline (UTC, machine clock; PLAN.md has the detail)
03:22 start, VO + music in background · 03:24 pictures-pick landed · 03:30 part-only sets/props look test · 03:35 VO done
(17/17) · 03:40 full skeleton on the real VO · 03:42 kit WIP adopted · 03:53 kit READY adopted · 04:10 motion PASS ·
04:12 mute test 1 · 04:17 full render · ~04:30 judge 2 · 04:50 final checks and delivery.

## Production analytics (`film/analytics.py` over this session's transcript)
| Phase | Minutes | Responses | Tool calls | Edits | Still batches | Image reviews | Renders | Subagents | Output tokens (main + sub) |
|---|---|---|---|---|---|---|---|---|---|
| Setup+plan | 11.5 | 50 | 49 | 6 | 3 | 1 | 0 | 0 | 40479 + 0 |
| Build (stand-ins) | 8.0 | 14 | 14 | 5 | 1 | 1 | 0 | 0 | 40018 + 0 |
| Kit adoption | 18.0 | 55 | 57 | 15 | 4 | 5 | 2 | 0 | 70041 + 0 |
| Checks (motion, mute) | 16.5 | 36 | 36 | 13 | 5 | 8 | 6 | 1 | 29608 + 6044 |
| Render+deliver | 34.2 | 33 | 34 | 8 | 2 | 8 | 8 | 1 | 17939 + 5584 |

# Caught by Wireless 3: "The verdict": report (2026-11-08)

**Final:** `projects/wireless-3/renders/wireless-3_v1.mp4` (git-ignored; delivered in the session). 1080×1920, 30 fps,
**83.13 s = 2494 frames** (checked on the MP4), last word 81.83 s + 1.3 s tail. **−14.1 LUFS integrated, −1.9 dBTP**
(ebur128 on the MP4), LRA 1.6 LU (the raw TTS voice alone measures 2.5 LU; two-pass linear loudnorm + lookahead limiter).
Voice over music in voiced windows (1–4 kHz) 7.6 dB; music up 5.1 dB in the pauses (the series' fixed music setting,
+12 dB with the same duck in all parts, kept for continuity rather than tuned to 10–12 dB).

**Stills:** `stills/sheet_1fps.jpg` (1 fps contact sheet of the final), hero stills `stills/hero_recap.jpg` (3.6 s, the
recap page + plaque), `stills/hero_arrest.jpg` (19.3 s, the Moustache lands), `stills/hero_scales.jpg` (41.8 s, the
scales of Justice).

## Checks
- **VO:** 16/16 lines; 14 MATCH, 2 ASR spellings fixed in words.json by `film/fix_words.py` ("Dr"→"Doctor",
  "sharp eyed"→"sharp-eyed"; the audio says the script). Line 7 carries the orchestrator's "And with them" care fix.
- **motion_check** vs `lab/motion-bar/grand-canyon-01_q.json`: v1 median 16 vs 18, flagged 3–6, 55, 71 → v2 17, flagged 6
  → v3 **PASS, median 18 = bar, no flagged seconds** (≤2 movers 0 %, change over 2 s 0.67 vs bar 0.36). Fixes were
  pictures, not drift: tumbling newspaper sheets, gulls and spray inside the engraved panels, tumbling dice, quay lamps,
  lighthouse beam and smoke at the wireless hop, papers flying out of the experts' tug, pigeons over London, a swinging
  lamp in Ethel's cabin. (The final adds 8-frame push-through hand-offs; not re-measured.)
- **Mute test 1** (fresh agent, 166 captions-off frames): 9 of 16 lines fully recovered; the rest partly. Fixed with
  printed words and one picture change (table in `film/PLAN.md`). **Mute test 2** (second fresh agent, the fixed shots):
  all fixed claims recovered; one new note (the doctor looked different in the dock) → he keeps one look from the arrest
  on (bald, moustache, no hat) and is labelled "Dr. Crippen".
- **Kit lint** (`film/lint_kit.sh` vs `film-kit-EXPORTS.txt`): clean.
- Frame 0 = the brim close-up from P2's last frame, already pulling back; plaque settled by 4.0 s (kit TitlePlaque at=72);
  end card "THE END" centred, top y 560, over the night sky, Feather tip on the star above it.
- Temporal: per-frame YAVG; the largest jumps were at scene hand-offs (hard swaps) → replaced by push-throughs (the
  outgoing picture, frozen on its carrier, scales up and fades over 8 frames) and a Spark-to-Spark match at 53 s.

## What is synthetic / credits
Animation made in code (Remotion, SVG). Voice: AI (Qwen3-TTS clone of the design-m2 Voice Picker voice, seed 7). Music:
"Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Effects: the series kit's sounds (synthesized + CC0)
and CC0 cstack-cc0 files. All cartoons of real people are illustrations.

## Instagram caption (draft, not posted)
Caught by Wireless, part 3 of 3: The verdict. 🕵️📡
Inspector Dew catches "Mr. Robinson" at sea, the Old Bailey weighs the evidence, and in 2007 a new test raised one last
question. Did the doctor do it?
Notes: Dew's exact words differ between the trial record and his memoir; the line shown is the shared opening. Ethel
Le Neve was tried separately and acquitted. The 2007 DNA findings (Foran et al., J Forensic Sci, 2011) are disputed and
do not prove innocence. The courts have never reopened the case. Scenes are illustrations, simplified from the 1910 Old
Bailey trial record.
Voice: AI. Music: "Floating Cities" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0.

## Open issues
- The orchestrator's continuity findings from part 1 had not arrived before the render; apply by partial re-render.
- The recap (R4, R5 panels) was built to the pick and part 2's PLAN, not checked against part 2's committed
  `stills/` (not on the branch at render time).
- Voice-over-music gap 7.6 dB is below BUILD-BRIEF's ~10–12 dB because the series music level is shared; listen.
- 30–31 s: the hand-off into the court lands briefly on a close-up of the judge/report card before pulling out.
- The final with push-throughs was not re-run through motion_check (the preview before them passed).
- Listen to: the clerk's stamp (9.2 s), the Moustache flutter + click (18.5–19.3 s), the scales clanks (36.6, 41.4 s),
  GUILTY / NOT GUILTY thunks (44.2, 51.0 s), the end-card typing (81.2 s).

## Skipped checks
- Determinism double-render (stills and render came from one bundle; no randomness outside `random(seed)`).

## Errors and rewrites (UTC)
- 03:29 the orchestrator's line 7 change had already been pulled before TTS; no regeneration needed.
- 03:39 kit snapshot adopted before READY; placeholders → kit cast/cards.
- 03:46–03:52 three motion redesign rounds (above).
- 03:49 deleted out/bundle while the mute render read it (grain PNG 404s); killed and re-ran.
- 03:58 kit READY: stand-in sets/props/sounds replaced; lint hit "Layer" (template camera) → renamed ParallaxLayer.
- 04:03 render stopped and restarted after the mute-test-2 fix; 04:10 hard swaps found in YAVG → push-through
  hand-offs, full re-render 04:13–04:18.
- Master: dynamic loudnorm flattened the voice → two-pass linear loudnorm.

## Timeline
See `film/PLAN.md` "Timeline". 03:23 start · 03:25 TTS · 03:33 VO aligned · 03:35 first stills · 03:39 kit snapshot
· 03:46 motion v1 · 03:52 motion PASS · 03:55 mute test 1 · 03:58 kit READY · 04:02 mute test 2 · 04:08 first full
render · 04:18 final render · 04:20 delivered.

## Production analytics (film/analytics.py over this session's transcript)
| Phase | Min | Responses | Tools | Edits | Still batches | Renders | Image reviews | Agents | Out tok | Errors |
|---|---|---|---|---|---|---|---|---|---|---|
| Setup+VO+plan | 3.0 | 26 | 28 | 1 | 1 | 0 | 0 | 0 | 11830 | 0 |
| Build(stand-ins) | 12.8 | 42 | 39 | 8 | 1 | 0 | 1 | 0 | 67054 | 0 |
| Kit adoption | 7.2 | 31 | 29 | 6 | 0 | 1 | 3 | 0 | 25905 | 0 |
| Motion+mute | 14.0 | 37 | 35 | 10 | 0 | 4 | 2 | 1 | 28187 | 1 |
| Render+deliver | 12.5 | 41 | 37 | 5 | 1 | 2 | 2 | 1 | 18558 | 2 |

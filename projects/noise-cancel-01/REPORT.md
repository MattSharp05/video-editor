# Noise cancel 01: report (builder session, unattended)

**Final:** `projects/noise-cancel-01/renders/noise-cancel-01_v1.mp4` (git-ignored; delivered with this session's file delivery)
- 1080×1920, 30 fps, **52.47 s, 1574 frames** (last word 51.24 s + 1.2 s tail); H.264 crf 18 + AAC 192k
- Loudness **-14.0 LUFS integrated, -2.0 dBTP**, measured on the final MP4. Voice LRA in the mix is 2.0 LU (raw VO 2.6 LU).
- Music 10.9 dB under speech (stems), about 4.4 dB up in the pauses.
- One shot, made in code (Remotion: SVG + one canvas, no three.js): thought bubble → the hero's ear cup → cutaway cup
  → the air inside one squiggle → mics, chip, speaker, eardrum → calm bubble in the cabin → music box → engine and
  chatty neighbour → cushion → recap in the whole cup → out to the plane in the sky.

## Checks
- **motion_check** against the committed Grand Canyon 01 readout: **PASS**. Movers median 18 vs bar 18 (19 on the
  pre-fix v1), still 22 % vs 36 %, change over 2 s 0.76 vs 0.36, **no flagged seconds**. Earlier rounds: q1 16 vs 18
  (seconds 41 and 49 flagged) → motes, denser hail, a continuous belt, and the engine stream kept running → q2 18, second
  41 only → L9 reframed tighter → none flagged.
- **Mute test** (fresh judge, no captions and no sound, 2 fps sheets) on the first full cut. Recovered: the block myth,
  the copy and the flip, air as pressure bands, mics, chip, push vs pull, speaker plus music, the cancel at the ear, the
  calm bubble, the cushion and the recap. Missed: line 8 (the chip spares the music because it plays it; read as "a
  repeat"). Partial: line 2 "more sound", line 9b (voices), the AIR label, and small labels. Fixes are in PLAN.md
  (MINE! with a dashed link from the music box, MORE SOUND rings, TOO LATE and GETS THROUGH, bigger labels).
  **A second fresh judge** on the fixed shots recovered every one of them. Its remaining label clutter was then fixed.
- Stills at every beat (contact sheets `film/out/s1`–`s6`, not committed). Kept: `stills/sheet_v1.png` plus 14 stills from
  the final.
- Frame 0 is the thought bubble with the BLOCK brick cup and noise hailing (legible, already moving). The last second
  holds the plane.
- Temporal: consecutive frames 1500–1529 (the punch and the pull-out) are smooth. The YAVG scan found a 0.3 s dive gap at
  frames 258–266, now fixed. The remaining jumps are the end pull-back (the white wing entering frame) and the bubble pop.
- Reels safe zones: captions at y 250–470 over a scrim, leads kept in the middle band. The plane end frame sits in the
  centre third.

## Synthetic / credits
- **Voice:** AI (Qwen3-TTS, cloned from the approved design-m2 clip). Every line matches the script word for word,
  aligned line by line.
- **Music:** "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0.
- **Effects:** CC0 (`library/sfx/cstack-cc0`: pop-soft, rubber-stamp, bubbles-burst, screen-tap, relay-click,
  card-riffle, impact-deep, whoosh-deep) plus synthesized sounds: an engine-hum bed at 98/196/294 Hz with brown noise,
  and music-box plinks. 46 cues are in `film/sound/cues.json`.
- **Art:** all original, drawn in code. Generic headphones, plane and cabin; no brands, liveries or logos.
- Honesty tags on screen: "Illustration · not to scale" (inside the cup) and "Real mics sit flush in tiny holes" (when
  the stalks sink back).

## Sound design and the moments to listen to (nobody has listened: every audio check was a measurement)
The hum bed tells the story. It is steady in the cabin and inside the cup, **drops about 15 dB the instant push meets
pull (27.4 s)**, stays low through "most of the hum disappears", comes back for the engine shot (38–44 s), dips at the
punch (50.3 s) and swells outside the plane before the fade. Effects sit only on events.
1. **0–3 s:** the hum fading in under the first line, with soft pings as squiggles hit the bricks and the BLOCK stamp
   at 2.85 s. Is the stamp too firm?
2. **4.2 s:** the bubble pop (bubbles-burst, trimmed).
3. **27.4 s:** the cancel pop plus the hum drop. This is the key moment: the drop should feel like relief, not a glitch.
4. **22.9–25.5 s and 47–50 s:** the synthesized music-box plinks over Floating Cities. Do they clash in key?
5. **38–43 s:** the engine pops (every other beat, -25 dB) and the hum level. Is the hum audible on a phone speaker
   without being annoying?
6. **44.4–45.4 s:** the cushion thuds (impact-deep, low-passed).
7. **50.3 s:** the punch (pop plus deep impact), then the swell and fade.

## Open issues
- The dive (7.9–9.4 s) passes through about 0.3 s of fine grain before the balls are big enough to read. The first
  judge called it unclear; the second read the air field fine from 9 s on.
- The recap punch (47–50 s) is small in the whole-cup framing, and the cutaway inset of the frantic chip during the
  voices (L9 in the pick) was cut (it was on the pick's cut list).
- GETS THROUGH overlaps its own squiggle at 43–44 s. TOO LATE can sit half behind the voice squiggle at 42.5 s.
- In L2 the copies and noise squiggles move apart on the screen rather than travelling together to the ear (accurate:
  the twins stay inside the cup and head to the ear).
- Captions-off movers: 17 vs 18 (captions add one).

## Skipped checks
- No listening (Claude can't hear); the mix was measured only. Determinism double-render was not run.

## Errors and rewrites (machine clock, UTC; details in film/PLAN.md)
- 19:27 `node --experimental-strip-types` couldn't import beats.json (needs an import attribute) → events dumped through
  esbuild.
- 19:43 a reversed range in `pr()` drew a giant note at the end; frame 0's label sat in the top 220 px; EAR overlapped
  the strip; the end framing cropped the tail. All fixed.
- 19:48–19:51 motion redesigns (motes, hail, continuous belt, L9 reframed).
- 19:54 the first full render was stopped so the mute fixes could go in. The hum moved from 61 Hz up the spectrum so
  phones can play it.
- 19:55 mute-test fixes (listed above). 20:02 the dive gap was fixed by a partial re-render. **A `-c copy` concat splice
  silently produced a 271-frame file**; it was caught by the frame count and redone with the concat filter. The final is
  a clean full re-render after the label-clutter fixes.

## Timeline
19:25 start (VO + music jobs) · 19:30 pick arrived · 19:33 VO 11/11 MATCH · 19:42 first stills · 19:44–19:53 three
previews and motion rounds · 19:53 mute test · 19:56 render · 20:05 second mute judge · 20:12 final · 20:13 delivered.
**About 48 min start to delivery**, of which about 12 min was render and preview waits.

## Production analytics (`film/analytics.py` over this session's transcript)
| Phase | Min | Output tok | Cache read | Cache write | Responses | Image reviews | Agents |
|---|---|---|---|---|---|---|---|
| Setup | 7.0 | 15,770 | 3,192,648 | 110,894 | 24 | 0 | 0 |
| Build | 12.0 | 62,401 | 2,925,413 | 67,174 | 14 | 1 | 0 |
| Previews+motion | 9.0 | 11,792 | 3,348,119 | 18,850 | 13 | 3 | 0 |
| Mute test+fixes | 3.0 | 14,058 | 2,756,322 | 24,131 | 10 | 2 | 1 |
| Render+mix+checks | 17.0 | 14,414 | 5,391,084 | 26,014 | 18 | 6 | 1 |
| Delivery | 0.9 | 893 | 952,087 | 3,884 | 3 | 1 | 0 |
| **Total** | 48.9 | 119,328 | 18,565,673 | 250,947 | | | |
The two mute judges used about 284 k subagent tokens in total, mostly input.

## Instagram caption (draft)
Noise-cancelling headphones don't just block sound: they make MORE of it. 🎧
Tiny mics listen to the hum, a chip makes an upside-down copy, and where the noise pushes the air, the copy pulls.
Push meets pull → most of the hum cancels right at your ear.
It works best on steady sounds like a plane engine. Quick, changing sounds like voices are harder, so the soft
cushions do some old-fashioned blocking too.
(Illustration, not to scale. The quiet zone is small and the cancelling is partial: "most", not all.)
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0. Voice: AI.

# AI image 01: report (v1)

**Final:** `projects/ai-image-01/renders/ai-image-01_v1.mp4` (git-ignored; delivered through the session).
1080×1920, 30 fps, **49.9 s, 1497 frames** (last word 48.67 s + 1.2 s tail). H.264 CRF 18, AAC 192 k, 121 MB.

**Under-50 MB delivery (Matthew, 2026-11-11):** `renders/ai-image-01_v1_50mb.mp4`, **46.7 MB**: two-pass x264 `-preset slow -b:v 7300k` (maxrate 10 M), audio copied. Same 1497 frames, -14.0 LUFS, -1.9 dBTP. SSIM vs the CRF 18 master: mean 0.974, worst 0.866 (on the full-screen TV static, which softens slightly; everything else is visually identical).

**Loudness (measured on the final MP4, `ebur128=peak=true`):** -14.0 LUFS integrated, true peak -1.9 dBTP, LRA 2.5 LU.
Music measured from the stems (`film/sound/measure.py`): 10.5 dB under the voice while he speaks, 4.5 dB higher in the
pauses. Heard by nobody: every audio check is a measurement.

## The film
- **Desk (lines 1-3):** opens mid-snip on scissors cutting a dog photo. Scraps fly into a phone running our own generic app
  "Picture Maker" and land as a lumpy collage, and a red **MYTH** rubber stamp slams onto it. Static fizzes out of the
  collage, fills the screen and switches off like an old TV into a bright line, which opens into the text box. A thumb
  types "a dog surfing on a pizza" (one typo fixed with backspace, key balloons, caret). Send squashes, the bubble rises
  and folds into a paper plane, and the plane flies at the lens.
- **Room (lines 4-9):** the plane recedes into a dim warm room and unfolds into the prompt sheet. "dog", "surfing" and
  "pizza" drop out as split-flap tiles that flip to amber numbers and spool cream tapes of decimals into an old CRT. The
  TV clicks on to pure static. One denoise engine runs on the screen: a sheet of the computed removed noise lifts off the
  whole glass on "wipes", then faster and faster, onto a pile. The counter reads STEP 01 → 28 during line 7 and 50 by
  "pizza". In line 8 light pulses run down the tapes on every step, and each tape glows as its word is said. Pulling back,
  the TV is one of a wall of CRTs showing captioned training photos ("red car", "cat on a sofa"...). The pile flocks
  onto them as static, and a wave of peels cleans them off.
- **Corridor (line 10):** the dog TV brightens and rewinds to static, the camera dives through its glass, and the paper
  plane leads it down a corridor of the steps from static to sharp. The last frame is the phone's picture bubble, and
  the camera pulls back to the phone, which buzzes.

## Checks
- **Stills:** 7 rounds at 0.5 scale from one bundle (`film/out/s1`-`s7`; kept: `stills/sheet_s1.png`, `sheet_s2.png`,
  `sheet_s3.png`, `sheet_s5.png`, `sheet_s7.png`, plus `stills/frame0.png` and `stills/last.png`).
- **Motion check** (`motion_check.py` vs Grand Canyon 01 bar, quarter-scale preview of the final source):
  - Film: movers median 20 vs bar 18. Seconds with at most 2 movers: 0% vs 11%. Still seconds: 4% vs 36%. 2-s change
    median 0.60 vs 0.36.
  - First run flagged 46 and 47 (corridor). I redesigned the corridor (frames staggered left and right and tilted so
    each visibly passes the lens, bigger dust motes for parallax) and re-checked: **only second 46 remains flagged**.
  - Second 46 is defensible: its strip (`film/out/strips/still-0046s.jpg`) shows frames sweeping past, the plane and
    the motes moving throughout. It scores low because each passing frame is one large blob, and consecutive frames
    are versions of the same picture.
  - Earlier runs without the bar also raised seconds 7-9 (typing) and 32-34 (line 8): fixed with a crane and tilt over
    the keyboard, and a push-in plus a light sweep across the CRT glass.
- **Mute test** (fresh judge, no sound or captions, 2 fps sheets): it recovered typing and sending, the sentence split
  into words, words to numbers, numbers feeding the TV, static cleaned step by step into the dog picture, and the
  picture arriving on the phone.
  - Missed (1): the opening collage read as the real mechanism. Fixed with the MYTH stamp.
  - Missed (2): the honesty tag was too small. Fixed: 40 px, two lines.
  - Missed (3): what the wall going to static and back means (40-43 s). Left to the narration, listed below.
- **Temporal:**
  - Consecutive-frame strips on the two fastest seconds, 11 (plane fills the lens) and 44 (dive into the TV):
    `stills/strip11.png`, `stills/strip44.png`. Both continuous.
  - Brightness flicker (YAVG per frame): the only jumps are the designed paper-white flash at 11.4-11.7 s and the
    corridor entry at 44.5 s.
- **Frame 0:** a legible cover, already moving (scissors mid-snip on the dog photo, first caption up).
  **Last second:** steady on the phone with the picture.
- **Frame count:** 1497 = ceil(49.88 × 30). The corridor fix was a partial re-render of frames 1320-1440 spliced into
  the master. Both seams checked (`film/out/chk/seams.png`).

## Synthetic, AI and credits
- **Voice:** AI (Qwen3-TTS Base, cloned from the approved design-m2 clip), one fixed seed. All 10 lines transcribe as
  the script.
- **Music:** "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0.
- **Effects:** CC0 library `library/sfx/cstack-cc0` only (blade-slice, rubber-stamp, radio-static, relay-click,
  screen-tap, pop-soft, tile-clicks, card-riffle, wing-flutter, electrical-hum, phone-vibrate-wood). No `sfx-01`–`28`.
  54 cues in `film/sound/cues.json`, each on a visible event, timed from `beats.json` and `src/events.ts`.
- **Art:** all drawn in code (Canvas 2D / CSS / SVG). No photos, logos or brands; the app "Picture Maker" is our own
  invention.

## Instagram caption (draft; nothing posted)
> AI image makers don't cut and paste photos. Many of them start from pure static and clean it up, step by step, steered
> by your words. 🐕🏄🍕
>
> Simplified: real models (like Stable Diffusion) clean a small hidden grid of numbers, then enlarge it into the full
> picture. Not every image AI works this way: some newer ones (like GPT-4o's) build the picture piece by piece instead.
> They learn from billions of captioned pictures, and very rarely they can reproduce a heavily duplicated training image
> almost exactly.
>
> Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI.

## Open issues
- **40-43 s (wall of TVs going to static and back):** without sound a viewer can't tell it is training. The narration
  says so ("covered each one in static, then learned to clean it up"). A sharper picture would be a small "guess vs
  real noise" comparison on the red-car TV.
- **Line 4 numbers:** a muted viewer doesn't know what they stand for. The VO covers it ("turns them into numbers").
- **Landing (47.7-48.3 s):** the user's prompt bubble passes under the caption for about half a second during the
  pull-back.
- **Wall photos:** they repeat (several "red car" TVs). Fine at that scale, but visible on a paused frame.
- **Cut, in the picker's cut order:** the water-droplet splash at the end (item 1). Corridor uses 18 of the 50 step
  frames (item 5).

## Skipped checks
- Nobody listened to the mix: levels are measured only. Moments to listen to: the MYTH stamp (3.0 s), the CRT
  switch-off (6.3 s), typing (7-10 s), the TV click-on (16.9 s), the sheet stream (22-28 s), the phone buzz (48.3 s).
- No independent design or story judge beyond the mute test.
- No full-render determinism check (stills and renders came from the same code, with seeded noise only).

## Errors and rewrites (machine clock, UTC)
- **14:24, assemble.py:** `av.open(... metadata_errors=)` TypeError in faster-whisper. Fixed by passing the audio as an
  array.
- **14:24:** Whisper on the whole joined VO hallucinated (87 of 139 words). Rewrote `assemble.py` to transcribe each
  line on its own slice: MATCH. "20" and "50" were heard as digits and mapped to the script words.
- **14:32, stills round 2:**
  - Line 7 showed only static: sheets made see-through, schedule changed to a = sin^0.75, b = cos^1.35, sheets clear
    the glass early.
  - Line 8: sheets hid the picture. Lowered their opacity and moved the camera in.
  - Room shots sat in the top half: camera re-centred.
- **14:34:** corridor near frames blew up across the screen: earlier fade.
- **14:36:** desk → room pass-through popped: paper-white carrier at the fill, slower recede. Corridor entry plane
  size matched to the room plane.
- **15:16:** motion fixes for typing, line 8 and the corridor.
- **15:22:** mute-test fixes (MYTH stamp, bigger honesty tag).
- **15:23:** a preview launch failed (`npm error could not determine executable`). Re-ran with
  `./node_modules/.bin/remotion`.
- **15:38:** the first mux used `-shortest` and cut 4 frames (1493). Re-muxed with padded audio and `-t 49.9`: 1497.
- **15:41:** corridor redesign after the motion check, with a partial re-render.

## Timeline (machine clock)
- 14:16 start. VO and music jobs launched.
- 14:24 VO done and aligned.
- 14:25 bar render started.
- 14:31 first stills.
- 14:37-15:40 waiting on the Grand Canyon bar render (75 min on shared cores). Previews q1-q3 on 1 core, mute test and
  full render done in that time.
- 15:28-15:37 full render (1 core, 9 min).
- 15:40 bar done, motion check.
- 15:44 final mux.
- About 90 min of my own work; the run took longer because of the bar render.

## Production analytics (`film/analytics.py` over this session's transcript)
| Phase | min | responses | tool calls | edits | still batches | image reviews | renders | errors | out tokens |
|---|---|---|---|---|---|---|---|---|---|
| Setup+VO | 9.0 | 19 | 26 | 5 | 1 | 0 | 1 | 1 | 38141 |
| Build | 6.0 | 7 | 8 | 7 | 1 | 0 | 0 | 0 | 39207 |
| Stills | 6.0 | 25 | 26 | 6 | 4 | 4 | 3 | 4 | 21461 |
| Wait+previews | 51.0 | 50 | 39 | 3 | 3 | 2 | 10 | 1 | 17064 |
| Render+checks | 16.8 | 24 | 24 | 1 | 1 | 6 | 3 | 1 | 10192 |
The mute-test judge used about 174 k input tokens.

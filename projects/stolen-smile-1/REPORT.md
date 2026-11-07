# The Stolen Smile · Part 1: The vanishing — report

## v1.1 (continuity fixes from projects/stolen-smile-kit/continuity-v1.md via the orchestrator, 21:59–22:10 UTC)
**Final: `projects/stolen-smile-1/renders/stolen-smile-1_v1.1.mp4`** — 81.83 s, **2455 frames** (checked after every
splice), **−14.0 LUFS, true peak −3.6 dBTP**, motion_check on a quarter-scale downscale of v1.1: **median 19 vs bar 18, PASS,
no flagged seconds**.
1. 79–81 s: the glowing bundle is now in the kit `Trunk` at `TRUNK_SPOT` in the kit `LittleRoom` (lid ajar, amber leak, her
   eyes, glint), not under the bed; "Illustration" tags moved to y 1300, clear of the caption.
2. 32–33 s: "the glass box he helped make" raised to about y 1250, clear of the caption strip; the knuckle hand (skin circle
   + white sleeve bar) removed, the two tap ripples kept on the glass.
3. 50–51 s: no more one-axis squash. The kit's `board="edge"` is documented but not implemented (it falls through to the
   photo), so I drew the 6 px sepia board edge in kit style, swapped in after a short flip (motion lines); she is never
   scaled on one axis. The "a notebook" size outline moved on screen.
4. 31–33 s: glass drips only run in the margins left and right of her, never across her face.
5. 65–67 s: the passer-by is now in green with a paper-coloured hat (no red); the baker has a tan coat, white apron and a
   dark beret (no longer a second white smock).
6. End card "Next: The hunt": centred, card top at y 560 (kit EndCard y = 655 centre).
Method: five ranges re-rendered from one bundle (807–1043, 1374–1568, 1876–2031, 2236–2305, 2383–2454) and spliced into the
v1 master with the concat filter (`film/splice.py`); seams checked on strips; mix unchanged (no cue times moved).
Stills replaced with v1.1 frames: `stills/sheet_1fps.jpg`, `hero_11_4.jpg`, `hero_53_0.jpg`, `hero_79_6.jpg`.

## v1

**Final:** `projects/stolen-smile-1/renders/stolen-smile-1_v1.mp4` (git-ignored; delivered through the session).
1080×1920, 30 fps, **81.83 s, 2455 frames** (= beats total × 30, checked after the splice), H.264 crf 18 + AAC 192k.
**Loudness −14.0 LUFS integrated, true peak −3.6 dBTP** (ffmpeg ebur128=peak=true on the final MP4).

## Checks
- **VO:** 16/16 lines MATCH (line-by-line alignment), seed 7, design-m2 clone from the series reference clip.
- **motion_check** vs `lab/motion-bar/grand-canyon-01_q.json` (bar median 18 movers): final preview **median 20, PASS,
  no flagged seconds** (≤2 movers 0 %, still 5 %, change over 2 s 0.76 vs 0.36). Earlier runs: 19 [3,4,8,29] → 18 FAIL
  [3,29,60] → 18 [29,60]; fixed with bigger independent movers (phone-flash bursts, art lovers walking up under the title,
  breath blooms + drips on the glass, lamp-cast wall shadows and a mouse at the door), not camera drift.
- **Mute test** (captions off, muted, 2 fps sheets): judge 1 missed closed-on-Mondays, the glass box, the frame/glass on the
  stairs, "thinks he's a worker", the photographers bubble (cropped). All fixed in their shots; **judge 2 (fresh) recovered
  all six**. Not recovered by design: what the fame gauge and the red "?" *mean* (series devices that pay off in parts 2–3).
- **Temporal:** YAVG flicker scan: every jump >12 is a multi-frame carrier iris except one hard cut at frame 480 (stage 1 →
  Louvre): fixed with a dusk-blue iris carried by the smile→Seine curve, frames 455–504 re-rendered and spliced (concat filter,
  frame count re-checked 2455), seams checked on a strip. Fastest seconds (27, 42) are iris pushes; strips clean.
- **Frame 0:** close on her in today's glass case with the corner tab "The Stolen Smile · Part 1 of 3" (legible, already
  zooming). **Last second:** little room at night, bundle glowing under the bed, end card "Next: The hunt".

## Stills (committed)
`stills/sheet_1fps.jpg` (1 fps contact sheet of the final) · `stills/hero_11_4.jpg` (the theft: the hand zips her off, the
monocle pops) · `stills/hero_53_0.jpg` (the smock bundle, her eyes peeking, amber leak) · `stills/hero_79_6.jpg` (the empty
hooks' red "?").

## Synthetic / sourced
- Voice: AI (Qwen3-TTS voice clone, design-m2, seed 7). Picture: made in code (Remotion SVG), the series kit + part-only pieces.
- The Mona Lisa: public-domain photograph (Wikimedia Commons, File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg,
  PD-Art / PD-old), via the kit.
- Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Effects: the kit's series palette (synthesized;
  stamp = CC0 cstack-cc0 rubber-stamp, softened). No sfx-01–28.

## Instagram caption
> In 1911, the Mona Lisa wasn't the world's most famous painting. Then, one quiet Monday, a man in a white work smock walked
> out of the Louvre with her. 🖼️ The Stolen Smile, Part 1 of 3: The vanishing. Part 2: The hunt.
>
> Notes: How he got in is disputed. The Louvre's own film, the Smithsonian and Hoobler say he hid overnight in a storeroom
> (some say with two helpers); Vincenzo Peruggia said he walked in alone on Monday morning. Simplified: he also unscrewed the
> doorknob before the plumber came. The theft was on Monday 21 August 1911 and was found the next day. Illustrated scenes are
> dramatised. Music: "Floating Cities" Kevin MacLeod (incompetech.com), licensed under CC BY 4.0. Voice is AI-generated.

## Decisions (details in film/PLAN.md)
- Captions use the kit's strip at y 1480 (series continuity) instead of BUILD-BRIEF's top band.
- Adopted the kit's first commit (45d7521) before READY, then rebuilt on READY **ce6aa37**: kit sets (Salon Carré,
  ModernLouvre, LouvreExterior, Staircase, ParisStreet, PaperMap, LittleRoom), devices (Hooks, QuestionMark, FameGauge,
  Calendar, SmockBundle, FrameGlass), cast, Mona Lisa, cards, captions, grade, sounds (series gains via build_sfx).
  Part-only in kit style: the long gallery, the glass box, the plumber, Béroud + easel, box camera, pigeon, dog, mouse.
- Added a name tag "Sauvet, plumber" (named in research, not by the voice) and a thought bubble "a worker, like me".
- Her reflection on the glass sits beside her, never over her face.

## Open issues
- (v1.1 fixed the label/caption overlap at 32–33 s.)
- The sleeve wiping the fog (30 s) reads as an abstract white wipe to a muted viewer.
- My own camera/plane rig is used, not the kit's `<CameraRig>` (same plane factors); kit sets are mapped by a translate.
- The fame gauge stays at "art lovers" all part (as the pick says); a muted viewer doesn't learn what it measures yet.

## Skipped checks
None of the required ones. Full-size finish was checked on stills and on the final's frames, not by playback (Claude sees
frames, not playback; sound was measured, not listened to).

## Errors and rewrites (UTC)
- 20:38 Wikimedia rate-limited the full-size file (HTTP 429 page saved as .jpg); a 960 px thumb worked; later replaced by the kit's.
- 20:47 beats: "now she" not found (whisper splits "she's"); "took her" matched the earlier "took her for pictures" → fixed with after=.
- 20:49 layout fixes from the first sheet (crowd, art lovers, gauge in the right rail, bundle over his face, dark room under the end card).
- 20:52 adopted kit 45d7521 (puppets, Mona Lisa, cards, captions, grade); 20:57 kit READY → 21:00 rewrite of all stages on kit sets.
- 20:55 killed a captioned preview to render a captions-off one serving both motion_check and the mute test (an orphaned render needed kill -9).
- 21:14 mute-test fixes; 21:17–21:23 motion fixes (two re-previews); 21:40 the frame-480 cut fixed by partial re-render + splice.
- A guarded `rm` on a relative glob was refused by the safety check; worked around by writing into a fresh folder (nothing deleted).

## Timeline (machine clock, UTC)
20:30 start (VO + music in background) · 20:37 pictures-pick arrived, PLAN · 20:43 VO aligned 16/16 · 20:45–20:48 all beats
built · 20:52 kit adopted · 20:54 mix · 20:59 first motion_check · 21:00 rebuilt on kit READY · 21:12 mute judge 1 · 21:14
fixes · 21:23 motion PASS, full render started · 21:26 mute judge 2 all recovered · 21:36 master · 21:41 final + splice ·
21:45 report.

## Production analytics (templates/remotion-film/analytics.py over this session's transcript)
| Phase | min | responses | tool calls | renders | image reviews | agents | output tokens | errors |
|---|---|---|---|---|---|---|---|---|
| Setup+VO | 7.0 | 33 | 33 | 0 | 0 | 0 | 7685 | 2 |
| Plan+build | 13.0 | 33 | 33 | 0 | 1 | 0 | 68929 | 0 |
| Kit adoption | 4.0 | 16 | 16 | 0 | 1 | 0 | 16773 | 1 |
| Checks (motion, mute) | 29.0 | 67 | 62 | 11 | 3 | 1 | 75676 | 1 |
| Final render+deliver | 20.9 | 26 | 24 | 2 | 3 | 1 | 10839 | 2 |

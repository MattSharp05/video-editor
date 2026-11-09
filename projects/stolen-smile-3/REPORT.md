# Delivery file (2026-11-09): under 50 MB
Matthew: "file size needs to be less than 50mb". The CRF 18 v1.1 master was 89 MB. The delivered file is
`renders/stolen-smile-3_v1.1_small.mp4`: **42.9 MB**, two-pass H.264 at 4 Mbps (preset slow, faststart), audio copied
from the master. Same 2438 frames, -14.2 LUFS, -1.8 dBTP, **SSIM 0.989** against the master. The rule is now in
profiles/animated-video.md and profiles/video-edit.md.

# v1.1 (2026-11-07 22:15 UTC): continuity fixes from the orchestrator's cross-part judge

**Final v1.1:** `projects/stolen-smile-3/renders/stolen-smile-3_v1.1.mp4`. 81.27 s, **2438 frames** (checked after the
full re-render), **-14.2 LUFS, -1.8 dBTP**. **motion_check PASS:** movers median 20 vs bar 18, no flagged seconds
(run on the final downscaled to quarter size).

| # | Fix | Done |
|---|---|---|
| 1 | "The end" was over her body | Centred on the wall, card top at y 560. It hangs on strings from four kit hooks drawn on the wall above her case. The camera eases back (zoom 1.25) for the last second, so her face and the card are both clear. The museum label "The most famous smile in the world" sits between them |
| 2 | "false bottom" label | Kit label size (36), above the trunk, clear of the caption and the left edge; it shows only while the board lifts |
| 3 | "Florence, 1913" clashed with the corner tab | Moved right and down, clear of the tab and of "Last time…" |
| 4 | Red full-frame floods at 8 s and 36 s | Every hand-off flood is now a paper-card wash: ≤ 8 frames, peak opacity 0.6, so the picture shows through. No red remains (8.4 s silk, 35.4 s stamp, 56.2 s Paris ring). The amber wash at 51.4 s is kept, also shortened |
| 5 | Recap hooks flat | Unchanged, as asked |
| 6 | Ghost / caption / calendar | Ghost Vincenzo stands by the wall, fully in frame and drawn over the crowd (name tag moved up to y 320). "So the man who stole her smile" is now one caption chunk, so no mid-line fade (the pale 76 s sample was the 3-frame hand-off between two short chunks). The "about 7 months" calendar fades before the push into the postcard, so no "onths" fragment |
| 7 | Vincenzo's bowler | His suit shots now use the kit bowler. Kit scale is kept: Vincenzo 560 < Geri 620 < Poggi 690 |

Flicker (YAVG) after the fixes: the largest jump is the designed panel flip at 32.2 s. The hand-off washes dropped from
26 to 15 or below. Stills replaced with v1.1 frames: `stills/sheet_1fps.jpg`, `hero_28_6s.jpg`, `hero_60_8s.jpg`,
`hero_80_6s.jpg` (end card), `frame0.jpg`, `last_frame.jpg`.

Open: the kit HonestyTag ("Illustration", y 1340) is partly covered by two-line captions at 76–78 s; it's a kit
default, so it's left for the kit owner to decide. "Under her case" and "card top at y 560" pull in different
directions; I followed the y 560 instruction and put the hooks above her case.

---

# Stolen Smile 3: "The return": build report

**Final:** `projects/stolen-smile-3/renders/stolen-smile-3_v1.mp4` (git-ignored; delivered through the session).
1080×1920, 30 fps, **81.27 s, 2438 frames** (expected 2438 from beats.json, last word 79.95 s + 1.3 s tail).
**Loudness −14.2 LUFS integrated, −1.8 dBTP** (ebur128 true peak, measured on the MP4).

## Checks
| Check | Result |
|---|---|
| VO MATCH | 17/17 lines MATCH on the first take (design-m2 clone, seed 7, series gaps) |
| motion_check vs `grand-canyon-01_q.json` | preview 1: movers median 17 vs 18, flagged 2, 10–12, 28, 41–43 → preview 4: **median 19 vs bar 18**, ≤2 movers 0 % (bar 11 %), still 4 % (bar 36 %); one flagged second left (28) |
| Flagged second kept | 28 s: the red-silk pull reveal (a single cloth leaves and a light flood fills the trunk). It already has rising amber motes, two leaning heads and a camera rise; it's the reveal beat, so I kept it |
| Mute test | judge 1 (all 14 sheets, 2 fps, captions off): 17 claims, most recovered; 6 missed or unsure → fixed in their shots; judge 2 (fresh agent, the fixed spans only): all 6 recovered (see below) |
| Frame 0 | legible and moving: "The Stolen Smile · Part 3 of 3" tab, "Last time…", the four hooks with the web and the spider, the drapes moving (`stills/frame0.jpg`) |
| Last second | "The end" card pinned under her (not over her face), glow at its brightest, final glint (`stills/last_frame.jpg`) |
| Temporal / flicker (YAVG) | found and fixed a hidden cut at 4.57 s (the ink spread was half done when the title world swapped in), and then the drapes vanishing at 4.67 s. The jumps left are designed: 8.3 s (red silk carrier pass), 56.2 s (Paris red ring pass), 32.2 s (the panel flips to its dark back). Consecutive-frame strips were checked at 4.2–4.9 s |
| Frame count after every splice | 2438 each time |

## Continuity (series)
- The kit was adopted from `stolen-smile-kit/film-kit`. I copied two snapshots before READY (45d7521 at 20:47, 16bed4d at 20:55), then **READY ce6aa37** (20:59). It went into `film/src/series/`, public assets and `sound/series/`.
- The kit supplied:
  - Cards: CornerTab, LastTime, TitleCard, NameTag, HonestyTag, EndCard "The end", Stamp.
  - Look and voice: the caption strip, SeriesGrade (sepia → modern wash for today).
  - Cast: Vincenzo (suit, shirt, smock ghost), Geri, Florence police, art lovers, Crowd, Spider.
  - Her: the Mona Lisa (public-domain photo).
  - Sets: SalonCarre, GeriDesk, PrisonCell, ModernLouvre, PaperMap.
  - Props: Hooks (the 1–2–3–4 count), QuestionMark → "!", FameGauge, Calendar, Trunk, Letter, Magnifier, Newspaper, Postcard.
  - Every series sound, at series.json gains.
- Part-only pieces, built in the kit style (`film/src/p3/`):
  - People: Poggi, Leonardo, the French king and two workers (kit Puppet with new Looks).
  - Sets and props: the hotel front, door 20, the top-down trunk interior (false bottom and red silk), the lira pile, the crack card, the tour poster and pop-up galleries, the ink map of Florence, the eraser, the pigeons and the doors.
- Recap: the four empty hooks with the web and spider, then the red "?" over Paris with one lit window, then the letter signed "Leonardo" writing itself. The ink drop spreads into Florence.

## What is synthetic / credits
- Voice: AI (Qwen3-TTS, design-m2 clone from the approved reference clip, seed 7).
- Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Mixed at the series setting (+12 dB, sidechain duck). Measured 8.6 dB under the voice during speech (1–4 kHz, voiced windows) and 4.5 dB higher in the pauses.
- Effects: the kit's series palette only (synthesized; stamp from the CC0 library). 44 cues in `film/sound/cues.json`, each tied to a visible event.
- Picture: all drawn in code. The Mona Lisa is the public-domain Wikimedia Commons photograph (C2RMF retouched).

## Instagram caption (draft; nothing posted)
The Stolen Smile, part 3 of 3: The return 🖼️
In 1913 a letter signed "Leonardo" reached an art dealer in Florence. In room 20 of a small hotel, under a false bottom and wrapped in red silk, was the Mona Lisa. The theft that emptied her wall made her the most famous smile in the world.

Notes: Some details differ by source.
- The price demand comes from the art dealer Alfredo Geri's account; Peruggia said he never named a price.
- The arrest was on 11 or 12 December 1913.
- His patriotic motive is doubted, since he tried to sell her.
- The sentence was 1 year and 15 days, cut to about 7 months on appeal (sources say 6, 7 or 8).
- "More than 100,000 in two days" is the Smithsonian's figure; History.com says at least 120,000.
- Leonardo most likely brought the painting to France in 1516, and King Francis I acquired it.
- Scenes are illustrations; the painting is a public-domain photograph.

Voice: AI. Music: "Floating Cities" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0.

## Mute test detail
- **Judge 1 recovered:**
  - the recap and the title;
  - Geri and the money;
  - the hotel, Poggi as the museum expert, room 20 and the white trunk;
  - the false bottom and the Mona Lisa;
  - the cracks, the seal and "Real!";
  - Vincenzo's arrest, his claim, and the claim being erased;
  - Leonardo taking her to France, the Italy tour, January 1914 back on the hooks;
  - 100,000+ in 2 days, about 7 months in jail, "She's back!", millions every year.
- **Missed or unsure, and the fix in each shot:**
  - Where the letter came from: tag "Florence, 1913".
  - What the money means: tag "He wants:" on the pile.
  - "Pretends to buy": tag "Pretend buyer".
  - The red silk was read as a curtain: a cord and knot, tag "red silk", and tag "false bottom".
  - "Bought": coins on the purse and tag "bought".
  - Who the ghost is: name tag "Vincenzo".
  - The payoff: a museum wall label above her, "The most famous smile in the world".
- **Judge 2 (fresh agent, fixed spans only):** recovered all six. It still noted:
  - the letter signed "Leonardo" could be confused with Leonardo da Vinci in a standalone viewing (part 2 sets up that the thief signed with the painter's name);
  - nothing in these frames links Vincenzo to the letter (the narration and part 2 carry it).

## Open issues
- The 28 s reveal is still below the bar's movers (see above).
- The end card hangs under her in today's room, not on the four hooks (no hooks there). It covers her hands, never her face.
- Listen for: the title sting and typewriter (4.5–6.5 s), the hook clinks 1–4 (≈60.3–61.2 s), the gauge pop (≈71.1 s), and the music level against the voice.
- Not done: no listening (Claude only measures); no full-size frame-by-frame review of every beat (2–3 hero frames only, at full size).

## Errors, rewrites and redesigns (UTC)
- 20:4x: my first adapter passed `look` into kit `Person`, which clashes with its Look prop. Switched to `Puppet look_`.
- 20:47–20:55: the first scenes used my own stand-ins. They were rebuilt on the kit's puppets, then on its sets and props as they landed.
- 20:55: the mix stem command used the wrong input slice (ffmpeg "Invalid file index 1"). Fixed.
- Motion redesigns:
  - 21:02: twinkling windows and birds in the recap; the pile starts early with a pigeon flock; amber motes; clouds and gulls on the map.
  - 21:07: the letter writes itself with a quill; Geri reads with a camera push; pigeons on the sill; her copy hops to Italy with a heart.
  - 21:12: moving drapes; the bubble comes earlier and larger.
- 21:2x: mute-test fixes (printed words on key objects, above).
- 21:4x: two re-renders of chunk 1 for the hidden cut at 4.57 s and the drapes pop.

## Timeline (from PLAN.md)
| Time (UTC) | Step |
|---|---|
| 20:30 | Start: VO and music jobs |
| 20:37 | pictures-pick landed |
| 20:40 | VO aligned, beats |
| 20:47 | Kit snapshot 1 |
| 20:52 | Stills sheet 1 |
| 20:57 | Stills sheet 2 |
| 20:58 | Preview 1 |
| 20:59 | Kit READY adopted |
| 21:07 | Preview 2 |
| 21:12 | Preview 3 |
| 21:16 | Mute render, judge 1 |
| 21:22 | Preview 4 (pass) |
| 21:24 | Full render |
| 21:35 | Mux and checks |
| 21:39 | Judge 2 |
| 21:45 / 21:51 | Chunk-1 fixes |
| 21:53 | Delivered |

## Production analytics (`templates/remotion-film/analytics.py`, this session's transcript)
| Phase | min | responses | tools | edits | renders | still batches | image reviews | subagents | out tok |
|---|---|---|---|---|---|---|---|---|---|
| Setup+plan | 13.0 | 34 | 35 | 3 | 0 | 1 | 0 | 0 | 21693 |
| Build | 19.0 | 39 | 41 | 17 | 2 | 2 | 2 | 0 | 94886 |
| Review+fix | 22.0 | 24 | 25 | 6 | 5 | 2 | 3 | 1 | 22092 |
| Render+deliver | 28.0 | 20 | 22 | 2 | 3 | 0 | 3 | 1 | 11087 |

## Stills (committed)
- `stills/sheet_1fps.jpg`
- Hero stills:
  - `stills/hero_28_6s.jpg`: the reveal
  - `stills/hero_60_8s.jpg`: back on the four hooks
  - `stills/hero_80_6s.jpg`: the end (v1.1)
- `stills/frame0.jpg`, `stills/last_frame.jpg`

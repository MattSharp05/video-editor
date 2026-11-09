# The Stolen Smile, Part 2: "The hunt": report

## v1.1 (current): continuity fixes, 2026-11-07 21:58–22:47 UTC
**Final file:** `projects/stolen-smile-2/renders/stolen-smile-2_v1.1.mp4` (git-ignored; delivered with SendUserFile).
2353 frames = 78.43 s. **−13.9 LUFS, −3.8 dBTP** (measured on the MP4). **motion_check PASS:** median movers
**18.5 vs the bar's 18.5**, no flagged seconds, ≤2-mover seconds 0 % (bar 11 %), nearly still 1 % (bar 36 %).
Stills replaced with v1.1 frames: `stills/sheet_1fps.jpg`, `stills/hero_6.2s.jpg`, `hero_59.6s.jpg`, `hero_77.6s.jpg`.

| # | Fix asked | Done |
|---|---|---|
| 1 | Kit `Staircase` at 42–44 s | Yes: kit set (floor drawn at 1300), my glass pane + thumbprint + frame slats on top; two officers with lanterns search the steps |
| 2 | Kit `PrisonCell` at 33–34 s | Yes: half scale under the poem-lines door, poet, officers; a pigeon hops at its barred window |
| 3 | Missing poster unobstructed | Yes: full photo as a sepia print fading in the sun (no crop/bar); "sigh…" moved beside the passer-by |
| 4 | Spider web inside "days turn into months" | Yes: the web scene now starts at l14 + 1.3 s (≈62 s): kit Salon Carré `empty+web` growing, kit Spider, calendar 1912 → 1913 |
| 5 | Kit `ParisStreet`, no red | Yes: kit street behind cabaret and postcard stand (lamp-post at x 900 holds the song sheet); my stage awning is now duskBlue. The red balloon on the kit's own `Postcard gag="balloon"` is kit art, left as is. |
| 6 | Tags legible above caption; Vincenzo tag | Honesty tags at y 1250 (letter's tag top-left at y 330, off the signature). The Vincenzo tag moved right (x 800) instead of being delayed: delaying it past the corner tab's exit (4.7 s) would have put it on the title card. |
| 7 | Near-empty frames, long floods | Pushes cut to 0.22 s a side (~7 frames, full flood only for an instant); fixed an inverted incoming iris (it shrank instead of growing). Vincenzo's window now shows rooftops and the "?" rising, so 56 s isn't empty. More life: moths + a third officer at the interrogation, drawers sliding, a cat chasing a mouse, bigger snow and leaves, clouds and birds over the map, part 1's guards strolling past in the recap, Geri's desk (steaming cup, envelope, cat's tail) under the letter. |
| 8 | End card centred, top at y 560 | Yes (centre y 655); Geri's face stays clear above the letter; the "painter's name" tag sits under the card. |

Not re-run for v1.1: the mute test. The changed shots keep the same events, and the shots the judges flagged were
already fixed in v1. Sound: the hook-hum cue moved to the web scene's new start; the mix is otherwise unchanged
(music 11.2 dB under the voice).

---

# v1 report (superseded by v1.1 above)

**Final file:** `projects/stolen-smile-2/renders/stolen-smile-2_v1.mp4` (git-ignored; delivered to the session with
SendUserFile). 1080×1920, 30 fps, **2353 frames = 78.43 s** (last word 76.84 s + 1.6 s tail; series range 70–89 s).
**Loudness:** −13.9 LUFS integrated, **−3.9 dBTP** true peak, measured on the final MP4 with `ebur128=peak=true`.
**Music under voice:** 11.2 dB below speech, about 6 dB louder in the pauses (measured from stems).

## Checks
| Check | Result |
|---|---|
| VO | AI clone, design-m2, seed 7, `gen_vo.py all 7`. 18 lines, all MATCH. Line 7: the ASR split "well-known" into two words, so `words.json` was set back to the script word (audio unchanged). |
| motion_check vs `grand-canyon-01_q.json` | **Fails narrowly:** median movers **16 vs 18**. Seconds with ≤2 movers: 0 % (bar 11 %). Nearly still: 3 % (bar 36 %). Change over 2 s: 0.80 (bar 0.36). First preview flagged s 40 and 74. Fix: officers pacing past the cell, a second policeman circling Picasso, bigger clue notes swinging on the pinboard, kettle steam and a wall clock in the room, birds past the window, and a pendulum clock, pigeons and moths in Geri's shop. **Still flagged: s 74**, the letter close-up while the signature writes. I'm defending it: the stillness is the cliffhanger, and the writing, Geri, the clock, the pigeons and the moths still move. The 16-vs-18 median is reported as an open issue. |
| Mute test 1 | Fresh agent, captions off, 2 fps sheets. It recovered every claim: the recap, the week-long closure, worldwide news, songs and postcards, the queue at the empty wall, Kafka, the poet jailed, Picasso questioned, both cleared, the thumbprint, the files sorted by measurements (as an inference), the police visit, the painting hidden, years passing, the letter to a Florence dealer. Misses: what the press machine was, a mirrored-looking glitch as the signature drew on, and whether "Leonardo" was an alias. |
| Fixes | Labelled the "Printing press". Replaced my stroke-drawn signature with the kit `Letter` (no glitch). Added a tag: "Leonardo = the painter's name!". |
| Mute test 2 | Second fresh agent, the reworked shots only (12–17, 50.5–60, 66–78 s). It recovered all three: the press spreads the news, the police leave and she is in the trunk, and "Leonardo" is a borrowed name. Remaining notes: the half-second colour floods at hand-offs read as empty; the honesty tags are small (kit size); "knock knock" is faint. |
| Frame 0 | Legible cover, already moving: the Salon Carré, the four empty hooks, the corner tab "The Stolen Smile · Part 2 of 3", the recap flat sliding in. |
| Last second | End card "Next: The return" pinned over the letter. The ink drop lands. No blur, no black. |
| Frame count | 2353 = round(78.435 × 30). Four chunks joined with the concat demuxer. Muxed with `apad` and `-t`, not `-shortest`. |
| Temporal | Crowd second (23 s) as 30 consecutive frames: no popping or sliding. YAVG flicker: every jump over 12 falls on a carrier push (the colour flood is the transition), except **46.07 s**, a hard switch inside the thumbprint shot from the maze to the drawer wall. Noted as a hidden cut. |
| Determinism | Frames come only from `useCurrentFrame()` and seeded `random`. A twice-rendered comparison was not run (skipped). |

## Stills (committed)
- `stills/sheet_1fps.jpg`: 1 fps contact sheet of the final.
- Hero stills: `stills/hero_6.2s.jpg` (title plaque on the "?"), `stills/hero_59.6s.jpg` (Vincenzo lifts the trunk lid,
  she glows), `stills/hero_77.6s.jpg` (letter signed "Leonardo", end card).

## Kit and continuity
- Kit commits used: 45d7521 (early core, adopted at 20:51) and **ce6aa37 (READY)**, re-synced at 21:10.
- Shared pieces come from the kit: grade, captions, cards (corner tab, "Last time…", title card, name tags, honesty
  tags, end card), every person (the kit puppet), the Mona Lisa, hooks / "?" / gauge / calendar / magnifier /
  thumbprint / trunk / letter / newspaper / postcards / spider, and the sets SalonCarre, LittleRoom, GeriDesk and
  PaperMap. Series sounds use `series_sfx.build_sfx` at the series gains.
- **Deviation:** I did not swap in the kit's `PrisonCell`, `Staircase` and `ParisStreet`; my own versions use the kit
  tokens. The back staircase is the part-1 callback, so a continuity judge may spot it. Swapping it in is the first
  thing to do in a revision.
- Part-only pieces (kit style): doll's-house Louvre, printing press and world map, cabaret stage and postcard stand,
  pinboard, interrogation lamp, cell door made of poem lines, files wall, window of seasons, Missing poster, rooftops.

## What is synthetic or sourced
- Voice: AI (Qwen3-TTS clone of the design-m2 reference). Music: "Floating Cities", Kevin MacLeod (incompetech.com),
  CC BY 4.0.
- Effects: the kit's series sounds (synthesized, plus the CC0 rubber stamp). Knock, door, camera flash and ink drop
  are synthesized in `film/sound/mix.py`.
- The Mona Lisa: public-domain photo (Wikimedia Commons, C2RMF retouched, PD-Art), via the kit. Everything else is
  drawn in code.

## Instagram caption (draft, not posted)
The Stolen Smile, Part 2: The hunt 🔎 The Louvre shut for a week. The whole world read about her. Police jailed a poet
and questioned Picasso, but the thief was hiding her in his little room all along. Then, in 1913, a letter arrived in
Florence, signed "Leonardo"… Part 3 next.

Notes: Apollinaire was held between 3 days and about a week, depending on the source. Sources disagree on the
thumbprint: one says the files couldn't be searched by fingerprint, another that police never checked his prints.
Sources disagree on where in his room the painting was kept (a trunk, a table or a crate). Kafka visited in September
1911, before he was famous. The signature is reported as "Leonardo", "Leonardo V." or "Leonard". Illustrations are
not to scale, and the letter's words are not quoted.
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0. Voice is AI-generated.

## Open issues
- motion_check median 16 vs 18 (s 74 flagged, defended above).
- Hard switch at 46.07 s inside the thumbprint dive (maze → drawers).
- Colour-flood hand-offs read as briefly empty when muted (judges 1 and 2).
- Prison cell, staircase and street are not the kit's sets (see Kit and continuity).
- Picasso's cubist face shuffle is subtle at phone size.
- The kit's honesty tags are small at phone size (series-wide; the kit owns the size).

## Errors hit and rewrites (machine clock, UTC)
- 20:30: the detached HEAD was checked out to the branch. `sox: not found` warning from qwen-tts (harmless).
- 20:31: the stand-in timing at 2.8 w/s gave 91 s; re-set to 3.1 w/s (~82 s). The real VO was 78.4 s.
- 20:40: line 7 DIFF (well-known split); `words.json` fixed in two passes (the first merge missed the "-known" token).
- 20:49: TypeScript error (Geri `lookY`), fixed.
- 20:51–20:55: adopted the kit early (cast, cards, captions, grade) and rebuilt every person through a kit-puppet adapter.
- 20:58: motion_check fail (16 vs 18; s 40, 74). The dust motes I added didn't register: below the tool's blob size.
  Redesigned with real movers instead (21:05).
- 21:08: mute test 1 found the press, signature and alias misses. Fixed.
- 21:10: kit READY. Swapped in props and sets: the room was rebuilt on the kit's LittleRoom with a new search path; the
  letter, desk and map were rebuilt on kit pieces.
- 21:11: an empty Plane after removing name tags broke the type check (children made optional).
- 21:14: alias tag sat under the end card; moved.
- 21:19: full render, 4 chunks of 600 frames, about 9.5 min. Mux and loudness ok on the first pass.

## Timeline (from `film/PLAN.md`)
20:30 start (VO + music jobs) · 20:37 pictures-pick landed · 20:38 plan · 20:40 VO done · 20:49 all stages built ·
20:51 kit core adopted · 20:58 preview 1 + motion_check · 21:07 motion fixes · 21:08 mute test 1 · 21:10 kit READY
sync · 21:15 mute test 2 · 21:19 final preview, full render · 21:29 render done · 21:31 mux, checks, delivery.

## Production analytics (`templates/remotion-film/analytics.py` on this session's transcript)
| Phase | Minutes | Responses | Tool calls | Renders | Still batches | Image reviews | Subagents | Output tokens |
|---|---|---|---|---|---|---|---|---|
| Setup | 11.0 | 43 | 46 | 0 | 2 | 0 | 0 | 32583 |
| Build | 17.0 | 33 | 34 | 1 | 3 | 2 | 0 | 83299 |
| Review | 21.5 | 36 | 36 | 5 | 3 | 4 | 2 | 37764 |
| Render | 11.5 | 11 | 12 | 0 | 0 | 1 | 0 | 5476 |

## Delivery size (2026-11-09)
Matthew: the file must be under 50 MB. `renders/stolen-smile-2_v1.1_small.mp4` = **42.2 MB**: two-pass x264 (preset slow,
4.1 Mbit/s video) from the 81.8 MB crf-18 master, audio copied unchanged. 2353 frames, −13.9 LUFS, −3.8 dBTP;
SSIM 0.9906 against the master. Command (from `renders/`):
`ffmpeg -i stolen-smile-2_v1.1.mp4 -c:v libx264 -preset slow -b:v 4100k -pass 1 -an -f null /dev/null &&
ffmpeg -i stolen-smile-2_v1.1.mp4 -c:v libx264 -preset slow -b:v 4100k -pass 2 -pix_fmt yuv420p -movflags +faststart -c:a copy stolen-smile-2_v1.1_small.mp4`

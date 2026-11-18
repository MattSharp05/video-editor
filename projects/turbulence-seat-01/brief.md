# Turbulence seat 01 (brief)

Status: v3 rendering (2026-11-18): the transitions are cuts. Script v0.3, board v1, skill updated (video-script picture-first). Purpose: test a new way of
working that Matthew proposed on 2026-11-16/17: plan the video and scout assets first, write the script
around what was found, describe the picture shot by shot (look sheet + start frame / action / end frame
with numbers), then render reference frames from that description.

## Facts
- Topic from Matthew (2026-11-16): "best seat to sit in an airplane to avoid turbulence".
- Instagram Reel 9:16, 30 fps, 41.0 s, goal reach.
- Voice (Matthew, 2026-11-17: "use that voice", the one his other session is designing in `lab/voice-match` on
  branch claude/dreamy-volta-pe6uy1): his round-1 pick **m5** "Warm friendly narrator" (Qwen3-TTS VoiceDesign, seed 7),
  re-rendered as the reference (`vo/ref_m5.wav`, his picked setup line) and every line cloned from it with the Base
  model (`vo/gen_vo.py`, `vo/run.sh`). Round 2 (six m5 variations) had no pick yet; swap = regenerate the reference,
  re-run lines, `assemble.py`, `align.py`, `fix_words.py`, re-render (the film re-times from words.json).
- VO: 10 lines, 38.8 s of speech, 2.84 words/s. Transcript matches the script; ASR heard "feel at least" for "feel it
  least" (line 7: listen) and "seat belt" (merged), both fixed in `vo/fix_words.py`.
- Sound: `film/sound/mix.py`, 18 cues (4.4 per 10 s), CC0 library + synthesized noise (wind, cabin hum, bump rumble);
  Floating Cities at +6 dB measures 11.1 dB under the voice in speech (target 10-12).
- Concept: a 757 turns to glass; three giant cups (front, middle over the wing, back) show the plane
  rocking like a seesaw around its centre of gravity near the wing root; ends on the seat map and a
  seatbelt.
- Stand-in timings: `film/standin_words.py` at 2.8 words/s. Re-time from the real VO with `align.py`.

## Assets (all CC BY 4.0 via Sketchfab; caption credit)
- "Airliner Boeing 757 Transparent" by Arion Digital (sketchfab.com/3d-models/761a094f337945e48182b3f28a3e5183).
  Changed: engine internals and landing gear removed, decimated 824k → 225k triangles, hull re-materialled.
- "Seat" by maximmus (sketchfab.com/3d-models/8336f7cd7d1d438182d349e8e7bdb085). Full detail for the
  hero seat; a 4k-triangle copy for the rows. Belt split in the shader so it can open and close.
- Built in code: sky (realism kit), cloud deck, cabin shell, cups and water, trails, pivot, wedge.
- Model files stay out of git (sourcing.md); `film/models-prep/README.md` rebuilds `film/public/models/`.

## Fact check (fresh agent, 2026-11-17; sources: NTSB SS-21-01, Boeing 757 airport planning doc)
- Holds: heave + pitch about the CG; CG near the wing root; back rows feel it most (NASA 757 tests:
  +40 % at the aft galley vs the CG, +12 % at the pilot seat; partly tail flex; unpublished data).
- Reworded: "The middle one barely moves" → "moves least"; "Most people hurt…" → "Most passengers
  seriously hurt by turbulence weren't wearing one." (17 of 26 seriously injured passengers documented
  unbelted, 2009–2018).
- 757-200: 47.32 m long, 38.05 m span (Boeing). Our model has no winglets.

## Guidance read
- 2026-11-17, step 1 (script/concept): animated-video SKILL.md, references/direct.md,
  references/motion-principles.md; video-script SKILL.md and references/explainers.md (2026-11-16).
  Skipped: the fresh brainstorm and picker agents (the concept came from the planning test Matthew asked for).
- 2026-11-17, step 2 (look): styles/README.md, styles/realistic-3d/README.md, references/look-pass.md.
- 2026-11-17, step 3 (audio): references/ai-voiceover.md, real-sfx/references/studio-sound.md, ~/.video-edit/profile.md.
- 2026-11-17, steps 4–5 (board): references/remotion-pipeline.md, templates/parts/README.md,
  references/three.md, references/sourcing.md (2026-11-16).

## Caption credits
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS).
"Airliner Boeing 757 Transparent" by Arion Digital and "Seat" by maximmus, CC BY 4.0 via Sketchfab.

## Board v1 open issues
- Beat 8 seat map: fixed in v1 (glowing row blocks; the glass hull had been writing depth and hiding them).
- Beat 10: the coral flash was cut (the camera can't see it).
- Beat 6 wedge reads as two light beams more than a solid fulcrum; beat 3 spill reads as spray, not a slosh.
- Window moves built (in at 2.75 s with glare, out at the end); exposure follows the camera's depth inside the hull.
- No sound yet.

## Checks on v1 (2026-11-17)
- Flicker scan (YAVG per frame): one-frame white flash at 4.43 s (roof exit) -> glare over it; the dive (32.9-34.3 s)
  rolled the camera and passed through an overhead bin -> straight down the aisle, forward = top of frame; flat yellow
  frame at the window exit -> glare re-timed, windows warm white.
- Mute test (fresh judge, captionless frames at 2 fps): main point recovered ("pick a seat over the wing"); most
  shareable: the top-down seat map with "smoothest rows". Fixed: 10-14.5 s static (the bounce now draws three equal
  strokes before the rock splits them; middle-cup pulse on "moves least"); the wedge unclear ("pivot? lift?") ->
  "balance point" label; blank wall at 39 s -> glare covers the turn. Not changed: front/middle cups never spill (by
  design: they slosh / tremble), the 34.5-38.5 s belt hold (under the last line).
- Motion check: not run (no accepted bar film on this machine); the flicker scan and the judge covered it.

## Outstanding corrections
- 2026-11-18, Matthew: "fix the glitch at 40 seconds. there are a few glitches at the transitions. we dont need a single
  shot in this one" -> v3: the four hull crossings are hard cuts (CUT_IN/ROOF/DIVE/OUT in `film/src/timeline.ts`), no
  glare overlay; whooshes peak on the cuts, cabin hum and wind start and stop on them. Frames 0-284 and 860-1228
  re-rendered and spliced into v2's picture (`partial.sh`). Verify in the v3 export.

## v2 delivered (2026-11-17)
- `film/out/v2.mp4`: 1,229 frames, 40.96 s, 42.7 MB, -14.3 LUFS, true peak -1.8 dBTP (measured on the MP4).
  `mux.sh` now re-encodes the picture (x264 crf 19, max 8M): the chunk render's max rate didn't hold (206 MB).
- Flicker scan: glare ramps only, except 40.07-40.13 s, where the exit move clips the cabin wall for ~3 frames under the
  glare (seats flash through). Not fixed yet: a ~20-frame partial re-render with the exit key moved off the wall.
- Not listened to by Claude (measured only): line 7 "feel it least", music level, seatbelt click, the spill.

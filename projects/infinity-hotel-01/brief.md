# Infinity hotel 01 (brief)

Status: v1 delivered (2026-11-25, `renders/infinity-hotel-01_v1.mp4`, not in git); not yet queued on Broadcast (no content API key in this environment); script v0.2 (fact-checked). Unsupervised: every decision is logged; approvals go to fresh judge agents.

## Request
Matthew, 2026-11-25: "Can you make a video 3d style. Title "trying to conceptualize infinity"? Use our skills and then
add to our storytimescroll account that has 8 followers (the older one) for next available slot."

## Facts
- Title: "Trying to conceptualize infinity". 3D explainer, same series rules as s1–s4 (voice m5, Floating Cities).
- Format: Instagram Reel 1080x1920, 30 fps, ~50-55 s, captions on, hook by 3 s. Goal: reach (saves and shares).
- Voice: AI m5 (`library/voices/m5`). Music: Floating Cities (Kevin MacLeod, CC BY 4.0), 10-12 dB under the voice.
  SFX: CC0 cstack `sfx-29`–`sfx-61` or synthesized.
- Delivery: -14 LUFS, true peak < -1.5 dBTP, < 50 MB, measured on the MP4.
- Destination: Broadcast, @storytimescroll (the older account, 8 followers), next open slot. Posting only through
  Broadcast's scheduler (content API queues it).

## Decisions
- 2026-11-25 topic: **Hilbert's hotel, then Cantor's diagonal.** The way to picture infinity is a place you can walk
  through: a motel with endless rooms that is full, yet fits one more guest (everyone moves up one) and an endless bus
  (everyone doubles their room number). The turn: the numbers between 0 and 1 can't all get rooms (Cantor's diagonal
  builds a number that differs from every room's), so some infinities are bigger than others.
- Rejected: "infinity is not a number" alone (no event to show), Zeno's paradox (a sum, not a size), the infinite
  monkey theorem (probability, needs huge counts to feel), Gabriel's horn (needs calculus to land).
- World: a roadside motel at night (luminous 3D: the light comes from the rooms, the neon sign and the bus). The
  "NO VACANCY" sign is the film's mute-readable state: "NO" goes dark when a room is free.
- Guests are simple capsule figures (built in code), so the doors, lights and moves carry the idea. Built in code, not
  sourced: the motel and the bus must repeat endlessly and change state on cue (picture-first: build what is the lead
  or thread).

## Guidance read
- 2026-11-25, plan/script (after merging main af8d2cd): animated-video SKILL.md, references/direct.md,
  references/motion-principles.md, styles/README.md, styles/luminous-3d/README.md, references/look-pass.md,
  references/three.md, references/remotion-pipeline.md, templates/parts/README.md, references/ai-voiceover.md,
  references/review.md; video-script SKILL.md, references/picture-first.md, references/explainers.md; all four
  profiles; broadcast-factory SKILL.md; library/voices/m5/README.md; s2-buffon-matches brief, script and film as the
  bar.
- Skipped: the brainstorm and picker agents of direct.md (the picture-first plan sets every beat's picture, as in the
  s1–s4 films); a fresh concept judge and fact-checker review instead. Scout skipped: nothing in the film is a
  recognisable real object that code can't make (motel, bus, figures, signs are repeated and state-driven).

## VO
- 14 lines in m5 (`vo/lines.json`, cloned from `library/voices/m5/ref_m5.wav`), 19–36 s a line. Assembled with longer
  pauses at the turns: 55.15 s. Aligned with faster-whisper: 151 = 151 words; `vo/fix_words.py` writes the script's
  words back (the ASR wrote numbers as digits).
- Not listened to: the whole take (measured only). Words to check by ear: "φ", none spoken; "infinities", "digit".

## Build
- `film/src/timeline.ts` (every state from the words), `Scene.tsx` (motel ×400 rooms, sign, bus, 621 guests, 40 number
  boards, moths, passing cars, the left-out crowd), `Film.tsx` (labels, the new-number card, "≠" marks, title).
- Board stills fixed in four rounds: camera too far (guests ~20 px), sign cropped on the cover, the bus hiding the
  doubling (camera raised over it), the roof hiding the windows (eave narrowed so odd rooms read dark from above), the
  new number covering the room's digit (it passes above the boards; "≠" under them).

## Sound
- `film/sound/mix.py`: 50 cues (8.9 per 10 s), CC0 cstack set + synthesized night air, engines and brakes. Floating
  Cities at +11.5 dB measures 11.0 dB under the voice during speech (stems). Mix -14.0 LUFS, -2.0 dBTP.

## Checks before the full render
- Motion check (quarter-scale preview, 42 min, bar `library/bars/s3-jet-engine_q.mp4`): FAIL, movers median 16 vs 50,
  holds at 1–6, 10, 12, 16, 25, 45, 48, 50, 54, 55 s. Fixed: the hook fills (windows light in a wave racing to the
  horizon, guests step out, "NO" flicks on at 1.3 s), guests sway, moths at every lamp, car lights pass far down the
  road, boards float, the end crowd drifts. Re-check on the hook and ending segments: still FAIL at 1–5 s and 45–55 s
  (movers 18–20): those seconds are a steady camera dolly over the row; the only bar film here is a dense particle
  machine. Logged, not patched with camera shake.
- Mute test (fresh judge, preview frames, captions masked): recovered the whole idea (Hilbert's hotel, the endless
  bus, the diagonal number with no room, some infinities bigger). Fixed: move labels bigger (64 px), "≠" marks bigger
  and longer, thicker digit underline, ending labels "every room: full" / "numbers left out". Not changed: "dull"
  stretches 3–7, 15–17, 29–34 s carry narration (the checkout wave runs at ~33 s).

## Checks on v1
- Full render: 1,685 frames in 6 chunks, ~46 min at concurrency 4 (22:01-22:47). The last chunk first asked for 1,691
  frames (render_chunks.sh assumes VO end + 2.2 s; this film ends at + 2.0): re-run with TOTAL=1685.
- Flicker scan: two steps, both events: 38.8 s (the rooms light as the numbers land) and 51.1 s (the reshuffle empties
  the rooms). No bounces.
- Labels near the frame edge were cropped (e.g. "every number fr…" at 37 s): clamp by text width; 7 ranges (~340
  frames) re-rendered with partial.sh and spliced; frames either side checked.
- Motion check on the full cut: FAIL as on the preview (movers median 14 vs 50; flagged 1-6, 10, 12, 16, 25, 45, 48,
  50, 55 s). Logged above; not patched.
- Delivered MP4 (`mux.sh`): -14.0 LUFS, true peak -2.4 dBTP, 34.0 MB, 1,685 of 1,685 frames, 56.2 s. Cover: frame 30
  (`renders/cover.jpg`).

## Never listened to (measured only)
The m5 voice (whole take), the neon flick clicks, the bus engine and brakes (synthesized), the moth-free night air,
the music level (measured 11.0 dB under speech).

## Outstanding corrections
None yet.

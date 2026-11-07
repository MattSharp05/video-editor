# Lightsaber 01: benchmark notes (unattended run, 2026-11-06/07)

Matthew gave only the topic and "don't ask for my approval just make the video" to test the skills as they stand. These
are Claude's notes for the reflect step: what worked, what broke, what each skill is missing. Nothing here has been
changed in the skills; each item is a proposal for Matthew to accept or reject.

## Result
`renders/lightsaber-01_v4.mp4` (git-ignored; 68.4 s, 1080x1920, 30 fps, -14.5 LUFS, -1.9 dBTP). Four versions: v1 full
render, then partial re-renders: v2 (thermometer camera, crystal framing, recap orbit), v3 (beam-follow camera),
v4 (mute-test labels).

## Time (machine clock; wall time from topic to delivery ~2 h 15 min)
- Research, script, fact-check, picture agents, first 3D build: ~23:44-00:20.
- Voice (13 lines, CPU, ~6 min), board stills and two fix rounds: ~00:20-01:16.
- Full render 55 min (2052 frames, ~1.6 s/frame on 4 cores) + partial re-renders ~30 min + mute test + splices.
- Render waits were about half the wall time, as on Grand Canyon 01.

## What the skills did well
- video-script + the unmerged hook bank/checker (branch `claude/gracious-mayer-o7hoo6`, cherry-picked here): three
  hooks on different formulas, a clean checker run; its "name spoken but not shown" flags added useful cards.
- Fresh-agent fact-check caught a real error ("kyber crystals power the Death Star's gun": canon says a hypermatter
  reactor powers it, crystals channel it) and five overstatements.
- Fresh brainstorm + separate picker produced the film's device (one zoom in and back out) in under 2 minutes.
- Stills before renders caught ~15 problems (hidden station, hood filling frame 0, fogged laser, off-screen labels...).
- The mute test found three things the picture didn't say (burning hand, heat-scale order, clash mechanism); fixed by
  partial re-render in ~10 min instead of a full one.
- motion_check: median 20 movers/s against Grand Canyon's recorded 11: the "movie, not presentation" rule held.

## What broke or was missing (proposals)
1. **Quarter-scale preview saves nothing here.** The canvas is a fixed 1080x1920, so `--scale=0.25` only scales the
   screenshot; the preview cost the same as the full render. Proposal: in `remotion-pipeline.md`, size the canvas from
   the composition scale (or render the preview at 10 fps with `--every-nth-frame` where supported), or allow the
   motion check on the first full render plus partial re-renders, as done here.
2. **motion_check needs a bar film that cloud sessions don't have** (renders are git-ignored). Proposal: commit the bar
   film's readout (movers per second) as a small JSON and let `--bar` take it.
3. **align.py breaks with the current faster-whisper + PyAV** (`metadata_errors`). Fixed locally by decoding with ffmpeg
   (`film/align.py`); the template should take the same fix.
4. **The video-script upgrade lives only on an unmerged branch**; main still has the older skill. Merge it.
5. **Hook format:** the checker flags "Most people think a lightsaber is a laser" as "nothing checkable"; "this" passes.
   Fine, but the profile's favourite format ("Most people think...") often won't name a number; worth a note.
6. **Profile asks per video which voice to use;** in an unattended run there is no one to ask. Proposal: a default
   (design-m2 for explainers) when the brief says "don't ask".
7. **Own mistakes worth a rule:** (a) camera keys 0.16 s apart for a 1 km move read as a cut (v1-v2 at 57 s): check the
   speed between keys, not just the keys; (b) labels pinned beside a subject run off screen in close shots: prefer
   centred cards for anything that must be read; (c) MeshBasicMaterial blades take scene fog (the far beam vanished):
   emissive things get `fog: false`.

## Skipped by instruction or environment (say so in delivery)
Concept and board approval, voice choice, Sound Picker picks (sounds chosen by measurement, not by ear), the bar film for
motion_check (used its recorded numbers), and listening (Claude can't hear: moments to check are in the delivery).

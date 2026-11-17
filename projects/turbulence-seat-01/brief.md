# Turbulence seat 01 (brief)

Status: script v0.3 + key-frame board v1 (2026-11-17). Not animated yet. Purpose: test a new way of
working that Matthew proposed on 2026-11-16/17: plan the video and scout assets first, write the script
around what was found, describe the picture shot by shot (look sheet + start frame / action / end frame
with numbers), then render reference frames from that description.

## Facts
- Topic from Matthew (2026-11-16): "best seat to sit in an airplane to avoid turbulence".
- Instagram Reel 9:16, 30 fps, ~44 s, goal reach. Voice: not chosen yet (Matthew or AI voice; ask).
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
- 2026-11-17, steps 4–5 (board): references/remotion-pipeline.md, templates/parts/README.md,
  references/three.md, references/sourcing.md (2026-11-16).

## Board v1 open issues
- Beat 8 seat map: the amber→coral gradient washes to a pale band from above. Fix: a flat coloured map layer.
- Beat 10: the coral flash at the back can't be seen from the buckle shot; cut it or turn the camera.
- Beat 6 wedge reads as two light beams more than a solid fulcrum; beat 3 spill reads as spray, not a slosh.
- Camera keys pass straight between beats; the pass-through-window move (beats 1→2, 10→1) isn't built.
- No sound yet.

## Outstanding corrections
None from Matthew yet.

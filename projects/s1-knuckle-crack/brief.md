# s1 Knuckle crack (brief)

Status: building (2026-11-19). 3D explainer series, session 1 of 5 (area: the human body and health), video 2 of 2.
Unsupervised: decisions logged here; approvals go to fresh judge agents.

## Facts
- Format: Instagram Reel 9:16, 1080x1920, 30 fps, 30-45 s, captions on, goal reach.
- Voice m5 (`library/voices/m5/`); music Floating Cities ducked 10-12 dB; CC0 sfx-29-61 or synthesized only.

## Decisions
- 2026-11-19 Topic: "Lots of people think cracking your knuckles gives you arthritis": the pop is a gas bubble forming
  in the joint fluid, and the studies found no link. Why: one of the most common health myths, a satisfying mechanism
  that only a cut-away can show (the bubble appears in the gap), and a famous one-man experiment (Unger, 50 years, one
  hand) that is a picture on its own. Different from video 1 (anatomy position + CPR).
- Hook wording: the series' "Most people think" format, softened to "Lots of people think" (the only poll found, 42 %,
  couldn't be verified at its source; "most" is unsupported).
- Build or source: the hands are our kit's rigged hand (WebXR generic-hand, MIT), placed by the wrist with
  `film/src/khand.tsx` (from s1-heart-middle) so fingers can curl into a fist. The joint is built in code at real size
  in millimetres (lathe profiles: the hand bone's round head, the finger bone's cup, cartilage caps, fluid lens,
  capsule) and shown as a section (the near half clipped), because a real knuckle's gap is hidden inside the socket.
  Scouted and not used: "Hand Skeleton&Skin" (Sketchfab, CC BY, 30k): static, bones as one mesh, and the gap still
  hidden; "Hand Bones" (270k). No sourced models in this film: no CC BY model credits needed.
- Cuts: CUT_IN on "Each knuckle" (push in on the index knuckle, cut inside the joint), CUT_OUT on "One doctor"
  (inside the joint -> two hands on the desk).
- Colour meanings: coral = the myth (the scary crack at the desk), gas pale cyan = the bubble and the pops in the
  experiment, amber = the answer (cartilage intact, the counter, "no arthritis", "no link"); fluid gold at normal
  pressure, blue when the pressure drops.

## Guidance read
- 2026-11-19: same pages as s1-heart-middle (video-script SKILL.md + picture-first.md; animated-video SKILL.md, direct,
  motion-principles, styles/realistic-3d, look-pass, ai-voiceover, remotion-pipeline, parts README, three, sourcing,
  characters, review incl. fact-check; real-sfx studio-sound), read this session for video 1 and applied again.

## Fact check
Fresh agent, 2026-11-19; table in `script.md`. Reworded lines 5, 7, 8, 12.

## Lessons for the skills
- A section view (`clippingPlanes` on the near half, back faces shaded as the cut) is the cheap way to show what
  happens inside a closed joint or machine in three.js; without it the knuckle's gap was hidden by the socket rim.

# s1 Heart in the middle (brief)

Status: building (2026-11-19). 3D explainer series, session 1 of 5 (area: the human body and health), video 1 of 2.
Unsupervised: Matthew is not answering; every decision is logged here and approvals go to fresh judge agents.

## Facts
- Format: Instagram Reel 9:16, 1080x1920, 30 fps, 30-45 s, captions on, goal reach (series default) with saves as a
  second goal (the CPR line is useful to keep).
- Series standard: `projects/turbulence-seat-01` (realistic three.js in Remotion, one idea, a giant visual device,
  m5 voice, Floating Cities).
- Voice: m5 (`library/voices/m5/`, cloned from `ref_m5.wav`). Music: Floating Cities, ducked 10-12 dB under the voice.
- Sound effects: CC0 `sfx-29`-`sfx-61` (`library/sfx/cstack-cc0`) or synthesized only.

## Decisions (logged because no one is answering)
- 2026-11-19 Topic: "Most people think your heart is on the left. It sits in the middle, behind the breastbone, tilted
  so its tip points left; so CPR goes in the centre of the chest." Why: a myth almost everyone holds (hand on heart),
  a 3D picture settles it in one look (a glass body with the real heart on a centre line), and the payoff is useful
  (where to push in CPR). Not in another session's area; not a repeat of any project in `projects/`.
- Rejected topics for this video: 10 % of the brain (overdone), blue blood in veins (skin optics hard to make real in
  three.js), tongue map (kept as a backup), knuckle cracking (kept for video 2).
- 2026-11-19 Slug `s1-heart-middle`; branch `claude/s1-body-myths` (the session started on claude/focused-allen-fptw8e,
  which the brief forbids).

## Plan (picture-first step 1)
- Angle: your heart isn't on the left; it's in the middle, tilted left; that's why CPR goes in the centre. Goal: reach,
  saves. Stake: anyone might have to do CPR.
- Hook picture (0-2 s): a hand slaps flat on the left of a man's chest, pledge-style, and a glowing heart lights up
  under it. Already moving.
- Key moments: (1) the body turns to glass and the glow under the hand is empty: the real heart sits in the middle,
  behind the breastbone; (2) a giant amber centre line (a sheet of light from head to toe) cuts the body in half and
  runs through the heart; (3) the heart's tilt: an axis line from its base to its tip swings down-left, and the tip
  pulses right under the hand ("that's the beat you feel"); (4) the hand slides to the centre, the second hand stacks,
  the breastbone presses in and the heart squeezes between breastbone and spine with each push.
- Thread: the hand (pledge -> CPR). Carriers: the hand's glow -> the heart's tip; the centre line -> the push spot.
- Build or source: body, ribcage, heart sourced (organic, recognisable); hand from our kit (rigged, MIT); the centre
  line, axis, pulses, glass and press built in code.

## Assets (scout 2026-11-19; all Sketchfab CC BY 4.0 unless noted; caption credit)
- "Human Heart 3D Model | Anatomy | Medical Project" by Mesh-Magnet, sketchfab.com/3d-models/5da08bb137014f0392c69f9997f777cd,
  20k tris, static. Chosen over two others (990k, 23k) for clean shape and readable vessels.
- "Thorax" by valchanov, sketchfab.com/3d-models/c918b12c4e0c4625a5ad0392bb7d0354, 2.22M tris -> simplified to 154k
  (meshopt, ratio 0.07). Ribs, sternum, costal cartilage and spine. Chosen over "Human Spine and Rib-cage" (no
  sternum, toy colour) and "Thoracic Cage" (823k).
- "Human Base Mesh 01" by 3D Sculpt Daily, sketchfab.com/3d-models/a2a8c76b92b2487996a98c0299f9cba0, 40k tris, static,
  1.94 m tall. Chosen over two smoother base meshes (one T-pose).
- Hand: our kit's rigged hand (WebXR generic-hand, MIT, Copyright 2019 Amazon; no caption credit needed).
- Model files stay out of git (`film/.gitignore`); `film/models-prep/README.md` rebuilds `film/public/models/`.

## Guidance read
- 2026-11-19, step 1 (plan/concept): video-script SKILL.md, references/picture-first.md; animated-video SKILL.md,
  references/direct.md, references/motion-principles.md (incl. "Hard cuts are allowed"); ~/.video-script/profile.md,
  ~/.animated-video/profile.md. Model project: turbulence-seat-01 brief, script, timeline.ts, Scene.tsx, Film.tsx.
- 2026-11-19, step 2 (look): styles/realistic-3d/README.md, references/look-pass.md.
- 2026-11-19, steps 4-5 (build): references/remotion-pipeline.md, templates/parts/README.md, references/three.md,
  references/sourcing.md, references/characters.md (hands), kit hand.tsx header.

## Lessons for the skills
(filled in as they happen)

# s1 Heart in the middle (brief)

Status: v3 delivered (2026-11-19), `renders/s1-heart-middle_v3.mp4` (git-ignored; sent in the session). 3D explainer series, session 1 of 5 (area: the human body and health), video 1 of 2.
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

## Board verdict (fresh judge standing in for Matthew, 2026-11-19)
APPROVE WITH FIXES. Kept: the centre line through the heart, the glass reveal, the lean with its axis and ⅔/⅓, the
single cut, the blood line. Fixed (board v2, `stills/board_v2.png`): CPR posture (heels stacked on the lower half of
the breastbone, fingers lifted, top hand's fingers curled through, arms near vertical: new `film/src/khand.tsx`,
the kit hand placed by its wrist with a free forearm); the squeeze shown from the side at chest height; beat 7 (hand
on the left with the coral glow, then the slide) boarded; hook tighter (cropped at the chin), coral glow thumping with
ring pings, glass wiping down from the shoulders from "left side"; ribs dimmed (40 %) and the heart lifted; coral =
the myth spot / don't, amber = the answer (axis amber, apex rings coral at the myth spot); breastbone beat in full
profile; heart centre moved 2.3 cm left so the picture matches ⅔/⅓; lying cut framed from beyond the feet (head at the
top), brighter glass rim; blood beads per push, head lights on arrival; ending: amber centre lit, coral left dim.
Not changed: the upright-then-lean heart (a device; the judge accepted it); skin tone of the kit hands made less
orange (#9b7b6a) rather than replaced.

## Fact check
Fresh agent, 2026-11-19; table in `script.md`. Reworded lines 1, 4, 5, 9, 10; push depth 5 cm -> 5.5 cm.

## Voice and sound
- VO: 11 lines, m5 clone (seed 7), 32.1 s, 100 words (3.1 words/s). Transcript matches the script word for word
  (`vo/check_words.py`). Lines 0, 3, 4, 8, 9 regenerated after the fact check.
- Mix (`film/sound/mix.py`): 8 tracks: synthesized heartbeat (70 bpm, stops on the cut) and chest pushes (110/min, from
  the same formula as the picture), CC0 glass-ting, whoosh-fast, whoosh-deep x2 (one peaking on the cut), impact-deep,
  a synthesized low swell under the blood. Floating Cities at +7 dB measures 11.0 dB under the voice in speech
  (`sound/measure.py`). Mix -14.0 LUFS.

## Checks on v1 (2026-11-19)
- Render: 999 frames, 4 chunks at concurrency 3, ~70 min with the video-2 voice job sharing the CPU.
- Flicker scan (YAVG per frame): one step at 15.17 s (= CUT_CPR); a 4-frame rise at 6.8 s is the camera turning from
  the dark side view to the lit wall (checked in a 24-frame strip). The centre-line sweep had started while the camera
  was still at 3/4 (a wide amber band): moved after the turn and patched (`partial.sh`, frames 195-285 -> v2).
- v2 muxed: 33.3 s, 999 frames, -14.2 LUFS, true peak -1.7 dBTP, 34.3 MB.
- Mute test (fresh judge, captionless frames every 0.5 s): main point recovered ("the heart sits near the middle,
  behind the breastbone, ⅓ right / ⅔ left; CPR on the centre, 100-120 a minute"); most shareable: the ⅓/⅔ frame.
  Fixed for v3: the floor/wall seam read as "the bottom edge of a glass plane" (floor hidden while standing, wall
  extended); the glass wipe's hard edge (softened); the CPR hands read as "near the collarbone" because the camera
  looked along the body from low (now near-overhead: the hands sit on the lower breastbone over the heart); labels
  "push here: lower breastbone" and "blood to the brain". Not changed: the lying body is the same mesh seen from
  another angle (the judge read it as a different, heavier man: a side effect of the wide lens from above); the hold
  at the end (pushing continues under the rate label).

## v3 delivered (2026-11-19)
- Full re-render (v3): 999 frames, 33.3 s, -14.2 LUFS, true peak -1.7 dBTP, 34.7 MB (measured on the MP4).
- Flicker scan: only the cut (15.17 s) and the camera turn to the lit wall (6.8 s). Contact sheet: `stills/v3_contact.png`.
- Not listened to by Claude (measured only): the synthesized heartbeat and chest pushes (level and feel), the whoosh on
  the cut, "CPR" pronounced by the AI voice, the music level under the voice.

## Lessons for the skills
- animated-video `three.md`: a sourced mesh whose node carries a rotation breaks any shader that uses "local"
  coordinates (the centre line and the press both landed on the wrong axis). Bake node transforms into the geometry
  on load before writing local-space shader effects.
- animated-video `three.md`: additive glow (`transparent` + `AdditiveBlending`) multiplies the colour by alpha twice
  when the shader also premultiplies: a sheet at alpha 0.2 came out invisible. Output the colour unmultiplied and let
  the blend apply alpha once. Also `pow(x, 2.0)` of a negative x is undefined in GLSL: write x*x.
- animated-video parts: the kit hand's sleeve always continues straight from the hand, so a flat palm with a vertical
  forearm (CPR, pushing a button on a desk) is impossible. `khand.tsx` here places the hand by its wrist and draws the
  forearm in any direction; worth folding into the kit.
- video-script picture-first: an "x-ray" sheet seen edge-on from the front is a line, and from 3/4 a wash. A centre
  plane reads best as a line on the skin plus the plane edge-on.
- Board judge caught what my own stills review didn't: wrong CPR posture (a saves-goal film teaching a wrong action),
  colour meanings drifting (coral used for a true fact), the lead outshone by ribs. Ask the judge specifically about
  real-world procedures shown on screen.

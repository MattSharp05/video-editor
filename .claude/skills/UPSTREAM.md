# Upstream

Copied from https://github.com/goodnight000/cstack at commit
`72c4a9be18c1a7d455ecc3f5a4d4547725970a10` (2026-10-17), MIT licensed (`LICENSE-cstack`).

Skills taken: `video-script`, `animated-video`, `video-edit`, `asset-library`, `reflect`.
Left out: `rsi` (skill-experiment harness; add it if we start A/B-testing skill changes).

## Local changes

List each change here (file, what, why) so an upstream sync keeps it.

- 2026-11-06 `animated-video`: added `references/look-pass.md` (ten measured look upgrades for three.js films),
  `templates/parts/src/kit/terrain/` + `templates/parts/terrain-data/` (real terrain, imagery, baked light, water,
  rock; from projects/grand-canyon-01), lines in `references/three.md`, `templates/parts/README.md` and `SKILL.md`
  (step 5) pointing to them. Why: Matthew asked that every future film get these graphics upgrades. Techniques
  borrowed (MIT) from CloudAI-X/threejs-skills, MiniMax-AI/skills shader-dev, gokayfem/shader-skills,
  Moh4696/open-3d-skills, artemnovitckii/claude-animation-skills; see lab/3d-skills-research.md.
- 2026-11-06 `animated-video`: added `references/motion-principles.md` (one thread with carriers, one visual language,
  emphasis without boxes, glass, panes never intersect, background is the film's world, sound follows the language),
  `references/ai-voiceover.md` (free Qwen3-TTS pipeline: design once, clone every line; assembly, word timings,
  transcript check, voice picker), `references/production-analytics.md`, `templates/remotion-film/beats.py`
  (beats.json timing spine) and `templates/remotion-film/analytics.py` (time/tokens per phase from the transcript),
  `templates/parts/src/kit/captions.tsx` (VO captions part, README row); sections in `references/remotion-pipeline.md`
  (timing spine, captions, a line under sound events, template file list) and `references/review.md` (stills before
  renders, partial re-render, fact-check); added lines in `SKILL.md` (principles, step 3 voice/beats/sound, step 4
  fact-check, step 6 stills and partial re-render, analytics). Why: fold the proven lab and project workflow
  (lab/PRINCIPLES.md, lab/voice-picker, projects/trip-social-01, projects/grand-canyon-01) into the skill so every
  future video uses it.
- 2026-11-06 `video-edit/SKILL.md`: one sentence in the Sound bullet pointing to real-sfx's `studio-sound.md`. Why: the
  studio's picks, palette and mix levels apply to camera edits too.
- 2026-11-06 `real-sfx` (vendored from Clipwing, not cstack; its own `UPSTREAM.md` has the same note): added
  `references/studio-sound.md` (Sound Picker round, palette layers, events from beats.json, mix rules, rights) and
  `scripts/palette.py` (from lab/sound-picker; palette path via `SOUND_PALETTE`, prints pack/file fragments); two
  pointers in `SKILL.md`. Why: Matthew's ear picks, Claude places; the picks must shape every future film.
- 2026-11-06 `animated-video`: added `templates/parts/src/kit/water/` (rivers, ocean, waterfall, underwater, flood;
  presets) and `references/water.md`, rows/lines in `templates/parts/README.md` and `SKILL.md` step 5. Bench:
  `lab/water/`. Why: Matthew is building reusable 3D graphics skills, water first (incl. ocean waves, waterfalls).

- 2026-11-12 new local skill `avatar-cutins` (not from cstack): SKILL.md, references (avatar-profile, face-models,
  face-checks, disclosure), scripts (`face_slots.py`, `gen_face.py`, `face_models.json`), `templates/AvatarSlot.tsx`.
  Ideas adapted (all MIT) from heygen-com/skills (one identity file per avatar, resolve asset IDs fresh, frame check),
  0xAnni/ugc-creator (identity card as data, face pack built from one validated portrait, restrained motion prompts),
  synchronicity-labs/skills (quote the whole run once, pilot row, idempotency keys and resumable state, clean audio
  input), higgsfield-ai/skills (soul-id: identity trained once, referenced by id). `animated-video/SKILL.md`: the
  description no longer points at non-existent `higgsfield-*` skills (none exist upstream on any branch; checked
  2026-11-11) and step 3 points to avatar-cutins. Why: Matthew wants avatar cut-ins as a standard technique.

- 2026-11-16 reflection on projects/code-history-01 (approved by Matthew). `animated-video/SKILL.md`: "Read before each
  step" (a step → pages map, read in full and only for that step), "Template first" and a `Guidance read` log in the
  brief; repo `CLAUDE.md` "Using the skills" applies the same to every skill and subagent brief. Why: the film
  rediscovered six documented fixes (textures outside the canvas, partial re-render and splicing, music swap by
  `-c:v copy`, `snap.sh`, `chunk()`/captions, `render.sh`) and skipped the mute test, motion check and one-shot rule,
  because only 4 of 13 references were opened. Expected: future reflections find no bug a page already covered.
  `references/review.md`: stills at each beat's first, middle and last frame; every change of scene listed with its
  carrier (a dissolve is a cut). `references/three.md`: hands (use the part; chained joints; sleeve leaves the frame),
  camera solver, render cost without a GPU. `references/remotion-pipeline.md`: 50 MB delivery, `frame.mjs` in the
  template list. `references/ai-voiceover.md`: lock the voice before timing (56.5–69.0 s across ten voices).
  `templates/parts/src/kit/hand.tsx` + `public/models/hand-*.glb` (WebXR generic hand, MIT, Amazon) and a README row;
  `templates/remotion-film/frame.mjs` (camera solver); `render.sh` caps video at 6 Mbit/s and fails above 50 MB.

- 2026-11-16 sourcing (approved by Matthew): new `animated-video/references/sourcing.md` (when to search vs build,
  static vs controllable meshes, free sources only with two source tables, how to search / download / test-render,
  judging, licence tiers incl. logged NC while accounts are tests, recording in the asset library); tools in
  `templates/sourcing/` (`find_asset.py` one search across ours, Sketchfab, Poly Haven, Smithsonian 3D, NASA,
  Kenney, Quaternius, ambientCG, Openverse, with `--controllable` and `--get`; `render_glb.mjs` same-light test
  renders incl. animated poses; `sheet_compare.py`; offline indexes); a row in SKILL.md's reading table and a
  line in step 5; the Sketchfab token is a network secret on the environment, never in the repo. Why: until now
  every object was modelled in code; the test found realistic animals and props in seconds (lab/sourcing/previews).
  Expected: 3D builds search before modelling, and pick controllable models when the beat needs motion.

- 2026-11-17 `video-script`: new **Plan** task and `references/picture-first.md` (plan → asset scout → script with a
  look sheet and start/action/camera/lead/end shot notes with numbers → fact-check → reference frames rendered from the
  real scene → "what the board changed" table; frame maths for sizes and distances); the picture-column sentence in
  Script points to it. `animated-video/SKILL.md`: step 1 starts from a picture-first script, and its read table lists
  the page. Why: Matthew (2026-11-17) asked to plan visuals and scout assets before writing, describe what the viewer
  sees as precisely as what they hear, and render reference frames from that; proven on projects/turbulence-seat-01.

- 2026-11-18: video-script `references/picture-first.md` checklist: camera passes through solids are written as cuts
  (turbulence-seat-01 v3).
- 2026-11-19 (Matthew: "add these fixes to the skills. We can change it to have cuts"): animated-video
  `references/motion-principles.md` "Hard cuts are allowed" (cut between worlds instead of flying through solids; cuts on
  the words; states switch on the cut frame; whooshes peak on the cut, beds start/stop on it); `references/review.md`
  (flicker scan expects steps only at CUT times); `references/three.md` (no fly-through into a different interior;
  glass shells don't write depth); motion kit `camera.ts` `shots()` (rigs joined by hard cuts); template scripts
  `render_chunks.sh`, `partial.sh`, `mux.sh` (resumable chunks, CONC, splice, re-encode under 50 MB) listed in
  `references/remotion-pipeline.md`.
- 2026-11-19 (Matthew, after the s3 machines session: "what went wrong ... please add to the skills"), from
  projects/s3-taipei-damper and projects/s3-jet-engine:
  - video-script `references/picture-first.md` checklist: name each new device on screen the first time; compare
    timings on one flat axis. Hypothesis: the first mute test stops losing unnamed devices.
  - animated-video `references/motion-principles.md` cut list: reset grown state on a loop cut; no value computed
    across a cut. Expected: no off-model loop frame or one-frame flash after a cut in the flicker scan.
  - `references/ai-voiceover.md`: never generate VO beside a render (lines went from ~20 s to 30–450 s).
  - `references/sourcing.md`: Sketchfab glTF nests a 0.01 scale; measure the world box.
  - `references/review.md`: the motion check is blocked in cloud sessions without a bar film; say so, lean on the mute
    test and flicker scan (open: where to keep bar films).
  - `templates/parts/src/kit/captions.tsx` + `remotion-pipeline.md`: per-word key colour `[word|#hex]`.
  - `templates/remotion-film/mux.sh`: `apad` so `-shortest` keeps the picture's last frame.

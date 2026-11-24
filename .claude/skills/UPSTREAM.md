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


- 2026-11-24 Montage comparison (`lab/montage-vs-ours.md`, approved by Matthew: "make all improvements").
  - Blender path (proposal 1): new `animated-video/templates/blender-shot/` (`scene.py` builds the whole shot from a
    factory-reset file, timed from `beats.json`, seeded; `props.py` helpers; `shot.py` one entry point with presets
    layout/fast/draft/cycles/final, Metal/OptiX/CUDA/CPU choice, a folder-hash frame cache, s/frame estimates and Python
    errors as file/line/source/hint; `describe.py` objects in/partly/out of frame, materials, motion, warnings, region
    query), new `references/blender.md` (route table and budget rules moved from styles/realistic-3d, which keeps its
    colour-transform and subframe sections), kit part `templates/parts/src/kit/blender-plate.tsx` plus a parts README
    row. Tested on bpy 5.1.0 (Linux, CPU); the Blender binary and Metal are untested.
  - Versions (proposals 2 and 8): new `animated-video/references/versions.md` (notes in brief.md with ids, version,
    frame/time, box and status; the cut registry `renders/cuts.json`; `board.json`; what Broadcast reads and writes),
    shared by video-edit. New `templates/remotion-film/cuts.py` (`add`, `note`, `answer [--not-changed]`, `list`,
    `open`, `notes --json`); `board.py` reads `board.json` (old call still draws the same image). Repo `.gitignore`
    keeps `projects/*/renders/cuts.json` tracked; CLAUDE.md Projects points to it.
  - Delivery and cache (proposals 3 and 9): `render.sh` input-hash cache (`out/<name>.inputs.sha256`, `reused: true`,
    `--fresh`) and audio trimmed to the picture after loudnorm (it padded up to 0.1 s). New `deliver.py`: pack in
    `renders/deliver/<cut>/` (a preset per layout built, never a crop; Reels under 50 MB; SRT/VTT; cover; manifest with
    LUFS/true peak measured on each MP4; exit 1 on a failed check); matches cuts.json by name, source, input hash or
    file sha256. `references/remotion-pipeline.md` "Render cache" and "Delivery"; `video-edit/references/publish.md`
    "Delivery pack".
  - Findings and recover (proposals 4 and 5): `snap.sh` renders stills through new `snap.mjs` (renderStill + CDP
    listener) and writes `findings.json` (console errors, page errors, failed loads, remote requests, fonts not in the
    project, with file:line), exits 1 on any `fail`; `findings-allow.txt`; frame from the composition's fps instead of
    a fixed 30. New `references/recover.md` (symptom → cause → fix index of existing gotchas, render-time estimating);
    `references/review.md` requires clean findings before a full render.
  - Timeline as data (proposal 10): `video-edit/scripts/timeline.py` (validate, describe, still, render of
    `film/timeline.json`; keyframes, fades, crossfades, captions via make_captions.py, text via text_overlay.py,
    ducking, -14 LUFS / -1.5 dBTP mastered on the MP4), `scripts/test_timeline.py`, `references/timeline.md`. Optional.
  - SKILL.md wiring: animated-video "Read before each step" rows (blender, versions, recover), steps 4–6; video-edit
    scope, brief notes, timeline and delivery pack lines.
  Why: Montage's hosted studio had tooling we lacked (in-frame report for 3D, numbered cuts answering notes,
  findings on stills, delivery packs, cached cuts). Kept ours where it was better: independent judges and the mute
  test, Matthew's sound picks, light voice processing, loudness measured on the MP4, frame-range partial re-render.

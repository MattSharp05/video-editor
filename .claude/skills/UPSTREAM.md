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

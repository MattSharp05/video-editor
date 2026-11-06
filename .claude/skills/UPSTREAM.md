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

- 2026-11-06 `video-script`: three hooks from different formulas (`references/hooks.json`, 26 formulas with traps and
  match regexes, copied from Jakeschincariol/instagram-agent-skill `skills/ig-reel/hooks.json` at d03c56b, MIT,
  licence in `references/hooks.LICENSE`); an On-screen text column (hook card at frame 0, six words a card, safe
  area, clear of the app's UI) and picture rules (literal, every spoken name and number visible, a change every ~4 s
  as a default the findings override); `scripts/check_script.py` (times each line at the profile's pace against its
  slot, flags late hook or second sentence, cards, unshown numbers and names; `--hooks` names formulas and flags
  dealbreakers, never ranks), its timing checks adapted from that repo's `beats.py`; a measured-pace line and two
  checklist items in `SKILL.md`. Why: Matthew asked for items 1–4 of the GitHub scriptwriting research
  (`/home/user/reports/Viral reel scriptwriting on GitHub.md`, not committed). Check on old scripts: at 2.7 words/s
  it predicted trip-social-01's VO at 32.6 s (recorded 32.7 s) and grand-canyon-01's at 77.4 s (recorded ~77 s,
  script planned 63 s).

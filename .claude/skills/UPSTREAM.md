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

# s5 microwave myth (brief)

Status: script v0.2 (fact-checked), board v1 with the judge. 3D explainer series, session 5 of 5 (everyday physics: kitchen, home, sport),
video 2 of 2: the **mythbuster**. Unsupervised (Matthew 2026-11-19): every approval below is a fresh judge agent.

## Facts
- Topic (chosen 2026-11-19): "Most people think a microwave cooks food from the inside out." It heats the outer inch
  or so; the middle warms by conduction; ice absorbs microwaves poorly, so a frozen meal boils at the edges and stays
  icy in the middle; standing time lets the heat finish. Why: a belief almost everyone holds, a kitchen everyone has, a
  picture (heat vision of a cut lasagne) that proves it in one look. No other project or session area covers it.
- Goal: reach. Reel 1080x1920, 30 fps, ~40 s, captions on, hook in the first 2 s.
- Voice m5 (`library/voices/m5/`), music Floating Cities ducked 10-12 dB, SFX CC0 `sfx-29`-`sfx-61` or synthesized.
- Research (2026-11-19, research agent): FDA: "microwave ovens do not cook food from the 'inside out.' When thick foods
  are cooked, the outer layers are heated and cooked primarily by microwaves while the inside is cooked mainly by the
  conduction of heat from the hot outer layers." USDA FSIS: "Microwaves penetrate the food to a depth of 1 to 1 1/2
  inches"; standing time "at least 3 minutes". Penetration depth (power to 1/e) at 2.45 GHz: water 45 C 1.4 cm, raw
  potato 0.9 cm, meat 0.9-1.2 cm, ice (-12 C) ~11 m (Pueschner table; our check from dielectric data: water ~1.7 cm,
  ice ~10 m). ~86 % of the power within 2 depths. Exceptions: small spheres (2-6 cm) can focus heat at the centre;
  dry or fatty food is penetrated deeper; salty food less.

## Decisions (logged; Matthew not asked)
- 2026-11-19 Picture brainstorm by a fresh agent (`notes/brainstorm.md`), picks by a second fresh agent: one world
  (the found microwave in a kitchen, the lasagne cut in half), heat vision on the cut face as the giant device, a cyan
  hologram for the myth, wave fronts dying at an inch with a ruler, a molecule-scale cut, the creep as a timelapse,
  heat vision switching off for the real boiling-and-frosted face, back on for the runaway, a stand timer evening it out.
- Line 7 changed from "stir it" to "let it stand" (picker: you can't stir lasagne; USDA advises standing time).
- The cut face is built in code (clipped found model, a layered cap shader) so heat vision is exact.

- 2026-11-19 Fact check (fresh agent; FDA, USDA FSIS via extension copies, Pueschner depth table, Kiel/LSBU dielectric
  data): "Most people think" -> "A lot of people think" (no survey); "the outer inch" -> "of thick food"; "flip" ->
  "twist" (molecules rotate part-way, not full flips); "almost none" -> "much less", "only warms" -> "mostly warms"
  (conduction is FDA's "mainly"); on-screen "2.45 billion times a second" -> "field: 2.45 billion cycles a second".
  Biggest finding was a picture contradiction: a frozen (-18 C) block with waves dying an inch in, then a line saying
  ice lets waves through. Resolved by making the food fridge-cold leftovers (4 C) and cutting the ice line; "frozen
  meal ... icy" -> "leftovers ... scalding at the edges and still cold in the middle". Rim heating drawn with a soft
  exponential edge (power ~e^-d, 1 cm), core molecules get a faint jiggle (not dead still).
- VO: m5, 7 lines, 30.4 s of speech, 91 words; ASR heard "molecules their" (homophone) -> `vo/fix_words.py`.
- Mix: Floating Cities +11 dB (stems: +12 dB measured 10.0 dB under the voice in speech).

## Assets (scouted 2026-11-19; out of git, rebuild: `film/models-prep/README.md`)
| Asset | Source | Licence | Notes |
|---|---|---|---|
| "Old microwave - free" by Mieshu | sketchfab.com/3d-models/90fd75b96c624d7fb641045c3d3430e9 | CC BY 4.0 | animated door |
| "Lasagna" by UmangRank | sketchfab.com/3d-models/9f823705ac9a489ca4b54abb382285f0 | CC BY 4.0 | layered slice |
| "Small Modern Kitchen" by dylanheyes | sketchfab.com/3d-models/2cc658a96e304a6d9db1813233ed90d1 | CC BY 4.0 | 130k tris |
Rejected: "Lasagna" by Qlone (CC BY-ND: we cut it open), Garfield models (characters).

## Guidance read
- 2026-11-19 step 1 (pictures, concept, script): video-script SKILL.md, references/picture-first.md,
  references/explainers.md; animated-video SKILL.md, references/direct.md, references/motion-principles.md (read for
  video 1 the same day, same session; re-checked picture-first's checklist for this script).
- 2026-11-19 steps 2-5: styles/realistic-3d/README.md, references/look-pass.md, references/sourcing.md,
  references/three.md, references/remotion-pipeline.md, templates/parts/README.md (same session).

## Lessons for the skills
(filled in as they happen)

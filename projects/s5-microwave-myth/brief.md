# s5 microwave myth (brief)

Status: **v5 delivered** (2026-11-19): `renders/s5-microwave-myth-v5.mp4` (film/out/v5.mp4), 944 frames, 31.5 s,
33.0 MB, -14.0 LUFS integrated, true peak -1.9 dBTP (measured on the MP4). 3D explainer series, session 5 of 5 (everyday physics: kitchen, home, sport),
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

- 2026-11-19 Board v1 judge (fresh agent, stand-in for Matthew): **approve with fixes**. Fixed: the film now opens on
  the cut face itself with the myth drawn on it (cyan hologram heat map, hot core, "the myth: hot in the middle?") and
  a scan line on "Watch" wipes it into real heat vision (all blue, 4 C), so myth and truth play on one face; the kitchen
  establishing shot moved to the end. The rim band widened to an inch (temperature model amplitude 260, depth 1 cm:
  warm to ~2.4 cm) with a horizontal ruler across the left band; the real face shows a glossy, bubbling, saturated rim
  and a dull, pale, matte middle; probes enter 1 cm inside the left edge and at the centre, orange and blue handles,
  readouts as opaque chips in clear space; the face holds while it evens out (stand timer) before the cut to the
  kitchen; the scale bar shortened (y 620-1060); molecules kept below the captions, rim molecules orange/white, core
  muted pink/blue-grey; labels on dark pills and clamped inside x 50-1010; the clock 130 px. The door clip opens then
  closes, so the door is held at 33 % of its clip (open).
  Not changed: steam is barely visible against the light interior (kept, low); the plate stays plain.

## Checks on v1 (2026-11-19)
- Render: `render_chunks.sh v1` (944 frames, ~1.2 s/frame at concurrency 4). The template's chunk script assumes a
  2.2 s tail (TOTAL from words.json + 2.2 s); this film ends 2.0 s after the VO, so the last chunk failed until rerun
  with `TOTAL=944` (finished chunks were kept).
- Flicker scan: steps at the three cuts (9.80, 16.57, 29.03 s) plus two bugs, fixed by partial re-renders: the oven
  lamp switched off in one frame at 4.27 s (now fades over 0.6 s), and heat vision switched on halfway through the
  scan wipe at 4.67 s (the state now changes when the line starts, so the wipe shows old below / new above; same fix
  at the 21.8 and 25.5 s wipes). After the fixes: only the cut steps.
- Mute test (fresh judge, masked caption band, 2 fps): main point recovered ("microwaves heat food from the outside
  in, only about an inch deep, so the middle stays cold; let it stand"); most shareable: the probe frame (edge 96 C,
  middle 12 C), then the "1 inch" ruler. Fixed: the hook read as "a corrupted thermal image" -> the myth is now drawn
  in heat vision itself (hot white-yellow centre, cold blue edges) with cyan rings, and the hot/cold scale shows from
  frame 0; field arrows were tiny -> 1.8x; 16.5-19.5 s near static -> the creep starts as we cut back, the clock says
  "minutes later..."; no written takeaway -> an end card "Let it stand, then check the middle is hot too"; scale
  labels 34 px "100/0 C" -> 42 px "hot/cold". Not changed: the molecule shot's length (6 s, under the VO line).
- Mix: Floating Cities +11 dB, measured 11.0 dB under the voice in speech (stems).
- Fix renders (partial.sh): v2 lamp fade; v3 the three wipes; v4 hook, molecules, creep, ending; v5 the remaining
  heat-vision ranges so the scale reads "hot/cold" throughout. Luma scan on v5: only the three cut steps.
- Not listened to by Claude (measured only): the m5 read of "twist back and forth", the hologram glitch zap at 4.1 s,
  the bubbling/sizzle bed under "scalding" (22-25 s), the three microwave beeps at 29 s, the music level.

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
- picture-first / fact check: the checker found a contradiction *between pictures* (a frozen block absorbing like
  thawed food, then a line saying ice lets waves through). Ask the fact-checker explicitly to compare the states the
  pictures show across beats, not only each claim.
- Mythbuster structure (judge): show the myth *on the same object* the truth is shown on, then wipe it; a myth in a
  separate picture (a hologram over a microwave seen from outside) didn't land. Worth a line in video-script for the
  "Most people think..." format.
- three.md: a cut-open found model works with two world-space clipping planes and a back-face "cap" shader that colours
  the inside by position (layers, or a temperature field); `localClippingEnabled`, DoubleSide, the halves can rotate
  under fixed planes and stay whole.
- Found animated models: check the clip at several times; this door clip opens and closes again (0.33 = open).
- A found kitchen sits behind everything but read as a blank wall at close range: frame a wide establishing shot on
  purpose if the set is meant to show.

# s5 kettle roar (brief)

Status: **rendering v1** (2026-11-19). 3D explainer series, session 5 (everyday physics: kitchen, home, sport), video 3:
the **explainer**, asked for by the coordinating session after videos 1-2 shipped. Unsupervised: every approval below
is a fresh judge agent.

## Facts
- Topic (chosen 2026-11-19): why a kettle is loudest just before it boils. Steam bubbles form on the element (above
  100 °C) and collapse in the cooler water above; the collapses make the roar and set the vessel ringing. Once all the
  water is near 100 °C the bubbles survive to the top and pop gently, so it goes quieter, right at the boil, just before
  the switch clicks (steam on a bimetal disc). Not covered by s5-ball-stack, s5-microwave-myth or any other project.
- Goal: reach. Reel 1080x1920, 30 fps, ~35 s, captions on, hook card at frame 0.
- Voice m5 (`library/voices/m5/`), music Floating Cities ducked 10-12 dB, SFX CC0 `sfx-29`-`sfx-61` or synthesized.
- Research (2026-11-19, research agent): Aljishi & Tatarkiewicz, Am. J. Phys. 59, 628 (1991) (abstract: sound from
  "coupling between vapor bubble generation and collapse with the natural acoustic modes of the heating vessel");
  Katona KFKI-1981-14 (collapse is the main acoustic source); US 4,869,233 (subcooled boiling: discrete bursts; full
  boil: continuous); Naked Scientists 2013/2016; Ingenia and Strix (switch-off by steam on a bimetal). No strong source
  for bubble sizes, collapse rates, Hz, dB or the peak temperature: none of those go on screen.

## Hooks (`notes/hooks.txt`, `check_script.py --hooks`: 0 flags)
1. Cold Open Demo (chosen): "Watch this kettle get loud, then go quiet." | LOUDEST BEFORE IT BOILS
2. Verbatim Question: "Why is your kettle loudest below 100 degrees?" | LOUD, BUT NOT 100 °C YET
3. Head To Head: "Loud versus quiet: only one is 100 degrees." | LOUD VS QUIET: WHICH BOILS?

## Decisions (logged; Matthew not asked)
- 2026-11-19 Picture brainstorm by a fresh agent (`notes/brainstorm.md`), picks by a second fresh agent
  (`notes/picks.md`): one world (a found glass kettle on a kitchen counter) at two scales (counter, macro at the
  element); colour is temperature (red at/over 100 °C, blue cooler); each collapse fires a ring; a hero bubble crumples
  to nothing (steam turning back into water, unlike an air bubble); the red climbs at the end and bubbles survive.
- Changed from the picks: the sound meter is a phone on the counter showing a noise bar (in the world, no dB numbers)
  instead of the rippling mug + spoon, which a kettle's sound wouldn't do; "5,000 per second" dropped (no source).
- Script `check_script.py script.md`: 0 flags (row-hold notes answered in the picture column).

- 2026-11-19 Fact check (fresh agent; Naked Scientists x2, US 4,869,233, AJP abstract; Ingenia/Strix as snippets
  only): "go quiet" -> "go quieter", "the quiet" -> "the quieter bubbling" (a full boil still makes continuous noise:
  the meter drops to low-mid, never zero; a few rings remain); "the water isn't boiling yet" -> "your kettle isn't
  boiling yet" (it contradicted "the water touching the element boils first"); "Thousands" -> "All those" (no source);
  the loud hook shows fairly still water and a sheen on the plate (no glow, no roiling); the end column warms evenly to
  orange while the collapse height climbs (convection mixes a kettle; no front climbing from the bottom); red only on the
  superheated layer; the click ~1.5 s after the boil starts.

- VO: m5, 7 lines, 92 words, 32.8 s of speech (`vo/assemble.py` gaps 0.35-0.55 s); ASR matched the script word for
  word (92/92). Film 1033 frames (34.4 s).
- Mix: kettle sound synthesized from the picture's loudness curve (`film/sound/roar.py`: collapse clicks coloured by a
  vessel band, a hiss bed, low "blub" pops and rumble at the boil); Floating Cities +6 dB in mix.py measured 10.4 dB
  under the voice in speech (stems); -14.1 LUFS on the mix.

- 2026-11-19 Stills board (35 stills, 1 per second, captions off) to two fresh agents at once:
  - Mute test (frames only): main point recovered ("loudest just before it boils... bubbles die in cooler water... at
    100 C they survive and it gets quieter"); best frame the split. Asked for: a visible collapse, a fixed colour
    language in the macro, a longer flash-forward, fewer dead stretches, nothing cropped.
  - Board judge: **rework**. Fixed: the macro swarm is small bubbles dying a few mm above the red layer with gold
    flashes (only the hero rises); the camera tracks the hero level so its collapse happens in blue water (fog hides the
    plate's far edge); the band builds from "All those"; "100 C" label and card wait for "survive" (column orange,
    bubbles at the top) and the column warms from "Once" to "survive"; the kettle model turned 90 deg so the handle is at
    the side (the grey "infuser" was the handle seen through the glass); the water follows the glass's profile (lathe);
    exposure down; the push-in ends on the glass bottom; plume from the spout and lid vent; a bigger switch light that
    goes off on "click"; split cameras per panel with the phone in front of each kettle, inside the safe area; "over
    100 C / water on the hot plate" label; "cooler water" from the macro's first second; the flash-forward holds 1.3 s.
  - Not changed: the kitchen model is white and minimal, so the counter shots stay light; the lid's faceting.

## Assets (scouted 2026-11-19; out of git, rebuild: `film/models-prep/README.md`)
| Asset | Source | Licence | Notes |
|---|---|---|---|
| "Glass Kettle" by Halil Kantarci | sketchfab.com/3d-models/none-3f646a36c0a142cfa451af70357f4235 | CC BY 4.0 | spec-gloss, converted to metal-rough |
| "Small Modern Kitchen" by dylanheyes | sketchfab.com/3d-models/2cc658a96e304a6d9db1813233ed90d1 | CC BY 4.0 | 130k tris |

## Guidance read
- 2026-11-19 (after `git merge origin/main`): video-script SKILL.md, references/picture-first.md, references/explainers.md,
  references/hooks.json; animated-video SKILL.md, references/direct.md, references/motion-principles.md,
  references/review.md (mute test, flicker, fact check), styles/realistic-3d/README.md, references/look-pass.md,
  references/sourcing.md, references/three.md, references/remotion-pipeline.md, templates/parts/README.md.

## Lessons for the skills

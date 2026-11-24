# Recipes: three tested starting points

Pick the recipe closest to the film's shape, follow its steps, then change it. A recipe is a route
through the tools that already exist (template, parts, scripts), the traps earlier films fell into
on that route, and a smoke command that proves the route still runs. It sets no style and no
pictures: the brief, the profile and the skill's pages still decide those.

| Shape | Pick it when | Owner skill | Recipe | Last checked |
| --- | --- | --- | --- | --- |
| Trip app reel | A product film for Trip (or another app): real screens, Matthew's VO, captions, ~7 sounds per 10 s, one continuous shot | animated-video | [trip-app-reel](trip-app-reel.md) | 2026-11-24 |
| Narrated 3D explainer | How a real place or physical mechanism works, told by a voice over one continuous three.js shot (terrain, globe, water, look pass) | animated-video | [narrated-3d-explainer](narrated-3d-explainer.md) | 2026-11-24 |
| Talking head with captions | Someone speaks to camera (or a screen recording with their voice): takes, cuts, burned captions, a music bed | video-edit | [talking-head-captions](talking-head-captions.md) | 2026-11-24 |

None fits? Start from the skill's steps directly; a fourth shape gets a recipe once a second film
has been made in it.

## Using a recipe

- Read the skill's pages for each step first (animated-video "Read before each step"; video-edit
  SKILL.md). A recipe orders the steps and names the tools; it does not replace those pages.
- Traps are measured failures from real projects (the project is named) or from the smoke run.
  Read them all before step 1: most cost a render when they were found.
- Log the recipe in the project's `brief.md` `Guidance read` line, with the pages read per step.

## Keeping recipes true

Recipes rot when the tools change, so each one carries:
- **A smoke command** that builds a minimal film from the current template in a temp folder and
  runs the route end to end (stills, render, mix, delivery pack). Run it after changing a tool the
  recipe names, and before trusting a recipe whose stamp is older than the tools it uses.
- **"Checked against"**: the exact versions the smoke ran on, and the date. Stamp only what was run.
  A step that was not run says so.
- When a smoke step fails, fix the template or script (the next film gets the fix), then the
  recipe's steps, then re-run and re-stamp. A new trap found on a real film goes into the recipe
  with the project's name.

The machine the stamps below ran on: the cloud container (4 CPUs, no GPU, software WebGL via
SwiftShader, shared with other agents' renders at load ~8), so times are upper bounds.

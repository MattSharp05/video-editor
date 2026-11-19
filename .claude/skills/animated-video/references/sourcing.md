# Sourcing 3D models, materials and reference images

Read at step 4–5 (build), before modelling any object. Every number below comes from the
2026-11-16 test (comparison sheets in `lab/sourcing/previews/` at the repo root). Tools: `templates/sourcing/`
(`render_glb.mjs` needs `THREE_DIR` set to a film's `node_modules/three` and `NODE_PATH=$(npm root -g)` for
Playwright; `sheet_compare.py` puts tiles side by side).

## When to search first

Search before building when the object is:
- **Natural or organic:** animals, hands, bodies, plants, food. Built in code they read as toys; a
  sculpt or scan reads as real (the Sketchfab veiled chameleon beat ours on likeness).
- **A real, recognisable thing:** an old TV, a clock, a telegraph key, a spacecraft, a landmark.
- **A prop or furniture** that fills the set but isn't the lead (Poly Haven: CC0, textured, light).
- **A surface or a light:** wood, metal, paper, a sky or room for reflections (Poly Haven, ambientCG).

Build it ourselves when it is:
- **The film's lead or its thread** (the amber cable), which needs exact control.
- **A screen with exact text or UI** (the terminal, the Claude window). A found body with our screen
  on it is fine: keep their case, draw our screen.
- **Something that must move, bend, open or change** and no controllable model exists (next section).
- **Abstract or diagrammatic**, or a style the found models don't share.

## Static or controllable

Many models come back as **static meshes**: one fixed shape, no skeleton, no animation. All six animals
downloaded in the 2026-11-16 test were static. Know which kind the beat needs before searching.

**Prefer controllable meshes** (a skeleton with skinned parts, built-in animations, or morph targets) when
the object must act on screen: an octopus curling an arm, a hand pressing a key, a bird flapping, a mouth
or face changing. `find_asset.py` shows `rigged` / `animated` where the source says; check the file itself
before choosing (a GLB lists its `skins` and `animations`).

**Static is fine** when the object doesn't need to move itself:
- **Close-ups and stills:** a detail shot, a reveal, a held frame.
- **Moved as a whole:** carried, slid, spun, dropped, flown past by the camera.
- **Surface change only:** a new colour, pattern or glow through a shader (a static chameleon can take
  our colour-changing skin).
- **Background and props:** furniture, machines, scenery.

**A static mesh that must move** can sometimes be made controllable: split it into parts that hinge
(a lid, a door, a lever), add bones the way the hand part does, or rig it with Mesh2Motion (CC0 skeletons
for humans, birds, fish, snakes, spiders). Rigging an organic body (arms,
tentacles) is real work: test it on one shot before building a film on it, or build our own.

Controllable doesn't mean realistic: every rigged chameleon on Sketchfab was a cartoon character, while the
realistic ones were static. When the beat needs both, compare a realistic static model with our shader or rig
against our own controllable one in a still.

## Order

1. **Ours:** the asset library and the kit parts (`templates/parts/README.md`), then models from past
   films (`templates/sourcing/index/ours.json`). Tested assets win ties.
2. **Free sources, one search:** `find_asset.py` (below). Free only: no paid stores or paid AI generation
   (Matthew, 2026-11-16).
3. **Build it** when nothing passes the test render, or the object is on the build list above.

## Sources

Free, reachable from the cloud container (tested 2026-11-16). `find_asset.py` covers the first seven.

| Source | Good for | Controllable? | Licence | Access |
| --- | --- | --- | --- | --- |
| Ours (asset library, kit parts, past films) | Hand, chameleon, octopus, globe, phone, water, terrain | Yes (built in code) | Ours / MIT | Local |
| Sketchfab | Everything, incl. animals and old tech (tens of thousands downloadable) | Some; most static | Per model: CC0, CC BY, CC BY-NC | API search; download with Matthew's token |
| Poly Haven | Props, furniture, surfaces, skies | Static | CC0 | API |
| Smithsonian 3D | Museum scans of real objects | Static | Check per object | API, no key |
| NASA 3D | Spacecraft, planets, instruments (227 models) | Static | Free; no endorsement | Public GitHub repo |
| Kenney | Stylised game kits (50 3D packs) | Some animated characters | CC0 | Site + browser download |
| Quaternius | Stylised characters, animals, fish (84 packs) | Many rigged and animated | QAL (free; don't share files) | itch.io / Google Drive |
| ambientCG | Surfaces (PBR textures) | — | CC0 | API (`--kind material`) |
| Openverse, Wikimedia Commons | Reference photos, textures | — | Per image | API (`--kind image`) |
| npm and open-source packages | Rigged parts, e.g. the WebXR hand | Yes | MIT etc. | npm |

**For controllable models** (rigged, animated or with morph targets), checked 2026-11-16:

| Source | Good for | Controllable? | Licence | Access |
| --- | --- | --- | --- | --- |
| Sketchfab, filtered | Animals, characters | Yes: `find_asset.py --controllable` asks only for rigged or animated models (e.g. 31 octopuses; one CC BY octopus downloaded with a skeleton and a 12.5 s swim clip) | Per model; skip NC unless logged | API + token |
| Objaverse 1.0 | A frozen copy of 800k Sketchfab models, 44k animated, each with its licence and animation count | Filter `animationCount > 0` | Per model (mostly CC BY) | Hugging Face, no token; metadata is 160 files (~600 MB) to index once |
| Khronos glTF samples | Fox (walk, run), CesiumMan, rigged test figures, morph samples | Yes | CC0 / CC BY per model | GitHub raw files |
| three.js examples | Horse, Flamingo, Parrot, Stork (morph animation); Soldier and Xbot (Mixamo rigs) | Yes | Birds and horse: licence unconfirmed; Mixamo terms for Soldier/Xbot | threejs.org files |
| OpenGameArt | Game-ready rigged humans and some animals (sheep, horse, reptile) | Many | Per asset: CC0, CC BY, OGA-BY, GPL | Site search + direct files |
| KayKit (Kay Lousberg) | Stylised rigged and animated characters | Yes | CC0 | itch.io (browser helper) |
| Blender Studio | Film-grade rigs: forest animals (bird, ladybug, snail, butterfly, spider), Rex, Sprite | Yes | CC BY (Blender Foundation) | Free downloads, no login; `.blend` needs Blender to export (not installed here) |
| CMU motion capture | About 2,600 human motions (walk, type, gesture) to put on a rigged human | Motion only | Free to use and redistribute | Direct download (BVH) |
| Mesh2Motion (tool) | Rigs a static mesh: skeletons for humans, birds, fish, snakes, spiders, horses, plus 170+ animations | Makes static controllable | Code MIT; rigs and animations CC0 | Web app; open source, can be self-hosted (to test) |

Not used: account-only stores without an API (Fab, BlenderKit, Unity Asset Store), GPU-only auto-riggers
(UniRig, RigNet; no GPU here), Windows-only tools (AccuRIG), CC BY-NC motion sets (Bandai Namco; allowed
while accounts are tests, but logged), Ready Player Me (shut down January 2026), TurboSquid free (non-commercial,
blocked), CGTrader (account, likely blocked), VRoid Hub (anime humans, OAuth app needed).

Manual only: Mixamo (rigged characters and animations; needs Matthew's Adobe login). Blocked by bot checks:
Thingiverse, MyMiniFactory, Poly Pizza, Free3D.

## How

1. Search with two to four phrasings, adding `--controllable` when the beat needs it to move:
   `python3 templates/sourcing/find_asset.py "octopus" --also "common octopus,cephalopod" [--controllable] --out <dir>`
   It searches ours, Poly Haven, Sketchfab, Smithsonian 3D, NASA, Kenney, Quaternius (and ambientCG for
   `--kind material`, Openverse for `--kind image`) in parallel, ranks by name match × licence × format ×
   weight, and writes `results.json` plus `sheet.jpg` (thumbnails). Measured: 2–4 s per search.
2. **Read the sheet. Fit is judged by eye.** Text ranking can't tell a chameleon from a "Chameleon
   Plasma Rifle", and the Smithsonian's own search returned barnacles for "punch card".
3. Download up to three, preferring controllable ones when the beat needs motion: `--get 4,13,21` (Poly Haven, Smithsonian, NASA and Sketchfab fetch directly;
   Kenney and Quaternius packs come through the browser helper). Measured: six models in 17 s.
4. Test-render them in one light: `node templates/sourcing/render_glb.mjs out.png a.glb b.glb c.glb`
   (13 s for six; `--t=0,0.6,1.2` renders an animated model at those seconds to show it moves), and put them beside ours with `sheet_compare.py`. Then try the winner in a still
   of the film's own scene before building around it.
5. Stop after about 10 minutes. If nothing fits, build it.

## Judging a candidate

- **Fit and finish** in the test render, at the size it will be on screen.
- **Motion:** does the beat need it to move or change? If so, controllable beats static (see above).
- **Weight:** about 200k triangles per object or less for CPU rendering; decimate heavier scans (two
  test octopuses were 431k and 706k). Each object costs render time.
- **Stray parts:** scans can include scale cubes or labels (the CC0 octopus scan did). Delete them
  before framing.
- **Style:** it has to sit in the film's look after the look pass, not just look good alone.
- **Renders white or untextured:** an old spec-gloss material (`KHR_materials_pbrSpecularGlossiness`,
  which three.js no longer reads). Convert it with gltf-transform's `metalRough()` and re-test.
- **Animated:** scrub the clip across its length before relying on it; a door clip that opens may
  close again (s5-microwave-myth holds it at 33 %).
- **Licence field:** "Free Standard" on Sketchfab is a store licence, not CC; skip it. CC BY-ND
  forbids changes, so it can't be cut open, recoloured or decimated.

## Licences

| Tier | Examples | Use |
| --- | --- | --- |
| CC0 / public domain | Poly Haven, ambientCG, Kenney, CC0 Sketchfab scans | Free, no credit |
| Free with own terms | NASA (no implied endorsement), Quaternius QAL (no credit; never commit or share its files), MIT code packages (keep the notice) | Free, follow the terms |
| CC BY | Most Sketchfab models | Caption credit: "Chameleon by Trouvaille, CC BY 4.0, via Sketchfab" |
| CC BY-NC | Many Sketchfab and museum scans | Allowed while the accounts are non-commercial tests (Matthew, 2026-11-16); logged so it can be swapped if an account turns commercial |
| Unknown | Smithsonian 3D search results | Check rights in Open Access before publishing |

Free sources only. Never use editorial-only or store licences.

## Record it

Every model used in a film goes into the asset library: source URL, author, licence, credit line,
triangle count, what was changed (decimated, re-skinned, rigged), and the films that use it. Model files
stay out of git (large, and some licences forbid redistribution); the record keeps the URL to fetch again.
Credits go into the project's `brief.md` and the caption.

## Access details (tested 2026-11-16)

- **Sketchfab:** search is open; downloads use Matthew's account token, saved as a network secret on
  the Default environment and injected by the proxy (never in code or the repo).
- **Smithsonian 3D API:** open, no key; models are Draco-compressed GLB (the renderer handles it).
- **NASA:** the public GitHub repo's file tree (227 GLB models, each with a preview PNG).
- **Kenney:** packs only (names and tags, not the models inside); downloads through the browser.
- **Quaternius:** new packs through itch.io ("No thanks, just take me to the downloads"); older packs
  in public Google Drive folders.
- **Blocked** by bot checks: Thingiverse, MyMiniFactory, Poly Pizza, Free3D. **Manual only:** Mixamo
  (needs Matthew's Adobe login).
- Refresh the offline indexes now and then: `find_asset.py --build-index`.

---
name: hero-assets
description: >-
  Decide, with Matthew, when a three.js film's focal object should be an AI-generated 3D model (image-to-3D or
  text-to-3D on fal: Meshy, Tripo, Hunyuan) instead of one built by hand, and do it: build the three.js version
  first, propose with stills and a quote, generate only after his pick through Broadcast's proxy, fit the .glb into
  the scene (scale, origin, baked light, look-pass materials), compare, and log every decision with his reason so
  the rules learn. Use while building a 3D film when a focal object (a landmark, a product, a sneaker) is on screen
  for about 2-3 s or more or in close-up, or when asked to generate a 3D model or asset. Not for characters' faces
  (avatar-cutins) or AI video.
---

# Hero assets

Sometimes a scene's focal object (the Las Vegas Sphere, a PS5, a sneaker) would look better generated than built
from three.js primitives. Generation costs money and can look worse, so for now every case goes through Matthew,
and his decisions teach the rules below. `animated-video` still owns the film; this skill adds a branch to its step 5.

## Rules that don't bend
- **three.js first, always.** The free version is built and rendered in the scene before anything is proposed. It is
  the fallback and the comparison.
- **Nothing is paid for without his pick.** He chooses the model (and so the price). `gen_mesh.py` refuses a paid run
  without a `generate` decision naming that model and a budget at least the quote.
- **Never call fal and never hold a key.** Paid jobs go through Broadcast's mesh-job proxy, which holds the fal key
  and the caps ([contract](references/broadcast-contract.md)). Nothing else is uploaded anywhere: only the proposal,
  its stills and the reference image, to Broadcast.
- **Log every decision with his reason**, in his words (ask if he gave none). No reason, no log line, no rule.
- **Approved models are reused, not regenerated:** they go into the asset library with their licence.

## When to propose (a hypothesis until the log says otherwise)
Propose when **all** hold:
1. It is the focal object: the eye goes to it, the line is about it.
2. On screen for at least ~2-3 s in total, or any close-up.
3. Its shape or detail is recognisable and real (a named landmark, product or object people know), or fine and
   irregular (vents, stitching, ornament, organic form), which primitives, lathes and noise do badly.

Don't propose when: it is background or fills under ~10 % of the frame; it is abstract, stylised or diagrammatic (the
film's look is drawn); it must deform, open, assemble or be cut away (generated meshes are one fused shell; the
assembly rules in `animated-video/references/assembly.md` need real parts); it is a person or face; or the three.js
version already passed his eye in an earlier film.

**Score it** in the proposal: focal (0/1), seconds on screen, closest framing (wide/mid/close), real & recognisable
(0/1), fine detail (0/1), deforms (0/1). The [learning loop](#learning-loop) reads these columns.

## The flow
Run `gen_mesh.py` from the film folder (`python3 <skill>/scripts/gen_mesh.py ...`). State lives in `film/hero/`.

1. **Spot it** while building the board or the shots, with the rubric above.
2. **Build the three.js version** as well as you would without this skill (references, real units, look pass).
   Render the stills that matter, at the film's real framings: the widest and the closest on the object, at the
   frames where it is on screen. Use the film's own stills renderer; keep them under `stills/hero/<id>/`.
3. **Propose:**
   ```
   gen_mesh.py propose --id <slug>-<object>-1 --object "PS5" --scene "act2/console" --on-screen "3.5 s, close-up" \
     --reason "<the rubric score in words>" --why-generate "<what the three.js version gets wrong>" \
     --mode image --image ../refs/ps5-front.jpg [--prompt "..."] --model tripo-v2.5 \
     --stills stills/hero/<id>/threejs-wide.png stills/hero/<id>/threejs-close.png
   ```
   It writes `hero/<id>/proposal.md` (the stills, the reason, the input, the suggested model and a price table for
   every model with its licence) and posts it to Broadcast when `BROADCAST_URL` is set; otherwise show the stills and
   the table to him in the session. Input: a clean reference image (his photo or screenshot first; a product shot
   on a plain background, object whole, three-quarter view) gives a better shape than text. Text-to-3D only where the
   model offers it (`gen_mesh.py models`). Suggest the cheapest model that fits (below) and say why.
4. **He decides:** keep three.js, redo three.js with notes, or generate with a model he picks. Record it:
   `gen_mesh.py decide --id <id> --choice keep_threejs|redo_threejs|generate --model <key> --budget <usd> --reason "<his words>"`,
   or `gen_mesh.py sync --id <id>` when he decided in Broadcast. Redo: apply his notes, re-render, propose again
   (same id, new stills).
5. **Generate:** `gen_mesh.py quote --id <id>`, then `gen_mesh.py run --id <id>`. It is idempotent (a rerun polls the
   submitted job; a crash mid-submit resubmits the same key, which Broadcast returns as the same job), downloads the
   `.glb` to `public/hero/<id>/<model>.glb` and writes `hero/manifest.json` (model, price, cost, prompt, image hash,
   seed, options, proposal id, licence, file hash). A first run of an `untested` model is the pilot: check the
   `.glb` loads and fits, then set its status to `ready` in `mesh_models.json`. Failed twice: change the input
   image or the model, not the seed.
6. **Fit it into the same scene** with [`templates/HeroModel.tsx`](templates/HeroModel.tsx) (copy into
   `src/kit/`). Load it with `useGlb()` at the top of the composition, outside the canvas, and mount the canvas when
   it is ready (`three.md`). Then
   `<HeroModel gltf={m} size={112} axis="height" origin="base" light="neutralise" envMap={env} envIntensity={0.6} />`.
   - **Scale:** generators use arbitrary units. Set `size` in metres from the real object's measured dimension.
   - **Origin:** `base` puts the bottom centre at 0, so `position` seats it on the ground.
   - **Up:** `up="z"` for Z-up exports; `yaw` to face the camera.
   - **Baked light:** generated textures often have shading and highlights painted in, which fight the scene's sun.
     `neutralise` divides the colour texture by its own blurred luminance and clips the hot spots, keeping colour and
     fine detail. `keep` leaves it. `replace` puts your own material (e.g. the three.js version's shader) on the
     generated shape.
   - **Materials:** unlit becomes standard. glTF's default `metallicFactor` 1 without a metalness map becomes 0 (it
     rendered as a black mirror). Roughness is clamped to ≥ 0.35. The scene's environment is assigned explicitly so
     `envMapIntensity` works (look pass: environment light on hero objects only). Shadows are on.
   - **Budget:** over ~300k triangles it warns. Hunyuan Pro defaults to 500k faces: ask for the 150k option, or
     decimate.
   Then render the **same stills** at the same frames.
7. **Compare:** `gen_mesh.py propose --id <id> --stage comparison --stills <three.js stills> <generated stills>`. Show
   them side by side at the same size, with what each costs to keep (seconds per frame measured, file size). He picks
   `use_generated` or `keep_threejs_after_compare` (or redo / another model); `decide` again with his reason.
8. **Keep it:** for `use_generated`, register the `.glb` in the asset library as a `model` with its licence and
   credit (from the manifest), so the next film reuses it (`LIB register --kind model --dimensions ...`, see the
   asset-library skill). Put the model's `credit` line in the film's credits.

## Models (prices from fal, checked 2026-11-12; `gen_mesh.py models`)
| Key | Base | Options | Text-to-3D | Note |
|---|---|---|---|---|
| `tripo-v2.5` | $0.20 | textured +$0.10, HD +$0.20 | no (page unconfirmed) | cheapest textured; start here for products |
| `hunyuan3d-v2` | $0.16 | textured +$0.32 | no | cheapest shape; Tencent licence excludes EU/UK/KR |
| `hunyuan3d-v3.1-rapid` | $0.225 | PBR +$0.15 | yes, but OBJ only | |
| `hunyuan3d-v3.1-pro` | $0.375 | PBR +$0.15, 150k faces +$0.15 | yes | 500k faces by default |
| `meshy-6` | $0.80 | PBR, quad (free) | yes | textured included |
| `meshy-7` | $0.80 | textured +$0.40 | yes | $1.20 textured |
| `placeholder` | free | | yes | local primitive `.glb` for tests |

Every paid model starts `untested`. Licences are in each entry's `licence` field: all are tagged commercial on fal,
but Meshy's and Tripo's own terms give free-plan output under CC BY 4.0, and whether that applies through fal is
unconfirmed. So credit the model ("3D model: Meshy (via fal)") until it is confirmed. Hunyuan3D 2's community licence
excludes the EU, UK and South Korea. The terms for Hunyuan 3.x output are unconfirmed.

## Learning loop
- `lab/hero-assets/decisions.md` is the log; `gen_mesh.py decide`/`sync` append to it (once Broadcast exports
  `GET /api/factory/hero-decisions`, sync from there). Each line: the rubric score, the model, the cost and his reason.
- After a video ships, the `reflect` skill reads the log and proposes rule changes here (the rubric, the default
  model, the fit defaults). **A rule needs at least 2 decisions behind it**, quoted in the rule ("generated won 2/2
  for named products in close-up: ..."). One decision is a note, not a rule.
- Model choice is learned the same way: which model he picked and which won the comparison, per object type.

## Later (parked, Matthew wants these kept in mind)
- **Blender clean-up:** remesh, decimate, fix normals, split parts, re-bake textures with the lighting removed
  properly. This is the next step when `neutralise` isn't enough or a part has to move.
- **Cycles renders on Modal:** hero close-ups rendered in Blender Cycles on a hosted GPU, composited as in
  `animated-video/styles/realistic-3d/README.md` ("Handing Blender frames to Remotion").

## Status (2026-11-12)
- **Tested end to end on the bench** (`lab/hero-assets/bench/`): a Sphere stand-in in a dusk scene lit by the water
  kit's sky and environment (from moon-tides-01).
  - The flow ran: three.js stills → propose → decide → placeholder `.glb` → fit → the same stills.
  - The paid path ran against a local mock of Broadcast (`mock_broadcast.py`): post, sync, 402 over the cap, 403
    without approval, poll, download, manifest, idempotent rerun, and a crash mid-submit (one job created).
  - Fit, measured: 112 m tall and seated on its base. The plinth's default metallic 1 became 0.
  - `neutralise`, measured: the painted highlight patch went from luma 101 to 46, and the painted shadow side from 2
    to 7. It darkens the whole texture somewhat (37 → 26 over the sphere), so check exposure after it.
- **Broadcast side live (2026-11-12, MattSharp05/broadcast #38):** the proposal, decision and mesh-job endpoints as in
  the contract; its sandbox scenarios are `factory-hero-proposal`, `-compare` and `-history`. Not yet run from here.
- **Not yet run:** any paid model. Next: Matthew adds the fal key in Broadcast and
  runs one approved pilot (about $0.20-0.80), then that model is set to `ready`.

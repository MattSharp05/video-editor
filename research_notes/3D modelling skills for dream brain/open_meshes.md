# Free, openly licensed 3D meshes for a three.js (r169) dreaming-brain explainer

Researched 2026-11-06 from the cloud container (HTTPS proxy). Reachability codes are from `curl -sI -L` run in this container on that date. "Reachable" means HTTP 200 with the expected content type; several files were actually downloaded into the scratchpad and inspected (face counts, file lists, licence files).

Container reachability summary (measured):

| Host / URL | Result |
|---|---|
| dbarchive.biosciencedbc.jp (BodyParts3D zips) | 200, application/zip, sizes below |
| s3.us-east-2.amazonaws.com/brainder (Brain for Blender) | 200, downloaded and inspected |
| raw.githubusercontent.com (three.js r169 models) | 200 |
| `git ls-remote https://github.com/Z-Anatomy/Models-of-human-anatomy` | works (public git clone works through the proxy) |
| github.com web pages, api.github.com / `gh api` | blocked: 403 "GitHub access to this repository is not enabled for this session" (needs `add_repo`); plain `git clone` of public repos still works |
| neuromorpho.org API + `dableFiles/.../*.CNG.swc` | 200 |
| opengameart.org (Kenney zip mirror) | 200, downloaded and inspected |
| kenney-assets.itch.io page | 200 (HTML page; zip is behind a "name your price" button, not tested) |
| kenney.nl | 403 from the origin's nginx (not the proxy). Using a spoofed browser user agent was refused by the session's safety classifier, so not tried |
| poly.pizza, 3d.si.edu (Smithsonian 3D) | 403 |
| quaternius.com | 200 |
| 3d.nih.gov pages | 200; the direct GLB download was NOT confirmed (see A) |
| static.makehumancommunity.org, sketchfab.com, scalablebrainatlas.incf.org, openanatomy.org, celltypes.brain-map.org, download.alleninstitute.org | 200 (home pages only) |

## (A) Whole human brain with real gyri/sulci and separable, region-labelled parts

### Takeaway
There are two strong options. **Brainder "Brain for Blender"** is the best looking and best labelled (real FreeSurfer pial surfaces of one subject, already split into one OBJ per Desikan-Killiany / DKT / Destrieux region plus subcortical OBJs: hippocampus, amygdala, cerebellum, brainstem). It is direct curl, but **CC BY-SA 3.0 (share-alike)**. **BodyParts3D 4.0** is direct curl too, and its licence page now says **CC BY 4.0** (no share-alike). It has FMA-labelled parts (hemispheres, cerebellum, pons, medulla, midbrain, hippocampus, amygdala, thalamus, frontal gyri), but its cortex detail is unverified. NIH 3D's HRA "Brain, Male" GLB (CC BY 4.0, 141 Allen structures) is promising, but a direct download was not confirmed.

### Cited Findings
**Brainder – Brain for Blender (Anderson Winkler)**
- Licence: "The models in this page are by Anderson Winkler and are licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License", original work at brainder.org/brain-for-blender — [Brainder](https://brainder.org/research/brain-for-blender/)
- Content: one human brain (not fsaverage); full pial / white / inflated hemispheres; cortical parcellations as one mesh per region (Desikan-Killiany, Destrieux, DKT) for pial, white and inflated; subcortical set. Formats: FreeSurfer ASCII `srf`, `mz3`, OBJ, PLY — [Brainder](https://brainder.org/research/brain-for-blender/)
- Direct URLs (base `https://s3.us-east-2.amazonaws.com/brainder/software/brain4blender/`), verified 200 in this container (measured sizes):
  - `smallfiles/pial_Full_obj.tar.bz2`: 6.9 MB. Downloaded: `lh.pial.obj` 288,976 faces (11 MB), `rh.pial.obj` 290,138 faces (11 MB), so about 579k triangles for both hemispheres
  - `smallfiles/pial_DK_obj.tar.bz2`: 8.2 MB (pial cut into DK regions, e.g. lateral occipital/pericalcarine = visual cortex, superior frontal / rostral middle frontal = prefrontal)
  - `smallfiles/subcortical_obj.tar.bz2`: 3.4 MB. Downloaded: it holds Left/Right Hippocampus, Amygdala, Thalamus-Proper, Caudate, Putamen, Pallidum, Accumbens, VentralDC, Cerebellum-Cortex and Cerebellum-White-Matter, Brain-Stem, ventricles and 5 corpus callosum segments. 290,436 faces in total (Left-Cerebellum-Cortex 60,940; Brain-Stem 17,452; Left-Hippocampus 6,900)
  - `all_obj.tar.bz2`: 99.8 MB; `all_ply.tar.bz2`: 85.5 MB
  - (measured in this container)

**BodyParts3D / Anatomography (DBCLS)**
- Current licence page: "The license for this database is specified in the Creative Commons Attribution 4.0 International". Required credit: **"BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International"** — [BodyParts3D licence](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)
- Conflict: older releases and secondary sources state **CC BY-SA 2.1 Japan**. The 2011 README asks for the credit "BodyParts3D, Copyright© The Database Center for Life Science licensed by CC Attribution-Share Alike 2.1 Japan" — [README 2011](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/README_e.html), [Wikipedia: Anatomography](https://en.wikipedia.org/wiki/Anatomography). Use the 4.0 data from `LATEST/` with the CC BY 4.0 credit, and keep a copy of lic.html as evidence.
- Downloads (OBJ, verified 200 here): `https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_BP3D_4.0_obj_99.zip` (64.9 MB) and `https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_BP3D_4.0_obj_99.zip` (142.9 MB). Part tables: `partof_parts_list_e.txt` and `isa_parts_list_e.txt` — [download page](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html); sizes measured
- Brain parts listed in the PART-OF table (fetched here): brain FMA50801, left/right cerebral hemisphere FMA61819/FMA67292, forebrain, midbrain FMA61993, pons FMA67943, medulla FMA62004, cerebellum FMA67944, hypothalamus, and 24 named gyri, e.g. right/left superior frontal gyrus FMA72653/72654, middle and inferior frontal, precentral, postcentral. The IS-A table adds hippocampus (L/R FMA72713/72714), amygdala (L/R FMA72832/72833), thalamus FMA62007, insula, parahippocampal gyrus — [partof list](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_parts_list_e.txt), [isa list](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_parts_list_e.txt)

**Z-Anatomy**
- Models repo content is under CC BY-SA 4.0. It is derived from BodyParts3D, and its brain uses "Brainder" and a University of Washington white-matter model as references. Attribution should credit both BodyParts3D and Z-Anatomy — [Z-Anatomy/Models-of-human-anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy), [Z-Anatomy/The-blend](https://github.com/Z-Anatomy/The-blend)
- Format: a Blender template/.blend, so it needs a Blender export to GLB. `git clone` works from this container (git ls-remote succeeded); GitHub web/API returned 403 (measured).

**NIH 3D (3d.nih.gov)**
- Licensing varies per entry. NIH 3D's terms make users responsible for checking each file's licence, and some entries are CC BY-NC-SA — [NIH 3D terms](https://3d.nih.gov/terms), [NIH 3D FAQ](https://3d.nih.gov/faqs)
- Best candidate: **3DPX-020960 "Brain, Male"** (HRA reference organ). It is built from the Allen Human Reference Atlas 3D (2020, Ding et al. 2016): 141 structures, mirrored to a whole brain. It ships as one GLB `hra-reference-organ-brain-male-v1.3.glb`, licensed **CC BY 4.0** (from v1.3) — [NIH 3D entry 20960](https://3d.nih.gov/entries/20960?version=1)
- Download: `https://3d.nih.gov/entries/download/20960/1` returned an HTML page (200), and the API "output-files" link I tried returned a PNG thumbnail, not the GLB (measured). A direct curl-able GLB URL was not confirmed. Guessed cdn.humanatlas.io paths returned 404.
- Other brain entries exist (3DPX-001550 Alzheimer's atrophy STL; 3DPX-000757 sulci/gyri left hemisphere, mirrored on Sketchfab as CC BY), but I did not check their licences — [NIH 3D 3DPX-001550](https://3d.nih.gov/entries/3DPX-001550/2), [Sketchfab mirror of 3DPX-000757](https://sketchfab.com/3d-models/cps-model-1-sulci-gyri-of-left-hemisphere-216d50de44084049800ac0d548fb51b5)

**FreeSurfer fsaverage**
- The FreeSurfer licence grants "a royalty-free, non-exclusive license to use, reproduce, make derivative works of, display and distribute the Software" but says it "has been designed for research purposes only" and "Any commercialization of the Software is at the sole risk of the party". It doesn't separately address fsaverage surfaces — [FreeSurfer Software License](https://surfer.nmr.mgh.harvard.edu/fswiki/FreeSurferSoftwareLicense)

**Allen Institute meshes**
- Allen terms: use is permitted "for research or other noncommercial purposes"; "You may not redistribute the Content or Improvements for commercial purposes without our written permission"; commercial means content incorporated into "anything that is designed for the purpose of sale" — [Allen Terms of Use](https://alleninstitute.org/terms-of-use/). (The NIH HRA GLB derived from Allen data carries CC BY 4.0 on NIH 3D, per the entry above.)

### Inferences
- **Best gyri at phone size: Brainder pial.** These are real FreeSurfer pial surfaces, so the sulci are deep and true to life. Decimate each hemisphere from about 290k to about 60–100k triangles (quadric decimation keeps folds well at that level). Drop the white/inflated meshes. Budget: two hemispheres at about 80k each, plus cerebellum about 30k and brainstem about 10k, comes to about 200k, under the 300k software-WebGL target. For region highlights (visual cortex, prefrontal, amygdala, hippocampus), load the per-region DK OBJs instead of the full pial and tint each one; their seams line up because they are cut from the same surface.
- **Licence choice:** Brainder's BY-SA 3.0 share-alike applies to the mesh and its adaptations. For a Reel, the practical duty is the credit line and saying the derived mesh is BY-SA. Whether a video counts as an "adaptation" that must itself be BY-SA is a legal grey area; flag this to Matthew. If he wants to avoid share-alike, use BodyParts3D 4.0 (CC BY 4.0) or the NIH HRA GLB (CC BY 4.0).
- Suggested credits:
  - Brainder: "Brain meshes: 'Brain for Blender' by Anderson Winkler (brainder.org), CC BY-SA 3.0"
  - BodyParts3D: "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International"
- BodyParts3D's "99" archives are its 99%-reduced meshes, so the cortex is probably smoother than FreeSurfer pial. I haven't viewed them; render a still before choosing.
- Conversion: run OBJ/PLY through `trimesh` (Python: load, `simplify_quadric_decimation`, export `.glb`), or through `obj2gltf` and then `gltf-transform simplify/weld/draco` (npm). Both install from PyPI/npm, which the proxy allows. Merge each region into a named node so three.js can `getObjectByName('Left-Amygdala')`. These are standard tools; I didn't benchmark them here.
- Brainder is in FreeSurfer RAS millimetres; BodyParts3D has its own body coordinates. Recentre and scale after loading.

### Gaps
- Scalable Brain Atlas, MNI ICBM152, Open Anatomy Project and Smithsonian 3D licences and mesh downloads were not researched in depth (home pages reachable except 3d.si.edu at 403). I can't say whether they offer gyral meshes under open licences.
- Polygon counts and visual cortex quality of the BodyParts3D 4.0 brain parts are unmeasured (the zips weren't downloaded).
- The direct GLB URL for NIH 3DPX-020960 wasn't confirmed, and its triangle count is unknown.
- Z-Anatomy brain polygon counts and exact brain sources weren't checked.

## (B) Human head/body base mesh for a sleeping man

### Takeaway
Use a **MakeHuman/MPFB** export (CC0 output) for a realistic sleeping man, or a **Quaternius** character (QAL v1.0: free commercial use, no credit, but no redistributing the asset files) for a stylised one. The three.js **LeePerrySmith** head is CC BY 3.0, a 405 KB GLB and direct curl, but it's a scanned head only.

### Cited Findings
- **MakeHuman/MPFB:** the MakeHuman FAQ says exported models end up CC0 and can be sold — [MakeHuman FAQ](https://static.makehumancommunity.org/oldsite/faq/can_i_sell_models_created_with_makehuman.html). MPFB says "all core assets (the base mesh, targets, skins…)" are CC0 — [MPFB FAQ](https://static.makehumancommunity.org/mpfb/faq/can_i_sell_models.html), [MPFB closed-source FAQ](https://static.makehumancommunity.org/mpfb/faq/use_in_closed_source.html). The exception covers exports from an official, unmodified MakeHuman; third-party community assets carry their own licences — [ScanCode: MakeHuman exception](https://scancode-licensedb.aboutcode.org/make-human-exception.html)
- **Quaternius:** the current licence is the "Quaternius Asset License (QAL) v1.0": "You can use these assets, free of charge, in personal, educational, and commercial games and other projects, with no credit required. You just can't resell or redistribute the assets themselves as assets." It isn't retroactive, and the version in force when you obtained the assets governs — [Quaternius licence](https://quaternius.com/license.html) (fetched with curl here). Older releases were CC0, e.g. "animated human low poly" on OpenGameArt — [OpenGameArt](https://opengameart.org/content/animated-human-low-poly). Human packs include Universal Base Characters, Ultimate Modular Men, Animated Men and Ultimate Animated Character Pack (pages at `quaternius.com/packs/*.html`) — [Quaternius](https://quaternius.com/)
- **three.js LeePerrySmith:** "Infinite, 3D Head Scan by Lee Perry-Smith is licensed under a Creative Commons Attribution 3.0 Unported License. Based on a work at www.triplegangers.com" — [LeePerrySmith_License.txt](https://raw.githubusercontent.com/mrdoob/three.js/r170/examples/models/gltf/LeePerrySmith/LeePerrySmith_License.txt). In r169 the GLB is at `https://raw.githubusercontent.com/mrdoob/three.js/r169/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb`, 404,976 bytes, 200 (measured).
- **three.js Xbot:** `https://raw.githubusercontent.com/mrdoob/three.js/r169/examples/models/gltf/Xbot.glb`, 2,930,032 bytes, 200 (measured). Its licence: one non-authoritative page calls it MIT, and its Mixamo origin is unconfirmed — [sbcode three.js gltf animations](https://sbcode.net/threejs/gltf-animations)
- Poly Pizza (403 here), kenney.nl (403 here) and Sketchfab downloads were not testable or not tested.

### Inferences
- A sleeping man in bed, seen mostly as head and shoulders under a duvet, needs only modest geometry. A MakeHuman export, decimated to about 20–40k triangles, posed lying down in Blender or MPFB (not available in the container) and exported as GLB is the cleanest CC0 route. Without Blender here, a Quaternius GLB/FBX character posed in code (rotate bones in three.js) is simplest.
- Quaternius QAL forbids redistributing the asset itself. Don't commit Quaternius files to a public repo. A video is a "Product" and is fine.
- LeePerrySmith credit: "3D Head Scan by Lee Perry-Smith (Infinite-Realities / triplegangers.com), CC BY 3.0".

### Gaps
- MakeHuman/MPFB need the desktop app or Blender to export. I didn't check whether a ready-made CC0 GLB base mesh can be curled directly.
- Quaternius pack download links (zip/Google Drive) and formats weren't tested.
- The Xbot licence is unconfirmed; avoid it for publication unless verified.

## (C) Real neuron morphologies (SWC)

### Takeaway
NeuroMorpho.Org is **CC BY 4.0**, and its API and direct SWC file URLs both work from this container. It carries three mandatory citations. Allen Cell Types data under the Allen terms is noncommercial without written permission, so take Allen neurons via NeuroMorpho only after checking the licence that applies (flagged).

### Cited Findings
- "NeuroMorpho.Org is licensed under a Creative Commons Attribution 4.0 International License." Users must cite all three of these: (1) the original paper(s) for the reconstruction (PubMed link on each neuron page); (2) "NeuroMorpho.Org (RRID:SCR_002145)"; (3) Tecuatl C, Ljungquist B, Ascoli GA (2024) "Accelerating the continuous community sharing of digital neuromorphology data". The API and direct file URLs are allowed; scripting `.jsp` pages is prohibited, and bots should identify their user agent — [NeuroMorpho terms](https://neuromorpho.org/useterm.jsp)
- Older or secondary sources disagree (CC0 per a 2021 article; ODbL per Data.gov). The site's own page now says CC BY 4.0 — [Data.gov listing](https://catalog.data.gov/dataset/neuromorpho)
- Measured here: `https://neuromorpho.org/api/neuron/name/cnic_001` returns JSON (archive Wearne_Hof, monkey prefrontal layer-3 pyramidal, PMIDs 12204204, 12902394). `https://neuromorpho.org/dableFiles/wearne_hof/CNG%20version/cnic_001.CNG.swc` returns 200. `https://neuromorpho.org/api/neuron/select?q=species:human&size=1` returns human neurons, e.g. Allen Cell Types `H17-03-010-11-13-01_656411100_m` (middle temporal gyrus). URL pattern: `dableFiles/<archive lowercased>/CNG%20version/<neuron_name>.CNG.swc`.
- Allen terms bar commercial redistribution without permission — [Allen Terms of Use](https://alleninstitute.org/terms-of-use/)

### Inferences
- For a Reel, prefer human or rodent pyramidal cells from non-Allen archives (e.g. Wearne_Hof), where the CC BY 4.0 credit plus the three citations is clean. Put the citations in the caption or a pinned comment.
- SWC to tubes: each SWC line is `id type x y z radius parent`. In three.js, build one `CatmullRomCurve3` per unbranched segment, then a `TubeGeometry` with radius from the SWC (or a fixed minimum), and merge with `BufferGeometryUtils.mergeGeometries`. The soma (type 1) is a sphere. Alternatively, generate cylinders per edge in Python with `trimesh` and export GLB. Keep radial segments at about 5–6 and decimate long straight runs to stay at about 20–50k triangles per neuron. Growth animation: sort points by path distance from the soma and reveal with `drawRange`.

### Gaps
- I didn't confirm whether Allen-archive neurons mirrored on NeuroMorpho inherit NeuroMorpho's CC BY 4.0 or keep Allen's noncommercial terms.
- No SWC file was downloaded and parsed (only HTTP 200 checked).

## (D) Low-poly town/house kits for a stylised town

### Takeaway
**Kenney City Kit (Suburban) 2.0 is CC0 and ships GLB files.** The OpenGameArt mirror is a direct curl (3.0 MB) that works from this container; kenney.nl itself returns 403 here. Quaternius building packs (QAL v1.0) are an alternative.

### Cited Findings
- Direct URL `https://opengameart.org/sites/default/files/kenney_city-kit-suburban_2.0.zip`: 3,038,740 bytes, downloaded here. It contains `License.txt` ("License: (Creative Commons Zero, CC0) ... You can use this content for personal, educational, and commercial purposes. Support by crediting 'Kenney' or 'www.kenney.nl' (this is not a requirement)"), plus `Models/GLB format/building-type-a.glb` etc. (about 100–150 KB each), FBX/OBJ folders, textures and previews (measured). Page: [OpenGameArt City Kit Suburban](https://opengameart.org/content/city-kit-suburban)
- Also on itch.io, name-your-own-price, CC0, `kenney_cityKitSuburban.zip` — [itch.io](https://kenney-assets.itch.io/city-kit-suburban). Sibling kit: [City Kit Commercial on OpenGameArt](https://opengameart.org/content/city-kit-commercial)
- Quaternius town packs: Simple Buildings, Buildings Pack, Medieval Village MegaKit — [Quaternius](https://quaternius.com/), licence QAL v1.0 — [Quaternius licence](https://quaternius.com/license.html)

### Inferences
- Kenney Suburban GLBs share one colormap texture and are a few hundred triangles each. A street of 30–60 houses stays well under 100k triangles and loads directly with `GLTFLoader`, with no conversion. Crediting "Kenney" is optional, but it's good practice.

### Gaps
- Exact triangle counts per Kenney building weren't computed.
- Poly Pizza (403 here) wasn't evaluated.

# Part connection QA: prevent and detect parts that fall apart

Researched 2026-11-07 for Remotion + three.js r169 + R3F 8 on headless software WebGL. GitHub code
search (`gh api search/code`) was used for discovery, then the actual files were read through
raw.githubusercontent.com. Both checks below were run on our own `brain.glb` and on a stand-in for
the sleeping man (measured, not eyeballed).

## The two failures, measured

| Asset | Construction | Measured |
|---|---|---|
| Spinal cord on `brain.glb` stem (`film/src/kit/brain.tsx` l.24, l.83) | cord starts at `(bboxCentre.x, bbox.min.y, 0)` | **gap 0.061** (three-mesh-bvh) / 0.062 (trimesh). The stem's real lowest point is at x = **0.334**, but the bbox centre is x = **0.08**, so the cord starts 0.25 to one side, and the cut end faces down-and-sideways (normal ≈ (0.31, −0.92, 0.25)), not straight down. |
| Same cord, anchored on the stem's real end (centroid + normal of the bottom 4 % of its vertices, start sunk 0.06 inside) | | gap **0.000**, PASS |
| Sleeping-man stand-in: neck cylinder stops at x = 0.20, blanket starts at 0.25 | | neck–head PASS; **neck–blanket gap 0.057, FAIL**; contact graph has 2 groups |
| Neck pushed 0.06 into the head and ~0.09 into the blanket | | both PASS, sunk 0.060 / 0.064; 1 group |

Note that the brain's `stem` mesh alone has 24 connected components (an anatomical GLB). "One
mesh component" is the wrong test for imported assets. The right test is a **contact graph**:
parts that should connect must form one group.

## 1. Sources consulted

| # | Source (licence) | File read | What it contributes |
|---|---|---|---|
| 1 | [willy92wins/DayZ-Modding-Knowledge-Pack](https://github.com/willy92wins/DayZ-Modding-Knowledge-Pack) `blender-assembly` + `blender-visual-review` (MIT) | `skills/blender-assembly/SKILL.md`, `skills/blender-visual-review/SKILL.md` | **Construction rules.** Names our bug: "*Invisible gaps* — parts placed 'near' each other with no geometric overlap look exploded when rendered. Even a 5mm gap is visible." Phase 1: "Create a **connection map** listing every joint before writing any geometry", each with "the target overlap (minimum 0.005m / 5mm)". Rule 2: build A-to-B parts from explicit endpoints (`make_beam(start, end)`), "never rotate cylinders". Rule 4: "Derive spanning dimensions from verified neighbour bounds… never guess". Rule 5: subsurf shrinks parts, so "extend geometry 10–15 % past the target". Phase 3: `verify_overlap(a, b, axis, min_overlap)` "for **every joint**… If it shows a gap, fix the position before" moving on. Visual review: "One angle hides defects: a gap invisible head-on"; front/right/top/iso renders; "Exploded / floating parts" are on the defect list; "re-render the *same* angles". |
| 2 | [ifBars/blender-agent-studio](https://github.com/ifBars/blender-agent-studio) `blender-asset-validation` (MIT) | `plugins/blender-agent-studio/skills/blender-asset-validation/SKILL.md` | **Declared contact pairs plus anchor points, with honest limits.** "For intended physical joints, declare `contactPairs`… exact mesh-object pairs that should touch. Choose them from the construction contract, not from arbitrary nearby names." "AABB overlap and proximity are review candidates, not proven… contact." For pipe ends and hinges: "`contactPairs` can miss a wrong endpoint when whole-object boxes overlap. Add `connectionPoints`… object-local `pointA`/`pointB`… `maxDistance`." "Moving markers alone is not a repair." Final gate: hero view plus front, back, left, right and top views, plus a contact sheet, with "floating or unsupported elements" and "intersections and accidental gaps" on the list. A `bottom` view covers underside joints, and a `detail_preview` close-up shows a small joint. |
| 3 | [EL4CTEO/blender-skills](https://github.com/EL4CTEO/blender-skills) `blender-asset-qa` (MIT) | `skills/blender-asset-qa/SKILL.md`, `scripts/qa_check.py`, `scripts/review_shots.py` | **Automated floating-island detector plus a per-part colour contact sheet.** The finding `floating` means an "island/object not touching any other part within `--tol`" (default 0.002). The fix is to "move it to make contact (snap), bridge it, or join and merge". `qa_check.py` splits meshes into islands, builds a `BVHTree` and runs `find_nearest_range(p, tol)` against the largest island. The visual step: "`review_shots.py --mode random` (one color per object, which makes detached pieces obvious)", tiled into a contact sheet. It also flags `enclosed`, a part fully inside another (eyes), as "usually fine". |
| 4 | [vinhhien112/img2obj](https://github.com/vinhhien112/img2obj) `object-to-threejs-procedural` (MIT) | `SKILL.md`, `references/attachment-joint-correctness.md` | **Attachment contract for three.js children.** "Detached or floating child parts usually come from treating a child component as a free mesh with only position, rotation, and scale." Every child declares `parentSocket`, `localStart`, `localEnd`, `baseRadius`, `embedDepth`/`overlap`, `contactType` (`embedded`, `socket`, `overlap`…), `gapTolerance`. "Generator rule: place the pivot group at `localStart`, generate the visible mesh from `localStart` to `localEnd`… Do not center the mesh at an arbitrary transform position." Review: "Are there floating joints or air gaps at… limbs, tubes, connectors?" "Review both the local crop and the full assembly." Complex assemblies "always require the 2x2 turnaround" (three-quarter, side, back, front). |
| 5 | [InstruktAI/TeleClaude](https://github.com/InstruktAI/TeleClaude) `threejs-procedural-assets` (GPL-3.0: read it for ideas, don't vendor it) | `agents/global/skills/threejs-procedural-assets/SKILL.md` | **Avoid the assembly in the first place.** "Silhouette… built from continuous curved surfaces (splines, lofts, fields), never from intersecting primitives." For an organic body (whale, human) the technique is a "Lofted spline surface: spine curve + swept cross-sections", and the "Sphere/cylinder assembly" shortcut is banned. Self-check: "zero visible primitive intersections?" |
| 6 | [gkjohnson/three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) (MIT; v0.8.3 peer `three >= 0.159`, so it works with r169) | `src/core/MeshBVH.js` | `bvh.closestPointToGeometry(otherGeometry, geometryToBvh, target1, target2, minThreshold, maxThreshold)` returns the distance and the closest point on each mesh. Also `intersectsGeometry`. It runs in Node without WebGL. Measured on our brain stem (18.7k triangles): the first call took 110 ms (building the BVH), later calls about 2 ms. |
| 7 | [mikedh/trimesh](https://github.com/mikedh/trimesh) (MIT; 5.2.0 in `.venv-qw`) | API inspected in the venv | `Trimesh.split()` counts connected components and `sample_surface_even` samples the surface. `proximity.closest_point` and `CollisionManager.min_distance_*` need `rtree`/`python-fcl`, which are **not** installed in `.venv-qw`, so the script below uses a scipy KD-tree on dense surface samples (accuracy ≈ sample spacing). |
| 8 | Connected by construction: [fogleman/sdf](https://github.com/fogleman/sdf) (MIT), [elalish/manifold](https://github.com/elalish/manifold) (Apache-2.0, npm `manifold-3d`), [gkjohnson/three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg) (MIT), three.js r169 `examples/jsm/objects/MarchingCubes.js` | `sdf/dn.py`, manifold `README.md` | fogleman `union(a, b, k=0.25)` is Inigo Quilez's polynomial smooth-min: `h = clip(0.5+0.5*(d2-d1)/k, 0, 1); d = d2+(d1-d2)*h - k*h*(1-h)`. Manifold: "guaranteed manifold output", with a WASM npm build ("serial-only… but still fast") and "a level set function for evaluating signed-distance functions (SDF) that improves significantly over Marching Cubes". MarchingCubes `addBall()` gives metaballs that blend into one surface. |
| 9 | Socket pattern: [matthewbcool/Monterey-Bay-Cozy](https://github.com/matthewbcool/Monterey-Bay-Cozy) (MIT) | `src/models/shared/surfaceAttachment.ts` | **An anchor taken from a real surface hit, not a box.** `surfaceAnchorFromHit(hit)` keeps `{surface, point, normal}` **in the surface's local space** ("never retain its world point as placement"). `attachToSurface` builds the child's frame from that normal plus a tangent projected onto the surface (`tangent -= n * dot(tangent, n)`) and uses the inverse-transpose for normals under non-uniform scale. This is the three.js equivalent of Blender Geometry Nodes' Raycast / Sample Nearest Surface. three r169's `MeshSurfaceSampler.sample(pos, normal)` gives the same point-plus-normal for scattered children. |

Common thread: every serious skill pairs a **declared joint list** (connection map / contactPairs /
attachment contract) with a **numeric check per joint** and a **multi-view render**. None of them
trusts a single "does the shot read" look.

## 2. Proposed solution for our pipeline

### (a) Construction rules (add to `animated-video/references/three.md` + `characters.md`)

1. **Write a joint list before any geometry.** Each line is `partA ↔ partB, type (embedded | overlap | surface), sink depth, max gap`. It lives in the asset file header and doubles as the input to the check.
2. **One surface where possible.** For organic shapes (a body under a blanket, a head with its neck) use one lofted tube along a spine curve, or an SDF smooth union (`smin`, k ≈ 0.3–0.5 × neck radius), then mesh it with MarchingCubes or `manifold-3d` `levelSet` once at load time. Don't use separate primitives that merely sit next to each other. For hard parts that must be one solid, use a `manifold-3d` union (WASM, CPU). Use `three-bvh-csg` only for quick unions that don't need to be watertight.
3. **When parts stay separate, sink them; never butt them.** The child starts inside the parent by ≥ 0.5 × its own radius, or ≥ 5 mm at real-world scale (DayZ rule), and ends inside the next part the same way. A neck runs from inside the head to inside the blanket. A part that should be hidden ends under the cover, not in the air.
4. **Anchor from real surface points and tangents, never from a bounding box.** Find where the child attaches by one of these:
   - raycasting the parent mesh (`Raycaster` → `hit.point`, `hit.face.normal`, stored in parent-local space);
   - taking the parent's cut end (the vertices within a few % of its extreme along the attach axis → centroid as the point, mean normal or PCA as the direction, and their spread as the radius);
   - `MeshSurfaceSampler` for scattered children.

   Build the child **from that point along that normal**, starting at `point − normal × sink`, with the first control point after it along `+normal` so the tube leaves tangent to the cut. For the brain: replace `stemBottom` (bbox) with the stem's measured end (0.334, −1.184, 0.002), and a radius of about 0.07 taken from the end's own spread.
5. **Pivot at the joint.** Build endpoint parts from `localStart` to `localEnd` (img2obj and DayZ Rule 2), never as a centred cylinder that is rotated and moved into place.
6. Account for shrinkage (subdivision, displacement, `smin`) by extending overlaps by 10–15 %.

### (b) Automated check (fails the step; runs before boarding and again before the full render)

**In the film (primary; no export needed).** Add `three-mesh-bvh@0.8.3` and a `<JointCheck>`
component. It is on in a `?qa` input prop / `QA` composition and at a few sampled frames of
animated shots. After mount it finds the named meshes, moves their geometry into world space,
and **throws** on failure. `remotion still` then exits non-zero with the message, so the agent
can't miss it. Tested core (Node, three 0.169, on our brain.glb):

```js
import { MeshBVH } from 'three-mesh-bvh';
// a, b: world-space BufferGeometries (geometry.clone().applyMatrix4(mesh.matrixWorld))
export function jointGap(a, b) {
  a.boundsTree ??= new MeshBVH(a); b.boundsTree ??= new MeshBVH(b);
  const t1 = {}, t2 = {};
  a.boundsTree.closestPointToGeometry(b, new THREE.Matrix4(), t1, t2);
  return { gap: t1.distance, onA: t1.point, onB: t2.point };   // 0 when they intersect
}
// JOINTS = [['neck','head',0.003], ['neck','blanket',0.003], ['cord','stem',0.005]]
for (const [a, b, max] of JOINTS) { const r = jointGap(G[a], G[b]);
  if (r.gap > max) throw new Error(`joint ${a}<->${b} gap ${r.gap.toFixed(3)} > ${max} at ${r.onA.toArray()}`); }
```

Output on the shipped cord: `bbox-placed cord: gap 0.0607 FAIL`. With the surface-anchored cord: `gap 0.0000 PASS`.
Also run a **contact-graph test**: union-find over all part pairs with gap ≤ tol, where every
declared "one piece" group must come out as exactly one group. That catches a part nobody thought
to list. It's a cheap n² for the 5–20 parts in an asset.

**Offline / for GLBs and Blender exports (Python, trimesh in `.venv-qw`).** `check_joints.py
scene.glb joints.json` was tested on all four cases above (exit 1 on the two bad ones, 0 on the
good ones; 0.6 s for the man, 4–5 s for the brain). Spec format:

```json
{"joints": [{"a": "neck", "b": "head",    "max_gap": 0.003, "min_overlap": 0.02},
            {"a": "neck", "b": "blanket", "max_gap": 0.003, "min_overlap": 0.02}],
 "one_piece": [["head", "neck", "blanket"]]}
```

```python
"""check_joints.py - fail an assembled 3D asset whose declared joints do not touch.
Usage:  python -I check_joints.py scene.glb joints.json [--spacing 0.005]
gap = min surface distance (KD-tree on dense samples, accuracy ~ spacing); min_overlap = depth
of A under B's surface along B's normals (proves 'sunk'); one_piece = contact graph is 1 group."""
import json, sys, argparse
import numpy as np, trimesh
from scipy.spatial import cKDTree

def load_parts(path):
    scene = trimesh.load(path, force="scene"); parts = {}
    for node in scene.graph.nodes_geometry:
        tf, geom = scene.graph[node]; m = scene.geometry[geom].copy(); m.apply_transform(tf); parts[node] = m
    return parts

def samples(mesh, spacing):
    n = int(min(400_000, max(2_000, mesh.area / spacing**2)))
    pts, _ = trimesh.sample.sample_surface_even(mesh, n, radius=spacing * 0.5, seed=1)
    return np.vstack([pts, mesh.vertices])

def gap(a, b, spacing, cache):
    if id(a) not in cache: cache[id(a)] = samples(a, spacing)
    if id(b) not in cache: cache[id(b)] = samples(b, spacing)
    pa, pb = cache[id(a)], cache[id(b)]
    d, i = cKDTree(pb).query(pa, k=1); j = int(np.argmin(d))
    return float(d[j]), pa[j], pb[i[j]]

def overlap_depth(a, b, pa):   # convex-ish hosts; needs no rtree / watertightness
    _, i = cKDTree(b.vertices).query(pa, k=1)
    signed = np.einsum("ij,ij->i", pa - b.vertices[i], b.vertex_normals[i])
    return float(max(0.0, -signed.min()))

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("glb"); ap.add_argument("joints")
    ap.add_argument("--spacing", type=float, default=0.005); o = ap.parse_args()
    spec = json.load(open(o.joints)); parts = load_parts(o.glb); cache = {}; fail = False
    print("parts: " + ", ".join(f"{k}({len(v.split(only_watertight=False))} comp)" for k, v in parts.items()))
    for j in spec["joints"]:
        A, B = parts[j["a"]], parts[j["b"]]; g, pa, pb = gap(A, B, o.spacing, cache)
        ok = g <= j["max_gap"] + o.spacing; msg = f"{j['a']:>10} <-> {j['b']:<10} gap {g:.4f} (max {j['max_gap']})"
        if "min_overlap" in j:
            dep = overlap_depth(A, B, cache[id(A)]); msg += f"  sunk {dep:.4f} (min {j['min_overlap']})"
            ok &= dep >= j["min_overlap"]
        print(("PASS " if ok else "FAIL ") + msg + ("" if ok else f"  closest A{pa.round(3)} B{pb.round(3)}")); fail |= not ok
    tol = max(2 * o.spacing, min(j["max_gap"] for j in spec["joints"]))
    for group in spec.get("one_piece", []):
        parent = {k: k for k in group}
        def root(k):
            while parent[k] != k: k = parent[k]
            return k
        for x in group:
            for y in group:
                if x < y and gap(parts[x], parts[y], o.spacing, cache)[0] <= tol: parent[root(x)] = root(y)
        n = len({root(k) for k in group}); print(("PASS " if n == 1 else "FAIL ") + f"one piece {group}: {n} group(s)"); fail |= n != 1
    sys.exit(1 if fail else 0)

if __name__ == "__main__": main()
```

Limits:
- A passed gap check proves the parts touch. It doesn't prove the joint looks right: a neck can touch the blanket at an edge and still look stuck on. Hence `min_overlap` and the visual step.
- Animated parts need checking at sampled frames (EL4CTEO and DayZ both say clearance must be checked per keyframe, not only in the posed render).
- With `rtree` or `python-fcl` installed, trimesh's exact `closest_point` / `CollisionManager.min_distance_other` could replace the KD-tree approximation. Not needed at our tolerances.

### (c) Visual QA step (before any shot is boarded)

For every assembled asset, render an **asset sheet** in a `QA` composition: the asset alone on a
mid-grey background with neutral key light, and **each part in a different flat colour**
(EL4CTEO `--mode random`), so a gap shows as background between two colours.
- **8 turntable views** at 45° steps, at eye level, plus **top and bottom** (ifBars' `bottom` view for underside joints such as the stem/cord), tiled 4×3 at about 480 px.
- **One close-up per declared joint**: the camera aimed at `onA` from `jointGap`, from two angles 90° apart, in both the flat-colour and the shot material, because a gap invisible head-on shows from the side (DayZ).
- The same sheet again in the **shot's real camera and lighting at its first and last frame**, because occluders and cropping hide or reveal joints.
- Read the sheets; after any fix, re-render **the same views** and compare before/after.

**Checklist line for `review.md`:** *"Every assembled asset: the joint check passes (no declared
joint gap over tolerance, contact graph is one piece) and its colour-per-part turntable sheet plus
a close-up of every joint were read before boarding: no floating, cut-off or offset part from any
angle."*

## 3. Effort and cost (CPU-only, SwiftShader)

| Item | One-off effort | Per-asset run cost |
|---|---|---|
| `JointCheck` component + `jointGap` + contact graph (three-mesh-bvh, MIT, ~40 kB) | ~2–3 h | BVH build ≈ 100 ms per 20k-tri part, later queries ≈ 2 ms each (measured in Node). Negligible in a still render. |
| `check_joints.py` (done; above) | ~0 (copy in) | 0.6 s for primitives, 4–5 s for the 100k-tri brain (measured) |
| QA composition (turntable + per-joint close-ups + colour-per-part material) | ~3–4 h | ~16–20 stills per asset. At about 1–2 s per small still (**estimate**; this film's full frames were 3.66 s/frame with 4 workers) that is ~0.5–1 min per asset, plus reading the sheet |
| Fix the two current assets (surface-anchored cord; sink the neck or replace head+neck+body with one `smin`/loft surface) | ~1–2 h | — |
| SDF/manifold union (optional, for organic bodies) | ~2–4 h first time (`manifold-3d` WASM or MarchingCubes at load) | Meshing once at load: about 0.1–1 s on CPU at 64–128³ (estimate), then free per frame |

Total: about one working day to add all three layers. After that it costs about 1–2 minutes per
asset, versus a 2-hour full render that ships a floating neck.

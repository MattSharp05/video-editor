# Assembly: parts that touch

Anything built from parts (a body, a head on a neck, a brainstem and its spinal cord, a lamp on a post) must look
like one object from every angle the film shows. In Dream brain 01 v1 two assemblies fell apart on screen and the
frame review missed both, because it asked whether each shot read, not whether the parts touched: a neck cylinder
that stopped short of the blanket, and a spinal cord placed from the brainstem's bounding box (the real cut end sat
0.25 to the side and pointed down-and-sideways, leaving a 0.06 gap). Matthew caught both on his phone.

Sources (read 2026-11-07; techniques borrowed, licences MIT unless noted; notes in `research_notes/Part connection QA/`):
willy92wins/DayZ-Modding-Knowledge-Pack `blender-assembly` + `blender-visual-review` ("Even a 5mm gap is visible";
joint list before geometry; "One angle hides defects"), ifBars/blender-agent-studio `blender-asset-validation`
(declared contact pairs, exact anchor points, "box overlap proves nothing about contact", six views + contact sheet),
EL4CTEO/blender-skills `blender-asset-qa` (BVH island check, a colour per part "makes detached pieces obvious"),
vinhhien112/img2obj `attachment-joint-correctness.md` (every child declares its parent socket, sink depth and gap
tolerance), matthewbcool/Monterey-Bay-Cozy `surfaceAttachment.ts` (anchor = surface point + normal in the parent's
frame), InstruktAI/TeleClaude `threejs-procedural-assets` (GPL-3.0: idea only, one lofted surface for bodies).
Libraries: three-mesh-bvh (MIT), trimesh (MIT), fogleman/sdf (MIT), manifold-3d (Apache-2.0), three-bvh-csg (MIT).

## 1. Build so parts connect by construction

- **Write the joint list first**, before any geometry: every pair that must touch, which part is the parent, how
  deep the child sinks in, and the tolerance. It lives in the asset's file as data (`JOINTS`), not in your head.
- **One surface where you can.** Organic shapes (a body, a limb on a torso, a neck into shoulders) are one lofted
  surface along a spine, or a smooth-union SDF meshed once at load. A body made of separate spheres and cylinders
  is the failure case.
- **Sink, never butt.** Where parts stay separate, push each child at least half its own radius (and 10-15 % more
  for any later scaling) into the parent. Two surfaces placed to just meet leave a seam or a gap at some angle.
- **Anchor on the real surface, never on a bounding box.** Take the attachment point and direction from the
  parent's geometry: the centroid and mean normal of the cut end's vertices, a raycast hit, or a
  `MeshSurfaceSampler` point. `anchorFromEnd()` in `templates/remotion-film/src/kit/joints.ts` does the cut-end
  case. A child's pivot sits at its joint, so moving the parent carries it.
- Covered joints still count: a neck under a blanket must reach under the blanket, because a camera move or a
  sit-up will show it.

## 2. Check automatically

- **In the film (three.js):** `useJointCheck(JOINTS)` from `kit/joints.ts` measures each declared joint with
  three-mesh-bvh (`closestPointToGeometry`, ~100 ms to build per 20k-triangle part, ~2 ms per query) when the
  asset mounts and throws with the gap and the closest points when one is over tolerance, so `remotion still`
  and the board fail visibly. Needs `npm i three-mesh-bvh@0.8.3` (works with three r169).
- **For a GLB (from Python, Blender or a download):** `python -I check_joints.py asset.glb joints.json` reports
  every joint's gap, how deep the child is sunk (`min_overlap`) and whether the parts that must be one piece form
  one touching group; it exits 1 on any failure.
- Test contact between parts, not "one connected mesh per part": real anatomy meshes come in many islands (the
  BodyParts3D brainstem alone has 24).

## 3. Look before boarding

- Every assembled asset gets a **QA sheet**: the asset alone, a different flat colour per part, 8 turntable views
  plus top and bottom, and two close-ups of every joint aimed at the closest point the check reports
  (`kit/qa.tsx` + `qa_sheet.sh`). Then the same asset in each shot's camera at its first and last frame.
- After any fix to a joint, render the same views again and compare.
- Cost on the CPU: ~16-20 small stills, about a minute per asset.

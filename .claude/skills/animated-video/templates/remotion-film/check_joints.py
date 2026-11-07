"""check_joints.py - fail an assembled 3D asset whose declared joints do not touch.

Usage:  python -I check_joints.py scene.glb joints.json [--spacing 0.005]

joints.json:
  {"joints": [{"a": "neck", "b": "head",    "max_gap": 0.003, "min_overlap": 0.01},
              {"a": "neck", "b": "blanket", "max_gap": 0.003}],
   "one_piece": [["head", "neck", "blanket"]]}

- gap  = min distance between the two surfaces (KD-tree on dense surface samples, accuracy ~ spacing).
- min_overlap: how deep A's surface goes under B's (signed distance along B's normals) - proves A is sunk in.
- one_piece: the contact graph (edge = gap <= max(spacing*2, smallest declared tol)) must be one group.
Exits 1 on any failure. Needs only trimesh + numpy + scipy.
"""
import json, sys, argparse
import numpy as np, trimesh
from scipy.spatial import cKDTree


def load_parts(path):
    scene = trimesh.load(path, force="scene")
    parts = {}
    for node in scene.graph.nodes_geometry:
        tf, geom = scene.graph[node]
        m = scene.geometry[geom].copy(); m.apply_transform(tf)
        parts[node] = m
    return parts


def samples(mesh, spacing):
    n = int(min(400_000, max(2_000, mesh.area / spacing**2)))
    pts, _ = trimesh.sample.sample_surface_even(mesh, n, radius=spacing * 0.5, seed=1)
    return np.vstack([pts, mesh.vertices])


def gap(a, b, spacing, cache):
    if id(a) not in cache: cache[id(a)] = samples(a, spacing)
    if id(b) not in cache: cache[id(b)] = samples(b, spacing)
    pa, pb = cache[id(a)], cache[id(b)]
    d, i = cKDTree(pb).query(pa, k=1)
    j = int(np.argmin(d))
    return float(d[j]), pa[j], pb[i[j]]


def overlap_depth(a, b, pa):
    """How deep A's surface goes under B's surface: signed distance to B's nearest vertex along its
    normal (negative = inside). Good for convex-ish hosts; no rtree/watertightness needed."""
    _, i = cKDTree(b.vertices).query(pa, k=1)
    signed = np.einsum("ij,ij->i", pa - b.vertices[i], b.vertex_normals[i])
    return float(max(0.0, -signed.min()))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("glb"); ap.add_argument("joints")
    ap.add_argument("--spacing", type=float, default=0.005)
    o = ap.parse_args()
    spec = json.load(open(o.joints)); parts = load_parts(o.glb); cache = {}
    fail = False
    print(f"parts: {', '.join(f'{k}({len(v.split(only_watertight=False))} comp)' for k, v in parts.items())}")
    for j in spec["joints"]:
        A, B = parts[j["a"]], parts[j["b"]]
        g, pa, pb = gap(A, B, o.spacing, cache)
        ok = g <= j["max_gap"] + o.spacing
        msg = f"{j['a']:>10} <-> {j['b']:<10} gap {g:.4f} (max {j['max_gap']})"
        if "min_overlap" in j:
            dep = overlap_depth(A, B, cache[id(A)])
            msg += f"  sunk {dep:.4f} (min {j['min_overlap']})"
            if dep < j["min_overlap"]:
                ok = False
        print(("PASS " if ok else "FAIL ") + msg + ("" if ok else f"  closest A{pa.round(3)} B{pb.round(3)}"))
        fail |= not ok
    tol = max(2 * o.spacing, min(j["max_gap"] for j in spec["joints"]))
    for group in spec.get("one_piece", []):
        parent = {k: k for k in group}
        def root(k):
            while parent[k] != k: k = parent[k]
            return k
        for x in group:
            for y in group:
                if x < y and gap(parts[x], parts[y], o.spacing, cache)[0] <= tol:
                    parent[root(x)] = root(y)
        n = len({root(k) for k in group})
        print(("PASS " if n == 1 else "FAIL ") + f"one piece {group}: {n} group(s)")
        fail |= n != 1
    sys.exit(1 if fail else 0)


if __name__ == "__main__":
    main()

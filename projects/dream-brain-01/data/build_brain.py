# Build the film's brain from BodyParts3D 4.0 (CC BY 4.0, (c) The Database Center for Life Science):
# Source: curl -O https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_BP3D_4.0_obj_99.zip (+ partof_element_parts.txt);
# unzip the element OBJs listed for the brain concepts below into <dir>/obj/ first.
# real cortex folds, grouped into the regions the film lights up. Writes film/public/brain.glb (one mesh per region,
# named), in brain units: ~2.6 long front-to-back, front = -x, top = +y, left/right = z, centred.
# usage: python build_brain.py <dir with partof_element_parts.txt and obj/>
import sys, os, trimesh, numpy as np
D = sys.argv[1]
rows = [l.rstrip('\n').split('\t') for l in open(f'{D}/partof_element_parts.txt')][1:]
el = {}
for cid, name, fj in rows: el.setdefault(cid, set()).add(fj)
g = lambda *ids: set().union(*[el[i] for i in ids])
GROUPS = {
  'front': g('FMA72969', 'FMA72970'),                                                     # frontal lobes
  'seeing': g('FMA72975', 'FMA72976', 'FMA72689', 'FMA72690', 'FMA72687', 'FMA72688'),    # occipital + fusiform + inferior temporal
  'memory': g('FMA72713', 'FMA72714', 'FMA72705', 'FMA72706'),                            # hippocampus + parahippocampal
  'cereb': g('FMA67944'), 'stem': g('FMA79876'),
}
hemi = g('FMA61819', 'FMA67292')
taken = set().union(*GROUPS.values())
GROUPS['cortex'] = hemi - taken
meshes = {k: trimesh.util.concatenate([trimesh.load(f'{D}/obj/{f}.obj', force='mesh') for f in sorted(v) if os.path.exists(f'{D}/obj/{f}.obj')]) for k, v in GROUPS.items()}
allv = np.vstack([m.vertices for m in meshes.values()])
c = (allv.min(0) + allv.max(0)) / 2
# BodyParts3D axes (mm): x = right->left, y = front(-)->back(+), z = up. Ours: x = front(-)->back(+), y = up, z = left/right.
cereb_v = np.vstack([meshes[k].vertices for k in ('cortex', 'front', 'seeing')])
L = cereb_v[:, 1].max() - cereb_v[:, 1].min()
s = 2.6 / L
scene = trimesh.Scene()
for k, m in meshes.items():
    v = (m.vertices - c) * s
    m = trimesh.Trimesh(np.stack([v[:, 1], v[:, 2], v[:, 0]], 1), m.faces, process=True)
    m.fix_normals()
    scene.add_geometry(m, node_name=k, geom_name=k)
    print(k, len(m.faces))
out = os.path.join(os.path.dirname(__file__), '../film/public/brain.glb')
scene.export(out); print('wrote', out, os.path.getsize(out) // 1024, 'KB')

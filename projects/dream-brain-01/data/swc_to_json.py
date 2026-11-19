# A real neuron's shape for the film: NeuroMorpho.Org cnic_001 (Wearne_Hof archive; rhesus prefrontal layer-3
# pyramidal cell, dendrites), CC BY 4.0. Cite: NeuroMorpho.Org (RRID:SCR_002145); Ascoli et al.; original papers
# PMID 12204204, 12902394. Writes film/public/neuron.json: branches as point lists [x,y,z,r], soma at the origin,
# apical dendrite pointing up (+y), scaled so the tree is ~6 units tall.
import json, numpy as np, os
rows = [l.split() for l in open(os.path.join(os.path.dirname(__file__), 'cnic_001.swc')) if l.strip() and not l.startswith('#')]
N = {int(r[0]): (int(r[1]), np.array(list(map(float, r[2:5]))), float(r[5]), int(r[6])) for r in rows}
soma = np.mean([p for t, p, r, par in N.values() if t == 1], axis=0)
kids = {}
for i, (t, p, r, par) in N.items(): kids.setdefault(par, []).append(i)
# principal axis of apical (type 4) points -> +y
apical = np.array([p for t, p, r, par in N.values() if t == 4]) - soma
up = apical.mean(0); up /= np.linalg.norm(up)
def rot_to_y(v):
    y = np.array([0, 1.0, 0]); a = np.cross(v, y); s = np.linalg.norm(a); c = v @ y
    if s < 1e-9: return np.eye(3)
    a /= s; K = np.array([[0, -a[2], a[1]], [a[2], 0, -a[0]], [-a[1], a[0], 0]])
    return np.eye(3) + s * K + (1 - c) * K @ K
R = rot_to_y(up)
pts = {i: R @ (p - soma) for i, (t, p, r, par) in N.items()}
span = max(np.ptp(np.array(list(pts.values())), axis=0))
k = 6.0 / span
branches = []
starts = [i for i, (t, p, r, par) in N.items() if t != 1 and (par == -1 or N[par][0] == 1 or len(kids.get(par, [])) > 1)]
for s0 in starts:
    chain = [N[s0][3]] if N[s0][3] in N and N[N[s0][3]][0] != 1 else []
    i = s0
    while True:
        chain.append(i)
        ks = kids.get(i, [])
        if len(ks) != 1: break
        i = ks[0]
    br = [[round(float(c), 4) for c in (pts[j] * k)] + [round(max(0.012, N[j][2] * k), 4)] for j in chain if j in pts]
    if len(br) >= 2: branches.append(br)
out = os.path.join(os.path.dirname(__file__), '../film/public/neuron.json')
json.dump({'branches': branches, 'soma_r': round(float(np.mean([r for t, p, r, par in N.values() if t == 1]) * k), 4)}, open(out, 'w'))
print(len(branches), 'branches', sum(len(b) for b in branches), 'points; span', round(span, 1), 'um; scale', round(k, 4))

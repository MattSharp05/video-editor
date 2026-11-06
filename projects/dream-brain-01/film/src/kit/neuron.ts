// A real neuron's shape (NeuroMorpho.Org cnic_001, CC BY 4.0; data/swc_to_json.py -> public/neuron.json) turned into
// one merged mesh of tubes, built once. Thicker than life (x `thick`) so the branches read at phone size.
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

type Data = {branches: number[][][]; soma_r: number};
let geo: THREE.BufferGeometry | null = null, pending: Promise<THREE.BufferGeometry> | null = null;
const build = (d: Data, thick: number) => {
  const parts: THREE.BufferGeometry[] = [];
  for (const b of d.branches) {
    const pts = b.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    const r = Math.max(0.025, (b.reduce((a, p) => a + p[3], 0) / b.length) * thick);
    const curve = new THREE.CatmullRomCurve3(pts);
    const len = curve.getLength();
    const g = new THREE.TubeGeometry(curve, Math.max(2, Math.min(40, Math.round(len * 12))), r, 6, false);
    g.deleteAttribute('uv'); parts.push(g);
  }
  return mergeGeometries(parts)!;
};
const load = () => (pending ??= fetch(staticFile('neuron.json')).then((r) => r.json()).then((d: Data) => (geo = build(d, 2.6))));
export const useNeuronGeo = () => {
  const [g, set] = useState<THREE.BufferGeometry | null>(geo);
  useState(() => { if (!geo) { const h = delayRender('neuron.json'); load().then((x) => { set(x); continueRender(h); }); } return 0; });
  return g;
};

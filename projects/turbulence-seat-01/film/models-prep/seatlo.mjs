import {NodeIO} from '@gltf-transform/core'; import {weld, simplify, prune} from '@gltf-transform/functions'; import {MeshoptSimplifier} from 'meshoptimizer';
const io = new NodeIO(); const doc = await io.read(process.argv[2]); await MeshoptSimplifier.ready;
await doc.transform(weld(), simplify({simplifier: MeshoptSimplifier, ratio: 0.12, error: 0.004}), prune());
let t=0; for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) t += p.getIndices().getCount()/3; console.log('tris', t);
for (const m of doc.getRoot().listMeshes()) console.log(' mesh', m.getName());
await io.write(process.argv[3], doc);

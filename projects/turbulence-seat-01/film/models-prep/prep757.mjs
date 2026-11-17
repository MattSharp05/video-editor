// node prep757.mjs IN OUT : drop hidden engine internals + landing gear, weld, simplify, report triangles
import {NodeIO} from '@gltf-transform/core'; import {weld, simplify, prune, dedup} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
const [inp, out] = process.argv.slice(2); const io = new NodeIO(); const doc = await io.read(inp);
const drop = /screws_|pipes_|grid_|Wheels|landing|canister_|mount_/i;
for (const n of doc.getRoot().listNodes()) if (drop.test(n.getName())) n.dispose();
await MeshoptSimplifier.ready;
await doc.transform(prune(), dedup(), weld(), simplify({simplifier: MeshoptSimplifier, ratio: 0.3, error: 0.002}), prune());
let t=0; for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) t += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount())/3;
console.log('triangles', Math.round(t)); await io.write(out, doc);

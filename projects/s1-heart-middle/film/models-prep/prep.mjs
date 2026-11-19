// node prep.mjs IN OUT RATIO : weld, simplify to RATIO of the triangles, prune; report triangles.
// Run in a folder with @gltf-transform/core@4 @gltf-transform/functions@4 @gltf-transform/extensions@4 meshoptimizer draco3dgltf.
import {NodeIO} from '@gltf-transform/core'; import {ALL_EXTENSIONS} from '@gltf-transform/extensions'; import draco3d from 'draco3dgltf';
import {weld, simplify, prune, dedup} from '@gltf-transform/functions'; import {MeshoptSimplifier} from 'meshoptimizer';
const [inp, out, ratio = '1'] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule()});
const doc = await io.read(inp); await MeshoptSimplifier.ready;
const steps = [prune(), dedup(), weld()]; if (+ratio < 1) steps.push(simplify({simplifier: MeshoptSimplifier, ratio: +ratio, error: 0.004}));
await doc.transform(...steps, prune());
let t = 0; for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) t += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3;
console.log(out, 'triangles', Math.round(t)); await io.write(out, doc);

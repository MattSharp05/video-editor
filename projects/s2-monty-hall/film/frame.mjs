// Camera solver: find a camera pose that puts chosen world points at chosen spots on the 9:16 frame.
// Use it to frame a shot (keep the lead in the safe area, keep a caption zone clear) instead of
// guessing camera numbers and re-rendering stills.
// usage (from the film folder, so 'three' resolves):
//   node frame.mjs '{"targets":[{"p":[x,y,z],"s":[u,v]}], "cam":[[x0,x1],[y0,y1],[z0,z1]],
//                    "look":[[x0,x1],[y0,y1],[z0,z1]], "fov":[35,40,45], "steps":12}'
// s = [u, v] in 0..1 of the frame, v from the top (captions sit near v 0.16-0.25; labels near v 0.88).
// "look" may be a fixed point [x,y,z] instead of ranges. Prints {err, fov, cam, look}; err < 0.002 is a
// close fit. Check the result in a still: the solver only knows the points you give it.
import * as THREE from 'three';
const a = JSON.parse(process.argv[2]);
const N = a.steps ?? 12, aspect = a.aspect ?? 9 / 16;
const grid = (r) => (Array.isArray(r[0]) ? r : r.map((x) => [x, x]));
const span = (r) => Array.from({length: r[0] === r[1] ? 1 : N + 1}, (_, i) => r[0] + ((r[1] - r[0]) * i) / N);
const C = grid(a.cam).map(span), L = grid(a.look).map(span);
let best = null;
for (const fov of a.fov ?? [40])
  for (const cx of C[0]) for (const cy of C[1]) for (const cz of C[2])
    for (const lx of L[0]) for (const ly of L[1]) for (const lz of L[2]) {
      const c = new THREE.PerspectiveCamera(fov, aspect, 0.005, 100);
      c.position.set(cx, cy, cz); c.lookAt(lx, ly, lz); c.updateMatrixWorld(); c.updateProjectionMatrix();
      let err = 0;
      for (const t of a.targets) {
        const v = new THREE.Vector3(...t.p).project(c);
        if (v.z > 1) { err = Infinity; break; }
        err += ((v.x + 1) / 2 - t.s[0]) ** 2 + ((1 - v.y) / 2 - t.s[1]) ** 2;
      }
      if (!best || err < best.err) best = {err: +err.toFixed(4), fov, cam: [cx, cy, cz].map((x) => +x.toFixed(3)), look: [lx, ly, lz].map((x) => +x.toFixed(3))};
    }
console.log(JSON.stringify(best));

// Print where Earth, the Sun and the cities land on screen (px in 1080x1920) and whether each city is lit / facing the camera.
import * as THREE from 'three';
import * as TL from '../src/timeline';
import {ll} from '../src/kit/globe';
const W = 1080, H = 1920;
const ts = process.argv.slice(2).map(Number);
for (const t of ts) {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, W / H, 0.05, 20000);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const sp = (v: THREE.Vector3) => { const p = v.clone().project(cam); return `${Math.round((p.x * .5 + .5) * W)},${Math.round((-p.y * .5 + .5) * H)}${p.z > 1 ? '(behind)' : ''}`; };
  const e = TL.earthPos(t), q = TL.earthQ(t), d = cam.position.distanceTo(e);
  const rpx = Math.round((TL.EARTH_R / (2 * d * Math.tan((cam.fov * Math.PI) / 360))) * H);
  const city = (x: {lat: number; lon: number}) => { const n = ll(x, 1).applyQuaternion(q); const lit = n.dot(e.clone().negate().normalize()); const face = n.dot(cam.position.clone().sub(e).normalize()); return `${sp(n.clone().multiplyScalar(TL.EARTH_R).add(e))} sunElev=${Math.round(Math.asin(lit) * 57.3)} face=${face.toFixed(2)}`; };
  console.log(`t=${t} earth ${sp(e)} r=${rpx}px sun ${sp(new THREE.Vector3())} sunR=${Math.round((TL.SUN_R / (2 * cam.position.length() * Math.tan((cam.fov * Math.PI) / 360))) * H)}px | NY ${city(TL.NY)} | SYD ${city(TL.SYD)}`);
}

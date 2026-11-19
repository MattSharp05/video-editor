// Test-render downloaded models in one neutral studio so candidates compare fairly (same light, camera, floor).
// usage: node render_glb.mjs OUT.png MODEL [MODEL ...]   (glb, gltf, obj, fbx; Draco-compressed glb is fine)
// One 3/4 view per model, 640×640, labelled with file name, triangle count and size. Needs three in
// node_modules (set THREE_DIR) and Playwright's Chromium.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright'); // the pre-installed one (NODE_PATH=$(npm root -g))
const args = process.argv.slice(2), times = (args.find((a) => a.startsWith('--t=')) || '--t=0').slice(4).split(',').map(Number);
const [out, ...models] = args.filter((a) => !a.startsWith('--'));  // --t=0,0.5,1 renders an animated model at those seconds
const THREE_DIR = process.env.THREE_DIR || path.resolve('node_modules/three');
const mime = {'.js': 'text/javascript', '.html': 'text/html', '.wasm': 'application/wasm', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.obj': 'text/plain', '.mtl': 'text/plain', '.fbx': 'application/octet-stream'};
const page = `<!doctype html><html><body style="margin:0;background:#100f0e"><canvas id=c width=640 height=640></canvas>
<script type=importmap>{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type=module>
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'; import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js'; import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js'; import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
window.renderModel = async (url, t = 0) => {
  const r = new THREE.WebGLRenderer({canvas: document.getElementById('c'), antialias: true, preserveDrawingBuffer: true});
  r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#100f0e');
  scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.35;
  const ext = url.split('.').pop().toLowerCase(); let obj;
  let clips = [];
  if (ext === 'glb' || ext === 'gltf') { const l = new GLTFLoader(); const d = new DRACOLoader(); d.setDecoderPath('/three/examples/jsm/libs/draco/gltf/'); l.setDRACOLoader(d); const g = await l.loadAsync(url); obj = g.scene; clips = g.animations; }
  else if (ext === 'obj') { let m = null; try { m = await new MTLLoader().loadAsync(url.replace(/\\.obj$/i, '.mtl')); m.preload(); } catch {} const l = new OBJLoader(); if (m) l.setMaterials(m); obj = await l.loadAsync(url); }
  else obj = await new FBXLoader().loadAsync(url);
  if (clips.length) { const mx = new THREE.AnimationMixer(obj); mx.clipAction(clips[0]).play(); mx.setTime(t); }  // pose at time t
  let tris = 0; obj.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
  const box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const s = 1 / Math.max(size.x, size.y, size.z); obj.scale.multiplyScalar(s); obj.position.sub(c.multiplyScalar(s)); obj.position.y += size.y * s / 2;
  scene.add(obj);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(3, 64), new THREE.MeshStandardMaterial({color: '#1c1916', roughness: 0.9}));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const key = new THREE.DirectionalLight('#fff1e0', 2.6); key.position.set(1.5, 2.2, 1.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {left: -1.5, right: 1.5, top: 1.5, bottom: -1.5}); scene.add(key);
  const rim = new THREE.DirectionalLight('#9fb4ff', 1.4); rim.position.set(-1.8, 1.2, -1.6); scene.add(rim);
  scene.add(new THREE.HemisphereLight('#4a3c30', '#0a0908', 0.6));
  // frame the bounding sphere from a 3/4 view, slightly above
  const h = size.y * s, rad = 0.5 * size.length() * s, fov = 32, cam = new THREE.PerspectiveCamera(fov, 1, 0.01, 50);
  const dist = (rad / Math.sin(THREE.MathUtils.degToRad(fov / 2))) * 1.08, dir = new THREE.Vector3(0.62, 0.38, 0.8).normalize();
  cam.position.copy(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, h / 2, 0)); cam.lookAt(0, h / 2, 0);
  r.render(scene, cam); return {tris: Math.round(tris), clips: clips.map((c) => c.name + ' ' + c.duration.toFixed(1) + 's')};
};
window.ready = true;
</script></body></html>`;
const files = {};
const srv = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  let f = u === '/' ? null : u.startsWith('/three/') ? path.join(THREE_DIR, u.slice(7)) : u.startsWith('/m/') ? path.join(files[u.split('/')[2]], ...u.split('/').slice(3)) : null;
  if (u === '/') { s.writeHead(200, {'content-type': 'text/html'}); return s.end(page); }
  if (!f || !fs.existsSync(f)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, {'content-type': mime[path.extname(f).toLowerCase()] || 'application/octet-stream'}); fs.createReadStream(f).pipe(s);
}).listen(0);
const port = srv.address().port;
const b = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
const shots = [];
for (const [i, m] of models.entries()) for (const [j, t] of times.entries()) {
  files[i] = path.dirname(path.resolve(m));
  const p = await b.newPage({viewport: {width: 640, height: 640}});
  p.on('pageerror', (e) => console.error('page error', e.message));
  await p.goto(`http://localhost:${port}/`); await p.waitForFunction('window.ready === true');
  const t0 = Date.now();
  try {
    const info = await p.evaluate(([u, tt]) => window.renderModel(u, tt), [`/m/${i}/${encodeURIComponent(path.basename(m))}`, t]);
    const png = `${out.replace(/\.png$/, '')}_${i}${times.length > 1 ? '_' + j : ''}.png`; await p.locator('#c').screenshot({path: png});
    const mb = (fs.statSync(m).size / 1e6).toFixed(1);
    shots.push({png, label: `${path.basename(m).slice(0, 34)}`, sub: `${(info.tris / 1000).toFixed(0)}k tris · ${mb} MB · t=${t}s`, clips: info.clips});
    console.log('ok', m, info.tris, 'tris', info.clips.length ? 'clips: ' + info.clips.join(', ') : 'static');
  } catch (e) { console.error('fail', m, e.message.slice(0, 200)); }
  await p.close();
}
await b.close(); srv.close();
fs.writeFileSync(out.replace(/\.png$/, '.json'), JSON.stringify(shots, null, 1));

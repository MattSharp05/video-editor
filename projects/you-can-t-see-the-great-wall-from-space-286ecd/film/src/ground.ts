// GROUND world: a real 7.4 km block of the Jinshanling ridges (AWS Terrain Tiles / SRTM, public domain) with the
// wall built along the ridge crest (data/ridge.py -> data/wall_path.json). Units: metres; x east, z south, y up
// (elevation - Y0). Late-afternoon autumn light from the south-west.
import * as THREE from 'three';
import {random} from 'remotion';
import wallPath from '../data/wall_path.json';

export const Y0 = 450;                     // metres subtracted from elevations
export const SIZE = 7420.2;                // block edge, metres (dem.json size_km)
export const N = 512;                      // dem512.bin grid
export const SUN = new THREE.Vector3(-0.55, 0.42, 0.62).normalize();
export const WALL_H = 6.5;                 // walkway above the ground line
export const WALL_W = 6.0;                 // outer width at the top (battered to 7 m at the base)

export const heightAt = (dem: Float32Array) => (x: number, z: number) => {
  const sp = SIZE / N; let c = x / sp + N / 2 - 0.5, r = z / sp + N / 2 - 0.5;
  c = Math.min(N - 1.001, Math.max(0, c)); r = Math.min(N - 1.001, Math.max(0, r));
  const c0 = Math.floor(c), r0 = Math.floor(r), fc = c - c0, fr = r - r0;
  const g = (rr: number, cc: number) => dem[rr * N + cc];
  return (g(r0, c0) * (1 - fc) + g(r0, c0 + 1) * fc) * (1 - fr) + (g(r0 + 1, c0) * (1 - fc) + g(r0 + 1, c0 + 1) * fc) * fr - Y0;
};

// ---------- the wall's centre line, 2 m samples, walkway height smoothed along it
export type WallLine = {pts: THREE.Vector3[]; tan: THREE.Vector3[]; side: THREE.Vector3[]; len: number; at: (s: number) => {p: THREE.Vector3; t: THREE.Vector3; n: THREE.Vector3}};
export const wallLine = (h: (x: number, z: number) => number): WallLine => {
  const raw = (wallPath as {points: number[][]}).points.map(([x, , z]) => new THREE.Vector3(x, 0, z));
  const curve = new THREE.CatmullRomCurve3(raw, false, 'centripetal');
  const len = curve.getLength(), n = Math.round(len / 2);
  const pts = curve.getSpacedPoints(n);
  const g = pts.map((p) => h(p.x, p.z));
  // the walkway follows the ground, smoothed over ~12 m and never sunk more than 2 m below it
  const sm = g.map((_, i) => { let s = 0, w = 0; for (let k = -6; k <= 6; k++) { const j = Math.min(n, Math.max(0, i + k)); const ww = 1 - Math.abs(k) / 7; s += g[j] * ww; w += ww; } return s / w; });
  pts.forEach((p, i) => { p.y = Math.max(sm[i], g[i] - 2) + WALL_H; });
  const tan = pts.map((p, i) => pts[Math.min(n, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).setY(0).normalize());
  const side = tan.map((t) => new THREE.Vector3(-t.z, 0, t.x));
  const at = (s: number) => {
    const f = Math.min(n, Math.max(0, s * n)), i = Math.min(n - 1, Math.floor(f)), k = f - i;
    return {p: pts[i].clone().lerp(pts[i + 1], k), t: tan[i].clone().lerp(tan[i + 1], k).normalize(), n: side[i].clone().lerp(side[i + 1], k).normalize()};
  };
  return {pts, tan, side, len, at};
};

// ---------- brick texture (canvas, seeded)
const brickTexture = () => {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d')!;
  g.fillStyle = '#A29684'; g.fillRect(0, 0, 1024, 1024);
  const rows = 40, bw = 64;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * bw / 2;
    for (let x = -bw; x < 1024 + bw; x += bw) {
      const v = random(`b${r}_${x}`), tone = 112 + v * 40 - (random(`d${r}_${x}`) < 0.12 ? 30 : 0);
      g.fillStyle = `rgb(${tone + 10},${tone + 2},${tone - 14})`;
      g.fillRect(x + off + 2, r * (1024 / rows) + 2, bw - 4, 1024 / rows - 4);
    }
  }
  // grime streaks from the top
  for (let i = 0; i < 70; i++) {
    const x = random(`s${i}`) * 1024, w = 4 + random(`w${i}`) * 20, l = 200 + random(`l${i}`) * 700;
    const gr = g.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, 'rgba(40,34,26,0.16)'); gr.addColorStop(1, 'rgba(40,34,26,0)');
    g.fillStyle = gr; g.fillRect(x, 0, w, l);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};

export const wallMaterial = () => new THREE.MeshStandardMaterial({map: brickTexture(), roughness: 0.92, metalness: 0, emissive: new THREE.Color('#FFB347'), emissiveIntensity: 0});

// sweep a cross-section (x across, y up, relative to the walkway centre) along the line, flat-shaded edges
const sweep = (L: WallLine, prof: [number, number][], from = 0, to = L.pts.length - 1, ground?: (x: number, z: number) => number) => {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  let vi = 0;
  for (let e = 0; e < prof.length - 1; e++) {
    const a = prof[e], b = prof[e + 1]; const el = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let dist = 0;
    for (let i = from; i <= to; i++) {
      if (i > from) dist += L.pts[i].distanceTo(L.pts[i - 1]);
      const P = L.pts[i], S = L.side[i];
      for (const [k, q] of [[0, a], [1, b]] as const) {
        let y = P.y + q[1];
        if (q[1] < -1 && ground) y = Math.min(y, ground(P.x + S.x * q[0], P.z + S.z * q[0]) - 1.5);
        pos.push(P.x + S.x * q[0], y, P.z + S.z * q[0]); uv.push(dist / 6, (k * el) / 6 + e * 0.37);
      }
      if (i > from) { const o = vi - 2; idx.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); }
      vi += 2;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  g.computeVertexNormals(); return g;
};

// a box whose UVs are in metres / 6 (the brick texture's tile), so bricks keep their size on any face
const boxUV = (w: number, h: number, d: number) => {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv as THREE.BufferAttribute;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / 6, uv.getY(i) * dims[f][1] / 6); }
  return g;
};

export const buildWall = (L: WallLine, h: (x: number, z: number) => number, mat: THREE.Material) => {
  const grp = new THREE.Group();
  const hw = WALL_W / 2, pw = 0.55, ph = 1.15;
  // body: battered faces down into the ground, parapets both sides, walkway between
  const prof: [number, number][] = [[-hw - 0.6, -40], [-hw, 0], [-hw, ph], [-hw + pw, ph], [-hw + pw, 0.02], [hw - pw, 0.02], [hw - pw, ph], [hw, ph], [hw, 0], [hw + 0.6, -40]];
  const body = new THREE.Mesh(sweep(L, prof, 0, L.pts.length - 1, h), mat); body.castShadow = body.receiveShadow = true; grp.add(body);
  // walkway paving: lighter
  const walk = new THREE.Mesh(sweep(L, [[hw - pw, 0.03], [-hw + pw, 0.03]]), new THREE.MeshStandardMaterial({color: '#8C8272', roughness: 0.95}));
  walk.receiveShadow = true; grp.add(walk);
  // merlons on the outer (north, -side) parapet every 2.3 m
  const step = 2.3, count = Math.floor(L.len / step);
  const mer = new THREE.InstancedMesh(new THREE.BoxGeometry(1.35, 0.75, pw), mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < count; i++) {
    const s = (i * step) / L.len, a = L.at(s);
    const p = a.p.clone().addScaledVector(a.n, -hw + pw / 2); p.y += ph + 0.37;
    q.setFromAxisAngle(up, Math.atan2(-a.t.z, a.t.x)); m.compose(p, q, new THREE.Vector3(1, 1, 1)); mer.setMatrixAt(i, m);
  }
  mer.castShadow = mer.receiveShadow = true; grp.add(mer);
  // watchtowers every ~420 m
  const towers: number[] = [];
  for (let d = 180; d < L.len - 60; d += 420) towers.push(d / L.len);
  towers.forEach((s) => {
    const a = L.at(s); const base = h(a.p.x, a.p.z) - 4, top = a.p.y + 6.5;
    const tw = new THREE.Group(); tw.position.set(a.p.x, 0, a.p.z); tw.rotation.y = Math.atan2(-a.t.z, a.t.x);
    const box = (w: number, y0: number, y1: number, d: number) => { const b = new THREE.Mesh(boxUV(w, y1 - y0, d), mat); b.position.y = (y0 + y1) / 2; b.castShadow = b.receiveShadow = true; tw.add(b); };
    box(11, base, top, 10); box(11.6, top, top + 0.35, 10.6);
    for (let i = 0; i < 5; i++) for (const zz of [-5.05, 5.05]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.5), mat); b.position.set(-4.6 + i * 2.3, top + 0.8, zz); b.castShadow = true; tw.add(b); }
    for (let i = 0; i < 4; i++) for (const xx of [-5.55, 5.55]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 1.4), mat); b.position.set(xx, top + 0.8, -3.45 + i * 2.3); b.castShadow = true; tw.add(b); }
    // dark arched windows (flat inset panels) on both long faces
    for (let i = 0; i < 3; i++) for (const zz of [-5.02, 5.02]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.8), new THREE.MeshBasicMaterial({color: '#17120d'}));
      w.position.set(-3 + i * 3, top - 3.2, zz); w.rotation.y = zz > 0 ? 0 : Math.PI; tw.add(w);
    }
    grp.add(tw);
  });
  return {grp, towers};
};

// ---------- terrain: core block (14.5 m grid) + a mirrored skirt three times the size, slightly sunk, for the horizon
export const buildTerrain = (dem: Float32Array, tex: THREE.Texture) => {
  const grp = new THREE.Group();
  const h = heightAt(dem);
  const mk = (size: number, segs: number, sink: (x: number, z: number) => number, uvScale: number) => {
    const g = new THREE.PlaneGeometry(size, size, segs, segs); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      // mirror into the block for the skirt
      const mir = (v: number) => { const hs = SIZE / 2; let u = ((v + hs) % (2 * SIZE) + 2 * SIZE) % (2 * SIZE); if (u > SIZE) u = 2 * SIZE - u; return u - hs; };
      p.setY(i, h(mir(x), mir(z)) - sink(x, z));
      uv.setXY(i, (x / SIZE + 0.5), 1 - (z / SIZE + 0.5));
    }
    g.computeVertexNormals(); void uvScale; return g;
  };
  const mat = new THREE.MeshStandardMaterial({map: tex, roughness: 1, metalness: 0});
  const core = new THREE.Mesh(mk(SIZE, N - 1, () => 0, 1), mat); core.receiveShadow = true; grp.add(core);
  const skirtTex = tex.clone(); skirtTex.wrapS = skirtTex.wrapT = THREE.MirroredRepeatWrapping; skirtTex.needsUpdate = true;
  const sm = new THREE.MeshStandardMaterial({map: skirtTex, roughness: 1});
  const sink = (x: number, z: number) => { const d = Math.max(Math.abs(x), Math.abs(z)) - SIZE / 2; return d < 0 ? 25 : 25 * Math.max(0, 1 - d / 400); };
  const skirt = new THREE.Mesh(mk(SIZE * 5, 300, sink, 5), sm); grp.add(skirt);
  return {grp, h};
};

// ---------- scrub: low bushes scattered over the slopes near the wall (dense near, sparse far)
export const buildScrub = (L: WallLine, h: (x: number, z: number) => number) => {
  const n = 26000;
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const mat = new THREE.MeshStandardMaterial({roughness: 1, flatShading: true});
  const im = new THREE.InstancedMesh(geo, mat, n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  const tones = ['#4E4A2A', '#5C3A22', '#6B5A35', '#3F3F24', '#7A4A2A'];
  let k = 0;
  for (let i = 0; i < n * 3 && k < n; i++) {
    const s = random(`ss${i}`), a = L.at(s);
    const d = (random(`sd${i}`) < 0.7 ? 8 + Math.pow(random(`sr${i}`), 1.6) * 260 : 8 + random(`sq${i}`) * 900) * (random(`sg${i}`) < 0.5 ? -1 : 1);
    const along = (random(`sa${i}`) - 0.5) * 6;
    const x = a.p.x + a.n.x * d + a.t.x * along, z = a.p.z + a.n.z * d + a.t.z * along;
    if (Math.abs(x) > SIZE / 2 - 20 || Math.abs(z) > SIZE / 2 - 20) continue;
    const sc = (0.5 + random(`sz${i}`) * 1.3) * Math.min(1, 0.45 + Math.abs(d) / 120);
    q.setFromEuler(new THREE.Euler(0, random(`sy${i}`) * 6.28, 0));
    m.compose(new THREE.Vector3(x, h(x, z) + sc * 0.35, z), q, new THREE.Vector3(sc * 1.2, sc * 0.75, sc * 1.1));
    im.setMatrixAt(k, m); im.setColorAt(k, c.set(tones[Math.floor(random(`st${i}`) * tones.length)]).multiplyScalar(0.8 + random(`sv${i}`) * 0.4)); k++;
  }
  im.count = k; im.castShadow = true; im.receiveShadow = true;
  return im;
};

// ---------- a small car (the road-width yardstick): 4.4 x 1.8 m
export const buildCar = () => {
  const g = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({color: '#D8DCE2', roughness: 0.35, metalness: 0.4});
  const glass = new THREE.MeshStandardMaterial({color: '#1d2630', roughness: 0.1, metalness: 0.6});
  const tyre = new THREE.MeshStandardMaterial({color: '#151515', roughness: 0.9});
  const b = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.75, 1.8), paint); b.position.y = 0.65; g.add(b);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.6, 1.6), glass); cab.position.set(-0.2, 1.3, 0); g.add(cab);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 1.55), paint); roof.position.set(-0.25, 1.62, 0); g.add(roof);
  for (const [x, z] of [[1.4, 0.8], [1.4, -0.8], [-1.4, 0.8], [-1.4, -0.8]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 20), tyre); w.rotation.x = Math.PI / 2; w.position.set(x, 0.34, z); g.add(w);
  }
  const lamp = new THREE.MeshBasicMaterial({color: '#FFF2D0'});
  for (const z of [0.6, -0.6]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.3), lamp); l.position.set(2.21, 0.75, z); g.add(l); }
  g.traverse((o) => { (o as THREE.Mesh).castShadow = true; });
  return g;
};

// ---------- sky dome: blue overhead, warm haze at the horizon, brighter toward the sun
export const skyDome = (horizon: THREE.Color, zenith: THREE.Color) => new THREE.Mesh(new THREE.SphereGeometry(60000, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: {uH: {value: horizon}, uZ: {value: zenith}, uS: {value: SUN}},
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 uH, uZ, uS; varying vec3 vD;
    void main(){ float y = max(vD.y, 0.0); vec3 c = mix(uH, uZ, pow(y, 0.55));
      float s = max(dot(normalize(vD), uS), 0.0); c += vec3(1.0, 0.8, 0.55) * (pow(s, 8.0) * 0.35 + pow(s, 400.0) * 2.0);
      gl_FragColor = vec4(c, 1.0); }`,
}));

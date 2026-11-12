// HeroModel: put a generated .glb (Meshy, Tripo, Hunyuan, the placeholder) into a three.js scene so it takes the
// scene's light. Copy into the film's src/kit/. Needs three's GLTFLoader (three/examples/jsm, already in `three`).
//
//   // top of the composition, OUTSIDE the canvas (three.md: preload everything, mount the canvas when ready)
//   const sphere = useGlb('hero/vegas-sphere-1/tripo-v2.5.glb');
//   ...{sphere && <ThreeCanvas>...}
//   // inside the scene
//   <HeroModel gltf={sphere} size={112} axis="height" origin="base" light="neutralise" envMap={env} envIntensity={0.6} />
//
// What fit() does, in order (each step is a bug generated models arrive with):
//   1. up axis: rotate Z-up exports to three's Y-up (`up: 'z'`), then `yaw` to face the camera.
//   2. scale: the generator's units are arbitrary (cm, unit cube, 1.9 "metres"): scale so `axis` measures `size`
//      scene units (1 = 1 m in our films), measured on the real vertices, not the node bounding boxes.
//   3. origin: `base` puts the bottom centre at (0,0,0) so `position` seats it on the ground; `center` for objects
//      that float or spin.
//   4. materials: unlit (KHR_materials_unlit -> MeshBasicMaterial) becomes MeshStandardMaterial so scene light reaches
//      it; glTF's default metallicFactor 1 without a metalness map becomes 0 (otherwise a black mirror under our
//      hemisphere light); roughness clamped to [roughMin, 1] (near-0 roughness maps mirror the sky dome); the scene's
//      environment assigned explicitly so envMapIntensity works (three.md, r186); vertex colours kept only if asked.
//   5. baked light: `neutralise` divides each base-colour texture by its own blurred luminance (shading and highlights
//      the generator painted in), keeping colour and fine detail; `keep` leaves it; `replace` swaps in `material`
//      (your three.js version's material on the generated shape).
//   6. shadows on; frustum culling off only if the model is the whole frame (`noCull`).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {GLTFLoader, type GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {continueRender, delayRender, staticFile} from 'remotion';

// ---------- load once, outside the canvas ----------
const cache: Record<string, GLTF> = {};
const pending: Record<string, Promise<GLTF>> = {};
export const loadGlb = (file: string) =>
  (pending[file] ??= new Promise<GLTF>((ok, bad) => new GLTFLoader().load(staticFile(file), (g) => { cache[file] = g; ok(g); }, undefined, bad)));

export const useGlb = (file: string | null): GLTF | null => {
  const [, set] = React.useState(0);
  React.useEffect(() => {
    if (!file || cache[file]) return;
    const h = delayRender('glb ' + file);
    loadGlb(file).then(() => { set(1); continueRender(h); }, (e) => { console.error(e); continueRender(h); throw e; });
  }, [file]);
  return file ? cache[file] || null : null;
};

// ---------- baked-light neutraliser (CPU, once per texture) ----------
const delitCache = new WeakMap<THREE.Texture, THREE.Texture>();
const boxBlur = (src: Float32Array, w: number, h: number, r: number) => {
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) { let acc = 0; for (let x = -r; x <= r; x++) acc += src[y * w + ((x + w) % w)];  // wraps in u (seams)
    for (let x = 0; x < w; x++) { tmp[y * w + x] = acc / (2 * r + 1); acc += src[y * w + ((x + r + 1) % w)] - src[y * w + ((x - r + w) % w)]; } }
  for (let x = 0; x < w; x++) { let acc = 0; const at = (y: number) => tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = -r; y <= r; y++) acc += at(y);
    for (let y = 0; y < h; y++) { out[y * w + x] = acc / (2 * r + 1); acc += at(y + r + 1) - at(y - r); } }
  return out;
};
export const neutraliseTexture = (tex: THREE.Texture, strength = 0.85, maxSize = 1024): THREE.Texture => {
  const done = delitCache.get(tex); if (done) return done;
  const img = tex.image as CanvasImageSource & {width: number; height: number};
  if (!img || !img.width) return tex;
  const k = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * k)), h = Math.max(1, Math.round(img.height * k));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', {willReadFrequently: true})!; x.drawImage(img, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h), p = d.data, L = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) L[i] = (0.2126 * p[i * 4] + 0.7152 * p[i * 4 + 1] + 0.0722 * p[i * 4 + 2]) / 255 + 1e-3;
  // shading is low-frequency: three box passes ~ a gaussian about 1/12 of the texture wide
  const r = Math.max(2, Math.round(Math.min(w, h) / 24));
  const B = boxBlur(boxBlur(boxBlur(L, w, h, r), w, h, r), w, h, r);
  let mean = 0; for (let i = 0; i < w * h; i++) mean += B[i]; mean /= w * h;
  // highlights: clamp luminance above the 98th percentile of the corrected image
  for (let i = 0; i < w * h; i++) {
    const g = Math.pow(mean / B[i], strength);
    for (let ch = 0; ch < 3; ch++) p[i * 4 + ch] = Math.min(255, p[i * 4 + ch] * g);
  }
  const lum = new Float32Array(w * h); for (let i = 0; i < w * h; i++) lum[i] = 0.2126 * p[i * 4] + 0.7152 * p[i * 4 + 1] + 0.0722 * p[i * 4 + 2];
  const top = Float32Array.from(lum).sort()[Math.floor(w * h * 0.98)] || 255;
  for (let i = 0; i < w * h; i++) if (lum[i] > top) { const s = top / lum[i]; for (let ch = 0; ch < 3; ch++) p[i * 4 + ch] *= s; }
  x.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.flipY = tex.flipY; t.wrapS = tex.wrapS; t.wrapT = tex.wrapT;
  t.anisotropy = 4; t.channel = tex.channel; t.needsUpdate = true;
  delitCache.set(tex, t);
  return t;
};

// ---------- fit ----------
export type FitOpts = {
  size: number;                                   // scene units the measured axis should span
  axis?: 'height' | 'width' | 'depth' | 'max';
  origin?: 'base' | 'center';
  up?: 'y' | 'z';
  yaw?: number;                                   // radians, after the up fix
  light?: 'keep' | 'neutralise' | 'replace';
  strength?: number;                              // neutralise strength 0..1 (0.85: removes most painted shading)
  material?: THREE.Material | ((mesh: THREE.Mesh, old: THREE.Material) => THREE.Material);
  envMap?: THREE.Texture | null;                  // the scene's PMREM environment (look pass: hero objects only)
  envIntensity?: number;
  roughMin?: number;                              // clamp: generated roughness near 0 mirrors the sky
  metalness?: number | 'keep';                    // 'keep' (default) still fixes the glTF default-1-without-map case
  vertexColors?: boolean;
  shadows?: boolean;
  noCull?: boolean;
};

const toStandard = (m: THREE.Material): THREE.MeshStandardMaterial => {
  if (m instanceof THREE.MeshStandardMaterial) return m.clone();
  const b = m as THREE.MeshBasicMaterial;
  return new THREE.MeshStandardMaterial({map: b.map ?? null, color: b.color?.clone() ?? new THREE.Color(1, 1, 1),
    transparent: b.transparent, opacity: b.opacity, alphaTest: b.alphaTest, side: b.side, roughness: 0.8, metalness: 0});
};

export const fit = (gltf: GLTF, o: FitOpts): {object: THREE.Group; size: THREE.Vector3; report: string[]} => {
  const report: string[] = [];
  const inner = gltf.scene.clone(true);
  const pivot = new THREE.Group(); pivot.add(inner);
  if (o.up === 'z') inner.rotation.x = -Math.PI / 2;
  pivot.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(inner, true);           // precise: real vertices
  const s0 = box.getSize(new THREE.Vector3());
  const span = o.axis === 'width' ? s0.x : o.axis === 'depth' ? s0.z : o.axis === 'max' ? Math.max(s0.x, s0.y, s0.z) : s0.y;
  const k = o.size / (span || 1);
  report.push(`source ${s0.x.toFixed(3)} x ${s0.y.toFixed(3)} x ${s0.z.toFixed(3)} -> scale ${k.toPrecision(4)}`);
  const c = box.getCenter(new THREE.Vector3());
  const anchor = new THREE.Vector3(c.x, o.origin === 'center' ? c.y : box.min.y, c.z);
  report.push(`origin offset (${anchor.x.toFixed(3)}, ${anchor.y.toFixed(3)}, ${anchor.z.toFixed(3)})`);
  inner.position.sub(anchor);                                        // in pivot space, before scaling
  const object = new THREE.Group(); object.add(pivot); pivot.scale.setScalar(k);
  if (o.yaw) object.rotation.y = o.yaw;                               // after measuring, so the anchor stays exact
  const light = o.light ?? 'neutralise', roughMin = o.roughMin ?? 0.35;
  let nMesh = 0, nTris = 0;
  inner.traverse((n) => {
    const mesh = n as THREE.Mesh; if (!mesh.isMesh) return;
    nMesh++; nTris += (mesh.geometry.index ? mesh.geometry.index.count : mesh.geometry.attributes.position.count) / 3;
    if (!mesh.geometry.attributes.normal) { mesh.geometry.computeVertexNormals(); report.push(`${mesh.name}: normals computed`); }
    mesh.castShadow = mesh.receiveShadow = o.shadows ?? true;
    if (o.noCull) mesh.frustumCulled = false;
    const fix = (old: THREE.Material): THREE.Material => {
      if (light === 'replace' && o.material) return typeof o.material === 'function' ? o.material(mesh, old) : o.material;
      const m = toStandard(old);
      if (!(old instanceof THREE.MeshStandardMaterial)) report.push(`${old.name || mesh.name}: unlit -> standard`);
      if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
      if (light === 'neutralise' && m.map) { m.map = neutraliseTexture(m.map, o.strength ?? 0.85); report.push(`${old.name || mesh.name}: baked light neutralised`); }
      if (o.metalness !== undefined && o.metalness !== 'keep') m.metalness = o.metalness;
      else if (!m.metalnessMap && m.metalness > 0.99) { m.metalness = 0; report.push(`${old.name || mesh.name}: default metallic 1 -> 0`); }
      if (!m.roughnessMap) m.roughness = Math.max(roughMin, m.roughness);
      else m.roughness = Math.max(m.roughness, 1);                   // the map carries it; factor multiplies
      if (o.envMap) { m.envMap = o.envMap; m.envMapIntensity = o.envIntensity ?? 0.6; }
      m.vertexColors = !!o.vertexColors && !!mesh.geometry.attributes.color;
      m.needsUpdate = true;
      return m;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(fix) : fix(mesh.material);
  });
  report.push(`${nMesh} meshes, ${Math.round(nTris)} triangles`);
  if (nTris > 300000) report.push('WARNING: over 300k triangles; decimate before the film (software rendering)');
  const size = s0.multiplyScalar(k);
  return {object, size, report};
};

export const HeroModel: React.FC<FitOpts & {gltf: GLTF; position?: [number, number, number]; rotation?: [number, number, number];
  scale?: number; onFit?: (r: {size: THREE.Vector3; report: string[]}) => void}> = ({gltf, position, rotation, scale, onFit, ...o}) => {
  const r = useMemo(() => fit(gltf, o),
    // refit only when the model or a fit option changes, never per frame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gltf, o.size, o.axis, o.origin, o.up, o.yaw, o.light, o.strength, o.material, o.envMap, o.envIntensity, o.roughMin, o.metalness, o.vertexColors, o.shadows]);
  React.useEffect(() => { onFit?.(r); }, [r]);
  return <primitive object={r.object} position={position} rotation={rotation} scale={scale ?? 1} />;
};

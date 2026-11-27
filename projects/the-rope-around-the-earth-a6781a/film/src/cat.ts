// The cat: "Bicolor Cat" by kenchoo (Sketchfab, CC BY 4.0, https://sketchfab.com/3d-models/bicolor-cat-e623a618ca344a8393d7ba4d63ec23cf),
// rigged with one 8.7 s clip. Loaded once outside the canvas (useCat), scaled to a real cat (about 26 cm to the top of
// the head standing), its clip sampled by time so every frame renders alone. Crouching under the rope is a squash of
// the whole body toward the ground (legs bend; ears stay under the rope at 16 cm).
import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

export type CatAsset = {root: THREE.Group; inner: THREE.Object3D; mixer: THREE.AnimationMixer; clip: THREE.AnimationClip | null; height: number};
export const CAT_H = 0.26;
export const CAT_YAW = -Math.PI / 2;     // model faces +z; walking toward -x

export const useCat = (): CatAsset | null => {
  const [cat, setCat] = useState<CatAsset | null>(null);
  const [handle] = useState(() => delayRender('cat model'));
  useEffect(() => {
    new GLTFLoader().load(staticFile('models/cat.glb'), (g) => {
      const inner = g.scene; const root = new THREE.Group(); root.add(inner);
      const mixer = new THREE.AnimationMixer(inner); const clip = g.animations[0] ?? null;
      if (clip) { mixer.clipAction(clip).play(); mixer.setTime(0); }
      inner.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(inner, true); const s = CAT_H / Math.max(box.max.y - box.min.y, 1e-6);
      inner.scale.setScalar(s); inner.position.y = -box.min.y * s;
      inner.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined; if (m && 'metalness' in m) { m.metalness = 0; m.roughness = Math.max(m.roughness, 0.75); } });
      setCat({root, inner, mixer, clip, height: CAT_H});
      continueRender(handle);
    }, undefined, (e) => { console.error(e); continueRender(handle); });
  }, [handle]);
  return cat;
};

export const poseCat = (cat: CatAsset, t: number, x: number, z: number, crouch: number) => {
  if (cat.clip) cat.mixer.setTime(((t * 1.0) % cat.clip.duration + cat.clip.duration) % cat.clip.duration);
  cat.root.position.set(x, 0, z); cat.root.rotation.set(0, CAT_YAW, 0);
  cat.root.scale.set(1, 1 - 0.5 * crouch, 1 + 0.08 * crouch);
};

// Load every model once, before the canvas mounts (three.md: preload at the top, mount when all are ready).
// Each sourced model is normalised to metres, ground at y = 0, nose toward +z (cars) or facing +z (people).
// Sources and licences: ../../brief.md "Assets". Model files are git-ignored; fetch.sh re-downloads them.
import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader, type GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';

export type Assets = {robotaxi: THREE.Group; tesla: THREE.Group; walker: GLTF; cyclist: THREE.Group; props: THREE.Group; downtown: THREE.Group};

// Fit an object: rotate so its longest horizontal axis runs along z, scale it so that axis (or height) = size m.
export const fit = (o: THREE.Object3D, size: number, by: 'length' | 'height' = 'length', yaw = 0) => {
  const g = new THREE.Group(); g.add(o); o.updateMatrixWorld(true);
  let b = new THREE.Box3().setFromObject(o); const s = b.getSize(new THREE.Vector3());
  if (s.x > s.z) o.rotation.y = Math.PI / 2;
  o.rotation.y += yaw; o.updateMatrixWorld(true);
  b = new THREE.Box3().setFromObject(o); const s2 = b.getSize(new THREE.Vector3());
  const k = size / (by === 'length' ? s2.z : s2.y); o.scale.multiplyScalar(k); o.updateMatrixWorld(true);
  b = new THREE.Box3().setFromObject(o); const c = b.getCenter(new THREE.Vector3());
  o.position.x -= c.x; o.position.z -= c.z; o.position.y -= b.min.y;
  return g;
};

let cache: Assets | null = null;
export const useAssets = () => {
  const [a, setA] = useState<Assets | null>(cache);
  const [h] = useState(() => (cache ? 0 : delayRender('models')));
  useEffect(() => {
    if (cache) return;
    const l = new GLTFLoader();
    const get = (n: string) => l.loadAsync(staticFile(`models/${n}.glb`));
    Promise.all(['robotaxi', 'tesla', 'walker', 'cyclist', 'props', 'downtown'].map(get)).then(([r, t, w, c, p, d]) => {
      cache = {robotaxi: r.scene as unknown as THREE.Group, tesla: t.scene as unknown as THREE.Group, walker: w, cyclist: c.scene as unknown as THREE.Group,
        props: p.scene as unknown as THREE.Group, downtown: d.scene as unknown as THREE.Group};
      setA(cache); continueRender(h);
    });
  }, [h]);
  return a;
};

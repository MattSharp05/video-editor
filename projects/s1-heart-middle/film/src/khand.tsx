// A hand built on the kit's rigged WebXR hand (kit/hand.tsx: same chained finger kinematics), placed by its WRIST
// and orientation instead of the pinch point, with an optional forearm in any direction (the kit's sleeve always
// continues straight from the hand, which can't show a bent wrist: CPR needs the palm flat and the arm vertical).
// Model frame: fingers along -Y, back of the hand +X (left hand mirrored: back -X). Negative bend curls to the palm.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as skClone} from 'three/examples/jsm/utils/SkeletonUtils.js';

const CHAINS = {
  thumb: ['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip'],
  index: ['index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip'],
  middle: ['middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip'],
  ring: ['ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip'],
  pinky: ['pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip'],
} as const;
export type Finger = keyof typeof CHAINS;
export type Pose = Partial<Record<Finger, {bend: number[]; side?: number}>>;
export const KNUCKLES = ['index-finger-phalanx-proximal', 'middle-finger-phalanx-proximal', 'ring-finger-phalanx-proximal', 'pinky-finger-phalanx-proximal'];
export const mixPose = (a: Pose, b: Pose, k: number): Pose => {
  const out: Pose = {};
  (Object.keys(CHAINS) as Finger[]).forEach((f) => {
    const A = a[f]?.bend ?? [0, 0, 0, 0], Bb = b[f]?.bend ?? [0, 0, 0, 0];
    out[f] = {bend: A.map((v, i) => v + ((Bb[i] ?? 0) - v) * k), side: (a[f]?.side ?? 0) + ((b[f]?.side ?? 0) - (a[f]?.side ?? 0)) * k};
  });
  return out;
};
export const OPEN: Pose = {index: {bend: [0, -0.15, -0.15, -0.08]}, middle: {bend: [0, -0.18, -0.18, -0.08]}, ring: {bend: [0, -0.22, -0.2, -0.1]}, pinky: {bend: [0, -0.28, -0.22, -0.1]}, thumb: {bend: [-0.1, -0.15, -0.1]}};
export const FIST: Pose = {index: {bend: [0, -1.45, -1.6, -0.9]}, middle: {bend: [0, -1.5, -1.6, -0.9]}, ring: {bend: [0, -1.5, -1.6, -0.9]}, pinky: {bend: [0, -1.5, -1.55, -0.9]}, thumb: {bend: [-0.45, -0.6, -0.5], side: 0.5}};

export const skinMat = () => new THREE.MeshPhysicalMaterial({
  color: '#9b7b6a', roughness: 0.6, sheen: 0.45, sheenRoughness: 0.6, sheenColor: new THREE.Color('#e8bfae'), clearcoat: 0.05, specularIntensity: 0.4,
});
const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0);

// orientation from finger direction f and back-of-hand direction b
export const handQuat = (model: 'right' | 'left', f: number[], b: number[]) => {
  const F = new THREE.Vector3(...(f as [number, number, number])).normalize();
  const Bv = new THREE.Vector3(...(b as [number, number, number])); Bv.sub(F.clone().multiplyScalar(Bv.dot(F))).normalize();
  const Xm = model === 'left' ? Bv.clone().negate() : Bv;
  const Yv = F.clone().negate(), Z = new THREE.Vector3().crossVectors(Xm, Yv);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xm, Yv, Z));
};
// the wrist in model coordinates (where the kit's sleeve starts)
export const WRIST_LOCAL = new THREE.Vector3(0.035, 0.06, 0);

export type KHandSpec = {model: 'right' | 'left'; wrist: number[]; f: number[]; b: number[]; pose: Pose; arm?: number[]; armLen?: number; sleeve?: string; glow?: (name: string) => void};

// Build once per instance; call pose(spec) every frame; returns the object and a bone-position lookup (world, assuming
// the object sits directly under the scene root).
export const useKHand = (g: GLTF, sleeve = '#22262c') => useMemo(() => {
  const o = skClone(g.scene); const mat = skinMat();
  o.traverse((c) => { const m = c as THREE.SkinnedMesh; if (m.isSkinnedMesh) { m.material = mat; m.frustumCulled = false; } });
  const rest = new Map<string, {p: THREE.Vector3; q: THREE.Quaternion}>();
  o.traverse((c) => rest.set(c.name, {p: c.position.clone(), q: c.quaternion.clone()}));
  const cloth = new THREE.MeshPhysicalMaterial({color: sleeve, roughness: 0.85, sheen: 1, sheenColor: new THREE.Color('#5a6370'), sheenRoughness: 0.5});
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.046, 1, 28, 1, false).translate(0, 0.5, 0), cloth);
  const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.007, 10, 36).rotateX(Math.PI / 2), cloth);
  const root = new THREE.Group(); root.add(o, arm, cuff);
  const pose = (s: KHandSpec) => {
    for (const fn of Object.keys(CHAINS) as Finger[]) {
      const names = CHAINS[fn], cfg = s.pose[fn];
      let D = new THREE.Quaternion();
      let prevRest = rest.get(names[0])!.p, prevNew = prevRest.clone();
      names.forEach((n, i) => {
        const b = o.getObjectByName(n)!, r = rest.get(n)!;
        const pos = i === 0 ? r.p.clone() : prevNew.clone().add(r.p.clone().sub(prevRest).applyQuaternion(D));
        let local = new THREE.Quaternion().setFromAxisAngle(X, cfg?.bend[i] ?? 0);
        if (cfg?.side && i === 1) local = new THREE.Quaternion().setFromAxisAngle(Y, cfg.side).multiply(local);
        const delta = r.q.clone().multiply(local).multiply(r.q.clone().invert());
        b.position.copy(pos); b.quaternion.copy(D.clone().multiply(delta).multiply(r.q));
        D = D.clone().multiply(delta); prevRest = r.p; prevNew = pos;
      });
    }
    const q = handQuat(s.model, s.f, s.b);
    const w = new THREE.Vector3(...(s.wrist as [number, number, number]));
    o.quaternion.copy(q); o.position.copy(w.clone().sub(WRIST_LOCAL.clone().applyQuaternion(q)));
    // forearm from the wrist along `arm` (default: straight on from the hand)
    const dir = s.arm ? new THREE.Vector3(...(s.arm as [number, number, number])).normalize() : new THREE.Vector3(...(s.f as [number, number, number])).normalize().negate();
    arm.position.copy(w.clone().addScaledVector(dir, 0.015)); arm.quaternion.setFromUnitVectors(Y, dir); arm.scale.set(1, s.armLen ?? 0.8, 1);
    cuff.position.copy(w.clone().addScaledVector(dir, 0.015)); cuff.quaternion.setFromUnitVectors(Y, dir);
    root.updateMatrixWorld(true);
  };
  const bone = (n: string) => o.getObjectByName(n)!.getWorldPosition(new THREE.Vector3());
  return {root, pose, bone};
}, [g, sleeve]);

export const KHand: React.FC<{g: GLTF; s: KHandSpec; visible?: boolean}> = ({g, s, visible = true}) => {
  const h = useKHand(g, s.sleeve);
  h.pose(s); h.root.visible = visible;
  return <primitive object={h.root} />;
};

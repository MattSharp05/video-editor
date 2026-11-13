// Open-source hand (WebXR Input Profiles "generic-hand", MIT, Copyright 2019 Amazon).
// Its 25 joint bones are all siblings (a headset sets every joint directly), so bending one knuckle
// does not carry the rest of the finger. We do the forward kinematics ourselves: each joint bends
// about its own local X axis (WebXR: -Z runs along the bone, +Y out of the back of the hand), and
// every joint further down the chain follows.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as skClone} from 'three/examples/jsm/utils/SkeletonUtils.js';

const CHAINS = {
  thumb: ['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip'],
  index: ['index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip'],
  middle: ['middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip'],
  ring: ['ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip'],
  pinky: ['pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip'],
} as const;
type Finger = keyof typeof CHAINS;

// Per finger: bend (radians) at each joint in chain order (the tip takes none). `side`: rotation
// about the joint's local Y at joint `sideAt` (finger spread, or the thumb swinging across the palm).
export type Pose = Partial<Record<Finger, {bend: number[]; side?: number; sideAt?: number}>> & {sign?: number};

export const skin = () => new THREE.MeshPhysicalMaterial({
  color: '#a87660', roughness: 0.55, sheen: 0.5, sheenRoughness: 0.6, sheenColor: new THREE.Color('#ffc4a8'),
  clearcoat: 0.08, clearcoatRoughness: 0.6, specularIntensity: 0.45,
});

const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0);

// pinch: world point where the thumb and index tips meet; quat: the hand's orientation.
export const Hand: React.FC<{gltf: GLTF; pose: Pose; pinch: THREE.Vector3; quat: THREE.Quaternion; sleeve?: string}> = ({gltf, pose, pinch, quat, sleeve = '#2a2f36'}) => {
  const obj = useMemo(() => {
    const o = skClone(gltf.scene);
    const mat = skin();
    o.traverse((c) => {
      const m = c as THREE.SkinnedMesh;
      if (m.isSkinnedMesh) { m.material = mat; m.frustumCulled = false; m.castShadow = true; }
    });
    const rest = new Map<string, {p: THREE.Vector3; q: THREE.Quaternion}>();
    o.traverse((c) => rest.set(c.name, {p: c.position.clone(), q: c.quaternion.clone()}));
    const cloth = new THREE.MeshPhysicalMaterial({color: sleeve, roughness: 0.85, sheen: 1, sheenColor: new THREE.Color('#6a7380'), sheenRoughness: 0.5, side: THREE.DoubleSide});
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.036, 0.42, 32, 1, true).translate(0, 0.27, 0), cloth);
    arm.position.set(0.035, 0, 0); o.add(arm);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.006, 12, 40).rotateX(Math.PI / 2), cloth);
    cuff.position.set(0.035, 0.065, 0); o.add(cuff);
    return {o, rest};
  }, [gltf, sleeve]);

  const sign = pose.sign ?? 1;
  for (const f of Object.keys(CHAINS) as Finger[]) {
    const names = CHAINS[f], cfg = pose[f];
    let D = new THREE.Quaternion();
    let prevRest = obj.rest.get(names[0])!.p, prevNew = prevRest.clone();
    names.forEach((n, i) => {
      const b = obj.o.getObjectByName(n)!, r = obj.rest.get(n)!;
      const pos = i === 0 ? r.p.clone() : prevNew.clone().add(r.p.clone().sub(prevRest).applyQuaternion(D));
      let local = new THREE.Quaternion().setFromAxisAngle(X, sign * (cfg?.bend[i] ?? 0));
      if (cfg?.side && i === (cfg.sideAt ?? 1)) local = new THREE.Quaternion().setFromAxisAngle(Y, cfg.side).multiply(local);
      const delta = r.q.clone().multiply(local).multiply(r.q.clone().invert()); // joint-local -> armature
      b.position.copy(pos);
      b.quaternion.copy(D.clone().multiply(delta).multiply(r.q));
      D = D.clone().multiply(delta);
      prevRest = r.p; prevNew = pos;
    });
  }

  obj.o.position.set(0, 0, 0); obj.o.quaternion.identity(); obj.o.updateMatrixWorld(true);
  const tip = (n: string) => obj.o.getObjectByName(n)!.getWorldPosition(new THREE.Vector3());
  const mid = tip('index-finger-tip').add(tip('thumb-tip')).multiplyScalar(0.5);
  const pos = pinch.clone().sub(mid.applyQuaternion(quat));
  return <primitive object={obj.o} position={pos} quaternion={quat} />;
};

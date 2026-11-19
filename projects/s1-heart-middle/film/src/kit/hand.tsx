// Open-source hand (WebXR Input Profiles "generic-hand", MIT, Copyright 2019 Amazon).
// Its 25 joint bones are all siblings (a headset sets every joint directly), so bending one knuckle
// does not carry the rest of the finger. We do the forward kinematics ourselves: each joint bends
// about its own local X axis (WebXR: -Z runs along the bone, +Y out of the back of the hand), and
// every joint further down the chain follows.
//
// Usage: load public/models/hand-right.glb / hand-left.glb with GLTFLoader OUTSIDE the canvas, then
//   <HandAt g={gltf} h={{model: 'right', p: [x,y,z], f: [dx,dy,dz], b: [bx,by,bz], pose: POSES.grip}} />
// p: where the thumb and index tips meet (anchor 'pinch') or the index tip (anchor 'index', for pressing);
// f: the direction the fingers point; b: the direction the back of the hand faces.
// Negative bend curls toward the palm. arm: sleeve length in metres; make it long enough to leave the
// frame in every shot that shows the hand (a short sleeve shows its open end in wide shots).
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
// anchor 'index': the index fingertip lands on `pinch` (pressing a switch or key) instead of the pinch midpoint.
export const Hand: React.FC<{gltf: GLTF; pose: Pose; pinch: THREE.Vector3; quat: THREE.Quaternion; sleeve?: string; anchor?: 'pinch' | 'index'; arm?: number}> = ({gltf, pose, pinch, quat, sleeve = '#2a2f36', anchor = 'pinch', arm: armLen = 0.42}) => {
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
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.043 + 0.012 * (armLen - 0.42), 0.036, armLen, 32, 1, true).translate(0, 0.06 + armLen / 2, 0), cloth);
    arm.position.set(0.035, 0, 0); o.add(arm);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.006, 12, 40).rotateX(Math.PI / 2), cloth);
    cuff.position.set(0.035, 0.065, 0); o.add(cuff);
    return {o, rest};
  }, [gltf, sleeve, armLen]);

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
  const mid = anchor === 'index' ? tip('index-finger-tip') : tip('index-finger-tip').add(tip('thumb-tip')).multiplyScalar(0.5);
  const pos = pinch.clone().sub(mid.applyQuaternion(quat));
  return <primitive object={obj.o} position={pos} quaternion={quat} />;
};

// Poses that worked on code-history-01 (gripping a plug, pressing a key, pushing a button).
export const POSES: Record<'grip' | 'point' | 'push', Pose> = {
  grip: {index: {bend: [0, -0.5, -0.6, -0.35]}, middle: {bend: [0, -0.85, -0.95, -0.5]}, ring: {bend: [0, -1.0, -1.05, -0.55]}, pinky: {bend: [0, -1.1, -1.05, -0.6]}, thumb: {bend: [-0.1, -0.25, -0.2]}},
  point: {index: {bend: [0, -0.12, -0.12, -0.06]}, middle: {bend: [0, -1.25, -1.2, -0.7]}, ring: {bend: [0, -1.35, -1.25, -0.7]}, pinky: {bend: [0, -1.4, -1.25, -0.7]}, thumb: {bend: [-0.35, -0.45, -0.35]}},
  push: {index: {bend: [0, -0.25, -0.2, -0.1]}, middle: {bend: [0, -0.3, -0.25, -0.1]}, ring: {bend: [0, -0.4, -0.3, -0.15]}, pinky: {bend: [0, -0.5, -0.35, -0.15]}, thumb: {bend: [-0.2, -0.2, -0.1]}},
};

export type HandSpec = {model: 'right' | 'left'; p: number[]; f: number[]; b: number[]; pose: Pose; anchor?: 'pinch' | 'index'; arm?: number};

// Place a hand by where its fingertips pinch (p), the finger direction (f) and the back of the hand (b).
// The model's back of hand is +x and its fingers point along -y (a left hand mirrors: back is -x).
export const HandAt: React.FC<{g: GLTF; h: HandSpec}> = ({g, h}) => {
  const F = new THREE.Vector3(...(h.f as [number, number, number])).normalize();
  const B = new THREE.Vector3(...(h.b as [number, number, number]));
  B.sub(F.clone().multiplyScalar(B.dot(F))).normalize();
  const Xm = h.model === 'left' ? B.clone().negate() : B;
  const Yv = F.clone().negate(), Z = new THREE.Vector3().crossVectors(Xm, Yv);
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xm, Yv, Z));
  return <Hand gltf={g} pose={h.pose} anchor={h.anchor} arm={h.arm} pinch={new THREE.Vector3(...(h.p as [number, number, number]))} quat={q} />;
};

// Open-source hand (WebXR Input Profiles "generic-hand", MIT, Immersive Web Community Group).
// A skinned mesh with one bone per joint (wrist, thumb-*, index-finger-*, …). We pose it by adding
// a flexion rotation to each finger joint. Units: metres (about 19 cm long).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as skClone} from 'three/examples/jsm/utils/SkeletonUtils.js';

export type Pose = Partial<Record<'thumb' | 'index' | 'middle' | 'ring' | 'pinky', number>> & {axis?: 'x' | 'y' | 'z'; thumbAxis?: 'x' | 'y' | 'z'; spread?: number};
const FINGERS = {
  thumb: ['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal'],
  index: ['index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal'],
  middle: ['middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal'],
  ring: ['ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal'],
  pinky: ['pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal'],
} as const;

export const skin = () => new THREE.MeshPhysicalMaterial({
  color: '#a87660', roughness: 0.55, sheen: 0.5, sheenRoughness: 0.6, sheenColor: new THREE.Color('#ffc4a8'),
  clearcoat: 0.08, clearcoatRoughness: 0.6, specularIntensity: 0.45,
});

// pinch: world point where the thumb and index tips meet; quat: the hand's orientation.
export const Hand: React.FC<{gltf: GLTF; pose: Pose; pinch: THREE.Vector3; quat: THREE.Quaternion; sleeve?: string}> = ({gltf, pose, pinch, quat, sleeve = '#2a2f36'}) => {
  const obj = useMemo(() => {
    const o = skClone(gltf.scene);
    const mat = skin();
    o.traverse((c) => {
      const m = c as THREE.SkinnedMesh;
      if (m.isSkinnedMesh) { m.material = mat; m.geometry.computeVertexNormals(); m.frustumCulled = false; m.castShadow = true; }
    });
    const rest = new Map<string, THREE.Quaternion>();
    o.traverse((c) => rest.set(c.name, c.quaternion.clone()));
    // forearm + sleeve, so the hand never ends in a cut wrist (model fingers point -y, arm goes +y)
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.036, 0.42, 32, 1, true).translate(0, 0.27, 0), new THREE.MeshPhysicalMaterial({color: sleeve, roughness: 0.85, sheen: 1, sheenColor: new THREE.Color('#6a7380'), sheenRoughness: 0.5, side: THREE.DoubleSide}));
    arm.position.set(0.035, 0.0, 0.0); o.add(arm);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.006, 12, 40).rotateX(Math.PI / 2), arm.material);
    cuff.position.set(0.035, 0.065, 0); o.add(cuff);
    return {o, rest, arm};
  }, [gltf, sleeve]);
  const ax = {x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1)};
  for (const [f, bones] of Object.entries(FINGERS)) {
    const amt = (pose as Record<string, number>)[f] ?? 0;
    const a = ax[(f === 'thumb' ? pose.thumbAxis : pose.axis) ?? 'x'];
    bones.forEach((name, i) => {
      const b = obj.o.getObjectByName(name); if (!b) return;
      const q = new THREE.Quaternion().setFromAxisAngle(a, amt * (i === 0 ? 0.9 : 1.1));
      b.quaternion.copy(obj.rest.get(name)!).multiply(q);
    });
  }
  obj.o.position.set(0, 0, 0); obj.o.quaternion.identity(); obj.o.updateMatrixWorld(true);
  const tip = (n: string) => obj.o.getObjectByName(n)!.getWorldPosition(new THREE.Vector3());
  const mid = tip('index-finger-tip').add(tip('thumb-tip')).multiplyScalar(0.5);
  const pos = pinch.clone().sub(mid.applyQuaternion(quat));
  return <primitive object={obj.o} position={pos} quaternion={quat} />;
};

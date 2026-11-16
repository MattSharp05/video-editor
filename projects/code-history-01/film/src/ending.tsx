// Frame 11, the pull-back: every era hangs in the dark as a pane of glass, oldest farthest away, and the
// amber thread runs through all of them, from ENIAC's cable to the Claude window nearest the camera.
// "Cables, switches, cards, screens, sentences. … tell the machine exactly what you mean."
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {C} from './eniac';

export const ERAS = ['01', '03', '04', '06', '07', '10']; // cable, switches, card, printout, screen, sentence
const PANE_W = 0.5, PANE_H = 0.5 * (0.56 * 1920) / 1080;
// oldest at the back, top; each nearer pane lower and to alternating sides (a gentle S down the frame)
export const paneAt = (i: number) => {
  const k = ERAS.length - 1 - i; // 0 = nearest
  return new THREE.Vector3((k % 2 ? -1 : 1) * 0.22 * Math.min(1, k), 0.3 + k * 0.4, -k * 0.7);
};

// Textures are loaded outside the canvas (StyleFrame) so no frame is captured before they are drawn.
export const EndingSet: React.FC<{tex: THREE.Texture[]}> = ({tex}) => {
  const {scene} = useThree();
  scene.background = new THREE.Color(C.ground);
  scene.fog = new THREE.FogExp2('#14110e', 0.12);
  scene.environment = null;
  const built = useMemo(() => {
    if (!tex) return null;
    const g = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({color: '#2e2a26', metalness: 0.6, roughness: 0.45});
    const glassMat = new THREE.MeshPhysicalMaterial({color: '#ffffff', roughness: 0.12, metalness: 0, transparent: true, opacity: 0.1, clearcoat: 1, depthWrite: false});
    const centres: THREE.Vector3[] = [];
    ERAS.forEach((_, i) => {
      const p = paneAt(i), k = ERAS.length - 1 - i;
      const pane = new THREE.Group(); pane.position.copy(p); pane.rotation.y = (k % 2 ? 1 : -1) * 0.18 * Math.min(1, k); g.add(pane);
      const img = new THREE.Mesh(new THREE.PlaneGeometry(PANE_W, PANE_H), new THREE.MeshBasicMaterial({map: tex[i], toneMapped: false, color: new THREE.Color(0.85, 0.85, 0.85)}));
      pane.add(img);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(PANE_W + 0.03, PANE_H + 0.03, 0.012), glassMat); glass.position.z = 0.008; pane.add(glass);
      for (const [x, y, w, hh] of [[0, PANE_H / 2 + 0.016, PANE_W + 0.04, 0.006], [0, -PANE_H / 2 - 0.016, PANE_W + 0.04, 0.006], [PANE_W / 2 + 0.016, 0, 0.006, PANE_H + 0.04], [-PANE_W / 2 - 0.016, 0, 0.006, PANE_H + 0.04]] as number[][]) {
        const e = new THREE.Mesh(new THREE.BoxGeometry(w, hh, 0.016), frameMat); e.position.set(x, y, 0.008); pane.add(e);
      }
      // a soft reflection of each pane on the floor below it
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(PANE_W * 1.2, 0.3), new THREE.MeshBasicMaterial({color: '#ff8a1a', transparent: true, opacity: 0.05, depthWrite: false}));
      glow.rotation.x = -Math.PI / 2; glow.position.set(p.x, -0.2, p.z + 0.1); g.add(glow);
      centres.push(p.clone().add(new THREE.Vector3(0, -PANE_H * 0.5 - 0.05, 0.05)));
    });
    // the thread: from behind the oldest pane to the bottom of the nearest, passing under each
    const pts = [centres[0].clone().add(new THREE.Vector3(0.2, 0.1, -0.6)), ...centres, centres[centres.length - 1].clone().add(new THREE.Vector3(-0.1, -0.25, 0.6))];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 800, 0.006, 12), new THREE.MeshStandardMaterial({color: '#ff8a10', emissive: '#ff7a00', emissiveIntensity: 1.6, roughness: 0.4})));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 800, 0.016, 16), new THREE.MeshBasicMaterial({color: '#ff9a30', transparent: true, opacity: 0.12, depthWrite: false})));
    return {g, curve};
  }, [tex]);
  if (!built) return null;
  const lights = [0.1, 0.3, 0.5, 0.7, 0.9].map((t) => built.curve.getPointAt(t));
  return (
    <>
      <primitive object={built.g} />
      {lights.map((p, i) => <pointLight key={i} position={p} color={C.amber} intensity={0.25} distance={1.2} decay={2} />)}
      <hemisphereLight args={['#4a3c30', '#0a0908', 0.5]} />
    </>
  );
};

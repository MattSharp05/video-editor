// QA sheet for one assembled asset (references/assembly.md, step 3): the asset alone, a flat colour per part
// (detached or offset pieces stand out), lit evenly, from a numbered view:
//   view 0-7  turntable, 45 degrees apart, slightly above      view 8 top      view 9 bottom
//   view 10+  close-ups at `focus` points (the joints), two per joint (front-left and back-right)
// Register in Root.tsx:  <Composition id="QA" component={AssetQA} width={1080} height={1080} fps={30} durationInFrames={1}
//                          defaultProps={{asset: 'sleeper', view: 0}} />  with your assets in QA_ASSETS below.
// Then: ./qa_sheet.sh sleeper out/qa  (renders every view and a contact sheet).
import React, {useLayoutEffect, useRef} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './three-canvas';

export type QAAsset = {render: () => React.ReactNode; focus?: [number, number, number][]; focusDist?: number};
const PALETTE = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff'];

const Rig: React.FC<{view: number; a: QAAsset}> = ({view, a}) => {
  const g = useRef<THREE.Group>(null), {camera, scene, advance} = useThree();
  // assets may load asynchronously (GLB, JSON): wait until the group holds a mesh, then frame it and draw
  useLayoutEffect(() => {
    const h = delayRender('qa: asset'); let done = false;
    const tick = () => { if (done) return; let has = false; g.current?.traverse((o) => { if ((o as THREE.Mesh).isMesh) has = true; });
      if (!has) { requestAnimationFrame(tick); return; } done = true; setup(); advance(performance.now()); continueRender(h); };
    tick(); return () => { done = true; continueRender(h); };
  }, [view]);
  const setup = () => {
    scene.background = new THREE.Color('#2a2a2e');
    let k = 0;
    g.current!.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.material = new THREE.MeshLambertMaterial({color: PALETTE[k++ % PALETTE.length], side: THREE.DoubleSide}); });
    const box = new THREE.Box3().setFromObject(g.current!), c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
    const cam = camera as THREE.PerspectiveCamera; cam.fov = 30; cam.near = r / 100; cam.far = r * 20;
    const d = r / Math.sin((cam.fov / 2) * Math.PI / 180) * 1.05;
    if (view < 8) { const az = view * Math.PI / 4; cam.position.set(c.x + Math.sin(az) * d * 0.97, c.y + d * 0.25, c.z + Math.cos(az) * d * 0.97); cam.lookAt(c); }
    else if (view < 10) { cam.position.set(c.x, c.y + (view === 8 ? d : -d), c.z + 0.001); cam.lookAt(c); }
    else {
      const f = a.focus?.[Math.floor((view - 10) / 2)]; if (!f) return;
      const fd = a.focusDist ?? r * 0.35, s = (view - 10) % 2 ? 1 : -1;
      cam.position.set(f[0] + s * fd * 0.7, f[1] + fd * 0.3, f[2] + s * fd * 0.7); cam.lookAt(new THREE.Vector3(...f));
    }
    cam.updateProjectionMatrix();
  };
  return (<><hemisphereLight args={['#ffffff', '#555566', 1.2]} /><directionalLight position={[3, 5, 4]} intensity={1.2} /><group ref={g}>{a.render()}</group></>);
};

export const makeAssetQA = (assets: Record<string, QAAsset>): React.FC<{asset: string; view: number}> => ({asset, view}) => (
  <AbsoluteFill style={{background: '#2a2a2e'}}>
    <ThreeCanvas width={1080} height={1080} camera={{fov: 30, position: [0, 0, 5]}}><Rig view={view} a={assets[asset]} /></ThreeCanvas>
    <div style={{position: 'absolute', left: 24, top: 18, color: '#fff', font: '700 36px sans-serif'}}>{asset} · view {view}</div>
  </AbsoluteFill>
);

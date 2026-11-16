// A 1970s video terminal with an amber-phosphor CRT (amber screens were common alongside green). The
// paper from the printout has become this screen; the typo is being fixed in minutes, not hours.
// Units: metres. Screen centre near (0, 0.33, 0); keyboard on the desk in front (y = 0).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {random} from 'remotion';
import {C} from './eniac';
import {KEYROWS, keyTexture} from './cards';

export const SCREEN = {w: 0.3, h: 0.225, y: 0.33, z: 0.0};
const LINES = [
  '> ASM PAYROLL',
  '  0002  ADD   TOTAL,CUONT',
  '  *** UNDEFINED SYMBOL  CUONT',
  '> EDIT 0002',
  '  0002  ADD   TOTAL,COUNT',
  '> ASM PAYROLL',
  '  0 ERRORS',
  '> ',
];

function screenTexture() {
  const W = 1280, H = 960, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#0d0703'; ctx.fillRect(0, 0, W, H);
  // faint phosphor glow toward the centre
  const g = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.7); g.addColorStop(0, 'rgba(255,140,30,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.font = '66px "VT323", "Courier New", monospace'; ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(255,150,40,0.9)'; ctx.shadowBlur = 14;
  LINES.forEach((l, i) => {
    const err = l.includes('CUONT');
    ctx.fillStyle = err ? 'rgba(255,160,60,0.45)' : '#ffb04a';
    ctx.fillText(l, 70, 80 + i * 92);
  });
  // block cursor after the prompt
  ctx.fillStyle = '#ffb04a'; ctx.fillRect(70 + 2 * 33, 80 + 7 * 92 + 6, 30, 56);
  ctx.shadowBlur = 0;
  // scanlines
  for (let y = 0; y < H; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(0, y, W, 2); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// A slightly bulged CRT face: a plane pushed out toward the centre.
function crtGeometry(w: number, h: number, bulge: number) {
  const geo = new THREE.PlaneGeometry(w, h, 40, 30);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (w / 2), y = p.getY(i) / (h / 2);
    p.setZ(i, bulge * (1 - 0.5 * (x * x + y * y)));
  }
  geo.computeVertexNormals(); return geo;
}

export const TKEY = {pitch: 0.019, size: 0.016, z0: 0.1, y: 0.012};
export const tkeyPos = (ch: string) => {
  const r = KEYROWS.findIndex((row) => row.includes(ch)), c = KEYROWS[r].indexOf(ch);
  return new THREE.Vector3(-0.09 + c * TKEY.pitch + r * 0.006, TKEY.y + 0.009, TKEY.z0 + r * TKEY.pitch);
};

export const TerminalSet: React.FC<{pressed?: string}> = ({pressed = 'T'}) => {
  const {gl, scene} = useThree();
  const env = useMemo(() => { const pm = new THREE.PMREMGenerator(gl); const t = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); return t; }, [gl]);
  scene.environment = env; scene.environmentIntensity = 0.2;
  scene.background = new THREE.Color(C.ground);
  scene.fog = new THREE.FogExp2(C.haze, 0.45);

  const built = useMemo(() => {
    const g = new THREE.Group();
    const shell = new THREE.MeshPhysicalMaterial({color: '#3b3630', roughness: 0.55, clearcoat: 0.2});
    // desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.03, 0.8), new THREE.MeshPhysicalMaterial({color: '#2a2622', roughness: 0.6, clearcoat: 0.2}));
    desk.position.set(0, -0.015, 0.1); g.add(desk);
    // terminal housing with a recessed bezel
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.38, 0.38, 4, 0.03), shell); body.position.set(0, SCREEN.y, -0.2); g.add(body);
    const bezel = new THREE.Mesh(new RoundedBoxGeometry(SCREEN.w + 0.05, SCREEN.h + 0.05, 0.03, 4, 0.02), new THREE.MeshPhysicalMaterial({color: '#211e1b', roughness: 0.5}));
    bezel.position.set(0, SCREEN.y, -0.005); g.add(bezel);
    // the CRT face: phosphor texture, emissive, with a glass layer over it
    const tex = screenTexture();
    const face = new THREE.Mesh(crtGeometry(SCREEN.w, SCREEN.h, 0.012), new THREE.MeshStandardMaterial({map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 1.1, roughness: 0.9}));
    face.position.set(0, SCREEN.y, 0.008); g.add(face);
    const glass = new THREE.Mesh(crtGeometry(SCREEN.w, SCREEN.h, 0.013), new THREE.MeshPhysicalMaterial({color: '#000000', roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.18, depthWrite: false}));
    glass.position.set(0, SCREEN.y, 0.0095); g.add(glass);
    // detached keyboard (as on many terminals of the time)
    const kb = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.02, 0.1, 3, 0.006), shell); kb.position.set(0.0, 0.01, TKEY.z0 + 0.02); kb.rotation.x = 0.06; g.add(kb);
    const capGeo = new RoundedBoxGeometry(TKEY.size, 0.01, TKEY.size, 3, 0.0025);
    KEYROWS.forEach((row) => [...row].forEach((ch) => {
      const p = tkeyPos(ch);
      const mats = [0, 1, 2, 3, 4, 5].map((i) => new THREE.MeshPhysicalMaterial(i === 2 ? {map: keyTexture(ch), roughness: 0.45, clearcoat: 0.4} : {color: '#2b2926', roughness: 0.45, clearcoat: 0.4}));
      const cap = new THREE.Mesh(capGeo, mats); cap.position.set(p.x, p.y - 0.005 - (ch === pressed ? 0.003 : 0), p.z); g.add(cap);
    }));
    // a few loose printout sheets on the desk to the side: the paper that came before the screen
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.28), new THREE.MeshStandardMaterial({color: '#8f8b84', roughness: 0.9}));
    paper.rotation.set(-Math.PI / 2, 0, 0.3); paper.position.set(-0.32, 0.001, 0.12); g.add(paper);
    for (let i = 0; i < 6; i++) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.12 + random(`pl${i}`) * 0.05, 0.004), new THREE.MeshBasicMaterial({color: '#3a3631'}));
      line.rotation.set(-Math.PI / 2, 0, 0.3); line.position.set(-0.33 + i * 0.006, 0.0015, 0.05 + i * 0.022); g.add(line);
    }
    return {g};
  }, [pressed]);

  return (
    <>
      <primitive object={built.g} />
      {/* the screen lights the room: a soft amber area in front of it */}
      <pointLight position={[0, 0.1, 0.22]} color={'#ff9a30'} intensity={0.35} distance={1.2} decay={2} />
      <spotLight position={[-0.7, 1.0, 0.8]} angle={0.5} penumbra={1} intensity={2.5} color={'#ffe2c0'} distance={3} decay={2} />
      <spotLight position={[0.8, 0.8, -0.8]} angle={0.6} penumbra={1} intensity={5} color={'#ffcf9a'} distance={3} decay={2} />
      <hemisphereLight args={['#4a3c30', '#0a0908', 0.35]} />
    </>
  );
};

// Front-panel switch register (1950s–70s minicomputers): a row of toggle switches, one per bit, with
// a lamp above each. The thread's amber lives on as the lit lamps: amber = 1, dark = 0.
// Units: metres. Panel faces +z at z = 0. Bit 0 is the leftmost switch.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {random} from 'remotion';
import {C} from './eniac';

export const BITS = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1]; // the pattern being entered
export const SW = {x0: -0.275, dx: 0.05, y: 0.5, lampY: 0.62, digitY: 0.575};
export const switchTip = (i: number, up: boolean) => new THREE.Vector3(SW.x0 + i * SW.dx, SW.y + (up ? 0.03 : -0.03), 0.045);

function digitsTexture(bits: number[]) {
  const W = 2048, H = 128, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);
  ctx.font = '700 84px "Hanken Grotesk", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  bits.forEach((b, i) => {
    ctx.fillStyle = b ? '#ffb347' : 'rgba(210,200,185,0.35)';
    ctx.fillText(String(b), (i + 0.5) * (W / bits.length), H / 2 + 4);
  });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function brushed(seed: string) {
  const s = 512, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const ctx = cv.getContext('2d')!; const img = ctx.createImageData(s, s);
  for (let y = 0; y < s; y++) {
    const row = 0.5 + (random(`${seed}r${y}`) - 0.5) * 0.25;
    for (let x = 0; x < s; x++) {
      const v = Math.max(0, Math.min(1, row + (random(`${seed}${x}_${y}`) - 0.5) * 0.08)) * 255;
      const i = (y * s + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// A toggle: hex nut, threaded bushing and a tapered chrome bat, tilted up (1) or down (0).
function toggle(up: boolean, mats: Record<string, THREE.Material>) {
  const g = new THREE.Group();
  const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.006, 6).rotateX(Math.PI / 2), mats.chrome);
  nut.position.z = 0.003; g.add(nut);
  const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.01, 24).rotateX(Math.PI / 2), mats.chrome);
  bush.position.z = 0.01; g.add(bush);
  const bat = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0022, 0.032, 20), mats.chrome);
  shaft.position.y = 0.016; bat.add(shaft);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.0036, 20, 12), mats.chrome);
  ball.position.y = 0.033; bat.add(ball);
  bat.position.z = 0.014; bat.rotation.x = up ? -0.62 : Math.PI + 0.62; // tilt toward the viewer, up or down
  g.add(bat);
  return g;
}

export const SwitchSet: React.FC<{flipIndex?: number}> = ({flipIndex = 7}) => {
  const {gl, scene} = useThree();
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); return tex;
  }, [gl]);
  scene.environment = env; scene.environmentIntensity = 0.35;
  scene.background = new THREE.Color(C.ground);
  scene.fog = new THREE.FogExp2(C.haze, 0.35);

  const built = useMemo(() => {
    const g = new THREE.Group();
    const mats = {
      chrome: new THREE.MeshStandardMaterial({color: '#d9d2c6', metalness: 1, roughness: 0.18}),
      panel: new THREE.MeshPhysicalMaterial({color: '#1d1b19', roughness: 0.6, roughnessMap: brushed('pn'), metalness: 0.4, clearcoat: 0.25, clearcoatRoughness: 0.5}),
      band: new THREE.MeshPhysicalMaterial({color: '#2a2622', roughness: 0.5, metalness: 0.5}),
      bezel: new THREE.MeshStandardMaterial({color: '#4a443d', metalness: 0.9, roughness: 0.3}),
      lampOn: new THREE.MeshPhysicalMaterial({color: '#e06a00', emissive: '#ff5a00', emissiveIntensity: 0.45, roughness: 0.2, clearcoat: 1}),
      lampOff: new THREE.MeshPhysicalMaterial({color: '#3a2a1c', roughness: 0.15, clearcoat: 1, transmission: 0.2}),
    };
    // panel, a darker band behind the switch row, rails
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.03), mats.panel); panel.position.set(0, 0.55, -0.015); g.add(panel);
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.2, 0.004), mats.band); band.position.set(0, 0.555, 0.002); g.add(band);
    for (const y of [0.45, 0.66]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.004, 0.006), mats.bezel); r.position.set(0, y, 0.004); g.add(r); }
    // group ticks every 3 bits (octal), as real panels marked them
    for (let k = 1; k < 4; k++) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.17, 0.005), mats.bezel); t.position.set(SW.x0 + (k * 3 - 0.5) * SW.dx, 0.555, 0.004); g.add(t); }
    // digits printed on the panel
    const dig = new THREE.Mesh(new THREE.PlaneGeometry(SW.dx * BITS.length, SW.dx * BITS.length / 16), new THREE.MeshBasicMaterial({map: digitsTexture(BITS), transparent: true, toneMapped: false}));
    dig.position.set(SW.x0 + (BITS.length - 1) * SW.dx / 2, SW.digitY, 0.0045); g.add(dig);
    // lamps and switches
    BITS.forEach((b, i) => {
      const x = SW.x0 + i * SW.dx;
      const bez = new THREE.Mesh(new THREE.TorusGeometry(0.0095, 0.0022, 12, 32), mats.bezel); bez.position.set(x, SW.lampY, 0.006); g.add(bez);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), b ? mats.lampOn : mats.lampOff);
      lamp.position.set(x, SW.lampY, 0.004); g.add(lamp);
      const t = toggle(!!b, mats); t.position.set(x, SW.y, 0); g.add(t);
    });
    // a second, out-of-focus row of panels behind for depth (another cabinet)
    const back = panel.clone(); back.position.set(0.9, 0.7, -1.4); back.scale.set(1.5, 1.6, 1); g.add(back);
    return {g};
  }, []);

  const lit = BITS.map((b, i) => (b ? new THREE.Vector3(SW.x0 + i * SW.dx, SW.lampY, 0.05) : null)).filter(Boolean) as THREE.Vector3[];
  return (
    <>
      <primitive object={built.g} />
      {lit.map((p, i) => <pointLight key={i} position={p} color={C.amber} intensity={0.05} distance={0.25} decay={2} />)}
      <spotLight position={[-0.8, 1.6, 1.2]} angle={0.5} penumbra={1} intensity={6} color={'#ffe2c0'} distance={4} decay={2} />
      <spotLight position={[1.4, 1.2, -0.6]} angle={0.6} penumbra={1} intensity={10} color={'#ffcf9a'} distance={5} decay={2} />
      <hemisphereLight args={['#4a3c30', '#0a0908', 0.5]} />
    </>
  );
};

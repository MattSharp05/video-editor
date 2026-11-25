// One world: a roadside motel at night with endless rooms along -z, a NO VACANCY sign by the road, an endless bus,
// guests (capsule figures) and, in part 2, glowing number boards. Built once; per frame only instance matrices and
// colours, a few canvases (the number boards), the bus position and the camera change, all from timeline.ts.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import * as TL from './timeline';
import {SANS} from './kit/fonts';

const col = (h: string) => new THREE.Color(h);
const WARM = col(TL.WARM), AMB = col(TL.AMBER), BLU = col(TL.BLUE), NEON = col(TL.NEON);
const FOG = '#1A2740';
const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3(), C = new THREE.Color();
const hide = (m: THREE.InstancedMesh, i: number) => { M.makeScale(0, 0, 0); m.setMatrixAt(i, M); };
const put = (m: THREE.InstancedMesh, i: number, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, q: THREE.Quaternion = Q.identity()) => {
  P.set(x, y, z); S.set(sx, sy, sz); M.compose(P, q, S); m.setMatrixAt(i, M);
};

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
const glowTex = () => canvasTex(64, 64, (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
});
// stucco wall: warm grey with soft noise, a darker band at the base
const wallTex = () => {
  const t = canvasTex(512, 256, (g) => {
    g.fillStyle = '#8C7F72'; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 9000; i++) { const x = (Math.sin(i * 12.9) * 43758.5 % 1 + 1) % 1, y = (Math.sin(i * 78.2) * 12345.6 % 1 + 1) % 1; g.fillStyle = `rgba(${i % 2 ? '255,245,230' : '40,30,20'},0.06)`; g.fillRect(x * 512, y * 256, 2, 2); }
    g.fillStyle = 'rgba(30,22,16,0.55)'; g.fillRect(0, 236, 512, 20);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
};
// a window: curtains half drawn, lit from inside (the instance colour tints it; black = dark room)
const windowTex = () => canvasTex(128, 128, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#d8c8b0'); gr.addColorStop(1, '#fff6e6'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  for (let x = 0; x < 128; x += 6) { g.fillStyle = `rgba(120,80,50,${0.12 + 0.1 * Math.sin(x)})`; g.fillRect(x, 0, 3, 128); }
  g.fillStyle = 'rgba(255,255,255,0.0)'; g.fillRect(34, 0, 60, 128);
  g.fillStyle = 'rgba(255,250,235,0.55)'; g.fillRect(38, 0, 52, 128);
  g.strokeStyle = '#2a2420'; g.lineWidth = 6; g.strokeRect(3, 3, 122, 122); g.beginPath(); g.moveTo(64, 0); g.lineTo(64, 128); g.stroke();
});
// the bus's side window band, one 1.6 m bay (two seats): passenger silhouettes or empty seats, in the trip's light
const busTex = (people: 'guests' | 'numbers' | 'empty', tint: string) => {
  const t = canvasTex(256, 128, (g) => {
    g.fillStyle = '#1b1d22'; g.fillRect(0, 0, 256, 128);
    [0, 128].forEach((x0) => {
      const gr = g.createLinearGradient(0, 18, 0, 110); gr.addColorStop(0, tint); gr.addColorStop(1, 'rgba(255,255,255,0.75)');
      g.fillStyle = gr; g.beginPath(); g.roundRect(x0 + 10, 16, 108, 92, 10); g.fill();
      g.fillStyle = 'rgba(10,12,18,0.85)';
      if (people === 'guests') { g.beginPath(); g.arc(x0 + 64, 52, 15, 0, Math.PI * 2); g.fill(); g.beginPath(); g.roundRect(x0 + 38, 70, 52, 50, 18); g.fill(); }
      if (people === 'numbers') { g.fillStyle = 'rgba(30,26,20,0.9)'; g.beginPath(); g.roundRect(x0 + 22, 46, 84, 30, 6); g.fill(); g.fillStyle = '#FFE7C2'; g.font = '700 20px sans-serif'; g.fillText('0.' + String(1000 + ((x0 * 7919) % 9000)).slice(0, 4), x0 + 30, 68); }
      if (people === 'empty') { g.fillStyle = 'rgba(40,40,46,0.5)'; g.fillRect(x0 + 30, 84, 68, 26); }
    });
  });
  t.wrapS = THREE.RepeatWrapping; return t;
};
// the sign's two words as neon tubes
const neonTex = (text: string, w: number) => canvasTex(w, 160, (g) => {
  g.font = `800 120px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(255,255,255,0.9)'; g.shadowBlur = 18; g.fillStyle = '#ffffff'; g.fillText(text, w / 2, 84);
  g.shadowBlur = 0; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.6)'; g.strokeText(text, w / 2, 84);
});

// a number board's face: dark glass, the name small, "0.dddddddd…" in slots (timeline SLOT_PX); one digit may be lifted
const drawBoard = (g: CanvasRenderingContext2D, name: string, digits: string, hi: number, ink: string, hiInk: string, neq: number) => {
  g.clearRect(0, 0, 1024, 256);
  g.fillStyle = 'rgba(14,18,28,0.82)'; g.beginPath(); g.roundRect(8, 8, 1008, 240, 34); g.fill();
  g.lineWidth = 5; g.strokeStyle = ink; g.globalAlpha = 0.55; g.stroke(); g.globalAlpha = 1;
  if (name) { g.font = `700 40px ${SANS}`; g.fillStyle = 'rgba(230,226,215,0.7)'; g.textAlign = 'left'; g.fillText(name, 52, 62); }
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const ch = (k: number, s: string, c: string, lift = 0) => { g.fillStyle = c; g.font = `800 ${lift ? 140 : 124}px ${SANS}`; g.fillText(s, TL.SLOT_PX(k), 200 - lift * 18); };
  ch(-1, '0', ink); ch(0, '.', ink); ch(9, '…', ink);
  for (let k = 1; k <= 8; k++) ch(k, digits[k - 1], k === hi ? hiInk : ink, k === hi ? 1 : 0);
  if (hi > 0) { g.fillStyle = hiInk; g.fillRect(TL.SLOT_PX(hi) - 30, 218, 60, 9); }
  if (neq > 0.05) { g.globalAlpha = neq; g.fillStyle = hiInk; g.beginPath(); g.roundRect(TL.SLOT_PX(hi) - 42, 70, 84, 160, 14); g.globalAlpha = neq * 0.25; g.fill(); g.globalAlpha = 1; }
};

// figures: emissive from their instance colour so they read on a dark walkway
const glowingStandard = (glow: number) => {
  const m = new THREE.MeshStandardMaterial({roughness: 0.55, metalness: 0});
  m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n#ifdef USE_COLOR\n totalEmissiveRadiance += vColor.rgb * ${glow.toFixed(2)};\n#endif`); };
  return m;
};

type Board = {mesh: THREE.Mesh; g: CanvasRenderingContext2D; tex: THREE.CanvasTexture; key: string};

export const Scene: React.FC<{t: number}> = ({t}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; gl.outputColorSpace = THREE.SRGBColorSpace;
    const root = new THREE.Group(); scene.add(root);
    scene.fog = new THREE.FogExp2(col(FOG), 0.0115); scene.background = col(FOG);
    const gtex = glowTex();

    // sky dome: night blue overhead to the fog colour at the horizon; a few stars
    const skyGeo = new THREE.SphereGeometry(2500, 32, 16);
    const sc: number[] = []; const top = col('#060B16'), hor = col(FOG);
    for (let i = 0; i < skyGeo.attributes.position.count; i++) { const y = skyGeo.attributes.position.getY(i) / 2500; C.copy(hor).lerp(top, Math.pow(Math.max(0, y), 0.45)); sc.push(C.r, C.g, C.b); }
    skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3));
    const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false})); root.add(sky);
    const sp: number[] = []; for (let i = 0; i < 1400; i++) { const a = TL.hash(i, 1) * Math.PI * 2, e = 0.12 + Math.pow(TL.hash(i, 2), 0.7) * 1.3; sp.push(2300 * Math.cos(e) * Math.cos(a), 2300 * Math.sin(e), 2300 * Math.cos(e) * Math.sin(a)); }
    const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)), new THREE.PointsMaterial({color: col('#cfd8ff'), size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8})); root.add(stars);

    // light: moon from frame right-back, a dim sky fill
    root.add(new THREE.HemisphereLight(col('#3A4D78'), col('#1a140e'), 0.55));
    const moon = new THREE.DirectionalLight(col('#9DB4FF'), 0.55); moon.position.set(60, 80, -60); root.add(moon);

    // ground, road, centre dashes
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({color: col('#211c17'), roughness: 1}));
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, -1000); root.add(ground);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3000), new THREE.MeshStandardMaterial({color: col('#17181b'), roughness: 0.9}));
    road.rotation.x = -Math.PI / 2; road.position.set(8.0, 0.0, -1300); root.add(road);
    const lot = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3000), new THREE.MeshStandardMaterial({color: col('#2a2723'), roughness: 0.95}));
    lot.rotation.x = -Math.PI / 2; lot.position.set(3.4, 0.005, -1300); root.add(lot);
    const dashes = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 2.4).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({color: col('#d9cfa8'), roughness: 0.7}), 500);
    for (let i = 0; i < 500; i++) put(dashes, i, 8.0, 0.01, 40 - i * 6); root.add(dashes);

    // the motel: one long wall, walkway, roof with fascia, posts; per room a door, window, plate, lamp
    const NR = TL.NR, L = NR * TL.PITCH + 10, zc = 1.6 - L / 2;
    const wt = wallTex(); wt.repeat.set(L / 6, 1);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.1, L), new THREE.MeshStandardMaterial({map: wt, roughness: 0.95}));
    wall.position.set(-0.2, 1.55, zc); root.add(wall);
    const walk = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, L), new THREE.MeshStandardMaterial({color: col('#5d5750'), roughness: 0.9})); walk.position.set(0.95, 0.07, zc); root.add(walk);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, L), new THREE.MeshStandardMaterial({color: col('#3b3430'), roughness: 0.8})); roof.position.set(0.15, 3.25, zc); root.add(roof);
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, L), new THREE.MeshBasicMaterial({color: col('#FFB36B').multiplyScalar(0.55)})); fascia.position.set(0.62, 3.12, zc); root.add(fascia);
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 3.1, 0.12), new THREE.MeshStandardMaterial({color: col('#4a423c'), roughness: 0.8}), NR);
    void posts;
    const doors = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 2.1, 1.0), new THREE.MeshStandardMaterial({color: col('#2E5257'), roughness: 0.6}), NR);
    const frames = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 1.14, 1.34), new THREE.MeshStandardMaterial({color: col('#1c1a18'), roughness: 0.7}), NR);
    const windows = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.2, 1.0).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({map: windowTex(), toneMapped: false}), NR);
    const plates = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.26, 0.46), new THREE.MeshStandardMaterial({color: col('#c9b48a'), roughness: 0.4, metalness: 0.6}), NR);
    const lamps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.18, 0.12), new THREE.MeshBasicMaterial({color: col('#FFC98A').multiplyScalar(1.6), toneMapped: false}), NR);
    for (let i = 0; i < NR; i++) {
      const z = TL.doorZ(i + 1);
      put(doors, i, 0.03, 1.05 + 0.14, z); put(frames, i, 0.01, 1.55, z - 1.55); put(windows, i, 0.04, 1.55, z - 1.55);
      put(plates, i, 0.05, 2.48, z); put(lamps, i, 0.08, 2.55, z + 0.75); windows.setColorAt(i, C.setRGB(0, 0, 0));
    }
    root.add(doors, frames, windows, plates, lamps);
    // plates 1..40 carry their numbers (the rest are too far to read)
    for (let n = 1; n <= 40; n++) {
      const tx = canvasTex(128, 64, (g) => { g.fillStyle = '#c9b48a'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#2a1e12'; g.font = `800 46px ${SANS}`; g.textAlign = 'center'; g.fillText(String(n), 64, 48); });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.22).rotateY(Math.PI / 2), new THREE.MeshStandardMaterial({map: tx, roughness: 0.5, emissive: col('#ffffff'), emissiveMap: tx, emissiveIntensity: 0.35}));
      m.position.set(0.075, 2.48, TL.doorZ(n)); root.add(m);
    }
    // light: glow pools on the walkway in front of lit windows and lamp halos (fake light, additive), and real point
    // lights on the few rooms nearest the camera
    const pools = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({map: gtex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false}), NR);
    pools.renderOrder = 2; root.add(pools);
    const halos = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({map: gtex, color: col('#FFB878').multiplyScalar(0.6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false}), NR);
    for (let i = 0; i < NR; i++) put(halos, i, 0.12, 2.55, TL.doorZ(i + 1) + 0.75, 1, 0.9, 0.9); halos.renderOrder = 2; root.add(halos);
    const pls = [0, 1, 2, 3, 4, 5].map(() => { const l = new THREE.PointLight(col(TL.WARM), 0, 7, 1.6); root.add(l); return l; });

    // the sign: pole, dark panel, "NO" (neon red) over "VACANCY" (warm white); its red light on the ground
    const sign = new THREE.Group(); sign.position.set(TL.SIGN.x, 0, TL.SIGN.z); sign.rotation.y = 0.55; root.add(sign);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 4.8, 10), new THREE.MeshStandardMaterial({color: col('#2b2b2e'), metalness: 0.6, roughness: 0.5})); pole.position.y = 2.4; sign.add(pole);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.7, 0.18), new THREE.MeshStandardMaterial({color: col('#141317'), roughness: 0.6})); panel.position.y = 5.4; sign.add(panel);
    const noMat = new THREE.MeshBasicMaterial({map: neonTex('NO', 300), color: NEON, transparent: true, toneMapped: false, depthWrite: false});
    const no = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.62), noMat); no.position.set(0, 5.82, 0.1); sign.add(no);
    const vacMat = new THREE.MeshBasicMaterial({map: neonTex('VACANCY', 900), color: col('#FFE4B0').multiplyScalar(0.85), transparent: true, toneMapped: false, depthWrite: false});
    const vac = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.53), vacMat); vac.position.set(0, 5.05, 0.1); sign.add(vac);
    const noHalo = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), new THREE.MeshBasicMaterial({map: gtex, color: NEON, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false})); noHalo.position.set(0, 5.8, 0.15); sign.add(noHalo);
    const signLight = new THREE.PointLight(NEON, 0, 9, 1.8); signLight.position.set(TL.SIGN.x + 0.4, 4.6, TL.SIGN.z + 0.6); root.add(signLight);

    // guests: capsule body + head; a suitcase for the newcomer; light trails while they move
    const NG = TL.GUESTS.length;
    const bodies = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.21, 0.82, 4, 10).translate(0, 0.62, 0), glowingStandard(0.7), NG);
    const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.155, 14, 10).translate(0, 1.47, 0), glowingStandard(0.8), NG);
    for (let i = 0; i < NG; i++) { bodies.setColorAt(i, WARM); heads.setColorAt(i, WARM); }
    bodies.frustumCulled = heads.frustumCulled = false; root.add(bodies, heads);
    const suitcase = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.52), new THREE.MeshStandardMaterial({color: col('#B5652E'), roughness: 0.5, emissive: AMB, emissiveIntensity: 0.25})); root.add(suitcase);
    const TRAIL = 5;
    const trails = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({map: gtex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false}), (NG + TL.NUM_N) * TRAIL);
    trails.frustumCulled = false; trails.renderOrder = 3; root.add(trails);

    // the bus: a long body, a window band of 1.6 m bays on the camera's side, a roof light line, the front with
    // headlights; trip 1 carries guests (blue), trip 2 numbers (warm)
    const BL = 1200;
    const bus = new THREE.Group(); root.add(bus);
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.9, BL), new THREE.MeshStandardMaterial({color: col('#a39f95'), roughness: 0.55, metalness: 0.2})); body.position.set(TL.BUS_X, 1.75, -BL / 2); bus.add(body);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.64, 0.18, BL), new THREE.MeshStandardMaterial({color: col('#3D6FA8'), roughness: 0.5})); stripe.position.set(TL.BUS_X, 0.95, -BL / 2); bus.add(stripe);
    const band = (tex: THREE.Texture) => { tex.repeat.set(BL / 1.6, 1); const m = new THREE.Mesh(new THREE.PlaneGeometry(BL, 1.25).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({map: tex, transparent: true, toneMapped: false})); m.position.set(TL.BUS_X + 1.31, 2.1, -BL / 2); bus.add(m); return m; };
    const bands = {g: band(busTex('guests', '#4C9BE8')), ge: band(busTex('empty', '#4C9BE8')), n: band(busTex('numbers', '#E8B66A')), ne: band(busTex('empty', '#E8B66A'))};
    const front = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.9, 0.08), new THREE.MeshStandardMaterial({color: col('#2a2c31'), roughness: 0.3, metalness: 0.4})); front.position.set(TL.BUS_X, 1.75, 0.04); bus.add(front);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.2), new THREE.MeshBasicMaterial({color: col('#6c8fb8').multiplyScalar(0.5), toneMapped: false})); screen.position.set(TL.BUS_X, 2.35, 0.09); bus.add(screen);
    const hl = [-0.85, 0.85].map((dx) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), new THREE.MeshBasicMaterial({color: col('#fff6dc').multiplyScalar(3), toneMapped: false})); m.position.set(TL.BUS_X + dx, 0.75, 0.1); bus.add(m);
      const h = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({map: gtex, color: col('#fff2d0'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false})); h.position.set(TL.BUS_X + dx, 0.75, 0.14); bus.add(h); return m; });
    const beam = new THREE.SpotLight(col('#fff0d0'), 0, 60, 0.5, 0.6, 1.2); beam.position.set(TL.BUS_X, 0.8, 0.3); beam.target.position.set(TL.BUS_X - 1, 0, 25); bus.add(beam, beam.target);
    const roofLine = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, BL), new THREE.MeshBasicMaterial({color: col('#ffd9a0').multiplyScalar(0.8), toneMapped: false})); roofLine.position.set(TL.BUS_X + 1.32, 3.12, -BL / 2); bus.add(roofLine);
    void hl;

    // number boards (rooms 1..NUM_N), the new number (amber) and the two more left out after the shuffles
    const boardOf = (): Board => {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d')!;
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(TL.BOARD.w, TL.BOARD.h), new THREE.MeshBasicMaterial({map: tex, transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide}));
      mesh.rotation.y = TL.BOARD.phi; mesh.renderOrder = 4; root.add(mesh); return {mesh, g, tex, key: ''};
    };
    const boards = Array.from({length: TL.NUM_N}, boardOf);
    const amberBoards = [0, 1, 2].map(boardOf);
    // the end: an endless crowd of left-out numbers along the road (small amber glows, many per room)
    const NC = 5000;
    const crowd = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 0.3), new THREE.MeshBasicMaterial({map: gtex, color: AMB, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false}), NC);
    crowd.frustumCulled = false; crowd.renderOrder = 3; root.add(crowd);

    [pools, trails, crowd].forEach((m) => { for (let i = 0; i < m.count; i++) { m.setColorAt(i, C.setRGB(0, 0, 0)); hide(m, i); } });
    return {windows, pools, pls, no, noMat, vacMat, noHalo, signLight, bodies, heads, suitcase, trails, TRAIL, bus, bands, beam, boards, amberBoards, crowd, NC};
  }, [gl, scene]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.fov = TL.fovOf(c.mm); cam.near = 0.1; cam.far = 6000; cam.updateProjectionMatrix();
  cam.position.set(...c.pos); cam.lookAt(...c.look); cam.updateMatrixWorld();
  const camQ = cam.quaternion;

  // who stands where: guests and number boards set their room's window colour
  const occ = new Float32Array((TL.NR + 2) * 3);
  const setOcc = (r: number, cc: THREE.Color, k = 1) => { if (r >= 1 && r <= TL.NR) { occ[r * 3] = cc.r * k; occ[r * 3 + 1] = cc.g * k; occ[r * 3 + 2] = cc.b * k; } };
  let tr = 0;
  const trail = (x: number, y: number, z: number, cc: THREE.Color, a: number, s: number) => {
    if (a < 0.02) return; P.set(x, y, z); S.set(s, s, s); M.compose(P, camQ, S); W.trails.setMatrixAt(tr, M); C.copy(cc).multiplyScalar(a); W.trails.setColorAt(tr, C); tr++;
  };
  const kcol = [WARM, AMB, BLU];
  TL.GUESTS.forEach((gu, i) => {
    const p = TL.guestAt(gu, t);
    if (p.vis <= 0.001 || (gu.kind === 2 && t < gu.appear)) { hide(W.bodies, i); hide(W.heads, i); return; }
    const s = 0.4 + 0.6 * p.vis;
    put(W.bodies, i, p.x, p.y + 0.14, p.z, s, s, s); put(W.heads, i, p.x, p.y + 0.14, p.z, s, s, s);
    C.copy(kcol[gu.kind]).multiplyScalar(gu.kind === 0 ? 0.85 : 1.25); W.bodies.setColorAt(i, C); W.heads.setColorAt(i, C);
    if (p.settled) setOcc(TL.roomOf(p.x, p.z), gu.kind === 0 ? WARM : C.copy(WARM).lerp(kcol[gu.kind], 0.55));
    if (p.moving > 0.02) for (let k = 1; k <= W.TRAIL; k++) { const q = TL.guestAt(gu, t - k * 0.035); trail(q.x, q.y + 1.0, q.z, kcol[gu.kind], 0.5 * p.moving * (1 - k / (W.TRAIL + 1)) * p.vis, 0.9); }
    if (gu.kind === 1) { W.suitcase.visible = p.vis > 0.05 && t < TL.NEW_ARRIVE() + 0.3; W.suitcase.position.set(p.x, p.y + 0.36, p.z + 0.32); }
  });
  W.bodies.instanceMatrix.needsUpdate = W.heads.instanceMatrix.needsUpdate = true; W.bodies.instanceColor!.needsUpdate = W.heads.instanceColor!.needsUpdate = true;

  // number boards
  const boardFace = (b: Board, name: string, digits: string, hi: number, ink: string, hiInk: string, neq: number) => {
    const key = `${name}|${digits}|${hi}|${ink}|${neq.toFixed(2)}`;
    if (key !== b.key) { drawBoard(b.g, name, digits, hi, ink, hiInk, neq); b.tex.needsUpdate = true; b.key = key; }
  };
  W.boards.forEach((b, i) => {
    const n = i + 1, p = TL.boardAt(n, t);
    b.mesh.visible = p.vis > 0.01;
    if (!b.mesh.visible) return;
    b.mesh.position.set(p.x, TL.BOARD.y + p.y, p.z);
    const room = p.room;
    if (p.settled) setOcc(room, WARM, 1.05);
    // the diagonal: room k (k ≤ 8, before the shuffles) lifts its k-th digit; on the walk, the ≠ digit glows
    const k = n <= 8 && t < TL.SHUFFLES[0].t() ? n : 0;
    const hi = k && t >= TL.pickAt(k) - 0.05 ? k : 0;
    const neq = k ? TL.mismatch(k, t) : 0;
    boardFace(b, n <= 8 ? TL.DECIMALS[n - 1][0] : '', TL.numDigits(n), hi, '#F3EBDD', TL.AMBER, neq);
    if (p.moving > 0.02) for (let q = 1; q <= W.TRAIL; q++) { const pp = TL.boardAt(n, t - q * 0.035); trail(pp.x, TL.BOARD.y + pp.y, pp.z, WARM, 0.45 * p.moving * (1 - q / (W.TRAIL + 1)), 1.3); }
  });
  // the new number walks the row, then waits by the road; the shuffles leave two more beside it
  W.amberBoards.forEach((b, i) => {
    const on = i === 0 ? TL.walkerOn(t) : TL.leftOutOn(i, t);
    b.mesh.visible = on > 0.01 && t > TL.B.differs - 0.3; if (!b.mesh.visible) return;
    const home = TL.leftOutPos(i);
    let x = home[0], z = home[1], y = TL.BOARD.y + 0.35;
    if (i === 0) { const h = TL.walkerHome(t); x = TL.lerp(TL.WALK_X, home[0], h); z = TL.lerp(TL.walkerZ(t), home[1], h); y = TL.BOARD.y + TL.lerp(TL.WALK_Y, 0.35, h) + 0.6 * Math.sin(Math.PI * h); }
    else y += 0.5 * (1 - on);
    b.mesh.position.set(x, y, z); (b.mesh.material as THREE.MeshBasicMaterial).opacity = on;
    let neqHi = 0, neqA = 0;
    if (i === 0) for (let k = 1; k <= 8; k++) { const m = TL.mismatch(k, t); if (m > neqA) { neqA = m; neqHi = k; } }
    boardFace(b, i === 0 ? 'new number' : 'new number', TL.LEFT_DIGITS[i], neqA > 0.05 ? neqHi : 0, TL.AMBER, '#FFF3DC', neqA);
  });

  // windows, pools, the pulse on "endless rooms"
  for (let r = 1; r <= TL.NR; r++) {
    const pu = TL.pulse(r, t);
    C.setRGB(occ[r * 3], occ[r * 3 + 1], occ[r * 3 + 2]).multiplyScalar(1 + 1.6 * pu);
    W.windows.setColorAt(r - 1, C);
    const lit = Math.max(C.r, C.g, C.b);
    if (lit > 0.02) { put(W.pools, r - 1, 0.85, 0.15, TL.doorZ(r) - 1.5, 2.6, 1, 2.4); W.pools.setColorAt(r - 1, C.multiplyScalar(0.32)); } else hide(W.pools, r - 1);
  }
  W.windows.instanceColor!.needsUpdate = true; W.pools.instanceMatrix.needsUpdate = true; if (W.pools.instanceColor) W.pools.instanceColor.needsUpdate = true;
  // real lights on the six rooms nearest the point the camera looks at
  const r0 = Math.max(1, Math.round(-c.look[2] / TL.PITCH) - 1);
  W.pls.forEach((l, j) => { const r = r0 + j - 1; if (r < 1) { l.intensity = 0; return; } const k = Math.max(occ[r * 3], occ[r * 3 + 1], occ[r * 3 + 2]); l.color.setRGB(occ[r * 3], occ[r * 3 + 1], occ[r * 3 + 2]).multiplyScalar(1 / Math.max(k, 0.01)); l.intensity = 5 * k; l.position.set(1.0, 1.6, TL.doorZ(r) - 1.5); });

  // the sign
  const nl = TL.noLit(t);
  W.noMat.color.copy(NEON).multiplyScalar(0.12 + 2.8 * nl); (W.noHalo.material as THREE.MeshBasicMaterial).opacity = 0.55 * nl;
  W.signLight.intensity = 9 * nl;

  // the bus
  const fz = TL.busFront(t); W.bus.position.z = fz;
  W.bus.visible = fz > -255;
  const trip = TL.busTrip(t), e = TL.busEmpty(t);
  const op = (m: THREE.Mesh, v: number) => { (m.material as THREE.MeshBasicMaterial).opacity = v; m.visible = v > 0.01; };
  op(W.bands.g, trip === 1 ? 1 - e : 0); op(W.bands.ge, trip === 1 ? e : 0); op(W.bands.n, trip === 2 ? 1 - e : 0); op(W.bands.ne, trip === 2 ? e : 0);
  W.beam.intensity = W.bus.visible ? 60 : 0;
  // bus passengers sit in the bus until they leave: their figures are drawn only once out (above), the band shows them

  // the end: the left-out crowd fills the road to the horizon
  const cr = TL.crowd(t);
  for (let i = 0; i < W.NC; i++) {
    const z = 1.5 - 260 * Math.pow(i / W.NC, 1.4) * 1.0 - TL.hash(i, 4) * 0.8, a = TL.ramp(cr, Math.pow(i / W.NC, 0.6) * 0.8, Math.pow(i / W.NC, 0.6) * 0.8 + 0.2);
    if (a < 0.01) { hide(W.crowd, i); continue; }
    P.set(4.4 + TL.hash(i, 5) * 6.4, 1.0 + TL.hash(i, 6) * 1.6 + 0.4 * (1 - a), z); S.set(1.1, 1.1, 1.1); M.compose(P, camQ, S); W.crowd.setMatrixAt(i, M);
    W.crowd.setColorAt(i, C.copy(AMB).multiplyScalar(0.55 * a));
  }
  W.crowd.instanceMatrix.needsUpdate = true; if (W.crowd.instanceColor) W.crowd.instanceColor.needsUpdate = true;

  for (let k = tr; k < W.trails.count; k++) hide(W.trails, k);
  W.trails.instanceMatrix.needsUpdate = true; if (W.trails.instanceColor) W.trails.instanceColor.needsUpdate = true;
  return null;
};

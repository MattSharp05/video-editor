// ENIAC panel wall for the hook beat ("How did people write code before screens?").
// Units: 1 = 1 m. ENIAC panels were about 0.6 m wide and 2.4 m tall, black steel, with program
// trays (rows of jacks), rotary switches and neon indicator bulbs; programs were patch cables.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {random} from 'remotion';

export const C = {
  ground: '#100f0e',
  panel: '#1b1a19',
  steelEdge: '#3a3733',
  cable: '#0d0d0d',
  brass: '#8a7350',
  knob: '#141312',
  amber: '#ffb347',      // the thread: brightest, most saturated thing in frame
  amberDeep: '#a07020',  // sampled from the reference reels
  haze: '#2a221b',
};

const PANEL_W = 0.6, PANEL_H = 2.4, PANELS = 12;

function roughNoiseTexture(seed: string, base: number, spread: number) {
  const s = 256, cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d')!, img = ctx.createImageData(s, s);
  for (let i = 0; i < s * s; i++) {
    const n = base + (random(`${seed}${i}`) - 0.5) * spread;
    const v = Math.max(0, Math.min(255, n * 255));
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 8);
  return t;
}

// A hanging cable between two points: catenary-ish sag, tube with rounded plugs.
function cableCurve(a: THREE.Vector3, b: THREE.Vector3, sag: number, out: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const p = a.clone().lerp(b, t);
    p.y -= sag * 4 * t * (1 - t);
    p.z += out * Math.sin(Math.PI * Math.min(1, t * 1.15)) + 0.06 * Math.min(t, 1 - t) * 4;
    pts.push(p);
  }
  // leave the jack straight out from the panel
  pts[0] = a.clone(); pts.splice(1, 0, a.clone().add(new THREE.Vector3(0, 0, 0.07)));
  pts.splice(pts.length - 1, 0, b.clone().add(new THREE.Vector3(0, 0, 0.07)));
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

export const EniacSet: React.FC<{glow: number}> = ({glow}) => {
  const {gl, scene} = useThree();
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  scene.environment = env;
  scene.environmentIntensity = 0.12;
  scene.background = new THREE.Color(C.ground);
  scene.fog = new THREE.FogExp2(C.haze, 0.07);

  const built = useMemo(() => {
    const g = new THREE.Group();
    const rough = roughNoiseTexture('pr', 0.55, 0.25);
    const panelMat = new THREE.MeshPhysicalMaterial({color: C.panel, roughness: 0.55, roughnessMap: rough, metalness: 0.35, clearcoat: 0.3, clearcoatRoughness: 0.5});
    const edgeMat = new THREE.MeshStandardMaterial({color: C.steelEdge, roughness: 0.35, metalness: 0.8});
    const brassMat = new THREE.MeshStandardMaterial({color: C.brass, roughness: 0.3, metalness: 1});
    const holeMat = new THREE.MeshStandardMaterial({color: '#050505', roughness: 0.9});
    const knobMat = new THREE.MeshPhysicalMaterial({color: C.knob, roughness: 0.25, clearcoat: 1});
    const pointerMat = new THREE.MeshStandardMaterial({color: '#d8d2c4', roughness: 0.4});
    const bulbMat = new THREE.MeshPhysicalMaterial({color: '#5a3a28', roughness: 0.15, transmission: 0.2, emissive: '#ff6a2a', emissiveIntensity: 0.06});
    const cableMat = new THREE.MeshPhysicalMaterial({color: C.cable, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.4});
    const plugMat = new THREE.MeshStandardMaterial({color: '#2b2824', roughness: 0.35, metalness: 0.6});

    // jacks positions per panel (program trays: 2 rows of 12, 3 blocks down the panel)
    const jackGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.012, 20).rotateX(Math.PI / 2);
    const holeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.013, 12).rotateX(Math.PI / 2);
    const knobGeo = new THREE.CylinderGeometry(0.022, 0.026, 0.03, 28).rotateX(Math.PI / 2);
    const pointerGeo = new THREE.BoxGeometry(0.004, 0.02, 0.004);
    const bulbGeo = new THREE.SphereGeometry(0.008, 12, 8);
    const jacks: THREE.Vector3[][] = [];
    const jackList: THREE.Matrix4[] = [], knobList: THREE.Matrix4[] = [], bulbList: THREE.Matrix4[] = [];
    for (let p = 0; p < PANELS; p++) {
      const x0 = (p - 4) * (PANEL_W + 0.01);
      const box = new THREE.Mesh(new THREE.BoxGeometry(PANEL_W, PANEL_H, 0.12), panelMat);
      box.position.set(x0, PANEL_H / 2, -0.06); g.add(box);
      // frame rails and panel seams
      for (const sx of [-1, 1]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.018, PANEL_H, 0.02), edgeMat);
        rail.position.set(x0 + sx * (PANEL_W / 2 - 0.009), PANEL_H / 2, 0.005); g.add(rail);
      }
      for (const y of [0.42, 1.12, 1.8, 2.32]) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(PANEL_W - 0.03, 0.012, 0.016), edgeMat);
        bar.position.set(x0, y, 0.004); g.add(bar);
      }
      const pj: THREE.Vector3[] = [];
      for (const by of [0.6, 0.86]) for (let i = 0; i < 12; i++) {
        const v = new THREE.Vector3(x0 - 0.25 + i * (0.5 / 11), by, 0.006);
        pj.push(v); jackList.push(new THREE.Matrix4().makeTranslation(v.x, v.y, v.z));
      }
      // rotary switches block
      for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) {
        const v = new THREE.Vector3(x0 - 0.2 + i * 0.1, 1.3 + r * 0.13, 0.015);
        const m = new THREE.Matrix4().makeTranslation(v.x, v.y, v.z);
        knobList.push(m);
        const ptr = new THREE.Mesh(pointerGeo, pointerMat);
        ptr.position.set(v.x, v.y + 0.006, v.z + 0.016);
        ptr.rotation.z = (random(`k${p}${r}${i}`) - 0.5) * 2.4; g.add(ptr);
      }
      // neon bulbs grid (accumulator style)
      for (let r = 0; r < 4; r++) for (let i = 0; i < 10; i++)
        bulbList.push(new THREE.Matrix4().makeTranslation(x0 - 0.225 + i * 0.05, 1.95 + r * 0.06, 0.01));
      jacks.push(pj);
    }
    const inst = (geo: THREE.BufferGeometry, mat: THREE.Material, list: THREE.Matrix4[]) => {
      const m = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach((x, i) => m.setMatrixAt(i, x)); g.add(m);
    };
    inst(jackGeo, brassMat, jackList); inst(holeGeo, holeMat, jackList.map((m) => m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.001))));
    inst(knobGeo, knobMat, knobList); inst(bulbGeo, bulbMat, bulbList);

    // program cables: black cables looping between jacks on neighbouring panels
    const plugGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.06, 18).rotateX(Math.PI / 2);
    const addPlug = (v: THREE.Vector3, mat: THREE.Material) => {
      const pl = new THREE.Mesh(plugGeo, mat); pl.position.set(v.x, v.y, v.z + 0.03); g.add(pl);
    };
    for (let k = 0; k < 40; k++) {
      const pa = Math.floor(random(`ca${k}`) * (PANELS - 1));
      const pb = Math.min(PANELS - 1, pa + 1 + Math.floor(random(`cb${k}`) * 2));
      if (pa === 5 && k % 3 === 0) continue; // keep the hero area readable
      const a = jacks[pa][Math.floor(random(`ja${k}`) * 24)], b = jacks[pb][Math.floor(random(`jb${k}`) * 24)];
      const curve = cableCurve(a, b, 0.25 + random(`s${k}`) * 0.55, 0.05 + random(`o${k}`) * 0.12);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.008, 10), cableMat));
      addPlug(a, plugMat); addPlug(b, plugMat);
    }

    // floor: dark worn concrete with a soft sheen
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshPhysicalMaterial({color: '#141210', roughness: 0.7, roughnessMap: rough, specularIntensity: 0.3}));
    floor.rotation.x = -Math.PI / 2; g.add(floor);

    // the hero cable: amber-cored, plugged from a hand-held plug toward a jack on panel 1
    const target = jacks[5][17];
    const heroCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(target.x + 0.55, 0.15, 0.7),
      new THREE.Vector3(target.x + 0.42, 0.42, 0.5),
      new THREE.Vector3(target.x + 0.2, 0.7, 0.3),
      new THREE.Vector3(target.x + 0.05, 0.84, 0.14),
      new THREE.Vector3(target.x, target.y, 0.075),
    ], false, 'centripetal');
    return {g, heroCurve, target, plugMat};
  }, []);

  const hero = useMemo(() => {
    const h = new THREE.Group();
    const core = new THREE.MeshStandardMaterial({color: '#ff8a10', emissive: '#ff7a00', emissiveIntensity: 1.5, roughness: 0.4});
    const sheath = new THREE.MeshPhysicalMaterial({color: '#ff9a30', roughness: 0.25, transparent: true, opacity: 0.18, depthWrite: false});
    h.add(new THREE.Mesh(new THREE.TubeGeometry(built.heroCurve, 120, 0.0055, 12), core));
    h.add(new THREE.Mesh(new THREE.TubeGeometry(built.heroCurve, 120, 0.0095, 16), sheath));
    const plug = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.06, 20).rotateX(Math.PI / 2), built.plugMat);
    plug.position.set(built.target.x, built.target.y, built.target.z + 0.03); h.add(plug);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.015, 0.003, 10, 30), new THREE.MeshStandardMaterial({emissive: C.amber, emissiveIntensity: 1.4, color: '#000'}));
    ring.position.set(built.target.x, built.target.y, built.target.z + 0.002); h.add(ring);
    return h;
  }, [built]);

  // Emissive light is physical: point lights along the cable light the panel around it.
  const lightPts = [0.15, 0.45, 0.75, 0.98].map((t) => built.heroCurve.getPoint(t));
  return (
    <>
      <primitive object={built.g} />
      <primitive object={hero} />
      {lightPts.map((p, i) => (
        <pointLight key={i} position={[p.x, p.y, p.z + 0.02]} color={C.amber} intensity={0.45 * glow * (i === 3 ? 0.6 : 1)} distance={0.9} decay={2} />
      ))}
      {/* warm rim from upper back-right, cool faint fill from the camera side */}
      <spotLight position={[6, 4.5, -1.5]} angle={0.5} penumbra={1} intensity={22} color={'#ffcf9a'} distance={14} decay={2} />
      <directionalLight position={[-2, 3, 4]} intensity={0.25} color={'#9fb2c8'} />
      <hemisphereLight args={['#4a3c30', '#0a0908', 0.6]} />
      <spotLight position={[-1.5, 3.2, 2.2]} angle={0.6} penumbra={1} intensity={45} color={'#ffe2c0'} distance={8} decay={2} />
    </>
  );
};

export const heroJack = () => ({x: 1 * (PANEL_W + 0.01) - 0.25 + 5 * (0.5 / 11), y: 0.86});

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

const PANEL_W = 0.6, PANEL_H = 2.4, PANELS = 16, CABLE_PANELS = 12;
const jackAt = (panel: number, i: number) => new THREE.Vector3((panel - 4) * (PANEL_W + 0.01) - 0.25 + i * (0.5 / 11), 0.86, 0.075);
export const J1 = jackAt(5, 5);  // the hook's jack (where the first hand plugs in)
export const J2 = jackAt(7, 6);  // the far end of the thread

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

export const EniacSet: React.FC<{glow: number; fill?: number}> = ({glow, fill = 0}) => {
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
      const pa = Math.floor(random(`ca${k}`) * (CABLE_PANELS - 1)); // fixed at 12 so the approved hook keeps its cables
      const pb = Math.min(CABLE_PANELS - 1, pa + 1 + Math.floor(random(`cb${k}`) * 2));
      if (pa === 5 && k % 3 === 0) continue; // keep the hero area readable
      const a = jacks[pa][Math.floor(random(`ja${k}`) * 24)], b = jacks[pb][Math.floor(random(`jb${k}`) * 24)];
      const curve = cableCurve(a, b, 0.25 + random(`s${k}`) * 0.55, 0.05 + random(`o${k}`) * 0.12);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.008, 10), cableMat));
      addPlug(a, plugMat); addPlug(b, plugMat);
    }

    // floor: dark worn concrete with a soft sheen
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshPhysicalMaterial({color: '#141210', roughness: 0.7, roughnessMap: rough, specularIntensity: 0.3}));
    floor.rotation.x = -Math.PI / 2;
    // ENIAC stood in a U: the end row faces down the room, closing the far end of the shot.
    const endRow = g.clone(); endRow.rotation.y = -Math.PI / 2; endRow.position.set(7.0, 0, 2.9);
    const room = new THREE.Group(); room.add(g, endRow, floor);

    // the hero cable: amber-cored, plugged from a hand-held plug toward a jack on panel 1
    const target = jacks[5][17];
    // The thread: one program connection from the hook's jack (J1) along the wall to a jack four
    // panels away (J2). Leaves J1 toward the camera and down, as the approved hook frame shows.
    const heroCurve = new THREE.CatmullRomCurve3([
      J1.clone(), new THREE.Vector3(J1.x + 0.003, J1.y - 0.002, 0.11),
      new THREE.Vector3(0.66, 0.78, 0.26), new THREE.Vector3(0.85, 0.5, 0.4), new THREE.Vector3(1.15, 0.22, 0.45),
      new THREE.Vector3(1.55, 0.12, 0.42), new THREE.Vector3(1.95, 0.22, 0.32), new THREE.Vector3(J2.x - 0.12, 0.58, 0.18),
      new THREE.Vector3(J2.x - 0.005, J2.y - 0.03, 0.11), J2.clone(),
    ], false, 'centripetal');
    return {g: room, heroCurve, target, plugMat};
  }, []);

  const hero = useMemo(() => {
    const h = new THREE.Group();
    const core = new THREE.MeshStandardMaterial({color: '#ff8a10', emissive: '#ff7a00', emissiveIntensity: 1.5, roughness: 0.4});
    const sheath = new THREE.MeshPhysicalMaterial({color: '#ff9a30', roughness: 0.25, transparent: true, opacity: 0.18, depthWrite: false});
    h.add(new THREE.Mesh(new THREE.TubeGeometry(built.heroCurve, 600, 0.0055, 12), core));
    h.add(new THREE.Mesh(new THREE.TubeGeometry(built.heroCurve, 600, 0.0095, 16), sheath));
    const ringMat = new THREE.MeshStandardMaterial({emissive: C.amber, emissiveIntensity: 1.4, color: '#000'});
    for (const j of [J1, J2]) {
      const plug = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.06, 20).rotateX(Math.PI / 2), built.plugMat);
      plug.position.set(j.x, j.y, j.z - 0.045); h.add(plug);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.015, 0.003, 10, 30), ringMat);
      ring.position.set(j.x, j.y, 0.008); h.add(ring);
    }
    return h;
  }, [built]);

  // Emissive light is physical: point lights along the cable light the panel around it.
  // Overhead fill along the wall; each spot needs its target in the scene to aim.
  const fillLights = useMemo(() => [-1.2, 0.6, 2.4, 4.2].flatMap((x) => {
    const sp = new THREE.SpotLight('#f3dcc0', 0, 6, 0.75, 1, 2);
    sp.position.set(x, 3.4, 1.4); sp.target.position.set(x, 1.0, 0);
    return [sp, sp.target];
  }), []);
  fillLights.forEach((l) => { if ((l as THREE.SpotLight).isSpotLight) (l as THREE.SpotLight).intensity = fill * 6; });
  // Spaced by arc length; the two nearest each jack stay dim so the hand isn't burnt out.
  const lightPts = [0.004, 0.03, 0.07, 0.16, 0.28, 0.4, 0.52, 0.64, 0.76, 0.88, 0.96, 0.995].map((t) => built.heroCurve.getPointAt(t));
  return (
    <>
      <primitive object={built.g} />
      <primitive object={hero} />
      {lightPts.map((p, i) => (
        <pointLight key={i} position={[p.x, p.y, p.z + 0.02]} color={C.amber} intensity={0.3 * glow * (i === 0 || i === lightPts.length - 1 ? 0.35 : 1)} distance={0.9} decay={2} />
      ))}
      {/* warm rim from upper back-right, cool faint fill from the camera side */}
      <spotLight position={[6, 4.5, -1.5]} angle={0.5} penumbra={1} intensity={22} color={'#ffcf9a'} distance={14} decay={2} />
      <directionalLight position={[-2, 3, 4]} intensity={0.25} color={'#9fb2c8'} />
      <hemisphereLight args={['#4a3c30', '#0a0908', 0.6]} />
      {/* soft overhead fill along the wall, so the upper panels read (switches, bulbs) */}
      {fill > 0 && fillLights.map((l, i) => <primitive key={i} object={l} />)}
      <spotLight position={[-1.5, 3.2, 2.2]} angle={0.6} penumbra={1} intensity={45} color={'#ffe2c0'} distance={8} decay={2} />
    </>
  );
};



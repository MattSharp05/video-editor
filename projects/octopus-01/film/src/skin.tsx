// The skin up close: a block of octopus skin in three layers, drawn at a scale where one colour sac is ~1 unit.
// Top: chromatophore sacs (yellow, red, brown; elastic discs) each ringed by radial muscles like bike spokes; a nerve
// from the brain branches to the muscles and carries a spark. Middle: iridophores, stacks of thin plates that bounce
// back blue-green (thin-film colour, view dependent). Bottom: leucophores, white round cells that take the colour of
// whatever light falls on them. Light: a beam that can hit the plates (comes back blue-green) and a coloured lamp
// over the white cells. Everything is a pure function of the state passed in.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {N3} from './glsl';

export const SAC_Y = 0, IRID_Y = -1.6, LEUCO_Y = -3.1;  // layer heights (sac layer at y = 0)
const GRID = 9, SP = 2.2;                               // sacs on a jittered grid, spacing SP
export type Sac = {x: number; z: number; type: number; seed: number};
export const SACS: Sac[] = (() => {
  const out: Sac[] = []; let s = 12345;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = -GRID; i <= GRID; i++) for (let j = -GRID; j <= GRID; j++) {
    const x = i * SP + (j % 2) * SP * 0.5 + (rnd() - 0.5) * 0.6, z = j * SP * 0.88 + (rnd() - 0.5) * 0.6;
    const r = rnd(); out.push({x, z, type: r < 0.3 ? 0 : r < 0.68 ? 1 : 2, seed: rnd()});
  }
  return out;
})();
export const HERO = SACS.reduce((b, s, i) => (Math.hypot(s.x, s.z) < Math.hypot(SACS[b].x, SACS[b].z) ? i : b), 0); // the sac nearest the centre
export const SAC_COL = ['#f2b51e', '#c8381f', '#4a2412'];

export type SkinState = {
  t: number;
  open: (i: number, s: Sac) => number;   // 0 = a dot, 1 = wide open
  spark: number;                          // 0..1 along the nerve (from the brain to the muscles), <0 off
  nerve: number;                          // nerve visibility 0..1
  plates: number;                         // iridophore layer visibility
  beam: number;                           // the light beam onto the plates 0..1
  leuco: number;                          // leucophore layer visibility
  lamp: THREE.Color;                      // colour of the light falling on the white cells
  lampOn: number;
  cut: number;                            // 0 = only the top surface, 1 = cut open to show all layers
  glowLayer: [number, number, number];    // recap: flash sacs, plates, white cells
  place?: (i: number, s: Sac) => [number, number, number]; // override a sac's position (lifted heroes)
  beamAt: [number, number];               // x, z where the beam hits the plates
  recap?: boolean;
};

// a sac: a lens-shaped blob; radius r grows as it opens and it thins (volume about constant)
const sacGeo = new THREE.SphereGeometry(1, 28, 14);
const SPOKES = 10;
const spokeGeo = (() => { const g = new THREE.CylinderGeometry(0.035, 0.05, 1, 6, 1); g.translate(0, 0.5, 0); g.rotateZ(-Math.PI / 2); return g; })(); // along +x, length 1

const plateMaterial = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.NormalBlending,
  uniforms: {uOn: {value: 0}, uBeam: {value: 0}, uTime: {value: 0}, uGlow: {value: 0}, uAt: {value: new THREE.Vector2()}},
  vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix * instanceMatrix) * normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: /* glsl */`uniform float uOn, uBeam, uTime, uGlow; uniform vec2 uAt; varying vec3 vN; varying vec3 vV; varying vec3 vW;
    void main(){ float ndv = abs(dot(normalize(vN), normalize(vV)));
      vec3 ir = 0.5 + 0.5 * cos(6.2831 * (ndv * 0.9 + vec3(0.62, 0.72, 0.86)));      // thin-film: blue-green-violet
      ir = mix(vec3(0.1, 0.8, 0.75), ir, 0.4);
      float hot = exp(-pow(length(vW.xz - uAt) / 2.6, 2.0)) * uBeam;
      vec3 c = ir * (0.55 + 0.5 * hot + 0.8 * uGlow);
      gl_FragColor = vec4(c, uOn * (0.6 + 0.2 * hot));
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});
const leucoMaterial = () => {
  const m = new THREE.MeshStandardMaterial({color: '#cfcac0', roughness: 0.9, transparent: true});
  return m;
};

export const SkinBlock: React.FC<{s: SkinState}> = ({s}) => {
  const P = useMemo(() => {
    const sacMats = SAC_COL.map((c) => new THREE.MeshStandardMaterial({color: c, roughness: 0.45, emissive: new THREE.Color(c), emissiveIntensity: 0.12}));
    const muscle = new THREE.MeshStandardMaterial({color: '#e7a0a0', roughness: 0.6});
    const sacs = SAC_COL.map((_, k) => { const m = new THREE.InstancedMesh(sacGeo, sacMats[k], SACS.length); m.frustumCulled = false; return m; });
    const spokes = new THREE.InstancedMesh(spokeGeo, muscle, SACS.length * SPOKES); spokes.frustumCulled = false;
    // the skin's top: a soft translucent dermis plane
    const dermis = new THREE.MeshStandardMaterial({color: '#f3d6c2', roughness: 0.7, transparent: true, opacity: 0.0, depthWrite: false});
    // iridophore stacks: groups of 7 thin plates
    const pl = plateMaterial();
    const plateG = new THREE.BoxGeometry(1.8, 0.05, 1.2);
    const NST = 70, stacks: THREE.Matrix4[] = [];
    let rs = 777; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < NST; k++) {
      const x = (rnd() - 0.5) * 34, z = (rnd() - 0.5) * 30, rot = rnd() * Math.PI, tilt = (rnd() - 0.5) * 0.5;
      for (let j = 0; j < 7; j++) stacks.push(new THREE.Matrix4().compose(new THREE.Vector3(x, IRID_Y + j * 0.11, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, rot, tilt * 0.5)), new THREE.Vector3(1, 1, 1)));
    }
    const plates = new THREE.InstancedMesh(plateG, pl, stacks.length); stacks.forEach((m, i) => plates.setMatrixAt(i, m)); plates.frustumCulled = false;
    // leucophores: clusters of round white cells
    const lm = leucoMaterial(), lg = new THREE.IcosahedronGeometry(0.42, 2), NL = 520;
    const leucos = new THREE.InstancedMesh(lg, lm, NL);
    for (let k = 0; k < NL; k++) { const x = (rnd() - 0.5) * 36, z = (rnd() - 0.5) * 32 - 3, sc = 0.6 + rnd() * 0.7;
      leucos.setMatrixAt(k, new THREE.Matrix4().compose(new THREE.Vector3(x, LEUCO_Y + (rnd() - 0.5) * 0.35, z), new THREE.Quaternion(), new THREE.Vector3(sc, sc * 0.8, sc))); }
    leucos.frustumCulled = false;
    // the nerve: from far away (toward the brain, -x and down) to the hero sac, branching to its neighbours' muscles
    const H = SACS[HERO];
    const trunk = new THREE.CatmullRomCurve3([new THREE.Vector3(-21, -0.9, -8.5), new THREE.Vector3(-14, -0.7, -5), new THREE.Vector3(-7, -0.5, -2), new THREE.Vector3(H.x - 1.6, -0.35, H.z - 0.6)]);
    const branches = SACS.map((q, i) => ({i, d: Math.hypot(q.x - H.x, q.z - H.z)})).filter((q) => q.d < 7.5).map(({i}) => {
      const q = SACS[i], a = trunk.getPoint(1);
      return new THREE.CatmullRomCurve3([a, a.clone().lerp(new THREE.Vector3(q.x, -0.3, q.z), 0.5).add(new THREE.Vector3(0, -0.15, 0)), new THREE.Vector3(q.x - 0.9, -0.15, q.z - 0.2)]);
    });
    const nerveM = new THREE.MeshStandardMaterial({color: '#fff2c8', emissive: new THREE.Color('#ffd27a'), emissiveIntensity: 0.4, roughness: 0.5, transparent: true, fog: false});
    const brainM = new THREE.MeshBasicMaterial({color: '#ffe3a8', transparent: true, fog: false});
    const trunkG = new THREE.TubeGeometry(trunk, 160, 0.1, 8), brG = branches.map((c) => new THREE.TubeGeometry(c, 30, 0.07, 6));
    const sparkM = new THREE.MeshBasicMaterial({color: '#fff6d0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false});
    const beamM = new THREE.MeshBasicMaterial({color: '#cfeeff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false});
    const backM = new THREE.MeshBasicMaterial({color: '#4fe0d0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false});
    return {brainM, sacMats, sacs, spokes, dermis, plates, pl, leucos, lm, trunk, branches, trunkG, brG, nerveM, sparkM, beamM, backM};
  }, []);
  // per frame: sac sizes and spoke positions
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const counts = [0, 0, 0];
  SACS.forEach((sac, i) => {
    const o = Math.max(0, Math.min(1, s.open(i, sac)));
    const r = 0.22 + 0.78 * o, th = 0.22 / Math.sqrt(0.4 + 0.6 * o);
    const k = sac.type, n = counts[k]++;
    const [px, py, pz] = s.place ? s.place(i, sac) : [sac.x, 0, sac.z];
    m4.compose(v.set(px, SAC_Y + 0.05 + py, pz), q.identity(), sc.set(r, th * 0.9, r * 0.92));
    P.sacs[k].setMatrixAt(n, m4);
    // spokes from the sac's rim out to an anchor ring at radius 1.05: they shorten as the sac opens
    for (let j = 0; j < SPOKES; j++) {
      const a = (j / SPOKES) * Math.PI * 2 + sac.seed * 3, R1 = 1.08;
      const len = Math.max(0.04, R1 - r), cx = px + Math.cos(a) * r, cz = pz + Math.sin(a) * r * 0.92;
      m4.compose(v.set(cx, SAC_Y + 0.02 + py, cz), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a), sc.set(len, 1 + 0.6 * o, 1 + 0.6 * o));
      P.spokes.setMatrixAt(i * SPOKES + j, m4);
    }
  });
  P.sacs.forEach((m, k) => { m.count = counts[k]; m.instanceMatrix.needsUpdate = true; });
  P.spokes.instanceMatrix.needsUpdate = true;
  P.sacMats.forEach((m) => (m.emissiveIntensity = 0.12 + 0.9 * s.glowLayer[0]));
  P.pl.uniforms.uOn.value = s.plates; P.pl.uniforms.uBeam.value = s.beam; P.pl.uniforms.uTime.value = s.t; P.pl.uniforms.uGlow.value = s.glowLayer[1]; P.pl.uniforms.uAt.value.set(s.beamAt[0], s.beamAt[1]);
  P.lm.opacity = s.leuco;  P.lm.emissive = s.lamp.clone().multiplyScalar(0.32 * s.lampOn + 0.4 * s.glowLayer[2]);
  P.nerveM.opacity = s.nerve; P.beamM.opacity = 0.22 * s.beam; P.backM.opacity = 0.45 * s.beam; P.brainM.opacity = s.nerve; P.nerveM.emissiveIntensity = 0.3 + 0.6 * s.nerve;
  // the spark: a bright bead running the trunk, then all branches at once
  const sp = s.spark, onTrunk = sp >= 0 && sp < 0.75, onBr = sp >= 0.75 && sp <= 1.0;
  const bead = onTrunk ? P.trunk.getPoint(sp / 0.75) : null;
  return (
    <group>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 12, 6]} intensity={1.8} color="#fff4e0" />
      <directionalLight position={[-6, 4, -8]} intensity={0.5} color="#9fe0ff" />
      {s.lampOn > 0 && <pointLight position={[0, LEUCO_Y + 2.2, 0]} color={s.lamp} intensity={3 * s.lampOn} distance={14} decay={2} />}
      {P.sacs.map((m, k) => <primitive key={k} object={m} />)}
      <group visible={s.glowLayer[0] + s.glowLayer[1] + s.glowLayer[2] === 0 && !s.recap}><primitive object={P.spokes} /></group>
      {/* the dermis surface sits just above the sacs; cut open it pulls back to show the layers below */}
      <mesh position={[0, SAC_Y + 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} material={P.dermis}><planeGeometry args={[60, 60]} /></mesh>
      <group visible={s.plates > 0.01}><primitive object={P.plates} /></group>
      <group visible={s.leuco > 0.01}><primitive object={P.leucos} /></group>
      <group visible={s.nerve > 0.01}>
        <mesh geometry={P.trunkG} material={P.nerveM} />
        <mesh position={[-22.5, -0.9, -9]} material={P.brainM}><icosahedronGeometry args={[1.8, 3]} /></mesh>
        {P.brG.map((g, k) => <mesh key={k} geometry={g} material={P.nerveM} />)}
      </group>
      {bead && <mesh position={bead} material={P.sparkM}><sphereGeometry args={[0.45, 16, 12]} /></mesh>}
      {onBr && P.branches.map((c, k) => <mesh key={k} position={c.getPoint((sp - 0.75) / 0.25)} material={P.sparkM}><sphereGeometry args={[0.25, 12, 8]} /></mesh>)}
      {/* the light beam onto the plates and the blue-green light that comes back */}
      {s.beam > 0.01 && <>
        <mesh position={[s.beamAt[0] - 1.25, (IRID_Y + 9) / 2, s.beamAt[1]]} rotation={[0, 0, 0.28]} material={P.beamM}><cylinderGeometry args={[0.35, 0.35, 9 - IRID_Y, 16, 1, true]} /></mesh>
        <mesh position={[s.beamAt[0] + 1.25, (IRID_Y + 9) / 2 + 0.2, s.beamAt[1]]} rotation={[0, 0, -0.28]} material={P.backM}><cylinderGeometry args={[0.4, 0.4, 9 - IRID_Y, 16, 1, true]} /></mesh>
      </>}
    </group>
  );
};

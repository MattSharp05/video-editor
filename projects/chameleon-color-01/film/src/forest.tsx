// The rainforest set: a mossy branch rising to the right (the chameleon's), broad leaves near and far, hanging vines,
// a soft sunlit canopy behind (gradient dome + bokeh) and green haze. Units: metres. The set lives in the RIG frame:
// x along the branch, y up, z toward camera; the rig is rolled so the branch climbs across the 9:16 frame.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {N3} from './glsl';
import {BUMP} from './kit/water/glsl';
import {tube, BRANCH_Y, BRANCH_R} from './chameleon';
import {rng} from './kit/realism/noise';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export const ROLL = 0.42;

// ---------- branch: bark with moss on top ----------
const barkMaterial = () => {
  const m = new THREE.MeshStandardMaterial({roughness: 0.85, side: THREE.DoubleSide});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 aRest; varying vec3 vRest;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = aRest;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vRest;\n${N3}\n${BUMP}\nfloat bH;`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', /* glsl */`
        vec3 R = vRest;
        float ridges = fbm3(vec3(R.x * 40.0, R.y * 260.0, R.z * 260.0));
        float fine = vn3(R * 900.0);
        vec3 bark = mix(vec3(0.07, 0.045, 0.028), vec3(0.2, 0.14, 0.09), ridges) * (0.85 + 0.3 * fine);
        float upFace = smoothstep(${(BRANCH_Y + BRANCH_R * 0.3).toFixed(4)}, ${(BRANCH_Y + BRANCH_R * 0.95).toFixed(4)}, R.y + 0.012 * fbm3(R * 90.0));
        float moss = upFace * smoothstep(0.45, 0.6, fbm3(R * 35.0 + 3.0));
        vec3 col = mix(bark, vec3(0.1, 0.25, 0.04) * (0.7 + 0.6 * vn3(R * 1400.0)), moss);
        bH = ridges * 0.002 + moss * fine * 0.0012;
        vec4 diffuseColor = vec4(col, opacity);`)
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = wbump(-vViewPosition, normal, bH, 1.0);');
  };
  m.customProgramCacheKey = () => 'bark';
  return m;
};

// ---------- leaves: a bent card cut to a pointed broad leaf, veins in the shader ----------
const leafGeometry = (() => {
  const g = new THREE.PlaneGeometry(1, 1, 10, 14);
  g.translate(0, 0.5, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, 0.22 * x * x - 0.18 * y * y + 0.05 * y);   // cupped across, drooping toward the tip
  }
  g.computeVertexNormals();
  return g;
})();
const leafMaterial = (o: {translucent?: number} = {}) => {
  const m = new THREE.MeshStandardMaterial({roughness: 0.55, side: THREE.DoubleSide, alphaTest: 0.5});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vLu;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLu = uv;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec2 vLu;\n${N3}`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', /* glsl */`
        vec2 p = vec2(vLu.x * 2.0 - 1.0, vLu.y);
        float w = 0.62 * pow(max(0.0, sin(3.14159 * pow(p.y, 0.8))), 0.85);
        float a = step(abs(p.x), w) * step(0.02, p.y);
        float mid = 1.0 - smoothstep(0.006, 0.02, abs(p.x));
        float lat = 1.0 - smoothstep(0.0, 0.05, abs(fract((p.y - abs(p.x) * 0.9) * 7.0) - 0.5) - 0.42);
        vec3 col = diffuse * (0.85 + 0.25 * vn3(vec3(vLu * 40.0, 1.0)));
        col = mix(col, col * 1.6 + vec3(0.04, 0.05, 0.0), max(mid, lat * 0.45) * step(0.05, p.y));
        vec4 diffuseColor = vec4(col, a);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * ${(o.translucent ?? 0.35).toFixed(2)} * vec3(0.9, 1.0, 0.5);`);
  };
  m.customProgramCacheKey = () => 'leaf' + (o.translucent ?? 0.35);
  return m;
};
type LeafSpot = {p: THREE.Vector3; s: number; rot: THREE.Euler; c: string};
const Leaves: React.FC<{spots: LeafSpot[]; translucent?: number; fog?: boolean}> = ({spots, translucent, fog = true}) => {
  const mesh = useMemo(() => {
    const m = leafMaterial({translucent});
    m.fog = fog;
    const im = new THREE.InstancedMesh(leafGeometry, m, spots.length);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion();
    spots.forEach((s, i) => {
      M.compose(s.p, q.setFromEuler(s.rot), V(s.s * 0.55, s.s, s.s));
      im.setMatrixAt(i, M);
      im.setColorAt(i, new THREE.Color(s.c));
    });
    im.castShadow = true; im.receiveShadow = true;
    return im;
  }, [spots, translucent, fog]);
  return <primitive object={mesh} />;
};

// ---------- the canopy behind: a gradient dome, bokeh, vines ----------
const domeMaterial = () => new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: {uTop: {value: new THREE.Color('#e8f6b0')}, uMid: {value: new THREE.Color('#5fae4a')}, uBot: {value: new THREE.Color('#123a1c')}},
  vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: /* glsl */`uniform vec3 uTop, uMid, uBot; varying vec3 vD;
    void main(){ float h = vD.y; vec3 c = mix(uMid, uTop, smoothstep(0.0, 0.75, h)); c = mix(c, uBot, smoothstep(0.0, -0.6, h));
      float sun = pow(max(0.0, dot(vD, normalize(vec3(-0.35, 0.75, -0.55)))), 6.0); c += vec3(1.0, 0.95, 0.7) * sun * 0.9;
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }`,
});
const Bokeh: React.FC<{seed?: number; n?: number}> = ({seed = 3, n = 70}) => {
  const mesh = useMemo(() => {
    const r = rng(seed);
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec2 vU; void main(){ float d = length(vU - 0.5) * 2.0; float a = smoothstep(1.0, 0.82, d) * (0.55 + 0.45 * smoothstep(0.6, 0.95, d)); gl_FragColor = vec4(vec3(1.0, 0.97, 0.75) * a * 0.32, 1.0); }',
    });
    const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), mat, n);
    const M = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const s = 0.06 + 0.22 * r();
      M.compose(V(-2.4 + 4.8 * r(), -0.6 + 2.6 * r(), -2.5 - 2.5 * r()), new THREE.Quaternion(), V(s, s, s));
      im.setMatrixAt(i, M);
    }
    return im;
  }, [seed, n]);
  return <primitive object={mesh} />;
};

// leaf layout (rig frame): a twig by the head, leaves around the branch, a far canopy wall, near out-of-focus ones
const leafSpots = () => {
  const r = rng(11), near: LeafSpot[] = [], mid: LeafSpot[] = [], far: LeafSpot[] = [];
  const greens = ['#3f8f2a', '#4fa232', '#2f7a22', '#5cb03a', '#6cbd3f'];
  const pick = () => greens[Math.floor(r() * greens.length)];
  // twig leaves near the head and around the branch
  const twig: [number, number, number, number, number][] = [
    [0.37, -0.05, -0.03, 0.12, 0.6], [0.42, -0.02, 0.01, 0.1, -0.4], [0.46, 0.0, -0.04, 0.13, 0.9], [0.33, -0.1, -0.05, 0.11, 2.6],
    [-0.12, -0.09, -0.06, 0.12, 2.2], [-0.2, -0.1, -0.02, 0.14, 0.4], [0.6, -0.09, -0.05, 0.13, -0.9], [0.75, -0.1, -0.03, 0.15, 0.5],
  ];
  for (const [x, y, z, s, a] of twig) mid.push({p: V(x, y, z), s, rot: new THREE.Euler(-1.2 + r() * 0.6, r() * 1.0 - 0.5, a), c: pick()});
  for (let i = 0; i < 70; i++) {
    const x = -1.0 + 2.4 * r(), y = -0.7 + 1.5 * r(), z = -0.35 - 0.9 * r();
    mid.push({p: V(x, y, z), s: 0.12 + 0.12 * r(), rot: new THREE.Euler(-0.6 + r() * 1.2, r() * 2 - 1, r() * Math.PI * 2), c: pick()});
  }
  for (let i = 0; i < 160; i++) {
    const x = -2.4 + 5.0 * r(), y = -1.2 + 2.6 * r(), z = -1.4 - 1.6 * r();
    far.push({p: V(x, y, z), s: 0.18 + 0.2 * r(), rot: new THREE.Euler(-0.4 + r() * 0.8, r() * 2 - 1, r() * Math.PI * 2), c: pick()});
  }
  const nearSpots: [number, number, number, number, number][] = [[-0.25, 0.2, 0.42, 0.22, -0.7], [0.55, -0.32, 0.38, 0.26, 2.4], [0.7, 0.3, 0.3, 0.2, -2.2]];
  for (const [x, y, z, s, a] of nearSpots) near.push({p: V(x, y, z), s, rot: new THREE.Euler(-0.3, 0.3, a), c: '#2e6e1e'});
  return {near, mid, far};
};

export const BRANCH_PTS = [V(-1.0, BRANCH_Y - 0.01, -0.02), V(-0.4, BRANCH_Y - 0.004, 0.0), V(0.0, BRANCH_Y, 0.0), V(0.35, BRANCH_Y, 0.0),
  V(0.7, BRANCH_Y + 0.004, 0.0), V(1.2, BRANCH_Y + 0.02, -0.03)];

export const Forest: React.FC<{nearLeaves?: boolean; sun?: number; children?: React.ReactNode}> = ({nearLeaves = true, sun = 1, children}) => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.35;
    scene.fog = new THREE.Fog('#7fb86a', 0.9, 4.2);
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl, scene]);
  const set = useMemo(() => {
    const branch = tube(BRANCH_PTS, (s) => BRANCH_R * (1.25 - 0.4 * s), {seg: 220, rad: 28});
    const twig = tube([V(0.3, BRANCH_Y, 0), V(0.36, BRANCH_Y - 0.03, -0.02), V(0.45, BRANCH_Y - 0.06, -0.04), V(0.6, BRANCH_Y - 0.09, -0.05)], (s) => 0.008 * (1 - 0.6 * s), {seg: 40, rad: 12});
    const vines = [[-0.6, -1.5], [0.9, -1.2], [1.4, -2.0], [-1.3, -1.8]].map(([x, z], i) => tube([V(x, 1.6, z), V(x + 0.05, 0.6, z + 0.03), V(x - 0.04, -0.4, z), V(x + 0.02, -1.4, z)], () => 0.012 + 0.004 * i, {seg: 40, rad: 8}));
    return {branch, twig, vines, mat: barkMaterial(), dome: domeMaterial(), leaves: leafSpots()};
  }, []);
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight('#fff0cf', 3.0 * sun);
    l.position.set(-0.8, 1.6, 1.0); l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048); l.shadow.bias = -0.0004; l.shadow.normalBias = 0.002;
    const c = l.shadow.camera; c.left = -0.7; c.right = 1.1; c.top = 0.9; c.bottom = -0.7; c.near = 0.1; c.far = 5;
    return l;
  }, [sun]);
  return (
    <>
      <mesh material={set.dome} scale={30}><sphereGeometry args={[1, 32, 16]} /></mesh>
      <Bokeh />
      <hemisphereLight args={['#d9f2c0', '#2a4a1a', 1.1]} />
      <primitive object={light} />
      <primitive object={light.target} />
      {set.vines.map((g, i) => <mesh key={i} geometry={g} material={set.mat} />)}
      <Leaves spots={set.leaves.far} translucent={0.5} />
      <group rotation={[0, 0, ROLL]}>
        <mesh geometry={set.branch} material={set.mat} castShadow receiveShadow />
        <mesh geometry={set.twig} material={set.mat} castShadow receiveShadow />
        <Leaves spots={set.leaves.mid} />
        {children}
      </group>
      {nearLeaves && <Leaves spots={set.leaves.near} translucent={0.15} fog={false} />}
    </>
  );
};

// Moon tides 01: the three worlds of the film, each driven only by t (seconds) and beats.json.
//   Beach  (metres)       the approved beach water (water kit, ocean-shore), moon in the daytime sky, tide rising at the end
//   Space  (Earth radii)  NASA Earth, an ocean shell stretched by the tide (P2 shape, exaggerated), moon, sun, pull arrows
//   Fundy  (km, x6 height) the Minas Basin, Bay of Fundy: real terrain + Sentinel-2 2016 imagery, water falling and rising 15 m+
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {interpolate, staticFile, delayRender, continueRender} from 'remotion';
import {useThree} from '@react-three/fiber';
import {Earth, Stars, ll, useEarth} from './kit/globe';
import {settle} from './kit/three-canvas';
import {Ocean} from './kit/water/components';
import {PRESETS} from './kit/water/presets';
import {skyDome, skyEnvironment, SKY_DAY} from './kit/water/env';
import B from './beats.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const ramp = (t: number, a: number, b: number) => ease(interpolate(t, [a, b], [0, 1], clamp));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- shared: a texture loaded once, holding the frame until it's there ----------
const texCache: Record<string, THREE.Texture> = {};
export const useTex = (file: string, srgb = true) => {
  const [, set] = React.useState(0);
  React.useEffect(() => {
    if (texCache[file]) return;
    const h = delayRender('tex ' + file);
    new THREE.TextureLoader().load(staticFile(file), (t) => { t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 4; texCache[file] = t; set(1); settle(h); });
  }, [file]);
  return texCache[file] || null;
};
const glowTex = (() => { let t: THREE.Texture | null = null; return () => {
  if (t) return t; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d')!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); t = new THREE.CanvasTexture(c); return t; }; })();

// =====================================================================================================
// BEACH (metres). Camera and water exactly as approved in the Water Picker (ocean-shore 5/5).
// =====================================================================================================
const SKY_BEACH = SKY_DAY;
const NIGHT = {zenith: new THREE.Color('#050A1C'), horizon: new THREE.Color('#1C2A4A'), ground: new THREE.Color('#0E1220')};
export const Beach: React.FC<{t: number; phase: 'open' | 'end'}> = ({t, phase}) => {
  const {camera, gl} = useThree();
  const env = useMemo(() => skyEnvironment(gl, SKY_BEACH), [gl]);
  const sky = useMemo(() => skyDome(SKY_BEACH), []);
  const moon = useTex('moon.jpg');
  // opening: hold on the waves, then rise into the sky on line 2 (into the haze); ending: settle onto the sand as the tide rolls in
  const rise = phase === 'open' ? ramp(t, B.l1 + 1.0, B.l2 + 0.25) : 1 - ramp(t, B.twice - 0.35, B.twice + 1.6);
  const camY = lerp(3.6, 60, rise * rise), lookY = lerp(0, 70, rise);
  camera.position.set(0.3 * t, camY, 67 - rise * 10); camera.lookAt(0.3 * t, lookY, 18 - rise * 30);
  const c = camera as THREE.PerspectiveCamera; c.fov = 45; c.near = 0.05; c.far = 3000; c.updateProjectionMatrix();
  // the opening fades from day to night during the hook: the sky darkens to navy, stars come out, the moon brightens
  // and the light drops to moonlight, so the rise into space carries the same stars (the ending stays daytime)
  const night = phase === 'open' ? ramp(t, 0.9, B.l1 + 0.6) : 0;
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = lerp(1.0, 0.8, night);
  const su = sky.uniforms as Record<string, THREE.IUniform>;
  (su.uZ.value as THREE.Color).set(SKY_BEACH.zenith).lerp(NIGHT.zenith, night);
  (su.uH.value as THREE.Color).set(SKY_BEACH.horizon).lerp(NIGHT.horizon, night);
  (su.uG.value as THREE.Color).set(SKY_BEACH.ground).lerp(NIGHT.ground, night);
  (su.uS.value as THREE.Color).set(SKY_BEACH.sun).multiplyScalar(1 - night);
  // the tide comes in at the end: the sea rises 0.7 m, so the waterline climbs ~14 m up the 1-in-20 beach
  const tide = phase === 'end' ? 0.7 * ramp(t, B.twice, B.total - 0.6) : 0;
  const sand = useMemo(() => {
    const g = new THREE.PlaneGeometry(300, 300, 200, 200); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute, col = new Float32Array(p.count * 3), cc = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + 60; p.setXYZ(i, x, -3 + z * 0.05, z);
      const r = 0.5 + 0.5 * Math.sin(x * 1.7 + z * 2.3) * Math.cos(x * 0.9 - z * 1.3); cc.set('#D9C4A0').lerp(new THREE.Color('#B89E78'), r * 0.5); col.set([cc.r, cc.g, cc.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g; }, []);
  return (
    <>
      <mesh position={camera.position} material={sky} frustumCulled={false} renderOrder={-1}><sphereGeometry args={[2000, 48, 24]} /></mesh>
      {night > 0.01 && <Stars fr={t * 30} opacity={night} />}
      <hemisphereLight args={[new THREE.Color('#B8CBDD').lerp(new THREE.Color('#3A4A6E'), night), new THREE.Color('#8C7C64').lerp(new THREE.Color('#1C1C26'), night), lerp(1.7, 0.55, night)]} />
      <directionalLight position={SKY_BEACH.sunDir.clone().multiplyScalar(300).toArray()} intensity={2.4 * (1 - night)} color={SKY_BEACH.sun} />
      {/* moonlight: cool, from the moon's side, so the waves keep a soft sheen at night */}
      <directionalLight position={[-70, 60, -700]} intensity={0.9 * night} color="#BFD0F0" />
      <mesh geometry={sand}><meshStandardMaterial vertexColors roughness={0.95} /></mesh>
      <Ocean preset={PRESETS.tropical} t={t} size={300} res={220} opts={{height: 0.8, beach: {y0: -3 - tide, dir: 90, slope: 0.05}, envMap: env, sunDir: SKY_BEACH.sunDir}} position={[0, tide, 0]} envIntensity={lerp(1, 0.25, night)} />
      {/* the moon in the daytime sky, pale, low over the sea */}
      {moon && <mesh position={[-70, 60, -700]} rotation={[0, -Math.PI / 2, 0]}><sphereGeometry args={[22, 48, 24]} /><meshBasicMaterial map={moon} color={new THREE.Color('#DCE4EE').lerp(new THREE.Color('#FFFFFF'), night)} transparent opacity={lerp(0.85, 1, night)} toneMapped={night < 0.5} /></mesh>}
      {night > 0.01 && <sprite position={[-70, 60, -705]} scale={[150, 150, 1]}><spriteMaterial map={glowTex()} color="#C8D8F4" transparent opacity={0.45 * night} depthWrite={false} /></sprite>}
    </>
  );
};

// =====================================================================================================
// SPACE (Earth radii). Not to scale: the moon at ~3.4 radii (really ~60), bulges exaggerated.
// =====================================================================================================
const MOON_DIR = new THREE.Vector3(1, 0, 0);                       // the Earth-moon axis in the system's frame (x)
export const TILT = 1.0;                                            // the system is rotated ~57 deg about z so the axis climbs the 9:16 frame
const Z = new THREE.Vector3(0, 0, 1);
export const tideShape = (t: number) => {
  // bulge amplitude (Earth radii): grows on "biggest wave"/tide, flattens for the question, stretches on "two bumps",
  // grows more when the sun lines up, eases back after; quick replay in the recap
  let a = 0.1 * ramp(t, B.l1 + 0.6, B.l2 + 1.2) * (1 - ramp(t, B.l3 - 0.2, B.l3 + 0.6));
  a = Math.max(a, 0.14 * ramp(t, B.bumps - 0.1, B.bumps + 1.2));
  a += 0.07 * ramp(t, B.lineup, B.bigger + 0.4) * (1 - ramp(t, B.l8 - 0.2, B.l8 + 0.8));
  if (t >= B.l8 + 0.8) a = 0.12;
  if (t >= B.l9 - 0.1) a = 0.14 * ramp(t, B.r_stretch - 0.1, B.r_stretch + 0.6);
  return a;
};
const oceanShell = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: {uA: {value: 0}, uDir: {value: MOON_DIR.clone()}, uRot: {value: new THREE.Matrix3()}},
  vertexShader: /* glsl */`uniform float uA; uniform vec3 uDir; varying float vH; varying vec3 vN; varying vec3 vV;
    void main(){ vec3 n = normalize(position);
      float c = dot(n, uDir); float p2 = 0.5 * (3.0 * c * c - 1.0);   // equilibrium tide shape: Legendre P2 about the moon axis
      vH = p2; vec3 p = n * (1.0 + 0.012 + uA * p2);
      vec4 mv = modelViewMatrix * vec4(p, 1.0); vN = normalize(normalMatrix * n); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: /* glsl */`uniform float uA; varying float vH; varying vec3 vN; varying vec3 vV;
    void main(){ float fres = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.0);
      float hi = smoothstep(0.0, 1.0, vH) * smoothstep(0.0, 0.02, uA);
      vec3 c = mix(vec3(0.16, 0.42, 0.78), vec3(0.55, 0.88, 1.0), hi);
      gl_FragColor = vec4(c, 0.08 + 0.16 * hi + 0.7 * fres);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});
const Arrow: React.FC<{from: THREE.Vector3; len: number; k: number; color?: string}> = ({from, len, k, color = '#FFC56E'}) => {
  if (k <= 0) return null; const L = len * k;
  return (
    <group position={from}>
      <mesh position={[L / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[0.018, 0.018, Math.max(L - 0.06, 0.001), 12]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
      <mesh position={[L - 0.03, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.05, 0.1, 16]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
    </group>
  );
};
export const spaceCam = (t: number) => {
  // [time, camera position, target]: start over the Atlantic as we arrive from the beach; side-on for the mechanism;
  // follow the spin; pull back for the sun; dive toward Nova Scotia; side-on again for the recap
  const K: [number, THREE.Vector3, THREE.Vector3][] = [
    [B.l2 - 0.2, new THREE.Vector3(0.3, 0.5, 1.7), new THREE.Vector3(0.1, 0.2, 0)],
    [B.l2 + 2.0, new THREE.Vector3(0.6, 0.6, 3.0), new THREE.Vector3(0.3, 0.1, 0)],
    [B.l3 + 0.5, new THREE.Vector3(0.9, 0.2, 6.6), new THREE.Vector3(0.85, 0, 0)],
    [B.l5 + 0.5, new THREE.Vector3(0.85, 0.2, 6.4), new THREE.Vector3(0.8, 0, 0)],
    [B.l6 + 0.4, new THREE.Vector3(0.2, 1.0, 3.6), new THREE.Vector3(0.3, 0, 0)],
    [B.l7 + 0.2, new THREE.Vector3(0.2, 0.4, 9.5), new THREE.Vector3(0.4, 0, 0)],
    [B.l8 + 0.8, new THREE.Vector3(-0.1, 0.5, 3.4), new THREE.Vector3(0.0, 0.2, 0)],
    [B.canada - 0.3, new THREE.Vector3(-0.05, 0.75, 1.25), new THREE.Vector3(-0.02, 0.62, 0.6)],
    [B.l9, new THREE.Vector3(0.85, 0.2, 6.4), new THREE.Vector3(0.8, 0, 0)],
    [B.twice, new THREE.Vector3(0.6, 0.6, 3.6), new THREE.Vector3(0.3, 0.1, 0)],
  ];
  let i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++;
  const u = ramp(t, K[i][0], K[i + 1][0]);
  return {pos: K[i][1].clone().lerp(K[i + 1][1], u).applyAxisAngle(Z, TILT), target: K[i][2].clone().lerp(K[i + 1][2], u).applyAxisAngle(Z, TILT)};
};
// where Nova Scotia is in the (spinning) Earth's frame, for the dive; Earth turns about y
export const NOVA = {lat: 45.4, lon: -63.9};
export const earthSpin = (t: number) => {
  const base = -1.2;                                                  // Atlantic toward the camera to start
  const spin = 2 * Math.PI * ramp(t, B.spins - 0.2, B.l7 - 0.2);    // one turn while "Earth spins through both bumps"
  const toNova = 0.55 * ramp(t, B.l8, B.canada - 0.3);              // turn Nova Scotia toward the camera for the dive
  const recap = 2 * Math.PI * ramp(t, B.r_spins - 0.1, B.r_spins + 1.4);
  return base + spin + toNova + recap;
};
export const Space: React.FC<{t: number}> = ({t}) => {
  const {camera, gl} = useThree();
  const earth = useEarth();
  const moonTex = useTex('moon.jpg');
  const shell = useMemo(oceanShell, []);
  const cam = spaceCam(t);
  camera.position.copy(cam.pos); camera.lookAt(cam.target);
  const c = camera as THREE.PerspectiveCamera; c.fov = 40; c.near = 0.01; c.far = 500; c.updateProjectionMatrix();
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05;
  shell.uniforms.uA.value = tideShape(t);
  const spin = earthSpin(t);
  // the pull: a soft field around the moon that fades with distance (line 4), then three arrows (line 5)
  const field = interpolate(t, [B.weaker - 0.3, B.weaker + 0.4, B.l5 + 0.5, B.l5 + 1.2], [0, 1, 1, 0], clamp);
  const aNear = ramp(t, B.hardest - 0.1, B.hardest + 0.5), aMid = ramp(t, B.middle - 0.1, B.middle + 0.5), aFar = ramp(t, B.least - 0.25, B.least + 0.35);
  const arrowsOut = 1 - ramp(t, B.l6 - 0.3, B.l6 + 0.3);
  const recapPull = interpolate(t, [B.r_pulls - 0.1, B.r_pulls + 0.3, B.r_stretch, B.r_stretch + 0.3], [0, 1, 1, 0], clamp);
  const arrowsK = Math.max(arrowsOut, recapPull);
  // the sun: far off to the left, swinging onto the Earth-moon line on "line up"
  const sunIn = ramp(t, B.l7 - 0.2, B.l7 + 0.8) * (1 - ramp(t, B.l8 + 0.5, B.l8 + 1.3));
  const sunAng = lerp(Math.PI * 0.62, Math.PI, ramp(t, B.lineup - 0.3, B.lineup + 0.8));  // from off-axis to behind Earth (aligned)
  const sunPos = new THREE.Vector3(Math.cos(sunAng), 0.05, Math.sin(sunAng) * 0.6).multiplyScalar(4.2);
  const moonPos = MOON_DIR.clone().multiplyScalar(2.8);
  // a coast marker riding the tide while Earth spins (line 7): it sits on the shell, so it rises and falls twice a turn
  const markerLon = -63.9, mk = ll({lat: 0, lon: markerLon}).applyAxisAngle(new THREE.Vector3(0, 1, 0), spin);
  const cm = mk.dot(MOON_DIR) / mk.length(), p2 = 0.5 * (3 * cm * cm - 1);
  const markerPos = mk.clone().normalize().multiplyScalar(1.012 + tideShape(t) * p2 + 0.01);
  const markerO = interpolate(t, [B.spins - 0.2, B.spins + 0.3, B.l7 - 0.3, B.l7 + 0.1], [0, 1, 1, 0], clamp);
  return (
    <>
      <Stars fr={t * 30} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[-6, 3, 8]} intensity={2.4} />
      <group rotation={[0, 0, TILT]}>
      <group rotation={[0, spin, 0]}>
        <Earth tex={earth} night={0.15} day={1.5} air={1} />
      </group>
      <mesh material={shell} renderOrder={2}><sphereGeometry args={[1, 160, 80]} /></mesh>
      {markerO > 0 && <mesh position={markerPos} renderOrder={3}><sphereGeometry args={[0.025, 16, 12]} /><meshBasicMaterial color="#FFC56E" transparent opacity={markerO} toneMapped={false} /></mesh>}
      {moonTex && <mesh position={moonPos} rotation={[0, -Math.PI / 2, 0]}><sphereGeometry args={[0.27, 64, 32]} /><meshStandardMaterial map={moonTex} roughness={1} /></mesh>}
      {field > 0 && <sprite position={moonPos} scale={[5.5, 5.5, 1]} renderOrder={1}><spriteMaterial map={glowTex()} color="#FFE7B0" transparent opacity={0.28 * field} depthWrite={false} /></sprite>}
      {arrowsK > 0 && <>
        <Arrow from={new THREE.Vector3(1.06, 0, 0)} len={0.62} k={(t >= B.l9 ? 1 : aNear) * arrowsK} />
        <Arrow from={new THREE.Vector3(0.0, 0, 0.0).add(new THREE.Vector3(0, 0, 1.15))} len={0.42} k={(t >= B.l9 ? 1 : aMid) * arrowsK} />
        <Arrow from={new THREE.Vector3(-1.45, 0, 0)} len={0.24} k={(t >= B.l9 ? 1 : aFar) * arrowsK} />
      </>}
      {sunIn > 0 && <sprite position={sunPos} scale={[3.2, 3.2, 1]}><spriteMaterial map={glowTex()} color="#FFE2A0" transparent opacity={sunIn} depthWrite={false} toneMapped={false} /></sprite>}
      </group>
    </>
  );
};

// =====================================================================================================
// FUNDY (km; heights x6). Minas Basin: water falls to expose the red flats, then rises 15 m+.
// =====================================================================================================
export const VEX = 6;
const Yk = (m: number) => (m / 1000) * VEX;
let fundyField: {G: number; size: number; h: Float32Array} | null = null;
export const useFundy = () => {
  const [, set] = React.useState(0);
  React.useEffect(() => {
    if (fundyField) return; const hd = delayRender('fundy');
    Promise.all([fetch(staticFile('fundy.json')).then((r) => r.json()), fetch(staticFile('fundy_h.bin')).then((r) => r.arrayBuffer())])
      .then(([j, b]) => { fundyField = {G: j.G, size: j.size_km, h: new Float32Array(b)}; set(1); settle(hd); });
  }, []);
  return fundyField;
};
// load everything the film needs once, outside the canvas, before any scene mounts (each scene then finds its data
// ready on its first render; loading inside a scene let a frame be captured before the loaded state was drawn)
export const usePreload = () => {
  const f = useFundy(), a = useTex('moon.jpg'), b = useTex('fundy_imagery.jpg'), c = useTex('fundy_normals.png', false), d = useTex('fundy_light.png', false);
  return !!(f && a && b && c && d);
};
export const tideLevel = (t: number) => {
  // metres: settle to low tide while "In the open ocean... less than one meter", then rise to high tide on "Canada... fifteen meters"
  const low = -7.5, high = 7.8;
  const k = ramp(t, B.canada - 0.2, B.fifteen + 1.2);
  return lerp(low, high, k);
};
export const Fundy: React.FC<{t: number}> = ({t}) => {
  const {camera, gl} = useThree();
  const F = useFundy(); const img = useTex('fundy_imagery.jpg'); const nrm = useTex('fundy_normals.png', false); const lt = useTex('fundy_light.png', false);
  const env = useMemo(() => skyEnvironment(gl, SKY_DAY), [gl]);
  const sky = useMemo(() => skyDome(SKY_DAY), []);
  const geo = useMemo(() => {
    if (!F) return null;
    const g = new THREE.PlaneGeometry(F.size, F.size, F.G - 1, F.G - 1); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, Yk(Math.max(F.h[i], -4)));
    g.computeVertexNormals(); return g;
  }, [F]);
  const mat = useMemo(() => {
    if (!img || !nrm || !lt) return null;
    const m = new THREE.MeshStandardMaterial({map: img, roughness: 0.95});
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uN = {value: nrm}; sh.uniforms.uL = {value: lt};
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uN; uniform sampler2D uL;')
        .replace('#include <map_fragment>', '#include <map_fragment>\n{ vec2 L = texture2D(uL, vMapUv).rg; diffuseColor.rgb *= (0.55 + 0.45 * L.r) * (0.5 + 0.5 * L.g); }')
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n{ vec3 nO = texture2D(uN, vMapUv).xyz * 2.0 - 1.0; normal = normalize(mix(normal, normalize((viewMatrix * vec4(nO, 0.0)).xyz), 0.85)); }');
    };
    return m;
  }, [img, nrm, lt]);
  // camera: from the clouds down over the basin, low and oblique, drifting along the bay
  const k = ramp(t, B.canada - 0.4, B.canada + 1.6);
  camera.position.set(lerp(-6, -14, k), lerp(26, 6.5, k), lerp(14, 16, k) - (t - B.canada) * 0.25);
  camera.lookAt(lerp(-2, 2, k), 0, lerp(-2, -4, k));
  const c = camera as THREE.PerspectiveCamera; c.fov = 42; c.near = 0.05; c.far = 400; c.updateProjectionMatrix();
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0;
  const lvl = tideLevel(t);
  return (
    <>
      <mesh position={camera.position} material={sky} frustumCulled={false} renderOrder={-1}><sphereGeometry args={[300, 48, 24]} /></mesh>
      <hemisphereLight args={['#C2D2E2', '#7C6A56', 1.4]} />
      <directionalLight position={[20, 26, 46]} intensity={2.2} color="#FFF1D6" />
      {geo && mat && <mesh geometry={geo} material={mat} />}
      {/* the bay's water: turbid red-brown (Minas Basin is sediment-laden), glossy, at the tide level */}
      <mesh position={[0, Yk(lvl), 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80, 1, 1]} />
        <meshStandardMaterial color="#7A6656" roughness={0.07} metalness={0} envMap={env} envMapIntensity={1.1} transparent opacity={0.9} />
      </mesh>
    </>
  );
};

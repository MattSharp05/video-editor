// Two worlds in one three.js scene, switched on the hard cuts (timeline.ts CUT_*):
//  SPACE  the built Sun, the orbit (myth oval -> true near-circle), the tilted Earth (globe kit), its axis and the
//         line to Polaris, ghost Earths on the lap, the beam of 100 marbles, the two city beams.
//  MEADOW a field at noon (realism kit sky, sun, grass, trees) with a found red barn, a faint grid of tiles, and the
//         same beam of 100 marbles landing steep (summer) or slanted (winter); snow and bare trees in winter.
// Built once in useMemo; per frame only transforms, uniforms and instance matrices change, all from timeline.ts.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {random} from 'remotion';
import {skyLight, makeSky, sunColor, type SkyOpts} from './kit/realism/sky.ts';
import {makeSun, followSun} from './kit/realism/sun.ts';
import {scatter, instances, tuft, tree, leafCard} from './kit/realism/plants.ts';
import {patch, wind, air, time, airUniforms, type Patch} from './kit/realism/shade.ts';
import {Earth, Stars, ll, type EarthTex} from './kit/globe';
import * as TL from './timeline';

export type Assets = {barn: GLTF};
const col = (h: string) => new THREE.Color(h);

// ---------- shared bits
const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,0.6)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.15)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const glowSprite = (tex: THREE.Texture, c: string, size: number, o = 1) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col(c), opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false}));
  s.scale.setScalar(size); return s;
};
const additive = (c: string, o = 1, depthTest = true) => new THREE.MeshBasicMaterial({color: col(c), transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, depthTest, toneMapped: false});

// the Sun: granulated, limb-darkened, white-gold
const sunMaterial = () => new THREE.ShaderMaterial({
  uniforms: {uT: {value: 0}}, toneMapped: false,
  vertexShader: `varying vec3 vN; varying vec3 vP; varying vec3 vV; void main(){ vP=position; vec4 w=modelMatrix*vec4(position,1.0); vN=normalize(mat3(modelMatrix)*normal); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform float uT; varying vec3 vN; varying vec3 vP; varying vec3 vV;
    float h(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
    float n3(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
    void main(){ vec3 p=normalize(vP)*3.0; float g=n3(p*4.0+uT*0.15)*0.55+n3(p*11.0-uT*0.3)*0.3+n3(p*27.0)*0.15;
      float mu=max(dot(normalize(vN),vV),0.0); float limb=0.45+0.55*pow(mu,0.55);
      vec3 c=mix(vec3(1.0,0.5,0.12),vec3(1.0,0.86,0.55),limb)*(0.8+0.35*g)*(0.55+0.45*limb)*1.25;
      gl_FragColor=vec4(c,1.0); }`,
});

// marbles: emissive amber beads + a soft halo shell
const MARBLE_CORE = '#FFD27A';
const marbleMeshes = (n: number, r: number) => {
  const core = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 12, 8), new THREE.MeshBasicMaterial({color: col(MARBLE_CORE).multiplyScalar(1.4), toneMapped: false}), n);
  const halo = new THREE.InstancedMesh(new THREE.SphereGeometry(r * 1.7, 10, 6), additive(TL.AMBER, 0.1), n);
  core.frustumCulled = halo.frustumCulled = false; core.count = halo.count = 0;
  return {core, halo};
};
const M4 = new THREE.Matrix4(), Q0 = new THREE.Quaternion(), V1 = new THREE.Vector3(), SC = new THREE.Vector3();
const setI = (im: THREE.InstancedMesh, i: number, p: THREE.Vector3, s = 1) => im.setMatrixAt(i, M4.compose(p, Q0, SC.setScalar(s)));

// ---------- meadow: snow patch (whitens ground and grass, buries the grass) as a shade.ts patch
const snowU = {uSnowFront: {value: -80}, uSnowAmt: {value: 0}};
const snowPatch = (bury: boolean): Patch => ({
  key: bury ? 'snowBury' : 'snow',
  uniforms: snowU,
  vertexPars: 'uniform float uSnowFront; uniform float uSnowAmt; varying vec3 vSnowW;',
  vertex: [{at: 'project_vertex', before: true, code: `{
    #ifdef USE_INSTANCING
      vec4 sw = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
    #else
      vec4 sw = modelMatrix * vec4(transformed, 1.0);
    #endif
    vSnowW = sw.xyz;
    ${bury ? 'float sk = uSnowAmt * smoothstep(uSnowFront + 6.0, uSnowFront - 6.0, sw.x); transformed.y = transformed.y * (1.0 - sk) - 0.08 * sk;' : ''}
  }`}],
  fragmentPars: 'uniform float uSnowFront; uniform float uSnowAmt; varying vec3 vSnowW;',
  fragment: [{at: 'color_fragment', code: `{
    float sk = uSnowAmt * smoothstep(uSnowFront + 6.0, uSnowFront - 6.0, vSnowW.x + 2.0 * sin(vSnowW.z * 0.3));
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.95, 0.98), sk * 0.97);
  }`}],
});

const EXPO_S = 0.1, EXPO_W = 0.12;
export const Scene: React.FC<{t: number; assets: Assets; earth: EarthTex}> = ({t, assets, earth}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const tex = glowTex();

    // ======================= SPACE
    const space = new THREE.Group(); scene.add(space);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(TL.SUN_R, 64, 48), sunMaterial()); space.add(sun);
    const sunGlow = [glowSprite(tex, '#FFE2A8', TL.SUN_R * 3.2, 0.9), glowSprite(tex, TL.AMBER, TL.SUN_R * 7, 0.45), glowSprite(tex, '#FF8A4C', TL.SUN_R * 14, 0.18)];
    sunGlow.forEach((s) => space.add(s));
    // a point light for the plain objects (ghost Earths, axis rods); the globe shader lights itself
    const sunLight = new THREE.PointLight(col('#FFF1DC'), 3.0, 0, 0); space.add(sunLight);
    space.add(new THREE.AmbientLight(col('#405070'), 0.25));
    // orbit line (rebuilt when its eccentricity changes)
    const orbitMat = new THREE.MeshBasicMaterial({color: col(TL.CORAL), transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false});
    const orbit = new THREE.Mesh(new THREE.BufferGeometry(), orbitMat); orbit.renderOrder = 2; space.add(orbit);
    let orbitE = -1;
    const orbitGeo = (e: number) => {
      const pts = Array.from({length: 241}, (_, i) => TL.orbitPos((i / 240) * Math.PI * 2, e));
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 480, 0.09, 6, true);
    };
    // Earth's frame: position + orientation (tilt * spin); the <Earth> is drawn inside this group by JSX
    const earthG = new THREE.Group(); space.add(earthG);
    // axis frame: position + tilt only (doesn't spin)
    const axisG = new THREE.Group(); space.add(axisG);
    const axisRod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, TL.EARTH_R * 3.0, 8), additive(TL.GLASS, 0.95)); axisG.add(axisRod);
    const poleLine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 160, 6), additive(TL.GLASS, 0.5)); poleLine.position.y = TL.EARTH_R * 1.5 + 80; axisG.add(poleLine);
    const polarisStar = glowSprite(tex, '#DDEBFF', 6, 1); polarisStar.position.y = 160; axisG.add(polarisStar);
    // the upright and the 23.4 deg arc (world-aligned, at Earth)
    const tiltG = new THREE.Group(); space.add(tiltG);
    const upright = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, TL.EARTH_R * 3.0, 6), additive(TL.GLASS, 0.45)); tiltG.add(upright);
    const arc = new THREE.Mesh(new THREE.TorusGeometry(TL.EARTH_R * 1.35, 0.035, 6, 40, (TL.TILT * Math.PI) / 180), additive(TL.GLASS, 1));
    arc.rotation.z = Math.PI / 2 - (TL.TILT * Math.PI) / 180; tiltG.add(arc); // spans from the upright (+Y) toward the pole (+X side)
    // ghost Earths on the lap
    const ghostMat = () => new THREE.MeshStandardMaterial({map: earth.day, roughness: 1, transparent: true, opacity: 0, depthWrite: false});
    const ghosts = TL.GHOSTS.map(() => {
      const g = new THREE.Group(); g.quaternion.copy(TL.tiltQ);
      const m = new THREE.Mesh(new THREE.SphereGeometry(TL.EARTH_R * 0.85, 32, 24), ghostMat()); g.add(m);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, TL.EARTH_R * 2.8, 6), additive(TL.GLASS, 0)); g.add(rod);
      space.add(g); return {g, m, rod};
    });
    // the beam from the Sun to New York: a square shaft that resolves into 100 marbles near Earth
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
      uniforms: {uO: {value: 0}, uC: {value: col(TL.AMBER)}},
      vertexShader: `varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform float uO; uniform vec3 uC; varying vec3 vP; void main(){ float a = uO * (0.35 + 0.65 * smoothstep(-0.5, 0.3, vP.z)) * smoothstep(0.5, 0.1, vP.z); gl_FragColor = vec4(uC * a * 1.4, a); }`,
    }));
    space.add(beam);
    const spaceMarbles = marbleMeshes(300, 0.022); space.add(spaceMarbles.core, spaceMarbles.halo);
    // a city's shaft of sunlight: full strength right down to the surface, fading only at its far end
    const cityShaft = () => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
      uniforms: {uO: {value: 0}, uC: {value: col(TL.AMBER)}},
      vertexShader: `varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform float uO; uniform vec3 uC; varying vec3 vP; void main(){ float a = uO * smoothstep(-0.5, -0.1, vP.z); gl_FragColor = vec4(uC * a * 1.3, a); }`,
    })); m.renderOrder = 6; space.add(m); return m; };
    const cityShafts = [cityShaft(), cityShaft()];
    // city footprints (beat 9): a glowing ellipse on the surface, stretched by 1/sin(elevation)
    const footMat = () => new THREE.MeshBasicMaterial({map: tex, depthTest: false, color: col(TL.AMBER), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false});
    const foot = [new THREE.Mesh(new THREE.PlaneGeometry(1, 1), footMat()), new THREE.Mesh(new THREE.PlaneGeometry(1, 1), footMat())];
    foot.forEach((f) => { f.renderOrder = 5; space.add(f); });

    // ======================= MEADOW
    const meadow = new THREE.Group(); scene.add(meadow);
    const skyOpts = (elev: number): SkyOpts => ({elevation: elev, azimuth: 0, rayleigh: 1.7, turbidity: elev > 50 ? 2.5 : 3.5, ground: '#4d5a30', visibility: 16000, hazeHeight: 120});
    const Lw = skyLight(gl, skyOpts(TL.ELEV_WINTER));
    const airW = {c: airUniforms.uAirColor.value.clone(), s: airUniforms.uAirSunColor.value.clone()};
    const Ls = skyLight(gl, skyOpts(TL.ELEV_SUMMER));
    const airS = {c: airUniforms.uAirColor.value.clone(), s: airUniforms.uAirSunColor.value.clone()};
    const sky = makeSky(skyOpts(TL.ELEV_SUMMER)); sky.scale.setScalar(3000); meadow.add(sky);
    const sunM = makeSun({direction: Ls.sunDir, color: Ls.sunColor, intensity: Ls.sunIntensity, center: new THREE.Vector3(-4, 0, 0), radius: 34, mapSize: 2048, distance: 80});
    meadow.add(sunM, sunM.target);
    const norm = (c: THREE.Color) => c.clone().multiplyScalar(1 / Math.max(c.r, c.g, c.b));
    const hemi = new THREE.HemisphereLight(norm(Ls.skyIrradiance), col('#6a6a50'), 1.0); meadow.add(hemi);
    // ground
    const groundMat = patch(new THREE.MeshPhysicalMaterial({color: col('#3d4a22'), roughness: 0.95, specularIntensity: 0.25}), snowPatch(false), air());
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), groundMat); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; meadow.add(ground);
    // grass (receives shadow; doesn't cast, to save the map)
    const grassMat = patch(new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.85, side: THREE.DoubleSide}), wind({amp: 1.2}), snowPatch(true), air());
    const spots = scatter({seed: 3, count: 32000, bounds: [-40, -26, 24, 26], scale: [0.35, 0.6], // 120k cost ~20 s a frame on the CPU
      density: (x, z) => Math.max(0.12, Math.exp(-((x - 4) ** 2 + z * z) / 900))});
    const grass = instances(tuft({seed: 4, blades: 6}), grassMat, spots, {shadows: false, color: (s) => new THREE.Color().setHSL(0.24 + 0.05 * s.r, 0.45, 0.32 + 0.1 * s.r)});
    meadow.add(grass);
    // trees at the field edge (leaves split in four sets that drop in turn for winter)
    const woodMat = patch(new THREE.MeshStandardMaterial({color: col('#4a3a2c'), roughness: 0.9}), snowPatch(false), air());
    const leafPatches = [wind({sway: 0.05, flutter: 0.02})];
    // the kit's leaf() cut-out drew square cards here (board v1/v2), so the cards get a drawn leaf-cluster texture
    const leafTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
      for (let i = 0; i < 9; i++) {
        const a = random('la' + i) * Math.PI * 2, r = 18 + random('lr' + i) * 26, x = 64 + Math.cos(a) * r * 0.9, y = 64 + Math.sin(a) * r * 0.9;
        g.save(); g.translate(x, y); g.rotate(a + 1.2); const l = 0.75 + 0.5 * random('ll' + i);
        g.fillStyle = `hsl(${92 + random('lh' + i) * 20}, 45%, ${30 + random('lv' + i) * 18}%)`;
        g.beginPath(); g.ellipse(0, 0, 9 * l, 20 * l, 0, 0, Math.PI * 2); g.fill(); g.restore();
      }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    const leafMat = patch(new THREE.MeshStandardMaterial({map: leafTex, roughness: 0.8, side: THREE.DoubleSide, alphaTest: 0.5}), ...leafPatches, air());
    const leafDepth = new THREE.MeshDepthMaterial({map: leafTex, alphaTest: 0.5});
    const leafSets: THREE.InstancedMesh[][] = [[], [], [], []];
    const TREES: [number, number, number, number][] = [[-22, -17, 11, 1], [-30, 14, 12, 2], [-14, 22, 9, 3], [-40, -4, 10, 4], [-8, -26, 9.5, 5]];
    for (const [x, z, h, seed] of TREES) {
      const tr = tree({seed: seed * 7, height: h, leaves: 1400});
      const wood = new THREE.Mesh(tr.wood, woodMat); wood.position.set(x, 0, z); wood.castShadow = true; wood.receiveShadow = true; meadow.add(wood);
      const card = leafCard(1.1);
      for (let k = 0; k < 4; k++) {
        const sub = tr.leaves.filter((l) => Math.floor(l.r * 4) === k).map((l) => ({...l, x: l.x + x, z: l.z + z}));
        const im = instances(card, leafMat, sub, {depth: leafDepth, color: (s) => new THREE.Color().setHSL(0.22, 0.2, 0.8 + 0.2 * s.r)});
        leafSets[k].push(im); meadow.add(im);
      }
    }
    // the barn, 20 m long, behind the tiles
    const barn = assets.barn.scene.clone(true);
    const bb = new THREE.Box3().setFromObject(barn); const sz = bb.getSize(new THREE.Vector3());
    const k = 20 / Math.max(sz.x, sz.z);
    const barnG = new THREE.Group(); barnG.add(barn);
    barn.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
    barnG.scale.setScalar(k); barnG.position.set(-36, 0, 10); barnG.rotation.y = sz.x > sz.z ? Math.PI / 2 + 0.35 : 0.35;
    barn.traverse((o) => {
      const m = o as THREE.Mesh; if (!m.isMesh) return; m.castShadow = true; m.receiveShadow = true;
      const mat = (m.material as THREE.MeshStandardMaterial).clone(); mat.envMap = Ls.envMap; mat.envMapIntensity = 0.6; patch(mat, snowPatch(false)); m.material = mat;
    });
    meadow.add(barnG);
    // tiles: faint grid lines; glowing fills for tile A (summer) and A, B (winter) plus the slivers
    const gridMat = additive(TL.GLASS, 0.32);
    const xs = [-6, -2, 2, 6], zs = [-12.6, -8.4, -4.2, 0, 4.2, 8.4, 12.6];
    for (const x of xs) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 25.2), gridMat); m.position.set(x, 0.04, 0); meadow.add(m); }
    for (const z of zs) { const m = new THREE.Mesh(new THREE.BoxGeometry(12, 0.02, 0.06), gridMat); m.position.set(0, 0.04, z); meadow.add(m); }
    const fill = (z0: number, z1: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(TL.TILE_X, z1 - z0), new THREE.MeshBasicMaterial({color: col('#FFA52E'), transparent: true, opacity: 0, depthWrite: false, toneMapped: false})); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.06, (z0 + z1) / 2); m.renderOrder = 3; meadow.add(m); return m;
    };
    const fillA = fill(-4.2, 0), fillB = fill(0, 4.2);
    const fw = TL.footprint(TL.ELEV_WINTER) / 2;
    const sliverA = fill(-fw, -4.2), sliverB = fill(4.2, fw);
    // white outline of the summer tile (kept in winter for comparison)
    const outline = new THREE.Group();
    for (const [w, d, x, z] of [[4.12, 0.12, 0, -4.2], [4.12, 0.12, 0, 0], [0.12, 4.32, -2, -2.1], [0.12, 4.32, 2, -2.1]] as const) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), additive('#FFFFFF', 0)); m.position.set(x, 0.07, z); outline.add(m);
    }
    meadow.add(outline);
    const shaftMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide,
      uniforms: {uO: {value: 0}, uC: {value: col(TL.AMBER)}},
      vertexShader: `varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform float uO; uniform vec3 uC; varying vec3 vP; void main(){ float e = max(abs(vP.x), abs(vP.y)); float a = uO * (0.12 + 0.5 * smoothstep(0.42, 0.5, e)) * smoothstep(0.5, 0.2, vP.z); gl_FragColor = vec4(uC * a, a); }`});
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), shaftMat); shaft.renderOrder = 2; meadow.add(shaft);
    // marbles in flight (up to 3 waves of 100) and the 100 landed dots
    const fieldMarbles = marbleMeshes(300, 0.13); meadow.add(fieldMarbles.core, fieldMarbles.halo);
    const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(0.16, 14).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: col(MARBLE_CORE).multiplyScalar(1.6), transparent: true, opacity: 0, toneMapped: false, depthWrite: false}), 100);
    dots.frustumCulled = false; dots.renderOrder = 4; meadow.add(dots);
    const dotGlow = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.9, 0.9).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({map: tex, color: col(TL.AMBER), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}), 100);
    dotGlow.frustumCulled = false; dotGlow.renderOrder = 4; meadow.add(dotGlow);

    return {space, sun, sunGlow, orbit, orbitMat, orbitGeo, getE: () => orbitE, setE: (e: number) => { orbitE = e; }, earthG, axisG, axisRod, poleLine, polarisStar, tiltG, ghosts, beam, spaceMarbles, cityShafts, foot,
      meadow, shaft, sky, sunM, hemi, Ls, Lw, airS, airW, skyOpts, leafSets, fillA, fillB, sliverA, sliverB, outline, fieldMarbles, dots, dotGlow};
  }, [gl, scene, assets, earth]);

  // =============================================================== per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = TL.inMeadow(t) ? 0.1 : 0.05; cam.far = 20000;
  cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  time.value = t;
  const meadowOn = TL.inMeadow(t);
  W.space.visible = !meadowOn; W.meadow.visible = meadowOn;
  scene.background = meadowOn ? null : new THREE.Color(0, 0, 0);

  let earthState = {pos: new THREE.Vector3(), q: new THREE.Quaternion(), sunVec: new THREE.Vector3(1, 0, 0)};
  if (!meadowOn) {
    gl.toneMappingExposure = 1.0;
    (W.sun.material as THREE.ShaderMaterial).uniforms.uT.value = t;
    // orbit
    const e = TL.ecc(t);
    if (Math.abs(e - W.getE()) > 1e-4) { W.orbit.geometry.dispose(); W.orbit.geometry = W.orbitGeo(e); W.setE(e); }
    W.orbitMat.color.copy(col(TL.CORAL)).lerp(col(TL.GLASS), TL.mythMorph(t));
    W.orbitMat.opacity = 0.85 * TL.clamp01(TL.orbitLine(t));
    W.orbit.visible = W.orbitMat.opacity > 0.01;
    // Earth
    const p = TL.earthPos(t), q = TL.earthQ(t);
    W.earthG.position.copy(p); W.earthG.quaternion.copy(q);
    earthState = {pos: p, q, sunVec: TL.sunLocal(t)};
    W.axisG.position.copy(p); W.axisG.quaternion.copy(TL.tiltQ);
    const ax = TL.axisOn(t);
    W.axisRod.visible = ax > 0.01; W.axisRod.scale.y = Math.max(ax, 0.01);
    const po = TL.polaris(t);
    W.poleLine.visible = W.polarisStar.visible = po > 0.01;
    (W.poleLine.material as THREE.MeshBasicMaterial).opacity = 0.5 * po; (W.polarisStar.material as THREE.SpriteMaterial).opacity = po;
    W.tiltG.position.copy(p); W.tiltG.visible = TL.tiltArc(t) > 0.01;
    W.tiltG.children.forEach((m) => ((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (m === W.tiltG.children[0] ? 0.45 : 1) * TL.tiltArc(t));
    // ghosts
    W.ghosts.forEach((g, k) => {
      const s = TL.ghost(t, k); g.g.visible = s.o > 0.01; g.g.position.copy(s.pos);
      (g.m.material as THREE.MeshStandardMaterial).opacity = 0.85 * s.o; (g.rod.material as THREE.MeshBasicMaterial).opacity = 0.7 * s.o;
    });
    // the beam to New York and its 100 marbles
    const nyW = ll(TL.NY, TL.EARTH_R).applyQuaternion(q).add(p);
    const dir = nyW.clone().normalize(); // from the Sun (origin) toward New York
    const bOn = TL.beamOn(t), reach = TL.beamReach(t);
    W.beam.visible = bOn > 0.01;
    if (W.beam.visible) {
      const start = dir.clone().multiplyScalar(TL.SUN_R), end = nyW.clone().addScaledVector(dir, -2.2);
      const len = start.distanceTo(end) * reach;
      W.beam.position.copy(start).addScaledVector(dir, len / 2);
      W.beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      W.beam.scale.set(1.3, 1.3, Math.max(len, 0.01));
      (W.beam.material as THREE.ShaderMaterial).uniforms.uO.value = 0.9 * bOn;
    }
    // marbles: the last stretch before New York (beat 5) and the city beams (beat 9)
    let sm = W.spaceMarbles; let n = 0;
    const basis = (d: THREE.Vector3) => { const u = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize(); const w = new THREE.Vector3().crossVectors(u, d).normalize(); return {u, w}; };
    const stream = (target: THREE.Vector3, d: THREE.Vector3, k: number, grid: number, sp: number, on: number) => {
      if (on < 0.01) return;
      const {u, w} = basis(d);
      for (let wv = 0; wv < 3; wv++) for (let i = 0; i < grid; i++) for (let j = 0; j < grid; j++) {
        if (n >= 300) return;
        const ph = ((t * 0.9 + wv / 3 + random(`s${k}${i}${j}`) * 0.08) % 1);
        const off = u.clone().multiplyScalar((i - (grid - 1) / 2) * sp).addScaledVector(w, (j - (grid - 1) / 2) * sp);
        const pos = target.clone().add(off).addScaledVector(d, -2.4 * (1 - ph));
        setI(sm.core, n, pos, on * Math.min(1, (1 - ph) * 6)); setI(sm.halo, n, pos, on * Math.min(1, (1 - ph) * 6)); n++;
      }
    };
    if (bOn > 0.01) stream(nyW, dir, 0, 10, 0.045, TL.beamReach(t) > 0.85 ? bOn : 0);
    sm.core.count = sm.halo.count = n; sm.core.instanceMatrix.needsUpdate = sm.halo.instanceMatrix.needsUpdate = true;
    const syW = ll(TL.SYD, TL.EARTH_R).applyQuaternion(q).add(p), dS = syW.clone().normalize();
    const shaftTo = (m: THREE.Mesh, at: THREE.Vector3, d: THREE.Vector3, o: number) => {
      m.visible = o > 0.01; if (!m.visible) return; const L = 9;
      m.position.copy(at).addScaledVector(d, -L / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d);
      m.scale.set(0.55, 0.55, L); (m.material as THREE.ShaderMaterial).uniforms.uO.value = 0.9 * o;
    };
    shaftTo(W.cityShafts[0], nyW, dir, Math.max(TL.nyBeam(t), TL.endBeam(t)));
    shaftTo(W.cityShafts[1], syW, dS, TL.sydBeam(t));
    // footprints on the globe: stretched along the ground by 1/sin(elevation)
    const place = (f: THREE.Mesh, at: THREE.Vector3, d: THREE.Vector3, o: number) => {
      const nrm = at.clone().sub(p).normalize(); const sinE = Math.max(0.15, nrm.dot(d.clone().negate()));
      const hz = d.clone().negate().addScaledVector(nrm, -nrm.dot(d.clone().negate())).normalize(); const side = new THREE.Vector3().crossVectors(nrm, hz);
      f.position.copy(at).addScaledVector(nrm, 0.04);
      f.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(hz, side, nrm));
      const s = 0.75; f.scale.set(s / sinE, s, 1); (f.material as THREE.MeshBasicMaterial).opacity = 1.1 * sinE * o; f.visible = o > 0.01;
    };
    place(W.foot[0], nyW, dir, Math.max(TL.nyBeam(t), TL.endBeam(t)));
    place(W.foot[1], syW, dS, TL.sydBeam(t));
  } else {
    // ---------------- meadow
    const el = TL.sunElev(t), wk = TL.winterK(t);
    const o = W.skyOpts(el);
    const su = W.sky.material.uniforms; su.sunPosition.value.setFromSphericalCoords(1, ((90 - el) * Math.PI) / 180, 0); su.turbidity.value = o.turbidity!;
    const sc = sunColor(o);
    W.sunM.color.copy(sc.color); W.sunM.intensity = sc.intensity;
    (W.sunM.userData.sun as {direction: THREE.Vector3}).direction.copy(sc.direction);
    followSun(W.sunM, new THREE.Vector3(-4, 0, 0), false);
    const hs = W.Ls.skyIrradiance.clone().lerp(W.Lw.skyIrradiance, wk);
    W.hemi.color.copy(hs); W.hemi.intensity = 1;
    airUniforms.uAirColor.value.copy(W.airS.c).lerp(W.airW.c, wk); airUniforms.uAirSunColor.value.copy(W.airS.s).lerp(W.airW.s, wk);
    airUniforms.uSunDirW.value.copy(sc.direction);
    gl.toneMappingExposure = THREE.MathUtils.lerp(EXPO_S, EXPO_W, wk);
    snowU.uSnowAmt.value = TL.snowCover(t) > 0 ? 1 : 0; snowU.uSnowFront.value = THREE.MathUtils.lerp(-80, 40, TL.snowCover(t));
    const keep = TL.leafKeep(t);
    W.leafSets.forEach((set, k) => set.forEach((im) => (im.visible = keep > k / 4 + 0.01)));
    // tiles
    const sg = TL.summerGlow(t), wg = TL.winterGlow(t);
    (W.fillA.material as THREE.MeshBasicMaterial).opacity = 0.9 * sg + 0.28 * wg;
    (W.fillB.material as THREE.MeshBasicMaterial).opacity = 0.28 * wg;
    (W.sliverA.material as THREE.MeshBasicMaterial).opacity = 0.28 * wg; (W.sliverB.material as THREE.MeshBasicMaterial).opacity = 0.28 * wg;
    W.outline.children.forEach((m) => (((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.9 * TL.summerOutline(t)));
    // marbles: a wave of 100 every WAVE s along the beam; landing points on the ground
    const fm = W.fieldMarbles; let n = 0;
    const streamOf = (winter: boolean) => {
      const e = winter ? TL.ELEV_WINTER : TL.ELEV_SUMMER, rad = (e * Math.PI) / 180;
      const s = new THREE.Vector3(0, Math.sin(rad), Math.cos(rad));
      const zc = TL.PATCH_CENTRE(winter);
      const land = (i: number, j: number) => new THREE.Vector3((i - 4.5) * 0.4, 0.14, zc - ((j - 4.5) * 0.4) / Math.sin(rad));
      return {s, land};
    };
    const fly = (winter: boolean, [a, b]: [number, number]) => {
      const {s, land} = streamOf(winter);
      for (let wv = Math.floor((t - a - TL.FLY) / TL.WAVE); wv * TL.WAVE + a <= t; wv++) {
        const launch = a + wv * TL.WAVE; if (launch < a || launch > b) continue;
        for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
          const l0 = launch + random(`m${i}-${j}`) * 0.02, ph = (t - l0) / TL.FLY;
          if (ph < 0 || ph > 1 || n >= 300) continue;
          const pos = land(i, j).addScaledVector(s, TL.FLY_DIST * (1 - ph));
          setI(fm.core, n, pos); setI(fm.halo, n, pos); n++;
        }
      }
    };
    fly(false, TL.SUMMER_STREAM); fly(true, TL.WINTER_STREAM);
    // the shaft: summer until the winter time-lapse, winter from "same beam"
    const shW = t >= TL.B.winter, shO = shW ? TL.ramp(t, TL.WINTER_STREAM[0], TL.WINTER_STREAM[0] + 0.5) : TL.ramp(t, TL.SUMMER_STREAM[0], TL.SUMMER_STREAM[0] + 0.4) * (1 - TL.ramp(t, TL.B.winter - 0.3, TL.B.winter));
    W.shaft.visible = shO > 0.01;
    if (W.shaft.visible) {
      const {s} = streamOf(shW); const L = 30;
      W.shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), s);
      W.shaft.position.set(0, 0, TL.PATCH_CENTRE(shW)).addScaledVector(s, L / 2 - 0.2);
      W.shaft.scale.set(TL.BEAM, TL.BEAM, L); (W.shaft.material as THREE.ShaderMaterial).uniforms.uO.value = shO;
    }
    fm.core.count = fm.halo.count = n; fm.core.instanceMatrix.needsUpdate = fm.halo.instanceMatrix.needsUpdate = true;
    // landed dots: summer pattern until winter, then the winter pattern
    const winterDots = t >= TL.B.sameBeam + TL.FLY - 0.3;
    const {land} = streamOf(winterDots);
    let k = 0; for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) { const lp = land(i, j); lp.y = 0.08; setI(W.dots, k, lp); setI(W.dotGlow, k, lp); k++; }
    W.dots.instanceMatrix.needsUpdate = W.dotGlow.instanceMatrix.needsUpdate = true;
    const dotO = winterDots ? 0.3 * wg : sg;
    (W.dots.material as THREE.MeshBasicMaterial).opacity = dotO; (W.dotGlow.material as THREE.MeshBasicMaterial).opacity = 0.7 * dotO;
    W.dots.visible = W.dotGlow.visible = dotO > 0.01;
  }

  return (
    <>
      <group visible={!meadowOn}>
        <Stars fr={Math.round(t * 30)} count={6000} opacity={0.8} />
        <group position={earthState.pos} quaternion={earthState.q}>
          <Earth tex={earth} radius={TL.EARTH_R} day={1.25} night={0.7} air={1.1} sunVec={earthState.sunVec} snow={TL.snow(t)} warm={TL.warm(t)} melt={TL.melt(t)} />
        </group>
      </group>
    </>
  );
};

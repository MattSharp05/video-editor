// Builds the whole world once (sourced models + ours) and returns update(t) that poses everything for time t (s).
// Times come from timeline.ts (beats.json). Looks follow concept.md's visual language.
import * as THREE from 'three';
import {SkeletonUtils} from 'three/examples/jsm/Addons.js';
import type {Assets} from './assets';
import {fit} from './assets';
import {buildWorld, CROSS_Z, DESERT_Z} from './world';
import {makeRobotaxi, makeTesla, poseCar} from './cars';
import {L, lidarAll} from './lidar';
import {buildDesert, buildHumvee} from './desert';
import {buildCity, buildDriver, buildMap, buildPlan, buildPulses, buildRain, buildShell, buildTeslaNet, buildTiles, C, cone, ghostify, METROS} from './fx';
import {B, BIKE_Z, CAR_Z, LANE, ROBOTESLA_Z, STOP_Z, TESLA_X, YOU_START, bikeX, camAt, crossCarX, lidarMix, ramp, taxiX, taxiZ, teslaZ, walking, win, youX} from './timeline';

export type Built = ReturnType<typeof buildScene>;

const nightEnv = (gl: THREE.WebGLRenderer) => {
  const s = new THREE.Scene(); s.background = new THREE.Color('#06080e');
  const strip = new THREE.MeshBasicMaterial({color: new THREE.Color('#ffcf90').multiplyScalar(4)});
  for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.3), strip); const a = (i / 12) * Math.PI * 2; m.position.set(Math.cos(a) * 6, 2.6, Math.sin(a) * 6); s.add(m); }
  const win2 = new THREE.MeshBasicMaterial({color: new THREE.Color('#8fb0ff').multiplyScalar(0.6)});
  for (let i = 0; i < 30; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), win2); const a = (i / 30) * Math.PI * 2; m.position.set(Math.cos(a) * 9, 1 + (i % 5), Math.sin(a) * 9); m.lookAt(0, 2, 0); s.add(m); }
  const sky = new THREE.Mesh(new THREE.SphereGeometry(30, 16, 8), new THREE.MeshBasicMaterial({color: '#18223a', side: THREE.BackSide})); s.add(sky);
  const pm = new THREE.PMREMGenerator(gl); const env = pm.fromScene(s, 0.04).texture; pm.dispose();
  return env;
};

const WHITE = new THREE.Vector3();
export const buildScene = (a: Assets & {night: THREE.Texture}, gl: THREE.WebGLRenderer, off: string[] = []) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#060911');
  const fog = new THREE.FogExp2('#0a0f1c', 0.0045); scene.fog = fog;
  const world = buildWorld(); scene.add(world.group);
  // night sky: a gradient dome, warm city/horizon glow low, deep blue above (no fog on it)
  const sky = new THREE.Mesh(new THREE.SphereGeometry(4000, 32, 16), new THREE.ShaderMaterial({side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {glow: {value: 1}},
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec3 vP; uniform float glow; void main(){ float h = normalize(vP).y; vec3 top = vec3(0.012, 0.018, 0.045); vec3 hor = vec3(0.16, 0.10, 0.07) * glow; vec3 c = mix(hor, top, smoothstep(-0.02, 0.35, h)); gl_FragColor = vec4(c, 1.0); }'}));
  sky.renderOrder = -2; scene.add(sky);
  const env = nightEnv(gl);

  scene.add(new THREE.HemisphereLight('#3a4870', '#14110e', 1.4));
  const moon = new THREE.DirectionalLight('#9fb4ff', 0.5); moon.position.set(30, 60, -20); scene.add(moon);
  // the corner lamp over the crosswalk (shadows), plus a few unshadowed lamps along the hero block
  const key = new THREE.SpotLight('#ffd6a0', 260, 45, 0.95, 0.6, 1.5); key.position.set(-8.4, 7.3, CROSS_Z - 1.5); key.target.position.set(-4, 0, CROSS_Z - 3);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; scene.add(key, key.target);
  const near = world.lamps.filter((p) => p.z > -40 && p.z < 60);
  near.slice(0, off.includes('lights') ? 0 : 2).forEach((p) => { const l = new THREE.PointLight('#ffcf98', 70, 26, 1.6); l.position.copy(p); scene.add(l); });
  // lamps over the Tesla blocks (moved along with the action)
  const roam = [0, 1].map(() => { const l = new THREE.PointLight('#ffcf98', 70, 26, 1.6); scene.add(l); return l; });
  // low dusk sun for the desert, with its own shadow map over the vehicle (on only while the desert is in view)
  const desertLight = new THREE.DirectionalLight('#ffd6b0', 0); desertLight.position.set(45, 16, DESERT_Z - 55); desertLight.target.position.set(0, 0, DESERT_Z); scene.add(desertLight, desertLight.target);
  const desertFill = new THREE.HemisphereLight('#8fa6d8', '#6b5440', 0); scene.add(desertFill);
  desertLight.castShadow = true; desertLight.shadow.mapSize.set(2048, 2048); desertLight.shadow.bias = -0.0005; desertLight.shadow.normalBias = 0.03;
  Object.assign(desertLight.shadow.camera, {left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 160});

  const taxi = makeRobotaxi(a.robotaxi); scene.add(taxi.root);
  const tesla = makeTesla(a.tesla, '#cfd4da'); scene.add(tesla.root);
  const robotesla = makeTesla(a.tesla, '#e8eaec'); scene.add(robotesla.root);
  const crossCar = makeTesla(a.tesla, '#2a3242'); scene.add(crossCar.root);
  [taxi, tesla, robotesla, crossCar].forEach((c) => c.root.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial; if (m && 'envMap' in m) { m.envMap = env; m.envMapIntensity = 1.0; } }));
  const driver = buildDriver(); tesla.root.add(driver.group); driver.group.position.set(0.38, 0, 0.25);

  // you: the walking scan (CC BY), its walk cycle sampled by time; orange is yours only
  const walkerSrc = SkeletonUtils.clone(a.walker.scene);
  const you = fit(walkerSrc, 1.78, 'height', 0, false); scene.add(you);
  const clip = a.walker.animations[0]; const mixer = new THREE.AnimationMixer(walkerSrc); mixer.clipAction(clip).play();
  you.traverse((o) => { (o as THREE.Mesh).castShadow = true; (o as THREE.Mesh).frustumCulled = false; });
  const youGlow = {value: 0}; lidarAll(you, undefined, youGlow);
  // your ghosts (three possible futures): crossing, waiting, turning back
  const ghosts = [0, 1, 2].map(() => { const s = SkeletonUtils.clone(a.walker.scene); const o = fit(s, 1.78, 'height', 0, false); const mx = new THREE.AnimationMixer(s); mx.clipAction(clip).play(); const mat = ghostify(o, 0.3); o.traverse((c) => { (c as THREE.Mesh).frustumCulled = false; }); scene.add(o); return {o, mx, mat}; });

  const cyclist = fit(SkeletonUtils.clone(a.cyclist), 1.8, 'length'); scene.add(cyclist); cyclist.traverse((o) => { (o as THREE.Mesh).castShadow = true; (o as THREE.Mesh).frustumCulled = false; });
  const bikeMove = {value: 0}; lidarAll(cyclist, bikeMove);
  const bikeGhosts = [0, 1].map(() => { const o = fit(SkeletonUtils.clone(a.cyclist), 1.8, 'length'); const mat = ghostify(o, 0.25); o.traverse((c) => { (c as THREE.Mesh).frustumCulled = false; }); scene.add(o); return {o, mat}; });
  const carGhosts = [0, 1].map(() => { const c = makeTesla(a.tesla); const mat = ghostify(c.root, 0.22); scene.add(c.root); return {c, mat}; });

  const city = buildCity(); scene.add(city.group);
  const desert = buildDesert(a); scene.add(desert);
  const truck = buildHumvee(a.humvee); scene.add(truck);
  const pulses = buildPulses(); scene.add(pulses.group);
  const shell = buildShell(); scene.add(shell);
  const rain = buildRain(); scene.add(rain.mesh);
  const winCone = cone(9, 0.42); scene.add(winCone);
  const plan = buildPlan(); scene.add(plan.group);
  const tiles = buildTiles(); scene.add(tiles.group);
  const net = buildTeslaNet(); tesla.root.add(net.group);
  const ghostDome = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.45, 24), new THREE.MeshBasicMaterial({color: C.lidar, wireframe: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending}));
  tesla.root.add(ghostDome); ghostDome.position.set(0, 1.95, -0.2);
  const map = buildMap(a.night); scene.add(map.group);

  // plan paths: a fan from the robotaxi's bumper; the ones that go now cross your crossing ghost and pop
  const bumper = new THREE.Vector3(LANE, 0, STOP_Z + 2.4);
  const fan = Array.from({length: plan.N}, (_, i) => {
    const ang = ((i / (plan.N - 1)) - 0.5) * 1.1, len = 12 + (i % 5) * 4, wait = i === Math.floor(plan.N / 2);
    return {ang, len, wait};
  });
  const pathPt = (f: {ang: number; len: number; wait: boolean}, k: number) => {
    if (f.wait) return bumper.clone().add(new THREE.Vector3(0, 0, Math.min(k * f.len, 3.8))); // stops at the stop line
    const d = k * f.len; return bumper.clone().add(new THREE.Vector3(Math.sin(f.ang * k) * d * 0.6, 0, d));
  };
  const finalRibbon = Array.from({length: 40}, (_, i) => { const k = i / 39; return new THREE.Vector3(LANE + 2.2 * Math.sin(Math.min(1, k * 1.6) * Math.PI / 2) * (k < 0.9 ? 1 : 1), 0, STOP_Z + 2.4 + k * 30); });

  const P = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), M = new THREE.Matrix4();
  const update = (t: number) => {
    const cam = camAt(t); const alt = cam.pos.y;
    fog.density = 0.0045 * THREE.MathUtils.clamp(40 / Math.max(alt, 1), 0.0, 1) * (t > B.this_year && t < B.first ? 0.35 : 1);
    { const dsk = win(t, B.y2004 + 0.9, B.this_year + 0.6, 0.6, 0.8); fog.color.set('#0a0f1c').lerp(new THREE.Color('#5d5560'), dsk); (sky.material as THREE.ShaderMaterial).uniforms.glow.value = 1 + 3.2 * dsk; fog.density = THREE.MathUtils.lerp(fog.density, 0.0028, dsk); }
    sky.position.copy(cam.pos); sky.scale.setScalar((cam.far * 0.8) / 4000); sky.visible = alt < 30000;
    world.group.visible = alt < 30000; city.group.visible = alt < 300000 && ((t > B.this_year - 0.6 && t < B.first + 0.2) || (t > B.cracked && t < B.sees));
    // ---- robotaxi ----
    const tzz = taxiZ(t); poseCar(taxi, taxiX(t), tzz, 0, tzz - taxiZ(0));
    if (taxi.spinner) taxi.spinner.rotation.y = t * Math.PI * 2 * 1.2;
    L.pos.value.set(taxiX(t), 1.85, tzz - 0.25);
    taxi.lights.head.forEach((m) => { m.emissiveIntensity = 3; });
    // ---- you ----
    const yx = youX(t); you.position.set(yx, yx > -7 && yx < 7 ? 0 : 0.15, YOU_START.z); you.rotation.y = Math.PI / 2;
    mixer.setTime(walking(t) ? (t * 1.0) % clip.duration : 0.55);
    youGlow.value = Math.max(win(t, B.see_you + 0.28, B.first - 0.3, 0.12, 0.4), win(t, B.fires + 0.75, B.signs, 0.08, 0.5) * 0.85, win(t, B.guesses, B.sim, 0.3, 0.6) * 0.8, win(t, B.sees + 0.2, 99, 0.15, 0));
    // ---- hook ring, and the finale ring ----
    const ringT = t < 20 ? B.see_you : B.sees; L.ring.value = win(t, ringT, ringT + 0.9, 0.02, 0.4); L.ringR.value = Math.max(0, (t - ringT) * 26);
    // ---- lidar ----
    L.mix.value = lidarMix(t);
    L.dots.value = Math.max(ramp(t, B.building - 0.2, B.building + 0.1) * (1 - ramp(t, B.cams_only, B.no_lidar)), win(t, B.sees, 99, 0.1, 0));
    L.start.value = Math.atan2(CROSS_Z - tzz, -8 - LANE);
    L.sweep.value = t < B.sees - 1 ? ramp(t, B.building, B.street3d) * 6.3 : ramp(t, B.sees - 0.1, B.sees + 0.8) * 6.3;
    if (L.sweep.value > 6.28) L.sweep.value = 7;
    // pulses: one to your shoulder and back (40 ns), one to a far building (still out when ours is home)
    const shoulder = new THREE.Vector3(yx, 1.45, YOU_START.z), dome = L.pos.value.clone();
    const pk = ramp(t, B.fires, B.times) * 2; pulses.pose(pulses.a, pulses.line, dome, shoulder, pk, t > B.fires && t < B.times + 0.25);
    const farPt = new THREE.Vector3(-14.5, 6, CROSS_Z + 38); const fk = THREE.MathUtils.clamp((t - B.fires) / ((B.times - B.fires) * 5), 0, 2) * 1;
    pulses.pose(pulses.b, pulses.lineB, dome, farPt, fk * 2, t > B.fires + 0.05 && t < B.building + 0.2);
    // ---- 2004 desert ----
    truck.visible = t < B.first; desert.visible = t < B.first + 0.5;
    const dk = win(t, B.y2004 + 0.5, B.this_year + 2, 0.5, 1.0); desertLight.intensity = 4.2 * dk; desertFill.intensity = 1.1 * dk; desertFill.visible = dk > 0.001; desertLight.visible = dk > 0.001;
    // stuck: the engine revs, the body rocks on its springs, the rear wheels spray sand
    { const rest = truck.userData.rest as THREE.Vector3; truck.position.set(rest.x, rest.y + 0.03 * Math.sin(t * 31) * Math.sin(t * 2.3), rest.z - 0.04 * Math.sin(t * 17));
      truck.rotation.x = -0.16 + 0.012 * Math.sin(t * 23); truck.rotation.z = 0.03 + 0.01 * Math.sin(t * 13); }
    { const pa = world.desertDust.geometry.getAttribute('position') as THREE.BufferAttribute; const rest = truck.userData.rest as THREE.Vector3;
      for (let i = 0; i < pa.count; i++) { const ph = ((i * 0.618) + t * 0.9) % 1, side = i % 2 ? 1 : -1, sp = 0.5 + (i % 9) / 9, j = Math.sin(i * 12.9898) * 0.5;
        pa.setXYZ(i, rest.x + side * (0.95 + ph * 1.6 * sp) + j * ph, rest.y + 0.15 + 2.2 * ph * (1.2 - ph) * sp, rest.z - 1.7 - ph * 5.5 * sp + j); }
      pa.needsUpdate = true; } (world.desertDust.material as THREE.PointsMaterial).opacity = 0.22 * win(t, B.y2004 + 0.8, B.this_year + 1.5, 0.5, 0.8);
    // ---- aerial city trails ----
    city.update(t, win(t, B.this_year + 0.4, B.first - 0.2, 0.8, 0.3));
    // ---- radar: shell from the bumper, the cyclist turns violet with its speed ----
    const sh = ramp(t, B.radar + 0.05, B.speed + 0.6) * 0.6; shell.visible = t > B.radar && t < B.speed + 0.9;
    shell.position.set(LANE, 0.4, STOP_Z + 2.3); shell.scale.setScalar(0.5 + sh * 26); (shell.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - sh); ((shell.getObjectByName('fill') as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.18 * (1 - sh);
    bikeMove.value = win(t, B.speed - 0.05, B.cameras + 0.2, 0.1, 0.4);
    cyclist.position.set(bikeX(t), 0, BIKE_Z); cyclist.rotation.y = -Math.PI / 2;
    // ---- rain ----
    rain.update(t, cam.pos, win(t, B.rain - 0.6, B.sim, 0.8, 1.0));
    // ---- camera cone: windscreen up to the light and the sign ----
    const cc = win(t, B.cameras - 0.05, B.seeing + 0.2, 0.2, 0.35); winCone.visible = cc > 0.01;
    const lens = new THREE.Vector3(taxiX(t), 1.35, tzz + 0.6); winCone.position.copy(lens);
    const aimP = new THREE.Vector3().lerpVectors(new THREE.Vector3(LANE, 1.2, CROSS_Z + 6), new THREE.Vector3(LANE - 0.3, 4.6, CROSS_Z - 2.2), ramp(t, B.lights - 0.2, B.lights + 0.4));
    aimP.lerp(new THREE.Vector3(-7.5, 2.3, CROSS_Z - 6), ramp(t, B.signs - 0.15, B.signs + 0.25) * 0.85);
    winCone.lookAt(aimP); winCone.scale.setScalar(Math.max(0.001, cc));
    L.camO.value.copy(lens); L.camD.value.subVectors(aimP, lens).normalize(); L.camCos.value = Math.cos(0.42); L.camA.value = cc;
    world.tl.setState(t < B.plans + 2.5 ? 'red' : 'green', 1);
    // ---- futures: your ghosts, the bike's, the cross car's ----
    const gk = win(t, B.guesses, B.sim - 0.3, 0.3, 0.6);
    const youPaths = [new THREE.Vector3(1.35, 0, 0), new THREE.Vector3(0, 0, 0.0), new THREE.Vector3(-0.9, 0, -0.5)];
    ghosts.forEach((gh, i) => {
      const lead = ramp(t, B.guesses + i * 0.12, B.people + 0.6); const likely = i === 0 ? 1 + 1.6 * ramp(t, B.next - 0.2, B.next + 0.3) : 1 - 0.5 * ramp(t, B.next - 0.2, B.next + 0.3);
      gh.o.visible = gk > 0.01 && t < B.plans + 0.6;
      gh.o.position.set(YOU_START.x + youPaths[i].x * 2.4 * lead, 0.15, YOU_START.z + youPaths[i].z * 2.4 * lead);
      gh.o.rotation.y = i === 2 ? -Math.PI / 2 : Math.PI / 2; gh.mx.setTime(i === 1 ? 0.55 : (0.3 + i * 0.5));
      gh.mat.opacity = 0.32 * gk * likely;
    });
    if (t > B.sees) {
      const fg = win(t, B.guess2 - 0.1, 99, 0.25, 0); const g0 = ghosts[0];
      g0.o.visible = fg > 0.01; g0.o.position.set(yx + 2.2 * ramp(t, B.guess2 - 0.1, B.guess2 + 0.5), 0.0, YOU_START.z); g0.o.rotation.y = Math.PI / 2;
      g0.mx.setTime((t * 1.0 + 0.4) % clip.duration); g0.mat.opacity = 0.4 * fg;
    }
    bikeGhosts.forEach((gh, i) => {
      const lead = ramp(t, B.bikes - 0.1, B.bikes + 0.6); gh.o.visible = gk > 0.01 && t < B.plans + 0.6;
      const bx = bikeX(t) - 6 * lead * (i ? 0.7 : 1);
      gh.o.position.set(bx, 0, BIKE_Z - (i ? 3.5 * lead : 0)); gh.o.rotation.y = -Math.PI / 2 + (i ? -0.6 * lead : 0); gh.mat.opacity = 0.3 * gk;
    });
    const ccx = crossCarX(t); poseCar(crossCar, ccx, CAR_Z, Math.PI / 2, 0);
    carGhosts.forEach((gh, i) => {
      const lead = ramp(t, B.cars - 0.1, B.cars + 0.6); gh.c.root.visible = gk > 0.01 && t < B.plans + 0.6;
      poseCar(gh.c, ccx + 9 * lead * (i ? 0.6 : 1), CAR_Z - (i ? 5 * lead : 0), Math.PI / 2 - (i ? 0.7 * lead : 0), 0); gh.mat.opacity = 0.3 * gk;
    });
    // ---- the plan: bursts of ghost cars; those that would go now pop; the one that waits turns green ----
    const bursts = [B.plans + 0.25, B.again1, B.again2];
    let live = 0;
    for (let i = 0; i < plan.N; i++) {
      let s = 0; let p = bumper; let col = C.ghost; let yaw = 0;
      for (const b0 of bursts) {
        const k = THREE.MathUtils.clamp((t - b0) / 0.55, 0, 1.4); if (t < b0 || t > b0 + 0.9) continue;
        const f = fan[i]; p = pathPt(f, Math.min(k, 1)); const p2 = pathPt(f, Math.min(k + 0.02, 1));
        yaw = Math.atan2(p2.x - p.x, p2.z - p.z + 1e-6);
        const popped = !f.wait && p.z > CROSS_Z - 2.5; const popK = popped ? THREE.MathUtils.clamp((p.z - (CROSS_Z - 2.5)) / 3, 0, 1) : 0;
        s = f.wait ? 1 : (1 - popK) * (1 + popK * 0.6); col = f.wait && k > 0.6 ? C.plan : C.ghost; if (s > 0) live++;
      }
      M.compose(p, Q.setFromEuler(new THREE.Euler(0, yaw, 0)), S.set(s * 0.9, s * 0.9, s * 0.9)); plan.mesh.setMatrixAt(i, M); plan.mesh.setColorAt(i, new THREE.Color(col));
    }
    plan.mesh.instanceMatrix.needsUpdate = true; if (plan.mesh.instanceColor) plan.mesh.instanceColor.needsUpdate = true; plan.mesh.visible = live > 0;
    // ribbon: first to the stop line (wait), then, once you are clear, on through the crossing
    const rWait = ramp(t, B.path - 0.2, B.path + 0.4), rGo = ramp(t, B.again2 + 0.4, B.sim + 0.6);
    const ribbonPts = Array.from({length: 40}, (_, i) => new THREE.Vector3(LANE, 0, STOP_Z + 2.4 + (i / 39) * (3.8 + 30 * rGo)));
    const finK = ramp(t, B.drives - 0.2, B.drives + 0.6);
    if (t > B.sees) { plan.setRibbon(finalRibbon, Math.max(0.05, finK)); plan.ribbonMat.opacity = 0.85 * finK; }
    else { plan.setRibbon(ribbonPts, 1); plan.ribbonMat.opacity = 0.85 * Math.min(rWait, 1 - ramp(t, B.tesla - 1.0, B.tesla)); }
    plan.ribbon.visible = plan.ribbonMat.opacity > 0.01;
    // ---- practice tiles ----
    tiles.update(ramp(t, B.billion - 0.6, B.simulation + 0.8) * (1 - ramp(t, B.tesla + 0.3, B.cams_only - 0.4)), t, 0.4);
    // ---- Tesla: cameras, no dome, the network, the wheel ----
    const tzT = teslaZ(t); poseCar(tesla, TESLA_X, tzT, 0, 0);
    roam.forEach((l, i) => l.position.set(i === 1 ? -8.4 : -1, 7.2, (t < B.robotaxis - 0.5 ? tzT : ROBOTESLA_Z) + (i - 1) * 9));
    net.update(t, {cones: win(t, B.cams_only - 0.1, B.buy + 0.3, 0.6, 0.6), streams: win(t, B.one_net - 0.1, B.buy + 0.4, 0.4, 0.5), knot: win(t, B.one_net - 0.15, B.buy + 0.4, 0.35, 0.5), beam: win(t, B.turns, B.buy + 0.4, 0.3, 0.4)}, new THREE.Vector3(0.38, 1.05, 0.55));
    const gd = win(t, B.no_lidar - 0.1, B.no_lidar + 0.7, 0.12, 0.3); ghostDome.visible = gd > 0.01; ghostDome.scale.set(1, Math.max(0.01, gd), 1); ghostDome.position.y = 1.95 + 0.7 * ramp(t, B.no_lidar + 0.1, B.no_lidar + 0.8);
    (ghostDome.material as THREE.MeshBasicMaterial).opacity = 0.7 * gd;
    driver.eyeCone.visible = t > B.buy - 0.3 && t < B.robotaxis + 0.5; driver.eyeCone.scale.setScalar(Math.max(0.001, win(t, B.buy, B.robotaxis, 0.3, 0.4)));
    poseCar(robotesla, LANE, ROBOTESLA_Z, 0, 0);
    // ---- map ----
    const mk = ramp(alt, 2500, 50000); map.group.visible = mk > 0.001; map.mat.opacity = mk;
    const dotSize = alt * 0.009;
    map.dots.forEach((d, i) => { const t0 = B.cities + i * 0.07; const on = ramp(t, t0, t0 + 0.25); d.scale.setScalar(Math.max(0.001, dotSize * on)); d.visible = on > 0.01 && mk > 0.01;
      // each metro sends out a ring when it lights, then keeps a slow pulse
      const halo = d.children[0] as THREE.Mesh; const ph = Math.max(0, t - t0) % 1.4 / 1.4;
      halo.scale.setScalar(0.5 + 3.2 * ph); (halo.material as THREE.MeshBasicMaterial).opacity = 0.45 * (1 - ph) * on; });
    if (off.includes('you')) you.visible = false;
    if (off.includes('ghosts')) ghosts.forEach((g) => { g.o.visible = false; });
    if (off.includes('bike')) cyclist.visible = false;
    void P; void WHITE; void METROS;
  };
  return {scene, update, taxi, you, cyclist, tesla, robotesla};
};

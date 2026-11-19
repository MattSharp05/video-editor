// One world: a wooden strip floor in late-afternoon window light (the room), and a vast hall floor of the same boards.
// Matches (instanced sticks + heads), amber glows on the cracks they cross, a copper wire that bends into a hoop,
// ice measuring ticks. Built once; per frame only instance matrices and colours, the wire's shape and the camera
// change, all from timeline.ts.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import * as TL from './timeline';
import {DROPS, D, L, N, ROOM_N} from './sim';

const col = (h: string) => new THREE.Color(h);
export type Assets = {boards: HTMLImageElement};
const STICK = col('#E6CFA0'), HEAD = col('#7A2A1E'), AMB = col(TL.AMBER), ICE = col(TL.ICE);
const AMBER_STICK = col('#FFC873');
const N_SPECIAL = 6; // measuring match, demo cross, demo miss, three row matches
const ROOM_COUNT = ROOM_N + N_SPECIAL;

// the board floor as a canvas: each 6 cm board is one strip of the wood atlas at a random offset and tint, with a dark
// 1.5 mm crack along its lower edge
const floorTexture = (img: HTMLImageElement, wcm: number, hcm: number, pxcm: number, seed: number) => {
  const c = document.createElement('canvas'); c.width = Math.round(wcm * pxcm); c.height = Math.round(hcm * pxcm);
  const g = c.getContext('2d')!; const bh = D * pxcm; const strips = img.height / 96;
  for (let b = 0; b * bh < c.height; b++) {
    const h = (k: number) => { const x = Math.sin((b + seed) * 91.7 + k * 13.1) * 43758.5; return x - Math.floor(x); };
    const s = Math.floor(h(1) * strips), off = h(2) * img.width;
    const y = b * bh;
    // board lengths: long pieces with a hairline butt joint, staggered
    for (let x = -off; x < c.width; x += img.width * 1.1) g.drawImage(img, 0, s * 96, img.width, 96, x, y, img.width * 1.1, bh);
    g.fillStyle = `rgba(${h(3) > 0.5 ? '255,236,200' : '60,30,10'},${0.04 + 0.08 * h(4)})`; g.fillRect(0, y, c.width, bh);
    // bevel light on the upper edge, shade on the lower
    const gr = g.createLinearGradient(0, y, 0, y + bh);
    gr.addColorStop(0, 'rgba(255,240,210,0.10)'); gr.addColorStop(0.08, 'rgba(255,240,210,0)'); gr.addColorStop(0.9, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,8,0,0.25)');
    g.fillStyle = gr; g.fillRect(0, y, c.width, bh);
    // the crack: the line z = k·D sits at the top of each board (canvas y = b·bh)
    g.fillStyle = '#1B0F07'; g.fillRect(0, y - 0.075 * pxcm, c.width, 0.15 * pxcm);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter; return t;
};
const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t;
};

// a match: stick from -L/2 to L/2 - head, head ellipsoid at +L/2; long axis = local x
const stickGeo = () => { const g = new THREE.BoxGeometry(L - 0.42, 0.22, 0.22, 1, 1, 1); g.translate(-0.21, 0.11, 0); return g; };
const headGeo = () => { const g = new THREE.SphereGeometry(0.21, 10, 8); g.scale(1.45, 1.05, 1.15); g.translate(L / 2 - 0.3, 0.13, 0); return g; };

const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S = new THREE.Vector3(), C = new THREE.Color();
const setPose = (mesh: THREE.InstancedMesh, i: number, x: number, y: number, z: number, a: number, tilt = 0, spin = 0, s = 1) => {
  // angle a in the floor plane: direction (cos a, sin a) in (x, z); three's y-rotation is clockwise seen from above
  E.set(tilt, -a, spin, 'YXZ'); Q.setFromEuler(E); P.set(x, y, z); S.set(s, s, s); M.compose(P, Q, S); mesh.setMatrixAt(i, M);
};

export const Scene: React.FC<{t: number; assets: Assets}> = ({t, assets}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const root = new THREE.Group(); scene.add(root);
    const gtex = glowTex();

    // environment for the copper: a warm room, mid-grey (a dark env background turns polished metal black)
    const pm = new THREE.PMREMGenerator(gl); const es = new THREE.Scene(); es.background = col('#6B625A');
    const panel = (w: number, h: number, c: string, k: number, pos: [number, number, number]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: col(c).multiplyScalar(k), side: THREE.DoubleSide})); m.position.set(...pos); m.lookAt(0, 0, 0); es.add(m); };
    panel(4, 3, '#FFE2B8', 4, [-5, 3, -4]); panel(10, 10, '#8A5A30', 0.9, [0, -4, 0]); panel(6, 6, '#B8C8E0', 0.8, [4, 5, 3]);
    const env = pm.fromScene(es, 0.03).texture;

    // light: low sun through a window (frame-left, far), sky fill
    const hemi = new THREE.HemisphereLight(col('#B8C8E0'), col('#4A3424'), 0.7); root.add(hemi);
    const sunDir = new THREE.Vector3(-0.62, 0.42, -0.66).normalize();
    const sun = new THREE.DirectionalLight(col('#FFD7A0'), 3.4); sun.position.copy(sunDir.clone().multiplyScalar(300)).add(new THREE.Vector3(15, 0, 0));
    sun.target.position.set(15, 0, 0); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    Object.assign(sun.shadow.camera, {left: -80, right: 80, top: 80, bottom: -80, near: 100, far: 520}); root.add(sun, sun.target);
    // the hall: high, cooler light, no shadows needed at that size
    const hallSun = new THREE.DirectionalLight(col('#FFE8CC'), 0); hallSun.position.set(TL.HALL.x - 600, 900, TL.HALL.z - 500); hallSun.target.position.set(TL.HALL.x, 0, TL.HALL.z); root.add(hallSun, hallSun.target);

    // floors
    const roomTex = floorTexture(assets.boards, 240, 192, 14, 3);
    const floorMat = (map: THREE.Texture) => new THREE.MeshStandardMaterial({map, roughness: 0.62, metalness: 0});
    const room = new THREE.Mesh(new THREE.PlaneGeometry(240, 192), floorMat(roomTex));
    room.rotation.x = -Math.PI / 2; room.position.set(20, 0, -6); room.receiveShadow = true; root.add(room);
    // canvas y=0 is the plane's far edge (z = -6 - 96 = -102): a multiple of D, so canvas board lines land on z = k·D
    const hallTex = floorTexture(assets.boards, 192, 192, 5, 11); hallTex.wrapS = hallTex.wrapT = THREE.RepeatWrapping;
    const HALL_SIZE = 2400; hallTex.repeat.set(HALL_SIZE / 192, HALL_SIZE / 192);
    const hall = new THREE.Mesh(new THREE.PlaneGeometry(HALL_SIZE, HALL_SIZE), floorMat(hallTex));
    hall.rotation.x = -Math.PI / 2; hall.position.set(TL.HALL.x, 0, TL.HALL.z); root.add(hall);
    // matches: the room's 200 + specials, and the hall's 20,000
    const mkMatches = (n: number, shadows: boolean) => {
      const sm = new THREE.InstancedMesh(stickGeo(), new THREE.MeshStandardMaterial({roughness: 0.72, metalness: 0}), n);
      const hm = new THREE.InstancedMesh(headGeo(), new THREE.MeshStandardMaterial({roughness: 0.55, metalness: 0}), n);
      for (let i = 0; i < n; i++) { sm.setColorAt(i, STICK); hm.setColorAt(i, HEAD); }
      sm.castShadow = hm.castShadow = shadows; sm.frustumCulled = hm.frustumCulled = false;
      root.add(sm, hm); return {sm, hm};
    };
    const roomM = mkMatches(ROOM_COUNT, true), hallM = mkMatches(N, false);
    const mkGlow = (n: number) => {
      const g = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({map: gtex, color: AMB, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false}), n);
      g.geometry.rotateX(-Math.PI / 2); g.frustumCulled = false; g.renderOrder = 2; root.add(g); return g;
    };
    const roomGlow = mkGlow(ROOM_N + 1), hallGlow = mkGlow(N), dots = mkGlow(12);
    // ice ticks for the measuring match (two bars over the cracks it spans) and the stub of the π row
    const iceMat = new THREE.MeshBasicMaterial({color: ICE, transparent: true, toneMapped: false});
    const ticks = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.18), iceMat); m.rotation.x = -Math.PI / 2; root.add(m); return m; });
    const stub = new THREE.Mesh(new THREE.BoxGeometry(TL.STUB, 0.12, 0.3), new THREE.MeshBasicMaterial({color: ICE, transparent: true, toneMapped: false})); root.add(stub);
    // the copper wire: rebuilt per frame as a tube; four straight pieces after the cut
    const copper = new THREE.MeshStandardMaterial({color: col('#C87A4A'), metalness: 1, roughness: 0.32, envMap: env, envMapIntensity: 1.2});
    const wire = new THREE.Mesh(new THREE.BufferGeometry(), copper); wire.castShadow = true; root.add(wire);
    const pieces = [L, L, L, TL.STUB].map((len) => { const g = new THREE.CylinderGeometry(0.1, 0.1, len, 10); g.rotateZ(Math.PI / 2); const m = new THREE.Mesh(g, copper); m.castShadow = true; root.add(m); return m; });

    return {roomM, hallM, roomGlow, hallGlow, dots, ticks, stub, wire, pieces, sun, hallSun, hemi, root};
  }, [gl, scene, assets]);

  // ---------- per frame
  const hallOn = t >= TL.CUT_HALL;
  scene.background = col(hallOn ? '#2A231D' : '#1A120C');
  scene.fog = null;
  W.sun.castShadow = !hallOn; W.hallSun.intensity = 0; W.hemi.intensity = 0.7;

  // room matches
  const {sm, hm} = W.roomM;
  for (let i = 0; i < ROOM_N; i++) {
    const base = TL.roomBase(i);
    let p = TL.fallPose(t, TL.landRoom(i), base.x, base.z, base.a, i);
    const rk = TL.raftK(t, i);
    if (rk > 0) {
      const slot = TL.raftSlot(i), lift = 2.2 * Math.sin(Math.PI * rk);
      // turn the short way to lie along z (a = π/2)
      p = {...p, x: TL.lerp(base.x, slot.x, rk), z: TL.lerp(base.z, slot.z, rk), y: 0.12 + lift, a: TL.lerp(base.a, Math.PI / 2, rk), tilt: 0, spin: 0};
    }
    const vis = hallOn ? 0 : p.vis;
    setPose(sm, i, p.x, p.y - 0.12, p.z, p.a, p.tilt, p.spin, vis); setPose(hm, i, p.x, p.y - 0.12, p.z, p.a, p.tilt, p.spin, vis);
    const lit = TL.lit(t, i), dim = TL.dimmed(t, i);
    C.copy(STICK).lerp(AMBER_STICK, lit).multiplyScalar((1 + 0.25 * lit) * (1 - 0.45 * dim)); sm.setColorAt(i, C);
    C.copy(HEAD).multiplyScalar(1 - 0.45 * dim); hm.setColorAt(i, C);
    // its glow on the crack (only before the rafts move it away)
    const d = DROPS[i], pts = d.cross ? TL.crossPoints(base.x, base.z, base.a, L) : [];
    const g = lit * (1 - TL.ramp(t, TL.raftStart(i), TL.raftStart(i) + 0.2)) * (hallOn ? 0 : 1);
    if (pts.length) { P.set(pts[0][0], 0.04, pts[0][1]); S.set(3.2 * g + 1e-4, 1, 1.1 * g + 1e-4); M.compose(P, Q.identity(), S); W.roomGlow.setMatrixAt(i, M); }
    else { M.makeScale(0, 0, 0); W.roomGlow.setMatrixAt(i, M); }
  }
  // specials: measuring match, demo cross, demo miss, three row matches
  const sp = (k: number, x: number, z: number, a: number, land: number, show: number, lit = 0, dim = 0) => {
    const p = TL.fallPose(t, land, x, z, a, 900 + k), i = ROOM_N + k, v = hallOn ? 0 : p.vis * show;
    setPose(sm, i, p.x, p.y - 0.12, p.z, p.a, p.tilt, p.spin, v); setPose(hm, i, p.x, p.y - 0.12, p.z, p.a, p.tilt, p.spin, v);
    C.copy(STICK).lerp(AMBER_STICK, lit).multiplyScalar((1 + 0.25 * lit) * (1 - 0.45 * dim)); sm.setColorAt(i, C);
    C.copy(HEAD).multiplyScalar(1 - 0.45 * dim); hm.setColorAt(i, C);
  };
  const specialsOut = 1 - TL.ramp(t, TL.B.most - 0.2, TL.B.most + 0.3); // the measuring board clears before the reveal
  sp(0, TL.MEASURE.x, TL.MEASURE.z, TL.MEASURE.a, TL.measureLand(), specialsOut);
  const dl = TL.demoLit(t);
  sp(1, TL.DEMO.cross.x, TL.DEMO.cross.z, TL.DEMO.cross.a, TL.demoLand(0), specialsOut, dl);
  sp(2, TL.DEMO.miss.x, TL.DEMO.miss.z, TL.DEMO.miss.a, TL.demoLand(1), specialsOut, 0, dl);
  { const pts = TL.crossPoints(TL.DEMO.cross.x, TL.DEMO.cross.z, TL.DEMO.cross.a, L); P.set(pts[0][0], 0.04, pts[0][1]); S.set(3.2 * dl + 1e-4, 1, 1.1 * dl + 1e-4); M.compose(P, Q.identity(), S); W.roomGlow.setMatrixAt(ROOM_N, M); }
  // the π row: three matches slide in from the left beside the straight wire, and stay through "sixty-four percent"
  const rin = TL.rowIn(t) * (1 - TL.ramp(t, TL.B.cutIt + 0.1, TL.B.cutIt + 0.5)) + TL.piecesHome(t);
  for (let j = 0; j < 3; j++) {
    const r = TL.rowMatch(j), i = ROOM_N + 3 + j, k = TL.ramp(rin, j * 0.15, 0.55 + j * 0.15);
    setPose(sm, i, r.x - 30 * (1 - k), 0, r.z, 0, 0, 0, k > 0.001 && !hallOn ? 1 : 0); setPose(hm, i, r.x - 30 * (1 - k), 0, r.z, 0, 0, 0, k > 0.001 && !hallOn ? 1 : 0);
  }
  sm.instanceMatrix.needsUpdate = hm.instanceMatrix.needsUpdate = true; sm.instanceColor!.needsUpdate = hm.instanceColor!.needsUpdate = true;
  W.roomGlow.instanceMatrix.needsUpdate = true;

  // measuring ticks on the two cracks the measuring match spans; the π stub
  const tk = TL.ticks(t) * (hallOn ? 0 : 1);
  W.ticks.forEach((m, j) => { m.position.set(TL.MEASURE.x, 0.06, TL.MEASURE.z + (j ? 3 : -3)); m.scale.set(tk + 1e-4, 1, 1); });
  const stubK = TL.ramp(rin, 0.6, 1);
  W.stub.position.set(TL.BENCH.x + TL.WIRE_LEN / 2 - TL.STUB / 2, 0.06, TL.ROW_Z); W.stub.visible = stubK > 0.01 && !hallOn; (W.stub.material as THREE.MeshBasicMaterial).opacity = stubK;

  // the wire: straight → hoop → drops → straight → cut into pieces
  const snapK = TL.snap(t);
  const hp = TL.hoopPose(t), bk = TL.bendK(t);
  if (t > TL.B.why - 0.6 && snapK < 1 && !hallOn) {
    const R = TL.HOOP_R, kap = (bk * 2 * Math.PI) / TL.WIRE_LEN, pts: THREE.Vector3[] = [];
    for (let s = 0; s <= 96; s++) {
      const u = (s / 96 - 0.5) * TL.WIRE_LEN;
      // arc through the midpoint (cx, cz + R), bending toward -z; closes into the circle centred (cx, cz) at bk = 1
      const x = kap < 1e-5 ? u : Math.sin(kap * u) / kap, z = kap < 1e-5 ? 0 : (1 - Math.cos(kap * u)) / kap;
      pts.push(new THREE.Vector3(hp.cx + x, hp.y + 0.07, hp.cz + R - z));
    }
    W.wire.geometry.dispose(); W.wire.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.1, 8, bk > 0.999);
    W.wire.visible = true;
  } else W.wire.visible = false;
  // pieces: from the straight wire's segments, thrown three times, then home to the row line
  const throwI = [0, 1, 2].filter((k) => t >= TL.throwAt(k) - 0.3).pop();
  W.pieces.forEach((m, j) => {
    const lens = [L, L, L, TL.STUB], x0 = TL.BENCH.x - TL.WIRE_LEN / 2 + lens.slice(0, j).reduce((a, b) => a + b, 0) + lens[j] / 2;
    const home = {x: x0, z: TL.STRAIGHT_Z + TL.HOOP_R, a: 0};
    let x = home.x, z = home.z, a = 0, y = 0.07;
    if (throwI !== undefined) {
      const th = TL.THROWS[throwI][j], prev = throwI > 0 ? TL.THROWS[throwI - 1][j] : home, at = TL.throwAt(throwI);
      const k = TL.ramp(t, at - 0.3, at); x = TL.lerp(prev.x, th.x, k); z = TL.lerp(prev.z, th.z, k); a = TL.lerp(prev.a, th.a, k); y = 0.07 + 3 * Math.sin(Math.PI * k);
      const back = TL.piecesHome(t); x = TL.lerp(x, home.x, back); z = TL.lerp(z, home.z, back); a = TL.lerp(a, 0, back);
    }
    m.position.set(x, y, z); m.rotation.set(0, -a, 0); m.visible = snapK > 0 && !hallOn && TL.piecesHome(t) < 1;
    // a little gap opens at the cut
    if (throwI === undefined) m.position.x += (j - 1.5) * 0.35 * snapK;
  });
  // amber dots: hoop crossings when it rests, or the pieces' crossings for the current throw
  let nd = 0;
  const dot = (x: number, z: number, o: number) => { if (nd >= 12) return; P.set(x, 0.1, z); S.set(1.5 * o + 1e-4, 1, 1.5 * o + 1e-4); M.compose(P, Q.identity(), S); W.dots.setMatrixAt(nd++, M); };
  const hk = TL.hoopLanded(t);
  if (hk >= 0 && !hallOn) TL.hoopDots(hk).forEach(([x, z]) => dot(x, z, TL.ramp(t, TL.hoopDropAt(hk), TL.hoopDropAt(hk) + 0.12)));
  if (throwI !== undefined && TL.piecesHome(t) < 0.5 && !hallOn) { const at = TL.throwAt(throwI); TL.THROWS[throwI].forEach((p) => p.pts.forEach(([x, z]) => dot(x, z, TL.ramp(t, at, at + 0.12)))); }
  for (let k = nd; k < 12; k++) { M.makeScale(0, 0, 0); W.dots.setMatrixAt(k, M); }
  W.dots.instanceMatrix.needsUpdate = true;

  // hall matches: fall in as the count grows; crossers amber with a glow on their crack
  if (hallOn) {
    const H = W.hallM;
    for (let i = 0; i < N; i++) {
      const b = TL.hallBase(i), land = TL.landHall(i);
      const u = (t - (land - 0.35)) / 0.35;
      const vis = u < 0 ? 0 : 1, k = Math.min(Math.max(u, 0), 1);
      const y = 14 * (1 - k * k);
      setPose(H.sm, i, b.x, y, b.z, b.a + (1 - k) * 2, 0, 0, vis); setPose(H.hm, i, b.x, y, b.z, b.a + (1 - k) * 2, 0, 0, vis);
      const lit = DROPS[i].cross ? TL.ramp(t, land, land + 0.3) : 0;
      C.copy(STICK).lerp(AMBER_STICK, lit).multiplyScalar(1 + 0.3 * lit - 0.35 * (DROPS[i].cross ? 0 : TL.ramp(t, land, land + 0.3))); H.sm.setColorAt(i, C);
      if (DROPS[i].cross) { const pts = TL.crossPoints(b.x, b.z, b.a, L); P.set(pts[0][0], 0.04, pts[0][1]); S.set(3.6 * lit + 1e-4, 1, 1.4 * lit + 1e-4); M.compose(P, Q.identity(), S); }
      else M.makeScale(0, 0, 0);
      W.hallGlow.setMatrixAt(i, M);
    }
    H.sm.instanceMatrix.needsUpdate = H.hm.instanceMatrix.needsUpdate = true; H.sm.instanceColor!.needsUpdate = true; W.hallGlow.instanceMatrix.needsUpdate = true;
  }
  W.hallM.sm.visible = W.hallM.hm.visible = W.hallGlow.visible = hallOn;

  // camera
  const c = TL.camAt(t), cam = camera as THREE.PerspectiveCamera;
  cam.fov = TL.fovOf(c.mm); cam.near = hallOn ? 5 : 0.5; cam.far = 20000; cam.updateProjectionMatrix();
  cam.position.set(...c.pos); cam.lookAt(...c.look);
  return null;
};

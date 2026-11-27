// One world: a planted home aquarium (units: centimetres), seen through the front glass.
//  TANK     gravel bed (instanced stones + caustics patch), back glass, silicone-black trim, water surface seen from
//           below, plants that sway, a bubbler, drifting specks, teal water fog.
//  ROOM     a warm wall behind the tank with a 24-hour clock (the feeding hour lit cyan in the clock shots).
//  LEVER    a rod from the lid with a paddle; the fish pushes it; cyan glow when it pays; the feeder drops pellets.
//  SMELL    a pipette drips a cyan cloud of soft sprites that spreads and sinks.
//  FISH     Comet goldfish by somitsu (Sketchfab, CC BY 4.0), rigged swim clip played by frame.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {fbm2, rng} from './kit/realism/noise.ts';
import {rock} from './kit/realism/shapes.ts';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
const {TW, TH, TD} = TL;
const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, srgb = true) => {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d')!);
  const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 8;
  if (srgb) tx.colorSpace = THREE.SRGBColorSpace; return tx;
};
const softDot = () => canvasTex(128, 128, (c) => {
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
});

// caustics: bright net of light on surfaces under water (world xz, animated)
const causticU = {uT: {value: 0}, uK: {value: 1}};
const causticPatch = <M extends THREE.MeshStandardMaterial>(m: M, strength = 1) => {
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, causticU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#ifdef USE_INSTANCING\n vWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\n#endif');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWP; uniform float uT; uniform float uK;
      float cz(vec2 p, float t){ vec2 i = p; float c = 1.0; for (int n = 0; n < 4; n++) { float tt = t * (1.0 - 3.5 / float(n + 1));
        i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x)); c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / 0.005), p.y / (cos(i.y + tt) / 0.005))); }
        c /= 4.0; c = 1.17 - pow(c, 1.4); return pow(abs(c), 8.0); }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { float ca = cz(vWP.xz * 0.16 + vec2(3.0), uT * 0.55); totalEmissiveRadiance += diffuseColor.rgb * clamp(ca, 0.0, 1.2) * ${(0.55 * strength).toFixed(3)} * uK; }`);
  };
  return m;
};
// sway for plants (vertex, by height in the blade)
const swayU = {uT: {value: 0}};
const swayPatch = (m: THREE.MeshStandardMaterial) => {
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, swayU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed.x *= 1.0 - 0.8 * uv.y; float hk = uv.y * uv.y; vec4 ip = vec4(0.0);
        #ifdef USE_INSTANCING
          ip = instanceMatrix[3];
        #endif
        float ph = ip.x * 0.31 + ip.z * 0.17;
        transformed.x += hk * 2.2 * sin(uT * 1.1 + ph + uv.y * 1.5);
        transformed.z += hk * 1.4 * sin(uT * 0.8 + ph * 1.7 + uv.y * 2.0);`);
  };
  return m;
};

const FISH_LEN = 14;   // cm, nose to tail tip

export const Scene: React.FC<{t: number; gltf: any}> = ({t, gltf}) => {
  const {gl, camera, scene} = useThree();
  const shot = TL.shotAt(t);
  const fish = useMemo(() => {
    if (!gltf) return null;
    const inner = gltf.scene;
    inner.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(inner), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const len = Math.max(size.x, size.y, size.z), axis = size.x === len ? 'x' : size.z === len ? 'z' : 'y';
    (window as any).__fishInfo = JSON.stringify({size, c, axis});
    const s = FISH_LEN / len; const holder = new THREE.Group(); holder.scale.setScalar(s); holder.position.copy(c).multiplyScalar(-s); holder.add(inner);
    const orient = new THREE.Group(); orient.add(holder); orient.rotation.y = axis === 'z' ? FISH_YAW_Z : FISH_YAW_X;
    inner.traverse((o: THREE.Object3D) => { const m = o as THREE.Mesh; if (!m.isMesh) return; m.castShadow = true; m.frustumCulled = false; });
    const root = new THREE.Group(); root.add(orient);
    const mixer = new THREE.AnimationMixer(inner); const clip = gltf.animations[0]; mixer.clipAction(clip).play();
    return {root, mixer, dur: clip.duration};
  }, [gltf]);

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const root = new THREE.Group(); scene.add(root);
    const r = rng(11);

    // ----- lights: the tank lamp in the lid (key, shadows), room fill from the front, water-coloured hemisphere
    const lamp = new THREE.DirectionalLight(col('#fff4e2'), 3.2); lamp.position.set(10, 160, 20); lamp.target.position.set(0, 0, -TD / 2);
    lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048);
    Object.assign(lamp.shadow.camera, {left: -70, right: 70, top: 50, bottom: -50, near: 50, far: 260}); lamp.shadow.camera.updateProjectionMatrix(); lamp.shadow.bias = -0.0008; lamp.shadow.normalBias = 0.02;
    root.add(lamp, lamp.target);
    const hemi = new THREE.HemisphereLight(col('#9fd8e0'), col('#4a3a28'), 1.1); root.add(hemi);
    const front = new THREE.DirectionalLight(col('#ffd9b0'), 0.9); front.position.set(-40, 40, 160); root.add(front);
    const room = new THREE.PointLight(col('#ffb878'), 9000, 0, 2); room.position.set(-60, 90, -TD - 10); root.add(room);

    // ----- room: back wall with a warm lamp wash, a shelf line, the 24-hour clock
    const wallTex = canvasTex(512, 512, (c) => {
      const g = c.createRadialGradient(180, 160, 20, 220, 240, 420); g.addColorStop(0, '#8a6a4e'); g.addColorStop(0.5, '#4d3a2c'); g.addColorStop(1, '#1e1814');
      c.fillStyle = g; c.fillRect(0, 0, 512, 512); const q = rng(4); for (let i = 0; i < 5000; i++) { c.fillStyle = `rgba(0,0,0,${q() * 0.06})`; c.fillRect(q() * 512, q() * 512, 2, 2); }
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(420, 260), new THREE.MeshStandardMaterial({map: wallTex, roughness: 0.9}));
    wall.position.set(0, 40, -TD - 32); root.add(wall);
    const sideboard = new THREE.Mesh(new THREE.BoxGeometry(220, 30, 60), new THREE.MeshStandardMaterial({color: col('#2a1d14'), roughness: 0.6}));
    sideboard.position.set(0, -22, -TD / 2); root.add(sideboard);

    const dial = canvasTex(1024, 1024, (c) => {
      c.fillStyle = '#f3efe6'; c.beginPath(); c.arc(512, 512, 500, 0, Math.PI * 2); c.fill();
      c.translate(512, 512);
      for (let h = 0; h < 24; h++) { const a = (h / 24) * Math.PI * 2 - Math.PI / 2; c.strokeStyle = '#222'; c.lineWidth = h % 6 === 0 ? 16 : 7;
        const r0 = h % 6 === 0 ? 380 : 410; c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * 470, Math.sin(a) * 470); c.stroke(); }
      c.fillStyle = '#222'; c.font = '800 96px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      [0, 6, 12, 18].forEach((h) => { const a = (h / 24) * Math.PI * 2 - Math.PI / 2; c.fillText(String(h), Math.cos(a) * 290, Math.sin(a) * 290); });
      c.font = '700 54px sans-serif'; c.fillStyle = '#555'; c.fillText('24 h', 0, 150);
    });
    const clock = new THREE.Group(); clock.position.set(...TL.CLOCK); root.add(clock);
    const R = TL.CLOCK_R;
    clock.add(new THREE.Mesh(new THREE.CircleGeometry(R, 96), new THREE.MeshBasicMaterial({map: dial, color: col('#cfe3dc'), fog: false})));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R + 0.6, 1.0, 16, 96), new THREE.MeshBasicMaterial({color: col('#1b2224'), fog: false})); clock.add(rim);
    // the feeding hour: a wedge from HOUR to HOUR+1 (clockwise from the top)
    const a0 = Math.PI / 2 - ((TL.HOUR + 1) / 24) * Math.PI * 2;
    const wedgeMat = new THREE.MeshBasicMaterial({color: col(TL.CYAN), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, fog: false});
    const wedge = new THREE.Mesh(new THREE.RingGeometry(R * 0.08, R * 0.96, 24, 1, a0, (Math.PI * 2) / 24), wedgeMat); wedge.position.z = 0.05; clock.add(wedge);
    const wedgeHalo = new THREE.Mesh(new THREE.RingGeometry(R * 0.96, R * 1.25, 24, 1, a0 - 0.05, (Math.PI * 2) / 24 + 0.1), new THREE.MeshBasicMaterial({color: col(TL.CYAN), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending, fog: false}));
    wedgeHalo.position.z = 0.06; clock.add(wedgeHalo);
    const hand = new THREE.Group(); hand.position.z = 0.3; clock.add(hand);
    const handM = new THREE.MeshBasicMaterial({color: col('#b8261c'), fog: false});
    const hb = new THREE.Mesh(new THREE.BoxGeometry(0.9, R * 0.92, 0.3), handM); hb.position.y = R * 0.36; hand.add(hb);
    hand.add(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.6, 24).rotateX(Math.PI / 2), handM));

    // ----- tank: gravel, glass, trim, surface
    const gravelBase = new THREE.Mesh(new THREE.BoxGeometry(TW, 4, TD), causticPatch(new THREE.MeshStandardMaterial({color: col('#7a6a55'), roughness: 0.95})));
    gravelBase.position.set(0, -2, -TD / 2); gravelBase.receiveShadow = true; root.add(gravelBase);
    const stoneGeo = rock({seed: 3, size: [1, 0.7, 0.85], detail: 1, rough: 0.25});
    const NST = 4200; const stoneMat = causticPatch(new THREE.MeshStandardMaterial({roughness: 0.75}), 1.2);
    const stones = new THREE.InstancedMesh(stoneGeo, stoneMat, NST); stones.receiveShadow = true;
    { const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), cc = new THREE.Color();
      const pal = ['#8b7a62', '#a39177', '#5d5248', '#c2b49a', '#6e6152', '#3f3a36', '#9a8466'];
      for (let i = 0; i < NST; i++) {
        const x = (r() - 0.5) * (TW - 1), z = -r() * (TD - 1), sc = 0.55 + r() * 0.8;
        e.set(r() * 6, r() * 6, r() * 6); q.setFromEuler(e); M.compose(new THREE.Vector3(x, 0.1 + r() * 0.35 + 0.8 * fbm2(x / 20, z / 20, 5, 2), z), q, new THREE.Vector3(sc, sc * (0.6 + r() * 0.4), sc));
        stones.setMatrixAt(i, M); stones.setColorAt(i, cc.set(pal[Math.floor(r() * pal.length)]).multiplyScalar(0.75 + r() * 0.5));
      } }
    root.add(stones);
    // a few larger rocks (hardscape)
    const rockMat = causticPatch(new THREE.MeshStandardMaterial({color: col('#6f665c'), roughness: 0.85}), 0.8);
    [[-36, -32, 9], [-24, -36, 6], [38, -34, 7]].forEach(([x, z, s], i) => { const m = new THREE.Mesh(rock({seed: 20 + i, size: [s * 1.4, s, s], detail: 3, rough: 0.35}), rockMat); m.position.set(x, s * 0.35, z); m.castShadow = m.receiveShadow = true; root.add(m); });

    // glass: back pane (faint reflection tint), front edges only; black trim frame
    const glassMat = new THREE.MeshPhysicalMaterial({color: col('#cfe8ea'), transparent: true, opacity: 0.08, roughness: 0.05, metalness: 0, depthWrite: false});
    const back = new THREE.Mesh(new THREE.PlaneGeometry(TW, TH + 8), glassMat); back.position.set(0, TH / 2, -TD); root.add(back);
    const trimMat = new THREE.MeshStandardMaterial({color: col('#0e0f10'), roughness: 0.4});
    const trim = (w: number, h: number, d: number, x: number, y: number, z: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), trimMat); m.position.set(x, y, z); root.add(m); };
    trim(TW + 3, 2.5, 2.5, 0, -1.5, 0); trim(TW + 3, 2.5, 2.5, 0, TH + 6, 0); trim(TW + 3, 2.5, 2.5, 0, TH + 6, -TD); trim(TW + 3, 2.5, 2.5, 0, -1.5, -TD);
    for (const sx of [-1, 1]) { trim(2.5, TH + 8, 2.5, sx * (TW / 2 + 1), TH / 2 + 2, 0); trim(2.5, TH + 8, 2.5, sx * (TW / 2 + 1), TH / 2 + 2, -TD); trim(2.5, 2.5, TD, sx * (TW / 2 + 1), TH + 6, -TD / 2); }
    // lid (dark) with the lamp strip
    const lid = new THREE.Mesh(new THREE.BoxGeometry(TW + 4, 1.5, TD + 4), new THREE.MeshStandardMaterial({color: col('#17191b'), roughness: 0.5})); lid.position.set(0, TH + 9, -TD / 2); root.add(lid);
    // water surface from below: bright, rippled
    const ripTex = canvasTex(512, 512, (c) => {
      const img = c.createImageData(512, 512);
      for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) { const v = fbm2(x / 50, y / 50, 7, 4); const k = Math.pow(Math.max(0, 1 - Math.abs(v) * 3.2), 3); const i = (y * 512 + x) * 4;
        img.data[i] = 150 + 105 * k; img.data[i + 1] = 210 + 45 * k; img.data[i + 2] = 215 + 40 * k; img.data[i + 3] = 255; }
      c.putImageData(img, 0, 0);
    });
    ripTex.repeat.set(2, 1);
    const surfMat = new THREE.MeshBasicMaterial({map: ripTex, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, fog: false});
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(TW, TD), surfMat); surf.rotation.x = Math.PI / 2; surf.position.set(0, TH, -TD / 2); root.add(surf);

    // ----- plants: long ribbon leaves in clumps, swaying
    const blade = new THREE.PlaneGeometry(1.5, 1, 1, 10).translate(0, 0.5, 0);
    const plantMat = swayPatch(new THREE.MeshStandardMaterial({side: THREE.DoubleSide, roughness: 0.55}));
    const clumps: [number, number, number, number][] = [[-42, -38, 46, 40], [-30, -40, 34, 24], [44, -38, 42, 34], [30, -41, 28, 18], [-46, -22, 22, 14], [47, -16, 18, 10], [-30, -24, 10, 8]];
    const NB = clumps.reduce((a, c) => a + c[3] * 2, 0);
    const blades = new THREE.InstancedMesh(blade, plantMat, NB); blades.castShadow = true;
    { const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), cc = new THREE.Color(); let i = 0;
      for (const [cx, cz, h, n] of clumps) for (let k = 0; k < n * 2; k++) {
        const x = cx + (r() - 0.5) * 8, z = cz + (r() - 0.5) * 5, hh = h * (0.55 + r() * 0.5);
        e.set((r() - 0.5) * 0.35, r() * Math.PI, (r() - 0.5) * 0.4); q.setFromEuler(e); M.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(1 + r() * 0.8, hh, 1));
        blades.setMatrixAt(i, M); blades.setColorAt(i, cc.setHSL(0.27 + r() * 0.08, 0.55, 0.22 + r() * 0.14)); i++;
      } }
    root.add(blades);

    // ----- bubbler (back right) and drifting specks
    const NBU = 46; const bub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({color: col('#e8fbff'), roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.55, emissive: col('#6fa9b0'), emissiveIntensity: 0.4}), NBU);
    root.add(bub);
    const bubSeed = Array.from({length: NBU}, () => [r(), r(), r(), r()]);
    const NSP = 420; const spPos = new Float32Array(NSP * 3); const spSeed = Array.from({length: NSP}, () => [(r() - 0.5) * TW, r() * TH, -r() * TD, r()]);
    const specks = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(spPos, 3)),
      new THREE.PointsMaterial({color: col('#e9f4ea'), size: 0.18, transparent: true, opacity: 0.5, depthWrite: false}));
    specks.frustumCulled = false; root.add(specks);

    // ----- lever (pivot at the lid) and feeder
    const lever = new THREE.Group(); root.add(lever);
    const leverMat = new THREE.MeshStandardMaterial({color: col('#5b6168'), roughness: 0.35, metalness: 0.3, emissive: col(TL.CYAN), emissiveIntensity: 0});
    const LEN = TH + 9 - TL.LEVER_TIP[1];
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, LEN, 16).translate(0, -LEN / 2, 0), leverMat); rod.castShadow = true; lever.add(rod);
    const paddle = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 0.8).translate(0, -LEN - 1, 0), leverMat); paddle.castShadow = true; lever.add(paddle);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({map: softDot(), color: col(TL.CYAN), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
    halo.scale.set(16, 16, 1); halo.position.set(0, -LEN - 1, 0.5); lever.add(halo);
    const feeder = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 1.2, 6, 20, 1, true), new THREE.MeshStandardMaterial({color: col('#c9ced3'), roughness: 0.3, side: THREE.DoubleSide, transparent: true, opacity: 0.85}));
    feeder.position.set(TL.FEED_X, TH + 6, TL.FEED_Z); root.add(feeder);
    const NP = 10 * 4; const pellets = new THREE.InstancedMesh(new THREE.SphereGeometry(0.42, 10, 8), new THREE.MeshStandardMaterial({color: col('#d9b98a'), roughness: 0.7, emissive: col('#5a4020'), emissiveIntensity: 0.25}), NP);
    pellets.castShadow = true; pellets.frustumCulled = false; root.add(pellets);
    const pSeed = Array.from({length: NP}, () => [(r() - 0.5) * 5, (r() - 0.5) * 4, r() * 0.25, 0.8 + r() * 0.5]);

    // ----- pipette and the smell cloud
    const pip = new THREE.Group(); pip.position.set(TL.DROP_X, TH + 18, TL.DROP_Z); root.add(pip);
    pip.add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.35, 16, 16).translate(0, -8, 0), new THREE.MeshPhysicalMaterial({color: col('#e8f6f8'), roughness: 0.05, transparent: true, opacity: 0.5})));
    pip.add(new THREE.Mesh(new THREE.SphereGeometry(2.2, 20, 14).scale(1, 1.4, 1).translate(0, 2, 0), new THREE.MeshStandardMaterial({color: col('#2b2f33'), roughness: 0.6})));
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), new THREE.MeshBasicMaterial({color: col(TL.CYAN), toneMapped: false})); root.add(drop);
    const NC = 70; const cloudMat = new THREE.SpriteMaterial({map: softDot(), color: col(TL.CYAN), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false});
    const cloud = Array.from({length: NC}, () => { const s = new THREE.Sprite(cloudMat); root.add(s); return {s, a: r() * Math.PI * 2, b: (r() - 0.5) * 2, d: Math.sqrt(r()), z: r()}; });

    const env = new THREE.Color('#1d5a62');
    return {root, clock, lamp, hemi, front, room, wedgeMat, wedgeHalo, hand, surf, ripTex, bub, bubSeed, specks, spSeed, spPos, lever, leverMat, halo, pellets, pSeed, drop, cloud, cloudMat, pip, env};
  }, [gl, scene]);

  if (fish && fish.root.parent !== W.root) W.root.add(fish.root);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.fov = c.fov; cam.near = 0.5; cam.far = 2000; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.updateProjectionMatrix();
  gl.toneMappingExposure = 0.95; scene.background = col('#0c0a08');
  scene.fog = new THREE.FogExp2(0x3b7470, 0.0075);
  causticU.uT.value = t; swayU.uT.value = t;
  const day = TL.dayNight(t);
  W.lamp.intensity = 3.2 * day; W.hemi.intensity = 1.1 * (0.3 + 0.7 * day); causticU.uK.value = day; W.room.intensity = 9000 * (0.35 + 0.65 * day);
  W.ripTex.offset.set(t * 0.02, t * 0.013);

  // clock (only in the shots about time)
  W.clock.visible = shot === 'clock' || shot === 'learn';
  W.hand.rotation.z = -(TL.clockHour(t) / 24) * Math.PI * 2;
  const lit = TL.hourLit(t); W.wedgeMat.opacity = 0.85 * lit; (W.wedgeHalo.material as THREE.MeshBasicMaterial).opacity = 0.5 * lit * (0.8 + 0.2 * Math.sin(t * 5));

  // bubbles and specks
  { const M = new THREE.Matrix4();
    W.bubSeed.forEach(([a, b, cc, d], i) => { const sp = 9 + d * 6, y = ((t * sp + a * 60) % (TH + 2)); const s = 0.25 + cc * 0.35 + y * 0.004;
      M.makeScale(s, s, s).setPosition(44 + Math.sin(t * 3 + i) * (0.4 + y * 0.02) + (b - 0.5), y, -38 + (cc - 0.5) * 1.5); W.bub.setMatrixAt(i, M); });
    W.bub.instanceMatrix.needsUpdate = true;
    W.spSeed.forEach(([x, y, z, k], i) => { W.spPos[i * 3] = x + Math.sin(t * 0.3 + k * 9) * 2 + t * 0.4; W.spPos[i * 3 + 1] = ((y + t * (0.3 + k * 0.4)) % TH); W.spPos[i * 3 + 2] = z + Math.cos(t * 0.25 + k * 7); });
    (W.specks.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true; }

  // lever
  const drop = TL.leverDrop(t), LEN = TH + 9 - TL.LEVER_TIP[1];
  W.lever.position.set(TL.LEVER_X, TH + 9 + (1 - drop) * (LEN + 8), TL.LEVER_Z);
  W.lever.rotation.z = -TL.leverSwing(t);
  W.lever.visible = drop > 0.001 && (shot === 'lever' || shot === 'clock' || shot === 'learn');
  const pays = TL.leverPays(t); W.leverMat.emissiveIntensity = 1.6 * pays; W.leverMat.color.set(pays > 0.5 ? '#9fdde6' : '#5b6168'); (W.halo.material as THREE.SpriteMaterial).opacity = 0.75 * pays;

  // fish
  const fp = TL.fishAt(t);
  if (fish) {
    const s0 = TL.shotStart(shot), s1 = TL.shotEnd(shot);
    const ta = Math.max(s0 + 0.001, Math.min(t, s1 - 0.12)), pa = TL.fishAt(ta), pb = TL.fishAt(ta + 0.1);
    const v = new THREE.Vector3(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]);
    // face a target while darting at the lever or heading for the cloud
    const tgt = shot === 'lever' || shot === 'clock' || shot === 'learn' ? TL.LEVER_TIP : shot === 'smell' || shot === 'later' ? TL.cloudCentre(t, shot) : null;
    const face = tgt ? new THREE.Vector3(tgt[0] - fp[0], tgt[1] - fp[1], tgt[2] - fp[2]) : new THREE.Vector3();
    const speed = v.length() * 10;
    const near = tgt && face.length() < 16 ? 1 : 0;
    const dir = v.clone().normalize().multiplyScalar(Math.min(1, speed / 6)).add(face.normalize().multiplyScalar(near ? 1.5 : 0.25)).add(new THREE.Vector3(shot === 'hook' ? -0.2 : 0.05, 0, 0.12));
    dir.y *= 0.5; dir.normalize();
    fish.root.position.set(...fp);
    // yaw and pitch only: the fish never rolls onto its side
    fish.root.rotation.set(0, Math.atan2(-dir.z, dir.x), Math.asin(THREE.MathUtils.clamp(dir.y, -0.6, 0.6)), 'YZX');
    fish.mixer.setTime((t * 1.1 * TL.fishSpeedK(t)) % fish.dur);
  }

  // pellets: fall in air, slow in water, rest on gravel; eaten when the fish's mouth passes close
  { const M = new THREE.Matrix4(), hidden = new THREE.Matrix4().makeScale(0, 0, 0); const drops = TL.pelletDrops(shot);
    for (let i = 0; i < W.pSeed.length; i++) {
      const di = Math.floor(i / 10), [dx, dz, delay, sp] = W.pSeed[i]; const at = drops[Math.min(di, drops.length - 1)];
      if (at === undefined || di >= drops.length || i % 10 >= 8) { W.pellets.setMatrixAt(i, hidden); continue; }
      const k = t - at - delay; if (k < 0) { W.pellets.setMatrixAt(i, hidden); continue; }
      const x0 = shot === 'smell' || shot === 'later' ? TL.cloudCentre(at + 0.5, shot)[0] : TL.FEED_X, z0 = shot === 'smell' || shot === 'later' ? TL.cloudCentre(at + 0.5, shot)[2] : TL.FEED_Z;
      const yAir = TH + 5 - 0.5 * 980 * k * k; let y: number;
      if (yAir > TH) y = yAir; else { const ta = Math.sqrt((2 * 5) / 980); y = Math.max(0.6, TH - (k - ta) * 7 * sp); }
      const sx = x0 + dx * Math.min(1, k), sz = z0 + dz * Math.min(1, k);
      // eaten?
      let eaten = false;
      if (fish) for (let q = at + delay + 0.2; q <= t; q += 0.1) { if (TL.shotAt(q) !== shot) break; const fq = TL.fishAt(q); const kq = q - at - delay; const yq = kq < 0.1 ? TH : Math.max(0.6, TH - (kq - 0.1) * 7 * sp); if (Math.hypot(fq[0] + 6 - sx, fq[1] - yq, fq[2] - sz) < 4.5) { eaten = true; break; } }
      M.makeTranslation(sx, y, sz + Math.sin(k * 2 + i) * 0.4); W.pellets.setMatrixAt(i, eaten ? hidden : M);
    }
    W.pellets.instanceMatrix.needsUpdate = true; }

  // pipette, drip and cloud
  const ct = TL.cloudT(t, shot);
  W.pip.visible = shot === 'smell' || shot === 'later';
  W.drop.visible = ct > -0.6 && ct < 0;
  if (W.drop.visible) W.drop.position.set(TL.DROP_X, TH + 2 - (ct + 0.6) * 6, TL.DROP_Z);
  const cOn = ct < 0 ? 0 : Math.min(1, ct * 2);
  W.cloudMat.opacity = 0.075 * cOn * (TL.shotAt(t) === 'end' ? 1 - TL.ramp(t, TL.CUT.end, TL.CUT.end + 1.5) * 0.6 : 1);
  const cc = TL.cloudCentre(t, shot), spread = 1.5 + 4 * Math.sqrt(Math.min(4, Math.max(0, ct)));
  W.cloud.forEach((p) => { p.s.visible = cOn > 0; const a = p.a + t * 0.2 * p.b; p.s.position.set(cc[0] + Math.cos(a) * p.d * spread, cc[1] + p.b * spread * 0.5, cc[2] + Math.sin(a) * p.d * spread * 0.6); p.s.scale.setScalar(2.5 + spread * 0.42 * (0.6 + p.z)); });
  return null;
};

// model axis -> +x (nose); set from the first still
const FISH_YAW_X = Math.PI, FISH_YAW_Z = Math.PI / 2;

// The whole film is one three.js world: sky, cloud deck, the 757 (white paint <-> glass), the cabin
// interior, giant cups, trails, pivot, fulcrum wedge and coloured rows. Built once; per frame only
// transforms, uniforms and the trail tubes change, all from timeline.ts.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {skyLight, makeSky} from './kit/realism/sky.ts';
import {random} from 'remotion';
import * as TL from './timeline';

const S = 47.32 / 3002; // model units -> metres (757-200 length)
const MODEL_OFF = new THREE.Vector3(-166, -270, 250); // fuselage centreline + pivot to the origin
const col = (h: string) => new THREE.Color(h);

// ---------- shared GLSL
const ROWS_GLSL = /* glsl */ `
uniform float uSpread; uniform float uRowGlow; uniform float uTail; uniform float uWing;
vec3 rowColour(float x) {
  float d = abs(x);
  vec3 amber = vec3(1.0, 0.71, 0.28), orange = vec3(1.0, 0.54, 0.30), coral = vec3(1.0, 0.35, 0.31);
  vec3 c = mix(amber, orange, smoothstep(2.5, 11.0, d));
  return mix(c, coral, smoothstep(11.0, 17.0, d));
}
float rowAmount(float x) {
  float on = 1.0 - smoothstep(uSpread - 1.5, uSpread, abs(x));
  float a = on * uRowGlow;
  a += uTail * smoothstep(-9.0, -13.0, x) * 1.2;
  a += uWing * (1.0 - smoothstep(2.5, 4.0, abs(x))) * 1.0;
  return a;
}`;

// hull: white paint with glowing cabin windows, fading to glass with a bright rim
const hullMaterial = (env: THREE.Texture, u: Record<string, THREE.IUniform>) => {
  const m = new THREE.MeshPhysicalMaterial({color: col('#F2F2EE'), roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2, envMap: env, envMapIntensity: 0.9, transparent: true, side: THREE.DoubleSide});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uPlaneInv; varying vec3 vLocal; varying vec3 vWPos;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvec4 wp4 = modelMatrix * vec4(transformed, 1.0); vWPos = wp4.xyz; vLocal = (uPlaneInv * wp4).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uGlass; uniform vec3 uWinCol; varying vec3 vLocal; varying vec3 vWPos;')
      .replace('#include <dithering_fragment>', `
        // cabin windows: rounded rectangles along both sides of the fuselage
        float cab = step(${TL.CABIN_X[0].toFixed(2)}, vLocal.x) * step(vLocal.x, ${TL.CABIN_X[1].toFixed(2)}) * step(1.3, abs(vLocal.z)) * step(abs(vLocal.z), 2.2);
        float dx = (fract(vLocal.x / 0.51) - 0.5) * 0.51, dy = vLocal.y + 0.12;
        float win = cab * (1.0 - smoothstep(0.9, 1.05, pow(abs(dx) / 0.115, 4.0) + pow(abs(dy) / 0.16, 4.0)));
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uWinCol, win * (1.0 - uGlass));
        // glass: tinted, mostly clear, a bright rim where the surface turns away
        vec3 V = normalize(cameraPosition - vWPos);
        vec3 Nn = normalize(cross(dFdx(vWPos), dFdy(vWPos)));
        float rim = pow(1.0 - abs(dot(Nn, V)), 3.0);
        vec3 glassCol = vec3(0.81, 0.90, 0.96) * 0.25 + vec3(0.92, 0.97, 1.0) * rim * 1.6;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, glassCol, uGlass);
        gl_FragColor.a = mix(1.0, 0.10 + rim * 0.55, uGlass);
        #include <dithering_fragment>`);
  };
  return m;
};

// seats and cabin parts: emissive glow by distance from the pivot
const patchRows = (m: THREE.Material, u: Record<string, THREE.IUniform>) => {
  const mm = m as THREE.MeshStandardMaterial;
  mm.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uPlaneInv; varying vec3 vLocalR;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvec4 wpr = modelMatrix * vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\nwpr = modelMatrix * instanceMatrix * vec4(transformed, 1.0);\n#endif\nvLocalR = (uPlaneInv * wpr).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLocalR;\n' + ROWS_GLSL)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += rowColour(vLocalR.x) * rowAmount(vLocalR.x) * 2.6;');
  };
  mm.customProgramCacheKey = () => 'rows';
};

// a soft round glow texture
const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const glowSprite = (tex: THREE.Texture, c: string, size: number) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col(c), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true}));
  s.scale.setScalar(size); s.renderOrder = 10; return s;
};

// glass for the giant cups and the wedge: rim-lit, mostly clear
const rimGlass = (tint: string, base = 0.1, rimK = 0.7) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide,
  uniforms: {uTint: {value: col(tint)}, uBase: {value: base}, uRim: {value: rimK}, uOpacity: {value: 1}},
  vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform vec3 uTint; uniform float uBase; uniform float uRim; uniform float uOpacity; varying vec3 vN; varying vec3 vW;
    void main(){ vec3 V=normalize(cameraPosition-vW); float r=pow(1.0-abs(dot(normalize(vN),V)),2.5);
    gl_FragColor=vec4(uTint*(0.6+1.6*r), (uBase+uRim*r)*uOpacity); }`,
});

// clear plastic tumbler: open lathe with a thick bright rim
const cupGeometry = (h: number, r0: number, r1: number) => {
  const p = [new THREE.Vector2(0, 0), new THREE.Vector2(r0, 0), new THREE.Vector2(r1, h), new THREE.Vector2(r1 * 0.96, h), new THREE.Vector2(r0 * 0.96, h * 0.04), new THREE.Vector2(0, h * 0.04)];
  return new THREE.LatheGeometry(p, 64);
};
const waterBody = (h: number, r0: number, r1: number, fill: number) => {
  const rf = r0 + (r1 - r0) * fill;
  return new THREE.LatheGeometry([new THREE.Vector2(0, h * 0.04), new THREE.Vector2(r0 * 0.95, h * 0.04), new THREE.Vector2(rf * 0.95, h * fill)], 48);
};

// cloud deck: a lit fbm heightfield in a shader, fading into the horizon
const cloudMaterial = (sunDir: THREE.Vector3, horizon: THREE.Color) => new THREE.ShaderMaterial({
  uniforms: {uShift: {value: 0}, uSun: {value: sunDir.clone()}, uHorizon: {value: horizon.clone()}, uLit: {value: col('#FFE6CC')}, uShadow: {value: col('#8F92BE')}},
  vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform float uShift; uniform vec3 uSun; uniform vec3 uHorizon; uniform vec3 uLit; uniform vec3 uShadow; varying vec3 vW;
    float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
    float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
    float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<6;i++){ s+=a*vn(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return s; }
    float H(vec2 p){ float b=fbm(p*0.0016); return pow(smoothstep(0.25,0.85,b),1.4)*140.0 + fbm(p*0.012)*18.0; }
    void main(){
      vec2 p=vW.xz+vec2(uShift,0.0);
      float e=6.0; float h=H(p); vec3 n=normalize(vec3(H(p-vec2(e,0))-H(p+vec2(e,0)), 2.0*e, H(p-vec2(0,e))-H(p+vec2(0,e))));
      float lit=clamp(dot(n,normalize(uSun))*1.4+0.15,0.0,1.0);
      vec3 c=mix(uShadow,uLit,lit) * (0.75+0.35*smoothstep(20.0,140.0,h));
      float d=length(vW.xz-cameraPosition.xz);
      c=mix(c,uHorizon,1.0-exp(-d/14000.0));
      gl_FragColor=vec4(c,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});

export type Assets = {plane: GLTF; seat: GLTF; seatLo: GLTF};

export const Scene: React.FC<{t: number; assets: Assets}> = ({t, assets}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    const opts = {elevation: 10, azimuth: 325, turbidity: 3, visibility: 60000, hazeHeight: 3000, ground: '#d9d4e6'};
    const L = skyLight(gl, opts);
    const sky = makeSky(opts); sky.scale.setScalar(30000); sky.renderOrder = -10;
    scene.add(sky);
    const env = L.envMap;
    const root = new THREE.Group(); scene.add(root);

    // lights
    const sun = new THREE.DirectionalLight(L.sunColor, L.sunIntensity * 0.06); sun.position.copy(L.sunDir).multiplyScalar(100); root.add(sun);
    const skyCol = L.skyIrradiance.clone(); const skyI = Math.max(skyCol.r, skyCol.g, skyCol.b); skyCol.multiplyScalar(1 / skyI);
    const hemi = new THREE.HemisphereLight(skyCol, col('#B8B4D0'), 0.9); root.add(hemi);
    const cabinLight = new THREE.HemisphereLight(col('#FFD9A8'), col('#5A4A3A'), 0); root.add(cabinLight);

    // shared uniforms
    const U = {
      uPlaneInv: {value: new THREE.Matrix4()}, uGlass: {value: 0}, uWinCol: {value: col('#FFC98A').multiplyScalar(1.6)},
      uSpread: {value: 0}, uRowGlow: {value: 0}, uTail: {value: 0}, uWing: {value: 0},
    };

    // clouds
    const clouds = new THREE.Mesh(new THREE.PlaneGeometry(80000, 80000, 1, 1), cloudMaterial(L.sunDir, L.horizon));
    clouds.rotation.x = -Math.PI / 2; clouds.position.y = -300; root.add(clouds);

    // plane rig: pitches about the pivot, heaves in Y
    const rig = new THREE.Group(); root.add(rig);
    const model = new THREE.Group(); model.rotation.y = -Math.PI / 2; model.scale.setScalar(S); rig.add(model);
    const pl = assets.plane.scene.clone(true); pl.position.copy(MODEL_OFF); model.add(pl);
    const hull = hullMaterial(env, U);
    const modelSeats: THREE.Object3D[] = [];
    pl.traverse((o) => {
      const m = o as THREE.Mesh; if (!m.isMesh) return;
      if (/body001|MAIN|tubines|hull_turbine/.test(m.name)) { m.material = hull; m.renderOrder = 5; }
      else if (/interior top|vents|lugage|Group_565|light rim|lights__/i.test(m.name)) { m.visible = false; m.userData.off = true; }
      else if (/Seat|seat|Group_607/i.test(m.name)) {
        // seats seen through the glass: light blue-grey so the rows read, glowing by distance later
        const mat = new THREE.MeshStandardMaterial({color: col('#4A5672'), roughness: 0.7, emissive: col('#0E1424')});
        patchRows(mat, U); m.material = mat; modelSeats.push(m);
      }
    });

    // cabin interior (plane-local metres), shown only when the camera is inside
    const cabin = new THREE.Group(); rig.add(cabin);
    const len = TL.CABIN_X[1] - TL.CABIN_X[0] + 4, midX = (TL.CABIN_X[0] + TL.CABIN_X[1]) / 2;
    const wallMat = new THREE.MeshStandardMaterial({color: col('#E8E2D6'), roughness: 0.8, side: THREE.BackSide});
    wallMat.onBeforeCompile = (sh) => {
      sh.uniforms.uWinSky = {value: col('#FFE2B8').multiplyScalar(2.5)};
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvP = position;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vP; uniform vec3 uWinSky;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          // cylinder axis is local Y (rotated to X): vP.y runs along the cabin
          float ang = atan(vP.z, vP.x);
          float side = step(0.7, abs(cos(ang)));
          float hy = 1.8 * sin(ang);
          float dx = (fract(vP.y / 0.51) - 0.5) * 0.51, dy = hy + 0.07;
          float win = side * (1.0 - smoothstep(0.9, 1.05, pow(abs(dx) / 0.12, 4.0) + pow(abs(dy) / 0.17, 4.0)));
          totalEmissiveRadiance += uWinSky * win;
          diffuseColor.rgb *= 1.0 - win;`);
    };
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, len, 48, 1, true), wallMat);
    shell.rotation.z = Math.PI / 2; shell.position.set(midX, -0.05, 0); cabin.add(shell);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(len, 3.4), new THREE.MeshStandardMaterial({color: col('#2B3242'), roughness: 0.95}));
    floor.rotation.x = -Math.PI / 2; floor.position.set(midX, TL.FLOOR_Y, 0); cabin.add(floor);
    for (const z of [-1.22, 1.22]) {
      const bin = new THREE.Mesh(new THREE.BoxGeometry(len, 0.42, 0.62), new THREE.MeshStandardMaterial({color: col('#D9D5CC'), roughness: 0.6}));
      bin.position.set(midX, 1.05, z); cabin.add(bin);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(len, 0.03, 0.08), new THREE.MeshBasicMaterial({color: col('#FFD9A8').multiplyScalar(2)}));
      strip.position.set(midX, 0.82, z * 0.72); cabin.add(strip);
    }
    // seat rows (low-detail instances); the hero seat is full detail with a split belt
    const rowsX: number[] = []; for (let x = TL.CABIN_X[0] + 0.5; x < TL.CABIN_X[1] - 0.3; x += 0.81) rowsX.push(x);
    const heroRow = rowsX.reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a));
    const seatZ = [-1.5, -1.0, -0.5, 0.5, 1.0, 1.5];
    const HERO_Z = 1.5;
    const seatMatrix = (x: number, z: number) => {
      const o = new THREE.Object3D(); o.position.set(x + 0.35, TL.FLOOR_Y - 0.235, z); o.rotation.y = Math.PI / 2; o.scale.set(0.00088, 0.001, 0.001); o.updateMatrix(); return o.matrix.clone();
    };
    const spots: THREE.Matrix4[] = [];
    for (const x of rowsX) for (const z of seatZ) if (!(x === heroRow && z === HERO_Z)) spots.push(seatMatrix(x, z));
    assets.seatLo.scene.updateMatrixWorld(true);
    assets.seatLo.scene.traverse((o) => {
      const m = o as THREE.Mesh; if (!m.isMesh) return;
      const mat = (m.material as THREE.Material).clone(); patchRows(mat, U);
      const im = new THREE.InstancedMesh(m.geometry, mat, spots.length);
      spots.forEach((s, i) => im.setMatrixAt(i, s.clone().multiply(m.matrixWorld)));
      cabin.add(im);
    });
    // hero seat
    const hero = assets.seat.scene.clone(true);
    const heroGroup = new THREE.Group(); heroGroup.applyMatrix4(seatMatrix(heroRow, HERO_Z)); heroGroup.add(hero); cabin.add(heroGroup);
    let beltR: {mesh: THREE.Mesh; base: THREE.Vector3; open: THREE.Vector3} | null = null;
    hero.traverse((o) => {
      const m = o as THREE.Mesh; if (!m.isMesh || !/Belt/.test(m.name)) return;
      // two halves of the belt: left stays, right swings open from its anchor
      m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox!; const ext = bb.getSize(new THREE.Vector3());
      const ax = ext.x >= ext.y && ext.x >= ext.z ? 'x' : ext.y >= ext.z ? 'y' : 'z'; const mid = bb.getCenter(new THREE.Vector3())[ax];
      const half = (keep: number) => {
        const mat = (m.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        mat.onBeforeCompile = (sh) => {
          sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vX;').replace('#include <begin_vertex>', `#include <begin_vertex>\nvX = position.${ax} - (${mid.toFixed(4)});`);
          sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vX;').replace('void main() {', `void main() { if (vX * ${keep.toFixed(1)} < 0.0) discard;`);
        };
        mat.customProgramCacheKey = () => 'belt' + keep;
        return mat;
      };
      m.material = half(-1);
      const r = m.clone(); r.material = half(1);
      m.parent!.add(r);
      // open = the right half slid outward along the belt, off the cushion
      const dir = new THREE.Vector3(); dir[ax] = ext[ax] * 0.42;
      const open = dir.multiply(r.scale).applyQuaternion(r.quaternion);
      beltR = {mesh: r, base: r.position.clone(), open};
    });
    // tray + cup in front of the hero seat (on the back of the seat ahead)
    const trayCup = (row: number, z: number) => {
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.02, 0.4), new THREE.MeshStandardMaterial({color: col('#3A3F4A'), roughness: 0.5}));
      tray.position.set(row + 0.81 - 0.12, TL.FLOOR_Y + 0.72, z); cabin.add(tray);
      const cup = new THREE.Mesh(cupGeometry(0.11, 0.028, 0.036), new THREE.MeshPhysicalMaterial({color: col('#FFFFFF'), roughness: 0.1, transparent: true, opacity: 0.35, envMap: env}));
      cup.position.set(row + 0.81 - 0.12, TL.FLOOR_Y + 0.73, z - 0.06); cabin.add(cup);
      cup.add(new THREE.Mesh(waterBody(0.11, 0.028, 0.036, 0.7), new THREE.MeshPhysicalMaterial({color: col('#BFE8F2'), roughness: 0.05, transparent: true, opacity: 0.6, envMap: env})));
      return cup;
    };
    trayCup(heroRow, HERO_Z);
    const backRow = rowsX.reduce((a, b) => (Math.abs(b + 0.81 - 0.12 - TL.CUPS[2].x) < Math.abs(a + 0.81 - 0.12 - TL.CUPS[2].x) ? b : a));
    const realBackCup = trayCup(backRow, 0.5);
    const glint = glowSprite(glowTex(), TL.AMBER, 0.06); cabin.add(glint);
    glint.position.set(heroRow + 0.35 - 0.34, TL.FLOOR_Y - 0.235 + 0.68, HERO_Z);

    // row blocks: one glowing slab per row, coloured by distance from the pivot (beat 7 side view, beat 8 seat map)
    const rowBlocks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.55, 3.1), new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}), rowsX.length);
    rowsX.forEach((x, i) => { const o = new THREE.Object3D(); o.position.set(x + 0.1, TL.FLOOR_Y + 0.6, 0); o.updateMatrix(); rowBlocks.setMatrixAt(i, o.matrix); rowBlocks.setColorAt(i, new THREE.Color(0, 0, 0)); });
    rowBlocks.renderOrder = 9; rig.add(rowBlocks);

    // giant cups on the roof
    const tex = glowTex();
    const cups = TL.CUPS.map((c) => {
      const g = new THREE.Group(); g.position.set(c.x, TL.ROOF_Y, 0); rig.add(g);
      const glassM = rimGlass(TL.GLASS, 0.06, 0.75);
      const cup = new THREE.Mesh(cupGeometry(TL.CUP_H, TL.CUP_R0, TL.CUP_R1), glassM); cup.renderOrder = 7; g.add(cup);
      const wMat = new THREE.MeshPhysicalMaterial({color: col('#BFE8F2'), roughness: 0.04, metalness: 0, transparent: true, opacity: 0.55, envMap: env, envMapIntensity: 1.4, depthWrite: false});
      const body = new THREE.Mesh(waterBody(TL.CUP_H, TL.CUP_R0, TL.CUP_R1, TL.CUP_FILL), wMat); body.renderOrder = 6; g.add(body);
      const rf = TL.CUP_R0 + (TL.CUP_R1 - TL.CUP_R0) * TL.CUP_FILL;
      const surf = new THREE.Mesh(new THREE.CircleGeometry(rf * 0.95, 48), wMat); surf.rotation.x = -Math.PI / 2;
      const surfPivot = new THREE.Group(); surfPivot.position.y = TL.CUP_H * TL.CUP_FILL; surfPivot.add(surf); g.add(surfPivot);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(rf * 1.12, rf * 0.92, 1, 48, 4, true), wMat); crown.renderOrder = 6; g.add(crown);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(TL.CUP_R1, 0.07, 8, 64), new THREE.MeshBasicMaterial({color: col(TL.CORAL), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false}));
      rim.rotation.x = Math.PI / 2; rim.position.y = TL.CUP_H; g.add(rim);
      const base = glowSprite(tex, c.color, 7); base.position.y = 0.4; g.add(base);
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), new THREE.MeshBasicMaterial({color: col(c.color).multiplyScalar(1.4)}));
      bead.position.y = TL.CUP_H + TL.BEAD_UP; g.add(bead);
      const beadGlow = glowSprite(tex, c.color, 3.2); beadGlow.position.y = TL.CUP_H + TL.BEAD_UP; g.add(beadGlow);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, TL.ROOF_Y - TL.FLOOR_Y, 8), new THREE.MeshBasicMaterial({color: col(c.color), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false}));
      stem.position.set(c.x, (TL.ROOF_Y + TL.FLOOR_Y) / 2, 0); rig.add(stem);
      return {g, surfPivot, crown, rim, base, stem, glassM, bead, beadGlow};
    });
    // droplets of the back cup's spill (world space, ballistic)
    const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshPhysicalMaterial({color: col('#D8F3FA'), roughness: 0.05, envMap: env, envMapIntensity: 1.6, transparent: true, opacity: 0.85}), 70);
    drops.renderOrder = 8; root.add(drops);
    const dropSeeds = Array.from({length: 70}, (_, i) => ({
      t: random('dt' + i) * 1.1, a: (random('da' + i) - 0.5) * 1.6 + Math.PI, up: 4 + random('du' + i) * 4, out: 1.2 + random('do' + i) * 2.4, s: 0.5 + random('ds' + i),
    }));

    // trails (rebuilt each frame)
    const trailMat = (c: string, w: number) => new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      uniforms: {uC: {value: col(c)}, uO: {value: 0}, uW: {value: w}},
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uC; uniform float uO; uniform float uW; varying vec2 vUv; void main(){ float a=(0.25+0.75*pow(vUv.x,0.8))*uO*uW; gl_FragColor=vec4(uC*1.6*a, a); }`,
    });
    const trails = TL.CUPS.map((c) => {
      const core = new THREE.Mesh(new THREE.BufferGeometry(), trailMat(c.color, 1)); core.renderOrder = 12;
      const halo = new THREE.Mesh(new THREE.BufferGeometry(), trailMat(c.color, 0.25)); halo.renderOrder = 11;
      root.add(core, halo); return {core, halo};
    });

    // pivot glow, fulcrum wedge, distance lines
    const pivotCore = glowSprite(tex, '#FFE2A8', 1.2); const pivotHalo = glowSprite(tex, TL.AMBER, 7);
    rig.add(pivotCore, pivotHalo);
    const wedgeShape = new THREE.Shape(); wedgeShape.moveTo(0, 0); wedgeShape.lineTo(-28, -298); wedgeShape.lineTo(28, -298); wedgeShape.closePath();
    const wedgeGeo = new THREE.ExtrudeGeometry(wedgeShape, {depth: 5, bevelEnabled: false}); wedgeGeo.translate(0, 0, -2.5);
    const wedgeMat = rimGlass(TL.AMBER, 0.28, 0.7);
    const wedgeMesh = new THREE.Mesh(wedgeGeo, wedgeMat); wedgeMesh.position.set(0, -2.0, 0); wedgeMesh.renderOrder = 4; root.add(wedgeMesh);
    const wedgeTip = glowSprite(tex, TL.AMBER, 5); wedgeTip.position.set(0, -2.0, 0); root.add(wedgeTip);
    const lines = TL.CUPS.map((c) => {
      const len = Math.abs(c.x) + 0.001;
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, len, 8), new THREE.MeshBasicMaterial({color: col(c.color), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false}));
      m.rotation.z = Math.PI / 2; m.position.set(c.x / 2, TL.ROOF_Y + 0.1, 0); m.renderOrder = 12; rig.add(m); return m;
    });

    return {rowBlocks, rowsX, realBackCup, L, sun, hemi, cabinLight, U, clouds, rig, modelSeats, cabin, cups, drops, dropSeeds, trails, pivotCore, pivotHalo, wedgeMesh, wedgeMat, wedgeTip, lines, beltR: beltR as {mesh: THREE.Mesh; base: THREE.Vector3; open: THREE.Vector3} | null, glint, sky};
  }, [gl, scene, assets]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.03; cam.far = 60000;
  cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  W.sky.position.copy(cam.position);

  W.rig.position.set(0, TL.heave(t), 0);
  W.rig.rotation.set(0, 0, (TL.pitch(t) * Math.PI) / 180);
  W.rig.updateMatrixWorld(true);
  W.U.uPlaneInv.value.copy(W.rig.matrixWorld).invert();
  // inside the fuselage: 1 within the cabin shell, 0 outside the hull (blends across the window)
  const cl = cam.position.clone().applyMatrix4(W.U.uPlaneInv.value);
  const radial = Math.hypot(cl.y + 0.05, cl.z);
  const inCabinX = cl.x > TL.CABIN_X[0] - 1 && cl.x < TL.CABIN_X[1] + 1;
  const inside = inCabinX ? TL.clamp01((2.3 - radial) / 0.8) : 0;
  gl.toneMappingExposure = 0.3 + (0.62 - 0.3) * inside;
  W.hemi.intensity = 0.9 - 0.55 * inside;
  W.cabinLight.intensity = 2.2 * inside;
  W.sun.intensity = W.L.sunIntensity * (0.06 - 0.02 * inside);
  W.U.uGlass.value = TL.glass(t);
  W.U.uSpread.value = TL.rowSpread(t);
  W.U.uRowGlow.value = 0; W.U.uTail.value = 0; W.U.uWing.value = 0; // rows now glow as blocks
  const spread = TL.rowSpread(t), tail = TL.tailPulse(t), wing = TL.wingLift(t);
  W.rowsX.forEach((x, i) => {
    const d = Math.abs(x), on = TL.clamp01((spread - d) / 1.5);
    const k = on * (0.55 + 0.6 * tail * (x < -10 ? 1 : 0) + 0.7 * wing * (d < 3.5 ? 1 : 0));
    W.rowBlocks.setColorAt(i, TL.rowColour(d).multiplyScalar(k));
  });
  W.rowBlocks.instanceColor!.needsUpdate = true;
  W.rowBlocks.visible = spread > 0.05;
  (W.clouds.material as THREE.ShaderMaterial).uniforms.uShift.value = TL.cloudShift(t);
  W.cabin.visible = radial < 2.6 && inCabinX;
  W.modelSeats.forEach((m) => (m.visible = !W.cabin.visible));
  W.realBackCup.visible = TL.cupGrow(t, 2) < 0.02; // the real back cup becomes the giant one

  W.cups.forEach((cp, i) => {
    const g = TL.cupGrow(t, i);
    cp.g.visible = g > 0.001; cp.g.scale.setScalar(Math.max(g, 0.001));
    cp.stem.visible = g > 0.001; (cp.stem.material as THREE.MeshBasicMaterial).opacity = 0.7 * g;
    const w = TL.water(t, i);
    cp.surfPivot.rotation.z = w.tilt; cp.surfPivot.position.y = TL.CUP_H * TL.CUP_FILL + w.rise * 0.6;
    const crownH = w.rise * 1.4 + w.spill * 3.2;
    cp.crown.visible = crownH > 0.05; cp.crown.scale.y = Math.max(crownH, 0.01); cp.crown.position.y = TL.CUP_H * TL.CUP_FILL + crownH / 2;
    (cp.rim.material as THREE.MeshBasicMaterial).opacity = Math.min(1, w.spill * 1.6);
    (cp.base.material as THREE.SpriteMaterial).opacity = (i === 1 ? 0.55 : 0.3) * g;
    const bo = TL.trailOn(t); cp.bead.visible = cp.beadGlow.visible = bo > 0.01; cp.bead.scale.setScalar(Math.max(bo, 0.01)); (cp.beadGlow.material as THREE.SpriteMaterial).opacity = bo;
  });
  // droplets
  const tmp = new THREE.Object3D(); const t0 = TL.SPILL_T0();
  W.dropSeeds.forEach((d, i) => {
    const age = t - (t0 + d.t);
    if (age < 0 || age > 2.4 || TL.cupGrow(t, 2) < 0.5) { tmp.scale.setScalar(0); }
    else {
      const [lx, ly] = TL.planePoint(t0 + d.t, TL.CUPS[2].x, TL.ROOF_Y + TL.CUP_H);
      const vx = Math.cos(d.a) * d.out, vz = Math.sin(d.a) * d.out * 0.6;
      tmp.position.set(lx + vx * age, ly + d.up * age - 4.9 * age * age, vz * age);
      tmp.scale.setScalar(d.s);
    }
    tmp.updateMatrix(); W.drops.setMatrixAt(i, tmp.matrix);
  });
  W.drops.instanceMatrix.needsUpdate = true;
  // trails
  const on = TL.trailOn(t);
  W.trails.forEach((tr, i) => {
    tr.core.visible = tr.halo.visible = on > 0.01 && TL.cupGrow(t, i) > 0.5;
    if (!tr.core.visible) return;
    const pts = TL.trail(t, i).map(([x, y]) => new THREE.Vector3(x, y, 0));
    const curve = new THREE.CatmullRomCurve3(pts);
    tr.core.geometry.dispose(); tr.core.geometry = new THREE.TubeGeometry(curve, 80, 0.3, 8, false);
    tr.halo.geometry.dispose(); tr.halo.geometry = new THREE.TubeGeometry(curve, 80, 1.1, 8, false);
    (tr.core.material as THREE.ShaderMaterial).uniforms.uO.value = on; (tr.halo.material as THREE.ShaderMaterial).uniforms.uO.value = on;
  });
  // pivot, wedge, lines
  const pg = TL.pivotGlow(t);
  (W.pivotCore.material as THREE.SpriteMaterial).opacity = pg; (W.pivotHalo.material as THREE.SpriteMaterial).opacity = 0.6 * pg;
  W.pivotCore.visible = W.pivotHalo.visible = pg > 0.01;
  const wd = TL.wedge(t);
  W.wedgeMesh.visible = W.wedgeTip.visible = wd > 0.01;
  W.wedgeMesh.scale.y = Math.max(wd, 0.001); W.wedgeMat.uniforms.uOpacity.value = Math.min(1, wd * 1.5);
  (W.wedgeTip.material as THREE.SpriteMaterial).opacity = wd;
  const dl = TL.distLines(t);
  W.lines.forEach((m) => { (m.material as THREE.MeshBasicMaterial).opacity = 0.9 * dl; m.visible = dl > 0.01; });
  // belt: right half swings shut
  const b = TL.buckle(t);
  if (W.beltR) W.beltR.mesh.position.copy(W.beltR.base).addScaledVector(W.beltR.open, 1 - b);
  (W.glint.material as THREE.SpriteMaterial).opacity = TL.hump(t, TL.B.belt + 0.3, 0.6);

  return null;
};

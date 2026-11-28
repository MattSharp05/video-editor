// Waterfall: a free-falling sheet along a ballistic curve from a lip (streaks flowing down, whiter as it aerates,
// ragged edges), with mist and a plunge pool (see components.tsx). Scene units = metres.
import * as THREE from 'three';
import {NOISE} from './glsl';
import {WaterPreset, presetUniforms} from './presets';

export const waterfallGeometry = (lip: THREE.Vector3, dir: THREE.Vector3, width: number, height: number, outSpeed = 2.0, segs = 64) => {
  const g = 9.81, T = Math.sqrt(2 * height / g), d = dir.clone().setY(0).normalize(), side = new THREE.Vector3(-d.z, 0, d.x);
  const geo = new THREE.PlaneGeometry(1, 1, 24, segs), p = geo.attributes.position as THREE.BufferAttribute, uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const u = uv.getX(i) - 0.5, v = 1 - uv.getY(i), t = v * T;
    const spread = 1 + v * 0.25;                                   // the sheet widens a little as it falls
    const q = lip.clone().addScaledVector(side, u * width * spread).addScaledVector(d, outSpeed * t).add(new THREE.Vector3(0, -0.5 * g * t * t, 0));
    p.setXYZ(i, q.x, q.y, q.z); uv.setXY(i, u + 0.5, v * height);  // v in metres fallen
  }
  geo.computeVertexNormals();
  return geo;
};

export const waterfallMaterial = (preset: WaterPreset, uTime: THREE.IUniform, height: number) => {
  const m = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.35, metalness: 0, transparent: true, side: THREE.DoubleSide, depthWrite: false});
  const U = {...presetUniforms(preset), uTime, uH: {value: height}};
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vFall;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvFall = uv;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform vec3 uShallow, uFoamCol; uniform float uTime, uH; varying vec2 vFall; ${NOISE}`)
      .replace('#include <color_fragment>', /* glsl */`#include <color_fragment>
        float u = vFall.x, fallen = vFall.y, speed = sqrt(2.0 * 9.81 * max(fallen, 0.05));
        // streaks: noise stretched along the fall, scrolled at the local fall speed
        float s = wfbm(vec2(u * 38.0, fallen * 0.9 - uTime * speed * 0.9));
        float s2 = wfbm(vec2(u * 90.0 + 3.0, fallen * 2.2 - uTime * speed * 1.4));
        float aer = smoothstep(0.0, uH * 0.6, fallen);                 // aerated (white) further down
        float edge = smoothstep(0.0, 0.08 + 0.06 * s, min(u, 1.0 - u));
        diffuseColor.rgb = mix(uShallow * 1.2, uFoamCol, clamp(aer * 0.7 + s * 0.5, 0.0, 1.0));
        diffuseColor.a = clamp((0.55 + 0.45 * s2) * edge * mix(1.0, 0.85, aer), 0.0, 1.0);`);
  };
  m.customProgramCacheKey = () => 'water-fall';
  return m;
};

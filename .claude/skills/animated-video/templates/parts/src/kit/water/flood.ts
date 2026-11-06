// A flood front along a channel: a ribbon on the channel floor filled up to the front position sF, deepening behind
// it (H * (1 - exp(-(sF - s) / L))) with a bulging snout; muddy two-phase flow, foam at the front and banks.
// Path points sit on the channel floor; scene units = metres.
import * as THREE from 'three';
import {NOISE, BUMP} from './glsl';
import {WaterPreset, presetUniforms} from './presets';

export const floodGeometry = (path: THREE.Vector3[], width: number, sF: number, H = 1.5, L = 25) => {
  const runs = [0]; for (let i = 1; i < path.length; i++) runs.push(runs[i - 1] + path[i].distanceTo(path[i - 1]));
  const p: number[] = [], fl: number[] = [], idx: number[] = [];
  let n = 0;
  for (let i = 0; i < path.length; i++) {
    const s = runs[i]; if (s > sF) break;
    const a = path[i], b = path[Math.min(path.length - 1, i + 1)], c = path[Math.max(0, i - 1)];
    const d = b.clone().sub(c).setY(0).normalize(), side = new THREE.Vector3(-d.z, 0, d.x);
    const behind = sF - s, nose = Math.min(1, behind / 1.5);
    // depth builds behind the front, with a bulging snout a few metres back; the nose itself tapers to the ground
    const h = (H * (1 - Math.exp(-behind / L)) + H * 0.6 * Math.exp(-((behind - 2.5) ** 2) / 4)) * nose;
    const w = width * Math.sqrt(Math.min(1, behind / 5));                 // rounded in plan
    for (const k of [-1, 0, 1]) { const q = a.clone().addScaledVector(side, k * w / 2); p.push(q.x, q.y + h * (k === 0 ? 1 : 0.35), q.z); fl.push(s, (k + 1) / 2); }
    if (n > 0) { const o = (n - 1) * 3; idx.push(o, o + 3, o + 1, o + 1, o + 3, o + 4, o + 1, o + 4, o + 2, o + 2, o + 4, o + 5); }
    n++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('flow', new THREE.Float32BufferAttribute(fl, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};

export const floodMaterial = (preset: WaterPreset, uTime: THREE.IUniform, uFront: THREE.IUniform, width: number) => {
  const m = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.16, metalness: 0, side: THREE.DoubleSide});  // wet sheen: what makes muddy water read against dirt
  const U = {...presetUniforms(preset), uTime, uFront, uWidth: {value: width}};
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 flow; varying vec2 vFlow;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFlow = flow;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform vec3 uShallow, uDeep, uFoamCol; uniform float uTime, uFront, uWidth; varying vec2 vFlow; float vFoamF; ${NOISE} ${BUMP}`)
      .replace('#include <color_fragment>', /* glsl */`#include <color_fragment>
        vec2 m = vec2(vFlow.x, vFlow.y * uWidth);
        float behind = uFront - vFlow.x;
        float churn = wflow(m * vec2(0.5, 0.8), vec2(1.0, 0.0), uTime * 1.4, wn2(m * 0.07));
        float front = smoothstep(6.0, 0.0, behind), bank = smoothstep(0.2, 0.0, min(vFlow.y, 1.0 - vFlow.y));
        vFoamF = clamp(smoothstep(0.45, 0.75, churn + front * 0.7 + bank * 0.3) * (0.35 + 1.4 * front + bank), 0.0, 1.0);
        diffuseColor.rgb = mix(mix(uDeep, uShallow, churn * 0.6), uFoamCol, vFoamF);`)
            .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.7, vFoamF);')
      .replace('#include <normal_fragment_maps>', /* glsl */`#include <normal_fragment_maps>
        { vec2 mm = vec2(vFlow.x, vFlow.y * uWidth);
          normal = wbump(-vViewPosition, normal, wflow(mm * vec2(0.9, 1.3), vec2(1.0, 0.0), uTime * 2.0, 0.3), 0.6); }`);
  };
  m.customProgramCacheKey = () => 'water-flood';
  return m;
};

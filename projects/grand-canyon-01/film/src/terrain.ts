// The canyon as a block of real terrain (USGS 3DEP via AWS Terrain Tiles), in km, heights x VEX.
// One function, shape(depth, width), gives every state the film needs from the same data:
//   depth 0          the plateau before the canyon (rim level carried across)
//   depth 1, width w the canyon cut down to the river within w km of it (narrow = the first slot, wide = today)
import * as THREE from 'three';
import {staticFile, delayRender, continueRender} from 'remotion';
import {useEffect, useState} from 'react';

export const VEX = 1.6;                    // vertical exaggeration (labelled on screen)
export const BASE_M = -600;                // bottom of the block (deep basement)
export const Y = (m: number) => ((m - 700) / 1000) * VEX;
export const TILT = 23;                    // m per km: the layers rise to the north here (rims differ)

export type Fields = {G: number; size: number; cell: number; h: Float32Array; plateau: Float32Array; dist: Float32Array;
  river: [number, number][]; trib: [number, number][]};

let cache: Fields | null = null;
export const useFields = (): Fields | null => {
  const [f, setF] = useState<Fields | null>(cache);
  useEffect(() => {
    if (cache) return;
    const handle = delayRender('terrain');
    const bin = (n: string) => fetch(staticFile(n)).then((r) => r.arrayBuffer()).then((b) => new Float32Array(b));
    Promise.all([fetch(staticFile('terrain.json')).then((r) => r.json()), bin('h.bin'), bin('plateau.bin'), bin('dist.bin')])
      .then(([j, h, plateau, dist]) => {
        cache = {G: j.G, size: j.size_km, cell: j.cell_km, h, plateau, dist, river: j.river, trib: j.trib};
        setF(cache); continueRender(handle);
      });
  }, []);
  return f;
};

// grid (col,row) -> world x,z (km); north is -z, the camera's default view is from the south
export const wx = (f: Fields, c: number) => (c - f.G / 2) * f.cell;
export const wz = (f: Fields, r: number) => (r - f.G / 2) * f.cell;
export const northKm = (f: Fields, r: number) => (f.G / 2 - r) * f.cell;

// ----- rock layers (tops in m at the South Rim reference; NPS sequence, thicknesses approximate) -----
export type Band = {name: string; top: number; color: string; hard: boolean; world?: string};
export const BANDS: Band[] = [
  {name: 'Kaibab', top: 9999, color: '#D9CBA6', hard: true, world: 'sea'},
  {name: 'Toroweap', top: 2110, color: '#C9B48E', hard: false, world: 'sea'},
  {name: 'Coconino', top: 2040, color: '#EADCB9', hard: true, world: 'dunes'},
  {name: 'Hermit', top: 1940, color: '#A65A3E', hard: false, world: 'swamps'},
  {name: 'Supai', top: 1830, color: '#B4664A', hard: false, world: 'swamps'},
  {name: 'Redwall', top: 1620, color: '#A3624F', hard: true, world: 'sea'},
  {name: 'Muav', top: 1450, color: '#9A8F7C', hard: false, world: 'sea'},
  {name: 'Bright Angel', top: 1380, color: '#8E8F7C', hard: false, world: 'sea'},
  {name: 'Tapeats', top: 1170, color: '#75604A', hard: true, world: 'sea'},
  {name: 'Vishnu', top: 1100, color: '#2E2C31', hard: true},
];
const COLS = BANDS.map((b) => new THREE.Color(b.color));
export const bandAt = (m: number) => { let i = 0; while (i + 1 < BANDS.length && m < BANDS[i + 1].top) i++; return i; };
const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };

// colour of rock at elevation m (already corrected for tilt), with grain; `glow` brightens one band (by index)
export const rockColor = (out: THREE.Color, m: number, gx: number, gy: number, glow = -1, glowAmt = 0) => {
  const i = bandAt(m);
  out.copy(COLS[i]);
  const n = 0.9 + hash(gx, gy) * 0.2 + Math.sin(m * 0.09) * 0.03;      // grain and fine bedding
  out.multiplyScalar(n);
  if (i === BANDS.length - 1 && hash(gx * 3.1, gy * 1.7) > 0.975) out.set('#6E5A5E');   // granite veins in the schist
  if (i === glow && glowAmt > 0) out.lerp(new THREE.Color('#FFF1C9'), 0.45 * glowAmt);
  return out;
};

export type Shape = {depth: number; width: number; flat?: [number, number, number, number]}; // flat: cx,cz,radius km,y m
// elevation (m) at a grid cell for a shape
export const elevAt = (f: Fields, i: number, s: Shape) => {
  const w = s.width, d = f.dist[i];
  const mask = d <= w - 0.6 ? 1 : d >= w + 0.6 ? 0 : 1 - (d - (w - 0.6)) / 1.2;
  return f.plateau[i] - (f.plateau[i] - f.h[i]) * mask * s.depth;
};

// build or update the terrain surface + the four cut sides of the block
export const makeBlock = (f: Fields) => {
  const G = f.G;
  const top = new THREE.PlaneGeometry(1, 1, G - 1, G - 1);
  top.setAttribute('color', new THREE.BufferAttribute(new Float32Array(G * G * 3), 3));
  const ROWS = 140, edges = 4, per = G * ROWS;
  const side = new THREE.BufferGeometry();
  side.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edges * per * 3), 3));
  side.setAttribute('color', new THREE.BufferAttribute(new Float32Array(edges * per * 3), 3));
  const idx: number[] = [];
  for (let e = 0; e < edges; e++) for (let k = 0; k < G - 1; k++) for (let r = 0; r < ROWS - 1; r++) {
    const a = e * per + k * ROWS + r, b = a + ROWS;
    if (e % 2 === 0) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  side.setIndex(idx);
  return {top, side, ROWS};
};

const tmp = new THREE.Color();
export const shapeBlock = (f: Fields, blk: ReturnType<typeof makeBlock>, s: Shape, glow = -1, glowAmt = 0) => {
  const G = f.G, pos = blk.top.attributes.position as THREE.BufferAttribute, col = blk.top.attributes.color as THREE.BufferAttribute;
  const elev = new Float32Array(G * G);
  for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) {
    const i = r * G + c;
    let m = elevAt(f, i, s);
    if (s.flat) { const [fx, fz, rad, fy] = s.flat; const dx = wx(f, c) - fx, dz = wz(f, r) - fz, dd = Math.hypot(dx, dz);
      if (dd < rad) { const k = dd < rad * 0.6 ? 1 : 1 - (dd - rad * 0.6) / (rad * 0.4); m = m + (fy - m) * k; } }
    elev[i] = m;
    pos.setXYZ(i, wx(f, c), Y(m), wz(f, r));
    rockColor(tmp, m - TILT * northKm(f, r), c, r, glow, glowAmt);
    // the rim country is plateau top: Kaibab, a touch of green-grey scrub
    col.setXYZ(i, tmp.r, tmp.g, tmp.b);
  }
  pos.needsUpdate = true; col.needsUpdate = true; blk.top.computeVertexNormals();
  // sides: N (row 0), E (col G-1), S (row G-1), W (col 0); each column from the base to the surface
  const sp = blk.side.attributes.position as THREE.BufferAttribute, sc = blk.side.attributes.color as THREE.BufferAttribute;
  const R = blk.ROWS;
  const at = (e: number, k: number): [number, number] => e === 0 ? [k, 0] : e === 1 ? [G - 1, k] : e === 2 ? [G - 1 - k, G - 1] : [0, G - 1 - k];
  for (let e = 0; e < 4; e++) for (let k = 0; k < G; k++) {
    const [c, r] = at(e, k), m0 = elev[r * G + c];
    for (let q = 0; q < R; q++) {
      const m = BASE_M + (m0 - BASE_M) * (q / (R - 1)), j = e * G * R + k * R + q;
      sp.setXYZ(j, wx(f, c), Y(m), wz(f, r));
      rockColor(tmp, m - TILT * northKm(f, r), k + e * 1000, q, glow, glowAmt).multiplyScalar(0.92);
      sc.setXYZ(j, tmp.r, tmp.g, tmp.b);
    }
  }
  sp.needsUpdate = true; sc.needsUpdate = true; blk.side.computeVertexNormals();
  return elev;
};

// a world point on the river (index along the path, 0 = upstream/east) at a shape, plus the flow direction
export const riverPoint = (f: Fields, k: number, elev: Float32Array): THREE.Vector3 => {
  const p = f.river[Math.max(0, Math.min(f.river.length - 1, Math.round(k)))];
  return new THREE.Vector3(wx(f, p[0]), Y(elev[p[1] * f.G + p[0]]), wz(f, p[1]));
};

// One tabletop world, 1 unit = 1 cm: a wooden desk, an exam sheet, two silver coins (one with an amber marker arrow),
// a paper strip that is coin B's edge unrolled, the 1982 pair further down the sheet, a yellow pencil, and stacks of
// answer sheets for the payoff. Built once; per frame only transforms, uniforms, the strip and the graphite ink change.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {random} from 'remotion';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
export type Assets = {wood: THREE.Texture; woodN: THREE.Texture};

// ---------- the sheet's print (static): paper coordinates in cm, x -10.8..10.8, z -9..18.9
export const PAPER = {x0: -10.8, x1: 10.8, z0: -9, z1: 26.6}; // legal-length sheet
const PPC = 100; // px per cm
const SERIF = "'FreeSerif', 'DejaVu Serif', serif";
const HAND = "'DejaVu Sans', sans-serif";
// answer layout (cm)
export const BUB = [{n: '1', x: -2.0, z: 4.15}, {n: '2', x: 0.0, z: 4.15}, {n: '3', x: 2.0, z: 4.15}];
export const CHOICES = ['3/2', '3', '6', '9/2', '9'].map((v, i) => ({L: 'ABCDE'[i], v, x: [-6.7, -4.6, -2.6, -0.7, 1.4][i], z: 23.0}));
const printSheet = () => {
  const W = (PAPER.x1 - PAPER.x0) * PPC, H = (PAPER.z1 - PAPER.z0) * PPC;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d')!;
  g.fillStyle = '#F3F0E8'; g.fillRect(0, 0, W, H);
  // paper fibre: faint noise
  const img = g.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) { const n = (random('pp' + (i % 99991)) - 0.5) * 7; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n; }
  g.putImageData(img, 0, 0);
  const P = (x: number, z: number) => [(x - PAPER.x0) * PPC, (z - PAPER.z0) * PPC] as const;
  g.fillStyle = '#26262A'; g.textBaseline = 'alphabetic';
  // header + margin rule (a fixed "up the page")
  g.font = `600 30px ${SERIF}`; g.fillText('SECTION 2', ...P(-9.6, -7.9));
  g.textAlign = 'right'; g.fillText('MATHEMATICS', ...P(9.6, -7.9)); g.textAlign = 'left';
  g.fillRect(...P(-9.6, -7.6), 19.2 * PPC, 3);
  // question 7 (the equal coins), our own wording
  g.font = `600 38px ${SERIF}`; g.fillText('7.', ...P(-3.3, 5.25));
  g.font = `36px ${SERIF}`;
  ['Coin A rolls around coin B, the same', 'size. How many times does A turn?'].forEach((l, i) => g.fillText(l, ...P(-2.75, 5.25 + i * 0.5)));
  // bubbles
  g.lineWidth = 4; g.font = `600 34px ${SERIF}`; g.textAlign = 'center';
  g.font = `600 52px ${SERIF}`; g.lineWidth = 5; BUB.forEach((b) => { const [x, y] = P(b.x, b.z); g.beginPath(); g.ellipse(x, y, 66, 46, 0, 0, Math.PI * 2); g.stroke(); g.fillText(b.n, x, y + 18); });
  g.textAlign = 'left';
  // question 8 (the 1982 item, paraphrased)
  g.font = `600 44px ${SERIF}`; g.fillText('8.', ...P(-6.6, 11.4));
  g.font = `42px ${SERIF}`;
  ['The radius of circle A is 1/3 the radius of circle B.', 'Circle A rolls around circle B back to its start.', 'How many revolutions does circle A make?']
    .forEach((l, i) => g.fillText(l, ...P(-5.9, 11.4 + i * 0.6)));
  g.font = `48px ${SERIF}`;
  CHOICES.forEach((ch) => g.fillText(`(${ch.L}) ${ch.v}`, ...P(ch.x, ch.z + 0.2)));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};

// ---------- graphite ink (per frame): one canvas per question region, drawn from timeline state
type Ink = {c: HTMLCanvasElement; g: CanvasRenderingContext2D; glow: HTMLCanvasElement; gg: CanvasRenderingContext2D; tex: THREE.CanvasTexture; gtex: THREE.CanvasTexture; x0: number; z0: number; w: number; h: number; mesh: THREE.Mesh; glowMesh: THREE.Mesh};
const GPC = 20; // glow px per cm
const makeInk = (x0: number, z0: number, w: number, h: number, root: THREE.Object3D): Ink => {
  const c = document.createElement('canvas'); c.width = w * PPC; c.height = h * PPC; const g = c.getContext('2d')!;
  const glow = document.createElement('canvas'); glow.width = w * GPC; glow.height = h * GPC; const gg = glow.getContext('2d')!;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const gtex = new THREE.CanvasTexture(glow); gtex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({map: tex, transparent: true, roughness: 0.55, metalness: 0.15, depthWrite: false}));
  mesh.rotation.x = -Math.PI / 2; mesh.position.set(x0 + w / 2, 0.022, z0 + h / 2); mesh.renderOrder = 2; mesh.receiveShadow = true; root.add(mesh);
  const glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({map: gtex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
  glowMesh.rotation.x = -Math.PI / 2; glowMesh.position.set(x0 + w / 2, 0.03, z0 + h / 2); glowMesh.renderOrder = 3; root.add(glowMesh);
  return {c, g, glow, gg, tex, gtex, x0, z0, w, h, mesh, glowMesh};
};
const GRAPHITE = 'rgba(52,52,58,0.88)';
const INK_AMBER = 'rgba(176,104,18,0.95)', INK_CORAL = 'rgba(190,52,40,0.95)';
// pencil stroke along a polyline (cm), partially drawn (0..1), slightly rough
const stroke = (k: Ink, pts: [number, number][], w: number, colr: string, glowCol: string | null, part = 1) => {
  if (part <= 0) return;
  const len = pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  let left = len * part;
  const draw = (g: CanvasRenderingContext2D, s: number, cstr: string, lw: number) => {
    g.strokeStyle = cstr; g.lineWidth = lw * s; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
    let rem = left;
    g.moveTo((pts[0][0] - k.x0) * s, (pts[0][1] - k.z0) * s);
    for (let i = 1; i < pts.length && rem > 0; i++) {
      const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), f = Math.min(1, rem / d);
      g.lineTo((pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f - k.x0) * s, (pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f - k.z0) * s);
      rem -= d;
    }
    g.stroke();
  };
  draw(k.g, PPC, colr, w);
  if (glowCol) draw(k.gg, GPC, glowCol, w * 2.0);
};
// an arrow glyph at (x, z) pointing at angle a (0 = up the page, ccw seen from above), length L
const arrowPts = (x: number, z: number, a: number, L: number): [number, number][][] => {
  const d: [number, number] = [-Math.sin(a), -Math.cos(a)]; // up the page = -z
  const tip: [number, number] = [x + d[0] * L * 0.5, z + d[1] * L * 0.5], tail: [number, number] = [x - d[0] * L * 0.5, z - d[1] * L * 0.5];
  const side = (s: number): [number, number] => [tip[0] - d[0] * L * 0.32 + s * d[1] * L * 0.26, tip[1] - d[1] * L * 0.32 - s * d[0] * L * 0.26];
  return [[tail, tip], [side(1), tip, side(-1)]];
};
// handwritten digit(s) via the glyph outline, written on left to right
// handwritten digits as pencil strokes (glyphs in units of the height h; -y = up the page), written on in order
const GLYPH: Record<string, [number, number][][]> = {
  '1': [[[-0.18, -0.3], [0.04, -0.5], [0.02, 0.5]]],
  '2': [[[-0.3, -0.26], [-0.14, -0.46], [0.14, -0.49], [0.3, -0.3], [0.24, -0.08], [-0.32, 0.5], [0.36, 0.48]]],
  '3': [[[-0.3, -0.4], [0.0, -0.5], [0.3, -0.36], [0.26, -0.12], [-0.06, 0.0], [0.3, 0.12], [0.33, 0.36], [0.02, 0.5], [-0.32, 0.4]]],
  '4': [[[-0.22, -0.5], [-0.32, 0.14], [0.4, 0.14]], [[0.2, -0.32], [0.2, 0.5]]],
  '+': [[[-0.3, 0.02], [0.3, -0.02]], [[0.0, -0.3], [0.02, 0.3]]],
};
const write = (k: Ink, text: string, x: number, z: number, h: number, colr: string, glowCol: string | null, part: number) => {
  if (part <= 0) return;
  const chars = text.replace(/ /g, '').split(''), adv = 0.82 * h, x0 = x - ((chars.length - 1) * adv) / 2;
  const strokes: [number, number][][] = [];
  chars.forEach((ch, i) => (GLYPH[ch] || []).forEach((st) => strokes.push(st.map(([u, v]) => [x0 + i * adv + u * h - v * h * 0.12, z + v * h] as [number, number]))));
  const n = strokes.length;
  strokes.forEach((st, i) => stroke(k, st, h * 0.11, colr, glowCol, Math.min(1, Math.max(0, part * n - i))));
};
// a shaded bubble (scribble fill)
const shade = (k: Ink, b: {x: number; z: number}, part: number, colr: string, glowCol: string | null) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 18; i++) { const u = i / 18, zz = b.z - 0.4 + u * 0.8; const half = 0.62 * Math.sqrt(Math.max(0, 1 - ((zz - b.z) / 0.46) ** 2)); pts.push([b.x + (i % 2 ? half : -half), zz]); }
  stroke(k, pts, 0.13, colr, glowCol, part);
};

// ---------- coins
const faceDesign = (r: number) => {
  // a height map: machined rings, a raised inner ring and a ring of dots (generic, no real coin's design)
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d')!;
  g.fillStyle = '#7a7a7a'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(255,255,255,${0.03 + 0.03 * random('ring' + i + r)})`; g.lineWidth = 1; g.beginPath(); g.arc(S / 2, S / 2, (i / 90) * S * 0.48, 0, Math.PI * 2); g.stroke(); }
  g.strokeStyle = '#d8d8d8'; g.lineWidth = 9; g.beginPath(); g.arc(S / 2, S / 2, S * 0.4, 0, Math.PI * 2); g.stroke();
  // raised lettering round the rim (generic words, no real coin's design)
  const words = '• ROUND AND ROUND • ONE COIN • TWO TURNS ', n = words.length;
  g.fillStyle = '#e6e6e6'; g.font = `700 ${S * 0.055}px 'DejaVu Sans', sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2; g.save(); g.translate(S / 2 + Math.cos(a) * S * 0.445, S / 2 + Math.sin(a) * S * 0.445); g.rotate(a + Math.PI / 2); g.fillText(words[i], 0, 0); g.restore(); }
  // a central star relief (shows on coin B)
  g.fillStyle = '#bdbdbd'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? S * 0.09 : S * 0.2; g.lineTo(S / 2 + Math.cos(a) * rr, S / 2 + Math.sin(a) * rr); } g.fill();
  const t = new THREE.CanvasTexture(c); return t;
};
const arrowTex = () => {
  // amber marker ink: a slightly uneven stroke with darker overlaps and fibre streaks
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d')!;
  g.lineCap = 'round'; g.lineJoin = 'round';
  const path = () => { g.beginPath(); g.moveTo(258, 402); g.quadraticCurveTo(252, 260, 256, 116); g.moveTo(148, 218); g.lineTo(256, 106); g.lineTo(366, 212); };
  g.strokeStyle = 'rgba(214,118,22,0.92)'; g.lineWidth = 50; path(); g.stroke();
  g.strokeStyle = 'rgba(214,112,10,0.35)'; g.lineWidth = 18; path(); g.stroke();
  g.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(255,${190 + 40 * random('as' + i)},90,${0.10 + 0.12 * random('aa' + i)})`; g.lineWidth = 2; const y = random('ay' + i) * S, x = random('ax' + i) * S; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40, y + 6); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const coinBody = (r: number, th: number) => {
  const rim = Math.min(0.11, r * 0.09);
  const prof = [[0, 0], [r - 0.04, 0], [r - 0.006, 0.012], [r, 0.03], [r, th - 0.03], [r - 0.006, th - 0.012], [r - 0.03, th], [r - rim + 0.02, th - 0.004], [r - rim, th - 0.04], [0, th - 0.04]]
    .map(([x, y]) => new THREE.Vector2(x, y)).reverse();
  const seg = Math.round(r * 100) * 2;
  const geo = new THREE.LatheGeometry(prof, seg);
  // reeded edge: every other column of edge vertices pulled in
  const p = geo.attributes.position, n = prof.length;
  for (let j = 0; j <= seg; j++) for (let i = 0; i < n; i++) {
    const v = j * n + i, x = p.getX(v), y = p.getY(v), z = p.getZ(v), rr = Math.hypot(x, z);
    if (rr > r - 0.001 && y > 0.025 && y < th - 0.025 && j % 2) { const k = (r - 0.004) / rr; p.setX(v, x * k); p.setZ(v, z * k); }
  }
  geo.computeVertexNormals();
  return geo;
};
const makeCoin = (r: number, th: number, env: THREE.Texture, arrow: boolean) => {
  const g = new THREE.Group();
  const metal = new THREE.MeshPhysicalMaterial({color: col('#E2E5E9'), metalness: 1, roughness: 0.22, envMap: env, envMapIntensity: 1.35, clearcoat: 0.3, clearcoatRoughness: 0.25});
  const body = new THREE.Mesh(coinBody(r, th), metal); body.castShadow = true; body.receiveShadow = true; g.add(body);
  const bump = faceDesign(r);
  const faceMat = new THREE.MeshPhysicalMaterial({color: col('#E4E7EB'), metalness: 1, roughness: 0.3, envMap: env, envMapIntensity: 1.35, bumpMap: bump, bumpScale: 1.6});
  const face = new THREE.Mesh(new THREE.CircleGeometry(r - Math.min(0.11, r * 0.09), 96), faceMat);
  face.rotation.x = -Math.PI / 2; face.position.y = th - 0.04 + 0.0005; face.receiveShadow = true; g.add(face);
  let arrowMat: THREE.MeshStandardMaterial | null = null;
  if (arrow) {
    const at = arrowTex();
    arrowMat = new THREE.MeshStandardMaterial({map: at, transparent: true, roughness: 0.5, metalness: 0, emissive: col(TL.AMBER), emissiveMap: at, emissiveIntensity: 0.04, depthWrite: false});
    const a = new THREE.Mesh(new THREE.CircleGeometry(r * 0.78, 64), arrowMat);
    a.rotation.x = -Math.PI / 2; a.position.y = th - 0.04 + 0.002; a.renderOrder = 4; g.add(a);
  }
  return {g, arrowMat};
};

// ---------- pencil (built: the found ones were cartoon or untextured)
const makePencil = () => {
  const g = new THREE.Group();
  const L = 15.5, R = 0.36;
  const paint = new THREE.MeshPhysicalMaterial({color: col('#F2B51C'), roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.3});
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, L, 6, 1), paint); body.rotation.z = Math.PI / 2; g.add(body);
  const wood = new THREE.MeshStandardMaterial({color: col('#E3C28E'), roughness: 0.8});
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.06, R, 2.0, 6, 1), wood); cone.rotation.z = -Math.PI / 2; cone.position.x = L / 2 + 1.0; g.add(cone);
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 12), new THREE.MeshStandardMaterial({color: col('#2A2A2E'), roughness: 0.35, metalness: 0.4}));
  lead.rotation.z = -Math.PI / 2; lead.position.x = L / 2 + 2.17; g.add(lead);
  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.03, R * 1.03, 1.2, 24, 1), new THREE.MeshStandardMaterial({color: col('#B9B3A2'), metalness: 1, roughness: 0.35}));
  ferrule.rotation.z = Math.PI / 2; ferrule.position.x = -L / 2 - 0.6; g.add(ferrule);
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.98, R * 0.98, 0.9, 24, 1), new THREE.MeshStandardMaterial({color: col('#E58C8C'), roughness: 0.9}));
  eraser.rotation.z = Math.PI / 2; eraser.position.x = -L / 2 - 1.65; g.add(eraser);
  g.traverse((o) => { (o as THREE.Mesh).castShadow = true; });
  return g;
};

export const Scene: React.FC<{t: number; assets: Assets}> = ({t, assets}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.3; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.background = col('#0d0a08');
    const pm = new THREE.PMREMGenerator(gl);
    const es = new THREE.Scene(); es.background = col('#4a443d');
    const panel = (w: number, h: number, c: string, k: number, pos: [number, number, number]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: col(c).multiplyScalar(k), side: THREE.DoubleSide})); m.position.set(...pos); m.lookAt(0, 0, 0); es.add(m); };
    panel(6, 4, '#FFF0DC', 6, [-5, 6, -4]);   // the key's softbox
    panel(3, 6, '#BFD6F2', 2.6, [7, 3, 2]);   // a cool window
    panel(14, 14, '#6B5440', 0.7, [0, -5, 0]); // the desk's bounce
    panel(5, 3, '#F4F6FA', 3.2, [1, 7, 6]);   // a ceiling light behind the camera
    const env = pm.fromScene(es, 0.02).texture;
    const root = new THREE.Group(); scene.add(root);

    // light: warm key from the top-left (up the page, left), soft cool sky fill, warm bounce from the desk
    const key = new THREE.DirectionalLight(col('#FFE2B8'), 3.2);
    key.position.set(-32, 19, -26); key.target.position.set(0, 0, 4); root.add(key, key.target);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {left: -22, right: 22, top: 26, bottom: -26, near: 1, far: 120}); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
    const hemi = new THREE.HemisphereLight(col('#DCE5F2'), col('#6B5440'), 0.9); root.add(hemi);

    // desk: CC0 wood, darkening away from the sheet
    for (const tx of [assets.wood, assets.woodN]) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(8, 8); tx.anisotropy = 8; }
    assets.wood.colorSpace = THREE.SRGBColorSpace;
    const deskMat = new THREE.MeshStandardMaterial({map: assets.wood, normalMap: assets.woodN, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 0.55, color: col('#B89A82')});
    deskMat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWd;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWd = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWd;')
        .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.rgb *= mix(1.0, 0.18, smoothstep(30.0, 170.0, length(vWd.xz - vec2(0.0, 4.0))));');
    };
    const desk = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), deskMat); desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; root.add(desk);

    // the sheet
    const sheetMat = new THREE.MeshStandardMaterial({map: printSheet(), roughness: 0.92});
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(PAPER.x1 - PAPER.x0, 0.02, PAPER.z1 - PAPER.z0), [new THREE.MeshStandardMaterial({color: col('#E9E5DC'), roughness: 0.9}), new THREE.MeshStandardMaterial({color: col('#E9E5DC')}), sheetMat, sheetMat, new THREE.MeshStandardMaterial({color: col('#E9E5DC')}), new THREE.MeshStandardMaterial({color: col('#E9E5DC')})]);
    sheet.position.set((PAPER.x0 + PAPER.x1) / 2, 0.01, (PAPER.z0 + PAPER.z1) / 2); sheet.receiveShadow = true; root.add(sheet);
    // the sheet's top face texture runs +z down the page: BoxGeometry's +y face maps v along -z, so flip
    (sheetMat.map as THREE.Texture).flipY = true;

    // ink layers
    const inkEq = makeInk(-6, -5, 17, 11, root);
    const inkSat = makeInk(-8.5, 12.2, 17.5, 12.0, root);

    // coins
    const B = makeCoin(TL.R1, TL.TH, env, false); B.g.position.set(TL.B1[0], 0.02, TL.B1[1]); B.g.rotation.y = 0.6; root.add(B.g);
    const A = makeCoin(TL.R1, TL.TH, env, true); root.add(A.g);
    const BB = makeCoin(TL.RB, 0.24, env, false); BB.g.position.set(TL.B2[0], 0.02, TL.B2[1]); BB.g.rotation.y = 1.1; root.add(BB.g);
    const S = makeCoin(TL.RS, 0.15, env, true); root.add(S.g);

    // the strip: B's edge as a flat paper tape (2πR long) lying on the sheet; its outer edge is A's track. Wrapped,
    // it lies hidden under B; it slides out straight, then curls back under B.
    const N = 160, SH = 0.42;
    const stripGeo = new THREE.BufferGeometry();
    stripGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N + 1) * 2 * 3), 3));
    const uv = new Float32Array((N + 1) * 2 * 2); for (let i = 0; i <= N; i++) { uv.set([i / N, 1, i / N, 0], i * 4); }
    stripGeo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    const idx: number[] = []; for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } stripGeo.setIndex(idx);
    const stripTex = (() => { const c = document.createElement('canvas'); c.width = 2048; c.height = 96; const g = c.getContext('2d')!; g.fillStyle = '#FBFCFD'; g.fillRect(0, 0, 2048, 96); g.fillStyle = '#5FB2EA'; g.fillRect(0, 0, 2048, 9); for (let i = 0; i <= 40; i++) g.fillRect(i * 2045 / 40, 0, 4, i % 5 ? 30 : 52); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
    const stripMat = new THREE.MeshStandardMaterial({map: stripTex, roughness: 0.8, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2});
    const strip = new THREE.Mesh(stripGeo, stripMat); strip.receiveShadow = true; strip.frustumCulled = false; strip.renderOrder = 1; root.add(strip);

    // pencil, lower left on the sheet
    const pencil = makePencil(); pencil.position.set(13.5, 0.36, 12.0); pencil.rotation.y = 1.66; root.add(pencil);

    // stacks of answer sheets for the payoff: each spot is 2-3 offset sub-stacks; tops printed as bubble sheets
    const spots: {x: number; z: number; h: number; d: number; r: number; base: number}[] = [];
    for (let i = -7; i <= 7; i++) for (let j = -10; j <= 3; j++) {
      if (Math.abs(i) <= 1 && j === 0) continue;
      const x0 = i * 27 + (random('sx' + i + j) - 0.5) * 6, z0 = 8.8 + j * 41 + (random('sz' + i + j) - 0.5) * 6;
      let h = 0; const parts = 2 + Math.floor(random('sn' + i + j) * 2);
      for (let q = 0; q < parts; q++) {
        const dh = 0.8 + random('sh' + i + j + q) * 2.6;
        spots.push({x: x0 + (random('ox' + i + j + q) - 0.5) * 1.6, z: z0 + (random('oz' + i + j + q) - 0.5) * 1.6, h: h + dh, base: h, d: Math.hypot(x0, z0 - 8.8), r: (random('sr' + i + j + q) - 0.5) * 0.14});
        h += dh;
      }
    }
    const bubbleSheet = (() => {
      const c = document.createElement('canvas'); c.width = 432; c.height = 712; const g = c.getContext('2d')!;
      g.fillStyle = '#EFEBE2'; g.fillRect(0, 0, 432, 712); g.strokeStyle = 'rgba(60,60,70,0.55)'; g.lineWidth = 2;
      for (let cc = 0; cc < 4; cc++) for (let row = 0; row < 25; row++) for (let b = 0; b < 5; b++) { g.beginPath(); g.ellipse(36 + cc * 100 + b * 15, 70 + row * 25, 5, 4, 0, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = 'rgba(40,40,46,0.8)'; g.fillRect(30, 24, 220, 10);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    })();
    const stackMat = new THREE.MeshStandardMaterial({color: col('#CFCAC0'), roughness: 0.9});
    const falloff = (m: THREE.Material, bands: boolean) => { m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWs;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvec4 wq = modelMatrix * vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\nwq = modelMatrix * instanceMatrix * vec4(transformed, 1.0);\n#endif\nvWs = wq.xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWs;')
        .replace('#include <map_fragment>', '#include <map_fragment>\n' + (bands ? 'float b = fract(vWs.y * 9.0 + sin(vWs.x * 0.7 + vWs.z * 0.5) * 0.3); diffuseColor.rgb *= 0.86 + 0.14 * smoothstep(0.0, 0.25, b) * smoothstep(1.0, 0.7, b) - 0.05 * step(0.93, fract(vWs.y * 2.3));' : ''))
        .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.rgb *= mix(1.0, 0.18, smoothstep(30.0, 170.0, length(vWs.xz - vec2(0.0, 4.0))));');
    }; m.customProgramCacheKey = () => 'falloff' + bands; };
    falloff(stackMat, true);
    const stacks = new THREE.InstancedMesh(new THREE.BoxGeometry(21.6, 1, 35.6), stackMat, spots.length);
    const topsMat = new THREE.MeshStandardMaterial({map: bubbleSheet, roughness: 0.92, color: col('#C9C5BD')}); falloff(topsMat, false);
    const tops = new THREE.InstancedMesh(new THREE.PlaneGeometry(21.6, 35.6), topsMat, spots.length);
    const glows = new THREE.InstancedMesh(new THREE.PlaneGeometry(21.6, 35.6), new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}), spots.length);
    spots.forEach((s, i) => {
      const o = new THREE.Object3D(); o.position.set(s.x, (s.base + s.h) / 2, s.z); o.rotation.y = s.r; o.scale.set(1, s.h - s.base, 1); o.updateMatrix(); stacks.setMatrixAt(i, o.matrix);
      const p = new THREE.Object3D(); p.position.set(s.x, s.h + 0.01, s.z); p.rotation.set(-Math.PI / 2, 0, s.r); p.updateMatrix(); tops.setMatrixAt(i, p.matrix);
      p.position.y += 0.02; p.updateMatrix(); glows.setMatrixAt(i, p.matrix); glows.setColorAt(i, new THREE.Color(0, 0, 0));
    });
    stacks.castShadow = stacks.receiveShadow = true; tops.receiveShadow = true;
    const sheetGlow = new THREE.Mesh(new THREE.PlaneGeometry(21.6, 27.9), new THREE.MeshBasicMaterial({color: col(TL.AMBER), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
    sheetGlow.rotation.x = -Math.PI / 2; sheetGlow.position.set(0, 0.05, (PAPER.z0 + PAPER.z1) / 2); sheetGlow.scale.set(1, (PAPER.z1 - PAPER.z0) / 27.9, 1); root.add(sheetGlow);
    root.add(stacks, tops, glows);

    return {Bq: B.g, key, inkEq, inkSat, A, S, strip, stripGeo, N, SH, stacks, tops, glows, spots, sheetGlow};
  }, [gl, scene, assets]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.5; cam.far = 3000;
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();

  const sat = t >= TL.CUT_SAT;
  W.A.g.visible = W.Bq.visible = !sat;
  // coin A
  const a = TL.coinA(t);
  W.A.g.position.set(a.x, 0.02, a.z); W.A.g.rotation.set(0, a.spin, 0);
  W.A.arrowMat!.emissiveIntensity = 0.02 + 2.2 * Math.min(1, TL.arrowPulse(t));
  // small coin of the 1982 pair
  const s = TL.coinS(t);
  W.S.g.position.set(s.x, 0.02, s.z); W.S.g.rotation.set(0, s.spin, 0);
  W.S.arrowMat!.emissiveIntensity = 0.02 + 2.2 * Math.min(1, TL.arrowPulse(t));

  // strip
  W.strip.visible = TL.stripOn(t) > 0.01;
  if (W.strip.visible) {
    const k = TL.stripK(t), p = W.stripGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i <= W.N; i++) {
      const q = TL.stripAt((i / W.N) * TL.LTRACK, k);
      p.setXYZ(i * 2, q.x - 0.004 * q.nx, 0.018, q.z - 0.004 * q.nz); p.setXYZ(i * 2 + 1, q.x - W.SH * q.nx, 0.018, q.z - W.SH * q.nz);
    }
    p.needsUpdate = true; W.stripGeo.computeVertexNormals(); W.stripGeo.computeBoundingSphere();
  }

  // ink: the equal pair's region until the cut, then the 1982 region
  const ghost = (k: Ink, x: number, z: number, o: number) => { const pts: [number, number][] = []; for (let i = 0; i <= 64; i++) { const u = (i / 64) * Math.PI * 2; pts.push([x + Math.cos(u) * TL.R1, z + Math.sin(u) * TL.R1]); } stroke(k, pts, 0.03, `rgba(60,60,70,${0.45 * o})`, null, 1); };
  const drawInk = (k: Ink, f: () => void) => { k.g.clearRect(0, 0, k.c.width, k.c.height); k.gg.clearRect(0, 0, k.glow.width, k.glow.height); f(); k.tex.needsUpdate = true; k.gtex.needsUpdate = true; };
  if (!sat) {
    drawInk(W.inkEq, () => {
      const k = W.inkEq;
      // the centre route (pencil circle) drawn in the pause
      const rd = TL.routeDraw(t);
      if (rd > 0) { const pts: [number, number][] = []; for (let i = 0; i <= 96; i++) { const q = TL.orbitPos((i / 96) * Math.PI * 2, TL.R1, TL.R1, TL.B1); pts.push([q.x, q.z]); } stroke(k, pts, 0.06, 'rgba(60,80,110,0.8)', null, rd); }
      // arrow stamps
      for (let i = 0; i < TL.STAMPS; i++) {
        const o = TL.stamp(t, i); if (o <= 0) continue;
        const phi = (i / TL.STAMPS) * Math.PI * 2, q = TL.orbitPos(phi, TL.R1, TL.R1, TL.B1);
        const amb = TL.stampAmber(i);
        ghost(k, q.x, q.z, o);
        for (const seg of arrowPts(q.x, q.z, 2 * phi, 1.25)) stroke(k, seg, amb ? 0.13 : 0.09, amb ? INK_AMBER : GRAPHITE, amb ? 'rgba(255,181,71,0.45)' : null, o);
      }
      // the straight roll's start and end, both arrow up (just once)
      for (const [x, o] of [[TL.B1[0], TL.stripStamp(t, 0)], [TL.B1[0] + TL.LTRACK, TL.stripStamp(t, 1)]] as [number, number][]) {
        if (o <= 0) continue;
        ghost(k, x, TL.B1[1] + 2 * TL.R1, o);
        for (const seg of arrowPts(x, TL.B1[1] + 2 * TL.R1, 0, 1.25)) stroke(k, seg, 0.13, INK_AMBER, 'rgba(255,181,71,0.45)', o);
      }
      // bubbles
      const b1 = TL.bubbleOne(t), b2 = TL.bubbleTwo(t);
      shade(k, BUB[0], b1, `rgba(150,60,50,${0.9 - 0.45 * TL.bubbleOneDim(t)})`, b1 > 0 ? `rgba(255,90,78,${0.45 * (1 - TL.bubbleOneDim(t))})` : null);
      shade(k, BUB[1], b2, 'rgba(150,96,30,0.92)', 'rgba(255,181,71,0.22)');
      // tallies
      for (const ty of TL.tallyEq(t)) write(k, ty.text, 3.5, -3.6, 1.5, INK_AMBER, 'rgba(255,181,71,0.45)', ty.w);
      const st = TL.tallyStrip(t);
      if (st.one > 0) write(k, '1', 7.5, -0.6, 1.4, INK_AMBER, 'rgba(255,181,71,0.45)', st.one);
      if (st.plus > 0) write(k, '1 + 1', 2.7, -3.9, 1.2, INK_AMBER, 'rgba(255,181,71,0.45)', st.plus);
    });
  } else {
    drawInk(W.inkSat, () => {
      const k = W.inkSat;
      const n = TL.satCount(t);
      if (n > 0 && TL.fourWrite(t) < 0.01) write(k, String(n), TL.B2[0] - 5.0, TL.B2[1] - 3.2, 1.7, INK_AMBER, 'rgba(255,181,71,0.45)', 1);
      // the key's (B) 3 circled, then struck in coral; an amber 4 written in the gap
      const ch = CHOICES[1];
      const kc = TL.keyCircle(t);
      if (kc > 0) { const pts: [number, number][] = []; for (let i = 0; i <= 40; i++) { const u = (i / 40) * Math.PI * 2.15 - 0.4; pts.push([ch.x + 0.75 + Math.cos(u) * 1.15, ch.z + Math.sin(u) * 0.6]); } stroke(k, pts, 0.07, GRAPHITE, null, kc); }
      const ks = TL.keyStrike(t);
      if (ks > 0) stroke(k, [[ch.x - 0.3, ch.z + 0.3], [ch.x + 1.9, ch.z - 0.3]], 0.22, INK_CORAL, 'rgba(255,90,78,0.5)', ks);
      const fw = TL.fourWrite(t);
      if (fw > 0) write(k, '4', 4.0, CHOICES[4].z - 0.15, 1.6, INK_AMBER, 'rgba(255,181,71,0.5)', fw);
    });
  }
  W.inkEq.mesh.visible = W.inkEq.glowMesh.visible = !sat;

  // payoff: stacks appear and light in a wave
  const so = TL.stacksOn(t);
  W.stacks.visible = W.tops.visible = W.glows.visible = so > 0.001;
  const wr = TL.waveR(t);
  if (W.glows.visible) {
    W.spots.forEach((sp, i) => { const x = (wr - sp.d) / 28; const sm = (v: number) => { const q = Math.min(1, Math.max(0, v)); return q * q * (3 - 2 * q); }; const f = (Math.exp(-x * x) * sm(x + 2) + 0.22 * sm(x * 1.5)) * sm(wr / 25); W.glows.setColorAt(i, new THREE.Color(TL.AMBER).multiplyScalar(0.55 * f)); });
    W.glows.instanceColor!.needsUpdate = true;
  }
  (W.sheetGlow.material as THREE.MeshBasicMaterial).opacity = 0.14 * TL.clamp01(wr / 20) * (1 - 0.5 * TL.clamp01((wr - 60) / 60));
  return null;
};

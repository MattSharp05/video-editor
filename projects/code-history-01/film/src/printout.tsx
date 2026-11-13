// The printout that comes back through the hatch: continuous fanfold paper (14 7/8 in wide, green bars every
// 1/2 in, tractor holes at both edges), a line-printer listing of the job, the typo from the card in frame 4
// (COUNT punched as CUONT), the assembler's error, and a red pencil circle around it.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {random} from 'remotion';

export const PAPER = {w: 0.378, len: 0.62};
const LISTING = [
  'JOB 0417   SUBMITTED 16:47   RUN 19:12   PAGE 1',
  '',
  'LOC   CARD   SOURCE',
  '0001  0007         CLA   ZERO',
  '0002  0008         ADD   TOTAL,CUONT',
  '            ***  UNDEFINED SYMBOL   CUONT',
  '0003  0009         STO   TOTAL',
  '0004  0010         TRA   START',
  '',
  '            1 ERROR.   JOB ENDED.',
];
export const ERROR_LINE = 4; // index in LISTING of the line with the typo

function paperTexture() {
  const W = 1536, H = Math.round(W * PAPER.len / PAPER.w), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!; const px = W / PAPER.w;
  ctx.fillStyle = '#e4dfd2'; ctx.fillRect(0, 0, W, H);
  // green bars, 1/2 inch, between the tractor margins
  const bar = 0.0127 * px, margin = 0.016 * px;
  for (let y = 0, i = 0; y < H; y += bar, i++) if (i % 2 === 0) { ctx.fillStyle = 'rgba(120,160,120,0.28)'; ctx.fillRect(margin, y, W - 2 * margin, bar); }
  // perforation line across (fanfold)
  ctx.strokeStyle = 'rgba(80,70,60,0.35)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(0, H * 0.82); ctx.lineTo(W, H * 0.82); ctx.stroke(); ctx.setLineDash([]);
  // paper grain
  for (let i = 0; i < 12000; i++) { ctx.fillStyle = `rgba(90,80,60,${random(`pg${i}`) * 0.05})`; ctx.fillRect(random(`px${i}`) * W, random(`py${i}`) * H, 2, 1); }
  // the listing: line-printer type, slightly uneven ink
  const lh = (0.0254 / 6) * px; // 6 lines per inch
  ctx.font = `600 ${lh * 0.82}px "Courier New", Courier, monospace`; ctx.textBaseline = 'middle';
  const x0 = margin + 0.02 * px, y0 = 0.035 * px;
  LISTING.forEach((line, i) => {
    [...line].forEach((ch, k) => {
      ctx.fillStyle = `rgba(30,28,26,${0.78 + random(`ink${i}_${k}`) * 0.2})`;
      ctx.fillText(ch, x0 + k * lh * 0.5, y0 + i * lh * 1.6 + (random(`j${i}_${k}`) - 0.5) * 1.2);
    });
  });
  // red pencil circle around CUONT on the error line (hand-drawn: two loose passes)
  const cx = x0 + 33.5 * lh * 0.5, cy = y0 + ERROR_LINE * lh * 1.6, rx = 3.6 * lh * 0.5, ry = lh * 0.95;
  ctx.strokeStyle = 'rgba(178,40,32,0.9)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    for (let t = 0; t <= 1.08; t += 0.01) {
      const a = -0.6 + t * Math.PI * 2, wob = 1 + (random(`w${pass}${Math.round(t * 100)}`) - 0.5) * 0.04 + pass * 0.05;
      const x = cx + Math.cos(a) * rx * wob, y = cy + Math.sin(a) * ry * wob;
      t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // tractor holes cut out at both edges
  ctx.globalCompositeOperation = 'destination-out';
  for (let y = bar / 2; y < H; y += bar) for (const x of [margin / 2, W - margin / 2]) { ctx.beginPath(); ctx.arc(x, y, 0.002 * px, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return {t, lineY: (y0 + ERROR_LINE * lh * 1.6) / H, colX: cx / W};
}

// The sheet leaves the hatch at z = 0, rises over the lip, and lies on the counter toward the camera with a
// soft curl at the end. u runs across the paper, v along it (0 at the hatch).
export function paperPath(v: number) {
  const s = v * PAPER.len;
  const z = s * 0.98;
  const y = 0.004 + 0.012 * Math.exp(-s * 40) + (s > 0.5 ? (s - 0.5) ** 2 * 1.4 : 0);
  return new THREE.Vector3(0, y, z);
}

export const Printout: React.FC<{x?: number}> = ({x = 0.0}) => {
  const built = useMemo(() => {
    const {t, lineY, colX} = paperTexture();
    const geo = new THREE.PlaneGeometry(PAPER.w, PAPER.len, 8, 80);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i), v = 0.5 - pos.getY(i) / PAPER.len; // v: 0 at the far (hatch) end
      const p = paperPath(v);
      const sag = Math.sin((u / PAPER.w + 0.5) * Math.PI) * 0.0015; // a slight cup across the sheet
      pos.setXYZ(i, u, p.y + sag, p.z);
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, color: '#a29e96'});
    const mesh = new THREE.Mesh(geo, mat); mesh.position.x = x; mesh.receiveShadow = true;
    // world point of the circled typo, for aiming the camera and the hand
    const err = paperPath(lineY).add(new THREE.Vector3(x + (colX - 0.5) * PAPER.w, 0, 0));
    return {mesh, err};
  }, [x]);
  return <primitive object={built.mesh} />;
};

export const errorPoint = (x = 0) => {
  // matches paperTexture's layout (kept in sync by construction)
  const W = 1536, H = Math.round(W * PAPER.len / PAPER.w), px = W / PAPER.w, lh = (0.0254 / 6) * px;
  const margin = 0.016 * px, x0 = margin + 0.02 * px, y0 = 0.035 * px;
  const cx = x0 + 33.5 * lh * 0.5, cy = y0 + ERROR_LINE * lh * 1.6;
  return paperPath(cy / H).add(new THREE.Vector3(x + (cx / W - 0.5) * PAPER.w, 0, 0));
};

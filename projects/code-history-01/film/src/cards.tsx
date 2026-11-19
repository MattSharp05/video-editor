// Keypunch and 80-column card (IBM, 1928 format; keypunches like the IBM 026 from 1949).
// A card is 187.3 × 82.6 mm; 80 columns × 12 rows (12, 11, 0, 1–9 from the top). Letters punch a zone
// row plus a digit row (Hollerith): A–I = 12 + 1–9, J–R = 11 + 1–9, S–Z = 0 + 2–9. The keypunch prints
// the typed characters along the top edge. Light behind the card shows through the holes in amber.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {random} from 'remotion';
import {C} from './eniac';

export const CARD = {w: 0.1873, h: 0.0826};
export const CARD_TEXT = '       ADD  TOTAL,COUNT';
const ROWS = ['12', '11', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function hollerith(ch: string): string[] {
  if (ch === ' ') return [];
  if (/[0-9]/.test(ch)) return [ch];
  const c = ch.charCodeAt(0);
  if (ch >= 'A' && ch <= 'I') return ['12', String(c - 64)];
  if (ch >= 'J' && ch <= 'R') return ['11', String(c - 73)];
  if (ch >= 'S' && ch <= 'Z') return ['0', String(c - 81)];
  if (ch === ',') return ['0', '3', '8'];
  return [];
}

// Card face as a texture with holes cut out (alpha), printed digits and the interpreted text.
export function cardTexture(text: string, punchedCols: number) {
  const W = 2048, H = Math.round(W * CARD.h / CARD.w), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;
  const px = W / CARD.w; // pixels per metre
  ctx.fillStyle = '#cdbb94'; ctx.fillRect(0, 0, W, H);
  // paper fibre
  for (let i = 0; i < 9000; i++) { ctx.fillStyle = `rgba(120,95,60,${random(`f${i}`) * 0.05})`; ctx.fillRect(random(`x${i}`) * W, random(`y${i}`) * H, 2, 1); }
  const colX = (c: number) => (0.00635 + c * 0.002211) * px; // first column 6.35 mm in, 2.21 mm pitch
  const rowY = (r: number) => (0.00635 + r * 0.00635) * px;  // rows 6.35 mm apart, 12 row at the top
  // printed digit rows (0–9) and column numbers, in the card's faint magenta-brown ink
  ctx.fillStyle = 'rgba(140,70,60,0.55)'; ctx.font = `${0.0021 * px}px "Hanken Grotesk", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let r = 2; r < 12; r++) for (let c = 0; c < 80; c++) ctx.fillText(ROWS[r], colX(c), rowY(r));
  ctx.font = `${0.0011 * px}px "Hanken Grotesk", sans-serif`;
  for (let c = 0; c < 80; c++) { ctx.fillText(String(c + 1), colX(c), rowY(2) + 0.0032 * px); ctx.fillText(String(c + 1), colX(c), rowY(11) + 0.0032 * px); }
  // interpreted text along the top edge (what the keypunch prints)
  ctx.fillStyle = '#2a211a'; ctx.font = `700 ${0.0028 * px}px "Hanken Grotesk", sans-serif`;
  [...text].slice(0, punchedCols).forEach((ch, c) => ctx.fillText(ch, colX(c), 0.0025 * px));
  // holes: clear rectangles 1.4 × 3.2 mm (they go transparent; the light behind fills them)
  ctx.globalCompositeOperation = 'destination-out';
  [...text].slice(0, punchedCols).forEach((ch, c) => hollerith(ch).forEach((r) => {
    const ri = ROWS.indexOf(r); ctx.fillRect(colX(c) - 0.0007 * px, rowY(ri) - 0.0016 * px, 0.0014 * px, 0.0032 * px);
  }));
  ctx.globalCompositeOperation = 'source-over';
  // corner cut (top left), as real cards had
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0.006 * px, 0); ctx.lineTo(0, 0.006 * px); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function keyTexture(label: string) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#2b2926'; ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#e8e2d6'; ctx.font = '600 58px "Hanken Grotesk", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, 64, 68);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export const KEYROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM,'];
export const KEY = {pitch: 0.019, size: 0.016, y: 0.0, z0: 0.085};
export const keyPos = (ch: string) => {
  const r = KEYROWS.findIndex((row) => row.includes(ch)), c = KEYROWS[r].indexOf(ch);
  return new THREE.Vector3(-0.09 + c * KEY.pitch + r * 0.006, KEY.y + 0.012, KEY.z0 + r * KEY.pitch);
};

export const CardSet: React.FC<{pressed?: string; cols?: number}> = ({pressed = 'D', cols = 12}) => {
  const {gl, scene} = useThree();
  const env = useMemo(() => { const pm = new THREE.PMREMGenerator(gl); const t = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); return t; }, [gl]);
  scene.environment = env; scene.environmentIntensity = 0.15;
  scene.background = new THREE.Color(C.ground);
  scene.fog = new THREE.FogExp2(C.haze, 0.6);

  const built = useMemo(() => {
    const g = new THREE.Group();
    // desk: keypunch steel, warm dark grey
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.8), new THREE.MeshPhysicalMaterial({color: '#2b2824', roughness: 0.55, metalness: 0.3, clearcoat: 0.3}));
    desk.position.set(0.05, -0.02, 0.1); g.add(desk);
    // punch bed: the card stands tilted on a lightbox; the amber light is the thread
    const bed = new THREE.Group(); bed.position.set(0, 0.05, 0.02); bed.rotation.x = -0.55; g.add(bed);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(CARD.w * 0.97, CARD.h * 0.95), new THREE.MeshBasicMaterial({color: new THREE.Color('#ff8a1a').multiplyScalar(2.2), toneMapped: false}));
    glow.position.z = -0.006; bed.add(glow);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(CARD.w * 1.16, CARD.h * 1.4, 0.006), new THREE.MeshStandardMaterial({color: '#3a3631', metalness: 0.8, roughness: 0.35}));
    frame.position.z = -0.01; bed.add(frame);
    const card = new THREE.Mesh(new THREE.PlaneGeometry(CARD.w, CARD.h), new THREE.MeshStandardMaterial({map: cardTexture(CARD_TEXT, cols), color: '#a9a6a0', transparent: false, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85}));
    bed.add(card);
    // punch head over the next column
    const head = new THREE.Mesh(new RoundedBoxGeometry(0.014, 0.03, 0.022, 3, 0.003), new THREE.MeshStandardMaterial({color: '#8b8278', metalness: 1, roughness: 0.25}));
    head.position.set(-CARD.w / 2 + 0.00635 + cols * 0.002211, CARD.h / 2 + 0.006, 0.012); bed.add(head);
    // keyboard
    const capGeo = new RoundedBoxGeometry(KEY.size, 0.01, KEY.size, 3, 0.0025);
    KEYROWS.forEach((row) => [...row].forEach((ch) => {
      const p = keyPos(ch);
      const mats = [0, 1, 2, 3, 4, 5].map((i) => new THREE.MeshPhysicalMaterial(i === 2 ? {map: keyTexture(ch), roughness: 0.45, clearcoat: 0.4} : {color: '#2b2926', roughness: 0.45, clearcoat: 0.4}));
      const cap = new THREE.Mesh(capGeo, mats); cap.position.set(p.x, p.y - 0.006 - (ch === pressed ? 0.004 : 0), p.z); g.add(cap);
    }));
    // deck of finished cards to the right, slightly fanned
    const deckMat = new THREE.MeshStandardMaterial({color: '#e2d4b6', roughness: 0.9});
    for (let i = 0; i < 60; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(CARD.w, 0.00018, CARD.h), deckMat);
      c.position.set(0.19 + (random(`dx${i}`) - 0.5) * 0.002, 0.0002 + i * 0.0002, 0.05 + (random(`dz${i}`) - 0.5) * 0.002);
      c.rotation.y = 0.35 + (random(`dr${i}`) - 0.5) * 0.02; g.add(c);
    }
    // top card's stripe (the diagonal marker line programmers drew across a deck)
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(CARD.w * 1.05, 0.002), new THREE.MeshBasicMaterial({color: '#7a2f22'}));
    stripe.rotation.set(-Math.PI / 2, 0, 0.35 + 0.42); stripe.position.set(0.19, 0.0125, 0.05); g.add(stripe);
    return {g, glowPos: new THREE.Vector3(0, 0.05, 0.0)};
  }, [pressed, cols]);

  return (
    <>
      <primitive object={built.g} />
      <pointLight position={[0, 0.03, 0.09]} color={C.amber} intensity={0.04} distance={0.5} decay={2} />
      <spotLight position={[-0.5, 0.8, 0.7]} angle={0.5} penumbra={1} intensity={1.2} color={'#ffe2c0'} distance={3} decay={2} />
      <spotLight position={[0.8, 0.6, -0.6]} angle={0.6} penumbra={1} intensity={6} color={'#ffcf9a'} distance={3} decay={2} />
      <hemisphereLight args={['#4a3c30', '#0a0908', 0.45]} />
    </>
  );
};

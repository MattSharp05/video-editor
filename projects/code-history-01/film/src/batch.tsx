// Batch computing (1950s–70s computer centre): a deck of cards goes through the job-input hatch and the
// programmer waits, often hours, for the printout. The top card faces up with its holes lit amber (the
// thread); a wall clock shows the wait. Units: metres. Counter top at y = 0, wall at z = 0, facing +z.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {random} from 'remotion';
import {C} from './eniac';
import {CARD, CARD_TEXT, cardTexture} from './cards';
import {Printout} from './printout';

export const DECK = {n: 140, t: 0.00018, x: 0.02, z: 0.16}; // cards lie flat, long side along x
export const deckTop = () => DECK.n * DECK.t;

function clockFace(h: number, m: number) {
  const S = 512, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const ctx = cv.getContext('2d')!; const c = S / 2;
  ctx.fillStyle = '#ddd5c6'; ctx.beginPath(); ctx.arc(c, c, c - 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a2622';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, r1 = c - 22, r2 = i % 5 ? c - 34 : c - 56;
    ctx.lineWidth = i % 5 ? 4 : 12;
    ctx.beginPath(); ctx.moveTo(c + Math.sin(a) * r1, c - Math.cos(a) * r1); ctx.lineTo(c + Math.sin(a) * r2, c - Math.cos(a) * r2); ctx.stroke();
  }
  const hand = (a: number, len: number, w: number) => { ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.sin(a) * len, c - Math.cos(a) * len); ctx.stroke(); };
  ctx.strokeStyle = '#1d1a17';
  hand(((h % 12) + m / 60) / 12 * Math.PI * 2, c * 0.5, 16);
  hand(m / 60 * Math.PI * 2, c * 0.75, 10);
  ctx.fillStyle = '#1d1a17'; ctx.beginPath(); ctx.arc(c, c, 14, 0, Math.PI * 2); ctx.fill();
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function signTexture(text: string) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 192;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#26221e'; ctx.fillRect(0, 0, 1024, 192);
  ctx.fillStyle = '#d8cfbf'; ctx.font = '700 96px "Hanken Grotesk", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 512, 100);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// mode 'handin': the deck goes in (frame 5). 'printout': the deck is gone and the listing has come back (frame 6).
export const BatchSet: React.FC<{mode?: 'handin' | 'printout'; clock?: [number, number]}> = ({mode = 'handin', clock: time = [4, 47]}) => {
  const {gl, scene} = useThree();
  const env = useMemo(() => { const pm = new THREE.PMREMGenerator(gl); const t = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); return t; }, [gl]);
  scene.environment = env; scene.environmentIntensity = 0.15;
  scene.background = new THREE.Color(C.ground);
  scene.fog = new THREE.FogExp2(C.haze, 0.5);

  const built = useMemo(() => {
    const g = new THREE.Group();
    const wallMat = new THREE.MeshPhysicalMaterial({color: '#3a3833', roughness: 0.85});
    // counter: worn laminate on a steel edge
    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.5), new THREE.MeshPhysicalMaterial({color: '#4a443b', roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.4}));
    counter.position.set(0, -0.02, 0.25); g.add(counter);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.045, 0.012), new THREE.MeshStandardMaterial({color: '#8a8278', metalness: 1, roughness: 0.3}));
    edge.position.set(0, -0.02, 0.5); g.add(edge);
    // wall with the hatch (an opening 0.36 × 0.14 m) and a steel frame
    const W = 1.6, H = 1.0, hw = 0.36, hh = 0.14;
    const parts: [number, number, number, number][] = [[-(W + hw) / 4 - 0, H / 2, (W - hw) / 2, H], [(W + hw) / 4, H / 2, (W - hw) / 2, H], [0, hh + (H - hh) / 2, hw, H - hh]];
    parts.forEach(([x, y, w, h]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), wallMat); m.position.set(x, y, -0.025); g.add(m); });
    const fm = new THREE.MeshStandardMaterial({color: '#6e675d', metalness: 1, roughness: 0.35});
    [[0, hh, hw + 0.03, 0.015], [-(hw / 2 + 0.008), hh / 2, 0.015, hh], [hw / 2 + 0.008, hh / 2, 0.015, hh]].forEach(([x, y, w, h]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), fm); m.position.set(x, y, 0.005); g.add(m);
    });
    // inside the hatch: a warm glow from the machine room beyond
    const inside = new THREE.Mesh(new THREE.PlaneGeometry(hw, hh), new THREE.MeshBasicMaterial({color: new THREE.Color('#5a3a1c'), toneMapped: false}));
    inside.position.set(0, hh / 2, -0.3); g.add(inside);
    // sign above the hatch
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.049), new THREE.MeshStandardMaterial({map: signTexture('Job input'), roughness: 0.6}));
    sign.position.set(0, hh + 0.06, 0.002); g.add(sign);
    // wall clock, upper right
    const clock = new THREE.Group(); clock.position.set(0.33, 0.36, 0.01); g.add(clock);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.03, 64).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({color: '#2a2622', metalness: 0.6, roughness: 0.4}));
    clock.add(rim);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.1, 64), new THREE.MeshStandardMaterial({map: clockFace(time[0], time[1]), roughness: 0.7}));
    face.position.z = 0.016; clock.add(face);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.104, 64), new THREE.MeshPhysicalMaterial({color: '#ffffff', roughness: 0.05, transmission: 1, transparent: true, opacity: 0.12}));
    glass.position.z = 0.019; clock.add(glass);
    // the deck: cards flat on the counter, a rubber band, the diagonal marker stripe down its side
    const deck = new THREE.Group(); deck.position.set(DECK.x, 0, DECK.z); deck.rotation.y = 0.12; g.add(deck);
    const edgeMat = new THREE.MeshStandardMaterial({color: '#d6c9ac', roughness: 0.95});
    for (let i = 0; i < DECK.n; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(CARD.w, DECK.t * 0.9, CARD.h), edgeMat);
      c.position.set((random(`bx${i}`) - 0.5) * 0.0012, DECK.t * (i + 0.5), (random(`bz${i}`) - 0.5) * 0.0012); deck.add(c);
    }
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.0035, DECK.n * DECK.t * 1.4), new THREE.MeshBasicMaterial({color: '#8a2f22'}));
    stripe.position.set(0.02, DECK.n * DECK.t / 2, CARD.h / 2 + 0.0008); stripe.rotation.z = 1.0; deck.add(stripe);
    const band = new THREE.Mesh(new THREE.TorusGeometry(1, 0.0016, 8, 64), new THREE.MeshStandardMaterial({color: '#8a4a2e', roughness: 0.6}));
    band.scale.set(CARD.w / 2 + 0.002, CARD.h / 2 + 0.002, 1); band.rotation.x = Math.PI / 2; band.position.set(-0.05, DECK.n * DECK.t / 2, 0);
    band.scale.set(0.004 + 0.001, 1, 1); // flat loop around the short side
    const bandLoop = new THREE.Mesh(new RoundedBoxGeometry(0.004, DECK.n * DECK.t + 0.003, CARD.h + 0.003, 2, 0.0015), new THREE.MeshStandardMaterial({color: '#7a3a24', roughness: 0.55}));
    bandLoop.position.set(-0.05, DECK.n * DECK.t / 2, 0); deck.add(bandLoop);
    // top card face up, holes lit from a thin amber sheet under it
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(CARD.w * 0.97, CARD.h * 0.93), new THREE.MeshBasicMaterial({color: new THREE.Color('#ff8a1a').multiplyScalar(2.2), toneMapped: false}));
    glow.rotation.x = -Math.PI / 2; glow.position.y = DECK.n * DECK.t + 0.0002; deck.add(glow);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(CARD.w, CARD.h), new THREE.MeshStandardMaterial({map: cardTexture(CARD_TEXT, 23), color: '#a9a6a0', alphaTest: 0.5, roughness: 0.85}));
    top.rotation.x = -Math.PI / 2; top.position.y = DECK.n * DECK.t + 0.0005; deck.add(top);
    // the card box behind, half full
    const box = new THREE.Group(); box.position.set(-0.36, 0, 0.2); box.rotation.y = 0.25; g.add(box);
    const cardboard = new THREE.MeshStandardMaterial({color: '#7a6248', roughness: 0.9});
    const bw = CARD.w + 0.01, bl = 0.36, bh = CARD.h + 0.008;
    [[0, 0.002, 0, bw, 0.004, bl], [-bw / 2, bh / 2, 0, 0.004, bh, bl], [bw / 2, bh / 2, 0, 0.004, bh, bl], [0, bh / 2, bl / 2, bw, bh, 0.004], [0, bh / 2, -bl / 2, bw, bh, 0.004]].forEach(([x, y, z, w, h, d]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cardboard); m.position.set(x, y, z); box.add(m);
    });
    const cards = new THREE.Mesh(new THREE.BoxGeometry(CARD.w, CARD.h, bl * 0.55), edgeMat); cards.position.set(0, CARD.h / 2 + 0.004, -bl * 0.2); box.add(cards);
    return {g, deck};
  }, [time[0], time[1]]);
  built.deck.visible = mode === 'handin';

  return (
    <>
      <primitive object={built.g} />
      {mode === 'printout' && <Printout x={-0.02} />}
      <pointLight position={[DECK.x, deckTop() + 0.04, DECK.z]} color={C.amber} intensity={0.03} distance={0.4} decay={2} />
      <pointLight position={[0, 0.07, -0.15]} color={'#ff9a40'} intensity={0.4} distance={0.8} decay={2} />
      <spotLight position={[-0.6, 1.2, 1.0]} angle={0.45} penumbra={1} intensity={5} color={'#ffe2c0'} distance={4} decay={2} />
      <spotLight position={[0.9, 0.9, 0.9]} angle={0.5} penumbra={1} intensity={3} color={'#ffcf9a'} distance={4} decay={2} />
      <hemisphereLight args={['#4a3c30', '#0a0908', 0.4]} />
    </>
  );
};

// Noise cancel 01: one shot. Thought bubble (the myth) -> pops onto the hero's real ear cup -> into the cutaway cup ->
// dive into a noise squiggle (air) -> mics, chip, speaker, eardrum -> back out to the cabin's calm bubble -> into the
// music box -> out to the engine and the chatty neighbour -> the cushion -> recap in the cup -> out to the whole plane.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {B, CALM, COPY, CUP, FPS, Key, MK, MUSIC, NOISE, SM, WIN, camAt, layer, lerp, pop, pr, rnd, win} from './common';
import {Cabin, HERO, PEOPLE, BrickCup} from './Cabin';
import {Machine, MICS, Note, micUp, DRUM, SPK} from './Machine';
import {Air} from './Air';
import {Label, Squiggle} from './Squiggle';
import {BRICK, CALMPOPS, DENTS, ENGINE, L11, L2, L3, L4, L7, VOICES} from './events';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import words from './words.json';

export const DUR = Math.ceil(B.total * FPS);

const LINES = [
  'Lots of people think', 'noise cancelling headphones just [block] sound.', 'But actually, they make [more] sound.', 'They play an [upside] [down] copy of the noise.',
  'Sound is air being [pushed] and [pulled,]', 'over and over, like a wave.', 'Tiny [microphones] on your headphones', 'listen to the noise around you.',
  'A little [chip] makes a [flipped] copy.', 'Where the noise [pushes,]', 'the copy [pulls.]', 'The [speaker] plays that copy', 'along with your [music.]',
  'When a push meets a pull,', 'they [cancel] out.', 'Most of the hum [disappears]', 'right at your ear.', 'The chip [knows] your music,', "because it's the one [playing] it.",
  'So it only flips the [noise.]', 'It works best on [steady] hums,', 'like a plane [engine.]', 'Quick, changing sounds,', 'like [voices,] are [harder.]', 'The soft [cushions] help block those.',
  'So your headphones [listen,]', '[flip] the noise,', 'and [fight] sound with [sound.]',
];

// ---- master camera (cabin units) ----
const BUB = {x: -150, y: -1000, r: 400};
const BC = {x: -175, y: -965, r: 88};
const KEYS: Key[] = [
  [0, BC.x + 10, BC.y - 70, 1.95], [0.35, BC.x + 5, BC.y - 70, 1.85], [3.3, -150, -560, 0.52], [B.actually + 0.1, -150, -540, 0.5],
  [B.actually + 0.45, -60, -300, 0.62],
  MK(B.l1 + 2.0, 380, 580, 1.55), MK(L3.dive0 - 0.6, 350, 600, 1.6), MK(L3.dive0, -150, 500, 1.9), MK(L3.deep, -150, 500, 420),
  MK(L3.up0, -149.5, 500.6, 340), MK(L3.up1, -70, 500, 2.2),
  MK(B.l3 + 0.5, -40, 500, 2.05), MK(B.l4 - 0.2, 140, 505, 2.25), MK(B.chip5 + 0.9, 260, 500, 2.4), MK(B.where + 0.6, 370, 650, 1.72), MK(B.l5 - 0.3, 380, 640, 1.75),
  MK(B.plays + 0.4, 450, 440, 2.0), MK(B.l6 - 0.3, 560, 480, 2.1), MK(L7.go + 0.5, 760, 480, 2.45), MK(L7.out0, 770, 485, 2.75),
  [B.disappears + 0.9, 235, 40, 1.15], [B.l7 - 0.6, 205, 25, 1.3],
  MK(B.knows + 1.1, 330, 390, 1.9), MK(B.l8 - 0.4, 300, 430, 2.2),
  [B.best + 1.0, 210, -60, 1.0], [B.quick, 260, -30, 1.06], [B.l9 - 0.4, 290, -10, 1.12],
  [B.cushions + 0.8, 168, 28, 3.1], [B.l10 - 0.15, 160, 22, 3.35],
  MK(B.listen11 + 0.1, 470, 500, 1.02), MK(L11.out0, 520, 500, 1.1), [L11.out0 + 0.55, 120, -60, 0.45], [B.total - 0.9, 500, 300, 0.07], [B.total, 540, 300, 0.064],
];

// ---- the thought bubble (line 1) ----
const Bubble: React.FC<{t: number}> = ({t}) => {
  const p = pr(t, L2.pop, L2.pop + 0.08);
  if (t > L2.pop + 1.6) return null;
  const blobs = Array.from({length: 11}, (_, i) => {
    const a = (i / 11) * Math.PI * 2; return {x: BUB.x + Math.cos(a) * BUB.r * 0.86, y: BUB.y + Math.sin(a) * BUB.r * 0.7, r: BUB.r * (0.32 + 0.06 * Math.sin(i * 2.1)) + Math.sin(t * 2 + i) * 6};
  });
  const trails = [PEOPLE[1], {x: HERO.x}, PEOPLE[2]].map((pp, k) => ({x: pp.x, y: k === 1 ? -110 : -40}));
  if (p < 1) {
    return (
      <g>
        {trails.map((tr, k) => [0, 1, 2].map((j) => {
          const u = (j + 1) / 4; const x = lerp(tr.x, BUB.x + (k - 1) * 120, u), y = lerp(tr.y, BUB.y + BUB.r * 0.7, u);
          return <circle key={`${k}${j}`} cx={x} cy={y + Math.sin(t * 3 + j + k) * 5} r={14 + j * 12} fill="#F4F1EA" opacity={0.9} />;
        }))}
        {blobs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#F4F1EA" />)}
        <ellipse cx={BUB.x} cy={BUB.y} rx={BUB.r * 0.95} ry={BUB.r * 0.78} fill="#F4F1EA" />
        <ellipse cx={BUB.x} cy={BUB.y} rx={BUB.r * 0.86} ry={BUB.r * 0.68} fill="#DCE3EE" />
        {/* the imagined head with brick cups */}
        <ellipse cx={BC.x + 40} cy={BC.y - 20} rx={140} ry={160} fill="#EFD3BC" stroke="#8A6A58" strokeWidth={5} />
        <path d={`M${BC.x + 175} ${BC.y - 60} q30 26 0 50`} fill="#EFD3BC" stroke="#8A6A58" strokeWidth={5} />
        <ellipse cx={BC.x + 115} cy={BC.y - 70} rx={9} ry={11} fill="#2A2A30" />
        <path d={`M${BC.x + 95} ${BC.y + 20} q22 14 44 -2`} stroke="#2A2A30" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d={`M${BC.x - 5} ${BC.y - 80} C${BC.x - 20} ${BC.y - 230} ${BC.x + 120} ${BC.y - 250} ${BC.x + 150} ${BC.y - 160}`} stroke="#2C2F38" strokeWidth={26} fill="none" strokeLinecap="round" />
        <BrickCup x={BC.x} y={BC.y} r={BC.r} stamp={pop(t, B.block - 0.1, 0.35)} />
        <Label x={BC.x + 70} y={BC.y - 240} text="HEADPHONES" size={30} rot={-14} op={win(t, 0, B.block + 0.3, 0.3)} />
        {/* hail of noise: squiggles fly in from the engine side, hit the bricks and ping off with sparks */}
        {Array.from({length: 22}, (_, i) => {
          const t0 = -0.6 + i * 0.2, hit = t0 + 0.55; if (t < t0 || t > hit + 0.8) return null;
          const ang = (rnd(i) - 0.5) * 1.3; const sx = BC.x - 330 - rnd(i + 3) * 60, sy = BC.y + Math.sin(ang) * 260;
          const hx = BC.x - BC.r * 0.75, hy = BC.y + (rnd(i + 5) - 0.5) * BC.r * 1.2;
          let x, y, rot;
          if (t < hit) { const u = (t - t0) / 0.55; x = lerp(sx, hx, u); y = lerp(sy, hy, u); rot = (Math.atan2(hy - sy, hx - sx) * 180) / Math.PI; }
          else { const u = (t - hit) / 0.8; const ba = Math.PI + ang * 1.6 + (rnd(i + 9) - 0.5); x = hx + Math.cos(ba) * 380 * u; y = hy + Math.sin(ba) * 380 * u + 200 * u * u; rot = 180 + u * 300; }
          return (
            <g key={i}>
              <Squiggle t={t} x={x} y={y} rot={rot} len={110} amp={18} color={NOISE} seed={i + 20} sw={8} op={1 - pr(t, hit + 0.5, hit + 0.8)} label={i === 2 ? 'NOISE' : undefined} labelOp={1} />
              {t > hit && t < hit + 0.3 && <g transform={`translate(${hx} ${hy}) scale(${1 + (t - hit) * 4})`} opacity={1 - (t - hit) / 0.3}>
                {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={0} y1={0} x2={Math.cos(k * 1.26) * 26} y2={Math.sin(k * 1.26) * 26} stroke="#FFE7A0" strokeWidth={5} strokeLinecap="round" />)}</g>}
            </g>
          );
        })}
      </g>
    );
  }
  // popped: shards fall onto the hero's real cup (the carrier)
  const k = (t - L2.pop) / 1.5;
  return (
    <g opacity={1 - pr(t, L2.pop + 0.9, L2.pop + 1.5)}>
      {Array.from({length: 26}, (_, i) => {
        const a = (i / 26) * Math.PI * 2; const sx = BUB.x + Math.cos(a) * BUB.r * 0.9, sy = BUB.y + Math.sin(a) * BUB.r * 0.72;
        const ex = CUP.x + (rnd(i) - 0.5) * 260, ey = CUP.y + (rnd(i + 1) - 0.5) * 200;
        const u = Math.min(1, k * (0.8 + rnd(i + 2) * 0.4)), uu = u * u;
        const x = lerp(sx, ex, uu) + Math.cos(a) * 160 * Math.sin(Math.PI * u), y = lerp(sy, ey, uu) + Math.sin(a) * 120 * Math.sin(Math.PI * u);
        return <path key={i} d="M-26 -8 L22 -14 L28 10 L-18 14 Z" transform={`translate(${x} ${y}) rotate(${a * 57 + u * 400 * (rnd(i + 4) - 0.5)}) scale(${1 - u * 0.6})`} fill="#F4F1EA" />;
      })}
    </g>
  );
};

// ---- squiggle traffic inside the cup (machine units) ----
const MTraffic: React.FC<{t: number; mz: number}> = ({t, mz}) => {
  const tipOf = (i: number) => { const m = MICS[i]; return {x: m.x + Math.cos(m.a) * 85, y: m.y + Math.sin(m.a) * 85}; };
  const out: React.ReactNode[] = [];
  // the lead squiggle: arrives outside the shell, we dive into it, then mic 1 catches it
  {
    const arrive = pr(t, B.actually + 0.8, L3.dive0 - 0.3, (x: number) => 1 - Math.pow(1 - x, 2));
    const tip = tipOf(1); const c = pr(t, L4.catch[1] - 0.6, L4.catch[1]);
    const x = lerp(lerp(-480, -150, arrive), tip.x - 30, c), y = 500;
    const fadeDeep = 1 - pr(Math.log(mz), Math.log(20), Math.log(45));
    out.push(<Squiggle key="lead" t={t} x={x} y={y} len={130 * (1 - c * 0.8)} amp={24 * (1 - c * 0.8)} color={NOISE} seed={2} op={(t < L4.catch[1] ? 1 : 0) * fadeDeep * pr(t, B.actually + 0.6, B.actually + 1)} />);
  }
  // two more noises around you: from the vent and the trolley, caught by mics 0 and 2
  for (const [i, sx, sy, t0] of [[0, -330, 200, B.tiny - 0.4], [2, -470, 760, B.mics]] as [number, number, number, number][]) {
    const tip = tipOf(i); const ct = L4.catch[i]; if (t < t0 || t > ct) continue;
    const u = pr(t, t0, ct, (x: number) => x); const c = pr(t, ct - 0.35, ct);
    out.push(<Squiggle key={`m${i}`} t={t} x={lerp(sx, tip.x - 30, u)} y={lerp(sy, tip.y, u)} rot={(Math.atan2(tip.y - sy, tip.x - sx) * 180) / Math.PI} len={110 * (1 - c * 0.8)} amp={20 * (1 - c * 0.8)} color={NOISE} seed={30 + i} />);
  }
  // line 7: the noise (through the cup) and its copy (from the speaker) run at each other at the eardrum
  if (t > L7.go - 0.2 && t < L7.popT + 0.7) {
    const M = {x: DRUM.x - 95, y: 500};
    const u = pr(t, L7.go, L7.meet, (x: number) => 1 - Math.pow(1 - x, 1.6));
    const pp = pr(t, L7.popT - 0.25, L7.popT + 0.5, (x: number) => x);
    const nx = lerp(M.x - 40, M.x, u), ny = lerp(110, M.y, u);
    out.push(<Squiggle key="n7" t={t} x={nx} y={ny} rot={lerp(70, 0, Math.min(1, u * 1.3))} color={NOISE} seed={41} pop={pp} len={150} amp={30} wob={0} />);
    out.push(<Squiggle key="c7" t={t} x={lerp(SPK.x + 60, M.x, u)} y={M.y} flip={1} color={COPY} seed={42} pop={pp} len={150} amp={30} wob={0} />);
    // under them: the noise's crowded air meets the copy's gap and evens out
    const calm = pr(t, L7.popT - 0.3, L7.popT + 0.2);
    out.push(
      <g key="s7" opacity={win(t, L7.go, L7.popT + 0.6, 0.3)}>
        {Array.from({length: 26}, (_, j) => {
          const bx = 600 + j * 12, dn = (1 - calm) * (j < 13 ? -1 : 1) * Math.exp(-Math.pow((j - 6.5 - u * 3) / 3, 2)) * 22 * (j < 13 ? 1 : 0);
          const dc = (1 - calm) * Math.exp(-Math.pow((j - 19.5 + u * 3) / 3, 2)) * 22 * Math.sign(j - 19.5);
          return [0, 1].map((r) => <circle key={`${j}${r}`} cx={bx + dn + dc + Math.sin(t * 6 + j) * 1} cy={720 + r * 15} r={6} fill={j < 13 && calm < 0.5 ? '#F0C9A8' : calm < 0.5 ? '#A9C4EE' : '#D5D8E2'} />);
        })}
        <Label x={650} y={790} text="PUSH" size={24} color="#FFD2AE" op={1 - calm} />
        <Label x={850} y={790} text="PULL" size={24} color="#BFD6FF" op={1 - calm} />
        <Label x={750} y={795} text="calm" size={24} color={CALM} op={calm} />
      </g>,
    );
  }
  // line 11: the punch: noise and copy, each in a boxing glove, hit at the same instant and pop
  if (t > L11.punch - 0.7 && t < L11.punch + 0.8) {
    const u = pr(t, L11.punch - 0.6, L11.punch, (x: number) => x * x); const pp = pr(t, L11.punch, L11.punch + 0.6, (x: number) => x);
    out.push(<Squiggle key="pn" t={t} x={lerp(110, 455, u)} y={760} color={NOISE} seed={51} glove={1} pop={pp} len={120} amp={24} />);
    out.push(<Squiggle key="pc" t={t} x={lerp(SPK.x + 40, 545, u)} y={760} flip={1} color={COPY} seed={52} glove={1} pop={pp} len={120} amp={24} />);
  }
  return <g>{out}</g>;
};

// ---- squiggle traffic in the cabin (cabin units) ----
const CTraffic: React.FC<{t: number}> = ({t}) => {
  const out: React.ReactNode[] = [];
  const W0 = {x: WIN.x + 40, y: WIN.y + 30};
  // line 7b: squiggles drift in from the engine and pop at the calm bubble's edge; one small one gets through
  CALMPOPS.forEach((tp, i) => {
    if (t < tp - 1.1 || t > tp + 0.6) return;
    const a = -2.4 + i * 0.35; const ex = CUP.x + Math.cos(a) * 150, ey = CUP.y + Math.sin(a) * 160;
    const u = pr(t, tp - 1.1, tp, (x: number) => x);
    out.push(<Squiggle key={`cp${i}`} t={t} x={lerp(W0.x - 80 + i * 30, ex, u)} y={lerp(W0.y - 60 + i * 50, ey, u)} rot={(Math.atan2(ey - W0.y, ex - W0.x) * 180) / Math.PI} len={70} amp={12} sw={5} color={NOISE} seed={60 + i} pop={pr(t, tp, tp + 0.55, (x: number) => x)} />);
  });
  if (t > B.most && t < B.l7 + 0.6) {
    out.push(<Squiggle key="surv" t={t} x={CUP.x - 85 + Math.sin(t * 3) * 8} y={CUP.y - 70 + Math.cos(t * 2.3) * 6} rot={20} len={34} amp={5} sw={3} color={NOISE} seed={70} op={0.75 * win(t, B.most + 0.5, B.l7 + 0.5, 0.3)} />);
  }
  // line 9: the engine metronome: every squiggle meets a copy halfway and they pop on the beat
  ENGINE.forEach((e, i) => {
    if (t < e.spawn || t > e.pop + 0.6) return;
    const M = {x: lerp(W0.x, CUP.x, 0.55), y: lerp(W0.y, CUP.y, 0.55) - 10};
    const u = pr(t, e.spawn, e.pop, (x: number) => x); const pp = pr(t, e.pop, e.pop + 0.5, (x: number) => x);
    const rot = (Math.atan2(CUP.y - W0.y, CUP.x - W0.x) * 180) / Math.PI;
    out.push(<Squiggle key={`e${i}`} t={t} x={lerp(W0.x, M.x, u)} y={lerp(W0.y, M.y, u)} rot={rot} len={120} amp={20} sw={8} color={NOISE} seed={80 + i} pop={pp} wob={0} />);
    const v = pr(t, e.pop - 0.45, e.pop, (x: number) => x);
    if (t > e.pop - 0.45) out.push(<Squiggle key={`ec${i}`} t={t} x={lerp(CUP.x - 50, M.x, v)} y={lerp(CUP.y - 10, M.y, v)} rot={rot} flip={1} len={120} amp={20} sw={8} color={COPY} seed={90 + i} pop={pp} wob={0} />);
  });
  // line 9b: voices keep changing shape; copies come late and wrong-shaped; some get through to the cushion
  VOICES.forEach((v, i) => {
    const mouth = {x: PEOPLE[2].x - 52, y: 80 + 42};
    const end = v.survive ? DENTS[i / 2]?.t0 ?? v.lop + 1 : v.lop + 0.5;
    if (t < v.spawn || t > end + 0.1) return;
    const M = {x: lerp(mouth.x, CUP.x, 0.6), y: lerp(mouth.y, CUP.y, 0.6)};
    const target = v.survive ? {x: CUP.x + Math.cos(DENTS[i / 2]?.a ?? 0) * 72 * 0.92, y: CUP.y + Math.sin(DENTS[i / 2]?.a ?? 0) * 72} : M;
    const u1 = pr(t, v.spawn, v.lop, (x: number) => x);
    let x = lerp(mouth.x, M.x, u1), y = lerp(mouth.y, M.y, u1);
    if (v.survive && t > v.lop) { const u2 = pr(t, v.lop, end, (x: number) => x * x); x = lerp(M.x, target.x, u2); y = lerp(M.y, target.y, u2); }
    const rot = (Math.atan2(CUP.y - mouth.y, CUP.x - mouth.x) * 180) / Math.PI;
    const pp = v.survive ? 0 : pr(t, v.lop, v.lop + 0.5, (x: number) => x);
    const s = v.survive && t > v.lop ? 1 - 0.35 * pr(t, v.lop, end) : 1;
    out.push(<Squiggle key={`v${i}`} t={t} x={x} y={y} rot={rot} len={(115 + 35 * Math.sin(t * 5 + i)) * s} amp={(20 + 10 * Math.sin(t * 7 + i * 2)) * s} jag={1} sw={8} color={NOISE} seed={100 + i} pop={pp} label={i === 0 ? 'VOICE' : i === 2 && t > v.lop ? 'GETS THROUGH' : undefined} labelOp={i === 0 ? win(t, v.spawn, v.lop + 0.3, 0.2) : win(t, v.lop + 0.1, Math.min(end, B.cushions + 0.2), 0.15)} labelScale={1.5} />);
    // the copy: late, the wrong shape; it bumps the voice lopsided
    const c0 = v.lop - 0.35;
    if (t > c0 && t < v.lop + 0.5) {
      const w = pr(t, c0, v.lop + 0.1, (x: number) => x);
      out.push(<Squiggle key={`vc${i}`} t={t} x={lerp(CUP.x + 50, M.x + 8, w)} y={lerp(CUP.y, M.y + 10, w)} rot={rot + 180} len={110} amp={20} sw={8} color={COPY} seed={110 + i} pop={pr(t, v.lop, v.lop + 0.5, (x: number) => x)} wob={0} label={i === 1 ? 'TOO LATE' : undefined} labelOp={i === 1 ? 1 : 0} labelScale={1.4} />);
    }
  });
  // the music note dancing inside the calm bubble (line 7b), which the camera follows home (line 8)
  if (t > B.disappears - 0.2 && t < B.knows + 1.2) {
    const k = pr(t, B.knows, B.knows + 1.1);
    out.push(<g key="nt" transform={`translate(${lerp(CUP.x + 40 + Math.sin(t * 2.2) * 25, CUP.x, k)} ${lerp(CUP.y - 40 + Math.abs(Math.sin(t * 4)) * -25, CUP.y, k)}) scale(${0.28 * (1 - k * 0.5)})`}><Note x={0} y={0} glow={1} rot={Math.sin(t * 5) * 15} op={pr(t, B.disappears - 0.2, B.disappears + 0.2)} /></g>);
  }
  return <g>{out}</g>;
};

// ---- the plane from outside (cabin units, huge) ----
const SkyWorld: React.FC<{t: number}> = ({t}) => (
  <g>
    <defs><linearGradient id="skyBig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3F5A92" /><stop offset="0.6" stopColor="#B78C8A" /><stop offset="1" stopColor="#F0B27A" /></linearGradient></defs>
    <rect x={-30000} y={-40000} width={60000} height={80000} fill="url(#skyBig)" />
    {Array.from({length: 14}, (_, i) => <ellipse key={i} cx={-14000 + i * 2400 - ((t * 900) % 2400)} cy={-9000 + (i % 5) * 4500} rx={2200 + (i % 3) * 700} ry={500 + (i % 2) * 200} fill="#FBE2D2" opacity={0.45} />)}
    {/* fuselage (cabin cutaway sits in it), tail fin, wing and engine */}
    <path d="M-7400 -1100 L5600 -1100 C7400 -1100 8200 -300 8300 0 C8200 400 7400 1100 5600 1100 L-6600 1100 L-7600 200 Z" fill="#E3E6EC" stroke="#9AA1B2" strokeWidth={40} />
    <path d="M-7300 -1050 L-8600 -3600 L-7400 -3600 L-5600 -1050 Z" fill="#D2D6DE" stroke="#9AA1B2" strokeWidth={40} />
    {[-6200, -5600, -5000, -4400, -3800, -3200, -2600, 2400, 3000, 3600, 4200, 4800].map((x) => <rect key={x} x={x - 70} y={-290} width={140} height={200} rx={64} fill="#5B6E95" />)}
    <path d="M-2600 700 L1400 700 L-1200 3400 L-2800 3400 Z" fill="#C9CDD6" stroke="#9AA1B2" strokeWidth={36} />
    <rect x={-2200} y={1450} width={2200} height={800} rx={400} fill="#D9DCE3" stroke="#9AA1B2" strokeWidth={36} />
    <ellipse cx={0} cy={1850} rx={150} ry={380} fill="#3B4150" />
    {/* hum pours off the engine */}
    {[0, 1, 2, 3, 4].map((i) => { const r = 600 + (((t * 1600) + i * 900) % 4500); return <circle key={i} cx={0} cy={1850} r={r} fill="none" stroke={NOISE} strokeWidth={90} opacity={0.5 * (1 - r / 5100)} />; })}
    <Label x={-1100} y={1910} text="ENGINE" size={300} op={0.9} color="#7A8090" />
  </g>
);

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const t = useCurrentFrame() / FPS;
  const cam = camAt(t, KEYS);
  const mz = cam.z * SM;
  // which layers are on: the machine room fades in as the cup fills the frame; the cabin hides deep inside
  const mOp = pr(Math.log(mz), Math.log(0.45), Math.log(0.75));
  const cOp = mz < 0.9 ? 1 : 0;
  const g = mz * 0.15;               // air: px per air unit (dive into the lead squiggle)
  const aOp = pr(g, 4, 7) * (t > L3.dive0 && t < L3.up1 + 0.3 ? 1 : 0);
  const air = {ox: 540 + (mToCx(-150) - cam.x) * cam.z, oy: 960 + (mToCy(500) - cam.y) * cam.z};
  const inset = win(t, B.where - 0.1, B.l5 + 0.2, 0.35);
  const talk = win(t, B.quick - 0.6, B.cushions + 0.5, 0.4) + 0.25 * win(t, B.best, B.quick - 0.6, 0.3);
  const calm = pr(t, B.most - 0.2, B.most + 0.6) * (1 - pr(t, B.knows + 0.6, B.knows + 1.4)) + pr(t, L11.out0 + 0.2, L11.out0 + 1.0);
  const clip = t > L11.out0;
  const tagIn = win(t, B.actually + 1.6, B.l2 - 0.2, 0.3) + win(t, L4.sink - 0.3, B.l4 + 1.4, 0.3);
  return (
    <AbsoluteFill style={{background: '#232B40', overflow: 'hidden'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <defs><clipPath id="cut"><rect x={-1800} y={-760} width={3600} height={1520} /></clipPath></defs>
        {clip && <g transform={layer(cam, 0, 0, 1)}><SkyWorld t={t} /></g>}
        {cOp > 0 && (
          <g transform={layer(cam, 0, 0, 1)} clipPath={clip ? 'url(#cut)' : undefined}>
            <Cabin t={t} talk={talk} calm={calm} nodAmp={2 + 4 * win(t, 0.4, B.l1, 0.3)} cushionLabel={win(t, B.cushions, B.l10 + 0.2, 0.3)}
              brick={win(t, BRICK.on, BRICK.off, 0.12)} dents={DENTS} engineLabel={win(t, B.best + 0.4, B.quick, 0.3) + win(t, 0.6, B.l1 - 0.3, 0.3) * 0.0} headLabel={0} />
            <CTraffic t={t} />
            <Bubble t={t} />
          </g>
        )}
        {mOp > 0.001 && (
          <g opacity={mOp} transform={layer(cam, CUPx0(), CUPy0(), SM)}>
            <Machine t={t} inset={inset} />
            <MTraffic t={t} mz={mz} />
          </g>
        )}
        {clip && (
          <g transform={layer(cam, 0, 0, 1)}>
            <ellipse cx={CUP.x} cy={CUP.y} rx={900} ry={900} fill={CALM} opacity={0.22 * (1 - pr(cam.z, 0.12, 0.3))} />
            <g transform={`translate(${CUP.x + 300} ${CUP.y - 700 + Math.sin(t * 4) * 120}) scale(${9 * (1 - pr(cam.z, 0.12, 0.3))})`}><Note x={0} y={0} glow={1} rot={Math.sin(t * 5) * 15} /></g>
          </g>
        )}
      </svg>
      <Air t={t} g={g} op={aOp} ox={air.ox} oy={air.oy} waveOn={pr(t, B.pushed - 0.6, B.pushed)} />
      {/* honesty tag while inside the cup */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 1420, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 42, color: '#F4EEE2',
        opacity: Math.min(1, tagIn) * 0.9, textShadow: '0 2px 10px rgba(0,0,0,0.9)'}}>{t < B.l3 ? 'Illustration · not to scale' : 'Real mics sit flush in tiny holes'}</div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 62% at 50% 48%, rgba(0,0,0,0) 60%, rgba(8,10,18,0.45) 100%)', pointerEvents: 'none'}} />
      {captions && <Captions t={t} words={words} lines={LINES} accent={NOISE} font={SANS} scrim="10,12,22" />}
    </AbsoluteFill>
  );
};
const mToCx = (mx: number) => CUP.x + (mx - 500) * SM;
const mToCy = (my: number) => CUP.y + (my - 500) * SM;
const CUPx0 = () => CUP.x - 500 * SM;
const CUPy0 = () => CUP.y - 500 * SM;
export {MUSIC, micUp};

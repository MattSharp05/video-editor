// The cutaway ear cup, in machine units (1000 × 1000; (500, 500) sits on the hero's cup). Left → right: outside
// (the cabin, magnified) | shell with 3 mics | chip + music box | speaker | eardrum.
import React from 'react';
import {B, CALM, COPY, MUSIC, NOISE, lerp, pop, pr, rnd, win} from './common';
import {BELT, L11, L2, L4, L7, NOTES} from './events';
import {Label, Squiggle, sqPath} from './Squiggle';
import {shud} from './Cabin';

export const CHIP = {x: 330, y: 500}, BOX = {x: 330, y: 300}, SPK = {x: 600, y: 500}, DRUM = {x: 850, y: 500};
export const MICS = [200, 180, 160].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return {x: 500 + 470 * Math.cos(a), y: 500 + 470 * Math.sin(a), a};
});
const BELT_IN0 = 130, BELT_IN1 = 285, BELT_OUT0 = 385, BELT_OUT1 = 560;

// how far up the mic stalks are (0 = flush in the shell)
export const micUp = (t: number) => Math.max(pop(t, L4.up, 0.5) * (1 - pr(t, L4.sink, L4.sink + 0.5)), pop(t, L11.mics - 0.1, 0.5) * (1 - pr(t, L11.punch, L11.punch + 0.6)));

const Note: React.FC<{x: number; y: number; s?: number; op?: number; glow?: number; rot?: number}> = ({x, y, s = 1, op = 1, glow = 0, rot = 0}) => op <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    {glow > 0 && <circle r={40} fill={MUSIC} opacity={0.25 * glow} />}
    <ellipse cx={-8} cy={14} rx={15} ry={11} transform="rotate(-20 -8 14)" fill={MUSIC} stroke="#4A5212" strokeWidth={2.5} />
    <rect x={4} y={-34} width={6} height={48} fill={MUSIC} stroke="#4A5212" strokeWidth={1.5} />
    <path d="M10 -34 q22 8 18 30 q-6 -14 -18 -14 Z" fill={MUSIC} stroke="#4A5212" strokeWidth={1.5} />
  </g>
);
export {Note};

// a one-bump slice of the trace
const Slice: React.FC<{x: number; y: number; rot: number; color: string; op?: number; s?: number}> = ({x, y, rot, color, op = 1, s = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    <path d="M-30 0 C-18 0 -14 -26 0 -26 C14 -26 18 0 30 0" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={13} strokeLinecap="round" />
    <path d="M-30 0 C-18 0 -14 -26 0 -26 C14 -26 18 0 30 0" fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" />
  </g>
);

const mixC = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), C = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, C[i], k))).join(',')})`;
};

// a strip of air balls under a wave: displacement d(x) pushes balls together under crests
const BallStrip: React.FC<{x0: number; x1: number; y: number; t: number; amp: number; sign: number; k: number; w: number; seed: number; r?: number}> = ({x0, x1, y, t, amp, sign, k, w, seed, r = 7}) => {
  const n = Math.round((x1 - x0) / 15);
  return (
    <g>
      {Array.from({length: n * 3}, (_, i) => {
        const col = i % n, row = Math.floor(i / n);
        const bx = x0 + (col + 0.5) * ((x1 - x0) / n) + (row % 2) * 6;
        const dx = sign * amp * Math.sin(k * bx - w * t) + Math.sin(t * 7 + i * 1.7) * 1.2;
        const comp = -sign * Math.cos(k * bx - w * t) * (amp > 1 ? 1 : 0);
        return <circle key={i} cx={bx + dx} cy={y + (row - 1) * 15 + Math.sin(t * 5 + i) * 1.4 + rnd(seed + i) * 4} r={r} fill={comp > 0.3 ? '#F0C9A8' : comp < -0.3 ? '#A9C4EE' : '#D5D8E2'} opacity={0.9} />;
      })}
    </g>
  );
};

export const Machine: React.FC<{t: number; inset: number}> = ({t, inset}) => {
  const chipOn = pr(t, B.chip5 - 0.1, B.chip5 + 0.3);
  const boxOn = pr(t, B.plays - 0.3, B.plays + 0.2);
  // L2: speaker pumps from "more sound"; keeps pumping (it plays music) after line 6
  const pump = Math.max(win(t, B.more, B.l2 - 0.2, 0.3), pr(t, B.plays, B.plays + 0.3) * (1 - pr(t, B.knows + 4, B.knows + 5)), win(t, L11.flip, B.total, 0.3)) * Math.sin(t * 26) * 7;
  // eardrum: thumps with the noise until push meets pull
  const drumAmp = 1 - pr(t, L7.popT - 0.2, L7.popT + 0.15) * (1 - pr(t, B.best, B.best + 1)) ;
  const drumX = Math.sin(t * 14) * 9 * drumAmp + Math.sin(t * 23) * 3 * drumAmp;
  const crank = boxOn * t * 7;
  // spatula: swings with each flip; stops short on a note
  let spat = -25;
  let glance = 0, lit = -1;
  BELT.items.forEach((it, i) => {
    const k = (t - it.flip + 0.12) / (BELT.ARC + 0.12);
    if (k > 0 && k < 1) {
      if (it.spared) { spat = -25 - 45 * Math.sin(Math.PI * Math.min(1, k * 1.6)) * (k < 0.6 ? 1 : 0); glance = Math.sin(Math.PI * k); lit = i; }
      else spat = -25 - 160 * Math.sin(Math.PI * k);
    }
  });
  const frantic = win(t, B.quick + 0.2, B.cushions, 0.3);
  if (frantic > 0) spat = -25 - 150 * (0.5 + 0.5 * Math.sin(t * 40)) * frantic;
  const flipBeat = win(t, L11.flip - 0.05, L11.flip + 0.5, 0.05);
  if (flipBeat > 0) spat = -25 - 160 * Math.sin(Math.PI * pr(t, L11.flip - 0.05, L11.flip + 0.45));
  const mu = micUp(t);

  return (
    <g>
      <defs>
        <radialGradient id="cupin" cx="0.45" cy="0.45"><stop offset="0" stopColor="#2A3146" /><stop offset="1" stopColor="#151A27" /></radialGradient>
        <pattern id="foam2" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#5D6170" /><circle cx="4" cy="4" r="2.4" fill="#767B8C" /><circle cx="11" cy="10" r="1.8" fill="#474B58" /></pattern>
      </defs>
      {/* outside the cup: the cabin, magnified and soft */}
      <rect x={-2600} y={-1700} width={5200} height={4400} fill="#2C3550" />
      {[[-420, 120, 260, '#3A4A75'], [-380, 950, 300, '#232A3D'], [1350, 380, 360, '#3A4A75'], [-900, 600, 320, '#36405C'], [1300, 1100, 280, '#1E2436']].map(([x, y, r, c], i) => (
        <ellipse key={i} cx={(x as number) + Math.sin(t * 0.3 + i) * 20} cy={y as number} rx={r as number} ry={(r as number) * 1.3} fill={c as string} opacity={0.8} />
      ))}
      {/* cabin vent (a ribbon flaps in its draft) and the trolley rolling past: two of the noises around you */}
      <g transform="translate(-330 130)">
        <rect x={-60} y={-24} width={120} height={48} rx={14} fill="#C9C6BE" />
        {[-36, -12, 12, 36].map((x) => <rect key={x} x={x - 6} y={-14} width={12} height={28} rx={4} fill="#8E8B84" />)}
        <path d={`M0 24 q${10 + Math.sin(t * 9) * 14} 30 ${Math.sin(t * 7) * 18} 70`} stroke="#E28A3C" strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
      <g transform={`translate(${-560 + ((t * 40) % 400)} 880)`}>
        <rect x={-110} y={-130} width={220} height={150} rx={14} fill="#B9BCC6" />
        <rect x={-96} y={-110} width={192} height={18} rx={6} fill="#8F95A6" /><rect x={-96} y={-70} width={192} height={18} rx={6} fill="#8F95A6" />
        {[-70, 70].map((x) => <circle key={x} cx={x} cy={30} r={16} fill="#3B4150" />)}
      </g>
      {/* air motes everywhere: each drifts on its own and jostles with the hum (calmer near the ear after the cancel) */}
      {Array.from({length: 46}, (_, i) => {
        const bx = -500 + rnd(`mx${i}`) * 1900, by = -200 + rnd(`my${i}`) * 1400, r = 7 + rnd(`mr${i}`) * 9;
        const x = bx + Math.sin(t * (0.3 + rnd(`ms${i}`) * 0.5) + i) * 60 + Math.sin(t * 13 + i * 2.3) * 5;
        const y = by + Math.cos(t * (0.25 + rnd(`mt${i}`) * 0.4) + i * 1.7) * 50 + Math.cos(t * 11 + i) * 4;
        return <circle key={`mo${i}`} cx={x} cy={y} r={r} fill="#C9D3EA" opacity={0.18 + 0.14 * Math.sin(t * 2 + i)} />;
      })}
      {/* the cup */}
      <circle cx={500} cy={500} r={485} fill="#3A3F4D" />
      <circle cx={500} cy={500} r={440} fill="url(#cupin)" />
      {/* faint circuit traces on the cup's inside */}
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${160 + i * 30} ${190 + i * 16} h${120 + i * 20} v${40} h${60}`} stroke="#3B4767" strokeWidth={3} fill="none" opacity={0.6} />)}
      {Array.from({length: 26}, (_, i) => {
        const a = rnd(`ca${i}`) * Math.PI * 2, rr = Math.sqrt(rnd(`cr${i}`)) * 400;
        const x = 500 + Math.cos(a + t * 0.08 * (i % 2 ? 1 : -1)) * rr + Math.sin(t * 12 + i) * 4, y = 500 + Math.sin(a + t * 0.08 * (i % 2 ? 1 : -1)) * rr + Math.cos(t * 9 + i * 1.3) * 4;
        return <circle key={`ci${i}`} cx={x} cy={y} r={6 + rnd(`cs${i}`) * 6} fill="#8FA2CC" opacity={0.22} />;
      })}
      {/* cushion foam on the head side */}
      <path d="M 742 87 A 480 480 0 0 1 742 913 L 720 860 A 420 420 0 0 0 720 140 Z" fill="url(#foam2)" />
      {/* ear canal + eardrum */}
      <path d={`M760 400 C810 405 840 410 905 405 M760 600 C810 595 840 590 905 595`} stroke="#C98B6E" strokeWidth={10} fill="none" />
      <path d={`M${DRUM.x} 410 Q${DRUM.x + drumX * 2.2} 500 ${DRUM.x} 590`} stroke="#F2C2A6" strokeWidth={9} fill="#E7A88A" fillOpacity={0.35} />
      <Label x={DRUM.x + 8} y={650} text="EAR" size={34} op={win(t, B.when7 - 0.4, B.l7 - 0.3, 0.3)} />
      {/* mics on the shell (stalks rise out, like snail eyes, then sink back flush) */}
      {MICS.map((m, i) => {
        const len = 85 * mu;
        const tipX = m.x + Math.cos(m.a) * len, tipY = m.y + Math.sin(m.a) * len;
        const caught = L4.catch[i];
        const wob = win(t, caught - 0.05, caught + 0.9, 0.1) * Math.sin(t * 40) * 4;
        const sw = Math.sin(t * 2 + i * 2) * 14 * mu + (i - 1) * 18 * mu;
        return (
          <g key={i}>
            <line x1={m.x} y1={m.y} x2={tipX} y2={tipY} stroke="#4B5162" strokeWidth={14} strokeLinecap="round" />
            <g transform={`translate(${tipX} ${tipY}) rotate(${(m.a * 180) / Math.PI + sw})`}>
              <ellipse rx={20 + wob * 0.3} ry={26} fill="#22252E" stroke="#8A90A0" strokeWidth={4} />
              {[-12, -4, 4, 12].map((yy) => <line key={yy} x1={-8 + wob} y1={yy} x2={10 + wob} y2={yy} stroke="#6D7282" strokeWidth={2.5} />)}
            </g>
            {i === 1 && <Label x={tipX - 4} y={tipY + 70} text="MIC" size={34} op={win(t, B.mics + 0.1, B.l4 - 0.4, 0.3) * mu} />}
          </g>
        );
      })}
      {/* traces from the mics run in along the cup wall and merge into the belt */}
      {MICS.map((m, i) => {
        const g = pr(t, L4.catch[i], L4.catch[i] + 0.8) * (1 - pr(t, B.l5 - 0.2, B.l5 + 0.3));
        if (g <= 0) return null;
        const n = 24; let d = '';
        for (let j = 0; j <= n * g; j++) {
          const u = j / n;
          const x = lerp(m.x + 10, BELT_IN0, u), y = lerp(m.y, CHIP.y, u * u * (3 - 2 * u));
          d += (j ? 'L' : 'M') + x.toFixed(1) + ' ' + (y + Math.sin(u * 30 - t * 12) * 7).toFixed(1);
        }
        return <path key={i} d={d} stroke={NOISE} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.95} />;
      })}
      {/* belts */}
      <g opacity={pr(t, L4.catch[1], L4.catch[1] + 0.6)}>
        {[[BELT_IN0, BELT_IN1], [BELT_OUT0, BELT_OUT1]].map(([a, b], i) => (
          <g key={i}>
            <rect x={a - 10} y={CHIP.y + 12} width={b - a + 20} height={18} rx={9} fill="#454C60" />
            {Array.from({length: 9}, (_, j) => {
              const x = a + (((j * (b - a)) / 9 + t * 180) % (b - a));
              return <rect key={j} x={x} y={CHIP.y + 16} width={6} height={10} fill="#6B7390" />;
            })}
          </g>
        ))}
      </g>
      {/* belt items: slices flip over the chip and turn cobalt; notes hop over the spatula */}
      {BELT.items.map((it, i) => {
        if (t < it.spawn || t > it.drop + 0.4) return null;
        let x: number, y: number, rot = 0, col = NOISE, op = 1;
        if (t < it.flip) { const u = (t - it.spawn) / BELT.IN; x = lerp(BELT_IN0, BELT_IN1, u); y = CHIP.y - 2; }
        else if (t < it.land) {
          const u = (t - it.flip) / BELT.ARC;
          x = lerp(BELT_IN1, BELT_OUT0, u); y = CHIP.y - 2 - Math.sin(Math.PI * u) * (it.spared ? 150 : 175);
          rot = it.spared ? 0 : 180 * u; col = it.spared ? MUSIC : mixC(NOISE, COPY, u);
        } else {
          const u = (t - it.land) / BELT.OUT; x = lerp(BELT_OUT0, BELT_OUT1, Math.min(1, u)); y = CHIP.y - 2;
          rot = it.spared ? 0 : 180; col = it.spared ? MUSIC : COPY;
          if (u > 1) { const v = (t - it.drop) / 0.4; x = BELT_OUT1 + v * 40; y = CHIP.y - 2 + v * 20; op = 1 - v; }
        }
        if (it.kind === 'note') return <Note key={i} x={x} y={y - 30} s={0.9} op={op} glow={it.spared && t > it.flip - 0.1 ? 1 : 0} />;
        return <Slice key={i} x={x} y={rot === 180 ? y - 26 : y} rot={rot} color={col} op={op} />;
      })}
      {/* music box: the chip cranks it, its drum turns and pops out notes */}
      <g opacity={0.35 + 0.65 * boxOn}>
        <rect x={BOX.x - 75} y={BOX.y - 45} width={150} height={90} rx={12} fill="#8A5A36" stroke="#5B3820" strokeWidth={4} />
        <rect x={BOX.x - 58} y={BOX.y - 32} width={116} height={46} rx={10} fill="#2A1C14" />
        {Array.from({length: 7}, (_, j) => {
          const ph = (crank * 0.6 + j * 0.9) % (Math.PI * 2);
          const lightUp = lit >= 0 && j === 3 ? glance : 0;
          return <circle key={j} cx={BOX.x - 48 + j * 16} cy={BOX.y - 9 + Math.sin(ph) * 9} r={4 + lightUp * 4} fill={lightUp > 0.1 ? MUSIC : '#D7B37A'} opacity={0.4 + 0.6 * Math.max(0, Math.cos(ph)) + lightUp} />;
        })}
        <text x={BOX.x} y={BOX.y - 56} textAnchor="middle" fontFamily="'Hanken Grotesk'" fontWeight={800} fontSize={30} fill={MUSIC} stroke="rgba(10,12,20,0.85)" strokeWidth={6} paintOrder="stroke" letterSpacing={2}>MUSIC</text>
        <g transform={`translate(${BOX.x - 75} ${BOX.y}) rotate(${(crank * 180) / Math.PI})`}>
          <line x1={0} y1={0} x2={0} y2={-30} stroke="#C9A05A" strokeWidth={7} strokeLinecap="round" /><circle cy={-30} r={8} fill="#E8C27A" />
        </g>
      </g>
      {/* notes from the box hop to the speaker (line 6) */}
      {NOTES.map((n, i) => {
        if (t < n.spawn || t > n.cone + 1.3) return null;
        let x, y;
        if (t < n.cone) { const u = (t - n.spawn) / (n.cone - n.spawn); x = lerp(BOX.x + 20, SPK.x + 20, u); y = lerp(BOX.y - 50, SPK.y - 90, u) - Math.sin(Math.PI * u) * 120; }
        else { const u = (t - n.cone) / 1.3; x = lerp(SPK.x + 20, DRUM.x - 40, u); y = SPK.y - 90 + Math.abs(Math.sin(u * Math.PI * 2.5)) * -60 + (i % 3) * 30; }
        return <Note key={i} x={x} y={y} op={Math.min(1, (t - n.spawn) / 0.15) * (1 - pr(t, n.cone + 1.0, n.cone + 1.3))} rot={Math.sin(t * 6 + i) * 12} />;
      })}
      {/* speaker cone, pumping */}
      <g>
        <path d={`M${SPK.x - 40} ${SPK.y - 35} L${SPK.x - 40} ${SPK.y + 35} L${SPK.x + 30} ${SPK.y + 105} L${SPK.x + 30} ${SPK.y - 105} Z`} fill="#3D4356" stroke="#7D8396" strokeWidth={4} />
        <ellipse cx={SPK.x + 30 + pump} cy={SPK.y} rx={18} ry={104} fill="#5A6178" stroke="#9AA0B2" strokeWidth={4} />
        <circle cx={SPK.x + 36 + pump * 1.2} cy={SPK.y} r={16} fill="#2A2E3A" />
        <Label x={SPK.x} y={SPK.y + 160} text="SPEAKER" size={30} op={win(t, B.speaker6, B.l6 - 0.1, 0.3) + win(t, B.more + 0.1, B.l2 - 0.4, 0.3)} />
      </g>
      {/* line 2: the speaker makes MORE sound: rings pour out of it */}
      {(() => { const on = win(t, B.more - 0.1, B.upside + 0.1, 0.3); if (on <= 0) return null; return (<g opacity={on}>
        {[0, 1, 2, 3].map((i) => { const k = ((t * 1.6 + i / 4) % 1); return <path key={i} d={`M${SPK.x + 60 + k * 200} ${SPK.y - 90 - k * 60} Q${SPK.x + 110 + k * 260} ${SPK.y} ${SPK.x + 60 + k * 200} ${SPK.y + 90 + k * 60}`} stroke={COPY} strokeWidth={8} fill="none" opacity={1 - k} />; })}
        <Label x={SPK.x - 40} y={SPK.y - 190} text="MORE SOUND" size={40} color={COPY} /></g>); })()}
      {/* the chip: pin legs tap, chef hat, eyes, spatula arm, the other arm on the music box crank */}
      <g opacity={0.45 + 0.55 * chipOn}>
        {chipOn > 0 && <circle cx={CHIP.x} cy={CHIP.y - 20} r={95} fill={NOISE} opacity={0.07 * chipOn} />}
        {[-36, -12, 12, 36].map((d, j) => (
          <g key={j}>
            <rect x={CHIP.x + d - 5} y={CHIP.y + 8 + Math.max(0, Math.sin(t * 16 + j * 1.6)) * 5 * chipOn} width={10} height={18} fill="#C9A05A" />
            <rect x={CHIP.x - 72} y={CHIP.y - 52 + j * 24 - 5 + 20} width={18} height={10} fill="#C9A05A" />
          </g>
        ))}
        <rect x={CHIP.x - 55} y={CHIP.y - 100} width={110} height={110} rx={12} fill="#14161C" stroke="#3E4352" strokeWidth={4} />
        <text x={CHIP.x} y={CHIP.y - 18} textAnchor="middle" fontFamily="'Hanken Grotesk'" fontWeight={800} fontSize={28} fill="#E8E2D6" letterSpacing={2}>CHIP</text>
        {[-1, 1].map((s) => <g key={s}><ellipse cx={CHIP.x + s * 20} cy={CHIP.y - 66} rx={10} ry={11 * (chipOn > 0.5 ? 1 : 0.25)} fill="#FFF" /><circle cx={CHIP.x + s * 20 + (glance > 0 ? 0 : 3)} cy={CHIP.y - 66 - glance * 6 + (frantic > 0 ? Math.sin(t * 30) * 3 : 0)} r={5} fill="#111" /></g>)}
        {/* chef hat */}
        <g transform={`translate(${CHIP.x} ${CHIP.y - 100}) rotate(${Math.sin(t * 3) * 3 + frantic * Math.sin(t * 25) * 8})`}>
          <rect x={-34} y={-26} width={68} height={26} fill="#F4F1EA" /><circle cx={-24} cy={-36} r={20} fill="#F4F1EA" /><circle cx={0} cy={-46} r={24} fill="#F4F1EA" /><circle cx={24} cy={-36} r={20} fill="#F4F1EA" />
        </g>
        {/* crank arm (line 6 on) */}
        {boxOn > 0 && <path d={`M${CHIP.x - 55} ${CHIP.y - 80} Q${CHIP.x - 110} ${CHIP.y - 140} ${BOX.x - 75 + Math.sin(crank) * 30} ${BOX.y - Math.cos(crank) * 30}`} stroke="#14161C" strokeWidth={9} fill="none" strokeLinecap="round" opacity={boxOn} />}
        {/* spatula arm */}
        <g transform={`translate(${CHIP.x + 55} ${CHIP.y - 40}) rotate(${spat})`}>
          <line x1={0} y1={0} x2={70} y2={0} stroke="#14161C" strokeWidth={9} strokeLinecap="round" />
          <rect x={66} y={-14} width={44} height={28} rx={6} fill="#B8BDC9" stroke="#5D6170" strokeWidth={3} />
        </g>
      </g>
      {lit >= 0 && glance > 0.05 && <g opacity={Math.min(1, glance * 2)}>
        <path d={`M${BOX.x} ${BOX.y + 50} Q${BOX.x + 120} ${BOX.y + 120} ${BELT_OUT0 - 30} ${CHIP.y - 170}`} stroke={MUSIC} strokeWidth={5} strokeDasharray="10 10" fill="none" />
        <Label x={CHIP.x + 150} y={CHIP.y - 230} text="MINE!" size={46} color={MUSIC} />
      </g>}
      <Label x={CHIP.x} y={CHIP.y + 90} text="flips it" size={26} color={COPY} op={win(t, B.flipped5, B.where - 0.2, 0.3)} />
      {/* line 5 inset: the noise and its copy over strips of air, breathing in opposite rhythm */}
      {inset > 0.01 && (
        <g opacity={inset} transform={`translate(0 ${(1 - inset) * 60})`}>
          <rect x={95} y={600} width={570} height={330} rx={26} fill="#10141F" opacity={0.82} stroke="#3B4767" strokeWidth={3} />
          {[0, 1].map((row) => {
            const sign = row === 0 ? 1 : -1, y0 = 655 + row * 150, k = (2 * Math.PI) / 180, w = 4.2;
            let d = '';
            for (let x = 120; x <= 640; x += 6) d += (x === 120 ? 'M' : 'L') + x + ' ' + (y0 - sign * 22 * Math.cos(k * x - w * t)).toFixed(1);
            return (
              <g key={row}>
                <path d={d} stroke={row ? COPY : NOISE} strokeWidth={7} fill="none" strokeLinecap="round" />
                <BallStrip x0={120} x1={640} y={y0 + 62} t={t} amp={20} sign={sign} k={k} w={w} seed={row * 50} r={6} />
              </g>
            );
          })}
          {/* PUSH / PULL ride on the bands: where the noise crowds its air, the copy spreads its own */}
          {(() => {
            const k = (2 * Math.PI) / 180, w = 4.2; const xc = (((w * t) / k) % 180) + 120 + 180;
            const px = xc > 640 ? xc - 360 : xc > 460 ? xc - 180 : xc;
            return <g><Label x={px} y={745} text="PUSH" size={28} color="#FFD2AE" /><Label x={px} y={895} text="PULL" size={28} color="#BFD6FF" /></g>;
          })()}
        </g>
      )}
      {/* L2: noise leaking in; the speaker fires twins that backflip and land eye to eye */}
      {L2.n.map((n, i) => {
        const tw = L2.twin[i];
        const nx = lerp(40, 300, pr(t, n.t0, n.t1, (x: number) => 1 - Math.pow(1 - x, 2)));
        const vis = pr(t, n.t0 - 0.2, n.t0 + 0.1) * (1 - pr(t, L3.dive0 - 0.2, L3.dive0 + 0.3));
        const u = pr(t, tw.launch, tw.land, (x: number) => x);
        const tx = lerp(SPK.x + 40, 450, u), ty = lerp(SPK.y + 60, n.y, u) - Math.sin(Math.PI * u) * 140;
        const tvis = (t > tw.launch ? 1 : 0) * vis;
        return (
          <g key={i}>
            <Squiggle t={t} x={nx} y={n.y} color={NOISE} op={vis} seed={i + 4} label={i === 0 ? 'NOISE' : undefined} labelOp={win(t, n.t0, B.l2 - 0.3, 0.3)} />
            <Squiggle t={t} x={tx} y={ty} color={COPY} op={tvis} flip={u} seed={i + 9} squint={0.3} label={i === 0 ? 'COPY' : undefined} labelOp={u >= 1 ? win(t, tw.land, L3.dive0, 0.3) : 0} />
          </g>
        );
      })}
    </g>
  );
};
import {L3} from './events';

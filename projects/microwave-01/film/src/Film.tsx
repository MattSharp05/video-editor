// Microwave 01: one shot. Camera lives in S1 (oven space); S0 (kitchen + microwave front) wraps S1 through the door
// window; S3 (door mesh), S2 (molecules, through the water bead) and S4 (floor from above, by a crane) are entered by
// a named carrier each (PLAN.md thread table). Every time comes from beats.json.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {C, clamp01, mix, ramp, sm} from './art';
import {S0} from './s0';
import {OvenRoom, Magnetron, Spud, Chef, Front, Lbl, bounce, SP, BEAD, MAG} from './s1';
import {S2, S3, S4} from './s2';
import {Molecule} from './art';
import words from './words.json';
import B from './beats.json';

export const FPS = 30;
export const DUR = Math.ceil(B.total * FPS);

const LINES = [
  'Lots of people think a [microwave]', 'cooks food from the [inside] [out.]',
  'But actually, it heats the [outer] [layer.]', 'Then the heat [creeps] [inward.]',
  'Inside the oven, a part called a [magnetron]', 'makes [invisible] [waves.]',
  'The waves [bounce] around the [metal] [box.]', "The door's [tiny] [holes] keep them in.",
  'Each wave [swings] back and forth', '[billions] of times every second.',
  'Your food has [water] in it,', 'made of tiny [molecules.]', 'Each one has a [plus] side and a [minus] side.',
  'The swinging wave [tugs] them one way,', 'then the [other.]', 'So they [wiggle] and [bump] into their neighbors.',
  'All that bumping makes [heat.]',
  'The waves only reach a [little] [way] in,', 'so in [thick] food,', 'the [middle] has to [wait.]',
  'Some spots get [more] [waves] than others.', "That's why your plate [spins.]",
  'So [waves] wiggle the [water,]', 'the bumping makes [heat,]', 'and your leftovers get [hot.]',
];

// ---------- camera (S1 coords): [time, x, y, zoom] ----------
const OUT = {x: 234, y: 40, z: 0.46};
const KEYS: [number, number, number, number][] = [
  [0, OUT.x, OUT.y, OUT.z], [1.7, 0, 130, 1.12], [B.actually, 0, 140, 1.22], [B.l2 - 0.1, 0, 120, 1.02],
  [B.magnetron, 880, -160, 1.3], [B.invisible + 0.9, 840, -190, 1.42], [B.bounce + 0.3, 0, -40, 0.84], [B.door + 0.4, -20, -40, 0.9],
  [B.water - 0.55, BEAD.x, BEAD.y, 5], [B.molecules + 0.1, BEAD.x, BEAD.y, 60], [B.reach - 0.9, BEAD.x, BEAD.y, 60],
  [B.reach + 0.25, 0, 140, 1.1], [B.wait + 0.2, 0, 150, 1.22], [B.spots + 0.2, 0, 160, 1.3],
  [B.r_waves - 0.3, 0, 40, 0.92], [B.r_heat + 0.2, 0, 60, 0.86], [B.leftovers + 0.9, OUT.x, OUT.y, OUT.z], [B.total, OUT.x, OUT.y, OUT.z * 0.96],
];
const cam = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const [ta, xa, ya, za] = KEYS[i], [tb, xb, yb, zb] = KEYS[i + 1];
  const k = sm((t - ta) / (tb - ta));
  const lz = mix(Math.log(za), Math.log(zb), k), z = Math.exp(lz);
  // position follows zoom in log space on big zooms so the target stays put while diving
  const kp = Math.abs(Math.log(zb / za)) > 1.2 ? (Math.exp(lz) - za) / (zb - za) : k;
  // handheld drift so the camera never parks
  const dr = 1 / Math.max(1, z);
  return {x: mix(xa, xb, kp) + Math.sin(t * 0.53) * 14 * dr, y: mix(ya, yb, kp) + Math.cos(t * 0.41) * 12 * dr, z, r: Math.sin(t * 0.3) * 0.6};
};

// Spud's layer temperatures: outer layer first (line 2), heat creeps in; the middle waits (line 9)
const bandsAt = (t: number) => [0, 1, 2, 3, 4, 5].map((i) => {
  let v = 0.22;
  if (i === 0) v = Math.max(v, mix(0.22, 1, ramp(t, B.outer - 0.1, B.outer + 0.6)));
  if (i >= 1 && i <= 3) v = Math.max(v, mix(0.22, 0.95 - i * 0.12, ramp(t, B.creeps + (i - 1) * 0.45, B.creeps + (i - 1) * 0.45 + 0.7)));
  if (i === 4) v = Math.max(v, mix(0.22, 0.62, ramp(t, B.middle + 0.2, B.wait + 0.6)));
  if (i === 5) v = Math.max(v, mix(0.22, 0.6, ramp(t, B.wait + 0.5, B.wait + 1.3)));
  if (t > B.r_waves - 1) v = Math.max(v, 0.9);
  return v;
});

const Stamp: React.FC<{t: number}> = ({t}) => {
  const a = ramp(t, B.myth - 0.05, B.myth + 0.12), flip = ramp(t, B.actually + 0.1, B.actually + 0.35), out = ramp(t, B.l2 - 0.4, B.l2);
  if (a < 0.01 || out > 0.99) return null;
  const sx = Math.abs(Math.cos(flip * Math.PI));
  const nope = flip > 0.5;
  const wob = nope ? 0 : Math.sin(t * 9) * 4;
  return (
    <g transform={`translate(${SP.x + 120},${SP.y - 30}) rotate(${-10 + wob}) scale(${mix(2.2, 1, sm(a)) * sx},${mix(2.2, 1, sm(a))})`} opacity={a * (1 - out)}>
      <rect x={-210} y={-70} width={420} height={140} rx={18} fill="none" stroke={nope ? '#D83A3A' : '#E8503A'} strokeWidth={14} />
      <text y={36} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={104} letterSpacing={6} fill={nope ? '#D83A3A' : '#E8503A'}>{nope ? 'NOPE' : 'MYTH?'}</text>
    </g>
  );
};

const S1: React.FC<{t: number; z: number}> = ({t, z}) => {
  const xray = ramp(t, B.l2 + 0.2, B.magnetron - 0.2) * (1 - ramp(t, B.door + 0.3, B.door + 0.8));
  const cut = ramp(t, 1.0, 1.7) * (1 - ramp(t, B.spots - 0.7, B.spots - 0.2));
  const bands = bandsAt(t);
  const myth = ramp(t, 1.3, 1.8) * (1 - ramp(t, B.actually, B.actually + 0.3));
  // fronts in the box (line 4): six from the waveguide mouth
  const u = t - (B.bounce - 0.55);
  const fronts = [[-900, 260], [-620, 520], [-760, -380], [-420, 700], [-980, 120], [-520, -600]];
  const fO = ramp(t, B.bounce - 0.55, B.bounce - 0.3) * (1 - ramp(t, B.door + 0.2, B.door + 0.6));
  const flash = [0, 0, 0, 0];
  if (fO > 0) fronts.forEach(([vx, vy], i) => {
    for (let k = 0; k < 8; k++) {
      const p = bounce(560, -275, vx, vy, u - k * 0.02);
      if (Math.abs(p.x + 560) < 12) flash[0] = Math.max(flash[0], 0.7 * (1 - k / 8)); if (Math.abs(p.x - 560) < 12) flash[1] = Math.max(flash[1], 0.7 * (1 - k / 8));
      if (Math.abs(p.y + 420) < 12) flash[2] = Math.max(flash[2], 0.6 * (1 - k / 8)); if (Math.abs(p.y - 420) < 12) flash[3] = Math.max(flash[3], 0.6 * (1 - k / 8));
    }
  });
  const chef = <Chef x={SP.x} y={SP.y + 70} s={0.95} t={t} torch={1 - ramp(t, B.actually, B.actually + 0.25)} sputter={ramp(t, B.actually, B.actually + 0.9)}
    cold={ramp(t, B.actually + 0.4, B.actually + 0.9)} sit={ramp(t, B.reach + 0.2, B.reach + 0.6)} warm={ramp(t, B.wait + 1.0, B.wait + 1.4)} />;
  const end = ramp(t, B.r_waves - 0.8, B.r_waves - 0.3);
  const mood = t < B.actually ? 'smug' : t < B.l2 ? 'sweat' : t < B.reach ? 'worried' : t < B.wait + 1.0 ? 'worried' : t < B.r_waves - 0.8 ? 'happy' : 'cool';
  const hot = ramp(t, B.hot - 0.1, B.hot + 0.3);
  return (
    <g>
      <OvenRoom t={t} xray={xray} flash={flash.map((f) => f * fO)} />
      <Magnetron t={t} on={1} xray={xray} />
      {/* magnetron rings: see-through (dashed) until "invisible", then they turn on as waves and flow down the channel */}
      {xray > 0.01 && Array.from({length: 5}, (_, i) => {
        const p = ((t - B.oven) * 0.9 + i / 5) % 1;
        if (t < B.oven) return null;
        const vis = ramp(t, B.invisible + 0.45, B.invisible + 0.8);
        return <circle key={i} cx={MAG.x - 78} cy={MAG.y - 186} r={20 + p * 260} fill="none" stroke={vis > 0.5 ? C.wave : '#E8FFFF'} strokeWidth={vis > 0.5 ? 10 : 5}
          strokeDasharray={vis > 0.5 ? undefined : '14 18'} opacity={xray * (1 - p) * mix(0.45, 0.9, vis)} />;
      })}
      {xray > 0.01 && t > B.invisible + 0.5 && Array.from({length: 4}, (_, i) => {
        const p = ((t - B.invisible) * 1.2 + i / 4) % 1;
        return <Front key={i} x={mix(MAG.x - 140, 560, p)} y={-275} ang={Math.PI} len={90} amp={14} ph={t * 10} w={8} o={xray * ramp(t, B.invisible + 0.5, B.invisible + 0.9) * (1 - ramp(t, B.door, B.door + 0.4))} />;
      })}
      <Spud t={t} cut={t > B.r_waves - 1 ? 0 : cut} bands={bands} mood={mood} steam={t > B.r_waves - 1 ? 1 : 0.6} shades={hot}>
        {/* the myth: heat rings pulsing out from the chef's torch */}
        {myth > 0.01 && Array.from({length: 4}, (_, i) => { const p = (t * 0.8 + i / 4) % 1; return <ellipse key={i} cx={SP.x} cy={SP.y} rx={40 + p * 300} ry={26 + p * 190} fill="none" stroke={C.heat} strokeWidth={14} opacity={myth * (1 - p)} />; })}
        {chef}
        {/* line 9: waves dive in and fade a short way in */}
        {(() => {
          const o = ramp(t, B.reach - 0.3, B.reach + 0.2) * (1 - ramp(t, B.spots - 0.8, B.spots - 0.4));
          if (o < 0.01) return null;
          return <g>
            {Array.from({length: 10}, (_, i) => {
              const a = (i / 10) * Math.PI * 2 + 0.3, p = (t * 0.9 + i * 0.37) % 1, rr = mix(1.25, 0.76, p);
              return <Front key={i} x={SP.x + Math.cos(a) * SP.rx * rr} y={SP.y + Math.sin(a) * SP.ry * rr} ang={a + Math.PI} len={90} amp={12} ph={t * 9 + i} w={9} o={o * (p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4)} />;
            })}
            <ellipse cx={SP.x} cy={SP.y} rx={SP.rx * 0.76} ry={SP.ry * 0.76} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="20 16" opacity={o * ramp(t, B.reach + 0.4, B.reach + 0.8)} />
          </g>;
        })()}
      </Spud>
      {/* line 2 + 9 labels on Spud */}
      <Lbl x={SP.x + 300} y={SP.y - SP.ry - 40} text="OUTER LAYER" o={ramp(t, B.outer, B.outer + 0.3) * (1 - ramp(t, B.l2 - 0.4, B.l2))} z={z} size={52} color={C.heat} />
      <Lbl x={SP.x - 210} y={SP.y + 20} text="HEAT" o={ramp(t, B.creeps, B.creeps + 0.3) * (1 - ramp(t, B.l2 - 0.4, B.l2))} z={z} size={44} color="#FFE0B0" rot={-12} />
      <Lbl x={SP.x} y={SP.y - 150} text="INSIDE OUT?" o={myth * ramp(t, B.myth - 0.4, B.myth)} z={z} size={42} color="#FFE0B0" />
      <Lbl x={SP.x} y={SP.y - SP.ry * 0.76 - 30} text="WAVES STOP HERE" o={ramp(t, B.reach + 0.5, B.reach + 0.8) * (1 - ramp(t, B.spots - 0.8, B.spots - 0.4))} z={z} size={40} color={C.wave} />
      <Lbl x={SP.x + 190} y={SP.y + 60} text="MIDDLE" o={ramp(t, B.middle, B.middle + 0.3) * (1 - ramp(t, B.spots - 0.8, B.spots - 0.4))} z={z} size={48} color={C.cold} />
      <Lbl x={SP.x - 290} y={SP.y - SP.ry - 50} text="THICK FOOD" o={ramp(t, B.thick, B.thick + 0.3) * (1 - ramp(t, B.spots - 0.8, B.spots - 0.4))} z={z} size={48} />
      {/* chef's thought bubble while he waits */}
      {(() => { const o = ramp(t, B.middle, B.middle + 0.3) * (1 - ramp(t, B.wait + 0.9, B.wait + 1.2)); return o > 0.01 && <g opacity={o}>
        <ellipse cx={SP.x + 60} cy={SP.y - 140} rx={70} ry={44} fill="#fff" /><circle cx={SP.x + 30} cy={SP.y - 84} r={10} fill="#fff" />
        <text x={SP.x + 60} y={SP.y - 128} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={60} fill={C.ink}>{'.'.repeat(1 + Math.floor((t * 3) % 3))}</text></g>; })()}
      <Stamp t={t} />
      <Lbl x={MAG.x} y={MAG.y + 210} text="MAGNETRON" o={ramp(t, B.magnetron, B.magnetron + 0.3) * xray} z={z} size={56} color={C.gold} />
      <Lbl x={MAG.x - 150} y={MAG.y - 330} text="INVISIBLE" o={ramp(t, B.invisible - 0.1, B.invisible + 0.2) * (1 - ramp(t, B.invisible + 0.5, B.invisible + 0.7))} z={z} size={50} color="#E8FFFF" />
      <Lbl x={MAG.x - 150} y={MAG.y - 330} text="WAVES" o={ramp(t, B.invisible + 0.55, B.invisible + 0.8) * (1 - ramp(t, B.bounce + 0.4, B.bounce + 0.8))} z={z} size={56} color={C.wave} />
      <Lbl x={-470} y={-330} text="METAL" o={ramp(t, B.metal, B.metal + 0.3) * (1 - ramp(t, B.door, B.door + 0.3))} z={z} size={56} rot={-90} />
      {/* bouncing fronts with their trails */}
      {fO > 0.01 && fronts.map(([vx, vy], i) => {
        const pts = Array.from({length: 14}, (_, k) => bounce(560, -275, vx, vy, Math.max(0, u - k * 0.06)));
        const p = pts[0];
        const lead = i === 0 ? ramp(t, B.door - 0.35, B.door + 0.25) : 0;
        return <g key={i}>
          <polyline points={pts.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke={C.wave} strokeWidth={6} opacity={fO * 0.35} strokeLinejoin="round" />
          <Front x={p.x} y={p.y} ang={p.ang} len={150 * (1 + lead * 6)} amp={22 * (1 + lead * 6)} ph={t * 10 + i} w={10 * (1 + lead * 3)} o={fO * (1 - lead * 0.6)} />
        </g>;
      })}
      {/* line 11: waves, wiggle, heat, hot, all on the uncut, steaming Spud */}
      {end > 0.01 && (() => {
        const wv = ramp(t, B.r_waves - 0.1, B.r_waves + 0.2), wx = mix(-650, 650, clamp01((t - B.r_waves + 0.2) / 1.6));
        const wg = ramp(t, B.r_wiggle, B.r_wiggle + 0.3) * (1 - ramp(t, B.leftovers + 0.4, B.leftovers + 0.8));
        const ht = ramp(t, B.r_heat - 0.1, B.r_heat + 0.2);
        return <g>
          {wv > 0.01 && <Front x={wx} y={-300} ang={0} len={200} amp={26} ph={t * 12} o={wv * (1 - ramp(t, B.r_wiggle + 0.6, B.r_wiggle + 1))} />}
          <Lbl x={wx} y={-420} text="WAVES" o={wv * (1 - ramp(t, B.r_wiggle + 0.6, B.r_wiggle + 1))} z={z} size={50} color={C.wave} />
          {wg > 0.01 && <g opacity={wg}>
            <circle cx={240} cy={-200} r={95 * sm(wg * 1.5)} fill="#CFF6FF" opacity={0.35} stroke="#fff" strokeWidth={5} />
            <Molecule x={240} y={-200} r={34 * sm(wg * 1.5)} ang={Math.sin(t * 9) * 50} t={t} heat={0.7} mood={0.6} />
          </g>}
          <Lbl x={240} y={-340} text="WIGGLE" o={wg} z={z} size={46} color={C.wave} rot={Math.sin(t * 12) * 6} />
          {ht > 0.01 && <g transform={`translate(-260,-220) scale(${0.8 + 0.4 * Math.sin(clamp01(ht) * Math.PI)}) rotate(${t * 40})`} opacity={ht * (1 - ramp(t, B.leftovers + 0.4, B.leftovers + 0.8))}>
            <path d="M0 -50 L14 -15 L50 -12 L21 10 L31 47 L0 26 L-31 47 L-21 10 L-50 -12 L-14 -15 Z" fill={C.heat} stroke="#fff" strokeWidth={5} /></g>}
          <Lbl x={-260} y={-330} text="HEAT" o={ht * (1 - ramp(t, B.leftovers + 0.4, B.leftovers + 0.8))} z={z} size={50} color={C.heat} />
          {/* chef climbs out of a hatch on Spud's top, warm, waving */}
          {(() => { const c = ramp(t, B.hot, B.hot + 0.5); return c > 0.01 && <g>
            <ellipse cx={SP.x - 170} cy={SP.y - SP.ry + 30} rx={60} ry={16} fill="#5A3A20" />
            <Chef x={SP.x - 170} y={SP.y - SP.ry + 30 + (1 - sm(c)) * 120} s={1.3} t={t} torch={0} sputter={0} cold={0} sit={0} warm={1} wave={1} /></g>; })()}
          <Lbl x={SP.x + 120} y={SP.y + 40} text="HOT" o={hot} z={z} size={96} color={C.hot} />
        </g>;
      })()}
    </g>
  );
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const t = useCurrentFrame() / FPS;
  const c = cam(t);
  const s0op = 1 - sm((c.z - 0.62) / (0.95 - 0.62));
  const s3op = ramp(t, B.door - 0.2, B.door + 0.35) * (1 - ramp(t, B.water - 0.7, B.water - 0.35));
  const crane = ramp(t, B.spots - 0.75, B.spots + 0.05) * (1 - ramp(t, B.r_waves - 0.75, B.r_waves - 0.1));
  const beadR = BEAD.r * c.z;                    // the bead on screen (the camera dives into it)
  const inS2 = t > B.water && t < B.reach + 0.5 && beadR > 60;
  const s2full = beadR > 1150;
  const s2scale = mix(0.35, 1, clamp01((Math.log(c.z) - Math.log(5)) / (Math.log(60) - Math.log(5))));
  const open = ramp(t, B.hot - 0.1, B.hot + 0.35);
  const disp = t < B.leftovers ? `0:${String(Math.max(1, Math.floor(45 - t * 0.8))).padStart(2, '0')}` : '0:00';
  const world = `translate(540,960) scale(${c.z}) rotate(${c.r}) translate(${-c.x},${-c.y})`;
  const honest = t > 1.2 && t < B.l2 ? 'CUTAWAY · ILLUSTRATION' : t > B.reach && t < B.spots - 0.5 ? 'CUTAWAY · ILLUSTRATION' : '';
  return (
    <AbsoluteFill style={{background: C.wallB}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {!s2full && crane < 0.999 && s3op < 0.999 && (
          <g transform={`translate(540,960) scale(1,${1 - 0.55 * crane}) translate(-540,-960)`} opacity={1 - crane}>
            <g transform={world}>
              <S1 t={t} z={c.z} />
              <S0 t={t} op={s0op} open={open} on={1} label={1 - ramp(t, 1.2, 1.6) + ramp(t, B.leftovers + 0.6, B.leftovers + 1)} time={disp} />
              {open > 0.05 && <Lbl x={844} y={-470} text="DING!" o={open} z={c.z} size={64} color={C.gold} />}
            </g>
          </g>
        )}
        {inS2 && (
          <g>
            <defs><clipPath id="beadClip"><circle cx={540} cy={960} r={beadR} /></clipPath></defs>
            <g clipPath="url(#beadClip)"><S2 t={t} scale={s2scale} /></g>
            {!s2full && <circle cx={540} cy={960} r={beadR} fill="none" stroke="#E8FFFF" strokeWidth={10} opacity={0.8} />}
          </g>
        )}
        <S3 t={t} op={s3op} />
        {crane > 0.001 && <g transform={`translate(540,960) scale(1,${0.45 + 0.55 * crane}) translate(-540,-960)`}><S4 t={t} op={crane} /></g>}
        {/* the water label + ribbon landing on the bead */}
        {t > B.water - 0.5 && t < B.molecules && (() => {
          const o = ramp(t, B.water - 0.35, B.water) * (1 - ramp(t, B.molecules - 0.4, B.molecules));
          return <g opacity={o}><text x={540} y={960 + beadR + 90} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={64} letterSpacing={3} fill="#CFF6FF"
            stroke="#2A1828" strokeWidth={12} style={{paintOrder: 'stroke'}}>WATER</text></g>;
        })()}
      </svg>
      {honest && <div style={{position: 'absolute', left: 0, right: 0, top: 1452, textAlign: 'center', fontFamily: SANS, fontSize: 26, fontWeight: 700, letterSpacing: 2,
        color: '#fff', opacity: 0.75, textShadow: '0 1px 10px rgba(0,0,0,0.8)'}}>{honest}</div>}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 62% at 50% 50%, rgba(0,0,0,0) 60%, rgba(40,20,30,0.35) 100%)'}} />
      {captions && <Captions t={t} words={words} lines={LINES} accent={C.heat} font={SANS} scrim="40,22,34" />}
    </AbsoluteFill>
  );
};

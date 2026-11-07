// Part 2 stages 6–11: pinboard / cell / interrogation, thumbprint → files, the little room, the sky "?",
// years at the window and the web, the Missing poster, the flight to Florence, the letter signed "Leonardo".
import React from 'react';
import {staticFile} from 'remotion';
import B from './beats.json';
import {C, Cut, Person, Mona, MonaEyes, Hooks, QMark, Label, Calendar, Magnifier, Stamp, Print, NameTag, rect, ell, ramp, lin, osc, mix, settle, step2, SHADOW, TYPE, SERIF} from './look';
import {camAt, Plane, SalonWall, Crowd, Ground, Lamp, Rooftops} from './world';

const CORK = '#B98A5A';
// ------------------------------------------------------------------ 6. pinboard → poet's cell → Picasso → "Not him"
const Photo: React.FC<{x: number; y: number; who: 'poet' | 'picasso' | 'print'; rot?: number; t: number}> = ({x, y, who, rot = 0, t}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <Cut d={rect(-95, -120, 190, 240, 3)} fill={C.card} sw={2.5} />
    <rect x={-80} y={-105} width={160} height={175} fill={who === 'print' ? C.glass : C.stone} stroke={C.ink} strokeWidth={2} />
    {who === 'poet' && <g transform="translate(0,90) scale(0.32)"><Person x={0} y={0} coat={C.ink} hat="none" wide={1.35} skin={C.skin[1]} collar /></g>}
    {who === 'picasso' && <g transform="translate(0,90) scale(0.32)"><Person x={0} y={0} coat="#3E3A36" hat="none" skin={C.skin[2]} tall={0.95} /></g>}
    {who === 'print' && <Print x={0} y={-18} s={0.95} />}
    <text x={0} y={102} textAnchor="middle" fontFamily={TYPE} fontSize={24} fill={C.ink}>{who === 'poet' ? 'Poet' : who === 'picasso' ? 'Painter' : 'Thumbprint'}</text>
    <circle cx={0} cy={-112} r={9} fill={C.clueRed} stroke={C.ink} strokeWidth={2} />
  </g>
);
const PicassoFace: React.FC<{k: number}> = ({k}) => (
  // cubist shuffle: eyes and nose slide apart (k 0..1) and snap back
  <g>
    <path d="M-56,-46 Q-54,-108 0,-106 Q56,-104 56,-50 Q30,-70 -10,-74 Q-40,-76 -56,-46 Z" fill={C.ink} />
    <circle cx={-20 - k * 14} cy={-38 - k * 26} r={8} fill={C.ink} /><circle cx={22 + k * 20} cy={-38 + k * 22} r={8} fill={C.ink} />
    <path d={`M${0 + k * 30},${-28 - k * 10} l${-8 - k * 6},${22} l10,0`} fill="none" stroke={C.ink} strokeWidth={3} />
    <path d={`M${-12 - k * 20},${10 + k * 6} q14,${8 - k * 18} 26,0`} fill="none" stroke={C.ink} strokeWidth={3.5} />
    {k > 0.2 && <path d="M-40,-60 L0,-10 L40,-50" fill="none" stroke={C.ink} strokeWidth={2} opacity={k} />}
    <g stroke={C.ink} strokeWidth={4}><line x1={-30} y1={-56 - k * 20} x2={-8} y2={-58 - k * 20} /><line x1={12} y1={-58 + k * 14} x2={32} y2={-54 + k * 14} /></g>
  </g>
);
export const S6: React.FC<{t: number}> = ({t}) => {
  const a = B.l7, p = B.l8, n = B.l9;
  // board (x 0..1080) | cell (1250..2050) | lamp table (-950..-150)
  const cam = camAt(t, [[a - 0.3, 300, 1000, 2.2], [a + 0.6, 540, 950, 1.0], [B.arrest + 0.2, 560, 940, 1.05], [B.poet + 0.4, 1550, 1000, 1.0], [B.days + 0.6, 1600, 980, 1.05],
    [p + 0.2, -480, 1000, 1.0], [n - 0.6, -500, 990, 1.08], [n + 0.4, 540, 1000, 0.62], [B.letgo + 0.4, 560, 1020, 0.66], [B.l10 - 0.9, 540, 1060, 0.9], [B.l10 - 0.2, 540, 1150, 2.2]]);
  const tt = step2(t);
  // the "?" hops: start (left), poet photo, Picasso photo, centre (shrug), then points at the print
  const hops: [number, number, number][] = [[a - 0.3, 100, 560], [B.arrest - 0.1, 300, 500], [p + 0.3, 780, 500], [n + 0.5, 540, 760], [B.l10 - 0.9, 540, 900]];
  let qi = 0; while (qi < hops.length - 1 && t > hops[qi + 1][0]) qi++;
  const [h0, x0, y0] = hops[qi], [h1, x1, y1] = hops[Math.min(qi + 1, hops.length - 1)];
  const hk = qi === hops.length - 1 ? 1 : ramp(t, h1 - 0.35, 0.35);
  const qx = mix(x0, x1, hk), qy = mix(y0, y1, hk) - Math.sin(hk * Math.PI) * 140;
  const shrug = osc(t, 1.2) * ramp(t, n + 0.6, 0.3) * (1 - ramp(t, B.l10 - 1.0, 0.3));
  // the poet: led along the corridor into the cell, door shuts, a few days tear, door opens, he walks out
  const walkIn = ramp(t, B.poet - 0.1, 1.6), shut = ramp(t, B.lock, 0.35) * (1 - ramp(t, B.letgo - 0.1, 0.4));
  const out = ramp(t, B.letgo, 1.6);
  const poetX = out > 0 ? mix(1650, 1100, out) : mix(1250, 1650, walkIn);
  const dayN = 1 + Math.floor(lin(t, B.days - 0.3, 1.2) * 2.99);
  // Picasso's nervous cubist face
  const cub = Math.max(0, Math.min(1, (osc(t, 0.5, 0.25) + 0.2) * 1.4)) * ramp(t, B.picasso + 0.4, 0.3) * (1 - ramp(t, n - 0.6, 0.2));
  const lampSw = osc(t, 0.45) * 18;
  const pcOut = ramp(t, B.letgo + 0.1, 1.6);
  const droop = ramp(t, B.letgo, 0.6);
  return (
    <>
      <Plane cam={cam} d={0.4}><rect x={-3000} y={-1500} width={7000} height={5000} fill={C.stone} />
        {[...Array(20)].map((_, i) => <rect key={i} x={-2500 + i * 300} y={300} width={260} height={130} fill={C.paperShade} opacity={0.25} />)}
      </Plane>
      <Plane cam={cam} d={1}>
        <Ground y={1420} color={C.paperShade} />
        {/* pinboard */}
        <Cut d={rect(-20, 330, 1120, 980, 6)} fill={C.sepia} />
        <rect x={10} y={360} width={1060} height={920} fill={CORK} stroke={C.ink} strokeWidth={3} />
        {[...Array(40)].map((_, i) => <circle key={i} cx={30 + ((i * 137) % 1020)} cy={380 + ((i * 251) % 880)} r={3} fill={C.sepia} opacity={0.5} />)}
        <path d={`M-200,520 Q100,${560 + droop * 120} 300,${430 + droop * 30} Q540,${520 + droop * 160} 780,${430 + droop * 30} Q700,${800 + droop * 100} 540,${1030}`} fill="none" stroke={C.clueRed} strokeWidth={6} />
        <Photo x={300} y={540} who="poet" rot={-4} t={t} />
        <Photo x={780} y={540} who="picasso" rot={3} t={t} />
        <Photo x={540} y={1100} who="print" rot={-2} t={t} />
        <Stamp x={300} y={560} text="Not him" k={lin(t, B.neither + 0.2, 0.12)} size={46} />
        <Stamp x={780} y={560} text="Not him" k={lin(t, B.neither + 0.75, 0.12)} size={46} rot={6} />
        {/* the cell: stone room, door of bars made of handwriting */}
        <Cut d={rect(1250, 560, 820, 860, 4)} fill={C.stone} />
        <rect x={1720} y={640} width={140} height={110} fill={C.duskBlue} stroke={C.ink} strokeWidth={4} />
        {[1750, 1790, 1830].map((x) => <line key={x} x1={x} y1={640} x2={x} y2={750} stroke={C.ink} strokeWidth={6} />)}
        <path d={`M1720,750 L${1560 + osc(t, 0.1) * 20},1420 L${1700 + osc(t, 0.1) * 20},1420 L1860,750 Z`} fill="#FFF1C8" opacity={0.35} />
        <Cut d={rect(1720, 1250, 300, 50, 4)} fill={C.sepia} sw={3} />
        <Person x={poetX} y={1420} s={0.6} coat={C.ink} hat="none" wide={1.35} skin={C.skin[1]} collar walk={walkIn > 0 && walkIn < 1 || (out > 0 && out < 1) ? tt * 1.5 : undefined}
          flip={out > 0} mouth={out > 0 ? 'smile' : 'flat'} brows={shut > 0.5 ? 'worried' : 'flat'} aR={t > B.lock + 0.3 && out === 0 ? [80, 60] : undefined}
          holdR={t > B.lock + 0.3 && out === 0 ? <Cut d={rect(-26, -20, 52, 36, 2)} fill={C.card} sw={2} rim={false} /> : undefined} />
        {walkIn > 0 && out === 0 && <Person x={poetX - 160} y={1420} s={0.64} coat={C.nightBlue} hat="kepi" tache walk={walkIn < 1 ? tt * 1.5 : undefined} aR={[70, 10]} />}
        {/* the door: lines of a poem as bars */}
        <g transform={`translate(1250,600) scale(${mix(0.08, 1, shut)},1)`}>
          {[...Array(7)].map((_, i) => <text key={i} transform={`translate(${40 + i * 62},10) rotate(90)`} fontFamily={TYPE} fontSize={34} fill={C.ink}>{['la nuit tombe', 'le ciel est', 'les mots', 'sous le pont', 'ma chanson', 'les jours', 'je demeure'][i]} — — —</text>)}
          <rect x={0} y={0} width={440} height={14} fill={C.ink} /><rect x={0} y={800} width={440} height={14} fill={C.ink} />
        </g>
        <Calendar x={2120} y={760} s={0.8} page={`Day ${dayN}`} prev={dayN > 1 ? `Day ${dayN - 1}` : undefined} k={lin(t, B.days - 0.3 + (dayN - 1) * 0.4, 0.4)} />
        {/* the interrogation: a lamp swings over the table */}
        <rect x={-1000} y={330} width={900} height={1090} fill={C.nightBlue} opacity={0.85} />
        <g transform={`translate(-550,330) rotate(${lampSw})`}>
          <line x1={0} y1={0} x2={0} y2={380} stroke={C.ink} strokeWidth={4} />
          <path d={`M0,400 L-300,1100 L300,1100 Z`} fill="#FFF1C8" opacity={0.28} />
          <Cut d="M-60,420 L60,420 L34,370 L-34,370 Z" fill={C.oldGold} sw={3} />
        </g>
        <Cut d={rect(-860, 1230, 640, 30, 4)} fill={C.sepia} sw={3} />
        <rect x={-830} y={1260} width={18} height={160} fill={C.ink} /><rect x={-270} y={1260} width={18} height={160} fill={C.ink} />
        <Person x={pcOut > 0 ? mix(-550, 120, pcOut) : -550} y={1420} s={0.58} coat="#3E3A36" hat="none" skin={C.skin[2]} tall={0.95}
          face={<PicassoFace k={cub} />} aR={[80, 20 + osc(tt, 1.4) * 15]} aL={[70, 30]} walk={pcOut > 0 && pcOut < 1 ? tt * 1.5 : undefined}
          holdR={<Cut d={rect(-30, -20, 60, 40, 2)} fill={C.card} sw={2} rim={false} />} />
        <Person x={-830} y={1420} s={0.64} coat={C.sepia} hat="bowler" tache brows="cross" aR={[100, 40]} look={1} bob={Math.max(0, osc(t, 0.7)) * 10} />
        <Person x={-250} y={1420} s={0.64} coat={C.nightBlue} hat="kepi" tache brows="cross" flip aR={[110, 30]} look={1} bob={Math.max(0, osc(t, 0.7, 0.5)) * 10} />
        {/* the hopping "?" */}
        <g transform={`translate(${qx},${qy}) rotate(${shrug * 14})`}><QMark x={0} y={0} s={0.9} /></g>
        {shrug !== 0 && <g opacity={ramp(t, n + 0.6, 0.3) * (1 - ramp(t, B.l10 - 1.0, 0.3))}>
          <path d={`M${qx - 70},${qy + 20 - Math.abs(shrug) * 20} l-30,-20 M${qx + 70},${qy + 20 - Math.abs(shrug) * 20} l30,-20`} stroke={C.ink} strokeWidth={6} strokeLinecap="round" /></g>}
      </Plane>
      <Plane cam={cam} d={1.3}>
        <NameTag x={1600} y={560} text="Guillaume Apollinaire, poet" k={lin(t, B.poet, 0.9) * (1 - ramp(t, B.l8 - 0.6, 0.4))} t={t} size={34} />
        <NameTag x={-500} y={560} text="Pablo Picasso, painter" k={lin(t, B.picasso, 0.9) * (1 - ramp(t, n - 0.3, 0.4))} t={t} size={34} />
      </Plane>
    </>
  );
};
export const S6_OUT = {x: 540, y: 1100, color: C.glass};

// ------------------------------------------------------------------ 7. the thumbprint on the glass → maze → drawers
const DRAWERS = ['Head: long', 'Arm: short', 'Ear: big', 'Foot: small', 'Finger: long', 'Head: wide', 'Arm: long', 'Ear: small', 'Nose: big', 'Foot: long', 'Height: short', 'Finger: short'];
export const S7: React.FC<{t: number}> = ({t}) => {
  const a = B.l10, f = B.l11;
  const dive = ramp(t, B.never - 0.4, 1.6); // into the print
  const tt = step2(t);
  const cam = camAt(t, [[a - 0.3, 540, 1000, 2.0], [a + 0.6, 540, 960, 1.0], [B.thumb + 0.4, 600, 1000, 1.25], [f - 0.4, 600, 1000, 1.3], [f + 0.6, 540, 1000, 1.0], [B.notfp, 540, 820, 1.05], [B.l12 - 0.9, 760, 760, 1.2], [B.l12 - 0.2, 780, 640, 2.4]]);
  const dust = lin(t, a + 0.3, 1.6);
  const printK = ramp(t, B.thumb - 0.1, 0.5);
  const inFiles = t > f - 0.2;
  // the print with eyes tries drawers
  const tries = [[B.files - 0.1, 0], [B.measure, 1], [B.measure + 0.9, 2], [B.notfp, 6]] as [number, number][];
  let ti = 0; while (ti < tries.length - 1 && t > tries[ti + 1][0]) ti++;
  const di = tries[ti][1], dk = ramp(t, tries[ti][0], 0.3);
  const dx = (i: number) => 140 + (i % 4) * 270, dy = (i: number) => 520 + Math.floor(i / 4) * 230;
  const pX = mix(dx(tries[Math.max(0, ti - 1)][1]), dx(di), dk), pY = mix(dy(tries[Math.max(0, ti - 1)][1]), dy(di), dk) + 120 - Math.sin(dk * Math.PI) * 80;
  const roomDrawer = ramp(t, B.l12 - 1.0, 0.6);
  if (!inFiles) {
    const z = 1 + dive * dive * 9;
    return (
      <>
        <Plane cam={cam} d={0.4}><rect x={-1500} y={-1500} width={4000} height={5000} fill={C.stone} /></Plane>
        <Plane cam={cam} d={1}>
          <g transform={`translate(640,1060) scale(${z}) translate(-640,-1060)`}>
            {/* the back staircase from part 1 */}
            {[...Array(8)].map((_, i) => <Cut key={i} d={rect(-300 + i * 150, 1500 - i * 110, 900, 120, 3)} fill={i % 2 ? C.stone : '#B4AB9B'} sw={3} rim={false} />)}
            <Lamp x={120} y={900} h={160} />
            {/* empty frame bars and the glass box on the steps */}
            <g transform="translate(250,1290) rotate(-18)"><Cut d={rect(-160, -14, 320, 28, 3)} fill={C.oldGold} sw={3} /></g>
            <g transform="translate(320,1330) rotate(-8)"><Cut d={rect(-140, -14, 280, 28, 3)} fill={C.oldGold} sw={3} /></g>
            <Cut d={rect(480, 870, 320, 400, 6)} fill={C.glass} sw={3} op={0.9} />
            <path d="M510,900 L560,900 M510,930 L530,930" stroke="#fff" strokeWidth={6} />
            {printK > 0 && <Print x={640} y={1060} s={0.9} op={printK} />}
            {/* powder cloud */}
            {[...Array(10)].map((_, i) => { const u = (dust * 3 + i * 0.1) % 1; return dust > 0 && dust < 1 ? <circle key={i} cx={640 + osc(i, 0.37) * 80 + u * 60} cy={1060 - u * 90 + osc(i, 0.21) * 40} r={10 + u * 30} fill="#EDE8DD" opacity={0.6 * (1 - u)} /> : null; })}
            <Label x={640} y={1330} text="Thumbprint" size={34} op={printK} rot={-2} />
          </g>
          {/* the detective with brush and magnifier */}
          <g opacity={1 - dive}>
            <Person x={mix(960, 900, dust)} y={1500} s={0.75} coat={C.sepia} hat="bowler" tache brows="up" flip aR={[100 + osc(tt, 2) * 20 * (dust < 1 ? 1 : 0), 30]} aL={[60, 40]}
              holdR={<Cut d={rect(-8, -50, 16, 60, 4)} fill={C.sepia} sw={2} rim={false} />} hold={<g transform="scale(0.25)"><Magnifier x={0} y={-100} /></g>} />
          </g>
          {/* inside the print: maze ridges with a tiny detective, straightening into drawers */}
          {dive > 0.6 && <g opacity={lin(dive, 0.6, 0.3)}>
            <rect x={-200} y={-200} width={1500} height={2400} fill={C.glass} />
            {[...Array(9)].map((_, i) => <ellipse key={i} cx={540} cy={960} rx={70 + i * 70} ry={90 + i * 100} fill="none" stroke={C.ink} strokeWidth={14} strokeDasharray={`${300 + i * 40} 60`} transform={`rotate(${i * 13},540,960)`} />)}
            <Person x={540 + osc(t, 0.4) * 120} y={1060} s={0.18} coat={C.sepia} hat="bowler" tache walk={tt * 2} flip={osc(t, 0.4, 0.25) < 0} />
          </g>}
        </Plane>
      </>
    );
  }
  const straighten = ramp(t, f - 0.2, 0.6);
  return (
    <>
      <Plane cam={cam} d={0.4}><rect x={-1500} y={-1500} width={4000} height={5000} fill={C.sepia} /></Plane>
      <Plane cam={cam} d={1}>
        <rect x={-300} y={300} width={1700} height={1500} fill="#6B5038" />
        {DRAWERS.map((lab, i) => {
          const open = i === di && dk > 0.5 ? Math.sin(lin(t, tries[ti][0] + 0.15, 0.6) * Math.PI) * 30 : 0;
          const slide = i === 9 ? roomDrawer : 0;
          return (
            <g key={i} transform={`translate(${dx(i)},${dy(i) + (1 - straighten) * osc(i, 0.3) * 120}) rotate(${(1 - straighten) * (i * 23 % 40 - 20)}) scale(${1 + slide * 0.3})`}>
              <Cut d={rect(-120, -95 + open * 0.3, 240, 190, 4)} fill={C.oldGold} sw={3} />
              <rect x={-92} y={-50} width={184} height={50} fill={C.card} stroke={C.ink} strokeWidth={2} />
              <text x={0} y={-16} textAnchor="middle" fontFamily={TYPE} fontSize={26} fill={C.ink}>{lab}</text>
              <Cut d={rect(-30, 30, 60, 20, 8)} fill={C.ink} sw={1} rim={false} shadow={false} />
              {i === 9 && slide > 0 && <g opacity={slide}>
                <rect x={-110} y={-90} width={220} height={180} fill={C.paper} stroke={C.ink} strokeWidth={3} />
                <rect x={30} y={-70} width={60} height={70} fill="#FFF1C8" stroke={C.ink} strokeWidth={2} />
                <rect x={-80} y={20} width={80} height={50} fill={C.trunk} stroke={C.ink} strokeWidth={2} />
                <rect x={-80} y={16} width={80} height={6} fill={C.amber} />
              </g>}
            </g>
          );
        })}
        {/* the clerk measures a man's ear with calipers */}
        <Person x={-130} y={1820} s={0.8} coat={C.ink} hat="none" glasses tache aR={[120, 40]} look={1} holdR={<path d="M0,0 L40,-40 M0,0 L50,10" stroke={C.oldGold} strokeWidth={6} />} />
        <Person x={140} y={1820} s={0.78} coat={C.duskBlue} hat="none" flip brows="worried" mouth="o" />
        {/* the print with eyes: no drawer fits */}
        <g transform={`translate(${pX},${pY}) rotate(${osc(t, 1.3) * 6 * (t > B.notfp ? 1 : 0)})`}>
          <Cut d={ell(0, 0, 70, 90)} fill={C.card} sw={3} />
          <Print x={0} y={0} s={0.9} eyes look={osc(t, 0.6)} />
          {t > B.notfp + 0.2 && <path d="M-80,30 l-34,-26 M80,30 l34,-26" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />}
        </g>
      </Plane>
    </>
  );
};
export const S7_OUT = {x: 540, y: 960, color: C.paper};

// ------------------------------------------------------------------ 8. the little room: the search (hot/cold), then the reveal
// layout: door (x 60), bed (150-430), stove (520), table+chair (650), trunk (800-1000), window (760-980, y 520-820)
export const Room: React.FC<{t: number; phase: 'search' | 'reveal'}> = ({t, phase}) => {
  const tt = step2(t);
  const a = B.l12;
  const knock = phase === 'search' ? Math.max(0, 1 - Math.abs(t - B.knock - 0.15) * 5) : 0;
  // detective path: enters, bed, curtain, stove, near trunk (hot), turns away, leaves
  const keys: [number, number][] = [[B.knock + 0.6, -150], [B.look - 0.2, 200], [B.look + 0.4, 300], [B.look + 0.9, 760], [B.leave - 0.8, 520], [B.leave - 0.3, 700], [B.leave + 0.1, 640], [B.leave + 1.0, -200]];
  let k = 0; while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
  const u = ramp(t, keys[k][0], keys[k + 1][0] - keys[k][0]);
  const dX = phase === 'search' ? mix(keys[k][1], keys[k + 1][1], u) : -400;
  const moving = phase === 'search' && t > keys[0][0] && t < keys[keys.length - 1][0] && u > 0.02 && u < 0.98;
  const crouch = phase === 'search' ? Math.max(0, 1 - Math.abs(t - (B.look + 0.1)) * 3) : 0;
  const curtain = phase === 'search' ? Math.max(0, 1 - Math.abs(t - (B.look + 0.9)) * 2.5) : 0;
  const stove = phase === 'search' ? Math.max(0, 1 - Math.abs(t - (B.leave - 0.8)) * 3) : 0;
  const hot = phase === 'search' ? Math.max(0, 1 - Math.abs(dX - 800) / 500) : 0;
  const peek = phase === 'search' ? ramp(t, B.leave - 0.3, 0.2) * (1 - ramp(t, B.leave + 0.25, 0.12)) : 0;
  const lidUp = phase === 'reveal' ? ramp(t, B.hidden + 0.1, 0.6) : peek * 0.25;
  const glowK = phase === 'reveal' ? 0.5 + lidUp * 0.6 : 0.3 + hot * 0.7;
  const glint = phase === 'reveal' ? Math.max(0, 1 - Math.abs(t - (B.same + 0.4)) * 4) : 0;
  const doorOpen = phase === 'search' ? Math.max(ramp(t, B.knock + 0.35, 0.3) * (1 - ramp(t, B.knock + 1.4, 0.3)), ramp(t, B.leave + 0.2, 0.3) * (1 - ramp(t, B.leave + 1.1, 0.3))) : 0;
  return (
    <g>
      <rect x={-600} y={-600} width={2400} height={3000} fill="#E8D6B0" />
      <rect x={-600} y={1380} width={2400} height={1000} fill={C.sepia} />
      {[...Array(14)].map((_, i) => <line key={i} x1={-600 + i * 170} y1={1380} x2={-700 + i * 170} y2={2400} stroke={C.ink} strokeWidth={2} opacity={0.3} />)}
      <line x1={-600} y1={1380} x2={1800} y2={1380} stroke={C.ink} strokeWidth={4} />
      {/* wallpaper stripes */}
      {[...Array(18)].map((_, i) => <line key={i} x1={-560 + i * 120} y1={-600} x2={-560 + i * 120} y2={1380} stroke={C.paperShade} strokeWidth={10} opacity={0.5} />)}
      {/* window with the night/day sky */}
      <rect x={760} y={500} width={240} height={330} fill={phase === 'search' ? '#CFDDE8' : C.duskBlue} stroke={C.ink} strokeWidth={5} />
      <line x1={880} y1={500} x2={880} y2={830} stroke={C.ink} strokeWidth={5} /><line x1={760} y1={665} x2={1000} y2={665} stroke={C.ink} strokeWidth={5} />
      <g transform={`translate(1000,480) scale(${1 - curtain * 0.6},1)`}><Cut d={`M0,0 L-130,0 Q${-150 + osc(t, 0.3) * 8},200 -120,380 L0,380 Z`} fill={C.clueRed} sw={3} op={0.9} /></g>
      <Cut d={rect(740, 470, 280, 26, 4)} fill={C.sepia} sw={3} />
      {/* door */}
      <g transform={`translate(-60,${knock * 4})`}><rect x={0} y={760} width={200} height={620} fill={C.ink} />
        <g transform={`scale(${1 - doorOpen * 0.85},1)`}><Cut d={rect(0, 760, 200, 620, 4)} fill="#8F6C4A" /><circle cx={170} cy={1080} r={12} fill={C.oldGold} stroke={C.ink} strokeWidth={2} /></g></g>
      {knock > 0 && <text x={240} y={900} fontFamily={TYPE} fontSize={56} fill={C.ink} opacity={knock}>knock knock</text>}
      {/* bed */}
      <Cut d={rect(200, 1150, 330, 100, 8)} fill={C.smock} />
      <Cut d={rect(190, 1050, 24, 330, 6)} fill={C.ink} sw={2} /><Cut d={rect(520, 1120, 24, 260, 6)} fill={C.ink} sw={2} />
      <path d={`M200,${1250 + crouch * 10} Q360,${1270 - crouch * 40} 530,1250 L530,1340 L200,1340 Z`} fill={C.smock} stroke={C.ink} strokeWidth={3} opacity={0.95} />
      {/* stove */}
      <Cut d={rect(560, 1060, 140, 320, 6)} fill={C.ink} />
      <rect x={580} y={1180} width={100} height={80} fill={stove > 0.1 ? '#E28A3C' : '#3A302A'} stroke={C.stone} strokeWidth={3} />
      <g transform={`translate(580,1180) scale(${1 - stove * 0.9},1)`}><rect x={0} y={0} width={100} height={80} fill="#3A302A" stroke={C.stone} strokeWidth={3} /></g>
      <rect x={612} y={760} width={24} height={300} fill={C.ink} />
      {/* table, cloth, chair */}
      <Cut d={rect(400, 1100, 10, 10, 2)} fill={C.ink} sw={1} rim={false} />
      {/* the white trunk (amber leaks from the crack under the lid) */}
      <g transform="translate(900,1380)">
        <ellipse cx={0} cy={-120} rx={260 * (0.6 + glowK * 0.5)} ry={160 * (0.6 + glowK * 0.5)} fill="url(#amberGlow)" opacity={glowK} />
        <Cut d={rect(-130, -170, 260, 170, 6)} fill={C.trunk} />
        <rect x={-130} y={-120} width={260} height={16} fill={C.sepia} stroke={C.ink} strokeWidth={2} />
        {[-80, 80].map((x) => <rect key={x} x={x - 8} y={-170} width={16} height={170} fill={C.sepia} stroke={C.ink} strokeWidth={2} />)}
        <rect x={-126} y={-178} width={252} height={8 + lidUp * 40} fill={C.amber} opacity={0.4 + glowK * 0.6} />
        {(peek > 0.05 || phase === 'reveal') && <MonaEyes x={0} y={-178 - (phase === 'reveal' ? 0 : 0)} w={phase === 'reveal' ? 0.01 : 150} op={phase === 'reveal' ? 0 : peek} glow={0} />}
        <g transform={`translate(0,-170) rotate(${-lidUp * 75},-130,0)`}><Cut d={`M-134,0 L-134,-50 Q0,-90 134,-50 L134,0 Z`} fill={C.trunk} /></g>
        {phase === 'reveal' && lidUp > 0.1 && <g opacity={lidUp}><Mona x={0} y={-300} h={250} glow={0.9} />
          {glint > 0 && <g transform="translate(-14,-372)"><path d={`M0,${-30 * glint} L6,-6 L${30 * glint},0 L6,6 L0,${30 * glint} L-6,6 L${-30 * glint},0 L-6,-6 Z`} fill="#FFF7DA" /></g>}</g>}
      </g>
      {/* Vincenzo: calm poker face (shirt costume) */}
      <Person x={phase === 'search' ? 420 : 680} y={1440} s={0.72} coat={C.sepia} legs={C.ink} skin={C.skin[1]} hat="none" tache collar
        look={phase === 'search' ? (dX > 420 ? 1 : -1) * 0.6 : 0.6} brows={hot > 0.7 ? 'worried' : 'flat'} mouth={phase === 'reveal' ? 'smile' : 'flat'}
        aR={phase === 'reveal' ? [100 * lidUp + 10, 30] : undefined} />
      {/* the detective */}
      {phase === 'search' && <g transform={`translate(${dX},${1440 + crouch * 60}) rotate(${crouch * 20})`}>
        <Person x={0} y={0} s={0.76} coat={C.sepia} hat="bowler" tache flip={!(k >= 6 || (k === 5 && u > 0.5)) ? false : true}
          walk={moving ? tt * 1.6 : undefined} brows={hot > 0.6 ? 'up' : 'flat'} look={k >= 5 ? -1 : 1} aR={[80, 50]} hold={<g transform="scale(0.22)"><Magnifier x={0} y={-80} /></g>} />
      </g>}
    </g>
  );
};
export const S8a: React.FC<{t: number}> = ({t}) => {
  const a = B.l12;
  const cam = camAt(t, [[a - 0.3, 900, 1240, 2.3], [a + 0.6, 520, 1000, 1.0], [B.look, 560, 1020, 1.02], [B.leave, 700, 1040, 1.12], [B.l13 - 0.6, 850, 700, 1.4], [B.l13 - 0.15, 880, 665, 3.2]]);
  return <Plane cam={cam} d={1}><Room t={t} phase="search" /></Plane>;
};
export const S8a_OUT = {x: 540, y: 960, color: C.duskBlue};
export const S8b: React.FC<{t: number}> = ({t}) => {
  const a = B.l13;
  const cam = camAt(t, [[a - 0.15, 540, 1300, 1.4], [B.where + 0.2, 540, 600, 0.9], [B.hidden - 0.3, 560, 760, 0.9], [B.hidden + 0.3, 700, 1290, 1.8], [B.hidden + 0.7, 705, 1300, 3.0]]);
  return (
    <>
      <Plane cam={cam} d={0.3}><rect x={-1500} y={-1500} width={4000} height={5000} fill={C.nightBlue} />
        {[...Array(30)].map((_, i) => <circle key={i} cx={(i * 197) % 1600 - 260} cy={(i * 311) % 1200 - 200} r={2 + (i % 3)} fill={C.card} opacity={0.4 + 0.4 * Math.max(0, osc(t, 0.5, i * 0.17))} />)}</Plane>
      <Plane cam={cam} d={0.6}><Rooftops t={t} y={1700} seed="s8f" /></Plane>
      <Plane cam={cam} d={0.8}>
        <g transform={`translate(540,${360 + osc(t, 0.3) * 20}) rotate(${osc(t, 0.25) * 6})`}><QMark x={0} y={0} s={4.2} /></g>
      </Plane>
      <Plane cam={cam} d={1}>
        <Rooftops t={t} y={1900} seed="s8" lit={6} litOn />
      </Plane>
    </>
  );
};
export const S8b_OUT = {x: 540, y: 960, color: C.amber};
export const S8c: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[B.hidden + 0.6, 880, 1150, 1.9], [B.same + 0.3, 800, 1080, 1.25], [B.l14 - 0.3, 860, 820, 1.5]]);
  return <Plane cam={cam} d={1}><Room t={t} phase="reveal" /></Plane>;
};
export const S8c_OUT = {x: 600, y: 700, color: '#FFF1C8'};

// ------------------------------------------------------------------ 9. years at the window; the web on the hooks; the Missing poster
export const S9a: React.FC<{t: number}> = ({t}) => {
  const a = B.l14;
  const cam = camAt(t, [[a - 0.3, 540, 900, 1.6], [a + 0.8, 540, 960, 1.0], [B.years, 540, 900, 1.15], [B.l15 - 0.9, 540, 830, 1.6], [B.l15 - 0.4, 540, 820, 3.0]]);
  const yr = t < B.months ? '1911' : t < B.years ? '1912' : '1913';
  const prev = t < B.months ? undefined : t < B.years ? '1911' : '1912';
  const tk = lin(t, t < B.years ? B.months : B.years, 0.5);
  const season = ((t - a) / ((B.l15 - a) / 3)) % 3; // 0 autumn, 1 winter, 2 summer, cycling
  const sky = season < 1 ? '#D9B98A' : season < 2 ? '#DDE6EE' : '#BFD6E6';
  const sweep = ((t - a) * 0.9) % 1;
  return (
    <Plane cam={cam} d={1}>
      <rect x={-800} y={-800} width={2700} height={3600} fill="#E8D6B0" />
      {[...Array(18)].map((_, i) => <line key={i} x1={-760 + i * 120} y1={-800} x2={-760 + i * 120} y2={2800} stroke={C.paperShade} strokeWidth={10} opacity={0.5} />)}
      {/* the window, big; outside the seasons cycle */}
      <rect x={250} y={500} width={580} height={760} fill={sky} stroke={C.ink} strokeWidth={6} />
      {season >= 1 && season < 2 && [...Array(24)].map((_, i) => <circle key={i} cx={260 + ((i * 97 + t * 30) % 560)} cy={500 + ((i * 131 + t * 160) % 760)} r={6} fill="#fff" />)}
      {season < 1 && [...Array(10)].map((_, i) => <ellipse key={i} cx={260 + ((i * 113 + t * 120) % 560)} cy={500 + ((i * 89 + t * 140) % 760)} rx={14} ry={7} fill={i % 2 ? C.clueRed : C.amber} transform={`rotate(${t * 200 + i * 40},${260 + ((i * 113 + t * 120) % 560)},${500 + ((i * 89 + t * 140) % 760)})`} />)}
      {season >= 2 && <circle cx={680} cy={640} r={70} fill="#FFE39A" stroke={C.ink} strokeWidth={3} />}
      <Rooftops t={t} y={1300} seed="s9" />
      <line x1={540} y1={500} x2={540} y2={1260} stroke={C.ink} strokeWidth={8} /><line x1={250} y1={880} x2={830} y2={880} stroke={C.ink} strokeWidth={8} />
      <Cut d={rect(220, 1250, 640, 40, 4)} fill={C.sepia} sw={3} />
      {/* the flower pot grows and wilts */}
      <g transform="translate(330,1250)"><Cut d="M-36,0 L-28,-60 L28,-60 L36,0 Z" fill="#B5673E" sw={3} />
        <path d={`M0,-60 Q${osc(t, 0.3) * 10},-140 0,${-160 - (season % 1) * 60}`} fill="none" stroke="#5B7A3A" strokeWidth={6} />
        <circle cx={0} cy={-170 - (season % 1) * 60} r={18 * (season >= 2 ? 1 : 0.4)} fill={C.clueRed} stroke={C.ink} strokeWidth={2} /></g>
      {/* the light sweeps across the room */}
      <path d={`M${830},${500} L${830 + 200 + sweep * 300},${1600} L${830 + 500 + sweep * 300},${1600} L${830},${1260} Z`} fill="#FFF1C8" opacity={0.25} />
      <Calendar x={1010} y={700} s={1} page={yr} prev={prev} k={tk} />
      {/* the trunk in the corner, still glowing */}
      <g transform="translate(980,1500)"><ellipse cx={0} cy={-80} rx={200} ry={120} fill="url(#amberGlow)" opacity={0.45 + 0.1 * osc(t, 0.4)} />
        <Cut d={rect(-130, -170, 260, 170, 6)} fill={C.trunk} /><rect x={-126} y={-176} width={252} height={8} fill={C.amber} /></g>
    </Plane>
  );
};
export const S9a_OUT = {x: 540, y: 880, color: C.paper};
export const S9b: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[B.l15 - 0.4, 540, 760, 2.6], [B.l15 + 0.4, 540, 820, 1.4], [B.fear + 0.2, 540, 800, 1.7]]);
  const web = lin(t, B.l15 - 0.4, 1.4);
  const spX = mix(450, 630, (osc(t, 0.6) + 1) / 2), spY = 740 + web * 80;
  return (
    <SalonWall cam={cam} t={t} look={0}>
      <Plane cam={cam} d={1}>
        <rect x={430} y={760} width={220} height={300} fill={C.card} opacity={0.5} stroke={C.paperShade} strokeWidth={4} />
        <Hooks x={540} y={740} s={1} t={t} droop={ramp(t, B.fear, 1.2)} />
        {/* the web spun across the four hooks */}
        <g opacity={0.85} stroke={C.ink} strokeWidth={1.6} fill="none">
          {[...Array(8)].map((_, i) => { const ang = (i / 8) * Math.PI * 2; return <line key={i} x1={540} y1={790} x2={540 + Math.cos(ang) * 130 * web} y2={790 + Math.sin(ang) * 110 * web} />; })}
          {[0.3, 0.55, 0.8, 1].map((r) => r <= web + 0.05 && <ellipse key={r} cx={540} cy={790} rx={130 * r} ry={110 * r} strokeDasharray="10 4" />)}
        </g>
        <line x1={spX} y1={700} x2={spX} y2={spY} stroke={C.ink} strokeWidth={1.5} />
        <g transform={`translate(${spX},${spY})`}><circle r={9} fill={C.ink} />{[...Array(8)].map((_, i) => <line key={i} x1={0} y1={0} x2={(i < 4 ? -1 : 1) * 18} y2={-12 + (i % 4) * 8 + osc(t, 4, i * 0.1) * 3} stroke={C.ink} strokeWidth={2} />)}</g>
        {/* dust settling */}
        {[...Array(18)].map((_, i) => <circle key={i} cx={380 + ((i * 53) % 320) + osc(t, 0.2, i * 0.13) * 20} cy={600 + ((i * 71 + t * 30) % 500)} r={3} fill={C.sepia} opacity={0.5} />)}
      </Plane>
    </SalonWall>
  );
};
export const S9b_OUT = {x: 540, y: 960, color: C.paper};
export const S9c: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[B.fear + 0.4, 600, 900, 2.0], [B.forever - 0.2, 560, 940, 1.15], [B.l16 + 0.1, 560, 900, 1.25], [B.l16 + 0.7, 700, 600, 1.2]]);
  const fade = lin(t, B.fear + 0.4, B.l16 - B.fear - 0.2);
  const tear = ramp(t, B.l16 - 0.1, 0.9);
  const tt = step2(t);
  return (
    <>
      <Plane cam={cam} d={0.3}><rect x={-1500} y={-1500} width={4000} height={5000} fill="#D7C6A0" /><Rooftops t={t} y={1000} seed="s9c" /></Plane>
      <Plane cam={cam} d={1}>
        <Ground y={1560} color={C.stone} />
        <Lamp x={560} y={1560} h={900} />
        {/* the Missing poster: her photo fades in the sun until only the smile is left */}
        <g transform={`translate(${560 + tear * 500},${980 - tear * 700 - Math.sin(tear * Math.PI) * 100}) rotate(${osc(t, 0.7) * 3 + tear * 40}) scale(${1 - tear * 0.5})`}>
          <Cut d={rect(-200, -270, 400, 520, 3)} fill={C.card} sw={3} />
          <path d={`M200,-270 l${-50 - osc(t, 1.1) * 20},0 l${50 + osc(t, 1.1) * 20},${50 + osc(t, 1.1) * 20} Z`} fill={C.paperShade} stroke={C.ink} strokeWidth={2} />
          <text x={0} y={-200} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={70} fill={C.ink}>Missing</text>
          <g opacity={1 - fade * 0.85}><image href={staticFile('monalisa.jpg')} x={-130} y={-160} width={260} height={360} preserveAspectRatio="xMidYMin slice" style={{filter: 'grayscale(1) contrast(1.2)'}} /></g>
          {/* the smile stays: a crop of the real mouth */}
          <svg x={-60} y={-40} width={120} height={50} viewBox="235 335 130 54" preserveAspectRatio="xMidYMid slice">
            <image href={staticFile('monalisa.jpg')} x={0} y={0} width={600} height={894} style={{filter: 'grayscale(1) contrast(1.2)'}} />
          </svg>
          <rect x={-130} y={-160} width={260} height={360} fill="url(#halftone)" opacity={0.15 * (1 - fade)} />
          <rect x={-130} y={-160} width={260} height={360} fill="none" stroke={C.ink} strokeWidth={2} />
        </g>
        {/* leaves blow past */}
        {[...Array(8)].map((_, i) => { const u = ((t * 0.5 + i * 0.125) % 1); return <ellipse key={i} cx={-100 + u * 1300} cy={700 + i * 90 + Math.sin(u * 8 + i) * 40} rx={16} ry={8} fill={i % 2 ? C.amber : C.clueRed} transform={`rotate(${u * 600})`} />; })}
        {/* a passer-by sighs */}
        <Person x={mix(1050, 820, ramp(t, B.fear, 1.0))} y={1700} s={0.72} coat={C.duskBlue} hat="bowler" tache flip brows="worried" mouth="frown" walk={t < B.fear + 1.0 ? tt * 1.4 : undefined} bob={osc(t, 0.4) * 4} look={-1} lookY={-1} />
        {t > B.fear + 1.0 && <text x={700} y={1060} fontFamily={TYPE} fontSize={40} fill={C.ink} opacity={1 - lin(t, B.fear + 2.0, 0.8)}>sigh…</text>}
      </Plane>
    </>
  );
};
export const S9c_OUT = {x: 700, y: 400, color: C.card};

// ------------------------------------------------------------------ 10. paper plane over the map to Florence; Geri's shop
export const S10a: React.FC<{t: number}> = ({t}) => {
  const a = B.l16;
  const u = ramp(t, a + 0.2, B.florence - a + 0.3);
  const px = mix(260, 760, u), py = mix(520, 1300, u) - Math.sin(u * Math.PI) * 200;
  const cam = camAt(t, [[a + 0.2, 260, 560, 1.4], [B.florence + 0.5, 700, 1200, 1.15], [B.florence + 1.0, 760, 1290, 2.6]]);
  const flo = ramp(t, B.florence, 0.4);
  return (
    <>
      <Plane cam={cam} d={0.5}><rect x={-1500} y={-1500} width={4000} height={5000} fill={C.paperShade} /></Plane>
      <Plane cam={cam} d={1}>
        <Cut d={rect(40, 280, 1000, 1360, 6)} fill={C.paper} sw={3} />
        {[...Array(6)].map((_, i) => <line key={i} x1={40 + i * 200} y1={280} x2={40 + i * 200} y2={1640} stroke={C.paperShade} strokeWidth={2} />)}
        <path d="M120,360 Q300,330 500,400 Q560,600 640,800 Q760,900 820,1100 Q880,1300 960,1450 Q900,1560 860,1600 L120,1600 Z" fill="none" stroke={C.ink} strokeWidth={3} strokeDasharray="14 8" />
        {/* the Alps */}
        {[...Array(7)].map((_, i) => <Cut key={i} d={`M${380 + i * 70},${900 - (i % 2) * 30} l45,-110 l45,110 Z`} fill={C.stone} sw={2.5} rim={false} />)}
        {[...Array(7)].map((_, i) => <path key={i} d={`M${410 + i * 70},${840 - (i % 2) * 30} l15,-50 l15,50 Z`} fill="#fff" />)}
        <circle cx={260} cy={520} r={14} fill={C.clueRed} stroke={C.ink} strokeWidth={2} /><text x={290} y={530} fontFamily={TYPE} fontSize={40} fill={C.ink}>Paris</text>
        <circle cx={760} cy={1300} r={14 + flo * 6} fill={C.ink} stroke={C.ink} strokeWidth={2} />
        <g opacity={0.3 + flo * 0.7} transform={`translate(760,1370) scale(${1 + 0.2 * flo})`}><text x={0} y={0} textAnchor="middle" fontFamily={TYPE} fontSize={44} fill={C.ink}>Florence, Italy</text></g>
        <path d={`M260,520 Q${mix(260, 760, 0.3)},700 ${px},${py}`} fill="none" stroke={C.ink} strokeWidth={3} strokeDasharray="6 10" opacity={0.6} />
        <Calendar x={880} y={480} s={0.75} page="1913" />
        {/* the poster, now a paper plane, then an envelope */}
        <g transform={`translate(${px},${py}) rotate(${50 + osc(t, 1.2) * 6})`}>
          {flo < 0.5 ? <g><Cut d="M-60,-20 L70,0 L-60,20 L-30,0 Z" fill={C.card} sw={2.5} /><path d="M-30,0 L70,0" stroke={C.ink} strokeWidth={2} /></g>
            : <g transform="rotate(-50)"><Cut d={rect(-70, -46, 140, 92, 4)} fill={C.card} sw={2.5} /><path d="M-70,-46 L0,10 L70,-46" fill="none" stroke={C.ink} strokeWidth={2.5} /><rect x={36} y={-38} width={24} height={28} fill={C.clueRed} stroke={C.ink} strokeWidth={2} /></g>}
        </g>
      </Plane>
    </>
  );
};
export const S10a_OUT = {x: 540, y: 960, color: '#E8D6B0'};
const Geri: React.FC<{x: number; y: number; s?: number; brows?: 'up' | 'flat'; mouth?: 'o' | 'smile' | 'flat'; aR?: [number, number]; aL?: [number, number]; holdR?: React.ReactNode; look?: number; lookY?: number; nez?: number}> = ({x, y, s = 0.8, brows = "flat", mouth = "smile", aR, aL, holdR, look = 0, lookY = 0, nez = 0}) => (
  <g>
    <Person x={x} y={y} s={s} coat="#4A3B2E" skin={C.skin[1]} hair="#3A3A3A" hat="none" tache wide={1.3} collar brows={brows} mouth={mouth} aR={aR} aL={aL} holdR={holdR} look={look} lookY={lookY} />
    {/* pince-nez + watch chain */}
    <g transform={`translate(${x},${y + (-560 * 0.86 - 38 + nez * 18) * s}) scale(${s})`}><circle cx={-20} cy={0} r={13} fill="none" stroke={C.ink} strokeWidth={3} /><circle cx={22} cy={0} r={13} fill="none" stroke={C.ink} strokeWidth={3} /><line x1={-7} y1={0} x2={9} y2={0} stroke={C.ink} strokeWidth={3} /></g>
    <path d={`M${x - 30 * s},${y - 300 * s} q${30 * s},${30 * s} ${60 * s},0`} fill="none" stroke={C.oldGold} strokeWidth={4} />
  </g>
);
export const S10b: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[B.florence + 1.0, 540, 900, 1.7], [B.florence + 1.8, 540, 1000, 1.0], [B.letter, 560, 1050, 1.12], [B.l17 - 0.6, 620, 1180, 1.5], [B.l17 - 0.1, 620, 1200, 2.6]]);
  const drop = ramp(t, B.florence + 1.0, 0.8);
  const slit = lin(t, B.letter + 0.1, 0.6);
  const tag = lin(t, B.florence + 1.5, 0.9);
  return (
    <>
      <Plane cam={cam} d={0.4}><rect x={-1500} y={-1500} width={4000} height={5000} fill="#E8D6B0" />
        {/* window with the Duomo */}
        <rect x={600} y={300} width={420} height={460} fill="#CFDDE8" stroke={C.ink} strokeWidth={5} />
        <Cut d="M700,760 L700,560 Q810,420 920,560 L920,760 Z" fill="#C9744A" sw={3} />
        <path d="M810,470 L810,440" stroke={C.ink} strokeWidth={5} /><Cut d={rect(690, 640, 240, 120, 2)} fill={C.paper} sw={3} />
        {[...Array(5)].map((_, i) => <line key={i} x1={730 + i * 40} y1={540} x2={735 + i * 38} y2={760} stroke={C.ink} strokeWidth={2} opacity={0.6} />)}
        {[...Array(3)].map((_, i) => <circle key={i} cx={(650 + i * 140 + t * 20) % 1000 + 30} cy={360 + i * 30} r={26} fill="#fff" opacity={0.7} />)}
      </Plane>
      <Plane cam={cam} d={0.75}>
        {/* paintings stacked against the wall */}
        {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${-120 + i * 110},${1060 - i * 20}) rotate(${-8 + i * 4})`}><Cut d={rect(-110, -150, 220, 300, 3)} fill={C.oldGold} sw={3} /><rect x={-90} y={-130} width={180} height={260} fill={[C.duskBlue, '#6E7F5E', C.sepia, C.stone][i]} stroke={C.ink} strokeWidth={2} /></g>)}
      </Plane>
      <Plane cam={cam} d={1}>
        <Ground y={1420} color={C.sepia} />
        <Geri x={420} y={1420} brows={slit > 0.3 ? 'up' : 'flat'} aR={[70 + slit * 30, 50]} aL={[60, 40]} look={1} lookY={1}
          holdR={slit > 0 ? <path d="M0,0 L60,-30" stroke={C.stone} strokeWidth={6} /> : undefined} />
        {/* desk with lamp and inkwell */}
        <Cut d={rect(300, 1180, 680, 40, 4)} fill={C.sepia} />
        <Cut d={rect(330, 1220, 620, 200, 4)} fill="#6B5038" />
        <g transform="translate(880,1180)"><Cut d={rect(-8, -180, 16, 180, 4)} fill={C.oldGold} sw={2} /><Cut d="M-60,-170 L60,-170 L36,-240 L-36,-240 Z" fill="#5B7A3A" sw={3} /><ellipse cx={0} cy={-120} rx={160} ry={120} fill="url(#lampGlow)" opacity={0.5 + 0.05 * osc(t, 3)} /></g>
        <Cut d={rect(360, 1140, 60, 40, 8)} fill={C.ink} sw={2} />
        {/* the envelope drops through the window onto the desk */}
        <g transform={`translate(${mix(800, 640, drop)},${mix(500, 1150, drop)}) rotate(${(1 - drop) * 50})`}>
          <Cut d={rect(-90, -56, 180, 112, 4)} fill={C.card} sw={2.5} /><path d={`M-90,-56 L0,${10 - slit * 30} L90,-56`} fill="none" stroke={C.ink} strokeWidth={2.5} />
          <rect x={50} y={-48} width={28} height={34} fill={C.clueRed} stroke={C.ink} strokeWidth={2} />
          {slit > 0 && <rect x={-70} y={-56 - slit * 70} width={140} height={70} fill={C.card} stroke={C.ink} strokeWidth={2} />}
        </g>
        <NameTag x={420} y={600} text="Alfredo Geri, art dealer" k={tag} t={t} size={36} />
      </Plane>
    </>
  );
};
export const S10b_OUT = {x: 540, y: 960, color: C.card};

// ------------------------------------------------------------------ 11. the letter signed "Leonardo"; end card
export const S11: React.FC<{t: number}> = ({t}) => {
  const a = B.l17;
  const cam = camAt(t, [[a - 0.1, 540, 960, 1.6], [a + 0.8, 540, 1000, 1.0], [B.signs, 540, 1030, 1.02], [B.leonardo + 0.4, 600, 1220, 1.35], [B.total, 610, 1240, 1.42]]);
  const lines = lin(t, a, B.signs - a);
  const rise = ramp(t, B.says - 0.2, 0.7);
  const brows = t > B.has ? 'up' : 'flat';
  const nez = ramp(t, B.leonardo + 0.2, 0.3);
  const sig = lin(t, B.signs + 0.4, B.leonardo + 0.6 - B.signs - 0.4);
  const glint = Math.max(0, 1 - Math.abs(t - (B.leonardo + 0.7)) * 4);
  const dropY = ramp(t, B.leonardo + 0.9, 0.5);
  return (
    <>
      <Plane cam={cam} d={0.4}><rect x={-1500} y={-1500} width={4000} height={5000} fill="#6B5038" />
        <ellipse cx={900} cy={500} rx={500} ry={420} fill="url(#lampGlow)" opacity={0.45 + 0.04 * osc(t, 2.7)} /></Plane>
      <Plane cam={cam} d={0.75}>
        {/* Geri rises above the letter: eyebrows up, pince-nez slipping */}
        <g transform={`translate(0,${(1 - rise) * 260})`}>
          <Geri x={540} y={1180} s={0.95} brows={brows} mouth={t > B.leonardo ? 'o' : 'flat'} look={0} lookY={1} nez={nez} aR={[150, 20]} aL={[150, 20]} />
        </g>
      </Plane>
      <Plane cam={cam} d={1}>
        <g transform={`rotate(${-2 + osc(t, 0.3) * 0.6},540,1150)`}>
          <Cut d={rect(150, 700, 780, 900, 4)} fill={C.card} sw={3} />
          {[...Array(8)].map((_, i) => {
            const k = Math.max(0, Math.min(1, lines * 8 - i));
            const len = 560 - (i === 7 ? 220 : (i * 47) % 120);
            return <path key={i} d={`M220,${800 + i * 72} q20,-14 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0`} fill="none" stroke={C.ink} strokeWidth={3.5}
              strokeDasharray={`${len * k} 2000`} opacity={0.85} />;
          })}
          {/* the signature writes stroke by stroke */}
          <text x={560} y={1440} fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight={900} fontSize={110} fill="none" stroke={C.ink} strokeWidth={3}
            strokeDasharray={`${sig * 1600} 1600`}>Leonardo</text>
          <g style={{clipPath: `inset(0 ${100 - sig * 100}% 0 0)`}}><text x={560} y={1440} fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight={900} fontSize={110} fill={C.ink} opacity={0.0}>Leonardo</text></g>
          <rect x={545} y={1356} width={sig * 460} height={110} fill={C.ink} opacity={0} />
          {glint > 0 && <g transform="translate(1000,1400)"><circle r={60} fill="url(#amberGlow)" opacity={glint} /><path d={`M0,${-34 * glint} L7,-7 L${34 * glint},0 L7,7 L0,${34 * glint} L-7,7 L${-34 * glint},0 L-7,-7 Z`} fill="#FFF7DA" /></g>}
          {/* the wet ink drop */}
          {dropY > 0 && <path d={`M985,${1420 + dropY * 110} q-12,18 0,26 q12,-8 0,-26 Z`} fill={C.ink} />}
          {dropY > 0.95 && <ellipse cx={985} cy={1555} rx={18 + lin(t, B.leonardo + 1.4, 0.4) * 10} ry={7} fill={C.ink} />}
        </g>
      </Plane>
    </>
  );
};

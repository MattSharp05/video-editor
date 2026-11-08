// Stages A–B: the recap page, the title, the press and the WANTED mosaic; the two mirrors (shave, snip).
import React from 'react';
import B from './beats.json';
import {C, FONT, Shape, Fog, Gulls, Ring, SparkDot, ramp, lin, osc, mix, rnd, rectD, ellD, backOut, sm} from './look';
import {TmpPerson, TmpMoustache} from './cast';

export const Cam: React.FC<{x: number; y: number; z: number; r?: number; children: React.ReactNode}> = ({x, y, z, r = 0, children}) => (
  <g transform={`translate(540,960) scale(${z}) rotate(${r}) translate(${-x},${-y})`}>{children}</g>
);
const key = (t: number, ks: [number, number][]) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let k = 1; k < ks.length; k++) if (t < ks[k][0]) return mix(ks[k - 1][1], ks[k][1], sm((t - ks[k - 1][0]) / (ks[k][0] - ks[k - 1][0])));
  return ks[ks.length - 1][1];
};
export {key};

// ---------- small part-only props ----------
const Snow: React.FC<{t: number; x: number; y: number; w: number; h: number; n?: number; seed: string}> = ({t, x, y, w, h, n = 14, seed}) => (
  <g>{[...Array(n)].map((_, k) => {
    const r = (q: string) => rnd(`${seed}${k}${q}`);
    const yy = y + ((r('y') * h + t * (18 + r('v') * 20)) % h);
    const xx = x + r('x') * w + Math.sin(t * (1 + r('f')) + k) * 6;
    return <circle key={k} cx={xx} cy={yy} r={2 + r('r') * 2.5} fill="#fff" opacity={0.85} />;
  })}</g>
);

// Recap panel R1: snowy steps of 39 with the Feather on the top step.
const PanelSteps: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width={240} height={250} fill={C.fog} />
    <rect x={120} y={20} width={120} height={150} fill={C.slate} />
    <rect x={150} y={50} width={60} height={110} fill={C.deep} stroke={C.ink} strokeWidth={3} />
    <text x={180} y={44} textAnchor="middle" fontFamily={FONT.period} fontSize={20} fill={C.newsprint}>39</text>
    {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={60 + k * 0} y={170 + k * 16} width={180 - k * 0} height={16} fill={k % 2 ? '#fff' : C.newsprint} stroke={C.ink} strokeWidth={2} transform={`translate(${-k * 14},0)`} />)}
    <path d={`M158,168 q22,${-34 + osc(t, 0.8) * 4} 8,-60 q-2,30 -14,60 Z`} fill={C.cora} stroke={C.ink} strokeWidth={2.5} transform={`rotate(${osc(t, 0.6) * 6} 158 168)`} />
    <Snow t={t} x={0} y={0} w={240} h={250} seed="r1" />
    <rect width={240} height={250} fill="none" stroke={C.ink} strokeWidth={4} />
  </g>
);
// Recap panel R2: three police lamp beams on a closed brick floor, faces lit from below. Nothing else.
const PanelLamps: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width={240} height={250} fill={C.deep} />
    {[...Array(6)].map((_, r) => [...Array(5)].map((__, c) => <rect key={`${r}${c}`} x={c * 52 - (r % 2) * 26} y={150 + r * 18} width={50} height={16} fill={C.slate} stroke={C.ink} strokeWidth={1.5} />))}
    {[50, 120, 190].map((x, k) => {
      const a = osc(t, 0.25, k * 0.3) * 18;
      return <g key={k}>
        <path d={`M${x},70 L${x - 40 + a},230 L${x + 40 + a},230 Z`} fill={C.lamp} opacity={0.35} />
        <circle cx={x} cy={44} r={15} fill={C.skin} stroke={C.ink} strokeWidth={2} />
        <path d={`M${x - 10},52 h20`} stroke={C.lamp} strokeWidth={6} opacity={0.6} />
        <rect x={x - 7} y={64} width={14} height={12} fill={C.lamp} stroke={C.ink} strokeWidth={2} />
      </g>;
    })}
    <rect width={240} height={250} fill="none" stroke={C.ink} strokeWidth={4} />
  </g>
);
// Recap panel R3: the WANTED poster with the blank oval.
const PanelOval: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width={240} height={250} fill={C.mist} />
    <g transform={`rotate(${osc(t, 0.5) * 1.5} 120 125)`}>
      <rect x={30} y={18} width={180} height={214} fill={C.newsprint} stroke={C.ink} strokeWidth={3} />
      <text x={120} y={58} textAnchor="middle" fontFamily={FONT.plaque} fontSize={34} fill={C.ink}>WANTED</text>
      <ellipse cx={120} cy={128} rx={42} ry={52} fill={C.fog} stroke={C.ink} strokeWidth={3} strokeDasharray="6 5" />
      <text x={120} y={205} textAnchor="middle" fontFamily={FONT.wire} fontWeight={700} fontSize={15} fill={C.ink}>Dr. Crippen</text>
      <path d={`M210,18 l${-18 - osc(t, 1.4) * 6},0 l${18 + osc(t, 1.4) * 6},${18 + osc(t, 1.4) * 6} Z`} fill={C.fog} stroke={C.ink} strokeWidth={2} />
    </g>
    <rect width={240} height={250} fill="none" stroke={C.ink} strokeWidth={4} />
  </g>
);

// WANTED poster (stand-in for the kit's WantedPoster), centred at 0,0, 300x400 at s=1.
export const Wanted: React.FC<{t: number; s?: number; seed?: string; mirror?: number}> = ({t, s = 1, seed = 'w', mirror = 0}) => (
  <g transform={`scale(${s}) rotate(${(rnd(seed) - 0.5) * 6 + osc(t, 0.4, rnd(seed)) * 1})`}>
    <rect x={-150} y={-200} width={300} height={400} fill={C.newsprint} stroke={C.ink} strokeWidth={5} />
    <text x={0} y={-140} textAnchor="middle" fontFamily={FONT.plaque} fontSize={64} fill={C.ink}>WANTED</text>
    <ellipse cx={0} cy={-25} rx={80} ry={95} fill={mirror > 0 ? C.fog : C.mist} stroke={C.ink} strokeWidth={4} />
    {mirror <= 0 && <TmpPerson who="crippenA" x={0} y={250} s={0.55} pose={{mouth: 'flat'}} />}
    <rect x={-150} y={70} width={300} height={130} fill={C.newsprint} />
    <rect x={-150} y={-200} width={300} height={400} fill="none" stroke={C.ink} strokeWidth={5} />
    <text x={0} y={110} textAnchor="middle" fontFamily={FONT.wire} fontWeight={700} fontSize={32} fill={C.ink}>Dr. Crippen</text>
    <text x={0} y={148} textAnchor="middle" fontFamily={FONT.wire} fontWeight={700} fontSize={19} fill={C.ink}>Small. Round glasses.</text>
    <text x={0} y={174} textAnchor="middle" fontFamily={FONT.wire} fontWeight={700} fontSize={19} fill={C.ink}>Big moustache.</text>
  </g>
);

const Press: React.FC<{t: number; spin: number}> = ({t, spin}) => (
  <g>
    <Shape d={rectD(-330, -200, 660, 360)} fill={C.slate} shade />
    <Shape d={rectD(-380, 150, 760, 60)} fill={C.deep} />
    {[[-150, -40, 120], [150, -40, 120], [0, -150, 70]].map(([x, y, r], k) => (
      <g key={k} transform={`translate(${x},${y}) rotate(${spin * (k % 2 ? -1 : 1) * 360})`}>
        <Shape d={ellD(0, 0, r, r)} fill={C.mist} shade />
        {[0, 1, 2, 3, 4, 5].map((q) => <line key={q} x1={0} y1={0} x2={Math.cos(q * 1.047) * r * 0.9} y2={Math.sin(q * 1.047) * r * 0.9} stroke={C.ink} strokeWidth={6} />)}
        <circle r={14} fill={C.deep} stroke={C.ink} strokeWidth={3} />
      </g>
    ))}
    <rect x={-300} y={70} width={600} height={34} fill={C.newsprint} stroke={C.ink} strokeWidth={3} />
    <text x={0} y={-215} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={34} fill={C.ink}>PRINTING PRESS</text>
  </g>
);

// ---------- Stage A: the recap page → title → press → WANTED everywhere ----------
const PAGE_Y = 560;
export const StageA: React.FC<{t: number}> = ({t}) => {
  const z = key(t, [[0, 3.4], [1.5, 1], [B.l1, 1.04], [B.l1 + 0.6, 1], [B.l2, 0.98], [B.l3 - 0.4, 0.46]]);
  const cx = key(t, [[0, 540], [B.l2, 540], [B.l3 - 0.4, 600]]);
  const cy = key(t, [[0, 790], [1.5, 960], [B.l1 + 0.4, 990], [B.chase + 0.4, 1600], [B.l2, 1640], [B.l3 - 0.4, 1420]]);
  const pageUp = ramp(t, B.l1 + 0.4, 1.0);
  const spin = t * 0.5 + ramp(t, B.chase, 0.6) * t * 0.6;
  const panel = (at: number) => backOut(lin(t, at, 0.4));
  // posters spray out of the press and tile the street walls in a wave
  const tiles: [number, number][] = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { tiles.push([-560 + c * 250, 700 + r * 330]); tiles.push([1390 + c * 250, 700 + r * 330]); }
  const MIRROR = 9; // tile index that is a mirror (right wall)
  return (
    <g>
      <Cam x={cx} y={cy} z={z}>
        {/* night harbour street around everything */}
        <rect x={-1400} y={-1200} width={3900} height={5200} fill="url(#nightSky)" />
        <Fog t={t} y={300} h={340} speed={16} seed="a1" />
        {/* the street (seen when the camera pulls back in l2) */}
        <rect x={-900} y={600} width={1100} height={2400} fill={C.slate} />
        <rect x={880} y={600} width={1100} height={2400} fill={C.slate} />
        {[...Array(22)].map((_, k) => <line key={k} x1={-900} y1={620 + k * 110} x2={200} y2={620 + k * 110} stroke={C.ink} strokeOpacity={0.25} strokeWidth={3} />)}
        {[...Array(22)].map((_, k) => <line key={`b${k}`} x1={880} y1={620 + k * 110} x2={1980} y2={620 + k * 110} stroke={C.ink} strokeOpacity={0.25} strokeWidth={3} />)}
        <rect x={200} y={1250} width={680} height={900} fill={C.deep} />
        <rect x={250} y={1300} width={580} height={620} fill={C.lamp} opacity={0.18} />
        <text x={540} y={1280} textAnchor="middle" fontFamily={FONT.plaque} fontSize={44} fill={C.newsprint}>THE DAILY WIRE</text>
        <g transform="translate(540,1640)"><Press t={t} spin={spin} /></g>
        {/* tiles */}
        {tiles.map(([x, y], k) => {
          const at = B.descr + 0.3 + (Math.abs(x - 540) / 1500 + (y - 700) / 2000) * 2.2;
          const kk = backOut(lin(t, at, 0.35));
          if (kk <= 0) return null;
          // flight from the press mouth to the tile
          const fx = mix(540, x + 100, sm(lin(t, at - 0.45, 0.45))), fy = mix(1720, y + 140, sm(lin(t, at - 0.45, 0.45)));
          return (
            <g key={k} transform={`translate(${fx},${fy}) scale(${0.62 * Math.min(1, kk + 0.3)})`}>
              {k === MIRROR
                ? <g><ellipse rx={150} ry={190} fill={C.fog} stroke={C.ink} strokeWidth={10} /><ellipse rx={150} ry={190} fill="none" stroke={C.newsprint} strokeWidth={4} transform="scale(0.92)" />
                  <TmpPerson who="crippenA" x={0} y={330} s={0.7} pose={{bare: true}} />
                  <TmpMoustache t={t} x={0} y={-58} s={0.48} />
                  <path d="M-90,-120 l40,-40" stroke="#fff" strokeWidth={8} opacity={0.6 + 0.4 * osc(t, 2)} /></g>
                : <Wanted t={t} seed={`t${k}`} />}
            </g>
          );
        })}
        {/* tram with a poster, kite, pigeon with a sign */}
        {(() => { const x = mix(-1500, 2600, lin(t, B.picture - 0.6, 3.2)); return (
          <g transform={`translate(${x},2380)`}>
            <Shape d={rectD(-300, -220, 600, 220)} fill={C.mist} shade />
            <rect x={-260} y={-190} width={120} height={80} fill={C.lamp} opacity={0.5} stroke={C.ink} strokeWidth={3} />
            <rect x={140} y={-190} width={120} height={80} fill={C.lamp} opacity={0.5} stroke={C.ink} strokeWidth={3} />
            <g transform="translate(0,-130) scale(0.35)"><Wanted t={t} seed="tram" /></g>
            <circle cx={-180} cy={10} r={36} fill={C.deep} stroke={C.ink} strokeWidth={4} /><circle cx={180} cy={10} r={36} fill={C.deep} stroke={C.ink} strokeWidth={4} />
            <line x1={0} y1={-220} x2={60} y2={-380} stroke={C.ink} strokeWidth={5} />
          </g>); })()}
        {(() => { const k = lin(t, B.papers, 3); const x = mix(-300, 300, k), y = mix(200, -60, k) + osc(t, 0.7) * 30; return (
          <g transform={`translate(${x},${y}) rotate(${osc(t, 0.5) * 10})`}>
            <path d={`M0,0 L${-400},${900}`} stroke={C.ink} strokeWidth={3} fill="none" opacity={0.7} />
            <g transform="scale(0.5)"><Wanted t={t} seed="kite" /></g>
            <path d={`M0,200 q30,80 -20,160 q-40,60 10,140`} stroke={C.ink} strokeWidth={4} fill="none" />
          </g>); })()}
        {(() => { const k = lin(t, B.papers + 0.6, 2.5); const x = mix(2200, 900, k), y = mix(900, 420, k) + Math.sin(t * 9) * 8; return (
          <g transform={`translate(${x},${y})`}>
            <ellipse rx={50} ry={30} fill={C.mist} stroke={C.ink} strokeWidth={4} />
            <circle cx={-48} cy={-18} r={18} fill={C.mist} stroke={C.ink} strokeWidth={4} />
            <path d={`M-5,-10 q20,${-50 - Math.sin(t * 20) * 30} 60,-30`} fill={C.slate} stroke={C.ink} strokeWidth={4} />
            <g transform="translate(0,90) scale(0.28)"><Wanted t={t} seed="pig" /></g>
            <line x1={0} y1={25} x2={0} y2={40} stroke={C.ink} strokeWidth={3} />
          </g>); })()}
        {/* the Daily Wire page, held up; lifts away during the title */}
        <g transform={`translate(0,${-pageUp * 1700}) rotate(${pageUp * -12} 540 900)`}>
          <g transform={`skewY(${osc(t, 0.6) * 0.8})`}>
            <Shape d={rectD(140, PAGE_Y, 800, 720)} fill={C.newsprint} sw={4} />
            <text x={540} y={PAGE_Y + 62} textAnchor="middle" fontFamily={FONT.plaque} fontSize={60} fill={C.ink}>The Daily Wire</text>
            <line x1={170} y1={PAGE_Y + 80} x2={910} y2={PAGE_Y + 80} stroke={C.ink} strokeWidth={3} />
            {(() => { const flip = lin(t, 0.9, 0.5); const d = flip < 0.5 ? '31 July 1910' : '16 July 1910'; return (
              <text x={540} y={PAGE_Y + 106} textAnchor="middle" fontFamily={FONT.period} fontSize={24} fill={C.ink} transform={`translate(540,${PAGE_Y + 98}) scale(1,${Math.abs(Math.cos(flip * Math.PI))}) translate(-540,${-PAGE_Y - 98})`}>{d}</text>); })()}
            {/* engraving: the far porthole on the night sea, the Spark at its rim (part 1's last frame) */}
            <g>
              <rect x={180} y={PAGE_Y + 120} width={720} height={300} fill={C.deep} />
              {[0, 1, 2].map((k) => <path key={k} d={`M180,${PAGE_Y + 330 + k * 30} ${[...Array(10)].map((_, q) => `q36,${-12 + osc(t, 0.3, k * 0.2) * 4} 72,0`).join(' ')}`} stroke={C.slate} strokeWidth={4} fill="none" />)}
              <circle cx={540} cy={PAGE_Y + 230} r={64} fill={C.lamp} opacity={0.75} stroke={C.ink} strokeWidth={10} />
              <circle cx={540} cy={PAGE_Y + 230} r={64} fill="url(#htf)" />
              <SparkDot t={t} x={540 + Math.cos(t * 1.4) * 64} y={PAGE_Y + 230 + Math.sin(t * 1.4) * 64} s={0.45} seed="ph" />
              <rect x={180} y={PAGE_Y + 120} width={720} height={300} fill="none" stroke={C.ink} strokeWidth={4} />
            </g>
            <g transform={`translate(170,${PAGE_Y + 450}) scale(${panel(B.recap + 0.5)})`}><PanelSteps t={t} /></g>
            <g transform={`translate(420,${PAGE_Y + 450}) scale(${panel(B.remains - 0.4)})`}><PanelLamps t={t} /></g>
            <g transform={`translate(670,${PAGE_Y + 450}) scale(${panel(B.runaway - 0.7)})`}><PanelOval t={t} /></g>
          </g>
          {/* two hands hold the page */}
          <ellipse cx={150} cy={1000 + osc(t, 0.6) * 4} rx={34} ry={46} fill={C.skin} stroke={C.ink} strokeWidth={4} />
          <ellipse cx={930} cy={1000 - osc(t, 0.6) * 4} rx={34} ry={46} fill={C.skin} stroke={C.ink} strokeWidth={4} />
        </g>
        <Gulls t={t} n={3} seed="ag" y0={-200} y1={300} />
        <Fog t={t} y={1900} h={400} speed={-10} seed="a2" op={0.6} />
      </Cam>
    </g>
  );
};
// carrier: the mirror tile (right wall, index 9 => c=1? computed at the stage end camera)
export const A_OUT = (() => {
  const z = 0.46, cx = 600, cy = 1420;
  // tile 9: r=4, c=1 => right wall x = 1390+250 = 1640, y = 700+4*330 = 2020; centre +100,+140
  const wx = 1640 + 100, wy = 2020 + 140;
  return {x: 540 + (wx - cx) * z, y: 960 + (wy - cy) * z, r: 150 * 0.62 * z};
})();

// ---------- Stage B: two mirrors on one wall (shave, then snip) ----------
const M1 = 540, M2 = 1700, MY = 760;
const MirrorFrame: React.FC<{x: number; children: React.ReactNode; id: string}> = ({x, children, id}) => (
  <g>
    <clipPath id={id}><ellipse cx={x} cy={MY} rx={380} ry={470} /></clipPath>
    <ellipse cx={x} cy={MY} rx={380} ry={470} fill={C.fog} />
    <g clipPath={`url(#${id})`}>{children}</g>
    <ellipse cx={x} cy={MY} rx={380} ry={470} fill="none" stroke={C.ink} strokeWidth={30} />
    <ellipse cx={x} cy={MY} rx={392} ry={482} fill="none" stroke={C.slate} strokeWidth={8} />
    <path d={`M${x - 250},${MY - 300} l90,-90 M${x - 220},${MY - 200} l40,-40`} stroke="#fff" strokeWidth={10} opacity={0.5} strokeLinecap="round" />
  </g>
);
export const StageB: React.FC<{t: number}> = ({t}) => {
  const cx = key(t, [[B.l3 - 0.3, M1], [B.ethel - 0.5, M1 + 60], [B.ethel + 0.2, M2]]);
  const z = key(t, [[B.l3 - 0.3, 1.0], [B.ethel - 0.5, 1.08], [B.ethel + 0.2, 1.0], [B.l5, 1.08]]);
  // shave
  const foam = 1 - lin(t, B.l3 + 0.2, (B.mustache - B.l3) * 0.9);
  const razorK = lin(t, B.l3, B.mustache - B.l3 + 0.3);
  const flyK = lin(t, B.mustache + 0.15, 1.6);
  const gl = lin(t, B.glasses + 0.1, 1.2);
  const lipX = M1, lipY = MY + 55;
  const bird = (k: number) => [mix(lipX, 1250, sm(k)) + Math.sin(k * 9) * 30, mix(lipY, 330, sm(k)) + Math.sin(k * 14) * 20] as const;
  const [bx, by] = flyK > 0 ? bird(flyK) : [lipX, lipY];
  // bird crosses the second mirror during l4 (in the window behind Ethel)
  const pass = lin(t, B.ethel + 0.3, 2.2);
  // snip
  const snip = lin(t, B.hair - 0.1, 0.8);
  const suit = ramp(t, B.boy - 0.2, 0.35);
  const cap = backOut(lin(t, B.boy + 0.25, 0.35));
  return (
    <Cam x={cx} y={960} z={z}>
      {/* tiled wall, a window with a flapping curtain between the mirrors */}
      <rect x={-600} y={-300} width={3000} height={2600} fill={C.slate} />
      {[...Array(30)].map((_, k) => <line key={k} x1={-600 + k * 100} y1={-300} x2={-600 + k * 100} y2={2300} stroke={C.ink} strokeOpacity={0.18} strokeWidth={3} />)}
      {[...Array(26)].map((_, k) => <line key={`h${k}`} x1={-600} y1={-300 + k * 100} x2={2400} y2={-300 + k * 100} stroke={C.ink} strokeOpacity={0.18} strokeWidth={3} />)}
      <g>
        <rect x={1000} y={180} width={260} height={360} fill="url(#daySky)" stroke={C.ink} strokeWidth={10} />
        <Gulls t={t} n={2} seed="bw" y0={220} y1={420} s={0.6} />
        <line x1={1130} y1={180} x2={1130} y2={540} stroke={C.ink} strokeWidth={6} />
        <path d={`M1000,170 q${40 + osc(t, 0.9) * 25},180 ${10 + osc(t, 0.9) * 12},380 l-30,0 l0,-380 Z`} fill={C.newsprint} stroke={C.ink} strokeWidth={4} />
        <path d={`M1260,170 q${-40 - osc(t, 0.8, 0.3) * 25},180 ${-10 - osc(t, 0.8, 0.3) * 12},380 l30,0 l0,-380 Z`} fill={C.newsprint} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* shelf with drawers under both mirrors */}
      {[M1, M2].map((x, k) => <g key={k}><Shape d={rectD(x - 330, 1250, 660, 40)} fill={C.newsprint} /><Shape d={rectD(x - 260, 1290, 520, 120)} fill={C.mist} shade />
        <Shape d={rectD(x - 90 + (k === 0 ? 60 * (1 - ramp(t, B.glasses + 1.0, 0.25)) * Math.min(1, gl * 3) : 0), 1310, 180, 80)} fill={C.newsprint} />
        <circle cx={x + (k === 0 ? 60 * (1 - ramp(t, B.glasses + 1.0, 0.25)) * Math.min(1, gl * 3) : 0)} cy={1350} r={9} fill={C.deep} /></g>)}
      {/* a mug with steam on shelf 1, comb + scissors tray on shelf 2 */}
      <g transform={`translate(${M1 + 230},1250)`}><Shape d="M-30,-70 h60 v70 h-60 Z" fill={C.newsprint} /><path d={`M-10,-80 q${osc(t, 0.7) * 14},-30 0,-60 q${-osc(t, 0.7) * 14},-30 0,-60`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.6} /></g>
      <MirrorFrame x={M1} id="m1">
        <rect x={M1 - 400} y={MY - 500} width={800} height={1000} fill={C.mist} />
        <TmpPerson who={flyK > 0.05 ? 'crippenB' : 'crippenA'} x={M1} y={MY + 1250} s={2.35} pose={{bare: true, glasses: false, hat: false, mouth: flyK > 0 && flyK < 0.6 ? 'o' : 'flat', brow: flyK > 0 && flyK < 0.6 ? 1 : 0, look: flyK > 0 ? 0.7 : 0}} />
        {/* foam on the cheeks */}
        {foam > 0 && [[-110, 40], [-80, 95], [-120, 120], [100, 40], [80, 95], [120, 120], [-30, 150], [30, 150]].map(([dx, dy], k) => (
          <circle key={k} cx={M1 + dx} cy={MY + dy - 30} r={34 * (k < 4 ? foam : Math.min(1, foam * 1.6))} fill="#fff" stroke={C.ink} strokeWidth={2} opacity={0.95} />))}
        {/* glasses: lift off, fold, walk down to the drawer */}
        {gl < 1 && (() => {
          const gx = mix(M1, M1 + 60, sm(gl)), gy = mix(MY - 12, 1330, sm(Math.max(0, gl - 0.25) / 0.75));
          const fold = sm(Math.min(1, gl * 3));
          return <g transform={`translate(${gx},${gy})`} fill="none" stroke={C.newsprint} strokeWidth={8}>
            <circle cx={-80 * (1 - fold * 0.6)} cy={0} r={52} /><circle cx={80 * (1 - fold * 0.6)} cy={0} r={52} />
            <line x1={-28 * (1 - fold)} y1={0} x2={28 * (1 - fold)} y2={0} />
            {gl > 0.25 && <g stroke={C.ink} strokeWidth={6}><line x1={-20} y1={50} x2={-20 + Math.sin(t * 16) * 14} y2={86} /><line x1={20} y1={50} x2={20 - Math.sin(t * 16) * 14} y2={86} /></g>}
          </g>;
        })()}
        {/* razor sweeping the cheek */}
        {razorK > 0 && razorK < 1 && <g transform={`translate(${M1 - 150 + Math.sin(razorK * 10) * 60},${MY + 60 + razorK * 80}) rotate(${-30 + Math.sin(razorK * 10) * 20})`}>
          <rect x={-10} y={0} width={20} height={150} fill={C.deep} stroke={C.ink} strokeWidth={4} rx={6} />
          <rect x={-14} y={-90} width={28} height={92} fill="#fff" stroke={C.ink} strokeWidth={4} />
          <ellipse cx={0} cy={150} rx={40} ry={30} fill={C.skin} stroke={C.ink} strokeWidth={4} />
        </g>}
      </MirrorFrame>
      {/* the Moustache: on the lip, panics, flies off through the window (it is a real-world thing, not in the glass) */}
      {flyK < 1 && <TmpMoustache t={t} x={bx} y={by} s={1.75 * (1 - flyK * 0.55)} flying={flyK > 0} rot={flyK > 0 ? Math.sin(t * 12) * 12 : osc(t, 1.2) * 3} />}
      {pass > 0 && pass < 1 && <TmpMoustache t={t} x={mix(1250, 2300, pass)} y={300 + Math.sin(pass * 12) * 40} s={0.8} flying />}
      <MirrorFrame x={M2} id="m2">
        <rect x={M2 - 400} y={MY - 500} width={800} height={1000} fill={C.fog} />
        <TmpPerson who={suit > 0.5 ? 'ethelB' : 'ethelA'} x={M2} y={MY + 1260} s={2.45} pose={{hairLen: snip > 0.5 ? 0 : 1, hat: suit > 0.5 && cap > 0, mouth: t > B.boy + 0.6 ? 'smile' : 'flat', brow: t > B.boy + 0.6 ? 0.6 : 0, capSlip: suit > 0.5 ? (1 - cap) * -2 : 0, jacketPuff: suit > 0.5 ? 0.3 : 0}} />
        {/* locks become ribbons and float off */}
        {snip > 0 && [...Array(5)].map((_, k) => {
          const s = lin(t, B.hair + k * 0.12, 2.2);
          if (s <= 0 || s >= 1) return null;
          const x = M2 - 140 + k * 70 + Math.sin(s * 6 + k) * 40, y = MY - 220 - s * 500;
          return <path key={k} d={`M${x},${y} q20,30 0,60 q-20,30 0,60`} stroke={C.deep} strokeWidth={14} fill="none" strokeLinecap="round" opacity={1 - s} />;
        })}
        {/* scissors */}
        {snip > 0 && snip < 1 && <g transform={`translate(${M2 - 200 + snip * 300},${MY - 220})`}>
          {[1, -1].map((d) => <g key={d} transform={`rotate(${d * (14 + Math.sin(t * 30) * 12)})`}><path d="M0,0 L120,-6 L120,6 Z" fill="#fff" stroke={C.ink} strokeWidth={4} /><circle cx={-30} cy={0} r={18} fill="none" stroke={C.ink} strokeWidth={8} /></g>)}
        </g>}
      </MirrorFrame>
    </Cam>
  );
};
export const B_OUT = {x: 540, y: 960 + (MY - 960) * 1.08, r: 300};

// Stages C–F: Antwerp dock and the Montrose; the captain's telescope; the deck (clues, the hunch, the wireless mast);
// the wireless room.
import React from 'react';
import B from './beats.json';
import {C, FONT, Shape, Fog, Gulls, Ring, SparkDot, Trail, ramp, lin, osc, mix, rnd, rectD, ellD, backOut, sm} from './look';
import {TmpPerson, TmpMoustache, TmpBulb, Strollers, Pennant} from './cast';
import {Cam, key, Wanted} from './scenesA';
import {Sea as KSea, Montrose as KMontrose, Laurentic as KLaurentic, WirelessRoom, ROOM, MontroseDeck} from './series/sets';
import {Telescope as KTelescope} from './series/props';

// ---------- shared part-local pieces (kit Sea / Montrose replace these) ----------
export const Waves: React.FC<{t: number; y: number; x0?: number; w?: number; col?: string; amp?: number; sp?: number; seed?: string; step?: number}> = ({t, y, x0 = -1200, w = 3600, col = C.slate, amp = 14, sp = 30, seed = 'wv', step = 120}) => {
  const off = ((t * sp + rnd(seed) * step) % step);
  let d = `M${x0 - step + off},${y}`;
  for (let x = x0 - step + off; x < x0 + w; x += step) d += ` q${step / 4},${-amp} ${step / 2},0 q${step / 4},${amp} ${step / 2},0`;
  d += ` V${y + 3000} H${x0 - step} Z`;
  return <path d={d} fill={col} stroke={C.ink} strokeWidth={3} />;
};
// The sea: the kit's Sea (three wave layers + foam), tiled sideways to cover [x0, x0 + w]; horizon at y. No sky.
export const SeaBand: React.FC<{t: number; y: number; x0?: number; w?: number; tone?: 'day' | 'dawn' | 'night'}> = ({t, y, x0 = -1200, w = 3600, tone = 'day'}) => {
  const fr = Math.round(t * 30);
  const k0 = Math.floor((x0 + 600) / 2400), k1 = Math.ceil((x0 + w + 600) / 2400);
  const tiles = [];
  for (let k = k0; k < k1; k++) tiles.push(<g key={k} transform={`translate(${k * 2400},0)`}><KSea fr={fr} sky={tone} horizon={y} skyOn={false} /></g>);
  return <g>{tiles}</g>;
};
// Liners: the kit's Montrose / Laurentic. Our call sites use origin = bow tip at the waterline, length 1600 at s=1.
export const Liner: React.FC<{t: number; s?: number; name: string; funnelTop?: boolean; flip?: boolean; lights?: boolean; nameX?: number}> = ({t, s = 1, name, flip, lights = false}) => {
  const fr = Math.round(t * 30);
  const facing = (flip ? -1 : 1) as 1 | -1;
  const x = -800 * s * facing;
  return name === 'MONTROSE'
    ? <KMontrose fr={fr} x={x} y={0} scale={1.6 * s} facing={facing} lit={lights} />
    : <KLaurentic fr={fr} x={x} y={0} scale={1.45 * s} facing={facing} />;
};

// ---------- Stage C: Antwerp dock, the passenger list, the gangway, crane up the hull ----------
export const StageC: React.FC<{t: number}> = ({t}) => {
  const a = B.l5 - 0.3, e = B.l6 - 0.3;
  const cy = key(t, [[a, 1150], [B.bigship, 1100], [e, 280]]);
  const z = key(t, [[a, 1.0], [B.bigship, 0.9], [e - 0.4, 0.62], [e, 0.66]]);
  const cx = key(t, [[a, 520], [B.bigship, 600], [e, 760]]);
  const w1 = lin(t, B.robinson - 0.2, 1.2), w2 = lin(t, B.son - 0.1, 1.1);
  const L1 = 'John Robinson, 55, merchant', L2 = 'John C. Robinson, 16, student';
  const walk = lin(t, B.bigship - 0.6, 2.4);
  const pen = w2 > 0 ? [180 + w2 * 380, 1300] : [180 + w1 * 380, 1250];
  const mous = ramp(t, B.canada - 0.4, 0.8);
  return (
    <Cam x={cx} y={cy} z={z}>
      <rect x={-1500} y={-1600} width={4200} height={4400} fill="url(#daySky)" />
      <Fog t={t} y={-500} h={400} speed={12} seed="c1" />
      {/* far Antwerp skyline */}
      <g opacity={0.6}>{[...Array(9)].map((_, k) => <rect key={k} x={-1300 + k * 180} y={560 - (rnd(`sk${k}`) * 260)} width={140} height={600} fill={C.mist} />)}
        <path d="M-700,500 l40,-260 l40,260 Z" fill={C.mist} /></g>
      <SeaBand t={t} y={1000} x0={-1500} w={4200} />
      {/* the Montrose, bow right; waterline y 1060 */}
      <g transform="translate(2050,1060)"><Liner t={t} name="MONTROSE" /></g>
      {/* quay */}
      <Shape d={rectD(-1500, 1060, 1900, 900)} fill={C.slate} shade />
      <rect x={-1500} y={1060} width={1900} height={24} fill={C.deep} />
      {/* gangway from the quay up to the deck */}
      <path d="M260,1060 L760,800" stroke={C.ink} strokeWidth={14} />
      <path d="M260,1010 L760,750" stroke={C.ink} strokeWidth={5} />
      {[...Array(8)].map((_, k) => <line key={k} x1={260 + k * 62} y1={1060 - k * 32} x2={260 + k * 62} y2={1010 - k * 32} stroke={C.ink} strokeWidth={4} />)}
      {/* board */}
      <g transform="translate(-160,880)"><Shape d={rectD(-150, -60, 300, 110)} fill={C.newsprint} /><line x1={0} y1={50} x2={0} y2={180} stroke={C.ink} strokeWidth={8} />
        <text x={0} y={-12} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={34} fill={C.ink}>ANTWERP</text>
        <text x={0} y={32} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={30} fill={C.ink}>→ CANADA</text></g>
      {/* crane arm swinging cargo */}
      <g transform={`translate(-700,1060) rotate(${osc(t, 0.12) * 8})`}><line x1={0} y1={0} x2={0} y2={-700} stroke={C.ink} strokeWidth={14} /><line x1={0} y1={-700} x2={420} y2={-600} stroke={C.ink} strokeWidth={10} />
        <line x1={420} y1={-600} x2={420} y2={-380 + osc(t, 0.2) * 40} stroke={C.ink} strokeWidth={3} /><Shape d={rectD(370, -380 + osc(t, 0.2) * 40, 100, 70)} fill={C.mist} /></g>
      <Strollers t={t} n={6} x0={-1300} x1={250} y={1150} s={0.3} seed="cq" />
      <Pennant t={t} x={700} y={300} s={1.2} seed={1} /><Pennant t={t} x={1850} y={300} s={1.2} seed={2} color={C.newsprint} />
      {/* passengers on the quay */}
      <TmpPerson who="parasol" x={-420 + osc(t, 0.1) * 30} y={1200} s={0.32} pose={{legs: t * 5}} />
      <TmpPerson who="boater" x={-250} y={1215} s={0.34} pose={{armR: 60 + osc(t, 1.4) * 40}} />
      {/* the pair walking up the gangway */}
      {(() => { const k = walk; const x = mix(80, 700, k), y = k < 0.29 ? 1060 : mix(1060, 830, (k - 0.29) / 0.71); return (
        <g opacity={k >= 1 ? 0 : 1}>
          <TmpPerson who="crippenB" x={x} y={y} s={0.3} pose={{legs: t * 8, armR: 30}} />
          <TmpPerson who="ethelB" x={x - 60} y={y + 30} s={0.3} pose={{legs: t * 8 + 1, armL: 30}} />
        </g>); })()}
      {/* foreground quay life: porters with trunks, travellers walking (near the lens) */}
      <Strollers t={t} n={4} x0={-1300} x1={1100} y={1700} s={0.75} seed="cqf" kinds={['boater', 'parasol', 'sailor', 'steward']} />
      {[0, 1].map((k) => { const x = ((t * (70 + k * 30) + k * 900) % 2600) - 1400; return <g key={k} transform={`translate(${x},${1560 + k * 60})`}><Shape d={rectD(-70, -90, 140, 90)} fill={C.lamp} shade /><Shape d={rectD(-80, 0, 160, 16)} fill={C.deep} /><circle cx={-50} cy={24} r={16} fill={C.deep} stroke={C.ink} strokeWidth={3} transform={`rotate(${t * 300} -50 24)`} /><circle cx={50} cy={24} r={16} fill={C.deep} stroke={C.ink} strokeWidth={3} /></g>; })}
      {/* passenger list on the clerk's desk in the foreground */}
      <g>
        <Shape d={rectD(120, 1170, 560, 200)} fill={C.deep} />
        <g transform="rotate(-3 400 1260)"><Shape d={rectD(150, 1150, 500, 200)} fill={C.newsprint} />
          <text x={400} y={1190} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={26} fill={C.ink}>PASSENGER LIST · MONTROSE</text>
          <line x1={170} y1={1200} x2={630} y2={1200} stroke={C.ink} strokeWidth={2} />
          <text x={170} y={1255} fontFamily={FONT.period} fontStyle="italic" fontSize={30} fill={C.ink}>{L1.slice(0, Math.floor(w1 * L1.length))}</text>
          <text x={170} y={1305} fontFamily={FONT.period} fontStyle="italic" fontSize={30} fill={C.ink}>{L2.slice(0, Math.floor(w2 * L2.length))}</text>
        </g>
        {w1 > 0 && w2 < 1 && <g transform={`translate(${pen[0]},${pen[1] - 20 + Math.sin(t * 30) * 5}) rotate(30)`}><rect x={-6} y={-110} width={12} height={110} fill={C.deep} stroke={C.ink} strokeWidth={3} /><path d="M-6,0 L0,18 L6,0 Z" fill={C.ink} /></g>}
      </g>
      {/* the Moustache flies up and perches on the funnel */}
      {(() => { const k = lin(t, B.robinson, B.canada - B.robinson); const x = mix(-200, 1310, sm(k)), y = mix(600, 482, sm(k)) - Math.sin(k * Math.PI) * 300;
        return <TmpMoustache t={t} x={x} y={y + mous * 0} s={0.9} flying={k < 1 || osc(t, 0.6) > 0.7} />; })()}
      {/* the captain at the top of the bridge, telescope glinting */}
      <TmpPerson who="kendall" x={1560} y={680} s={0.28} pose={{armR: 95}} />
      <circle cx={1608} cy={548} r={9} fill={C.newsprint} stroke={C.ink} strokeWidth={3} />
      <Gulls t={t} n={7} seed="cg" y0={-300} y1={700} />
      <Strollers t={t} n={3} x0={-200} x1={1500} y={1150} s={0.22} seed="cq2" kinds={['steward', 'sailor', 'boater']} />
      <Fog t={t} y={700} h={300} speed={-9} seed="c2" op={0.5} />
    </Cam>
  );
};
export const C_OUT = (() => { const z = 0.66, cx = 760, cy = 280; return {x: 540 + (1608 - cx) * z, y: 960 + (548 - cy) * z, r: 30}; })();

// ---------- Stage D: the captain on the bridge; the telescope view sweeps the deck ----------
const DECK_PEOPLE = [
  {who: 'parasol' as const, x: 300}, {who: 'boater' as const, x: 700}, {who: 'child' as const, x: 1050}, {who: 'steward' as const, x: 1400},
];
const PAIR_X = 1900;
const DeckWorld: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect x={-400} y={-200} width={3200} height={900} fill="url(#daySky)" />
    <SeaBand t={t} y={520} x0={-400} w={3200} />
    <Shape d={rectD(-400, 700, 3200, 400)} fill={C.newsprint} />
    {[...Array(40)].map((_, k) => <line key={k} x1={-400 + k * 80} y1={700} x2={-400 + k * 80} y2={1100} stroke={C.ink} strokeOpacity={0.15} strokeWidth={3} />)}
    {/* rail */}
    <line x1={-400} y1={560} x2={2800} y2={560} stroke={C.ink} strokeWidth={10} />
    <line x1={-400} y1={640} x2={2800} y2={640} stroke={C.ink} strokeWidth={6} />
    {[...Array(30)].map((_, k) => <line key={k} x1={-400 + k * 110} y1={560} x2={-400 + k * 110} y2={700} stroke={C.ink} strokeWidth={6} />)}
    <Gulls t={t} n={3} seed="dg" y0={0} y1={300} />
    {DECK_PEOPLE.map((p, k) => (
      <g key={k}>
        <TmpPerson who={p.who} x={p.x + osc(t, 0.2, k * 0.3) * 20} y={1020} s={0.7} pose={{armR: p.who === 'steward' ? 90 : 10 + osc(t, 0.8, k * 0.2) * 20, legs: p.who === 'child' ? t * 6 : undefined, mouth: 'smile'}} />
        {p.who === 'child' && <circle cx={p.x + 130 + osc(t, 0.2, k * 0.3) * 20 + Math.sin(t * 6) * 10} cy={930} r={70} fill="none" stroke={C.ink} strokeWidth={8} transform={`rotate(${t * 200} ${p.x + 130} 930)`} strokeDasharray="40 10" />}
        {p.who === 'parasol' && <path d={`M${p.x + 60},560 q90,-80 180,0 Z M${p.x + 150},500 V760`} fill={C.cora === '' ? '' : C.newsprint} stroke={C.ink} strokeWidth={5} />}
        {p.who === 'steward' && <rect x={p.x + 70} y={690 + osc(t, 1.2) * 6} width={110} height={12} fill={C.slate} stroke={C.ink} strokeWidth={3} />}
      </g>
    ))}
    {/* the pair at the rail, holding hands */}
    <TmpPerson who="crippenB" x={PAIR_X} y={1030} s={0.78} pose={{armL: 40, look: -0.5}} />
    <TmpPerson who="ethelB" x={PAIR_X - 170} y={1040} s={0.78} pose={{armR: 40, look: 0.5}} />
  </g>
);
export const StageD: React.FC<{t: number}> = ({t}) => {
  const a = B.l6 - 0.3, e = B.l7 - 0.3;
  const raise = ramp(t, B.watched - 0.3, 0.5);
  const viewK = ramp(t, B.watched + 0.1, 0.4);
  const sweep = key(t, [[B.watched + 0.2, 200], [e - 0.5, PAIR_X - 80]]);
  const z = key(t, [[a, 1.0], [e, 1.06]]);
  return (
    <g>
      <Cam x={540} y={960 + (1 - raise) * 40} z={z}>
        <rect x={-200} y={-200} width={1500} height={2400} fill="url(#daySky)" />
        <Fog t={t} y={200} h={300} speed={10} seed="d1" />
        <SeaBand t={t} y={1100} x0={-300} w={1700} />
        <Gulls t={t} n={6} seed="dg2" y0={250} y1={900} s={1.6} />
        <Strollers t={t} n={3} x0={-200} x1={1300} y={1900} s={0.75} seed="dfg" kinds={['steward', 'sailor', 'boater']} />
        <Shape d={rectD(-300, 1150, 1700, 60)} fill={C.slate} />
        <Strollers t={t} n={5} x0={-100} x1={1200} y={1180} s={0.3} seed="dl" />
        <Pennant t={t} x={1000} y={900} s={1.4} seed={3} />
        {[0, 1, 2, 3].map((k) => { const ph = (t * 0.35 + k / 4) % 1; return <circle key={k} cx={1300 - ph * 900} cy={500 - ph * 200} r={60 + ph * 90} fill={C.fog} stroke={C.ink} strokeWidth={3} opacity={0.7 * (1 - ph)} />; })}
        {/* bridge front with the brass plate */}
        <Shape d={rectD(-100, 1180, 1300, 800)} fill={C.newsprint} shade />
        {[...Array(6)].map((_, k) => <rect key={k} x={0 + k * 190} y={1230} width={130} height={110} fill={C.mist} stroke={C.ink} strokeWidth={4} />)}
        <g transform="translate(700,1250)"><Shape d={rectD(-250, -40, 500, 80)} fill={C.lamp} sw={4} /><text x={0} y={14} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={40} fill={C.ink}>Capt. H. G. Kendall</text></g>
        {/* Kendall: half figure, raises the telescope */}
        <TmpPerson who="kendall" x={330} y={1900} s={1.35} pose={{kp: raise > 0.5 ? 'telescope' : (t < B.kendall + 0.6 ? 'stand' : 'nod'), ex: raise > 0.5 ? 'think' : 'neutral'}} />
        <path d={`M-100,700 Q${300 + osc(t, 0.4) * 60},${1000 + osc(t, 0.4) * 40} 1300,${760}`} stroke={C.ink} strokeWidth={8} fill="none" />
        {[...Array(10)].map((_, k) => { const ph = (t * 0.6 + rnd(`sp${k}`)) % 1; return <circle key={k} cx={rnd(`spx${k}`) * 1300 - 100 + ph * 80} cy={1180 - ph * 140} r={6 + rnd(`spr${k}`) * 8} fill="#fff" opacity={0.8 * (1 - ph)} />; })}
      </Cam>
      {/* the telescope view: a moving circle over the deck */}
      {viewK > 0 && (
        <g>
          <clipPath id="tel"><circle cx={600} cy={640} r={330 * viewK} /></clipPath>
          <g clipPath="url(#tel)">
            <g transform={`translate(${600 - sweep * 0.9},${640 - 860 * 0.9}) scale(0.9)`}><DeckWorld t={t} /></g>
          </g>
          <circle cx={600} cy={640} r={330 * viewK} fill="none" stroke={C.ink} strokeWidth={22} />
          <circle cx={600} cy={640} r={330 * viewK + 14} fill="none" stroke={C.lamp} strokeWidth={8} />
        </g>
      )}
    </g>
  );
};
export const D_OUT = {x: 600, y: 640, r: 330};

const RingLabel: React.FC<{t: number; at: number; x: number; y: number; text: string; go: number}> = ({t, at, x, y, text, go}) => {
  const o = Math.min(lin(t, at, 0.2), 1 - go);
  if (o <= 0) return null;
  return <g opacity={o} transform={`translate(${x},${y}) rotate(-3)`}><Shape d={rectD(-10, -34, text.length * 17 + 20, 48)} fill={C.newsprint} sw={3} /><text x={0} y={2} fontFamily={FONT.period} fontStyle="italic" fontWeight={700} fontSize={30} fill={C.ink}>{text}</text></g>;
};

// ---------- Stage E: the deck. Clues (l7), the hunch (l8), the mast and the tin cans (l9) ----------
const RX = 640; // Robinson x on the deck (world)
export const StageE: React.FC<{t: number}> = ({t}) => {
  const a = B.l7 - 0.3;
  const cx = key(t, [[a, 560], [B.l8, 560], [B.l8 + 0.6, 520], [B.l9 - 0.3, 520], [B.l9 + 0.6, 650], [B.air - 0.7, 1050], [B.air - 0.3, 1600], [B.nowires + 0.5, 1620], [B.l10 - 0.3, 1450]]);
  const cy = key(t, [[a, 1000], [B.l8, 960], [B.l8 + 0.6, 900], [B.l9 - 0.4, 820], [B.l9 + 0.6, -350], [B.air - 0.7, -200], [B.air - 0.3, 760], [B.nowires + 0.5, 800], [B.l10 - 0.3, 380]]);
  const z = key(t, [[a, 1.0], [B.l8, 1.08], [B.l8 + 0.6, 1.0], [B.l9 - 0.3, 1.0], [B.l9 + 0.6, 0.62], [B.air - 0.7, 0.62], [B.air - 0.3, 0.95], [B.nowires + 0.5, 1.0], [B.l10 - 0.3, 0.9]]);
  const puff = ramp(t, B.clothes - 0.1, 0.4) * (0.8 + 0.2 * osc(t, 1.5));
  const slip = ramp(t, B.didntfit - 0.1, 0.4);
  const squeeze = ramp(t, B.tenderly, 0.3) * (1 - ramp(t, B.l8 + 0.5, 0.3));
  const ringsGo = lin(t, B.l8 - 0.6, 0.6);
  const ringPos = (x: number, y: number) => [mix(x, 170, sm(ringsGo)), mix(y, 380, sm(ringsGo))];
  const bulbOn = ramp(t, B.couldbe - 0.1, 0.25);
  // paper beside Robinson (l8)
  const paper = ramp(t, B.l8 + 0.2, 0.5);
  const mk = lin(t, B.wondered - 0.6, 1.8); // moustache try-on
  const mx = mk < 0.45 ? mix(1000, RX + 6, sm(mk / 0.45)) : mk < 0.75 ? RX + 6 : mix(RX + 6, 1300, sm((mk - 0.75) / 0.25));
  const my = mk < 0.45 ? mix(-200, 640, sm(mk / 0.45)) : mk < 0.75 ? 640 : mix(640, 100, sm((mk - 0.75) / 0.25));
  // l9: tin cans, the snip, the spark hop
  const snipAt = B.air - 0.2;
  const cut = t > snipAt;
  const hop = lin(t, snipAt + 0.2, 0.7);
  const sparkMast = (tt: number): [number, number] => {
    // along the kit aerial (masthead 900,-360 → -200,-260 and back), then down the lead-in to the wireless room
    const k = lin(tt, B.l9 - 0.2, B.air - B.l9 - 0.3);
    if (k < 0.6) { const q = Math.sin((k / 0.6) * Math.PI); return [mix(900, 100, q), mix(-340, -280, q) + Math.sin(k * 40) * 5]; }
    const q = sm((k - 0.6) / 0.4); return [mix(900, 1450, q), mix(-360, 150, q)];
  };
  return (
    <Cam x={cx} y={cy} z={z}>
      <rect x={-1000} y={-1800} width={3200} height={2600} fill="url(#daySky)" />
      <Fog t={t} y={-700} h={400} speed={12} seed="e1" />
      <Gulls t={t} n={4} seed="eg" y0={-900} y1={300} />
      <Gulls t={t} n={5} seed="eg2" y0={100} y1={450} s={1.5} />
      <SeaBand t={t} y={460} x0={1500} w={1500} />
      {/* the kit's MontroseDeck (rail 1180–1300, floor 1300+, mast at 900 with the aerial), lifted 620 to our deck line */}
      <g transform="translate(0,-620)"><MontroseDeck fr={Math.round(t * 30)} /></g>
      {/* our deck continues to the right (same rail and planks) for the tin-can gag */}
      <rect x={1680} y={680} width={800} height={1700} fill={C.mist} />
      {[...Array(10)].map((_, k) => <line key={`xp${k}`} x1={1680 + k * 80} y1={680} x2={1640 + k * 80} y2={1700} stroke={C.slate} strokeWidth={3} opacity={0.5} />)}
      <path d="M1680,560 H2480 M1680,620 H2480 M1680,680 H2480" stroke={C.ink} strokeWidth={6} />
      {[...Array(10)].map((_, k) => <path key={`xr${k}`} d={`M${1680 + k * 80},560 V680`} stroke={C.ink} strokeWidth={5} />)}
      {/* wireless room on deck with its door sign; its lead-in wire runs up to the mast */}
      <line x1={900} y1={-360} x2={1450} y2={150} stroke={C.ink} strokeWidth={4} />
      {t > B.l9 - 0.5 && <><Trail t={t} path={sparkMast} len={0.5} /><SparkDot t={t} x={sparkMast(t)[0]} y={sparkMast(t)[1]} s={1.2} seed="em" /></>}
      <g transform="translate(1450,150)"><Shape d={rectD(-160, 0, 320, 410)} fill={C.newsprint} shade /><Shape d={rectD(-70, 150, 140, 260)} fill={C.slate} />
        <circle cx={0} cy={230} r={34} fill={C.lamp} stroke={C.ink} strokeWidth={6} />
        <g transform="translate(0,90)"><Shape d={rectD(-120, -34, 240, 60)} fill={C.lamp} sw={4} /><text x={0} y={10} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={36} fill={C.ink}>WIRELESS</text></g></g>
      <Strollers t={t} n={7} x0={-900} x1={2100} y={770} s={0.45} seed="ed" />
      <Pennant t={t} x={900} y={-360} s={1.6} seed={4} />
      {[0, 1, 2, 3].map((k) => { const ph = (t * 0.3 + k / 4) % 1; return <circle key={k} cx={1700 - ph * 1600} cy={-300 - ph * 300} r={80 + ph * 120} fill={C.fog} stroke={C.ink} strokeWidth={3} opacity={0.6 * (1 - ph)} />; })}
      {/* tin-can phones (l9): child and a sailor */}
      {(() => { const o = ramp(t, B.l9 - 0.6, 0.4); if (o <= 0) return null; const sx = 1300, cx2 = 1900; return (
        <g opacity={o}>
          <TmpPerson who="child" x={sx} y={1040} s={0.75} pose={{armR: 80, mouth: hop > 0.6 ? 'wide' : 'talk', brow: hop > 0.6 ? 1 : 0}} />
          <TmpPerson who="sailor" x={cx2} y={1040} s={0.75} flip pose={{armR: 80, mouth: 'talk', armL: cut ? 70 : 10}} />
          <Shape d={rectD(sx + 60, 820, 40, 50)} fill={C.mist} /><Shape d={rectD(cx2 - 100, 820, 40, 50)} fill={C.mist} />
          {!cut ? <path d={`M${sx + 100},845 Q${(sx + cx2) / 2},${880 + osc(t, 0.8) * 8} ${cx2 - 100},845`} stroke={C.ink} strokeWidth={3} fill="none" />
            : <><path d={`M${sx + 100},845 Q${sx + 220},${900 + lin(t, snipAt, 0.5) * 120} ${sx + 290},${960 + lin(t, snipAt, 0.5) * 80}`} stroke={C.ink} strokeWidth={3} fill="none" />
              <path d={`M${cx2 - 100},845 Q${cx2 - 220},${900 + lin(t, snipAt, 0.5) * 120} ${cx2 - 290},${960 + lin(t, snipAt, 0.5) * 80}`} stroke={C.ink} strokeWidth={3} fill="none" /></>}
          {hop > 0 && hop < 1 && <SparkDot t={t} x={mix(sx + 100, cx2 - 100, hop)} y={830 - Math.sin(hop * Math.PI) * 160} s={0.8} seed="hop" />}
          {hop > 0.3 && <g transform={`translate(${(sx + cx2) / 2 - 130},720) rotate(-4)`} opacity={lin(t, snipAt + 0.4, 0.3)}><Shape d={rectD(-10, -40, 290, 56)} fill={C.newsprint} sw={3} /><text x={0} y={2} fontFamily={FONT.period} fontStyle="italic" fontWeight={700} fontSize={38} fill={C.ink}>still talking!</text></g>}
          {hop >= 1 && [0, 1, 2].map((k) => <path key={k} d={`M${sx + 120 + k * 22},${800 - k * 6} q14,30 0,60`} stroke={C.spark} strokeWidth={5} fill="none" opacity={0.5 + 0.5 * osc(t, 2, k * 0.2)} />)}
          {/* scissors */}
          {Math.abs(t - snipAt) < 0.4 && <g transform={`translate(${(sx + cx2) / 2},860)`}>{[1, -1].map((d) => <g key={d} transform={`rotate(${d * (18 + Math.sin(t * 30) * 14)})`}><path d="M0,0 L90,-5 L90,5 Z" fill="#fff" stroke={C.ink} strokeWidth={4} /><circle cx={-24} cy={0} r={14} fill="none" stroke={C.ink} strokeWidth={6} /></g>)}</g>}
        </g>); })()}
      {/* the pair at the rail */}
      <TmpPerson who="ethelB" x={RX - 200} y={1150} s={1.05} pose={{kp: 'holdHands', capSlip: slip, hanky: slip > 0.5, ex: 'calm'}} />
      <TmpPerson who="crippenB" x={RX + 20} y={1140} s={1.1} flip pose={{kp: 'holdHands', ex: 'calm'}} />
      {squeeze > 0 && <g><circle cx={RX - 118} cy={760} r={26 + squeeze * 5} fill={C.skin} stroke={C.ink} strokeWidth={4} />{[0, 1].map((k) => <path key={k} d={`M${RX - 118 + (k ? 40 : -40)},${730} l${k ? 16 : -16},-16`} stroke={C.ink} strokeWidth={4} opacity={squeeze} />)}</g>}
      {[...Array(12)].map((_, k) => { const ph = (t * 0.5 + rnd(`es${k}`)) % 1; return <circle key={k} cx={rnd(`esx${k}`) * 2400 - 800 + ph * 60} cy={560 - ph * 160} r={6 + rnd(`esr${k}`) * 10} fill="#fff" opacity={0.85 * (1 - ph)} />; })}
      <Strollers t={t} n={2} x0={-600} x1={1800} y={1950} s={0.7} seed="efg" kinds={['steward', 'sailor']} />
      {/* the captain at the left edge; his clue rings, then the hunch */}
      <TmpPerson who="kendall" x={150} y={1260} s={1.15} pose={{kp: paper > 0 ? 'holdPaper' : 'stand', ex: bulbOn > 0 ? 'think' : 'neutral', hold: 'none'}} />
      {ringsGo < 1 && <>
        <g transform={`translate(${ringPos(RX - 230, 1060)[0] - (RX - 230)},${ringPos(RX - 230, 1060)[1] - 1060})`}><Ring t={t} at={B.clothes} cx={RX - 230} cy={1060} r={70} seed="r1" /></g>
        <g transform={`translate(${ringPos(RX - 230, 555)[0] - (RX - 230)},${ringPos(RX - 230, 555)[1] - 555})`}><Ring t={t} at={B.didntfit} cx={RX - 230} cy={555} r={80} seed="r2" /></g>
        <g transform={`translate(${ringPos(RX - 118, 760)[0] - (RX - 118)},${ringPos(RX - 118, 760)[1] - 760})`}><Ring t={t} at={B.tenderly + 0.2} cx={RX - 118} cy={760} r={66} seed="r3" /></g>
      </>}
      <RingLabel t={t} at={B.clothes + 0.15} x={RX - 470} y={1080} text="baggy suit" go={ringsGo} />
      <RingLabel t={t} at={B.didntfit + 0.15} x={RX - 500} y={470} text="cap too big" go={ringsGo} />
      <RingLabel t={t} at={B.tenderly + 0.35} x={RX - 80} y={880} text="holding hands" go={ringsGo} />
      {ringsGo > 0.9 && <TmpBulb x={170} y={380} on={0.3 + bulbOn * 0.7} s={1.1} />}
      {/* l8: the paper with the WANTED portrait held beside Robinson's face */}
      {paper > 0 && <g transform={`translate(${mix(260, 380, paper)},${560}) rotate(${-4 + osc(t, 0.7) * 2}) scale(${0.62 * paper})`}><Wanted t={t} seed="kp" /></g>}
      {mk > 0 && mk < 1 && <TmpMoustache t={t} x={mx} y={my} s={0.82} flying={mk < 0.45 || mk > 0.75} />}
      {mk > 0.45 && mk < 0.75 && <Ring t={t} at={B.wondered - 0.6 + 1.8 * 0.47} cx={RX + 6} cy={640} r={70} seed="rm" />}
    </Cam>
  );
};
export const E_OUT = (() => { const z = 0.9, cx = 1450, cy = 380; return {x: 540 + (1450 - cx) * z, y: 960 + (380 - cy) * z, r: 28}; })();

// ---------- Stage F: the kit WirelessRoom: the captain hands Hughes the note, the key taps, the tape prints ----------
export const StageF: React.FC<{t: number}> = ({t}) => {
  const fr = Math.round(t * 30);
  const a = B.l10 - 0.3, e = B.land + 0.35;
  const z = key(t, [[a, 1.0], [e, 1.14]]);
  const cx = key(t, [[a, 560], [e, 545]]), cy = key(t, [[a, 1080], [e, 1180]]);
  const note = ramp(t, B.sent - 0.3, 0.6);
  const tapStart = Math.round((B.sent + 0.45) * 30);
  const taps = [0, 5, 8, 14, 17, 20, 26, 29].map((d, i) => ({fr: tapStart + d, dur: i % 3 === 1 ? 4 : 2}));
  return (
    <Cam x={cx} y={cy} z={z}>
      <WirelessRoom fr={fr} taps={taps} tape="CRIPPEN MAY BE ON BOARD" tapeAt={tapStart + 6} />
      {/* porthole with the sea going by (part-only) */}
      <g><circle cx={860} cy={460} r={86} fill="url(#daySky)" stroke={C.lamp} strokeWidth={14} /><clipPath id="fph"><circle cx={860} cy={460} r={80} /></clipPath>
        <g clipPath="url(#fph)"><Waves t={t} y={480} x0={760} w={220} col={C.mist} amp={8} /><Gulls t={t} n={1} seed="fg" x0={780} x1={940} y0={400} y1={430} s={0.4} /></g>
        <circle cx={860} cy={460} r={94} fill="none" stroke={C.ink} strokeWidth={4} /></g>
      {/* lamp swaying with the ship */}
      <g transform={`rotate(${osc(t, 0.25) * 4} 560 0)`}><path d="M560,0 V420" stroke={C.ink} strokeWidth={5} /><Shape d="M500,420 h120 l30,60 h-180 Z" fill={C.deep} /><circle cx={560} cy={500} r={220} fill="url(#lampG)" opacity={0.45} /></g>
      {/* Hughes at the key */}
      <TmpPerson who="hughes" x={ROOM.seat[0]} y={ROOM.seat[1]} s={1.0} pose={{kp: 'seated', ex: 'serious' as never}} />
      {/* the captain hands over the note */}
      <TmpPerson who="kendall" x={mix(1080, 880, note)} y={1500} s={1.0} flip pose={{kp: note > 0.3 && t < B.land ? 'handNote' : 'stand', hold: 'none'}} />
      {note > 0 && t < B.sent + 0.7 && <g transform={`translate(${mix(840, 600, note)},${mix(1080, 1150, note)}) rotate(${-8 + note * 4})`}><Shape d={rectD(-60, -40, 120, 80)} fill={C.newsprint} sw={3} />{[0, 1, 2].map((k) => <line key={k} x1={-42} y1={-18 + k * 18} x2={36} y2={-18 + k * 18} stroke={C.ink} strokeWidth={3} />)}</g>}
      {/* the Spark leaps up out of the key's gap at "back to land" */}
      {t > B.land - 0.2 && <SparkDot t={t} x={ROOM.key[0]} y={mix(ROOM.key[1] - 60, 300, ramp(t, B.land - 0.2, 0.5))} s={1.1} />}
    </Cam>
  );
};
export const F_OUT = (() => { const z = 1.14, cx = 545, cy = 1180; return {x: 540 + (ROOM.key[0] - cx) * z, y: 960 + (420 - cy) * z, r: 60}; })();

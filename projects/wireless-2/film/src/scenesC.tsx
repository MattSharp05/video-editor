// Stages G–L: the ride to land and Scotland Yard; Dew's desk; Liverpool dock → the race-map page → the flock of papers;
// the deck chair; the race map; Father Point and the pilot.
import React from 'react';
import B from './beats.json';
import {C, FONT, Shape, Fog, Gulls, SparkDot, Trail, ramp, lin, osc, mix, rnd, rectD, ellD, backOut, sm} from './look';
import {TmpPerson, TmpMoustache} from './cast';
import {Cam, key, Wanted} from './scenesA';
import {Sea, Waves, Liner} from './scenesB';

// ---------- Stage G: the Spark rides from the ship over the sea to Liverpool, then along the wires to Scotland Yard ----------
const HUT_X = 2300, YARD_X = 300;
const TICK = 'CRIPPEN MAY BE ON BOARD · HELPER DRESSED AS BOY';
export const G_AT = B.land + 0.35, H_AT = B.l11 - 0.15;
const sparkG = (t: number): [number, number] => {
  // ship mast (x 4700, y 700) → low over the waves → hut aerial (HUT_X, 760) → wires → yard window (YARD_X+140, 980)
  const a = G_AT - 0.3, h = B.onboard - 0.4, w = B.helper + 1.0, y = H_AT - 0.2;
  if (t < h) { const k = sm(lin(t, a, h - a)); return [mix(4700, HUT_X, k), mix(700, 760, k) + Math.sin(k * Math.PI) * 220 + Math.sin(t * 8) * 10]; }
  if (t < w) return [HUT_X + osc(t, 1.5) * 6, 760 + osc(t, 2) * 4];
  const k = sm(lin(t, w, y - w));
  const x = mix(HUT_X, YARD_X + 140, k);
  return [x, 830 + Math.abs(Math.sin(k * Math.PI * 5)) * -60 + k * 150];
};
export const StageG: React.FC<{t: number}> = ({t}) => {
  const [sx, sy] = sparkG(t);
  const cx = key(t, [[G_AT, 4300], [B.onboard - 0.4, HUT_X + 60], [B.helper + 1.0, HUT_X], [H_AT, YARD_X + 160]]);
  const cy = key(t, [[G_AT, 820], [B.onboard - 0.4, 900], [H_AT, 980]]);
  const z = key(t, [[G_AT, 0.62], [B.onboard - 0.4, 1.0], [B.helper + 1.0, 0.95], [H_AT, 1.25]]);
  const n = Math.floor(lin(t, B.onboard - 0.2, 2.4) * TICK.length);
  return (
    <Cam x={cx} y={cy} z={z}>
      <rect x={-800} y={-800} width={7000} height={3200} fill="url(#daySky)" />
      <Fog t={t} y={300} h={300} speed={14} seed="g1" />
      <Gulls t={t} n={6} seed="gg" y0={300} y1={700} s={1.2} />
      <Sea t={t} y={1000} x0={2400} w={3600} />
      {/* the Montrose far out, its mast where the Spark leaps from */}
      <g transform="translate(5200,1030) scale(0.55)"><Liner t={t} name="MONTROSE" /></g>
      {/* a lighthouse on a rock on the way */}
      <g transform="translate(3500,1020)"><Shape d="M-80,0 L-40,-420 H40 L80,0 Z" fill={C.newsprint} shade /><Shape d={rectD(-55, -500, 110, 80)} fill={C.deep} />
        <path d={`M0,-460 L${-500 + osc(t, 0.4) * 300},-520 L${-500 + osc(t, 0.4) * 300},-400 Z`} fill={C.lamp} opacity={0.35} />
        <Shape d="M-200,40 Q-120,-60 0,-20 Q120,-70 220,40 Z" fill={C.slate} /></g>
      {/* the coast: Liverpool receiving hut with an aerial */}
      <Shape d="M-800,1000 H2700 Q2750,1060 2800,1200 H-800 Z" fill={C.slate} shade />
      <rect x={-800} y={1150} width={3700} height={800} fill={C.deep} />
      <g transform={`translate(${HUT_X},1000)`}>
        <line x1={0} y1={-240} x2={0} y2={-600} stroke={C.ink} strokeWidth={8} /><line x1={-120} y1={-560} x2={120} y2={-560} stroke={C.ink} strokeWidth={4} />
        <Shape d="M-260,0 V-240 L0,-330 L260,-240 V0 Z" fill={C.newsprint} shade />
        <g transform="translate(0,-280)"><Shape d={rectD(-140, -28, 280, 52)} fill={C.lamp} sw={3} /><text x={0} y={12} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={36} fill={C.ink}>LIVERPOOL</text></g>
        <rect x={-210} y={-200} width={420} height={180} fill={C.lamp} opacity={0.35} stroke={C.ink} strokeWidth={5} />
        <TmpPerson who="clerk" x={-90} y={60} s={0.38} pose={{armR: 70 + (n > 0 && n < TICK.length ? Math.sin(t * 20) * 8 : 0), look: 0.8}} />
      </g>
      {/* the ticker tape spilling out of the hut window with the message */}
      {n > 0 && (
        <g transform={`translate(${HUT_X + 120},880)`}>
          <path d={`M0,0 C120,40 160,140 ${Math.min(900, 120 + n * 20)},150`} stroke={C.newsprint} strokeWidth={46} fill="none" />
          <path d={`M0,0 C120,40 160,140 ${Math.min(900, 120 + n * 20)},150`} stroke={C.ink} strokeWidth={50} fill="none" opacity={0.15} />
        </g>
      )}
      {n > 0 && (
        <g transform={`translate(${HUT_X - 440},1100)`}>
          <Shape d={rectD(0, -40, 900, 80)} fill={C.newsprint} sw={4} />
          <text x={20} y={12} fontFamily={FONT.wire} fontWeight={700} fontSize={33} fill={C.ink}>{TICK.slice(0, Math.max(0, n - 1))}<tspan fill={C.sparkHalo}>{TICK.slice(Math.max(0, n - 1), n)}</tspan></text>
        </g>
      )}
      {/* telegraph poles and wires to London */}
      {[...Array(7)].map((_, k) => { const x = HUT_X - 300 - k * 280; return <g key={k}><line x1={x} y1={1150} x2={x} y2={800 + k * 22} stroke={C.ink} strokeWidth={10} /><line x1={x - 50} y1={810 + k * 22} x2={x + 50} y2={810 + k * 22} stroke={C.ink} strokeWidth={6} /></g>; })}
      <path d={`M${HUT_X},800 ${[...Array(7)].map((_, k) => `Q${HUT_X - 160 - k * 280},${860 + k * 22} ${HUT_X - 300 - k * 280},${810 + k * 22}`).join(' ')}`} stroke={C.ink} strokeWidth={3} fill="none" />
      {/* Scotland Yard: building with a lit window */}
      <g transform={`translate(${YARD_X},1150)`}>
        <Shape d={rectD(-300, -700, 600, 700)} fill={C.slate} shade />
        <text x={0} y={-640} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={40} fill={C.newsprint}>NEW SCOTLAND YARD</text>
        <circle cx={140} cy={-170} r={70} fill={C.lamp} stroke={C.ink} strokeWidth={10} />
        <Shape d={rectD(-210, -420, 140, 180)} fill={C.lamp} />
        <Shape d={rectD(-60, -170, 120, 170)} fill={C.deep} />
      </g>
      <Trail t={t} path={sparkG} len={0.45} />
      <SparkDot t={t} x={sx} y={sy} s={1.3} seed="gs" />
    </Cam>
  );
};
export const G_OUT = (() => { const z = 1.25, cx = YARD_X + 160, cy = 980; return {x: 540 + (YARD_X + 140 - cx) * z, y: 960 + (980 - cy) * z, r: 70 * z}; })();

// ---------- Stage H: Dew's desk: the telegram lands, he grabs his bowler (the Feather in the band) ----------
export const I_AT = B.jumped - 0.75;
export const StageH: React.FC<{t: number}> = ({t}) => {
  const land = backOut(lin(t, H_AT, 0.35));
  const grab = ramp(t, B.dew + 0.9, 0.35);
  const z = key(t, [[H_AT, 1.0], [I_AT, 1.1]]);
  return (
    <Cam x={540} y={950} z={z}>
      <rect x={-300} y={-200} width={1700} height={2400} fill={C.slate} />
      {[...Array(10)].map((_, k) => <rect key={k} x={-300 + k * 200} y={-200} width={100} height={2400} fill={C.deep} opacity={0.15} />)}
      {/* round window with the city */}
      <circle cx={820} cy={460} r={150} fill="url(#daySky)" stroke={C.ink} strokeWidth={16} />
      {[0, 1, 2, 3].map((k) => <rect key={k} x={700 + k * 60} y={430 - rnd(`hc${k}`) * 80} width={50} height={200} fill={C.mist} clipPath="" />)}
      {/* wall clock ticking fast */}
      <g transform="translate(260,420)"><circle r={90} fill={C.newsprint} stroke={C.ink} strokeWidth={8} /><line x1={0} y1={0} x2={Math.sin(t * 6) * 60} y2={-Math.cos(t * 6) * 60} stroke={C.ink} strokeWidth={6} /><line x1={0} y1={0} x2={Math.sin(t * 0.5) * 40} y2={-Math.cos(t * 0.5) * 40} stroke={C.ink} strokeWidth={8} /></g>
      {/* hat stand: the bowler with the Feather (until grabbed) */}
      <line x1={960} y1={700} x2={960} y2={1300} stroke={C.ink} strokeWidth={14} />
      {grab < 0.5 && <g transform="translate(960,690)"><path d="M-80,0 Q0,-12 80,0 L56,-6 Q60,-80 0,-80 Q-60,-80 -56,-6 Z" fill={C.deep} stroke={C.ink} strokeWidth={5} /><path d="M40,-30 q30,-60 10,-110 q-6,50 -24,108" fill={C.cora} stroke={C.ink} strokeWidth={3} /></g>}
      {/* lamp */}
      <circle cx={260} cy={940} r={240} fill="url(#lampG)" opacity={0.6} />
      <Shape d="M200,900 h120 l30,60 h-180 Z" fill={C.deep} />
      {/* desk */}
      <Shape d={rectD(40, 1080, 1000, 60)} fill={C.newsprint} />
      <Shape d={rectD(80, 1140, 60, 300)} fill={C.deep} /><Shape d={rectD(940, 1140, 60, 300)} fill={C.deep} />
      {/* Dew, standing up as he reads */}
      <TmpPerson who="dew" x={600} y={1500} s={1.05} pose={{hat: grab > 0.5, feather: true, armR: grab > 0 ? mix(60, 150, grab) : 60, armL: 70, look: -0.2, brow: 1, mouth: 'o'}} />
      {/* papers flying off the desk */}
      {[...Array(6)].map((_, k) => { const s = lin(t, B.dew + 0.9 + k * 0.05, 1.4); if (s <= 0) return null; const r = (q: string) => rnd(`hp${k}${q}`);
        return <g key={k} transform={`translate(${300 + r('x') * 500 + s * (r('d') - 0.5) * 700},${1060 - Math.sin(s * Math.PI) * 420 + s * 200}) rotate(${s * 400 * (r('r') - 0.5)})`}><Shape d={rectD(-50, -35, 100, 70)} fill={C.newsprint} sw={3} /></g>; })}
      {/* the telegram lands on the desk / in his hand */}
      <g transform={`translate(${mix(860, 470, sm(land))},${mix(700, 940, sm(land))}) rotate(${mix(40, -6, land)}) scale(${0.6 + 0.4 * land})`}>
        <Shape d={rectD(-130, -80, 260, 160)} fill={C.newsprint} sw={4} />
        <text x={0} y={-44} textAnchor="middle" fontFamily={FONT.period} fontSize={20} fill={C.ink}>WIRELESS TELEGRAM</text>
        <text x={0} y={2} textAnchor="middle" fontFamily={FONT.wire} fontWeight={700} fontSize={24} fill={C.ink}>CRIPPEN MAY BE</text>
        <text x={0} y={34} textAnchor="middle" fontFamily={FONT.wire} fontWeight={700} fontSize={24} fill={C.ink}>ON BOARD</text>
      </g>
      <text x={790} y={1220} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={36} fill={C.newsprint}>Insp. W. Dew</text>
    </Cam>
  );
};
export const H_OUT = (() => { const z = 1.1; return {x: 540 + (820 - 540) * z, y: 960 + (460 - 950) * z, r: 150 * z}; })();

// ---------- Stage I: Liverpool dock, the leap onto the Laurentic; pull back: the race-map page; the flock of papers ----------
export const J_AT = B.noidea - 0.45;
const MapPage: React.FC<{t: number; small?: boolean}> = ({t}) => (
  <g>
    <Shape d={rectD(-400, -520, 800, 1040)} fill={C.newsprint} sw={5} />
    <text x={0} y={-450} textAnchor="middle" fontFamily={FONT.plaque} fontSize={58} fill={C.ink}>The Daily Wire</text>
    <line x1={-370} y1={-425} x2={370} y2={-425} stroke={C.ink} strokeWidth={3} />
    <text x={0} y={-345} textAnchor="middle" fontFamily={FONT.plaque} fontSize={74} fill={C.ink}>THE GREAT CHASE</text>
    <rect x={-360} y={-310} width={720} height={420} fill={C.fog} stroke={C.ink} strokeWidth={4} />
    <path d="M-330,-60 C-150,-200 150,60 320,-80" stroke={C.ink} strokeWidth={4} strokeDasharray="14 10" fill="none" />
    {[...Array(4)].map((_, k) => <rect key={k} x={-360} y={150 + k * 34} width={720} height={14} fill={C.mist} />)}
  </g>
);
export const StageI: React.FC<{t: number}> = ({t}) => {
  const run = lin(t, I_AT, B.jumped - I_AT);
  const leap = lin(t, B.jumped, 0.6);
  const dx = run < 1 ? mix(-200, 360, run) : mix(360, 640, sm(leap));
  const dy = run < 1 ? 1300 : 1300 - Math.sin(leap * Math.PI) * 260 + leap * -60;
  const back = ramp(t, B.faster + 0.4, 1.3); // pull back: the scene becomes the picture on the page
  const flock = lin(t, B.everywhere - 0.1, J_AT - B.everywhere + 0.1);
  const ship = mix(0, -220, lin(t, I_AT, 3));
  const S = mix(1, 0.32, back);
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#nightSky)" />
      {/* three city skylines (seen once the page is small) */}
      {back > 0 && <g opacity={back}>
        {[['LONDON', 180, 'dome'], ['NEW YORK', 540, 'tower'], ['MONTREAL', 900, 'church']].map(([name, x, kind], k) => (
          <g key={k} transform={`translate(${x},1500)`}>
            {[...Array(5)].map((_, q) => <rect key={q} x={-160 + q * 64} y={-(120 + rnd(`cs${k}${q}`) * 200)} width={56} height={400} fill={C.mist} stroke={C.ink} strokeWidth={3} />)}
            {kind === 'dome' && <path d="M-40,-260 a40,40 0 0,1 80,0 Z" fill={C.mist} stroke={C.ink} strokeWidth={3} />}
            {kind === 'tower' && <rect x={-20} y={-420} width={40} height={200} fill={C.mist} stroke={C.ink} strokeWidth={3} />}
            {kind === 'church' && <path d="M-25,-300 l25,-80 l25,80 Z" fill={C.mist} stroke={C.ink} strokeWidth={3} />}
            {[...Array(6)].map((_, q) => <rect key={`w${q}`} x={-140 + q * 50} y={-90} width={16} height={20} fill={C.lamp} opacity={0.5 + 0.5 * osc(t, 0.7, q * 0.17 + k)} />)}
            <text x={0} y={60} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={30} fill={C.newsprint}>{name}</text>
            {/* newsboy shouting with a paper */}
            <g transform={`translate(${-60 + k * 20},-10)`}><TmpPerson who="newsboy" x={0} y={0} s={0.26} pose={{armR: 150 + osc(t, 2, k * 0.3) * 20, mouth: 'wide'}} /></g>
          </g>
        ))}
        <Fog t={t} y={1250} h={260} speed={18} seed="i3" />
      </g>}
      {/* the flock of papers */}
      {flock > 0 && [...Array(9)].map((_, k) => {
        const r = (q: string) => rnd(`fl${k}${q}`);
        const s = lin(flock, r('d') * 0.25, 0.75);
        if (s <= 0 || s >= 1) return null;
        const x = mix(540, 1300, s) + (r('x') - 0.5) * 900 * s - 300 * s, y = mix(620, 200 + r('y') * 500, sm(s));
        const fl = Math.sin(t * 9 + k) * 0.5;
        return <g key={k} transform={`translate(${x},${y}) scale(0.12)`}><g transform={`scale(1,${0.5 + fl * 0.5})`}><MapPage t={t} /></g></g>;
      })}
      {/* the page: the dock scene is its picture */}
      <g transform={`translate(540,${mix(960, 680, back)}) scale(${S}) translate(-540,-960)`}>
        <g opacity={back}><g transform="translate(540,1080) scale(1.7)"><MapPage t={t} /></g></g>
        <clipPath id="dockclip"><rect x={mix(-200, -72, back)} y={mix(-200, 547, back)} width={mix(1480, 1224, back)} height={mix(2320, 714, back)} /></clipPath>
        <g clipPath="url(#dockclip)">
          <rect x={-300} y={-300} width={1700} height={2600} fill="url(#daySky)" />
          <Fog t={t} y={300} h={300} speed={12} seed="i1" />
          <Gulls t={t} n={4} seed="ig" y0={200} y1={700} />
          <Sea t={t} y={1150} x0={-300} w={1700} />
          {/* the Laurentic pulling out, stern towards us at the left; big wake */}
          <g transform={`translate(${1700 + ship},1200) scale(0.9)`}><Liner t={t} name="" flip lights={false} /></g>
          <text x={mix(1700, 1480, lin(t, I_AT, 3)) + 30} y={1100} fontFamily={FONT.plaque} fontSize={52} fill={C.newsprint}>LAURENTIC</text>
          {[0, 1, 2].map((k) => <path key={k} d={`M${300 + ship},${1210 + k * 30} q${200 + k * 80},${-20} ${400 + k * 160},0`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.6} />)}
          {/* dock */}
          <Shape d={rectD(-300, 1300, 800, 700)} fill={C.slate} shade />
          <rect x={-300} y={1300} width={800} height={20} fill={C.deep} />
          <TmpPerson who="dew" x={dx} y={dy} s={0.6} pose={{legs: run < 1 ? t * 10 : undefined, armR: 160, armL: leap > 0 ? 60 : 20, feather: true, lean: leap > 0 ? -8 : 6, mouth: 'o'}} />
          <TmpPerson who="constable" x={-60} y={1330} s={0.5} pose={{armR: 90 + osc(t, 2) * 30, mouth: 'wide'}} />
        </g>
      </g>
    </g>
  );
};
export const I_OUT = {x: 760, y: 420, r: 60};

// ---------- Stage J: the deck chair: the doctor reads; the Moustache warns him; he swats it ----------
export const K_AT = B.l13 - 0.3;
export const StageJ: React.FC<{t: number}> = ({t}) => {
  const z = key(t, [[J_AT, 0.95], [K_AT, 1.12]]);
  const warn = lin(t, B.noidea - 0.2, B.racing - B.noidea + 0.2);
  const swat = lin(t, B.racing, 0.35);
  const away = lin(t, B.racing + 0.15, 0.9);
  const turn = lin(t, B.first - 0.1, 0.5);
  const mx = away > 0 ? mix(560, 1300, sm(away)) : 560 + Math.sin(t * 7) * 60;
  const my = away > 0 ? mix(820, 300, sm(away)) : 820 + Math.sin(t * 11) * 30;
  return (
    <Cam x={540} y={960} z={z}>
      <rect x={-300} y={-200} width={1700} height={1200} fill="url(#daySky)" />
      <Fog t={t} y={300} h={300} speed={10} seed="j1" />
      {/* the flock passing high over the ship, none landing */}
      {[...Array(6)].map((_, k) => { const s = lin(t, J_AT - 0.3 + k * 0.15, 2.4); if (s <= 0 || s >= 1) return null;
        return <g key={k} transform={`translate(${mix(-100, 1200, s)},${250 + k * 40 + Math.sin(s * 8 + k) * 30})`}><path d={`M-40,0 L0,${-20 + Math.sin(t * 9 + k) * 18} L40,0 L0,10 Z`} fill={C.newsprint} stroke={C.ink} strokeWidth={3} /></g>; })}
      <Sea t={t} y={760} x0={-300} w={1700} />
      <Gulls t={t} n={2} seed="jg" y0={500} y1={700} />
      <line x1={-300} y1={800} x2={1400} y2={800} stroke={C.ink} strokeWidth={10} />
      {[...Array(16)].map((_, k) => <line key={k} x1={-300 + k * 110} y1={800} x2={-300 + k * 110} y2={960} stroke={C.ink} strokeWidth={6} />)}
      <Shape d={rectD(-300, 960, 1700, 900)} fill={C.newsprint} />
      {/* deck chairs */}
      {[[330, 'ethelB'], [700, 'crippenB']].map(([x, who], k) => (
        <g key={k} transform={`translate(${x},1260) rotate(${osc(t, 0.4, k * 0.3) * 1.5})`}>
          <TmpPerson who={who as 'crippenB'} x={0} y={60} s={0.85} pose={{armL: 70, armR: k === 1 ? mix(70, 160, Math.sin(swat * Math.PI)) : 70, look: k === 1 && warn > 0 && swat < 1 ? -0.2 : 0.2, mouth: 'flat', brow: k === 1 && swat > 0 && swat < 1 ? -1 : 0}} />
          <path d="M-150,-200 L-110,140 M150,-200 L110,140 M-160,60 H160" stroke={C.ink} strokeWidth={10} />
          <Shape d="M-130,-60 H130 L150,140 H-150 Z" fill={C.slate} shade />
          {/* book */}
          <g transform={`translate(${k === 1 ? 30 : 0},-150)`}>
            <Shape d="M-80,-50 L0,-40 L80,-50 V40 L0,50 L-80,40 Z" fill={C.newsprint} sw={4} />
            {k === 1 && turn > 0 && turn < 1 && <path d={`M0,-40 L${80 * Math.cos(turn * Math.PI)},-50 V40 L0,50 Z`} fill="#fff" stroke={C.ink} strokeWidth={3} />}
            <line x1={0} y1={-40} x2={0} y2={50} stroke={C.ink} strokeWidth={3} />
          </g>
        </g>
      ))}
      <text x={540} y={1690} textAnchor="middle" fontFamily={FONT.period} fontStyle="italic" fontSize={34} fill={C.slate}>No newspapers on board</text>
      {warn > 0 && away < 1 && <TmpMoustache t={t} x={mx} y={my} s={0.9} flying rot={swat > 0 && swat < 1 ? 40 : 0} />}
      {swat > 0.4 && swat < 1 && <text x={600} y={760} fontFamily={FONT.plaque} fontSize={60} fill={C.ink}>swat!</text>}
    </Cam>
  );
};
export const J_OUT = (() => { const z = 1.12; return {x: 540 + (730 - 540) * z, y: 960 + (1110 - 960) * z, r: 70}; })();

// ---------- Stage K: the race map as a board game ----------
export const L_AT = B.l14 - 0.3;
const SQ: [number, number, string][] = [
  [170, 520, '20 Jul'], [300, 600, '21'], [420, 690, '22'], [520, 800, '23 Jul'], [600, 920, '24'], [660, 1050, '25'],
  [560, 1150, '26'], [430, 1210, '27'], [330, 1300, '28'], [400, 1410, '29'], [560, 1450, '30'], [760, 1400, '31 Jul'],
];
const FINISH = {x: 900, y: 1250};
const hopTo = (t: number, path: number[], at: number[]): [number, number] => {
  let k = 0; while (k < at.length - 1 && t >= at[k + 1]) k++;
  const a = path[k], b = path[Math.min(k + 1, path.length - 1)];
  const p = at[k + 1] !== undefined ? lin(t, at[k + 1] - 0.3, 0.3) : 0;
  const pa = a < 0 ? [FINISH.x, FINISH.y] : SQ[a], pb = b < 0 ? [FINISH.x, FINISH.y] : SQ[b];
  return [mix(pa[0] as number, pb[0] as number, p), mix(pa[1] as number, pb[1] as number, p) - Math.sin(p * Math.PI) * 60];
};
export const StageK: React.FC<{t: number}> = ({t}) => {
  const z = key(t, [[K_AT, 0.95], [L_AT, 1.05]]);
  const a = B.fordays;
  const mT = [a - 1, a + 0.2, a + 0.9, a + 1.7, B.raced + 0.5, B.raced + 1.2, B.raced + 1.9];
  const mo = hopTo(t, [3, 4, 5, 6, 7, 8, 9], mT);
  const lT = [a - 1, a + 0.5, a + 1.1, B.raced, B.raced + 0.5, B.raced + 1.0, B.raced + 1.6];
  const la = hopTo(t, [1, 3, 5, 7, 9, 11, -1], lT);
  const dice = lin(t, a - 0.1, 0.8);
  const day = (t - K_AT) * 1.4;
  return (
    <Cam x={540} y={980} z={z}>
      <rect x={-300} y={-200} width={1700} height={2400} fill={C.deep} />
      <Fog t={t} y={200} h={300} speed={12} seed="k1" op={0.4} />
      <g transform={`rotate(${osc(t, 0.2) * 0.6} 540 960)`}>
        <Shape d={rectD(70, 330, 940, 1220)} fill={C.newsprint} sw={5} />
        <text x={540} y={410} textAnchor="middle" fontFamily={FONT.plaque} fontSize={62} fill={C.ink}>THE GREAT CHASE</text>
        {/* wave doodles */}
        {[...Array(6)].map((_, k) => <path key={k} d={`M${150 + (k % 3) * 280 + osc(t, 0.3, k * 0.2) * 20},${560 + Math.floor(k / 3) * 500} q20,-14 40,0 q20,14 40,0 q20,-14 40,0`} stroke={C.mist} strokeWidth={5} fill="none" />)}
        <text x={130} y={480} fontFamily={FONT.period} fontWeight={700} fontSize={28} fill={C.ink}>ANTWERP · LIVERPOOL</text>
        {SQ.map(([x, y, d], k) => <g key={k}><Shape d={rectD(x - 48, y - 40, 96, 80)} fill={k % 2 ? C.fog : '#fff'} sw={3} /><text x={x} y={y + 10} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={d.length > 3 ? 22 : 30} fill={C.ink}>{d}</text></g>)}
        {/* finish: Father Point lighthouse square */}
        <g transform={`translate(${FINISH.x},${FINISH.y})`}><circle r={78} fill={C.fog} stroke={C.ink} strokeWidth={5} />
          <path d="M-16,40 L-10,-30 H10 L16,40 Z" fill="#fff" stroke={C.ink} strokeWidth={3} /><rect x={-13} y={-46} width={26} height={16} fill={C.deep} />
          <path d={`M0,-38 L${70 * Math.cos(t * 2)},${-38 + 20 * Math.sin(t * 2)}`} stroke={C.lamp} strokeWidth={10} opacity={0.6} />
          <text x={0} y={112} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={30} fill={C.ink}>FATHER POINT</text></g>
        {/* day / night dial */}
        <g transform="translate(900,520)"><circle r={60} fill={C.fog} stroke={C.ink} strokeWidth={4} />
          <g transform={`rotate(${day * 180})`}><circle cx={0} cy={-34} r={18} fill={C.lamp} stroke={C.ink} strokeWidth={3} /><path d="M-12,30 a16,16 0 1,0 20,-4 a12,12 0 1,1 -20,4 Z" fill={C.mist} stroke={C.ink} strokeWidth={3} /></g></g>
        {/* dice */}
        <g transform={`translate(${mix(200, 260, dice)},${mix(1350, 1440, dice) - Math.sin(dice * Math.PI) * 160}) rotate(${dice * 540})`}>
          <Shape d={rectD(-36, -36, 72, 72)} fill="#fff" sw={4} />
          {[[-16, -16], [16, 16], [0, 0]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={7} fill={C.ink} />)}
        </g>
        {/* tokens */}
        <g transform={`translate(${mo[0]},${mo[1] - 30})`}><Shape d="M-46,0 H46 L34,24 H-34 Z" fill={C.slate} sw={4} /><Shape d={rectD(-12, -34, 24, 34)} fill={C.fog} sw={3} />
          <text x={0} y={52} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={20} fill={C.ink}>MONTROSE</text>
          <TmpMoustache t={t} x={0} y={-44 + Math.abs(Math.sin(t * 4)) * -6} s={0.38} /></g>
        <g transform={`translate(${la[0]},${la[1] - 30})`}><Shape d="M-52,0 H52 L38,24 H-38 Z" fill={C.newsprint} sw={4} /><Shape d={rectD(-12, -34, 24, 34)} fill={C.fog} sw={3} />
          <line x1={0} y1={-34} x2={0} y2={-80} stroke={C.ink} strokeWidth={4} /><path d={`M0,-80 L${44 + osc(t, 2) * 6},-68 L0,-56 Z`} fill={C.cora} stroke={C.ink} strokeWidth={3} />
          <text x={0} y={52} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={20} fill={C.ink}>LAURENTIC</text></g>
      </g>
    </Cam>
  );
};
export const K_OUT = (() => { const z = 1.05; return {x: 540 + (FINISH.x - 540) * z, y: 960 + (FINISH.y - 980) * z, r: 78 * z}; })();

// ---------- Stage L: Father Point at dawn; the pilot boat; the ladder; the pilot who isn't ----------
export const StageL: React.FC<{t: number}> = ({t}) => {
  const boat = lin(t, B.smallboat - 0.8, B.meet + 0.9 - B.smallboat + 0.8);
  const bx = mix(950, 470, sm(boat)), by = 1210;
  const ladder = ramp(t, B.l15 - 0.4, 0.5);
  const climb = lin(t, B.pilot + 0.3, B.but - B.pilot);
  const push = ramp(t, B.but - 0.2, 1.4);
  const cx = key(t, [[L_AT, 700], [B.meet, 520], [B.l15, 380], [B.but - 0.2, 360], [B.total, 330]]);
  const cy = key(t, [[L_AT, 900], [B.l15, 960], [B.but - 0.2, 900], [B.total, 560]]);
  const z = key(t, [[L_AT, 0.8], [B.meet, 0.9], [B.l15, 1.05], [B.but - 0.2, 1.15], [B.total, 2.1]]);
  const sun = lin(t, L_AT, 8);
  const py = mix(1230, 760, sm(climb));
  const squawk = lin(t, B.climbed, 1.2);
  return (
    <Cam x={cx} y={cy} z={z}>
      <rect x={-800} y={-400} width={2800} height={2600} fill="url(#dawnSky)" />
      <circle cx={900} cy={mix(1050, 820, sun)} r={110} fill={C.lamp} />
      <circle cx={900} cy={mix(1050, 820, sun)} r={260} fill="url(#lampG)" opacity={0.6} />
      {/* low hills across the river */}
      <path d="M-800,1000 Q-300,880 200,980 Q700,900 1200,990 Q1600,930 2000,1000 V1100 H-800 Z" fill={C.fog} stroke={C.ink} strokeWidth={3} opacity={0.9} />
      <Fog t={t} y={850} h={260} speed={12} seed="l1" />
      <Gulls t={t} n={4} seed="lg" y0={300} y1={800} />
      <Sea t={t} y={1080} x0={-800} w={2800} tone="dawn" />
      {/* lighthouse + pilot station sign on the right bank */}
      <g transform="translate(1150,1120)">
        <Shape d="M-60,0 L-30,-460 H30 L60,0 Z" fill={C.newsprint} shade />
        <Shape d={rectD(-45, -540, 90, 80)} fill={C.deep} />
        <circle cx={0} cy={-500} r={20} fill={C.lamp} opacity={0.6 + 0.4 * osc(t, 0.8)} />
        <path d={`M0,-500 L${-700 * Math.cos(t * 0.9)},${-560} L${-700 * Math.cos(t * 0.9)},${-440} Z`} fill={C.lamp} opacity={0.3 * Math.abs(Math.cos(t * 0.9))} />
        <Shape d={rectD(-200, -40, 400, 60)} fill={C.slate} />
        <g transform="translate(-260,-120)"><Shape d={rectD(-140, -36, 280, 64)} fill={C.newsprint} sw={4} /><text x={0} y={12} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={34} fill={C.ink}>FATHER POINT</text></g>
      </g>
      {/* the Montrose, huge, hull at the left */}
      <g transform="translate(420,1240)"><Liner t={t} name="MONTROSE" s={1.0} /></g>
      {/* rail and the Moustache perched on it */}
      {squawk < 1 && <TmpMoustache t={t} x={squawk > 0 ? mix(250, -500, sm(squawk)) : 250} y={squawk > 0 ? mix(1000, 400, sm(squawk)) : 1000 + Math.abs(osc(t, 0.8)) * -4} s={0.7} flying={squawk > 0} />}
      {squawk > 0 && squawk < 0.6 && <text x={260} y={930} fontFamily={FONT.plaque} fontSize={46} fill={C.ink}>squawk!</text>}
      {/* rope ladder */}
      {ladder > 0 && <g>
        <line x1={300} y1={1060} x2={300 + osc(t, 0.6) * 8} y2={1060 + 200 * ladder} stroke={C.ink} strokeWidth={5} />
        <line x1={360} y1={1060} x2={360 + osc(t, 0.6) * 8} y2={1060 + 200 * ladder} stroke={C.ink} strokeWidth={5} />
        {[...Array(Math.floor(6 * ladder))].map((_, k) => <line key={k} x1={300} y1={1085 + k * 30} x2={360} y2={1085 + k * 30} stroke={C.ink} strokeWidth={5} />)}
      </g>}
      {/* the pilot boat with two crew */}
      <g transform={`translate(${bx},${by + osc(t, 0.7) * 6}) rotate(${osc(t, 0.7, 0.2) * 2})`}>
        <Shape d="M-140,-30 H140 L110,30 H-120 Z" fill={C.newsprint} sw={4} />
        <Shape d={rectD(-40, -90, 90, 60)} fill={C.slate} />
        <line x1={20} y1={-90} x2={20} y2={-130} stroke={C.ink} strokeWidth={10} />
        {[0, 1, 2].map((k) => { const ph = (t * 0.8 + k / 3) % 1; return <circle key={k} cx={20 + ph * 50} cy={-140 - ph * 80} r={10 + ph * 20} fill={C.fog} opacity={0.8 * (1 - ph)} />; })}
        <TmpPerson who="sailor" x={-90} y={-25} s={0.16} pose={{armR: 90}} />
        {climb <= 0 && <TmpPerson who="dewPilot" x={100} y={-25} s={0.2} pose={{feather: true}} />}
        {boat < 1 && <path d={`M140,20 q60,-10 120,10`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.7} />}
      </g>
      {/* the pilot climbing, his shadow on the hull wearing a bowler */}
      {climb > 0 && <g>
        <g opacity={0.35} transform={`translate(${190},${py + 10}) skewX(-12)`}>
          <TmpPerson who="dew" x={0} y={0} s={0.23} pose={{armR: 160, armL: 160}} />
        </g>
        <TmpPerson who="dewPilot" x={330} y={py + 40} s={0.23} pose={{armR: 160 - Math.sin(t * 6) * 20, armL: 150 + Math.sin(t * 6) * 20, legs: t * 4, feather: true}} />
      </g>}
      {push > 0 && <text x={180} y={py - 120} fontFamily={FONT.period} fontStyle="italic" fontSize={22} fill={C.ink} opacity={0}>.</text>}
    </Cam>
  );
};

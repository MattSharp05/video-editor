// Stages G–L: the ride to land and Scotland Yard; Dew's desk; Liverpool dock → the race-map page → the flock of papers;
// the deck chair; the race map; Father Point and the pilot.
import React from 'react';
import B from './beats.json';
import {C, FONT, Shape, Fog, Gulls, Ring, SparkDot, Trail, ramp, lin, osc, mix, rnd, rectD, ellD, backOut, sm} from './look';
import {TmpPerson, TmpMoustache, Strollers, Pennant} from './cast';
import {Cam, key, Wanted} from './scenesA';
import {SeaBand, Waves, Liner} from './scenesB';
import {ScotlandYard, YARD, MontroseDeck, DECK, RaceMap, raceSquare, FatherPoint, FATHER, PilotBoat, Montrose as KMontrose, Laurentic as KLaurentic} from './series/sets';
import {TickerTape, Telegram, RopeLadder} from './series/props';
import {DailyWire, Feather} from './series/devices';
import {HatShape} from './series/puppet';

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
  const x = mix(HUT_X, YARD_X, k);
  return [x, 830 + Math.abs(Math.sin(k * Math.PI * 5)) * -60 - k * 140];
};
export const StageG: React.FC<{t: number}> = ({t}) => {
  const [sx, sy] = sparkG(t);
  const cx = key(t, [[G_AT, 4300], [B.onboard - 0.4, HUT_X + 60], [B.helper + 1.0, HUT_X], [H_AT, YARD_X]]);
  const cy = key(t, [[G_AT, 820], [B.onboard - 0.4, 900], [H_AT, 760]]);
  const z = key(t, [[G_AT, 0.62], [B.onboard - 0.4, 1.0], [B.helper + 1.0, 0.95], [H_AT, 1.25]]);
  const n = Math.floor(lin(t, B.onboard - 0.2, 2.4) * TICK.length);
  return (
    <Cam x={cx} y={cy} z={z}>
      <rect x={-800} y={-800} width={7000} height={3200} fill="url(#daySky)" />
      <Fog t={t} y={300} h={300} speed={14} seed="g1" />
      <Gulls t={t} n={6} seed="gg" y0={300} y1={700} s={1.2} />
      <SeaBand t={t} y={1000} x0={2400} w={3600} />
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
      {/* the Liverpool ticker: the kit's TickerTape prints the message (newest letter in spark) */}
      <TickerTape fr={Math.round(t * 30)} x={HUT_X - 440} y={1100} text={TICK} at={Math.round((B.onboard - 0.2) * 30)} rate={2} len={900} />
      <Strollers t={t} n={5} x0={1500} x1={2700} y={1140} s={0.22} seed="gh" kinds={['reader', 'sailor', 'boater', 'parasol']} />
      <Pennant t={t} x={HUT_X + 120} y={760} s={1} seed={6} />
      {[0, 1, 2].map((k) => { const ph = (t * 0.4 + k / 3) % 1; return <circle key={k} cx={HUT_X - 180 + ph * 120} cy={700 - ph * 260} r={24 + ph * 40} fill={C.fog} opacity={0.7 * (1 - ph)} />; })}
      {/* telegraph poles and wires to London */}
      {[...Array(7)].map((_, k) => { const x = HUT_X - 300 - k * 280; return <g key={k}><line x1={x} y1={1150} x2={x} y2={800 + k * 22} stroke={C.ink} strokeWidth={10} /><line x1={x - 50} y1={810 + k * 22} x2={x + 50} y2={810 + k * 22} stroke={C.ink} strokeWidth={6} /></g>; })}
      <path d={`M${HUT_X},800 ${[...Array(7)].map((_, k) => `Q${HUT_X - 160 - k * 280},${860 + k * 22} ${HUT_X - 300 - k * 280},${810 + k * 22}`).join(' ')}`} stroke={C.ink} strokeWidth={3} fill="none" />
      {/* Scotland Yard: the kit's set (outside), scaled, clipped to the building (its night sky stays out) */}
      <clipPath id="yardclip"><rect x={60} y={250} width={960} height={1252} /></clipPath>
      <g transform={`translate(${YARD_X - 540 * 0.62},${1150 - 1500 * 0.62}) scale(0.62)`}><g clipPath="url(#yardclip)"><ScotlandYard fr={Math.round(t * 30)} view="outside" shutter={ramp(t, H_AT - 1.2, 0.6)} /></g></g>
      <Trail t={t} path={sparkG} len={0.45} />
      <SparkDot t={t} x={sx} y={sy} s={1.3} seed="gs" />
    </Cam>
  );
};
export const G_OUT = {x: 540, y: 960 + (1150 - 740 * 0.62 - 760) * 1.25, r: 70 * 1.25};

// ---------- Stage H: Dew's desk: the telegram lands, he grabs his bowler (the Feather in the band) ----------
export const I_AT = B.jumped - 0.75;
export const StageH: React.FC<{t: number}> = ({t}) => {
  const fr = Math.round(t * 30);
  const land = lin(t, H_AT, 0.35);
  const grab = ramp(t, B.dew + 0.9, 0.35);
  const z = key(t, [[H_AT, 1.0], [I_AT, 1.1]]);
  return (
    <Cam x={540} y={key(t, [[H_AT, 1010], [I_AT, 980]])} z={z}>
      <ScotlandYard fr={fr} view="inside" />
      {/* part-only: the wall clock ticking fast, a steaming cup, papers flying off the desk */}
      <g transform="translate(700,520)"><circle r={80} fill={C.newsprint} stroke={C.ink} strokeWidth={8} /><line x1={0} y1={0} x2={Math.sin(t * 6) * 56} y2={-Math.cos(t * 6) * 56} stroke={C.ink} strokeWidth={6} /><line x1={0} y1={0} x2={Math.sin(t * 0.5) * 36} y2={-Math.cos(t * 0.5) * 36} stroke={C.ink} strokeWidth={8} />
        <g transform={`translate(0,80) rotate(${osc(t, 1) * 20})`}><line x1={0} y1={0} x2={0} y2={120} stroke={C.ink} strokeWidth={5} /><circle cx={0} cy={130} r={18} fill={C.lamp} stroke={C.ink} strokeWidth={4} /></g></g>
      <g transform="translate(640,1250)"><Shape d="M-28,-56 h56 v56 h-56 Z" fill={C.newsprint} />{[0, 1, 2].map((k) => { const ph = (t * 0.6 + k / 3) % 1; return <circle key={k} cx={Math.sin(ph * 6 + k) * 14} cy={-66 - ph * 150} r={10 + ph * 12} fill="#fff" fillOpacity={0.3} stroke={C.ink} strokeWidth={2} opacity={1 - ph} />; })}</g>
      {/* the bowler with Cora's Feather on the hat stand, until he grabs it */}
      {grab < 0.5 && <g transform="translate(100,880)"><HatShape kind="bowler" fr={fr} feather={<Feather fr={fr} x={58} y={-2} size={0.95} state="hatband" />} /></g>}
      {/* Dew behind the desk */}
      <TmpPerson who="dew" x={540} y={1500} s={1.0} pose={{kp: grab > 0.5 ? 'liftHat' : 'readTelegram', hold: 'none', ex: 'serious'}} />
      <Shape d="M200,1250 H960 V1290 H200Z" fill={C.deep} />
      {[...Array(6)].map((_, k) => { const sp = lin(t, B.dew + 0.9 + k * 0.05, 1.4); if (sp <= 0 || sp >= 1) return null; const r = (q: string) => rnd(`hp${k}${q}`);
        return <g key={k} transform={`translate(${300 + r('x') * 500 + sp * (r('d') - 0.5) * 700},${1220 - Math.sin(sp * Math.PI) * 420 + sp * 240}) rotate(${sp * 400 * (r('r') - 0.5)})`}><Shape d={rectD(-50, -35, 100, 70)} fill={C.newsprint} sw={3} /></g>; })}
      {/* the telegram arrives through the window and lands on the desk: the kit Telegram */}
      <g transform={`translate(${mix(250, 560, sm(land))},${mix(600, 1170, sm(land))}) rotate(${mix(30, -4, land)})`}>
        <Telegram fr={fr} x={-120} y={-70} scale={0.6} text="CRIPPEN MAY BE ON BOARD" />
      </g>
    </Cam>
  );
};
export const H_OUT = (() => { const z = 1.1; return {x: 540 + (250 - 540) * z, y: 960 + (600 - 980) * z, r: 130 * z}; })();

// ---------- Stage I: Liverpool dock, the leap onto the Laurentic; pull back: the race-map page; the flock of papers ----------
export const J_AT = B.noidea - 0.45;
// The race-map front page is the kit DailyWire (headline "THE GREAT CHASE"); the dock scene is its engraving.
const P = 1224 / 580; // page scale so the engraving slot (30,270 580x330) lands on the dock clip rect
const ChasePage: React.FC<{fr: number}> = ({fr}) => <DailyWire fr={fr} x={-72 - 30 * P} y={547 - 270 * P} scale={P} date="22 July 1910" headline="THE GREAT CHASE" engraving={() => null} />;
const FlockPage: React.FC<{fr: number}> = ({fr}) => <DailyWire fr={fr} x={-320} y={-430} date="22 July 1910" headline="THE GREAT CHASE" />;
export const StageI: React.FC<{t: number}> = ({t}) => {
  const ship = mix(0, -220, lin(t, I_AT, 3));
  const run = lin(t, I_AT, B.jumped - I_AT);
  const leap = lin(t, B.jumped, 0.6);
  const dx = run < 1 ? mix(-200, 360, run) : mix(360, 700 - ship, sm(leap));
  const dy = run < 1 ? 1300 : mix(1300, 1036, sm(leap)) - Math.sin(leap * Math.PI) * 220;
  const back = ramp(t, B.faster + 0.4, 1.3); // pull back: the scene becomes the picture on the page
  const flock = lin(t, B.everywhere - 0.1, J_AT - B.everywhere + 0.1);
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
            <g transform={`translate(${-60 + k * 20},-10)`}><TmpPerson who="newsboy" x={0} y={0} s={0.42} pose={{armR: 150 + osc(t, 2, k * 0.3) * 20, mouth: 'wide'}} /></g>
          </g>
        ))}
        <Fog t={t} y={1250} h={260} speed={18} seed="i3" />
        <Strollers t={t} n={9} x0={-50} x1={1130} y={1660} s={0.26} seed="ic" kinds={['reader', 'reader', 'parasol', 'boater']} />
        {[0, 1].map((k) => { const x = ((t * (120 + k * 60) + k * 500) % 1500) - 200; return <g key={k} transform={`translate(${k ? 1080 - x : x},${1600 + k * 30})`}><Shape d={rectD(-80, -60, 160, 60)} fill={C.mist} /><rect x={-60} y={-50} width={40} height={24} fill={C.lamp} opacity={0.7} /><rect x={20} y={-50} width={40} height={24} fill={C.lamp} opacity={0.7} /></g>; })}
      </g>}
      {/* the flock of papers */}
      {flock > 0 && [...Array(16)].map((_, k) => {
        const r = (q: string) => rnd(`fl${k}${q}`);
        const s = lin(flock, r('d') * 0.25, 0.75);
        if (s <= 0 || s >= 1) return null;
        const x = mix(540, 1300, s) + (r('x') - 0.5) * 900 * s - 300 * s, y = mix(620, 200 + r('y') * 500, sm(s));
        const fl = Math.sin(t * 9 + k) * 0.5;
        return <g key={k} transform={`translate(${x},${y}) scale(${0.12 + rnd(`fls${k}`) * 0.07})`}><g transform={`scale(1,${0.5 + fl * 0.5})`}><FlockPage fr={Math.round(t * 30)} /></g></g>;
      })}
      {/* the page: the dock scene is its picture */}
      <g transform={`translate(540,${mix(960, 680, back)}) scale(${S}) translate(-540,-960)`}>
        <g opacity={back}><ChasePage fr={Math.round(t * 30)} /></g>
        <clipPath id="dockclip"><rect x={mix(-200, -72, back)} y={mix(-200, 547, back)} width={mix(1480, 1224, back)} height={mix(2320, 714, back)} /></clipPath>
        <g clipPath="url(#dockclip)">
          <rect x={-300} y={-300} width={1700} height={2600} fill="url(#daySky)" />
          <Fog t={t} y={300} h={300} speed={12} seed="i1" />
          <Gulls t={t} n={4} seed="ig" y0={200} y1={700} />
          <SeaBand t={t} y={1150} x0={-300} w={1700} />
          {/* the Laurentic pulling out, stern towards us at the left; big wake */}
          <g transform={`translate(${1900 + ship * -1},1200) scale(0.9)`}><Liner t={t} name="" lights={false} /></g>
          {[0, 1, 2].map((k) => <path key={k} d={`M${460 - ship},${1210 + k * 30} q${-200 - k * 80},${-20} ${-400 - k * 160},0`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.6} />)}
          {/* dock */}
          <Shape d={rectD(-300, 1300, 800, 700)} fill={C.slate} shade />
          <rect x={-300} y={1300} width={800} height={20} fill={C.deep} />
          <TmpPerson who="dew" x={dx} y={dy} s={0.6} pose={{kp: run < 1 ? 'walk' : 'leap', ex: 'serious'}} />
          <TmpPerson who="constable" x={-60} y={1330} s={0.5} pose={{kp: 'walk'}} />
          <Strollers t={t} n={4} x0={-300} x1={480} y={1360} s={0.45} seed="idk" kinds={['sailor', 'boater', 'steward', 'reader']} />
          <Gulls t={t} n={5} seed="ig2" y0={500} y1={1000} s={1.5} />
        </g>
      </g>
    </g>
  );
};
export const I_OUT = {x: 760, y: 420, r: 60};

// ---------- Stage J: the kit MontroseDeck: the doctor reads in his deck chair; the Moustache warns him; he swats it ----------
export const K_AT = B.l13 - 0.3;
export const StageJ: React.FC<{t: number}> = ({t}) => {
  const fr = Math.round(t * 30);
  const z = key(t, [[J_AT, 1.0], [K_AT, 1.16]]);
  const cx = key(t, [[J_AT, 520], [K_AT, 480]]), cy = key(t, [[J_AT, 1080], [K_AT, 1180]]);
  const warn = lin(t, B.noidea - 0.2, B.racing - B.noidea + 0.2);
  const swat = lin(t, B.racing, 0.35);
  const away = lin(t, B.racing + 0.15, 0.9);
  const [c1, c2] = DECK.chairs;
  const mx = away > 0 ? mix(c2[0] + 30, 1300, sm(away)) : c2[0] + 30 + Math.sin(t * 7) * 60;
  const my = away > 0 ? mix(1110, 500, sm(away)) : 1110 + Math.sin(t * 11) * 30;
  return (
    <Cam x={cx} y={cy} z={z}>
      <MontroseDeck fr={fr} />
      {/* the flock of papers passes high over the ship; none land */}
      {[...Array(7)].map((_, k) => { const sp = lin(t, J_AT - 0.3 + k * 0.15, 2.4); if (sp <= 0 || sp >= 1) return null;
        return <g key={k} transform={`translate(${mix(-150, 1250, sp)},${300 + k * 45 + Math.sin(sp * 8 + k) * 30})`}><path d={`M-40,0 L0,${-20 + Math.sin(t * 9 + k) * 18} L40,0 L0,10 Z`} fill={C.newsprint} stroke={C.ink} strokeWidth={3} /></g>; })}
      <Gulls t={t} n={3} seed="jg" y0={700} y1={1000} s={1.2} />
      {/* a notice on the bridge wall (the muted viewer's hint) */}
      <g transform="translate(700,1100)"><Shape d={rectD(-235, -34, 470, 58)} fill={C.newsprint} sw={3} /><text x={0} y={8} textAnchor="middle" fontFamily={FONT.period} fontStyle="italic" fontWeight={700} fontSize={34} fill={C.ink}>No newspapers on board</text></g>
      <Strollers t={t} n={3} x0={-300} x1={1300} y={1290} s={0.5} seed="jst" kinds={['steward', 'parasol', 'boater']} />
      <TmpPerson who="ethelB" x={c1[0] + 10} y={c1[1]} s={1.0} pose={{kp: 'sitRead', ex: 'calm'}} />
      <TmpPerson who="crippenB" x={c2[0] + 10} y={c2[1]} s={1.0} pose={{kp: swat > 0 && swat < 1 ? 'swat' : 'deckChair', ex: 'calm'}} />
      {warn > 0 && away < 1 && <TmpMoustache t={t} x={mx} y={my} s={0.9} flying rot={swat > 0 && swat < 1 ? 40 : 0} />}
      {swat > 0.4 && swat < 1 && <text x={c2[0] + 60} y={1040} fontFamily={FONT.plaque} fontSize={56} fill={C.ink}>swat!</text>}
      <Strollers t={t} n={2} x0={-300} x1={1300} y={1960} s={0.75} seed="jfg" kinds={['sailor', 'steward']} />
    </Cam>
  );
};
export const J_OUT = (() => { const z = 1.16, cx = 480, cy = 1180; return {x: 540 + (DECK.chairs[1][0] + 30 - cx) * z, y: 960 + (1260 - cy) * z, r: 70}; })();

// ---------- Stage K: the race map on the Daily Wire (the kit's RaceMap as a board game) ----------
export const L_AT = B.l14 - 0.3;
const KP = 1.4, KX = 92, KY = 380; // the page on the table
const hops = (t: number, from: number, at: number[]) => { let v = from; at.forEach((a) => { v += lin(t, a, 0.3); }); return v; };
export const StageK: React.FC<{t: number}> = ({t}) => {
  const fr = Math.round(t * 30);
  const z = key(t, [[K_AT, 0.98], [L_AT, 1.06]]);
  const a = B.fordays;
  const mon = hops(t, 4, [a + 0.2, a + 0.9, a + 1.7, B.raced + 0.5, B.raced + 1.2, B.raced + 1.9]);
  const lau = Math.min(11, hops(t, 3, [a + 0.5, a + 1.1, B.raced, B.raced + 0.5, B.raced + 1.0, B.raced + 1.6].flatMap((x) => [x, x + 0.15])));
  return (
    <Cam x={540} y={980} z={z}>
      <rect x={-300} y={-200} width={1700} height={2400} fill={C.deep} />
      <Fog t={t} y={200} h={300} speed={12} seed="k1" op={0.4} />
      <g transform={`rotate(${osc(t, 0.2) * 0.6} 540 960)`}>
        <DailyWire fr={fr} x={KX} y={KY} scale={KP} date="31 July 1910" raceMap={<RaceMap fr={fr} w={600} laurentic={lau} montrose={mon} diceAt={Math.round((a - 0.1) * 30)} dice={3} />} />
        {/* ripples on the printed sea, each on its own beat */}
        {[...Array(7)].map((_, k) => { const ph = (t * 0.7 + rnd(`rp${k}`)) % 1; return <circle key={k} cx={KX + (40 + rnd(`rpx${k}`) * 560) * KP} cy={KY + (260 + rnd(`rpy${k}`) * 480) * KP} r={10 + ph * 40} fill="none" stroke={C.slate} strokeWidth={3} opacity={(1 - ph) * 0.8} />; })}
        <g transform={`translate(${KX + 470 * KP},${KY + 220 * KP})`}><circle r={52} fill={C.fog} stroke={C.ink} strokeWidth={4} />
          <g transform={`rotate(${(t - K_AT) * 250})`}><circle cx={0} cy={-28} r={15} fill={C.lamp} stroke={C.ink} strokeWidth={3} /><path d="M-10,26 a14,14 0 1,0 18,-4 a10,10 0 1,1 -18,4 Z" fill={C.mist} stroke={C.ink} strokeWidth={3} /></g></g>
      </g>
    </Cam>
  );
};
const FIN = raceSquare(11, 600);
export const K_OUT = (() => { const z = 1.06; const wx = KX + (20 + FIN[0]) * KP, wy = KY + (170 + FIN[1]) * KP; return {x: 540 + (wx - 540) * z, y: 960 + (wy - 980) * z, r: 60}; })();

// ---------- Stage L: the kit's Father Point at dawn; the Montrose; the pilot boat; the ladder; the pilot who isn't ----------
const SHIP = {x: 1250, y: 1420, s: 1.25};
const LAD_X = 1040, DECK_Y = SHIP.y - 150 * SHIP.s; // rail line on the hull
export const StageL: React.FC<{t: number}> = ({t}) => {
  const fr = Math.round(t * 30);
  const boat = sm(lin(t, B.smallboat - 0.8, B.meet + 0.9 - B.smallboat + 0.8));
  const bx = mix(FATHER.boatFrom[0], LAD_X - 40, boat), by = mix(FATHER.boatFrom[1], SHIP.y + 10, boat);
  const climb = lin(t, B.pilot + 0.3, B.but - B.pilot);
  const py = mix(SHIP.y - 10, DECK_Y, sm(climb));
  const squawk = lin(t, B.climbed, 1.2);
  const cx = key(t, [[L_AT, 560], [B.meet, 640], [B.l15, LAD_X], [B.end, LAD_X], [B.total, LAD_X]]);
  const cy = key(t, [[L_AT, 1060], [B.meet, 1200], [B.l15, 1260], [B.but - 0.2, 1150], [B.end, 1030], [B.total, 1015]]);
  const z = key(t, [[L_AT, 0.95], [B.meet, 1.05], [B.l15, 1.5], [B.but - 0.2, 1.9], [B.end, 2.45], [B.total, 2.6]]);
  return (
    <Cam x={cx} y={cy} z={z}>
      <FatherPoint fr={fr} boat={false} />
      <Gulls t={t} n={7} seed="lg" y0={300} y1={1000} s={1.4} />
      <Gulls t={t} n={3} seed="lg2" y0={500} y1={900} s={0.7} />
      {[0, 1, 2].map((k) => <g key={k} transform={`translate(${520 + k * 120},${1250 + k * 30 + Math.sin(t * 2 + k) * 8}) rotate(${Math.sin(t * 1.6 + k) * 8})`}><path d="M-12,0 L0,-44 L12,0 Z" fill={k % 2 ? C.newsprint : C.slate} stroke={C.ink} strokeWidth={3} /></g>)}
      <g transform={`translate(${-200 + ((t * 30) % 900)},1180) scale(0.7)`}><Shape d="M-60,-10 H60 L45,14 H-50 Z" fill={C.slate} /><line x1={0} y1={-10} x2={0} y2={-90} stroke={C.ink} strokeWidth={4} /><path d={`M0,-88 L${40 + Math.sin(t * 3) * 6},-30 L0,-30 Z`} fill={C.newsprint} stroke={C.ink} strokeWidth={3} /></g>
      {/* the Montrose, huge, bow towards the lighthouse */}
      <KMontrose fr={fr} x={SHIP.x} y={SHIP.y} scale={SHIP.s} facing={-1} />
      {/* the Moustache perched on the rail */}
      {squawk < 1 && <TmpMoustache t={t} x={squawk > 0 ? mix(LAD_X + 120, 1500, sm(squawk)) : LAD_X + 120} y={squawk > 0 ? mix(DECK_Y - 20, 500, sm(squawk)) : DECK_Y - 20} s={0.7} flying={squawk > 0} state={squawk > 0 ? undefined : 'perch'} />}
      {squawk > 0 && squawk < 0.6 && <text x={LAD_X + 160} y={DECK_Y - 160} fontFamily={FONT.plaque} fontSize={40} fill={C.ink}>squawk!</text>}
      {/* the kit's rope ladder */}
      <RopeLadder fr={fr} x={LAD_X} y={DECK_Y} len={SHIP.y - DECK_Y + 30} dropAt={Math.round((B.l15 - 0.5) * 30)} />
      {/* his shadow on the hull wears a bowler (flat, clipped to the hull) */}
      {climb > 0 && <g>
        <clipPath id="hullclip"><rect x={LAD_X - 400} y={DECK_Y + 4} width={800} height={SHIP.y - DECK_Y + 40} /></clipPath>
        <g clipPath="url(#hullclip)"><g transform={`translate(${LAD_X - 80},${py + 130}) scale(1.0)`} opacity={0.8}>
          <path d="M-24,0 L-20,-100 L-30,-108 L-26,-150 Q0,-160 26,-150 L30,-108 L20,-100 L24,0 Z" fill={C.deep} />
          <circle cx={0} cy={-166} r={16} fill={C.deep} />
          <path d="M-30,-176 Q0,-182 30,-176 L20,-178 Q20,-206 0,-206 Q-20,-206 -20,-178 Z" fill={C.deep} />
        </g></g>
        {climb < 0.97 && <Ring t={t} at={B.climbed} cx={LAD_X - 80} cy={py + 130 - 190} r={30} seed="lb" />}
      </g>}
      {/* the kit's pilot boat with the "pilot" aboard until he climbs */}
      <PilotBoat fr={fr} x={bx} y={by} scale={1.1} />
      {climb <= 0 && <TmpPerson who="dewPilot" x={bx + 60} y={by - 14} s={0.2} pose={{feather: true}} />}
      {climb > 0 && <TmpPerson who="dewPilot" x={LAD_X + 10} y={py} s={0.23} pose={{kp: climb < 1 ? 'climb' : 'stand', feather: true}} />}
      {climb > 0 && <Ring t={t} at={B.but + 0.1} cx={LAD_X + 10 - 0.23 * 40} cy={py - 0.23 * 470} r={24} seed="lf" />}
    </Cam>
  );
};

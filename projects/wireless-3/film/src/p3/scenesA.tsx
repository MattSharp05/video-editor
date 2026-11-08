// Part 3, lines 1-9: recap -> title -> the pilot is Dew -> "Good morning" -> Ethel -> London -> the court and the scales.
import React from 'react';
import {Camera, ParallaxLayer} from '../kit/camera';
import {T, FONT} from './tok';
import {B, F, pr, win, lerp, swing, keyv, rnd, inOut, back} from './util';
import {Sh, R, WR, Txt, Ring3, BaileyOutside, Court, DockRail, Scales, DrugBottle, ReportCard, Scientist1910, ChemistWindow, PoisonsBook, PyjamaScrap, JonesShop, Drawer, Ledger, RubberStamp, Pigeons} from './props';
import {K} from './K';

export type S = {t: number; fr: number};

// a printed word on a thing (first naming): newsprint ribbon with ink type, swings in
export const Word: React.FC<{t: number; at: number; text: string; x: number; y: number; s?: number; out?: number; rot?: number}> = ({t, at, text, x, y, s = 34, out = 99, rot = 0}) => {
  s = Math.max(s, 34);
  const o = win(t, at, out, 0.2);
  if (o <= 0) return null;
  const w = text.length * s * 0.56 + 36;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot + swing(t, at, 8, 1.6, 3)}) scale(${0.7 + 0.3 * pr(t, at, 0.3, back)})`} opacity={o}>
      <Sh d={WR(-w / 2, -s * 0.8, w, s * 1.3, text)} fill={T.newsprint} sw={2.5} />
      <Txt y={s * 0.15} s={s} f={FONT.period} w={700}>{text}</Txt>
    </g>
  );
};
// speech balloon (newsprint, ink, tail to (tx,ty) relative)
export const Balloon: React.FC<{t: number; at: number; text: string[]; x: number; y: number; s?: number; tx?: number; ty?: number; out?: number; w?: number}> = ({t, at, text, x, y, s = 44, tx = -80, ty = 150, out = 99, w}) => {
  const o = win(t, at, out, 0.15);
  if (o <= 0) return null;
  const W = w ?? Math.max(...text.map((l) => l.length)) * s * 0.52 + 70, H = text.length * s * 1.15 + 50;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * pr(t, at, 0.35, back)})`} opacity={o}>
      <Sh d={`M${-W / 2 + 30},${-H / 2} h${W - 60} q30,0 30,30 v${H - 60} q0,30 -30,30 h${-W / 2 + 60 + Math.min(0, tx)} l${tx - Math.min(0, tx) - 10},${ty - H / 2} l-20,${-ty + H / 2} h${-W / 2 + 20 - Math.min(0, tx)} q-30,0 -30,-30 v${-H + 60} q0,-30 30,-30 z`} fill={T.newsprint} sw={3.5} />
      {text.map((l, i) => <Txt key={i} y={-H / 2 + 25 + s * (i + 0.95) * 1.1} s={s} f={FONT.period} w={700}>{l}</Txt>)}
    </g>
  );
};
// gulls on their own paths
export const Gulls: React.FC<{t: number; n?: number; seed?: string; x?: number; y?: number; w?: number; k?: number}> = ({t, n = 4, seed = 'g', x = 0, y = 300, w = 1400, k = 1.7}) => (
  <g>{Array.from({length: n}, (_, i) => {
    const sp = 40 + rnd(seed + i) * 50;
    const gx = x - 200 + ((rnd(seed + 'x' + i) * w + t * sp) % w), gy = y + rnd(seed + 'y' + i) * 260 + Math.sin(t * 1.2 + i * 2) * 30;
    const f = Math.sin(t * (7 + i) + i);
    return <path key={i} transform={`translate(${gx} ${gy}) scale(${k}) translate(${-gx} ${-gy})`} d={`M${gx - 26},${gy + f * 10} Q${gx - 12},${gy - 10} ${gx},${gy} Q${gx + 12},${gy - 10} ${gx + 26},${gy + f * 10}`} stroke={T.ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
  })}</g>
);
// independent drifting specks (dust in a lamp, sea spray, snow): each its own path, so each counts as a mover
export const Motes: React.FC<{t: number; n?: number; x?: number; y?: number; w?: number; h?: number; seed?: string; col?: string; r?: number; up?: number}> =
  ({t, n = 12, x = 0, y = 0, w = 1080, h = 1920, seed = 'm', col = T.fog, r = 4, up = 1}) => (
  <g>{Array.from({length: n}, (_, i) => {
    const sp = 14 + rnd(seed + 's' + i) * 30;
    const px = x + (((rnd(seed + 'x' + i) * w + Math.sin(t * (0.6 + rnd(seed + 'f' + i)) + i) * 40) % w) + w) % w;
    const py = y + (((rnd(seed + 'y' + i) * h - t * sp * up) % h) + h) % h;
    return <circle key={i} cx={px} cy={py} r={r * (0.6 + rnd(seed + 'r' + i))} fill={col} opacity={0.35 + 0.35 * Math.sin(t * 2.3 + i * 1.7)} />;
  })}</g>
);
// loose newspaper sheets fluttering past (each tumbles on its own path)
export const Scraps: React.FC<{t: number; n?: number; seed?: string; yMin?: number; yMax?: number}> = ({t, n = 5, seed = 'sc', yMin = 300, yMax = 1600}) => (
  <g>{Array.from({length: n}, (_, i) => {
    const sp = 70 + rnd(seed + i) * 80, y0 = yMin + rnd(seed + 'y' + i) * (yMax - yMin);
    const x = ((rnd(seed + 'x' + i) * 1600 + t * sp) % 1600) - 260, y = y0 + Math.sin(t * 1.4 + i * 2) * 60;
    const rot = t * (60 + i * 20) + i * 50, fl = Math.cos(t * (3 + i * 0.7) + i);
    return (
      <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${fl} 1)`}>
        <Sh d={R(-50, -36, 100, 72, 3)} fill={T.newsprint} sw={2.5} />
        {[0, 1, 2, 3].map((k) => <path key={k} d={`M-38,${-22 + k * 14} h${k === 0 ? 76 : 60}`} stroke={T.ink} strokeWidth={k === 0 ? 5 : 2} opacity={0.5} />)}
      </g>
    );
  })}</g>
);
export const Fog: React.FC<{fr: number; y1?: number; y2?: number}> = ({fr, y1 = 700, y2 = 1350}) => (
  <g><K.fogBand fr={fr} y={y1} speed={0.6} /><K.fogBand fr={fr} y={y2} speed={-0.4} /></g>
);

// ---------- 0. Recap: P2's brim close-up turns out to be the R5 engraving on the Daily Wire (31 July 1910) ----------
// The kit's panel slots (190×240, page coords): R4 RaceOvertake slides in on "raced across", R5 LadderShadow holds the
// climbing pilot (P2 L17). Page: 640×860 native, scaled PS, top-left at (PX, PY).
const PS = 1.3, PX = 540 - 320 * PS, PY = 600;   // page clear of the plaque (y 300–530), world around it
const pagePt = (x: number, y: number): [number, number] => [PX + x * PS, PY + y * PS];
const PF: [number, number] = [95, 110];         // the pilot's head inside panel 2 (panel coords)
const CAP_PT = pagePt(226 + PF[0], 290 + PF[1]);
const LIVE_F: [number, number] = [560, 1060];    // the pilot's head in the full-frame picture
const LIVE_S = 0.3;                              // full-frame px → panel px
// Part 2's last frame, full frame (P2 l15 + end card): dawn, the Montrose's upperworks and hull, the pilot (Dew B, the
// Feather tip at his pocket) standing at the rail at the top of the rope ladder. Kit Montrose / DewB / RopeLadder / Sky.
export const LiveR5: React.FC<S> = ({t, fr}) => (
  <g>
    <K.sky kind="dawn" />
    <circle cx={160} cy={760} r={170} fill={T.lamp} opacity={0.9} />
    <K.montrose fr={fr} x={700} y={1970} scale={3} />
    <K.ropeLadder fr={fr} x={560} y={1520} len={520} />
    <g transform="translate(560 1520)"><K.dewPilot fr={fr} pose="stand" h={520} /></g>
    <Gulls t={t} n={3} y={160} seed="lr" />
  </g>
);
const panelR4 = (t: number) => (fr: number) => {
  const hop = pr(t, B.raced, 1.6, inOut);
  return (
    <g>
      <rect width={190} height={240} fill={T.newsprint} />
      {Array.from({length: 4}, (_, i) => <path key={i} d={`M${10 + ((i * 50 + fr * 0.6) % 190)},${170 + i * 14} q10,-6 20,0 t20,0`} stroke={T.slate} strokeWidth={2} fill="none" />)}
      <path d="M12,120 C60,90 120,140 180,100" stroke={T.ink} strokeWidth={2.5} strokeDasharray="7 6" fill="none" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={14 + i * 36} y={104 + Math.sin(i * 1.3) * 12} width={16} height={16} fill={T.fog} stroke={T.ink} strokeWidth={1.5} />)}
      <text x={150} y={60} fontFamily={FONT.head} fontSize={14} textAnchor="middle" fill={T.ink}>FATHER POINT</text>
      <path d="M170,96 v-30 l16,6 l-16,6" fill={T.newsprint} stroke={T.ink} strokeWidth={2} />
      <g transform={`translate(${lerp(30, 140, hop)} ${108 - Math.abs(Math.sin(hop * Math.PI * 3)) * 16})`}>
        <path d="M-16,0 h32 l-5,10 h-22 z" fill={T.newsprint} stroke={T.ink} strokeWidth={2} /><path d="M0,0 v-20" stroke={T.ink} strokeWidth={2} /><path d="M0,-20 l14,4 l-14,4 z" fill={T.cora} stroke={T.ink} strokeWidth={1.5} />
      </g>
      {[0, 1].map((i) => <g key={'d' + i} transform={`translate(${40 + i * 30 + Math.sin(t * 3 + i) * 6} ${200 - Math.abs(Math.sin(t * 5 + i * 1.3)) * 18}) rotate(${t * (140 + i * 60)})`}>
        <rect x={-8} y={-8} width={16} height={16} rx={3} fill={T.newsprint} stroke={T.ink} strokeWidth={2} /><circle r={2} fill={T.ink} /></g>)}
      <g transform="translate(96 130)">
        <path d="M-16,0 h32 l-5,10 h-22 z" fill={T.slate} stroke={T.ink} strokeWidth={2} />
        <K.moustache fr={fr} state="perch" size={0.22} tilt={hop > 0.5 ? 15 : 0} />
      </g>
    </g>
  );
};
const panelR5 = (t: number) => (fr: number) => (
  <g>
    <rect width={190} height={240} fill={T.fog} />
    <g transform={`translate(${PF[0]} ${PF[1]}) scale(${LIVE_S}) translate(${-LIVE_F[0]} ${-LIVE_F[1]})`}><LiveR5 t={t} fr={fr} /></g>
  </g>
);
const PageBack: React.FC<S> = ({fr}) => (
  <ParallaxLayer depth={0.3}><rect x={-600} y={-600} width={2400} height={3200} fill={T.slate} />
    {Array.from({length: 14}, (_, i) => <rect key={i} x={-400 + i * 140} y={-400} width={60} height={3000} fill={T.deep} opacity={0.35} />)}
    <K.fogBand fr={fr} y={500} speed={0.4} /></ParallaxLayer>
);
export const Recap: React.FC<S> = ({t, fr}) => {
  const keys: [number, Partial<{x: number; y: number; zoom: number; rot: number}>][] = [
    [0, {x: 540, y: 960, zoom: 1}], [F(1.0), {x: 540, y: 960, zoom: 1}], [F(2.3), {x: 540, y: 1060, zoom: 1.06}], [F(B.l1), {x: 540, y: 1080, zoom: 1.04}],
  ];
  const e = inOut(pr(t, 0.15, 0.85, (x) => x));
  const pw = 190 * PS, ph = 240 * PS, [px, py] = pagePt(226, 290);
  const sc = lerp(1, LIVE_S * PS, e), tgt = [lerp(LIVE_F[0], CAP_PT[0], e), lerp(LIVE_F[1], CAP_PT[1], e)];
  const clip = [lerp(0, px, e), lerp(0, py, e), lerp(1080, pw, e), lerp(1920, ph, e)];
  return (
    <Camera fr={fr} keys={keys} background={T.deep}>
      <PageBack t={t} fr={fr} />
      <K.dailyWireAt fr={fr} x={PX} y={PY} scale={PS} date="31 July 1910" prevDate="16 July 1910" dateAt={F(1.2)}
        panels={[panelR4(t), panelR5(t)]} panelAt={[F(B.raced - 0.3), -99]} />
      {e < 1 && (
        <g>
          <defs><clipPath id="r5shrink"><rect x={clip[0]} y={clip[1]} width={clip[2]} height={clip[3]} /></clipPath></defs>
          <g clipPath="url(#r5shrink)"><g transform={`translate(${tgt[0]} ${tgt[1]}) scale(${sc}) translate(${-LIVE_F[0]} ${-LIVE_F[1]})`}><LiveR5 t={t} fr={fr} /></g></g>
          <rect x={clip[0]} y={clip[1]} width={clip[2]} height={clip[3]} fill="none" stroke={T.ink} strokeWidth={3 + e * 1} />
        </g>
      )}
      <Word t={t} at={B.climbed} text="the pilot" x={CAP_PT[0]} y={py + ph + 40} s={34} />
      <Scraps t={t} n={6} yMin={1450} yMax={1850} />
      <Motes t={t} n={18} seed="rc" col={T.newsprint} r={8} />
      <Fog fr={fr} y1={1650} y2={1800} />
    </Camera>
  );
};

// ---------- 1. Title: the kit Subtitle's clerk's stamp thumps it; the ripple lifts the engraved pilot; push into R5 ----------
export const Title: React.FC<S> = ({t, fr}) => {
  const ripple = pr(t, B.part, 0.8);
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l1), {x: 540, y: 1080, zoom: 1.04}], [F(B.l2 - 0.75), {x: 540, y: 1100, zoom: 1.06}], [F(B.l2), {x: CAP_PT[0], y: CAP_PT[1] + 60, zoom: 7}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.deep}>
      <PageBack t={t} fr={fr} />
      <g transform={`translate(540 1100) scale(${1 + Math.sin(ripple * Math.PI) * 0.012}) translate(-540 -1100)`}>
        <K.dailyWireAt fr={fr} x={PX} y={PY} scale={PS} date="31 July 1910" panels={[panelR4(t), panelR5(t)]} />
        {ripple > 0 && ripple < 1 && <circle cx={540} cy={420} r={ripple * 1100} fill="none" stroke={T.ink} strokeWidth={8 * (1 - ripple)} opacity={0.4} />}
      </g>
      <Scraps t={t} n={6} yMin={1450} yMax={1850} />
      <Motes t={t} n={18} seed="rc" col={T.newsprint} r={8} />
      <Fog fr={fr} y1={1650} y2={1800} />
    </Camera>
  );
};

// ---------- 2. On deck: the pilot lifts his cap, the bowler pops up, the Feather springs into the band; Kendall nods ----------
export const Deck: React.FC<S> = ({t, fr}) => {
  const pop = pr(t, B.dew - 0.1, 0.45, back);
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l2), {x: 560, y: 1000, zoom: 2.6}], [F(B.l2 + 0.9), {x: 540, y: 1020, zoom: 1.05}], [F(B.l3), {x: 470, y: 980, zoom: 1.35}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.fog}>
      <ParallaxLayer depth={0.2}>
        <rect x={-800} y={-800} width={2700} height={1900} fill={T.fog} />
        <circle cx={850} cy={620} r={110} fill={T.lamp} opacity={0.85} />
        <circle cx={850} cy={620} r={300} fill="url(#p3-lamp)" opacity={0.6} />
        {/* far shore: Father Point lighthouse beam */}
        <path d="M-400,880 Q100,800 600,860 T1500,840 V1100 H-400 Z" fill={T.mist} opacity={0.7} />
        <g transform="translate(120 820)"><Sh d="M-14,0 L-10,-110 H10 L14,0 Z" fill={T.newsprint} sw={2} /><path d={`M0,-110 L${Math.cos(t * 1.6) * 600},${-110 + Math.sin(t * 1.6) * 40}`} stroke={T.lamp} strokeWidth={14} opacity={0.35} /></g>
      </ParallaxLayer>
      <ParallaxLayer depth={0.5}><Gulls t={t} n={4} y={200} /></ParallaxLayer>
      <g>
        <K.montroseDeck fr={fr} sky="dawn" />
        <g transform={`translate(${230 + Math.sin(t * 0.8) * 4} 1460)`}><K.passenger fr={fr} kind="parasol" h={430} /></g>
        <g transform="translate(860 1440)"><K.kendall fr={fr} pose={t > B.disguise - 0.2 ? 'nod' : 'stand'} h={640} facing={-1} /></g>
        <g transform="translate(520 1500)">
          {t < B.disguise - 0.1
            ? <K.dewPilot fr={fr} pose="liftCap" capLift={pop} h={720} feather={pr(t, B.dew + 0.2, 0.4)} />
            : <K.dew fr={fr} pose="liftHat" h={740} feather={1} />}
          {Math.abs(t - (B.disguise - 0.1)) < 0.3 && Array.from({length: 7}, (_, i) => {
            const k = (t - (B.disguise - 0.4)) / 0.6, a = (i / 7) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * 160 * k} cy={-420 + Math.sin(a) * 220 * k} r={50 * (1 - k)} fill={T.fog} opacity={0.8 * (1 - k)} />;
          })}
        </g>
        <Word t={t} at={B.dew} text="Inspector Dew" x={520} y={1150} s={36} />
      </g>
      <ParallaxLayer depth={1.4}><path d={`M-200,1640 H1400`} stroke={T.deep} strokeWidth={26} /><path d="M-200,1600 H1400" stroke={T.ink} strokeWidth={6} />
        {Array.from({length: 10}, (_, i) => <path key={i} d={`M${-150 + i * 170},1600 v60`} stroke={T.ink} strokeWidth={8} />)}</ParallaxLayer>
      <Motes t={t} n={10} seed="dk" col={T.newsprint} r={8} />
      <Fog fr={fr} y1={760} y2={1300} />
    </Camera>
  );
};

// ---------- 3. The captain's cabin: "Good morning, Doctor Crippen." The Moustache flies in the porthole and lands: click ----------
export const Cabin: React.FC<S> = ({t, fr}) => {
  const rise = pr(t, B.near, 0.6);
  const fly = pr(t, B.crippen - 0.15, 0.7, inOut);   // ends just above his lip, then the kit's 'land' takes over
  const mx = lerp(K.cabinPts.porthole[0], 640, fly), my = lerp(K.cabinPts.porthole[1], 900, fly) - Math.sin(fly * Math.PI) * 220;
  const LAND = B.crippen + 0.55;
  const OFF = B.l4 - 0.3;                         // it hops off his lip (he was clean-shaven at the arrest)
  const hop = pr(t, OFF, 0.3, inOut);
  const wide = pr(t, LAND + 0.1, 0.2);
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l3), {x: 420, y: 1000, zoom: 1.35}], [F(B.near + 0.6), {x: 540, y: 980, zoom: 1.0}], [F(B.crippen + 0.6), {x: 520, y: 980, zoom: 1.12}],
    [F(B.l4 - 0.4), {x: 600, y: 940, zoom: 1.35}], [F(B.l4), {x: 700, y: 840, zoom: 3.2}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.slate}>
      <K.cabin fr={fr} kind="captain" sky="dawn" />
      <g transform="translate(70 1470)"><K.kendall fr={fr} pose="nod" h={540} /></g>
      <g transform={`translate(${lerp(130, 330, pr(t, B.l3, 1.2))} 1520)`}><K.dew fr={fr} pose="walk" h={760} feather={1} /></g>
      <g transform={`translate(640 ${1520 + (1 - rise) * 60})`}><K.robinson fr={fr} pose={wide > 0 ? 'startled' : 'stand'} expr={wide > 0 ? 'startled' : 'neutral'} h={610} facing={-1} hat={false} moustache={t >= LAND - 0.27 && t < OFF ? 'land' : 'none'} moustacheAt={F(LAND) - 8} /></g>
      {t < LAND - 0.27 && <g transform={`translate(${mx} ${my}) rotate(${(1 - fly) * 40})`}><K.moustache fr={fr} state="fly" size={0.55} /></g>}
      {t >= OFF && <g transform={`translate(${lerp(640, 760, hop)} ${lerp(1010, 760, hop)})`}><K.moustache fr={fr} state="fly" size={0.55} /></g>}
      <Motes t={t} n={10} seed="cb" col={T.lamp} r={8} x={500} y={400} w={500} h={900} />
      <Word t={t} at={B.near} text="Mr. Robinson" x={660} y={830} s={32} out={B.crippen} />
      <Balloon t={t} at={B.goodmorning - 0.1} text={['Good morning,', 'Doctor Crippen.']} x={380} y={600} s={46} tx={-60} ty={210} out={B.l4 - 0.4} />
    </Camera>
  );
};

// ---------- 4. The chase is over: the race-map tokens bump, a flag pops; push through a porthole into Ethel's cabin ----------
export const Ethel: React.FC<S> = ({t, fr}) => {
  const bump = pr(t, B.l4 + 0.2, 0.7, inOut);
  const flag = pr(t, B.over + 0.6, 0.35, back);
  const stand = pr(t, B.boy - 0.4, 0.8);
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l4), {x: 540, y: 900, zoom: 1.6}], [F(B.l4 + 0.5), {x: 540, y: 900, zoom: 1.0}], [F(B.ethel - 0.6), {x: 600, y: 900, zoom: 1.1}],
    [F(B.ethel - 0.1), {x: 540 + K.raceSquare(11, 760)[0] + 9, y: 900 + K.raceSquare(11, 760)[1] - 8, zoom: 8}], [F(B.ethel + 0.05), {x: 540, y: 1100, zoom: 1.6}], [F(B.l5), {x: 540, y: 1100, zoom: 1.15}],
  ];
  const inCabin = t >= B.ethel - 0.1;
  return (
    <Camera fr={fr} keys={keys} background={T.newsprint}>
      {!inCabin ? (
        <g>
          <rect x={-600} y={-600} width={2400} height={3200} fill={T.slate} />
          {Array.from({length: 12}, (_, i) => <rect key={i} x={-400 + i * 140} y={-400} width={60} height={3000} fill={T.deep} opacity={0.35} />)}
          <g transform="translate(540 900)"><K.raceMap fr={fr} w={760} laurentic={lerp(9, 11, bump)} montrose={11} flag={flag > 0.5} /></g>
          <Word t={t} at={B.over + 0.3} text="caught" x={600} y={1040} s={40} />
          {Array.from({length: 5}, (_, i) => <path key={i} d={`M${200 + i * 160},${1200 + Math.sin(t * 2 + i) * 10} q40,-20 80,0 t80,0`} stroke={T.slate} strokeWidth={4} fill="none" />)}
        </g>
      ) : (
        <g>
          <K.cabin fr={fr} kind="passenger" door={pr(t, B.ethel - 0.1, 0.6)} sky="dawn" />
          <g transform={`translate(${lerp(980, 820, pr(t, B.ethel, 0.8))} 1520)`}><K.passenger fr={fr} kind="Canadian police" h={640} /></g>
          <g transform={`translate(420 ${1520 - stand * 40})`}><K.ethelB fr={fr} pose={stand > 0.5 ? 'stand' : 'sitRead'} expr="calm" h={560} /></g>
          <g transform={`translate(560 360) rotate(${Math.sin(t * 2.1) * 14})`}><path d="M0,-200 V0" stroke={T.ink} strokeWidth={4} /><Sh d="M-50,0 Q0,-50 50,0 Z" fill={T.mist} /><circle cy={10} r={90} fill="url(#p3-lamp)" opacity={0.6} /></g>
          <g transform={`translate(240 ${1100 + Math.sin(t * 1.6) * 12}) rotate(${Math.sin(t * 1.6) * 6})`}><Sh d={R(-60, -40, 120, 80, 6)} fill={T.newsprint} sw={2.5} /><Txt y={8} s={20} it>a novel</Txt></g>
          <Motes t={t} n={12} seed="ec" col={T.lamp} r={8} x={500} y={500} w={600} h={900} />
          <Word t={t} at={B.ethel + 0.2} text="Ethel" x={420} y={860} s={38} />
        </g>
      )}
    </Camera>
  );
};

// ---------- 5. Back in London: a token sails home, London pops up, the doctor shakes his head; the Old Bailey rises ----------
export const London: React.FC<S> = ({t, fr}) => {
  const sail = pr(t, B.l5, 1.3, inOut);
  const city = pr(t, B.l5 + 0.6, 0.9, back);
  const bailey = pr(t, B.trial - 0.2, 1.0, back);
  const shake = t > B.didnt - 0.5 && t < B.didnt + 1.2 ? Math.sin((t - B.didnt) * 18) * 1 : 0;
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l5), {x: 540, y: 1100, zoom: 1.15}], [F(B.l5 + 1.2), {x: 540, y: 1040, zoom: 1.0}], [F(B.trial), {x: 540, y: 960, zoom: 0.9}],
    [F(B.bailey + 0.3), {x: 540, y: 760, zoom: 1.0}], [F(B.l6 - 0.3), {x: 664, y: 640, zoom: 1.6}], [F(B.l6), {x: 664, y: 640, zoom: 2.2}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.fog}>
      <ParallaxLayer depth={0.3}><rect x={-800} y={-800} width={2700} height={3500} fill={T.fog} /><Gulls t={t} n={3} y={200} seed="lg" /></ParallaxLayer>
      {/* the map page under everything, the dotted route east to LONDON */}
      <g transform="translate(540 1400)">
        <Sh d={R(-620, -300, 1240, 700)} fill={T.newsprint} sw={4} />
        <path d="M-560,0 C-300,-60 100,80 420,-20" stroke={T.ink} strokeWidth={5} strokeDasharray="14 14" fill="none" />
        <g transform={`translate(${lerp(-560, 380, sail)} ${lerp(0, -16, sail) + Math.sin(t * 3) * 4})`}>
          <Sh d="M-46,0 h92 l-12,26 h-68 z" fill={T.slate} sw={3} /><path d="M-10,0 v-34 h20 v34" fill={T.fog} stroke={T.ink} strokeWidth={2.5} />
        </g>
        <Txt x={-560} y={80} s={30} f={FONT.period} it>Canada</Txt>
        <Txt x={440} y={60} s={40} f={FONT.head}>LONDON</Txt>
      </g>
      {/* London pops up off the page */}
      <g transform={`translate(540 1240) scale(1 ${city})`}>
        {Array.from({length: 9}, (_, i) => <Sh key={i} d={R(-560 + i * 125, -180 - (i % 3) * 70, 105, 200 + (i % 3) * 70)} fill={i % 2 ? T.mist : T.slate} sw={2.5} shade="far" />)}
        {Array.from({length: 6}, (_, i) => <path key={'c' + i} d={`M${-500 + i * 200},${-260 - (i % 2) * 40 - ((t * 40 + i * 30) % 120)} q20,-30 0,-60`} stroke={T.fog} strokeWidth={14} fill="none" opacity={0.7 - ((t * 40 + i * 30) % 120) / 200} />)}
      </g>
      {/* Liverpool–London quay: a crowd waits as the ship comes home */}
      <g opacity={1 - pr(t, B.trial - 0.4, 0.6)}>
        <Sh d={R(-200, 1760, 1500, 400)} fill={T.slate} sw={4} />
        {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${560 + i * 120} 1770)`}><K.passenger fr={fr} kind={(['boater', 'parasol', 'hoop', 'steward'] as const)[i]} h={300 + (i % 2) * 40} /></g>)}
        <g transform="translate(1020 1770)"><K.constable fr={fr} pose="walk" h={340} facing={-1} /></g>
        <g transform="translate(470 1900)"><K.newsboy fr={fr} pose="shout" h={240} /></g>
      </g>
      {/* the Old Bailey rises behind him */}
      <g transform={`translate(540 ${1300 - bailey * 120}) scale(${0.62 * bailey})`} opacity={Math.min(1, bailey * 3)}>
        <BaileyOutside t={t} />
      </g>
      {/* the doctor (Crippen B: bare lip, hat off; clean-shaven since the razor) shakes his head: "I didn't do it." */}
      <g transform={`translate(${300 - pr(t, B.trial - 0.6, 0.8, inOut) * 520} ${1660}) rotate(${shake * 2})`}>
        <K.robinson fr={fr} pose={t > B.trial - 0.6 ? 'walk' : 'shakeHead'} h={540} hat={false} facing={t > B.trial - 0.6 ? -1 : 1} />
      </g>
      <g transform="translate(540 900)"><Pigeons t={t} lift={0.3 + ((t - B.l5) * 0.12) % 0.7} n={6} seed="lp" /></g>
      <Motes t={t} n={10} seed="ld" col={T.newsprint} r={8} y={500} h={900} />
      <Word t={t} at={B.london + 0.3} text="Dr. Crippen" x={300} y={1000} s={30} out={B.didnt - 0.2} />
      <Balloon t={t} at={B.didnt - 0.15} text={["I didn't do it."]} x={420} y={1000} s={44} tx={-110} ty={170} out={B.trial + 0.6} />
      <Fog fr={fr} y1={900} y2={1500} />
    </Camera>
  );
};

// ---------- 6-8. The court: the giant scales over Court No. 1. His "I didn't do it." balloon sits in the right pan;
// the evidence drops into the left pan and outweighs it. Then the jury, GUILTY, the ledger closes, the lamp dims. ----------
export const CourtScene: React.FC<S> = ({t, fr}) => {
  const bottle = pr(t, B.bought - 0.1, 0.5, inOut);     // the bottle drops into the left pan
  const scrap = pr(t, B.pajama - 0.2, 1.0, inOut);      // the scrap drifts down into the left pan
  const tilt = -keyv(t, [[B.bought, 0], [B.bought + 0.5, 9], [B.pajama + 0.8, 9], [B.shopped, 20]], back);
  const lean = pr(t, B.l8, 0.8);
  const foreman = pr(t, B.guilty - 0.3, 0.5);
  const dim = pr(t, B.death, 1.2);
  const close = pr(t, B.law, 0.8, inOut);
  const dsc = pr(t, B.scientist - 0.2, 0.6, back);
  const chem = pr(t, B.bought - 0.6, 0.5);
  const book = pr(t, B.winter - 0.6, 0.5);
  const shop = pr(t, B.store - 0.4, 0.5);
  const drawer = pr(t, B.shopped - 0.3, 0.6);
  const balloonUp = pr(t, B.shopped + 0.2, 0.7);
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l6), {x: 540, y: 560, zoom: 2.0}], [F(B.l6 + 0.9), {x: 540, y: 700, zoom: 1.05}], [F(B.drug + 0.5), {x: 400, y: 820, zoom: 1.15}],
    [F(B.bought), {x: 380, y: 900, zoom: 1.0}], [F(B.l7), {x: 460, y: 960, zoom: 0.98}], [F(B.store), {x: 560, y: 900, zoom: 1.08}],
    [F(B.l8 - 0.2), {x: 540, y: 1000, zoom: 0.92}], [F(B.guilty), {x: 420, y: 1130, zoom: 1.15}], [F(B.law), {x: 560, y: 1080, zoom: 1.0}],
    [F(B.l9 - 0.3), {x: 635, y: 1180, zoom: 1.7}], [F(B.l9), {x: 635, y: 1180, zoom: 4.2}],
  ];
  // world: court floor at y 1300..; scales pivot at (540, 380)
  return (
    <Camera fr={fr} keys={keys} background={T.slate}>
      <g transform="translate(540 1080)"><Court t={t} lean={lean} foreman={foreman} dim={dim} /></g>
      <Motes t={t} n={14} seed="ct" col={T.lamp} r={8} x={200} y={200} w={700} h={900} up={0.3} />
      {/* the dock (right) with the doctor */}
      <g transform="translate(830 1500)">
        <K.robinson fr={fr} pose="dock" expr={t > B.guilty ? 'blank' : 'neutral'} h={470} hat={false} />
        <DockRail />
      </g>
      {/* Dew in the gallery, notebook with the Feather bookmark, lowers it at the verdict */}
      <g transform="translate(70 1640)"><K.dew fr={fr} pose={t > B.guilty ? 'lowerNotebook' : 'write'} h={540} feather={1} /></g>
      {/* the scales hang over the court */}
      <g transform="translate(540 380)">
        <Scales t={t} tilt={tilt}
          left={<g>
            <g transform={`translate(0 ${lerp(-900, -36, bottle)}) rotate(${(1 - bottle) * 30})`} opacity={bottle > 0 ? 1 : 0}><g transform="scale(0.8)"><DrugBottle ring={pr(t, B.winter, 0.4)} /></g></g>
            <g transform={`translate(${lerp(500, 40, scrap) + Math.sin(scrap * 9) * 40 * (1 - scrap)} ${lerp(-800, -14, scrap)}) rotate(${Math.sin(scrap * 7) * 20 * (1 - scrap)}) scale(0.6)`} opacity={scrap > 0 ? 1 : 0}><PyjamaScrap ring={pr(t, B.shopped, 0.4)} /></g>
          </g>}
          right={<g transform={`translate(0 ${-60 - balloonUp * 900}) rotate(${balloonUp * 20})`} opacity={1 - balloonUp}>
            <Sh d={R(-120, -50, 240, 80, 30)} fill={T.newsprint} sw={3} />
            <Txt y={0} s={26} f={FONT.period} w={700}>I didn&apos;t do it.</Txt>
          </g>} />
      </g>
      {/* evidence slides in beside the scales */}
      <g transform={`translate(${lerp(-400, 230, dsc)} 760) scale(0.62)`} opacity={1 - pr(t, B.bought + 0.6, 0.4)}>
        <Scientist1910 t={t} raise={pr(t, B.drug - 0.3, 0.5, back)} />
      </g>
      <g transform={`translate(${lerp(-400, 470, dsc)} ${560 - pr(t, B.drug - 0.3, 0.5, back) * 60}) scale(0.85)`} opacity={1 - pr(t, B.bought + 0.6, 0.4)}><ReportCard /></g>
      <g transform={`translate(${lerp(-500, 200, chem)} 820) scale(0.55)`} opacity={chem * (1 - pr(t, B.l7 - 0.2, 0.4))}><ChemistWindow t={t} /></g>
      <g transform={`translate(${lerp(1500, 860, book)} 760) scale(0.5) rotate(4)`} opacity={book * (1 - pr(t, B.l7 + 0.3, 0.4))}><PoisonsBook t={t} flip={pr(t, B.winter - 0.4, 0.7)} ring={pr(t, B.winter + 0.2, 0.5)} /></g>
      <g transform={`translate(${lerp(1500, 860, shop)} 800) scale(0.5)`} opacity={shop * (1 - pr(t, B.l8 - 0.2, 0.4))}><JonesShop t={t} /></g>
      <g transform={`translate(${lerp(-500, 230, drawer)} 830) scale(0.55)`} opacity={drawer * (1 - pr(t, B.l8 - 0.2, 0.4))}><Drawer open={pr(t, B.shopped, 0.5)} /></g>
      <Word t={t} at={B.l6 + 0.6} text="Dr. Crippen" x={830} y={960} s={28} out={B.drug} />
      <Word t={t} at={B.scientist + 0.2} text="scientist" x={230} y={960} s={34} out={B.bought + 0.4} />
      <Word t={t} at={B.bought + 0.1} text="bought by the doctor" x={760} y={600} s={30} out={B.l7 + 0.2} />
      <Word t={t} at={B.pajama} text="pajama piece" x={380} y={560} s={30} out={B.shopped + 0.2} />
      <Word t={t} at={B.shopped} text="the doctor's shop" x={760} y={600} s={30} out={B.l8 - 0.2} />
      {/* the verdict: the Daily Wire headline flips GUILTY above the jury, the clerk's ledger closes */}
      <g transform={`translate(330 ${lerp(-200, 790, pr(t, B.guilty - 0.1, 0.5, back))}) rotate(-4) scale(0.4)`}>
        <K.dailyWire fr={fr} headline={t > B.guilty ? 'GUILTY' : ''} w={760} />
      </g>
      <g transform={`translate(${560} ${1180}) scale(0.5)`} opacity={pr(t, B.death - 0.5, 0.4)}><Ledger close={close} /></g>
    </Camera>
  );
};

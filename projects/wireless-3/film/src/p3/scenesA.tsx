// Part 3, lines 1-9: recap -> title -> the pilot is Dew -> "Good morning" -> Ethel -> London -> the court and the scales.
import React from 'react';
import {Camera, Layer} from '../kit/camera';
import {T, FONT} from './tok';
import {B, F, pr, win, lerp, swing, keyv, rnd, inOut, back} from './util';
import {Sh, R, WR, Txt, Ring3, BaileyOutside, Court, DockRail, Scales, DrugBottle, ReportCard, Scientist1910, ChemistWindow, PoisonsBook, PyjamaScrap, JonesShop, Drawer, Ledger, RubberStamp, Pigeons} from './props';
import {K} from './K';

export type S = {t: number; fr: number};

// a printed word on a thing (first naming): newsprint ribbon with ink type, swings in
export const Word: React.FC<{t: number; at: number; text: string; x: number; y: number; s?: number; out?: number; rot?: number}> = ({t, at, text, x, y, s = 34, out = 99, rot = 0}) => {
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
export const Gulls: React.FC<{t: number; n?: number; seed?: string; x?: number; y?: number; w?: number}> = ({t, n = 4, seed = 'g', x = 0, y = 300, w = 1400}) => (
  <g>{Array.from({length: n}, (_, i) => {
    const sp = 40 + rnd(seed + i) * 50;
    const gx = x - 200 + ((rnd(seed + 'x' + i) * w + t * sp) % w), gy = y + rnd(seed + 'y' + i) * 260 + Math.sin(t * 1.2 + i * 2) * 30;
    const f = Math.sin(t * (7 + i) + i);
    return <path key={i} d={`M${gx - 26},${gy + f * 10} Q${gx - 12},${gy - 10} ${gx},${gy} Q${gx + 12},${gy - 10} ${gx + 26},${gy + f * 10}`} stroke={T.ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
  })}</g>
);
export const Fog: React.FC<{fr: number; y1?: number; y2?: number}> = ({fr, y1 = 700, y2 = 1350}) => (
  <g><K.fogBand fr={fr} y={y1} speed={0.6} /><K.fogBand fr={fr} y={y2} speed={-0.4} /></g>
);

// ---------- 0. Recap: P2's brim close-up turns out to be an engraving on the Daily Wire (31 July 1910) ----------
// panel R4 RaceOvertake (top) slides in on "raced across", R5 LadderShadow (bottom) holds the brim.
export const PanelR5: React.FC<{t: number; fr: number; capLift?: number}> = ({t, fr, capLift = 0}) => (
  <g>
    <rect x={-210} y={-170} width={420} height={340} fill={T.mist} />
    {/* hull, ladder, climber, bowler shadow */}
    <Sh d="M-210,-170 h300 v340 h-300 z" fill={T.slate} shade sw={0} />
    {Array.from({length: 3}, (_, i) => <circle key={i} cx={-160 + i * 90} cy={-120} r={14} fill={T.lamp} stroke={T.ink} strokeWidth={2.5} />)}
    <g transform={`rotate(${Math.sin(t * 2.2) * 3} 40 -170)`}>
      <path d="M20,-170 V170 M60,-170 V170" stroke={T.newsprint} strokeWidth={4} />
      {Array.from({length: 8}, (_, i) => <path key={i} d={`M20,${-150 + i * 42} h40`} stroke={T.newsprint} strokeWidth={4} />)}
      <g transform={`translate(40 ${30 - Math.min(1, t / 3) * 30})`}>
        <K.dewPilot fr={fr} h={150} pose="climb" />
      </g>
    </g>
    <path d="M-60,-10 q30,-50 60,0 h20 v8 h-100 v-8 z" fill={T.deep} opacity={0.45} />
    <rect x={-210} y={-170} width={420} height={340} fill="none" stroke={T.ink} strokeWidth={4} />
  </g>
);
export const PanelR4: React.FC<{t: number; fr: number; hop: number}> = ({t, fr, hop}) => (
  <g>
    <rect x={-210} y={-150} width={420} height={300} fill={T.newsprint} />
    <g transform="scale(0.5)"><K.raceMap fr={fr} w={820} /></g>
    {/* two tokens: Laurentic (cora pennant) hops past the Montrose (moustache perched) */}
    <g transform={`translate(${lerp(-120, 110, hop)} ${-20 - Math.abs(Math.sin(hop * Math.PI * 3)) * 26})`}>
      <Sh d="M-34,0 h68 l-10,22 h-48 z" fill={T.newsprint} sw={2.5} /><path d="M0,0 v-40" stroke={T.ink} strokeWidth={3} /><path d="M0,-40 l28,8 l-28,8 z" fill={T.cora} stroke={T.ink} strokeWidth={2} />
    </g>
    <g transform="translate(40 40)">
      <Sh d="M-34,0 h68 l-10,22 h-48 z" fill={T.slate} sw={2.5} />
      <g transform={`translate(0 ${-14 + Math.sin(t * 6) * 2})`}><K.moustache fr={fr} state="perch" size={0.35} /></g>
    </g>
    <rect x={-210} y={-150} width={420} height={300} fill="none" stroke={T.ink} strokeWidth={4} />
  </g>
);
export const Recap: React.FC<S> = ({t, fr}) => {
  const slideR4 = pr(t, B.raced - 0.3, 0.5);
  const keys: [number, Partial<{x: number; y: number; zoom: number; rot: number}>][] = [
    [0, {x: 680, y: 1180, zoom: 5.5}], [F(2.2), {x: 600, y: 1080, zoom: 1.35}], [F(B.l1), {x: 560, y: 1080, zoom: 1.1}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.deep}>
      <Layer depth={0.3}><rect x={-600} y={-600} width={2400} height={3200} fill={T.slate} />
        {Array.from({length: 14}, (_, i) => <rect key={i} x={-400 + i * 140} y={-400} width={60} height={3000} fill={T.deep} opacity={0.35} />)}</Layer>
      <g transform={`translate(560 1080) rotate(${Math.sin(t * 0.6) * 1.2})`}>
        <K.dailyWire fr={fr} date="31 July 1910" w={880} />
        <g transform={`translate(${lerp(-700, -200, slideR4)} -120) rotate(-2)`}><PanelR4 t={t} fr={fr} hop={pr(t, B.raced, 1.6, inOut)} /></g>
        <g transform="translate(120 250) rotate(1.5)"><PanelR5 t={t} fr={fr} /></g>
        <Word t={t} at={B.climbed} text="the pilot" x={130} y={460} s={30} />
      </g>
      {/* the hand holding the paper: fog drifts */}
      <Fog fr={fr} y1={600} y2={1500} />
    </Camera>
  );
};

// ---------- 1. Title: the clerk's stamp thumps the subtitle; the ripple lifts the engraved pilot's cap; push into R5 ----------
export const Title: React.FC<S> = ({t, fr}) => {
  const ripple = pr(t, B.part - 0.1, 0.8);
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l1), {x: 560, y: 1080, zoom: 1.1}], [F(B.verdict), {x: 650, y: 1300, zoom: 1.6}], [F(B.l2), {x: 680, y: 1330, zoom: 6}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.deep}>
      <Layer depth={0.3}><rect x={-600} y={-600} width={2400} height={3200} fill={T.slate} />
        {Array.from({length: 14}, (_, i) => <rect key={i} x={-400 + i * 140} y={-400} width={60} height={3000} fill={T.deep} opacity={0.35} />)}</Layer>
      <g transform={`translate(560 1080) rotate(${Math.sin(t * 0.6) * 1.2}) scale(${1 + Math.sin(ripple * Math.PI) * 0.015})`}>
        <K.dailyWire fr={fr} date="31 July 1910" w={880} />
        <g transform="translate(-200 -120) rotate(-2)"><PanelR4 t={t} fr={fr} hop={1} /></g>
        <g transform={`translate(120 250) rotate(1.5)`}><PanelR5 t={t} fr={fr} capLift={ripple} /></g>
        {/* ripple ring spreading out from the stamp */}
        {ripple > 0 && ripple < 1 && <circle cx={0} cy={-330} r={ripple * 900} fill="none" stroke={T.ink} strokeWidth={6 * (1 - ripple)} opacity={0.5} />}
      </g>
      <Fog fr={fr} y1={600} y2={1500} />
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
      <Layer depth={0.2}>
        <rect x={-800} y={-800} width={2700} height={1900} fill={T.fog} />
        <circle cx={850} cy={620} r={110} fill={T.lamp} opacity={0.85} />
        <circle cx={850} cy={620} r={300} fill="url(#p3-lamp)" opacity={0.6} />
        {/* far shore: Father Point lighthouse beam */}
        <path d="M-400,880 Q100,800 600,860 T1500,840 V1100 H-400 Z" fill={T.mist} opacity={0.7} />
        <g transform="translate(120 820)"><Sh d="M-14,0 L-10,-110 H10 L14,0 Z" fill={T.newsprint} sw={2} /><path d={`M0,-110 L${Math.cos(t * 1.6) * 600},${-110 + Math.sin(t * 1.6) * 40}`} stroke={T.lamp} strokeWidth={14} opacity={0.35} /></g>
      </Layer>
      <Layer depth={0.5}><K.sea fr={fr} sky="dawn" /><Gulls t={t} n={4} y={200} /></Layer>
      <g>
        <g transform="translate(540 1060)"><K.montroseDeck fr={fr} /></g>
        <g transform={`translate(${230 + Math.sin(t * 0.8) * 4} 1460)`}><K.passenger fr={fr} kind="parasol" h={430} /></g>
        <g transform="translate(860 1440)"><K.kendall fr={fr} pose={t > B.disguise - 0.2 ? 'nod' : 'stand'} h={640} facing={-1} /></g>
        <g transform="translate(520 1500)">
          <K.dewPilot fr={fr} pose="liftCap" capLift={pop} h={720} feather={pr(t, B.dew + 0.2, 0.4)} />
        </g>
        <Word t={t} at={B.dew} text="Inspector Dew" x={520} y={1150} s={36} />
      </g>
      <Layer depth={1.4}><path d={`M-200,1640 H1400`} stroke={T.deep} strokeWidth={26} /><path d="M-200,1600 H1400" stroke={T.ink} strokeWidth={6} />
        {Array.from({length: 10}, (_, i) => <path key={i} d={`M${-150 + i * 170},1600 v60`} stroke={T.ink} strokeWidth={8} />)}</Layer>
      <Fog fr={fr} y1={760} y2={1300} />
    </Camera>
  );
};

// ---------- 3. The captain's cabin: "Good morning, Doctor Crippen." The Moustache flies in the porthole and lands: click ----------
export const Cabin: React.FC<S> = ({t, fr}) => {
  const rise = pr(t, B.near, 0.6);
  const fly = pr(t, B.crippen - 0.15, 0.7, inOut);
  const mx = lerp(840, 610, fly), my = lerp(560, 1010, fly) - Math.sin(fly * Math.PI) * 220;
  const wide = pr(t, B.crippen + 0.55, 0.2);
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l3), {x: 420, y: 1000, zoom: 1.35}], [F(B.near + 0.6), {x: 540, y: 980, zoom: 1.0}], [F(B.crippen + 0.6), {x: 600, y: 980, zoom: 1.25}],
    [F(B.l4 - 0.4), {x: 620, y: 960, zoom: 1.6}], [F(B.l4), {x: 620, y: 925, zoom: 5}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.slate}>
      <g transform="translate(540 960)"><K.cabin fr={fr} kind="captain" /></g>
      {/* the porthole with the moving sea */}
      <g transform="translate(840 560)">
        <circle r={96} fill={T.mist} />
        <path d={`M-96,${20 + Math.sin(t * 2) * 8} Q-40,${0 + Math.sin(t * 2.4) * 10} 0,${20} T96,${16 + Math.sin(t * 2) * 8} V96 H-96 Z`} fill={T.deep} />
        <circle r={96} fill="none" stroke={T.newsprint} strokeWidth={18} /><circle r={96} fill="none" stroke={T.ink} strokeWidth={4} />
      </g>
      <g transform="translate(200 1500)"><K.kendall fr={fr} pose="stand" h={600} /></g>
      <g transform={`translate(${lerp(130, 330, pr(t, B.l3, 1.2))} 1520)`}><K.dew fr={fr} pose="walk" h={760} feather={1} /></g>
      <g transform={`translate(640 ${1520 + (1 - rise) * 60})`}><K.robinson fr={fr} pose={rise < 1 ? 'rise' : 'stand'} expr={wide > 0 ? 'startled' : 'neutral'} h={610} facing={-1} /></g>
      <g transform={`translate(${mx} ${my}) rotate(${(1 - fly) * 40})`}><K.moustache fr={fr} state={fly < 1 ? 'fly' : 'land'} size={0.55} /></g>
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
    [F(B.l4), {x: 540, y: 820, zoom: 2.4}], [F(B.l4 + 0.5), {x: 540, y: 820, zoom: 1.2}], [F(B.ethel - 0.6), {x: 600, y: 860, zoom: 1.3}],
    [F(B.ethel - 0.1), {x: 610, y: 870, zoom: 8}], [F(B.ethel + 0.05), {x: 540, y: 1100, zoom: 1.6}], [F(B.l5), {x: 540, y: 1100, zoom: 1.15}],
  ];
  const inCabin = t >= B.ethel - 0.1;
  return (
    <Camera fr={fr} keys={keys} background={T.newsprint}>
      {!inCabin ? (
        <g>
          <g transform="translate(540 860)"><K.raceMap fr={fr} w={1100} /></g>
          <g transform={`translate(${lerp(340, 560, bump)} ${880 - Math.abs(Math.sin(bump * Math.PI * 2)) * 30})`}>
            <Sh d="M-50,0 h100 l-14,30 h-72 z" fill={T.newsprint} sw={3} /><path d="M0,0 v-56" stroke={T.ink} strokeWidth={3} /><path d="M0,-56 l38,10 l-38,10 z" fill={T.cora} stroke={T.ink} strokeWidth={2} />
          </g>
          <g transform="translate(640 880)">
            <Sh d="M-50,0 h100 l-14,30 h-72 z" fill={T.slate} sw={3} />
            {/* the Montrose token's porthole: the carrier into Ethel's cabin */}
            <circle cx={-30} cy={14} r={8} fill={T.lamp} stroke={T.ink} strokeWidth={2} />
          </g>
          <g transform={`translate(720 780) scale(${flag})`}><path d="M0,0 V-120" stroke={T.ink} strokeWidth={5} />
            {Array.from({length: 4}, (_, i) => Array.from({length: 3}, (_, j) => <rect key={i + '' + j} x={i * 22} y={-120 + j * 20 + Math.sin(t * 6 + i) * 3} width={22} height={20} fill={(i + j) % 2 ? T.ink : T.newsprint} />))}</g>
          <Word t={t} at={B.over + 0.3} text="caught" x={600} y={1040} s={40} />
          {Array.from({length: 5}, (_, i) => <path key={i} d={`M${200 + i * 160},${1200 + Math.sin(t * 2 + i) * 10} q40,-20 80,0 t80,0`} stroke={T.slate} strokeWidth={4} fill="none" />)}
        </g>
      ) : (
        <g>
          <g transform="translate(540 1000)"><K.cabin fr={fr} kind="passenger" /></g>
          <g transform="translate(800 680)"><circle r={80} fill={T.lamp} opacity={0.5 + 0.2 * Math.sin(t * 2)} /><circle r={80} fill="none" stroke={T.newsprint} strokeWidth={14} /></g>
          <g transform={`translate(${lerp(980, 820, pr(t, B.ethel, 0.8))} 1520)`}><K.passenger fr={fr} kind="Canadian police" h={640} /></g>
          <g transform={`translate(420 ${1520 - stand * 40})`}><K.ethelB fr={fr} pose={stand > 0.5 ? 'stand' : 'sitRead'} expr="calm" h={560} /></g>
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
    [F(B.bailey + 0.3), {x: 540, y: 760, zoom: 1.0}], [F(B.l6 - 0.3), {x: 664, y: 600, zoom: 2.6}], [F(B.l6), {x: 664, y: 600, zoom: 4}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.fog}>
      <Layer depth={0.3}><rect x={-800} y={-800} width={2700} height={3500} fill={T.fog} /><Gulls t={t} n={3} y={200} seed="lg" /></Layer>
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
      {/* the Old Bailey rises behind him */}
      <g transform={`translate(540 ${1300 - bailey * 120}) scale(${0.62 * bailey})`} opacity={Math.min(1, bailey * 3)}>
        <BaileyOutside t={t} />
      </g>
      {/* the doctor (Mr Robinson's face, no moustache now) shakes his head: "I didn't do it." */}
      <g transform={`translate(${300} ${1560}) rotate(${shake * 2})`} opacity={1 - pr(t, B.trial + 0.4, 0.5)}>
        <K.robinson fr={fr} pose="shakeHead" h={520} />
      </g>
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
    [F(B.l6), {x: 540, y: 520, zoom: 4}], [F(B.l6 + 0.9), {x: 540, y: 700, zoom: 1.05}], [F(B.drug + 0.5), {x: 400, y: 820, zoom: 1.15}],
    [F(B.bought), {x: 380, y: 900, zoom: 1.0}], [F(B.l7), {x: 460, y: 960, zoom: 0.98}], [F(B.store), {x: 560, y: 900, zoom: 1.08}],
    [F(B.l8 - 0.2), {x: 540, y: 1000, zoom: 0.92}], [F(B.guilty), {x: 420, y: 1130, zoom: 1.15}], [F(B.law), {x: 560, y: 1080, zoom: 1.0}],
    [F(B.l9 - 0.3), {x: 635, y: 1180, zoom: 1.7}], [F(B.l9), {x: 635, y: 1180, zoom: 4.2}],
  ];
  // world: court floor at y 1300..; scales pivot at (540, 380)
  return (
    <Camera fr={fr} keys={keys} background={T.slate}>
      <g transform="translate(540 1080)"><Court t={t} lean={lean} foreman={foreman} dim={dim} /></g>
      {/* the dock (right) with the doctor */}
      <g transform="translate(830 1500)">
        <K.robinson fr={fr} pose="dock" expr={t > B.guilty ? 'blank' : 'neutral'} h={470} />
        <DockRail />
      </g>
      {/* Dew in the gallery, notebook with the Feather bookmark, lowers it at the verdict */}
      <g transform="translate(130 1560)"><K.dew fr={fr} pose={t > B.guilty ? 'lowerNotebook' : 'write'} h={600} feather={1} /></g>
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
        <g transform={`translate(${240} ${-260 - pr(t, B.drug - 0.3, 0.5, back) * 140})`}><ReportCard /></g>
      </g>
      <g transform={`translate(${lerp(-500, 200, chem)} 820) scale(0.55)`} opacity={chem * (1 - pr(t, B.l7 - 0.2, 0.4))}><ChemistWindow t={t} /></g>
      <g transform={`translate(${lerp(1500, 860, book)} 760) scale(0.5) rotate(4)`} opacity={book * (1 - pr(t, B.l7 + 0.3, 0.4))}><PoisonsBook t={t} flip={pr(t, B.winter - 0.4, 0.7)} ring={pr(t, B.winter + 0.2, 0.5)} /></g>
      <g transform={`translate(${lerp(1500, 860, shop)} 800) scale(0.5)`} opacity={shop * (1 - pr(t, B.l8 - 0.2, 0.4))}><JonesShop t={t} /></g>
      <g transform={`translate(${lerp(-500, 230, drawer)} 830) scale(0.55)`} opacity={drawer * (1 - pr(t, B.l8 - 0.2, 0.4))}><Drawer open={pr(t, B.shopped, 0.5)} /></g>
      <Word t={t} at={B.scientist + 0.2} text="scientist" x={230} y={1020} s={30} out={B.bought + 0.6} />
      {/* the verdict: the Daily Wire headline flips GUILTY above the jury, the clerk's ledger closes */}
      <g transform={`translate(330 ${lerp(-200, 560, pr(t, B.guilty - 0.1, 0.5, back))}) rotate(-4) scale(0.42)`}>
        <K.dailyWire fr={fr} headline={t > B.guilty ? 'GUILTY' : ''} w={760} />
      </g>
      <g transform={`translate(${560} ${1180}) scale(0.5)`} opacity={pr(t, B.death - 0.5, 0.4)}><Ledger close={close} /></g>
    </Camera>
  );
};

// Adapter between part 3's scenes and the shared kit (src/series, copied from wireless-kit/film-kit; commit in
// PLAN.md "Kit adoption"). Every kit character, device and card goes through K.*, so a kit re-copy touches only this
// file. Items the kit snapshot does not have yet (sea, Montrose sets, cabins, race map, hunch bulb) are drawn here in
// the kit's style with the kit's Ink and swapped for the kit's own when they land. Names here are lowercase members of
// K, never kit export names.
import React from 'react';
import {C, FONT} from '../series/tokens';
import {Ink, Print, FogBand} from '../series/look';
import {rrect, ellipse} from '../series/util';
import {DewA, DewB, Kendall, CrippenB, EthelA, EthelB, Newsboy, Passenger, CoraCameo} from '../series/cast';
import type {PassengerKind} from '../series/cast';
import {Puppet} from '../series/puppet';
import type {PoseName, Expr} from '../series/puppet';
import {Spark} from '../series/spark';
import {Moustache, Feather, DailyWire, DAILY_WIRE} from '../series/devices';
import type {MoustacheState, FeatherState, PanelFn} from '../series/devices';

type Fig = {fr: number; pose?: string; expr?: string; facing?: 1 | -1; h?: number; [k: string]: unknown};
const P = (s?: string) => s as PoseName | undefined;
const E = (s?: string) => (s === 'smallSmile' ? 'smile' : s) as Expr | undefined;

export const K = {
  // ---- cast (feet at 0,0 of the current <g>)
  dew: (p: Fig & {feather?: number | boolean}) => <DewA fr={p.fr} x={0} y={0} height={p.h} facing={p.facing} pose={P(p.pose === 'lowerNotebook' ? 'stand' : p.pose)} expr={E(p.expr)} feather={p.feather !== 0 && p.feather !== false} hold={p.pose === 'lowerNotebook' ? 'notebook' : undefined} />,
  dewPilot: (p: Fig & {capLift?: number; feather?: number}) => <DewB fr={p.fr} x={0} y={0} height={p.h} facing={p.facing} pose={P(p.pose)} expr={E(p.expr)} bowlerPop={p.capLift ?? 0} pocketFeather={(p.feather ?? 0) < 0.5} />,
  kendall: (p: Fig) => <Kendall fr={p.fr} x={0} y={0} height={p.h} facing={p.facing} pose={P(p.pose)} expr={E(p.expr)} />,
  robinson: (p: Fig & {moustache?: MoustacheState | 'none'; moustacheAt?: number; hat?: boolean}) =>
    <CrippenB fr={p.fr} x={0} y={0} height={p.h} facing={p.facing} pose={P(p.pose === 'rise' ? 'startled' : p.pose)} expr={E(p.expr)} moustache={p.moustache} moustacheAt={p.moustacheAt} hat={p.hat} />,
  ethelB: (p: Fig) => <EthelB fr={p.fr} x={0} y={0} height={p.h} facing={p.facing} pose={P(p.pose)} expr={E(p.expr)} />,
  ethelA: (p: Fig & {hair?: 'bun' | 'bob'; coat?: boolean}) => <EthelA fr={p.fr} x={0} y={0} height={p.h} facing={p.facing} pose={P(p.pose)} expr={E(p.expr)} hair={p.hair} coat={p.coat} />,
  newsboy: (p: Fig) => <Newsboy fr={p.fr} x={0} y={0} height={p.h} facing={p.facing} pose={P(p.pose)} />,
  passenger: (p: Fig & {kind: string}) => p.kind === 'Canadian police'
    ? <Puppet fr={p.fr} x={0} y={0} height={p.h ?? 720} facing={p.facing ?? -1} pose={P(p.pose ?? 'talk')} expr="calm" seed={3}
        look={{hair: C.slate, hairStyle: 'short', coat: C.deep, coatLen: -220, legs: C.deep, build: 1.05, hat: 'captain', hatColor: C.deep, moustache: 'clipped', shirt: C.newsprint}} />
    : <Passenger fr={p.fr} x={0} y={0} height={p.h} facing={p.facing} kind={p.kind as PassengerKind} />,
  // ---- devices (centred / based at 0,0)
  spark: (p: {fr: number; size?: number; mode?: string}) => <Spark fr={p.fr} x={0} y={0} size={p.size} mode={(p.mode ?? 'idle') as 'idle'} />,
  moustache: (p: {fr: number; state?: string; size?: number; at?: number; tilt?: number}) => <Moustache fr={p.fr} x={0} y={0} size={p.size} state={p.state as MoustacheState} at={p.at} tilt={p.tilt} />,
  // Feather base of quill at (0,0) for 'float'; for the question mark, the "?" body sits above (0,0)
  feather: (p: {fr: number; state?: string; size?: number; curl?: number; rot?: number}) => <Feather fr={p.fr} x={0} y={0} size={p.size} state={p.state as FeatherState} t={p.curl} rot={p.rot} />,
  // Daily Wire centred at (0,0), w wide
  dailyWire: (p: {fr: number; date?: string; prevDate?: string; dateAt?: number; headline?: string; prevHeadline?: string; headlineAt?: number; w?: number; panels?: PanelFn[]; panelAt?: number[]; engraving?: PanelFn; twist?: number}) => {
    const s = (p.w ?? 640) / DAILY_WIRE.w;
    return <DailyWire fr={p.fr} x={-DAILY_WIRE.w * s / 2} y={-DAILY_WIRE.h * s / 2} scale={s} date={p.date} prevDate={p.prevDate} dateAt={p.dateAt}
      headline={p.headline} prevHeadline={p.prevHeadline} headlineAt={p.headlineAt} panels={p.panels} panelAt={p.panelAt} engraving={p.engraving} twist={p.twist} />;
  },
  coraCameo: (p: {fr: number}) => <CoraCameo fr={p.fr} x={0} y={0} size={0.6} />,
  fogBand: (p: {fr: number; y: number; speed?: number}) => <FogBand fr={p.fr} y={p.y} speed={p.speed} op={0.55} />,

  // ---- stand-ins until the kit ships them (kit style: Ink, tokens) ----
  hunchBulb: (p: {fr: number; on?: number}) => (
    <Print><g>
      {(p.on ?? 0) > 0 && <circle r={70} fill="url(#wn-lamp)" opacity={p.on} />}
      <Ink d="M-30 10 Q-46 -20 -30 -46 Q0 -76 30 -46 Q46 -20 30 10 Z" fill={(p.on ?? 0) > 0.5 ? C.clue : C.newsprint} sw={4} />
      <Ink d={rrect(-18, 10, 36, 22, 4)} fill={C.mist} sw={3} />
    </g></Print>
  ),
  raceMap: (p: {fr: number; w?: number}) => {
    const w = p.w ?? 800, h = w * 0.62;
    return (
      <Print><g>
        <Ink d={rrect(-w / 2, -h / 2, w, h, 6)} fill={C.newsprint} sw={4} />
        {Array.from({length: 5}, (_, i) => <path key={i} d={`M${-w * 0.42 + i * w * 0.18},${h * 0.18 + Math.sin(p.fr * 0.08 + i) * 6} q${w * 0.04},-14 ${w * 0.08},0`} stroke={C.slate} strokeWidth={3} fill="none" />)}
        <path d={`M${-w * 0.42},${-h * 0.05} C${-w * 0.1},${-h * 0.25} ${w * 0.1},${h * 0.1} ${w * 0.4},${-h * 0.08}`} stroke={C.ink} strokeWidth={4} strokeDasharray="12 10" fill="none" />
        {Array.from({length: 7}, (_, i) => <Ink key={'q' + i} d={rrect(-w * 0.42 + i * w * 0.135 - 16, -h * 0.05 - 16 + Math.sin(i * 0.9) * h * 0.08, 32, 32, 4)} fill={C.fog} sw={2.5} />)}
        <text x={w * 0.36} y={-h * 0.2} fontFamily={FONT.display} fontSize={w * 0.04} textAnchor="middle" fill={C.ink}>FATHER POINT</text>
        <text x={-w * 0.36} y={-h * 0.2} fontFamily={FONT.period} fontStyle="italic" fontSize={w * 0.035} textAnchor="middle" fill={C.ink}>Liverpool</text>
      </g></Print>
    );
  },
  sea: (p: {fr: number; sky?: string}) => (
    <g>
      <rect x={-1200} y={980} width={3500} height={2200} fill={C.slate} />
      {Array.from({length: 3}, (_, L) => Array.from({length: 9}, (_, i) => (
        <path key={L + '-' + i} d={`M${-600 + ((i * 260 + p.fr * (1.2 + L) * 0.8) % 2400)},${1010 + L * 110} q50,-18 100,0 t100,0`} stroke={L === 2 ? C.deep : C.mist} strokeWidth={4 + L} fill="none" opacity={0.8} />
      )))}
    </g>
  ),
  montroseDeck: (p: {fr: number}) => (
    <Print><g>
      {/* bridge with the brass plate, mast, lifeboat, rails: deck floor at y 400 (local) */}
      <Ink d={rrect(-760, 400, 1520, 600)} fill={C.newsprint} sw={0} shade="T" />
      {Array.from({length: 12}, (_, i) => <path key={i} d={`M${-760 + i * 130},400 l-60,600`} stroke={C.ink} strokeOpacity={0.15} strokeWidth={3} />)}
      <Ink d={rrect(160, -260, 560, 420, 6)} fill={C.newsprint} shade="R" />
      {[0, 1, 2].map((i) => <Ink key={i} d={rrect(200 + i * 170, -200, 120, 100, 6)} fill={C.lamp} sw={3} />)}
      <Ink d={rrect(300, -30, 260, 60, 4)} fill={C.lamp} sw={3} />
      <text x={430} y={10} fontFamily={FONT.period} fontWeight={700} fontSize={26} textAnchor="middle" fill={C.ink}>Capt. H. G. Kendall</text>
      <Ink d={rrect(-720, -60, 380, 110, 50)} fill={C.newsprint} shade="B" />
      <path d="M-60,400 V-900" stroke={C.ink} strokeWidth={14} /><path d="M-60,400 V-900" stroke={C.slate} strokeWidth={7} />
      <path d="M-60,-860 L-900,-700" stroke={C.ink} strokeWidth={3} />
    </g></Print>
  ),
  montroseOutside: (p: {fr: number}) => (
    <Print><g>
      <Ink d="M-700,0 L700,0 L620,220 L-640,220 Z" fill={C.slate} shade="B" />
      <Ink d={rrect(-420, -140, 760, 140, 4)} fill={C.newsprint} shade="R" />
      <Ink d="M-60,-140 L-40,-380 L80,-380 L100,-140 Z" fill={C.fog} shade="R" />
      <Ink d={rrect(-48, -400, 136, 50, 4)} fill={C.deep} />
      {Array.from({length: 9}, (_, i) => <Ink key={i} d={ellipse(-560 + i * 130, 90, 14)} fill={C.lamp} sw={3} />)}
      <path d="M-500,-140 V-600 M520,-140 V-600" stroke={C.ink} strokeWidth={8} />
      <text x={-560} y={180} fontFamily={FONT.display} fontSize={56} fill={C.newsprint}>MONTROSE</text>
    </g></Print>
  ),
  cabin: (p: {fr: number; kind?: string}) => (
    <Print><g>
      {/* walls (panelled), floor, a bunk or the captain's desk; centred at (0,0), floor at y 560 */}
      <Ink d={rrect(-700, -1000, 1400, 1560)} fill={C.slate} sw={0} shade="none" />
      {Array.from({length: 8}, (_, i) => <Ink key={i} d={rrect(-660 + i * 170, -700, 140, 700, 6)} fill={C.slate} sw={2.5} shade="R" dots="far" />)}
      <Ink d={rrect(-700, 560, 1400, 500)} fill={C.deep} sw={0} />
      <path d="M-700,560 H700" stroke={C.ink} strokeWidth={5} />
      {p.kind === 'passenger'
        ? <g><Ink d={rrect(-640, 260, 520, 120, 10)} fill={C.newsprint} shade="B" /><Ink d={rrect(-640, 380, 520, 180, 4)} fill={C.mist} shade="R" /></g>
        : <g><Ink d={rrect(-660, 300, 420, 40, 4)} fill={C.mist} shade="B" /><Ink d={rrect(-640, 340, 40, 220)} fill={C.mist} /><Ink d={rrect(-300, 340, 40, 220)} fill={C.mist} />
            <Ink d={rrect(-600, 250, 140, 50, 4)} fill={C.newsprint} sw={3} /></g>}
    </g></Print>
  ),
};

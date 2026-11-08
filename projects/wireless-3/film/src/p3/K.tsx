// Adapter between part 3's scenes and the shared kit (src/series, copied from wireless-kit/film-kit; commit in
// PLAN.md "Kit adoption"). Every kit character, device and card goes through K.*, so a kit re-copy touches only this
// file. Since READY every set/prop here is the kit's own. Names here are lowercase members of
// K, never kit export names.
import React from 'react';
import {C, FONT} from '../series/tokens';
import {FogBand} from '../series/look';
import {DewA, DewB, Kendall, CrippenB, EthelA, EthelB, Newsboy, Passenger, CoraCameo} from '../series/cast';
import type {PassengerKind} from '../series/cast';
import {Puppet} from '../series/puppet';
import type {PoseName, Expr} from '../series/puppet';
import {Spark} from '../series/spark';
import {Sea, Montrose, MONTROSE_PTS, MontroseDeck, MontroseCabin, CABIN, RaceMap, raceSquare} from '../series/sets';
import {HunchBulb, SeaBirds, RopeLadder} from '../series/props';
import {Sky, Laurentic} from '../series/sets';
import {Constable} from '../series/cast';
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
        look={{hair: C.slate, hairStyle: 'short', coat: C.deep, coatLen: -220, legs: C.deep, build: 1.05, hat: 'cap', hatColor: C.deep, moustache: 'clipped', shirt: C.newsprint, trim: C.mist}} />
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
  dailyWireAt: (p: {fr: number; x: number; y: number; scale: number; date?: string; prevDate?: string; dateAt?: number; headline?: string; panels?: PanelFn[]; panelAt?: number[]; twist?: number}) =>
    <DailyWire fr={p.fr} x={p.x} y={p.y} scale={p.scale} date={p.date} prevDate={p.prevDate} dateAt={p.dateAt} headline={p.headline} panels={p.panels} panelAt={p.panelAt} twist={p.twist} />,
  coraCameo: (p: {fr: number}) => <CoraCameo fr={p.fr} x={0} y={0} size={0.6} />,
  fogBand: (p: {fr: number; y: number; speed?: number}) => <FogBand fr={p.fr} y={p.y} speed={p.speed} op={0.55} />,

  // ---- kit sets and props (READY 25550bc). Sets draw in frame coordinates (deck floor 1500; CABIN.porthole 540,700).
  hunchBulb: (p: {fr: number; at: number; size?: number}) => <HunchBulb fr={p.fr} x={0} y={0} at={p.at} size={p.size} />,
  // RaceMap centred at (0,0), w×w
  raceMap: (p: {fr: number; w?: number; laurentic?: number; montrose?: number; flag?: boolean; moustache?: boolean}) =>
    <g transform={`translate(${-(p.w ?? 600) / 2} ${-(p.w ?? 600) / 2})`}><RaceMap fr={p.fr} w={p.w} laurentic={p.laurentic} montrose={p.montrose} flag={p.flag} moustache={p.moustache} /></g>,
  raceSquare: (i: number, w: number): [number, number] => { const [x, y] = raceSquare(i, w); return [x - w / 2, y - w / 2]; },
  sea: (p: {fr: number; sky?: 'day' | 'night' | 'dawn'; horizon?: number; skyOn?: boolean}) => <Sea fr={p.fr} sky={p.sky} horizon={p.horizon} skyOn={p.skyOn} />,
  montroseDeck: (p: {fr: number; sky?: 'day' | 'night' | 'dawn'}) => <MontroseDeck fr={p.fr} sky={p.sky} />,
  montrose: (p: {fr: number; x: number; y: number; scale: number; lit?: boolean}) => <Montrose fr={p.fr} x={p.x} y={p.y} scale={p.scale} lit={p.lit} />,
  montrosePts: MONTROSE_PTS,
  cabin: (p: {fr: number; kind?: 'captain' | 'passenger'; door?: number; sky?: 'day' | 'night' | 'dawn'}) => <MontroseCabin fr={p.fr} kind={p.kind} door={p.door} sky={p.sky} />,
  cabinPts: CABIN,
  sky: (p: {kind: 'day' | 'night' | 'dawn'; y0?: number; h?: number}) => <Sky kind={p.kind} y0={p.y0} h={p.h} />,
  ropeLadder: (p: {fr: number; x: number; y: number; len?: number}) => <RopeLadder fr={p.fr} x={p.x} y={p.y} len={p.len} />,
  constable: (p: Fig) => <Constable fr={p.fr} x={0} y={0} height={p.h} facing={p.facing} pose={P(p.pose)} far />,
  seaBirds: (p: {fr: number; count?: number; area?: [number, number, number, number]; seed?: number; size?: number}) => <SeaBirds fr={p.fr} count={p.count} area={p.area} seed={p.seed} size={p.size} />,
};

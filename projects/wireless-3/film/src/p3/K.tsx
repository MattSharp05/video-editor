// Adapter between part 3's scenes and the shared kit (src/series, copied from wireless-kit/film-kit at READY).
// Every kit character, set, device and card the scenes use goes through K.*, so adopting (or re-copying) the kit
// touches only this file. Until READY these are labelled placeholder blocks for layout stills only.
import React from 'react';
import {T, FONT} from './tok';

type Fig = {fr: number; pose?: string; expr?: string; facing?: 1 | -1; h?: number; [k: string]: unknown};
const Ph: React.FC<{w: number; h: number; label: string; col?: string; anchor?: 'feet' | 'centre'}> = ({w, h, label, col = T.slate, anchor = 'feet'}) => (
  <g transform={anchor === 'feet' ? `translate(${-w / 2} ${-h})` : `translate(${-w / 2} ${-h / 2})`}>
    <rect width={w} height={h} rx={w * 0.3} fill={col} stroke={T.ink} strokeWidth={4} opacity={0.9} />
    <text x={w / 2} y={h * 0.25} fontFamily={FONT.ui} fontSize={Math.max(16, w / 6)} fill={T.newsprint} textAnchor="middle" fontWeight={700}>{label}</text>
  </g>
);
const fig = (label: string, w: number, h: number, col?: string) => (p: Fig) => <Ph w={(p.h ?? h) * (w / h)} h={p.h ?? h} label={label} col={col} />;

export const K = {
  // cast (feet at 0,0)
  dew: fig('DEW', 300, 760, T.deep),
  dewPilot: fig('PILOT', 300, 760, T.deep),
  kendall: fig('KENDALL', 260, 720, T.deep),
  robinson: fig('ROBINSON', 230, 610, T.mist),
  ethelB: fig('ETHEL B', 210, 560, T.slate),
  ethelA: fig('ETHEL A', 220, 640, T.newsprint),
  newsboy: fig('NEWSBOY', 200, 480, T.slate),
  clara: fig('CLARA', 260, 620, T.mist),
  passenger: (p: Fig & {kind: string}) => <Ph w={180} h={p.h ?? 520} label={p.kind} col={T.mist} />,
  // devices (centred at 0,0)
  spark: (p: {fr: number; size?: number; mode?: string}) => (
    <g><circle r={26 * (p.size ?? 1)} fill={T.sparkHalo} opacity={0.4} /><circle r={10 * (p.size ?? 1)} fill={T.spark} /><circle r={4 * (p.size ?? 1)} fill="#fff" /></g>
  ),
  moustache: (p: {fr: number; state?: string; size?: number}) => (
    <path transform={`scale(${p.size ?? 1})`} d="M-70,0 Q-40,-26 0,-8 Q40,-26 70,0 Q40,18 0,4 Q-40,18 -70,0 Z" fill={T.deep} stroke={T.ink} strokeWidth={3} />
  ),
  feather: (p: {fr: number; state?: string; size?: number; curl?: number}) => (
    <path transform={`scale(${p.size ?? 1})`} d="M0,120 Q-30,0 0,-160 Q40,0 0,120 Z" fill={T.cora} stroke={T.ink} strokeWidth={3} />
  ),
  dailyWire: (p: {fr: number; date?: string; headline?: string; w?: number; panels?: React.ReactNode[]; twist?: number}) => (
    <g><rect x={-(p.w ?? 900) / 2} y={-(p.w ?? 900) * 0.65} width={p.w ?? 900} height={(p.w ?? 900) * 1.3} fill={T.newsprint} stroke={T.ink} strokeWidth={4} />
      <text y={-(p.w ?? 900) * 0.5} fontFamily={FONT.head} fontSize={80} textAnchor="middle" fill={T.ink}>The Daily Wire</text>
      <text y={-(p.w ?? 900) * 0.42} fontFamily={FONT.period} fontSize={34} textAnchor="middle" fill={T.ink}>{p.date}</text>
      {p.headline && <text y={-(p.w ?? 900) * 0.3} fontFamily={FONT.head} fontSize={110} textAnchor="middle" fill={T.ink}>{p.headline}</text>}
    </g>
  ),
  raceMap: (p: {fr: number; w?: number}) => <Ph w={p.w ?? 800} h={(p.w ?? 800) * 0.6} label="RACE MAP" col={T.newsprint} anchor="centre" />,
  telescope: (p: {fr: number}) => <Ph w={240} h={50} label="telescope" col={T.newsprint} anchor="centre" />,
  hunchBulb: (p: {fr: number; on?: number}) => <circle r={40} fill={(p.on ?? 0) > 0.5 ? T.clue : 'none'} stroke={T.clue} strokeWidth={5} />,
  clueRing: (p: {fr: number; at: number; r: number}) => <circle r={p.r} fill="none" stroke={T.clue} strokeWidth={4} />,
  coraCameo: (p: {fr: number}) => <Ph w={110} h={140} label="CORA" col={T.cora} anchor="centre" />,
  // sets (drawn in their own world coordinates, see the kit README)
  sea: (p: {fr: number; sky?: string}) => <rect x={-1000} y={900} width={3000} height={2000} fill={T.deep} />,
  montroseDeck: (p: {fr: number}) => <Ph w={1400} h={500} label="MONTROSE DECK" col={T.slate} anchor="centre" />,
  montroseOutside: (p: {fr: number}) => <Ph w={1400} h={700} label="MONTROSE" col={T.slate} anchor="centre" />,
  cabin: (p: {fr: number; kind?: string}) => <Ph w={1300} h={1500} label={`CABIN ${p.kind ?? ''}`} col={T.slate} anchor="centre" />,
  wirelessRoom: (p: {fr: number}) => <Ph w={1100} h={1100} label="WIRELESS" col={T.slate} anchor="centre" />,
  fogBand: (p: {fr: number; y: number; speed?: number}) => <rect x={-2000} y={p.y - 80} width={5000} height={160} fill={T.fog} opacity={0.25} />,
};

// screen-space cards (kit): corner tab, plaque, subtitle, end card, honesty tag, captions, grade
export const Card = {
  cornerTab: (p: {fr: number; part: number}) => (
    <div style={{position: 'absolute', left: 48, top: 72, background: T.newsprint, padding: '8px 16px', fontFamily: FONT.ui, fontSize: 30, fontWeight: 600, color: T.ink}}>Caught by Wireless · Part 3 of 3</div>
  ),
};

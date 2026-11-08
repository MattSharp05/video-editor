import React from 'react';
import { C, FONT } from './tokens';
import { Glow, Layer } from './look';
import { clamp, easeOut, osc, pop, prog, rnd, rrect } from './util';
import { Spark } from './spark';

export type Part = 1 | 2 | 3;
export const PART_TITLES: Record<Part, string> = { 1: 'The missing singer', 2: 'The chase', 3: 'The verdict' };
export const PART_WORDS: Record<Part, string> = { 1: 'one', 2: 'two', 3: 'three' };
export const NEXT_TEXT: Record<Part, string> = { 1: 'NEXT: THE CHASE', 2: 'NEXT: THE VERDICT', 3: 'THE END' };
export const HONESTY_TAGS = ['Illustration', 'Some say…', 'As the captain told it', 'Short version'] as const;

/** <CornerTab fr part outAt?> — top-left tab from frame 0: "Caught by Wireless · Part N of 3" (x 48, y 72). */
export const CornerTab: React.FC<{ fr: number; part: Part; outAt?: number }> = ({ fr, part, outAt }) => {
  const out = outAt != null ? prog(fr, outAt, 10) : 0;
  const label = `Caught by Wireless · Part ${part} of 3`;
  const w = 36 + label.length * 15.6 + 24;
  return (
    <Layer>
      <g transform={`translate(${48 - out * (w + 60)} 72)`}>
        <path d={rrect(3, 2, w, 52, 6)} fill={C.deep} opacity={0.35} />
        <path d={rrect(0, 0, w, 52, 6)} fill={C.newsprint} stroke={C.ink} strokeWidth={2} />
        <circle cx={24} cy={26} r={7} fill={C.spark} opacity={0.6 + 0.4 * Math.abs(osc(fr, 40))} />
        <circle cx={24} cy={26} r={3} fill={C.sparkCore} />
        <text x={42} y={36} fontFamily={FONT.ui} fontWeight={600} fontSize={30} fill={C.ink}>{label}</text>
      </g>
    </Layer>
  );
};

// ---------- Title plaque: the Spark taps C-B-W and burns the plate's letters in ----------
const MORSE: Record<string, string> = { C: '-.-.', B: '-...', W: '.--' };
const GROUPS = ['CAUGHT', 'BY', 'WIRELESS'];
export type Tap = { fr: number; dur: number; kind: '.' | '-'; group: number; idx: number };
/**
 * titlePlaqueTimes(at=72) — the plaque schedule. Plate rises in at at-14; taps from `at` (2.4 s): dot 2 f, dash 4 f,
 * gap 1 f, letter gap 3 f → 11 taps end at at+46; burn glow cools by at+48 (4.0 s at the default). Use `taps` for
 * the Morse beep cues (MorseTap / titleCues in sound.ts).
 */
export const titlePlaqueTimes = (at = 72) => {
  const taps: Tap[] = []; let f = at;
  ['C', 'B', 'W'].forEach((L, g) => {
    MORSE[L].split('').forEach((k, i) => { const dur = k === '-' ? 4 : 2; taps.push({ fr: f, dur, kind: k as '.' | '-', group: g, idx: i }); f += dur + 1; });
    f += 2;
  });
  const groupStart = [0, 1, 2].map((g) => taps.find((t) => t.group === g)!.fr);
  const groupEnd = [0, 1, 2].map((g) => { const ts = taps.filter((t) => t.group === g); const l = ts[ts.length - 1]; return l.fr + l.dur; });
  return { plateIn: at - 14, taps, groupStart, groupEnd, settled: at + 48, sting: at - 14 };
};
const PLATE = { x: 120, y: 300, w: 840, h: 230 };
/** Rough Abril Fatface 92 px advance per letter (for placing the burning letters). */
const ABRIL_W: Record<string, number> = { C: 64, A: 70, U: 72, G: 70, H: 78, T: 62, B: 70, Y: 66, W: 96, I: 38, R: 70, E: 60, L: 58, S: 56, ' ': 28 };
/**
 * <TitlePlaque fr at?=72 outAt? offset?=[0,0] part?> — enamel plate (deep, 4 spark rivets, newsprint rule), 840×230,
 * centred, top y 300. Letters burn in group by group with the Spark's Morse taps, settled by at+48 (4.0 s).
 * outAt = end of line 2: the plate lifts out upwards (12 f). offset = your 0.6-parallax drift (px).
 */
export const TitlePlaque: React.FC<{ fr: number; at?: number; outAt?: number; offset?: [number, number] }> = ({ fr, at = 72, outAt, offset = [0, 0] }) => {
  const T = titlePlaqueTimes(at);
  const inP = prog(fr, T.plateIn, 12, easeOut);
  if (inP <= 0) return null;
  const lift = outAt != null ? prog(fr, outAt, 12) : 0;
  if (lift >= 1) return null;
  const y0 = PLATE.y + (1 - inP) * -60 - lift * 620 + offset[1];
  const text = GROUPS.join(' ');
  const widths = text.split('').map((ch) => ABRIL_W[ch] ?? 64);
  const total = widths.reduce((a, b) => a + b, 0);
  const scale = Math.min(1, 760 / total);
  let cx = PLATE.w / 2 - (total * scale) / 2;
  // which letter of each group is burnt, from taps
  const letters: React.ReactNode[] = [];
  let gi = 0, li = 0; let tapNow: Tap | undefined;
  for (const t of T.taps) if (fr >= t.fr && fr < t.fr + t.dur) tapNow = t;
  text.split('').forEach((ch, i) => {
    const w = widths[i] * scale;
    if (ch === ' ') { gi++; li = 0; cx += w; return; }
    const g = GROUPS[gi]; const gs = T.groupStart[gi], ge = T.groupEnd[gi];
    const burnAt = gs + ((ge - 6 - gs) * li) / Math.max(1, g.length - 1);
    const b = clamp((fr - burnAt) / 3);
    const glow = b > 0 ? clamp(1 - (fr - burnAt - 3) / 5) : 0;
    if (b > 0) letters.push(
      <g key={i} opacity={b}>
        {glow > 0 && <text x={cx + w / 2} y={PLATE.h / 2 + 32} textAnchor="middle" fontFamily={FONT.display} fontSize={92 * scale} fill="none" stroke={C.spark} strokeWidth={6} strokeOpacity={glow} strokeLinejoin="round">{ch}</text>}
        <text x={cx + w / 2} y={PLATE.h / 2 + 32} textAnchor="middle" fontFamily={FONT.display} fontSize={92 * scale} fill={glow > 0.5 ? C.sparkCore : C.newsprint}>{ch}</text>
      </g>);
    cx += w; li++;
  });
  // spark position: over the group being tapped (hops between groups), resting at plate right after
  const sparkGroup = fr < T.groupStart[1] - 1 ? 0 : fr < T.groupStart[2] - 1 ? 1 : 2;
  const gx = [200, 420, 620][sparkGroup];
  const sparkX = fr >= T.settled - 4 ? PLATE.w - 26 : gx; const sparkY = -26;
  const rivets: [number, number][] = [[26, 26], [PLATE.w - 26, 26], [26, PLATE.h - 26], [PLATE.w - 26, PLATE.h - 26]];
  return (
    <Layer>
      <g transform={`translate(${PLATE.x + offset[0]} ${y0})`}>
        <path d={rrect(6, 5, PLATE.w, PLATE.h, 18)} fill={C.ink} opacity={0.3} />
        <path d={rrect(0, 0, PLATE.w, PLATE.h, 18)} fill={C.deep} stroke={C.ink} strokeWidth={4} />
        <path d={rrect(0, 0, PLATE.w, PLATE.h, 18)} fill="url(#wn-htl)" />
        <path d={rrect(14, 14, PLATE.w - 28, PLATE.h - 28, 10)} fill="none" stroke={C.newsprint} strokeWidth={2.5} opacity={0.9} />
        {rivets.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={8} fill={C.spark} opacity={0.35} /><circle cx={x} cy={y} r={5} fill={C.spark} /><circle cx={x - 1.5} cy={y - 1.5} r={1.8} fill={C.sparkCore} /></g>)}
        {letters}
        {fr >= T.plateIn && fr < T.settled + 20 && (
          <g transform={`translate(${sparkX} ${sparkY})`}>
            <Spark fr={fr} x={0} y={0} size={tapNow ? 1.3 : 0.9} mode={tapNow ? 'tap' : 'idle'} />
            {tapNow && <Glow d={`M0 0 L0 ${tapNow.kind === '-' ? 40 : 22}`} k={0.6} />}
          </g>
        )}
      </g>
    </Layer>
  );
};

/**
 * <Subtitle fr at part outAt? beatAt?> — newsprint strip that stamps in under the plate on line 2
 * ("Part one · The missing singer"), Old Standard italic 52. Each part's beat of life (at beatAt, default at+18):
 * P1 footlights flash under it; P2 the letters of "The chase" sprint off to the right (they leave by beatAt+40);
 * P3 a clerk's rubber stamp thumps it. outAt: lifts out with the plate.
 */
export const Subtitle: React.FC<{ fr: number; at: number; part: Part; outAt?: number; beatAt?: number; offset?: [number, number] }> = ({ fr, at, part, outAt, beatAt, offset = [0, 0] }) => {
  if (fr < at) return null;
  const bA = beatAt ?? at + 18;
  const s = pop(fr, at, 12);
  const lift = outAt != null ? prog(fr, outAt, 12) : 0;
  if (lift >= 1) return null;
  const y = 548 - lift * 620 + offset[1];
  const head = `Part ${PART_WORDS[part]} · `;
  const title = PART_TITLES[part];
  const stampP = part === 3 ? prog(fr, bA - 8, 8) : 0;
  const thump = part === 3 && fr >= bA ? Math.exp(-(fr - bA) / 4) : 0;
  return (
    <Layer>
      <g transform={`translate(${540 + offset[0]} ${y + thump * 6}) scale(${0.6 + 0.4 * s} ${0.6 + 0.4 * s})`}>
        <path d={rrect(-372, 3, 750, 86, 4)} fill={C.ink} opacity={0.25} />
        <path d={rrect(-375, 0, 750, 86, 4)} fill={C.newsprint} stroke={C.ink} strokeWidth={2.5} />
        {part !== 2 ? (
          <text x={0} y={60} textAnchor="middle" fontFamily={FONT.period} fontStyle="italic" fontSize={52} fill={C.ink}>{head + title}</text>
        ) : (() => {
          // P2: every letter of "The chase" is its own runner (8 paths), sprinting off right from beatAt
          const cw = (ch: string) => (ch === ' ' ? 13 : ch === '·' ? 14 : /[A-Z]/.test(ch) ? 32 : 24);
          const all = head + title; const tot = all.split('').reduce((a, ch) => a + cw(ch), 0);
          let x = -tot / 2; const nodes: React.ReactNode[] = [];
          all.split('').forEach((ch, i) => {
            const w = cw(ch); const ti = i - head.length;
            let dx = 0, dy = 0;
            if (ti >= 0 && fr >= bA) { const run = clamp((fr - bA - ti * 2) / 26); dx = run * run * 820; dy = run > 0 && run < 1 ? -Math.abs(Math.sin(run * 16 + ti)) * 16 : 0; }
            nodes.push(<text key={i} x={x + w / 2 + dx} y={60 + dy} textAnchor="middle" fontFamily={FONT.period} fontStyle="italic" fontSize={52} fill={C.ink}>{ch}</text>);
            x += w;
          });
          return nodes;
        })()}
        {part === 1 && fr >= bA && Array.from({ length: 9 }, (_, i) => {
          const on = fr >= bA + i * 2; const fl = on ? 0.7 + 0.3 * Math.abs(osc(fr, 9, i * 0.17)) : 0;
          const x = -320 + i * 80;
          return <g key={i}><circle cx={x} cy={104} r={34} fill="url(#wn-lamp)" opacity={fl} /><path d={`M${x - 14} 104a14 10 0 0 1 28 0Z`} fill={on ? C.lamp : C.slate} stroke={C.ink} strokeWidth={2} /></g>;
        })}
        {part === 3 && fr >= bA - 8 && (
          <g transform={`translate(250 ${-120 + stampP * 110 - thump * 4})`} opacity={fr > bA + 16 ? clamp(1 - (fr - bA - 16) / 8) : 1}>
            <path d={rrect(-46, 40, 92, 26, 4)} fill={C.slate} stroke={C.ink} strokeWidth={3} />
            <path d={rrect(-14, -20, 28, 60, 6)} fill={C.newsprint} stroke={C.ink} strokeWidth={3} />
            <circle cx={0} cy={-30} r={22} fill={C.deep} stroke={C.ink} strokeWidth={3} />
          </g>
        )}
        {part === 3 && fr >= bA && <path d={rrect(160, 10, 190, 66, 6)} fill="none" stroke={C.deep} strokeWidth={4} opacity={0.7} strokeDasharray="10 5" />}
      </g>
    </Layer>
  );
};

/**
 * <EndCard fr at part? text?> — Marconi telegram form, newsprint 800×440, centred, top y 560 (x 140–940).
 * Slides up in 12 f, then types the body letter by letter (2 f/letter) in Courier Prime 64 with a blinking spark cursor.
 * endCardTimes(at, text) → {typeAt, typeEnd, letterFrames[]} for the tick sound.
 */
export const endCardTimes = (at: number, text: string) => {
  const typeAt = at + 14; const letterFrames = text.split('').map((_, i) => typeAt + i * 2).filter((_, i) => text[i] !== ' ');
  return { typeAt, typeEnd: typeAt + text.length * 2, letterFrames, minHoldEnd: typeAt + text.length * 2 + 60 };
};
export const EndCard: React.FC<{ fr: number; at: number; part?: Part; text?: string }> = ({ fr, at, part = 1, text }) => {
  if (fr < at) return null;
  const body = text ?? NEXT_TEXT[part];
  const T = endCardTimes(at, body);
  const up = prog(fr, at, 12, easeOut);
  const shown = clamp(Math.floor((fr - T.typeAt) / 2) + 1, 0, body.length);
  const y = 560 + (1 - up) * 500;
  const typed = body.slice(0, shown);
  const cursorOn = Math.floor(fr / 8) % 2 === 0 || fr < T.typeEnd;
  const cw = 64 * 0.6;
  const textW = body.length * cw;
  const x0 = 540 - textW / 2;
  return (
    <Layer>
      <g transform={`translate(140 ${y})`} opacity={up}>
        <path d={rrect(8, 7, 800, 440, 6)} fill={C.ink} opacity={0.3} />
        <path d={rrect(0, 0, 800, 440, 6)} fill={C.newsprint} stroke={C.ink} strokeWidth={3} />
        <path d={rrect(16, 16, 768, 408, 3)} fill="none" stroke={C.slate} strokeWidth={2} />
        <text x={400} y={74} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={34} letterSpacing={3} fill={C.deep} style={{ fontVariant: 'small-caps' }}>Wireless Telegram · Marconi</text>
        <line x1={50} y1={98} x2={750} y2={98} stroke={C.deep} strokeWidth={2} />
        {['Office of origin: S.S. ______', 'Words: __   Time: __'].map((l, i) => (
          <text key={i} x={56} y={140 + i * 36} fontFamily={FONT.period} fontStyle="italic" fontSize={24} fill={C.slate}>{l}</text>
        ))}
        {[300, 360].map((ly) => <line key={ly} x1={50} y1={ly} x2={750} y2={ly} stroke={C.mist} strokeWidth={2} />)}
        <text x={x0 - 140} y={290} fontFamily={FONT.wire} fontWeight={700} fontSize={64} fill={C.ink} style={{ whiteSpace: 'pre' }}>{typed}</text>
        {fr >= T.typeAt && cursorOn && (
          <g transform={`translate(${x0 - 140 + shown * cw + 6} 236)`}>
            <rect x={0} y={0} width={30} height={60} fill={C.spark} />
            <rect x={0} y={0} width={30} height={60} fill="none" stroke={C.sparkHalo} strokeWidth={6} strokeOpacity={0.4} />
          </g>
        )}
        <text x={750} y={410} textAnchor="end" fontFamily={FONT.period} fontSize={22} fill={C.slate}>Caught by Wireless</text>
      </g>
    </Layer>
  );
};

/**
 * <HonestyTag fr at text? x?=60 y?=1170 dur?> — newsprint ribbon, Hanken 600 28 ink, inside y 1150–1250.
 * Texts: "Illustration" | "Some say…" | "As the captain told it" | "Short version". dur undefined = stays.
 */
export const HonestyTag: React.FC<{ fr: number; at?: number; text?: string; x?: number; y?: number; dur?: number }> = ({ fr, at = 0, text = 'Illustration', x = 60, y = 1170, dur }) => {
  if (fr < at) return null;
  const inP = prog(fr, at, 8, easeOut); const out = dur != null ? prog(fr, at + dur, 8) : 0;
  if (out >= 1) return null;
  const w = 40 + text.length * 15;
  return (
    <Layer>
      <g transform={`translate(${x - (1 - inP) * 40} ${y})`} opacity={inP * (1 - out)}>
        <path d={`M0 0H${w}L${w - 14} 25L${w} 50H0Z`} fill={C.newsprint} stroke={C.ink} strokeWidth={2} />
        <text x={18} y={35} fontFamily={FONT.ui} fontWeight={600} fontSize={28} fill={C.ink}>{text}</text>
      </g>
    </Layer>
  );
};

import React, { useId } from 'react';
import { C, FONT } from './tokens';
import { Glow, Halftone, Ink, Print } from './look';
import { clamp, ease, easeOut, ellipse, lerp, osc, pop, polyD, prog, rnd, rrect, smoothPts, stepped } from './util';
import { Spark } from './spark';

// ---------------------------------------------------------------- The Runaway Moustache
export type MoustacheState = 'on' | 'twitch' | 'droop' | 'sob' | 'sweat' | 'bristle' | 'fly' | 'perch' | 'land';
export const MOUSTACHE_STATES: MoustacheState[] = ['on', 'twitch', 'droop', 'sob', 'sweat', 'bristle', 'fly', 'perch', 'land'];
/**
 * <Moustache fr x y size?=1 state at? tilt? facing?> — the doctor's big droopy deep moustache, eyes-free body language.
 * Native ~124 wide at size 1 (fits CrippenA's lip at near scale). State notes: twitch = right half jerks every 20 f;
 * droop/sob (sob shakes); sweat = 3 drops fall; bristle = spiky, lifted; fly = halves flap as wings (6-frame beat)
 * and bob; perch = folded, two tiny feet, `tilt` for "puzzled"; land = drops in from above from `at`, squash, click
 * at at+8 (moustacheLandFrame).
 */
export const moustacheLandFrame = (at: number) => at + 8;
export const Moustache: React.FC<{ fr: number; x: number; y: number; size?: number; state?: MoustacheState; at?: number; tilt?: number; facing?: 1 | -1 }> =
  ({ fr, x, y, size = 1, state = 'on', at = 0, tilt = 0, facing = 1 }) => {
    const f = stepped(fr, 2);
    let rotL = 0, rotR = 0, dy = 0, sx = 1, sy = 1, extra: React.ReactNode = null, rot = tilt;
    const shake = state === 'sob' ? osc(f, 4) * 3 : 0;
    switch (state) {
      case 'twitch': { const t = f % 20; rotR = t < 4 ? -16 : 0; rotL = t >= 2 && t < 4 ? -6 : 0; break; }
      case 'droop': rotL = 20; rotR = 20; dy = 4; break;
      case 'sob': rotL = 24 + osc(f, 6) * 6; rotR = 24 + osc(f, 6) * 6; dy = 6; break;
      case 'bristle': rotL = -12; rotR = -12; break;
      case 'fly': { const w = osc(f, 6); rotL = -8 + w * 38; rotR = -8 + w * 38; dy = -Math.abs(w) * 8 + osc(fr, 30) * 6; rot += osc(fr, 40) * 8; break; }
      case 'perch': rotL = -6; rotR = -6; extra = <g stroke={C.ink} strokeWidth={4} strokeLinecap="round"><path d="M-10 22 L-12 40 M-18 40 L-6 40" /><path d="M10 22 L12 40 M6 40 L18 40" /></g>; break;
      case 'land': { const t = clamp((fr - at) / 8); dy = -(1 - ease(t)) * 90; const sq = fr >= at + 8 ? Math.exp(-(fr - at - 8) / 3) : 0; sx = 1 + sq * 0.25; sy = 1 - sq * 0.25; break; }
    }
    const half = (side: 1 | -1, r: number) => {
      const bristles = state === 'bristle';
      const d = bristles
        ? `M0 0 C ${side * 18} -12 ${side * 46} -12 ${side * 60} 2 L${side * 66} 10 L${side * 58} 14 L${side * 62} 24 L${side * 50} 22 L${side * 50} 32 L${side * 38} 24 L${side * 34} 32 L${side * 24} 20 L${side * 16} 26 L${side * 10} 14 L0 14Z`
        : `M0 0 C ${side * 20} -12 ${side * 48} -10 ${side * 60} 6 C ${side * 66} 18 ${side * 62} 32 ${side * 52} 30 C ${side * 42} 20 ${side * 22} 15 0 13 Z`;
      return <g transform={`rotate(${r * side} 0 4)`}><Ink d={d} fill={C.deep} shade="B" sw={3.5} /><path d={`M${side * 10} 6 Q${side * 30} 4 ${side * 48} 14`} stroke={C.slate} strokeWidth={3} fill="none" strokeLinecap="round" /></g>;
    };
    return (
      <Print>
        <g transform={`translate(${x + shake * size} ${y + dy * size}) rotate(${rot}) scale(${size * sx * facing} ${size * sy})`}>
          {half(-1, rotL)}{half(1, rotR)}
          <Ink d={ellipse(0, 7, 9, 8)} fill={C.deep} sw={3} />
          {extra}
          {state === 'sweat' && [0, 1, 2].map((i) => { const t = ((fr + i * 11) % 30) / 30; return <Ink key={i} d={`M${-40 + i * 40} ${-10 + t * 50} q-7 12 0 16 q7 -4 0 -16Z`} fill={C.newsprint} sw={2.5} op={1 - t} />; })}
          {state === 'sob' && <path d={`M-58 26 q-4 14 0 20 M58 26 q4 14 0 20`} stroke={C.mist} strokeWidth={4} fill="none" opacity={0.8} />}
        </g>
      </Print>
    );
  };

// ---------------------------------------------------------------- Cora's Feather
export type FeatherState = 'onHat' | 'fall' | 'flag' | 'hatband' | 'pocketTip' | 'bookmark' | 'curlToQuestion' | 'float';
export const FEATHER_STATES: FeatherState[] = ['onHat', 'fall', 'flag', 'hatband', 'pocketTip', 'bookmark', 'curlToQuestion', 'float'];
const Q_SHAPE: [number, number][] = [[0, 0], [0, -0.22], [0.02, -0.4], [0.16, -0.52], [0.27, -0.68], [0.22, -0.86], [0.03, -0.95], [-0.17, -0.9], [-0.26, -0.76]];
/**
 * <Feather fr x y size?=1 state t? rot?> — one tall cora ostrich plume (base of the quill at x,y; ~300 tall at size 1).
 * Always bright, never wilted. States: onHat (bobs), fall (rocks side to side; you move x,y), flag (held high, waving),
 * hatband (small, tilted, tucked), pocketTip (only the tip shows above a pocket line at y), bookmark (lies flat, tip
 * out to the right), curlToQuestion (t 0..1 bends into a "?" and its dot appears at t>0.8; questionDot gives the dot
 * point for the Moustache), float (gentle sway, rising: you move y).
 */
export const questionDot = (x: number, y: number, size = 1): [number, number] => [x, y + 46 * size];
export const Feather: React.FC<{ fr: number; x: number; y: number; size?: number; state?: FeatherState; t?: number; rot?: number }> =
  ({ fr, x, y, size = 1, state = 'onHat', t = 1, rot = 0 }) => {
    const L = 300;
    let r = rot, bend = 0.35, from = 0, scale = size, extraY = 0;
    const f = fr;
    switch (state) {
      case 'onHat': r += osc(f, 28) * 6; bend = 0.45 + osc(f, 28) * 0.08; break;
      case 'fall': r += osc(f, 34) * 28; bend = 0.25 + osc(f, 34, 0.25) * 0.15; break;
      case 'flag': r += osc(f, 20) * 10; bend = 0.4 + osc(f, 14) * 0.25; break;
      case 'hatband': r += -38 + osc(f, 40) * 3; scale *= 0.55; bend = 0.4; break;
      case 'pocketTip': from = 0.68; bend = 0.3 + osc(f, 30) * 0.05; r += osc(f, 30) * 4; break;
      case 'bookmark': r += 90; from = 0.55; bend = 0.15; break;
      case 'float': r += osc(f, 50) * 8; bend = 0.3 + osc(f, 50, 0.2) * 0.1; break;
      case 'curlToQuestion': bend = 0.2; break;
    }
    // spine
    const N = 22; const spine: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N; let px = bend * s * s * L * 0.35, py = -s * L;
      if (state === 'curlToQuestion') {
        const q = smoothPts(Q_SHAPE, N)[i]; const k = ease(clamp(t));
        px = lerp(px, q[0] * L, k); py = lerp(py, q[1] * L, k);
      }
      spine.push([px, py]);
    }
    const start = Math.floor(from * N);
    const vis = spine.slice(start);
    const base = vis[0];
    const width = (s: number) => Math.pow(Math.sin(Math.PI * clamp((s - 0.1) / 0.92)), 0.7) * 0.2 * L;
    const left: [number, number][] = [], right: [number, number][] = [];
    const barbs: string[] = [];
    vis.forEach((p, j) => {
      const i = j + start; const s = i / N; const nx = spine[Math.min(N, i + 1)], pv = spine[Math.max(0, i - 1)];
      const dx = nx[0] - pv[0], dy = nx[1] - pv[1]; const l = Math.hypot(dx, dy) || 1; const ux = -dy / l, uy = dx / l;
      const w = width(s) * (1 + 0.12 * Math.sin(i * 2.3 + f * 0.15));
      const wb = (rnd(`fb${i}`) - 0.5) * 6;
      left.push([p[0] + ux * w + wb, p[1] + uy * w]); right.push([p[0] - ux * w - wb, p[1] - uy * w]);
      if (s > 0.14 && j % 1 === 0) barbs.push(`M${p[0].toFixed(1)} ${p[1].toFixed(1)} Q${(p[0] + ux * w * 0.6 + dx * 0.4).toFixed(1)} ${(p[1] + uy * w * 0.6 + dy * 0.4).toFixed(1)} ${(p[0] + ux * w * 0.95 + dx * 0.9).toFixed(1)} ${(p[1] + uy * w * 0.95 + dy * 0.9).toFixed(1)} M${p[0].toFixed(1)} ${p[1].toFixed(1)} Q${(p[0] - ux * w * 0.6 + dx * 0.4).toFixed(1)} ${(p[1] - uy * w * 0.6 + dy * 0.4).toFixed(1)} ${(p[0] - ux * w * 0.95 + dx * 0.9).toFixed(1)} ${(p[1] - uy * w * 0.95 + dy * 0.9).toFixed(1)}`);
    });
    const outline = polyD([...left, ...right.reverse()], true);
    const dotOn = state === 'curlToQuestion' ? clamp((t - 0.8) / 0.2) : 0;
    return (
      <Print>
        <g transform={`translate(${x} ${y + extraY}) rotate(${r}) scale(${scale}) translate(${-base[0] * (from ? 1 : 0)} ${-base[1] * (from ? 1 : 0)})`}>
          <Ink d={outline} fill={C.cora} sw={3.5} />
          <path d={barbs.join(' ')} stroke={C.ink} strokeOpacity={0.28} strokeWidth={2} fill="none" />
          <path d={polyD(vis)} stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
          {from === 0 && <path d={`M0 0 L${spine[2][0]} ${spine[2][1]}`} stroke={C.newsprint} strokeWidth={6} strokeLinecap="round" />}
          {dotOn > 0 && <Ink d={ellipse(0, 46, 18 * dotOn, 18 * dotOn)} fill={C.cora} sw={3.5} />}
        </g>
      </Print>
    );
  };

// ---------------------------------------------------------------- The Daily Wire
/** A panel slot draws in its own box coords (w × h): (fr, w, h) => node. Panels are framed engravings. */
export type PanelFn = (fr: number, w: number, h: number) => React.ReactNode;
export const DAILY_WIRE = { w: 640, h: 860 } as const;
/**
 * <DailyWire fr x y scale? rot? date prevDate? dateAt? headline prevHeadline? headlineAt? panels? panelAt? engraving?
 *   ad? raceMap? fold? twist?> — the 1910 front page (fictional paper), 640×860 native, top-left at (x,y).
 *  - date flips from prevDate at dateAt (flip-board); headline flips letter by letter at headlineAt.
 *  - panels: up to 3 PanelFn (slots 190×230 at y 330), each slides in at panelAt[i] (the recap clauses).
 *  - engraving: one big PanelFn (580×330) when there are no panels; ad: the "MONTROSE · sails for Canada" corner.
 *  - raceMap: a node drawn in a 600×600 box replacing the body (use <RaceMap>).
 *  - fold 0..1: folds in half (bottom flips up). twist 0..1: corkscrews (10 strips turn), for 1910 → 2007.
 */
export const DailyWire: React.FC<{
  fr: number; x?: number; y?: number; scale?: number; rot?: number; date?: string; prevDate?: string; dateAt?: number;
  headline?: string; prevHeadline?: string; headlineAt?: number; panels?: PanelFn[]; panelAt?: number[]; engraving?: PanelFn;
  ad?: boolean; raceMap?: React.ReactNode; fold?: number; twist?: number; place?: string;
}> = (p) => {
  const { fr, x = 0, y = 0, scale = 1, rot = 0, fold = 0, twist = 0 } = p;
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const W = DAILY_WIRE.w, H = DAILY_WIRE.h;
  const flipText = (txt: string, prev: string | undefined, at: number | undefined, X: number, Y: number, size: number, font: string, anchorW: number, fill = C.ink) => {
    if (at == null || prev == null || fr >= at + Math.max(txt.length, prev.length) * 1.5 + 6)
      return <text x={X + anchorW / 2} y={Y} textAnchor="middle" fontFamily={font} fontSize={size} fill={fill} textLength={txt.length * size * 0.62 > anchorW ? anchorW : undefined} lengthAdjust="spacingAndGlyphs">{txt}</text>;
    const n = Math.max(txt.length, prev.length);
    const cw = Math.min(anchorW / n, size * 0.66); const x0 = X + anchorW / 2 - (cw * n) / 2;
    return <g>{Array.from({ length: n }, (_, i) => {
      const a = txt[i] ?? ' ', b = prev[i] ?? ' ';
      const t = (fr - (at + i * 1.5)) / 6;
      let ch = b, sy = 1;
      if (t >= 1) ch = a; else if (t > 0) { ch = t < 0.5 ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(rnd(`fl${i}${Math.floor(fr / 2)}`) * 36)] : a; sy = Math.max(0.05, Math.abs(Math.cos(t * Math.PI))); }
      const cy = Y - size * 0.35;
      return <text key={i} x={x0 + cw * (i + 0.5)} y={Y} textAnchor="middle" fontFamily={font} fontSize={size} fill={fill} transform={sy !== 1 ? `translate(0 ${cy}) scale(1 ${sy}) translate(0 ${-cy})` : undefined}>{ch}</text>;
    })}</g>;
  };
  const textLines = (x0: number, y0: number, w: number, n: number, seed: string) => (
    <g>{Array.from({ length: n }, (_, i) => <rect key={i} x={x0} y={y0 + i * 16} width={w * (0.75 + rnd(`${seed}${i}`) * 0.25)} height={5} fill={C.slate} opacity={0.5} />)}</g>
  );
  const page = (
    <g>
      <path d={rrect(0, 0, W, H, 4)} fill={C.newsprint} stroke={C.ink} strokeWidth={3} />
      <text x={W / 2} y={92} textAnchor="middle" fontFamily={FONT.display} fontSize={78} fill={C.ink}>The Daily Wire</text>
      <line x1={24} y1={112} x2={W - 24} y2={112} stroke={C.ink} strokeWidth={3} />
      <text x={30} y={138} fontFamily={FONT.period} fontSize={20} fill={C.deep}>{p.place ?? 'LONDON'}</text>
      {flipText(p.date ?? '1910', p.prevDate, p.dateAt, W / 2 - 150, 138, 22, FONT.period, 300, C.deep)}
      <text x={W - 30} y={138} textAnchor="end" fontFamily={FONT.period} fontSize={20} fill={C.deep}>ONE PENNY</text>
      <line x1={24} y1={150} x2={W - 24} y2={150} stroke={C.ink} strokeWidth={1.5} />
      {p.raceMap ? <g transform="translate(20 170)">{p.raceMap}</g> : <>
        {p.headline && flipText(p.headline, p.prevHeadline, p.headlineAt, 30, 236, p.headline.length > 14 ? 54 : 70, FONT.display, W - 60)}
        {p.panels && p.panels.length ? p.panels.slice(0, 3).map((fn, i) => {
          const at = p.panelAt?.[i]; const sl = at == null ? 1 : prog(fr, at, 10, easeOut); if (sl <= 0) return null;
          const px = 26 + i * 200, py = 290;
          return <g key={i} transform={`translate(${px + (1 - sl) * 400} ${py})`} opacity={sl}>
            <rect x={0} y={0} width={190} height={240} fill={C.fog} stroke={C.ink} strokeWidth={3} />
            <svg x={0} y={0} width={190} height={240} viewBox="0 0 190 240" overflow="hidden">{fn(fr, 190, 240)}</svg>
            <rect x={0} y={0} width={190} height={240} fill="url(#wn-htf)" opacity={0.5} pointerEvents="none" />
          </g>;
        }) : p.engraving ? <g transform="translate(30 270)">
          <rect x={0} y={0} width={580} height={330} fill={C.fog} stroke={C.ink} strokeWidth={3} />
          <svg x={0} y={0} width={580} height={330} viewBox="0 0 580 330" overflow="hidden">{p.engraving(fr, 580, 330)}</svg>
        </g> : textLines(30, 280, 580, 8, 'top')}
        {textLines(30, 560 + (p.panels?.length ? 30 : 60), p.ad ? 330 : 580, 10, 'c1')}
        {p.ad && <g transform="translate(380 640)">
          <rect x={0} y={0} width={232} height={190} fill={C.newsprint} stroke={C.ink} strokeWidth={2.5} />
          <text x={116} y={36} textAnchor="middle" fontFamily={FONT.display} fontSize={30} fill={C.ink}>MONTROSE</text>
          <text x={116} y={62} textAnchor="middle" fontFamily={FONT.period} fontStyle="italic" fontSize={20} fill={C.deep}>sails for Canada</text>
          <g transform="translate(116 140) scale(0.32)"><path d="M-260 0 L250 0 L210 50 L-230 50Z" fill={C.slate} stroke={C.ink} strokeWidth={6} /><rect x={-150} y={-40} width={260} height={40} fill={C.newsprint} stroke={C.ink} strokeWidth={6} /><rect x={-20} y={-120} width={60} height={80} fill={C.fog} stroke={C.ink} strokeWidth={6} /><rect x={-20} y={-120} width={60} height={20} fill={C.deep} /><path d="M-190 -40 L-190 -190 M190 -40 L190 -190 M-190 -180 L190 -180" stroke={C.ink} strokeWidth={5} /></g>
        </g>}
      </>}
    </g>
  );
  // fold / twist variants render the page several times, clipped
  let body: React.ReactNode = page;
  if (twist > 0) {
    const n = 10;
    body = <g>{Array.from({ length: n }, (_, i) => {
      const a = twist * Math.PI * 2 * (0.3 + (i / n) * 0.9); const sx = Math.cos(a);
      return <g key={i}>
        <clipPath id={`${id}s${i}`}><rect x={-2} y={(H / n) * i - 1} width={W + 4} height={H / n + 2} /></clipPath>
        <g clipPath={`url(#${id}s${i})`} transform={`translate(${W / 2} 0) scale(${Math.abs(sx) < 0.04 ? 0.04 : sx} 1) translate(${-W / 2} 0)`}>{page}{sx < 0 && <rect x={0} y={0} width={W} height={H} fill={C.mist} opacity={0.5} />}</g>
      </g>;
    })}</g>;
  } else if (fold > 0) {
    const k = 1 - 2 * ease(clamp(fold));
    body = <g>
      <clipPath id={`${id}t`}><rect x={-2} y={-2} width={W + 4} height={H / 2 + 2} /></clipPath>
      <clipPath id={`${id}b`}><rect x={-2} y={H / 2} width={W + 4} height={H / 2 + 2} /></clipPath>
      <g clipPath={`url(#${id}t)`}>{page}</g>
      <g transform={`translate(0 ${H / 2}) scale(1 ${k}) translate(0 ${-H / 2})`}><g clipPath={`url(#${id}b)`}>{page}</g>{k < 0 && <rect x={0} y={H / 2} width={W} height={H / 2} fill={C.mist} opacity={0.6} stroke={C.ink} strokeWidth={3} />}</g>
    </g>;
  }
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <path d={rrect(8, 8, W, H, 4)} fill={C.ink} opacity={0.18} />
    {body}
  </g>;
};

// ---------------------------------------------------------------- WANTED poster
export type WantedVariant = 'full' | 'empty' | 'walkOut';
/** Engraved portrait of Crippen A (ink on newsprint), centred at 0,0, ~200 wide. */
export const CrippenEngraving: React.FC<{ fr: number }> = ({ fr }) => (
  <g>
    <path d="M-90 120 Q-80 40 0 36 Q80 40 90 120Z" fill={C.newsprint} stroke={C.ink} strokeWidth={4} />
    <path d="M-90 120 Q-80 40 0 36 Q80 40 90 120Z" fill="url(#wn-ht)" mask="url(#wn-shR)" />
    <path d="M-22 36 L0 70 L22 36" fill={C.newsprint} stroke={C.ink} strokeWidth={3} />
    <ellipse cx={0} cy={-30} rx={58} ry={70} fill={C.newsprint} stroke={C.ink} strokeWidth={4} />
    <path d="M-58 -30 A58 70 0 0 0 58 -30" fill="url(#wn-ht)" mask="url(#wn-shR)" />
    <path d="M-56 -36 Q-62 -66 -40 -72 L-36 -40 M56 -36 Q62 -66 40 -72 L36 -40" stroke={C.ink} strokeWidth={4} fill={C.slate} />
    {[-1, 1].map((s) => <circle key={s} cx={s * 22} cy={-30} r={15} fill="none" stroke={C.ink} strokeWidth={3.5} />)}
    <path d="M-7 -30 L7 -30" stroke={C.ink} strokeWidth={3} />
    {[-1, 1].map((s) => <circle key={`e${s}`} cx={s * 22} cy={-30} r={4} fill={C.ink} />)}
    <path d="M0 -6 C 14 -14 34 -12 42 0 C 46 10 40 18 34 16 C 26 8 14 6 0 6Z M0 -6 C -14 -14 -34 -12 -42 0 C -46 10 -40 18 -34 16 C -26 8 -14 6 0 6Z" fill={C.deep} stroke={C.ink} strokeWidth={3} />
    <path d="M-10 18 Q0 24 10 18" stroke={C.ink} strokeWidth={3} fill="none" />
  </g>
);
/**
 * <WantedPoster fr x y scale? variant at?> — 420×600 native, top-left at (x,y). "WANTED", the engraved portrait in an
 * oval, "Dr. Crippen" and the description in Courier ("Small. Round glasses. Big moustache."). empty = blank oval;
 * walkOut = from `at` the portrait tiptoes out of its oval and off the right edge in 40 f, leaving the blank oval.
 */
export const WantedPoster: React.FC<{ fr: number; x?: number; y?: number; scale?: number; rot?: number; variant?: WantedVariant; at?: number }> =
  ({ fr, x = 0, y = 0, scale = 1, rot = 0, variant = 'full', at = 0 }) => {
    const walk = variant === 'walkOut' ? clamp((fr - at) / 40) : variant === 'empty' ? 1 : 0;
    const step = Math.floor(fr / 3) % 2;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
        <path d={rrect(8, 8, 420, 600, 4)} fill={C.ink} opacity={0.18} />
        <path d={rrect(0, 0, 420, 600, 4)} fill={C.newsprint} stroke={C.ink} strokeWidth={3} />
        <text x={210} y={96} textAnchor="middle" fontFamily={FONT.display} fontSize={86} fill={C.ink}>WANTED</text>
        <ellipse cx={210} cy={270} rx={118} ry={140} fill={C.fog} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={210} cy={270} rx={106} ry={128} fill="none" stroke={C.ink} strokeWidth={1.5} />
        {walk < 1 && (
          <g transform={`translate(${210 + walk * walk * 420} ${280 - (walk > 0 ? Math.abs(Math.sin(walk * 18)) * 12 : 0)}) rotate(${walk > 0 ? osc(fr, 8) * 5 : 0})`}>
            <CrippenEngraving fr={fr} />
            {walk > 0 && <g stroke={C.ink} strokeWidth={6} strokeLinecap="round">
              <path d={`M-20 120 L${-26 + step * 16} 175`} /><path d={`M20 120 L${26 - step * 16} 175`} />
            </g>}
          </g>
        )}
        <text x={210} y={460} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={40} fill={C.ink}>Dr. Crippen</text>
        <text x={210} y={510} textAnchor="middle" fontFamily={FONT.wire} fontWeight={700} fontSize={22} fill={C.deep}>Small. Round glasses.</text>
        <text x={210} y={542} textAnchor="middle" fontFamily={FONT.wire} fontWeight={700} fontSize={22} fill={C.deep}>Big moustache.</text>
      </g>
    );
  };

import React from 'react';
import { Easing, interpolate } from 'remotion';
import { C, FONT } from './tokens';
import { blob, clamp, cut, pop, prog, rnd, smooth, stepped, swing, wrect } from './util';
import { MonaLisa } from './monalisa';

const ink = { stroke: C.ink, strokeWidth: 2.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

/** One iron S-hook (34 px tall at size 1), hook curl shape shared with the "?" (HOOK_PATH). */
export const HOOK_PATH = 'M0,-17 C0,-24 9,-24 9,-17 L9,-6 C9,4 0,10 -6,6 C-11,2 -9,-4 -4,-4';
export const Hook: React.FC<{ x: number; y: number; size?: number; rot?: number; color?: string; glow?: number }> = ({ x, y, size = 1, rot = 0, color = C.ink, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`}>
    {glow > 0 && <circle cx={2} cy={-2} r={18} fill="url(#ss-amber-soft)" opacity={glow} />}
    <circle cx={4.5} cy={-20} r={3} fill={color} />
    <path d={HOOK_PATH} fill="none" stroke={color} strokeWidth={4.2} strokeLinecap="round" />
  </g>
);
/**
 * The four hooks (MUST, pick §2.1). Row of four, 60 px apart (at size 1), centred on (x, y) = the hooks' line.
 * state 'holding' | 'empty' | 'web' | 'bend' (bend=0..1 twists them into one big "?").
 * countAt: frame the 1-2-3-4 count starts (one hook every `gap` frames lights up + card number tag pops: clink each).
 * swayAt: frame they start swaying (after the lift). shadowLean 0..1: their 4 shadows lean together into a red-edged "?".
 * hookCountTimes(countAt, gap) gives the four clink frames for the sound.
 */
export const hookCountTimes = (countAt: number, gap = 9) => [0, 1, 2, 3].map((i) => countAt + i * gap);
export const Hooks: React.FC<{ fr: number; x: number; y: number; size?: number; state?: 'holding' | 'empty' | 'web' | 'bend'; countAt?: number; gap?: number;
  swayAt?: number; web?: number; bend?: number; shadowLean?: number; tagsOutAt?: number }> =
  ({ fr, x, y, size = 1, state = 'empty', countAt, gap = 9, swayAt, web = 1, bend = 0, shadowLean = 0, tagsOutAt }) => {
    const xs = [-90, -30, 30, 90];
    const b = state === 'bend' ? bend : 0;
    return (
      <g transform={`translate(${x} ${y}) scale(${size})`}>
        {shadowLean > 0 && <g opacity={shadowLean}>
          {xs.map((hx, i) => <g key={i} transform={`translate(${hx * (1 - shadowLean) + 10} ${120 * shadowLean + 30}) rotate(${(i - 1.5) * -10 * shadowLean}) scale(${1 + shadowLean * 1.6})`}>
            <path d={HOOK_PATH} fill="none" stroke={C.ink} strokeOpacity={0.35} strokeWidth={6} />
          </g>)}
          <g transform={`translate(10 ${150}) scale(${3.2 * shadowLean})`}><path d={HOOK_PATH} fill="none" stroke={C.clueRed} strokeWidth={1.4} opacity={shadowLean} /><circle cx={-4} cy={18} r={2.4} fill={C.clueRed} opacity={shadowLean} /></g>
        </g>}
        {xs.map((hx, i) => {
          const lit = countAt !== undefined ? prog(fr, countAt + i * gap, 4) : 0;
          const sway = swayAt !== undefined ? swing(fr, swayAt + i * 2, 10, 50, 0.35) : 0;
          const tx = hx * (1 - b), rot = sway + b * (i - 1.5) * 25, sc = 1 + b * 1.8;
          const tagP = countAt !== undefined ? pop(fr, countAt + i * gap, 12) : 0;
          const tagOut = tagsOutAt !== undefined ? prog(fr, tagsOutAt, 8) : 0;
          return (
            <g key={i} opacity={b > 0.55 ? 1 - (b - 0.55) / 0.45 : 1}>
              <Hook x={tx} y={0} rot={rot} size={sc} color={b > 0.5 ? C.clueRed : C.ink} glow={lit * (state === 'holding' ? 0.6 : 0.3)} />
              {countAt !== undefined && tagP > 0.01 && tagOut < 1 && <g transform={`translate(${hx + 18} ${-34}) scale(${tagP * (1 - tagOut)})`}>
                <path d={wrect(-14, -16, 28, 30, `tag${i}`, 1)} fill={C.card} stroke={C.ink} strokeWidth={2} />
                <text x={0} y={8} textAnchor="middle" fontFamily={FONT.type} fontSize={22} fill={C.ink}>{i + 1}</text>
              </g>}
            </g>
          );
        })}
        {b > 0.55 && <g opacity={(b - 0.55) / 0.45}><QuestionMark fr={fr} x={0} y={30} size={0.9} /></g>}
        {state === 'web' && web > 0 && <g opacity={0.55} stroke={C.ink} strokeWidth={1.3} fill="none">
          {[0, 1, 2, 3, 4, 5, 6].map((k) => { const a = (k / 7) * Math.PI; return <line key={k} x1={0} y1={-6} x2={Math.cos(a) * 110 * web} y2={-6 + Math.sin(a) * 60 * web} />; })}
          {[0.3, 0.55, 0.8, 1].map((r, k) => <path key={k} d={smooth(Array.from({ length: 8 }, (_, j) => { const a = (j / 7) * Math.PI; return [Math.cos(a) * 110 * r * web, -6 + Math.sin(a) * 60 * r * web] as [number, number]; }), false)} />)}
        </g>}
      </g>
    );
  };

/** The red "?" (MUST, §2.3): clueRed paper cutout whose curl is the hook curve. straighten 0..1 → "!" (P3). wobble on. */
export const QuestionMark: React.FC<{ fr: number; x: number; y: number; size?: number; straighten?: number; rot?: number; shrug?: number; stamp?: boolean }> =
  ({ fr, x, y, size = 1, straighten = 0, rot = 0, shrug = 0, stamp }) => {
    const s = straighten;
    const wob = Math.sin(stepped(fr) * 0.12) * 3;
    const curl = `M${-30 * (1 - s)},${-60 + 10 * s} C${-30 * (1 - s)},${-110} ${40 * (1 - s)},${-118} ${40 * (1 - s)},${-62} C${40 * (1 - s)},${-30 * (1 - s) - 20 * s} ${0},${-30} ${0},${0 + 10 * s}`;
    if (stamp) return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`} opacity={0.9}>
        <circle r={95} fill="none" stroke={C.clueRed} strokeWidth={8} />
        <path d={curl} transform="translate(-5 30) scale(0.95)" fill="none" stroke={C.clueRed} strokeWidth={22} strokeLinecap="round" />
        <circle cx={-5} cy={70} r={12} fill={C.clueRed} />
      </g>);
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot + wob}) scale(${size} ${size * (1 - shrug * 0.12)})`} filter="url(#ss-cut)">
        <path d={curl} fill="none" stroke={C.ink} strokeWidth={30} strokeLinecap="round" />
        <path d={curl} fill="none" stroke={C.clueRed} strokeWidth={23} strokeLinecap="round" />
        <circle cx={0} cy={46} r={15} fill={C.clueRed} stroke={C.ink} strokeWidth={3.5} />
      </g>
    );
  };
export const ExclamationMark: React.FC<{ fr: number; x: number; y: number; size?: number }> = (p) => <QuestionMark {...p} straighten={1} />;

/**
 * Fame gauge (MUST, §2.4): brass gauge "Who knows her?" with monocle → newspaper → globe round the dial, amber needle tip.
 * value 0 (monocle) … 0.5 (newspaper) … 1 (globe), >1 goes past the end. tremble px; smoke 0..1; burst frame (glass pops);
 * odometer text shown only when given (e.g. "100,000+", "millions every year"). World or screen <g>, centre (x,y), r 150 at size 1.
 */
export const FameGauge: React.FC<{ fr: number; x: number; y: number; size?: number; value?: number; tremble?: number; smoke?: number; burstAt?: number; odometer?: string; odoAt?: number }> =
  ({ fr, x, y, size = 1, value = 0, tremble = 0, smoke = 0, burstAt, odometer, odoAt = 0 }) => {
    const ang = -120 + Math.min(value, 1.18) * 240 + (tremble ? Math.sin(stepped(fr) * 1.7) * tremble : 0);
    const burst = burstAt !== undefined && fr >= burstAt;
    const R = 150;
    const iconAt = (a: number, node: React.ReactNode) => { const r = ((a - 90) * Math.PI) / 180; return <g transform={`translate(${Math.cos(r) * 100} ${Math.sin(r) * 100})`}>{node}</g>; };
    return (
      <g transform={`translate(${x} ${y}) scale(${size})`}>
        <g filter="url(#ss-cut)">
          <rect x={-22} y={R - 8} width={44} height={46} fill={C.oldGold} stroke={C.ink} strokeWidth={3} />
          <circle r={R + 14} fill={C.oldGold} stroke={C.ink} strokeWidth={3.5} />
          <circle r={R} fill={C.card} stroke={C.sepia} strokeWidth={3} />
        </g>
        {[...Array(13)].map((_, i) => { const a = ((-120 + i * 20 - 90) * Math.PI) / 180; return <line key={i} x1={Math.cos(a) * (R - 6)} y1={Math.sin(a) * (R - 6)} x2={Math.cos(a) * (R - (i % 2 ? 16 : 24))} y2={Math.sin(a) * (R - (i % 2 ? 16 : 24))} stroke={C.ink} strokeWidth={2.5} />; })}
        {iconAt(-100, <g><circle r={13} fill="none" stroke={C.ink} strokeWidth={3} /><path d="M12,6 Q20,18 14,30" stroke={C.ink} strokeWidth={1.5} fill="none" /></g>)}
        {iconAt(0, <g><rect x={-16} y={-12} width={32} height={24} fill={C.paper} stroke={C.ink} strokeWidth={2.5} /><path d="M-11,-5 L11,-5 M-11,1 L4,1 M-11,6 L8,6" stroke={C.ink} strokeWidth={2} /></g>)}
        {iconAt(100, <g><circle r={15} fill={C.duskBlue} stroke={C.ink} strokeWidth={2.5} /><path d="M-15,0 L15,0 M0,-15 Q-9,0 0,15 Q9,0 0,-15" stroke={C.card} strokeWidth={1.5} fill="none" /></g>)}
        <text y={-38} textAnchor="middle" fontFamily={FONT.type} fontSize={24} fill={C.ink}>Who knows her?</text>
        {odometer && <g opacity={prog(fr, odoAt, 6)}>
          <rect x={-odometer.length * 8 - 12} y={40} width={odometer.length * 16 + 24} height={40} fill={C.ink} rx={4} />
          <text y={68} textAnchor="middle" fontFamily={FONT.type} fontSize={26} fill={C.card}>{odometer}</text>
        </g>}
        <g transform={`rotate(${ang})`}>
          <path d="M-6,0 L0,-118 L6,0 Z" fill={C.ink} />
          <path d="M-4,-96 L0,-124 L4,-96 Z" fill={C.amber} stroke={C.ink} strokeWidth={1.5} />
        </g>
        <circle r={11} fill={C.oldGold} stroke={C.ink} strokeWidth={3} />
        {!burst && <path d={`M${-R * 0.6},${-R * 0.55} Q${-R * 0.3},${-R * 0.85} ${R * 0.1},${-R * 0.85}`} stroke="#fff" strokeWidth={7} opacity={0.5} fill="none" strokeLinecap="round" />}
        {burst && [...Array(8)].map((_, i) => { const t = fr - burstAt!; const a = (i / 8) * 6.28 + 0.3; const d = 40 + t * 14; return t < 30 && <path key={i} d="M0,-10 L8,6 L-7,8Z" fill={C.glass} stroke={C.ink} strokeWidth={1.5} transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d + t * t * 0.3}) rotate(${t * 20 + i * 40})`} opacity={1 - t / 30} />; })}
        {smoke > 0 && [0, 1, 2].map((i) => { const t = ((stepped(fr) + i * 14) % 42) / 42; return <circle key={i} cx={Math.sin(t * 6 + i) * 14} cy={-R - 20 - t * 120} r={14 + t * 26} fill={C.stone} opacity={smoke * (1 - t) * 0.7} />; })}
      </g>
    );
  };

/**
 * Tear-off day calendar (MUST): Special Elite pages. pages = list of labels ("Monday", "Tuesday", "Day 1"… "1911").
 * Page i shows from tearAt[i-1]; each tear flies off up-right with a spin (calendar-tear sound at each tearAt).
 */
export const Calendar: React.FC<{ fr: number; x: number; y: number; size?: number; pages: string[]; tearAt?: number[] }> = ({ fr, x, y, size = 1, pages, tearAt = [] }) => {
  const cur = tearAt.filter((t) => fr >= t).length;
  const page = (label: string, k: string) => (
    <g key={k}>
      <path d={wrect(-90, -70, 180, 150, `cal${k}`, 1)} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
      <text y={label.length > 9 ? 22 : 26} textAnchor="middle" fontFamily={FONT.type} fontSize={label.length > 12 ? 24 : label.length > 9 ? 30 : 40} fill={C.ink}>{label}</text>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <g filter="url(#ss-shadow-s)">
        <path d={wrect(-100, -110, 200, 200, 'calb', 1)} fill={C.sepia} stroke={C.ink} strokeWidth={2.5} />
        <rect x={-100} y={-110} width={200} height={34} fill={C.clueRed} stroke={C.ink} strokeWidth={2.5} />
        {page(pages[Math.min(cur, pages.length - 1)] ?? '', `p${cur}`)}
      </g>
      {[-50, 50].map((rx) => <circle key={rx} cx={rx} cy={-93} r={6} fill={C.ink} />)}
      {tearAt.map((t, i) => {
        const d = fr - t; if (d < 0 || d > 24) return null;
        const k = d / 24;
        return <g key={i} transform={`translate(${k * 260} ${-k * 240 + k * k * 140}) rotate(${k * 160})`} opacity={1 - k}>{page(pages[i] ?? '', `f${i}`)}</g>;
      })}
    </g>
  );
};

/**
 * White smock bundle (MUST, §2.2): rounded white bundle with folds; her amber glow leaks at the folds.
 * leak 0..1; eyes 0..1 = her real eyes peek over the top edge; wrap 0..1 animates the wrap closing (1 = closed).
 */
export const SmockBundle: React.FC<{ fr: number; x: number; y: number; size?: number; leak?: number; eyes?: number; rot?: number; glintAt?: number }> =
  ({ fr, x, y, size = 1, leak = 0.7, eyes = 0, rot = 0, glintAt }) => {
    const pulse = 0.85 + 0.15 * Math.sin(fr * 0.15);
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`}>
        {leak > 0 && <ellipse rx={175} ry={130} fill="url(#ss-amber)" opacity={Math.min(1, leak * pulse * 1.2)} />}
        {eyes > 0 && <g transform={`translate(4 ${-76 + (1 - eyes) * 30})`}><MonaLisa fr={fr} x={0} y={0} height={34} crop="eyes" glow={0} glintAt={glintAt} id="bundle-eyes" /></g>}
        <g filter="url(#ss-cut)">
          <path d={blob(0, 0, 105, 66, 'bundle', 0.06)} fill={C.smock} stroke={C.ink} strokeWidth={3} />
        </g>
        {[[-60, -20, -10, 40], [10, -50, 40, 20], [55, -30, 80, 30]].map(([x1, y1, x2, y2], i) => (
          <g key={i}>
            <path d={`M${x1},${y1} Q${(x1 + x2) / 2 + 12},${(y1 + y2) / 2} ${x2},${y2}`} stroke={C.amber} strokeWidth={7} opacity={leak * pulse} fill="none" strokeLinecap="round" />
            <path d={`M${x1},${y1} Q${(x1 + x2) / 2 + 12},${(y1 + y2) / 2} ${x2},${y2}`} stroke={C.ink} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {[0, 1, 2].map((i) => <circle key={i} cx={-70 + i * 30} cy={36 - i * 6} r={3} fill={C.paperShade} stroke={C.ink} strokeWidth={1.2} />)}
      </g>
    );
  };

/**
 * Frame + glass box (MUST 1,2): the empty oldGold frame (w×h around her size) that can split into 4 bars (split 0..1
 * with `fall` px drop per bar staggered), and the glass box (pale glass, white glints). thumbprint 0..1 on the glass (P2).
 */
export const FrameGlass: React.FC<{ fr: number; x: number; y: number; w?: number; h?: number; show?: 'frame' | 'glass' | 'both'; split?: number; fall?: number; thumb?: number; rot?: number }> =
  ({ fr, x, y, w = 230, h = 320, show = 'both', split = 0, fall = 220, thumb = 0, rot = 0 }) => {
    const t = 26;
    const bars = [
      { d: [-w / 2, -h / 2, w, t], dx: -20, r: -30 }, { d: [-w / 2, h / 2 - t, w, t], dx: 30, r: 20 },
      { d: [-w / 2, -h / 2, t, h], dx: -40, r: -60 }, { d: [w / 2 - t, -h / 2, t, h], dx: 50, r: 75 },
    ];
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        {(show === 'glass' || show === 'both') && <g filter="url(#ss-shadow)">
          <rect x={-w / 2 - 18} y={-h / 2 - 18} width={w + 36} height={h + 36} fill={C.glass} fillOpacity={0.35} stroke={C.ink} strokeWidth={2.5} />
          <path d={`M${-w / 2 + 4},${-h / 2 + 40} L${-w / 2 + 50},${-h / 2 - 10} M${-w / 2 + 24},${-h / 2 + 76} L${-w / 2 + 84},${-h / 2 - 6}`} stroke="#fff" strokeWidth={6} opacity={0.8} strokeLinecap="round" />
          {thumb > 0 && <g transform={`translate(${w * 0.18} ${h * 0.12}) scale(${0.35})`} opacity={thumb}><Thumbprint fr={fr} x={0} y={0} /></g>}
        </g>}
        {(show === 'frame' || show === 'both') && <g filter="url(#ss-cut)">
          {bars.map((b, i) => {
            const k = Math.max(0, Math.min(1, split * 1.6 - i * 0.2));
            const e = Easing.in(Easing.quad)(k);
            return <path key={i} d={wrect(b.d[0], b.d[1], b.d[2], b.d[3], `bar${i}`, 1)} fill={C.oldGold} stroke={C.ink} strokeWidth={2.5}
              transform={`translate(${b.dx * k} ${fall * e}) rotate(${b.r * k} ${b.d[0] + b.d[2] / 2} ${b.d[1] + b.d[3] / 2})`} />;
          })}
        </g>}
      </g>
    );
  };

/**
 * White trunk with false bottom (MUST 2,3): #EDE8DD wood, sepia straps. lid 0..1 open; leak 0..1 amber crack glow
 * (hot/cold: brighten as someone gets close); eyes 0..1 her eyes in the crack; contents 'none'|'clothes'|'false-bottom'|'silk';
 * falseBottom 0..1 board lifts out; silkPull 0..1 the red silk pulled away revealing her (glow floods up).
 */
export const Trunk: React.FC<{ fr: number; x: number; y: number; size?: number; lid?: number; leak?: number; eyes?: number; contents?: 'none' | 'clothes' | 'silk'; falseBottom?: number; silkPull?: number; glintAt?: number }> =
  ({ fr, x, y, size = 1, lid = 0, leak = 0, eyes = 0, contents = 'none', falseBottom = 0, silkPull = 0, glintAt }) => {
    const W = 300, Hh = 160;
    const pulse = 0.85 + 0.15 * Math.sin(fr * 0.18);
    const lidAng = -lid * 105;
    return (
      <g transform={`translate(${x} ${y}) scale(${size})`}>
        {leak > 0 && <ellipse cx={0} cy={-Hh} rx={260} ry={110} fill="url(#ss-amber)" opacity={Math.min(1, leak * pulse * 1.3)} />}
        {/* inside (visible when lid open) */}
        {lid > 0.05 && <g>
          <rect x={-W / 2 + 10} y={-Hh - 4} width={W - 20} height={30} fill={C.sepia} stroke={C.ink} strokeWidth={2} />
          {contents === 'clothes' && <g>{[[-80, C.shirt], [-10, C.duskBlue], [60, C.card]].map(([cx, col], i) => <path key={i} d={blob(cx as number, -Hh + 4, 40, 14, `cl${i}`, 0.15)} fill={col as string} stroke={C.ink} strokeWidth={2} />)}</g>}
          {contents === 'silk' && <g>
            {silkPull > 0 && <g opacity={Math.min(1, silkPull * 2)}><ellipse cx={0} cy={-Hh - 60} rx={200} ry={140} fill="url(#ss-amber)" opacity={silkPull} /><MonaLisa fr={fr} x={0} y={-Hh - 40 - silkPull * 60} height={200} glow={0} glintAt={glintAt} id="trunk-her" /></g>}
            {silkPull < 1 && <g transform={`translate(${silkPull * 420} ${-silkPull * 200}) rotate(${silkPull * 40})`}><path d={blob(0, -Hh + 2, 110 + silkPull * 60, 22, 'silk', 0.12)} fill={C.silk} stroke={C.ink} strokeWidth={2.5} /><path d="M-60,-158 Q0,-170 60,-152" stroke={C.amber} strokeWidth={5} opacity={(1 - silkPull) * pulse} fill="none" /></g>}
          </g>}
          {falseBottom > 0 && <g transform={`translate(${-falseBottom * 30} ${-falseBottom * 140}) rotate(${-falseBottom * 25})`}><path d={wrect(-W / 2 + 10, -Hh - 8, W - 20, 14, 'fb', 1)} fill={C.trunk} stroke={C.ink} strokeWidth={2.5} /></g>}
        </g>}
        <g filter="url(#ss-cut)">
          <path d={wrect(-W / 2, -Hh, W, Hh, 'trunk', 1.5)} fill={C.trunk} stroke={C.ink} strokeWidth={3} />
          {[-W / 2 + 60, W / 2 - 60].map((sx) => <rect key={sx} x={sx - 10} y={-Hh} width={20} height={Hh} fill={C.sepia} stroke={C.ink} strokeWidth={2} />)}
          <rect x={-14} y={-Hh + 10} width={28} height={22} fill={C.oldGold} stroke={C.ink} strokeWidth={2} />
        </g>
        {/* the crack between lid and box */}
        {leak > 0 && lid < 0.2 && <path d={`M${-W / 2 + 8},${-Hh - 2} L${W / 2 - 8},${-Hh - 2}`} stroke={C.amberGlow} strokeWidth={4 + leak * 6 * pulse} opacity={leak} />}
        <g transform={`translate(${-W / 2} ${-Hh}) rotate(${lidAng}) translate(0 ${lid * 12 - 6 - lid * 6})`} filter="url(#ss-cut)">
          <path d={`M0,0 L${W},0 L${W},-40 Q${W / 2},-70 0,-40 Z`} fill={C.trunk} stroke={C.ink} strokeWidth={3} transform={`translate(0 ${2 + eyes * 10})`} />
          {[60, W - 60].map((sx) => <path key={sx} d={`M${sx - 10},${2 + eyes * 10} L${sx - 10},${-46 + eyes * 10} L${sx + 10},${-48 + eyes * 10} L${sx + 10},${2 + eyes * 10}Z`} fill={C.sepia} stroke={C.ink} strokeWidth={2} />)}
        </g>
        {eyes > 0 && lid < 0.3 && <g transform={`translate(0 ${-Hh - 10 - eyes * 6})`} opacity={eyes}><MonaLisa fr={fr} x={0} y={0} height={26} crop="eyes" glow={0} glintAt={glintAt} id="trunk-eyes" /></g>}
      </g>
    );
  };

/**
 * Letter signed "Leonardo" (MUST 2,3): cream letter, illustrative handwriting lines (not quoted words) that draw on
 * (write 0..1), the signature "Leonardo" writing on letter by letter (sign 0..1) with an amber glint on the last stroke,
 * and a wet ink drop (dropAt frame). envelope=true draws the stamped envelope instead/behind (env 0..1 open).
 */
export const Letter: React.FC<{ fr: number; x: number; y: number; size?: number; write?: number; sign?: number; dropAt?: number; envelope?: boolean; rot?: number }> =
  ({ fr, x, y, size = 1, write = 1, sign = 1, dropAt, envelope, rot = 0 }) => {
    const W = 340, Hh = 440;
    if (envelope) return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`} filter="url(#ss-cut)">
        <path d={wrect(-170, -105, 340, 210, 'env', 1.5)} fill={C.card} stroke={C.ink} strokeWidth={3} />
        <path d="M-170,-105 L0,15 L170,-105" fill="none" stroke={C.ink} strokeWidth={2.5} />
        <rect x={100} y={-90} width={52} height={60} fill={C.clueRed} stroke={C.ink} strokeWidth={2} /><rect x={108} y={-82} width={36} height={44} fill="none" stroke={C.card} strokeWidth={2} />
        <path d="M-120,40 L40,40 M-120,64 L10,64" stroke={C.ink} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      </g>);
    const lines = 8;
    const name = 'Leonardo';
    const shown = Math.floor(sign * name.length);
    const d = dropAt !== undefined ? fr - dropAt : -1;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`}>
        <g filter="url(#ss-cut)"><path d={wrect(-W / 2, -Hh / 2, W, Hh, 'letter', 1.5)} fill={C.card} stroke={C.ink} strokeWidth={3} /></g>
        {[...Array(lines)].map((_, i) => {
          const k = Math.max(0, Math.min(1, write * lines - i));
          const len = (i === lines - 1 ? 150 : 250 - rnd(`ln${i}`) * 50) * k;
          const yy = -Hh / 2 + 60 + i * 34;
          let dd = `M${-W / 2 + 40},${yy}`;
          for (let s = 0; s < len; s += 14) dd += ` q4,${-6 - rnd(`w${i}${s}`) * 6} 7,0 t7,0`;
          return k > 0 && <path key={i} d={dd} stroke={C.ink} strokeWidth={2.4} fill="none" opacity={0.85} />;
        })}
        <text x={30} y={Hh / 2 - 70} textAnchor="middle" fontFamily={FONT.display} fontStyle="italic" fontSize={56} fill={C.ink}>{name.slice(0, shown)}</text>
        {sign >= 1 && <path d="M-50,175 Q40,190 110,168" stroke={C.ink} strokeWidth={3} fill="none" />}
        {sign >= 1 && <circle cx={112} cy={164} r={10} fill="url(#ss-amber-soft)" opacity={0.5 + 0.5 * Math.sin(fr * 0.3)} />}
        {d >= 0 && <g>{d < 14
          ? <path d="M0,-10 Q7,4 0,8 Q-7,4 0,-10Z" transform={`translate(112 ${170 + d * d * 0.9}) scale(1.6)`} fill={C.ink} />
          : <ellipse cx={112} cy={170 + 176} rx={Math.min(40, (d - 14) * 3 + 8)} ry={Math.min(14, (d - 14) + 3)} fill={C.ink} opacity={0.9} />}</g>}
      </g>
    );
  };

/**
 * Magnifying glass (MUST 2,3): oldGold rim; whatever you pass as `under` is drawn inside the lens at ×1.6 around the
 * lens centre (pass the same nodes the scene draws under it). giant=true for the P3 badly-hidden version (×2.4 size).
 */
export const Magnifier: React.FC<{ x: number; y: number; r?: number; rot?: number; under?: React.ReactNode; zoom?: number; giant?: boolean; id?: string }> =
  ({ x, y, r = 60, rot = 35, under, zoom = 1.6, giant, id = 'mag' }) => {
    const R = giant ? r * 2.4 : r;
    return (
      <g>
        {under && <g>
          <clipPath id={`${id}-clip`}><circle cx={x} cy={y} r={R} /></clipPath>
          <g clipPath={`url(#${id}-clip)`}><rect x={x - R} y={y - R} width={R * 2} height={R * 2} fill={C.paper} /><g transform={`translate(${x} ${y}) scale(${zoom}) translate(${-x} ${-y})`}>{under}</g></g>
        </g>}
        <g transform={`translate(${x} ${y}) rotate(${rot})`} filter="url(#ss-shadow-s)">
          <rect x={-R * 0.13} y={R} width={R * 0.26} height={R * 1.3} rx={R * 0.08} fill={C.sepia} stroke={C.ink} strokeWidth={3} />
          <circle r={R} fill={under ? 'none' : C.glass} fillOpacity={0.3} stroke={C.oldGold} strokeWidth={R * 0.16} />
          <circle r={R} fill="none" stroke={C.ink} strokeWidth={2.5} />
          <circle r={R * 1.08} fill="none" stroke={C.ink} strokeWidth={2.5} />
          <path d={`M${-R * 0.55},${-R * 0.3} Q${-R * 0.5},${-R * 0.6} ${-R * 0.2},${-R * 0.65}`} stroke="#fff" strokeWidth={R * 0.08} opacity={0.7} fill="none" strokeLinecap="round" />
        </g>
      </g>
    );
  };

/** Thumbprint (MUST 2,3): ink concentric ridge pattern. maze 0..1 straightens ridges into maze walls; face=true adds two dot eyes (P2 gag); shrug 0..1. */
export const Thumbprint: React.FC<{ fr: number; x: number; y: number; size?: number; face?: boolean; maze?: number; color?: string }> = ({ fr, x, y, size = 1, face, maze = 0, color = C.ink }) => (
  <g transform={`translate(${x} ${y}) scale(${size})`}>
    {[...Array(9)].map((_, i) => {
      const r = 14 + i * 11;
      const gap = 0.4 + rnd(`tp${i}`) * 0.6;
      const a0 = rnd(`tpa${i}`) * 6.28;
      const pts: [number, number][] = [];
      for (let k = 0; k <= 20; k++) {
        const a = a0 + gap + (k / 20) * (6.28 - gap * 1.6);
        const rx = r * 0.82, ry = r * 1.08;
        const px = Math.cos(a) * rx, py = Math.sin(a) * ry;
        const sq = Math.max(Math.abs(px) / rx, Math.abs(py) / ry) || 1;
        pts.push([px * (1 - maze) + (px / sq) * maze, py * (1 - maze) + (py / sq) * maze]);
      }
      return <path key={i} d={smooth(pts, false)} stroke={color} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    })}
    {face && <g><circle cx={-16} cy={-6} r={11} fill={C.card} stroke={C.ink} strokeWidth={3} /><circle cx={16} cy={-6} r={11} fill={C.card} stroke={C.ink} strokeWidth={3} />
      <circle cx={-14 + Math.sin(fr * 0.1) * 3} cy={-5} r={5} fill={C.ink} /><circle cx={18 + Math.sin(fr * 0.1) * 3} cy={-5} r={5} fill={C.ink} /></g>}
  </g>
);

/**
 * Newspaper front page (MUST 2,3): halftone page, Playfair headline (her name amber with ink outline when it contains
 * "Mona Lisa"), her photo printed in halftone dots (a dot-screen over the PD photo, faces never covered by text).
 */
export const Newspaper: React.FC<{ fr: number; x: number; y: number; size?: number; headline?: string; masthead?: string; rot?: number; fade?: number }> =
  ({ fr, x, y, size = 1, headline = 'Mona Lisa stolen!', masthead = 'LE JOURNAL', rot = 0, fade = 0 }) => {
    const W = 420, Hh = 560;
    const parts = headline.split(/(Mona Lisa)/);
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`}>
        <g filter="url(#ss-cut)"><path d={wrect(-W / 2, -Hh / 2, W, Hh, `np${headline}`, 1.5)} fill={C.paper} stroke={C.ink} strokeWidth={3} /></g>
        <text y={-Hh / 2 + 52} textAnchor="middle" fontFamily={FONT.display} fontWeight={900} fontSize={40} fill={C.ink} letterSpacing={3}>{masthead}</text>
        <path d={`M${-W / 2 + 20},${-Hh / 2 + 68} L${W / 2 - 20},${-Hh / 2 + 68} M${-W / 2 + 20},${-Hh / 2 + 74} L${W / 2 - 20},${-Hh / 2 + 74}`} stroke={C.ink} strokeWidth={2} />
        <text y={-Hh / 2 + 130} textAnchor="middle" fontFamily={FONT.display} fontWeight={900} fontSize={headline.length > 16 ? 40 : 48} fill={C.ink}>
          {parts.map((p, i) => p === 'Mona Lisa' ? <tspan key={i} fill={C.amber} stroke={C.ink} strokeWidth={1.6} paintOrder="stroke">{p}</tspan> : <tspan key={i}>{p}</tspan>)}
        </text>
        <g opacity={1 - fade}><MonaLisa fr={fr} x={-70} y={40} height={250} glow={0} shadow={false} id={`np-${headline}`} /></g>
        <pattern id="ss-halftone" width={6} height={6} patternUnits="userSpaceOnUse"><circle cx={3} cy={3} r={1.6} fill={C.ink} opacity={0.35} /></pattern>
        <rect x={-70 - 84} y={40 - 125} width={168} height={250} fill="url(#ss-halftone)" />
        {[...Array(9)].map((_, i) => <path key={i} d={`M30,${-70 + i * 22} L${W / 2 - 24},${-70 + i * 22}`} stroke={C.ink} strokeWidth={3} opacity={0.45} />)}
        {[...Array(3)].map((_, i) => <path key={i} d={`M${-W / 2 + 24},${190 + i * 22} L${W / 2 - 24},${190 + i * 22}`} stroke={C.ink} strokeWidth={3} opacity={0.45} />)}
      </g>
    );
  };

/** Postcard (MUST 2,3): paper postcard around a small copy of her photo (never covering her face). gag: 'balloon' | 'bicycle' | 'eiffel' | 'plain'; caption text. */
export const Postcard: React.FC<{ fr: number; x: number; y: number; size?: number; gag?: 'balloon' | 'bicycle' | 'eiffel' | 'plain'; caption?: string; rot?: number }> =
  ({ fr, x, y, size = 1, gag = 'plain', caption, rot = 0 }) => {
    const W = 360, Hh = 250;
    const t = stepped(fr);
    const mona = (mx: number, my: number, h = 120) => <MonaLisa fr={fr} x={mx} y={my} height={h} glow={0} shadow={false} id={`pc-${gag}`} />;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`}>
        <g filter="url(#ss-cut)"><path d={wrect(-W / 2, -Hh / 2, W, Hh, `pc${gag}`, 1.5)} fill={C.card} stroke={C.ink} strokeWidth={3} /></g>
        <rect x={-W / 2 + 12} y={-Hh / 2 + 12} width={W - 24} height={Hh - 24} fill={C.paperShade} opacity={0.6} />
        {gag === 'balloon' && <g transform={`translate(0 ${-Math.sin(t * 0.08) * 8})`}>
          <path d={blob(0, -60, 70, 60, 'bal', 0.04)} fill={C.clueRed} stroke={C.ink} strokeWidth={2.5} /><path d="M-30,-10 L-22,40 M30,-10 L22,40" stroke={C.ink} strokeWidth={2} />
          {mona(0, 30, 60)}<rect x={-30} y={40} width={60} height={30} fill={C.sepia} stroke={C.ink} strokeWidth={2} /></g>}
        {gag === 'bicycle' && <g transform={`translate(${Math.sin(t * 0.05) * 20} 0)`}>
          {[-50, 50].map((wx) => <g key={wx} transform={`translate(${wx} 60) rotate(${t * 8})`}><circle r={30} fill="none" stroke={C.ink} strokeWidth={3} /><path d="M-30,0 L30,0 M0,-30 L0,30" stroke={C.ink} strokeWidth={1.5} /></g>)}
          <path d="M-50,60 L0,20 L50,60 M0,20 L-10,-5" stroke={C.ink} strokeWidth={3} fill="none" />{mona(-8, -40, 80)}</g>}
        {gag === 'eiffel' && <g>
          <path d="M80,100 L110,-90 L140,100 M90,40 L130,40 M98,-10 L122,-10" stroke={C.ink} strokeWidth={3} fill="none" />
          {mona(-70, 0, 140)}
          <g transform={`translate(-5 ${-30}) rotate(${Math.sin(t * 0.3) * 20})`}><path d="M0,0 L22,-10 L26,10 Z" fill="#fff" stroke={C.ink} strokeWidth={1.5} /></g></g>}
        {gag === 'plain' && mona(0, -6, 170)}
        {caption && <text y={Hh / 2 - 22} textAnchor="middle" fontFamily={FONT.type} fontSize={26} fill={C.ink}>{caption}</text>}
      </g>
    );
  };

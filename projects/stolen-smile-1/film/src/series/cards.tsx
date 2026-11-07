import React from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { C, FONT } from './tokens';
import { clamp, cut, pop, prog, rnd, swing, wrect } from './util';

const NUM = ['one', 'two', 'three'] as const;
export const PART_TITLES = ['the vanishing', 'the hunt', 'the return'] as const;
export const NEXT_TEXT = ['Next: The hunt', 'Next: The return', 'The end'] as const;

const Svg: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ overflow: 'visible' }}>{children}</svg>
  </AbsoluteFill>
);
const Pin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g><circle cx={x + 2} cy={y + 3} r={9} fill={C.shadow} /><circle cx={x} cy={y} r={9} fill={C.clueRed} stroke={C.ink} strokeWidth={2} /><circle cx={x - 3} cy={y - 3} r={2.5} fill="#fff" opacity={0.6} /></g>
);

/**
 * Corner tab, from frame 0 (pick §2.6): "The Stolen Smile · Part N of 3", card tab top-left (x 64, y 230).
 * outAt = frame it starts sliding away (when the full TitleCard plays). Optional inAt (default 0: already there).
 */
export const CornerTab: React.FC<{ fr: number; part: 1 | 2 | 3; outAt?: number; inAt?: number }> = ({ fr, part, outAt, inAt }) => {
  const inT = inAt === undefined ? 1 : prog(fr, inAt, 10);
  const outT = outAt === undefined ? 0 : prog(fr, outAt, 12, Easing.in(Easing.cubic));
  const x = 64 - 700 * (1 - inT) - 700 * outT;
  const text = `The Stolen Smile · Part ${part} of 3`;
  const w = text.length * 19.5 + 44;
  return (
    <Svg>
      <g transform={`translate(${x} 230) rotate(${-1.2 + Math.sin(fr * 0.06) * 0.4})`} filter="url(#ss-shadow-s)">
        <path d={wrect(0, 0, w, 62, 'tab', 1.2)} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
        <text x={22} y={42} fontFamily={FONT.type} fontSize={34} fill={C.ink}>{text}</text>
      </g>
    </Svg>
  );
};

/**
 * Title card (pick §2.6): a card museum plaque with an oldGold frame drops in on two strings from the hang
 * point (hangX, hangY: screen coords of the hooks / "?" / silk ribbon end), swings twice (damped), shows
 * "The Stolen Smile" (Playfair 900) and types "Part one: the vanishing" (Special Elite 44) with clacks.
 * Holds ~2.2 s after typing, then lifts up and out. Timing helpers: titleCardTimes(at, part).
 */
export const titleCardTimes = (at: number, part: 1 | 2 | 3) => {
  const label = `Part ${NUM[part - 1]}: ${PART_TITLES[part - 1]}`;
  const typeAt = at + 16, typeEnd = typeAt + label.length * 2;
  const outAt = typeEnd + 66;
  return { label, dropAt: at, typeAt, typeEnd, outAt, end: outAt + 18, clacks: Array.from(label).map((ch, i) => ({ fr: typeAt + i * 2, ch })).filter((c) => c.ch !== ' ') };
};
export const TitleCard: React.FC<{ fr: number; at: number; part: 1 | 2 | 3; hangX?: number; hangY?: number; plateY?: number; outAt?: number }> =
  ({ fr, at, part, hangX = 540, hangY = 300, plateY = 760, outAt }) => {
    const T = titleCardTimes(at, part);
    const out = outAt ?? T.outAt;
    if (fr < at || fr > out + 20) return null;
    const drop = pop(fr, at, 11);
    const lift = interpolate(fr, [out, out + 18], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
    const dy = (1 - drop) * -1100 - lift * 1300;
    const rot = swing(fr, at + 6, 7, 40, 0.3); // two visible swings, damped
    const typed = Math.max(0, Math.min(T.label.length, Math.floor((fr - T.typeAt) / 2) + 1));
    const pw = 900, ph = 330, px = 540 - pw / 2, py = plateY - ph / 2;
    return (
      <Svg>
        <g transform={`translate(0 ${dy}) rotate(${rot} ${hangX} ${hangY})`}>
          <path d={`M${hangX},${hangY} L${px + 150},${py + 8} M${hangX},${hangY} L${px + pw - 150},${py + 8}`} stroke={C.ink} strokeWidth={3} fill="none" />
          <circle cx={hangX} cy={hangY} r={7} fill={C.ink} />
          <g filter="url(#ss-shadow)">
            <path d={wrect(px - 16, py - 16, pw + 32, ph + 32, 'plq-f', 2)} fill={C.oldGold} stroke={C.ink} strokeWidth={3.5} />
            <path d={wrect(px, py, pw, ph, 'plq', 1.5)} fill={C.card} stroke={C.sepia} strokeWidth={2.5} />
          </g>
          <circle cx={px + 150} cy={py + 8} r={6} fill={C.ink} /><circle cx={px + pw - 150} cy={py + 8} r={6} fill={C.ink} />
          <text x={540} y={py + 150} textAnchor="middle" fontFamily={FONT.display} fontWeight={900} fontSize={92} fill={C.ink}>The Stolen Smile</text>
          <path d={`M${540 - 300},${py + 190} L${540 + 300},${py + 190}`} stroke={C.oldGold} strokeWidth={3} />
          <text x={540} y={py + 262} textAnchor="middle" fontFamily={FONT.type} fontSize={44} fill={C.ink}>
            {T.label.slice(0, typed)}<tspan opacity={typed < T.label.length && Math.floor(fr / 4) % 2 ? 1 : 0}>|</tspan>
          </text>
        </g>
      </Svg>
    );
  };

/**
 * End card (pick §2.7): a card gallery label pinned onto the wall with one stamp thump; Special Elite 52 + small
 * logotype. text defaults by part ("Next: The hunt" / "Next: The return" / "The end"). Place at (x,y) screen.
 * hangFrom=[x,y] draws two strings up to a hang point (part 3: the four hooks).
 */
export const EndCard: React.FC<{ fr: number; at: number; part?: 1 | 2 | 3; text?: string; x?: number; y?: number; hangFrom?: [number, number] }> =
  ({ fr, at, part = 1, text, x = 540, y = 1150, hangFrom }) => {
    if (fr < at) return null;
    const label = text ?? NEXT_TEXT[part - 1];
    const s = interpolate(fr, [at, at + 5], [1.35, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    const op = prog(fr, at, 3);
    const w = Math.max(440, label.length * 31 + 90), h = 190;
    const rot = hangFrom ? swing(fr, at + 2, 3, 40) : -1.5;
    return (
      <Svg>
        <g opacity={op} transform={`translate(${x} ${y}) rotate(${rot}${hangFrom ? ` ${hangFrom[0] - x} ${hangFrom[1] - y}` : ''}) scale(${s})`}>
          {hangFrom && <path d={`M${hangFrom[0] - x},${hangFrom[1] - y} L${-w / 2 + 60},${-h / 2} M${hangFrom[0] - x},${hangFrom[1] - y} L${w / 2 - 60},${-h / 2}`} stroke={C.ink} strokeWidth={3} />}
          <g filter="url(#ss-shadow)">
            <path d={wrect(-w / 2, -h / 2, w, h, 'end', 1.5)} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
          </g>
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT.display} fontWeight={900} fontSize={34} fill={C.sepia}>The Stolen Smile</text>
          <path d={`M${-120},${-14} L${120},${-14}`} stroke={C.oldGold} strokeWidth={2} />
          <text x={0} y={48} textAnchor="middle" fontFamily={FONT.type} fontSize={52} fill={C.ink}>{label}</text>
          {!hangFrom && <Pin x={0} y={-h / 2 + 4} />}
        </g>
      </Svg>
    );
  };

/** "Last time…" recap label (pick §2.8): pins top-left (x 64, y 320) with a little drop. outAt removes it. */
export const LastTime: React.FC<{ fr: number; at: number; outAt?: number; x?: number; y?: number }> = ({ fr, at, outAt, x = 64, y = 320 }) => {
  if (fr < at) return null;
  const p = pop(fr, at, 12);
  const o = outAt === undefined ? 0 : prog(fr, outAt, 10);
  return (
    <Svg>
      <g transform={`translate(${x} ${y - (1 - p) * 60 - o * 300}) rotate(-2)`} opacity={Math.min(1, p * 2) * (1 - o)}>
        <g filter="url(#ss-shadow-s)"><path d={wrect(0, 0, 330, 84, 'lt', 1.5)} fill={C.card} stroke={C.ink} strokeWidth={2.5} /></g>
        <text x={28} y={56} fontFamily={FONT.type} fontSize={44} fill={C.ink}>Last time…</text>
        <Pin x={300} y={12} />
      </g>
    </Svg>
  );
};

/**
 * Name tag (pick §1.5): a card luggage tag on a string swinging in from the top, Special Elite 40 px.
 * Upper third (y 300–620). Holds `dur` frames then swings back up.
 */
export const NameTag: React.FC<{ fr: number; at: number; text: string; x?: number; y?: number; dur?: number }> =
  ({ fr, at, text, x = 540, y = 470, dur = 90 }) => {
    if (fr < at || fr > at + dur + 16) return null;
    const p = pop(fr, at, 10);
    const o = prog(fr, at + dur, 14, Easing.in(Easing.cubic));
    const top = 0;
    const len = (y - top) * (p * (1 - o));
    const rot = swing(fr, at + 4, 9, 50, 0.22);
    const w = text.length * 23 + 100, h = 76;
    return (
      <Svg>
        <g transform={`translate(${x} ${top}) rotate(${rot})`}>
          <line x1={0} y1={0} x2={0} y2={len - h / 2} stroke={C.ink} strokeWidth={2.5} />
          <g transform={`translate(0 ${len})`}>
            <g filter="url(#ss-shadow-s)">
              <path d={cut([[-w / 2 + 34, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2 + 34, h / 2], [-w / 2, 0]], `nt${text}`, 1)} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
            </g>
            <circle cx={-w / 2 + 30} cy={0} r={7} fill="none" stroke={C.ink} strokeWidth={2.5} />
            <text x={18} y={13} textAnchor="middle" fontFamily={FONT.type} fontSize={40} fill={C.ink}>{text}</text>
          </g>
        </g>
      </Svg>
    );
  };

/** Honesty tag ("Illustration", "Some say…"): Special Elite 28, ink 70 %, bottom-left (x 64, y ≈ 1340), 2–3 s. */
export const HonestyTag: React.FC<{ fr: number; at: number; text?: string; dur?: number; x?: number; y?: number }> =
  ({ fr, at, text = 'Illustration', dur = 75, x = 64, y = 1340 }) => {
    if (fr < at || fr > at + dur + 10) return null;
    const op = prog(fr, at, 8) * (1 - prog(fr, at + dur, 10));
    return (
      <Svg>
        <g opacity={op}>
          <rect x={x - 10} y={y - 30} width={text.length * 16 + 20} height={42} fill={C.card} opacity={0.55} rx={3} />
          <text x={x} y={y} fontFamily={FONT.type} fontSize={28} fill={C.ink} fillOpacity={0.7}>{text}</text>
        </g>
      </Svg>
    );
  };

/** Rubber stamp (red, Special Elite, uppercase allowed): thumps in at `at` (scale 1.5→1 in 4 frames). Screen or world <g>. */
export const Stamp: React.FC<{ fr: number; at: number; text: string; x: number; y: number; rot?: number; size?: number; color?: string }> =
  ({ fr, at, text, x, y, rot = -8, size = 64, color = C.clueRed }) => {
    if (fr < at) return null;
    const s = interpolate(fr, [at, at + 4], [1.5, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    const w = text.length * size * 0.62 + 50;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={prog(fr, at, 2) * 0.92}>
        <path d={wrect(-w / 2, -size * 0.75, w, size * 1.3, `st${text}`, 2.5)} fill="none" stroke={color} strokeWidth={6} />
        <text x={0} y={size * 0.3} textAnchor="middle" fontFamily={FONT.type} fontSize={size} fill={color} letterSpacing={2}>{text}</text>
      </g>
    );
  };
export { Svg as OverlaySvg, Pin };

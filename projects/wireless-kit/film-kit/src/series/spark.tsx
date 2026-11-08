import React from 'react';
import { C } from './tokens';
import { Glow } from './look';
import { along, clamp, osc, polyD, rnd, stepped } from './util';

export type SparkMode = 'idle' | 'tap' | 'star' | 'glint' | 'ride';
/**
 * <Spark fr x y size?=1 mode?> — the accent (pick §2.1): white core, spark ring, 3-prong crackle corona (re-drawn
 * every 2 frames, seeded), 40 % halo. Modes: idle (gentle crackle), tap (big flash for a Morse tap), ride (corona
 * swept back; pass `dir` in degrees), star (small 4-point twinkle that blinks dot-dash, for the sky), glint (8-frame
 * 4-point flash on glass/gems: pass `at`). Returns <g>.
 */
export const Spark: React.FC<{ fr: number; x: number; y: number; size?: number; mode?: SparkMode; dir?: number; at?: number; op?: number }> =
  ({ fr, x, y, size = 1, mode = 'idle', dir = 0, at = 0, op = 1 }) => {
    if (mode === 'glint') {
      const t = (fr - at) / 8; if (t < 0 || t > 1) return null;
      const s = Math.sin(t * Math.PI) * 28 * size;
      return <g transform={`translate(${x} ${y}) rotate(${t * 40})`} opacity={op}>
        <Glow d={`M${-s} 0L${s} 0M0 ${-s}L0 ${s}`} k={0.5 * size} />
      </g>;
    }
    if (mode === 'star') {
      // blinks "-.-." style: long on, short on, cycle 48 f
      const ph = fr % 48; const on = ph < 12 || (ph >= 16 && ph < 20) || (ph >= 24 && ph < 36) || (ph >= 40 && ph < 44);
      const s = (on ? 22 : 12) * size;
      return <g transform={`translate(${x} ${y})`} opacity={op}>
        <circle r={s * 1.6} fill="url(#wn-spark)" opacity={on ? 0.9 : 0.5} />
        <Glow d={`M${-s} 0L${s} 0M0 ${-s}L0 ${s}`} k={0.35 * size} />
        <circle r={4 * size} fill={C.sparkCore} />
      </g>;
    }
    const f = stepped(fr, 2);
    const big = mode === 'tap' ? 1.6 : 1;
    const R = 26 * size * big;
    const prongs = [0, 1, 2].map((i) => {
      const base = (mode === 'ride' ? dir + 180 + (i - 1) * 35 : i * 120 + rnd(`pa${f}${i}`) * 50) * Math.PI / 180;
      const len = R * (1.2 + rnd(`pl${f}${i}`) * 0.9) * (mode === 'ride' ? 1.5 : 1);
      const pts: [number, number][] = [[0, 0]];
      for (let k = 1; k <= 3; k++) {
        const d = (len * k) / 3; const jit = (rnd(`pj${f}${i}${k}`) - 0.5) * 0.9;
        pts.push([Math.cos(base + jit) * d, Math.sin(base + jit) * d]);
      }
      return polyD(pts);
    });
    return (
      <g transform={`translate(${x} ${y})`} opacity={op}>
        <circle r={R * 1.9} fill="url(#wn-spark)" opacity={0.75 + 0.25 * osc(fr, 7)} />
        {prongs.map((d, i) => <Glow key={i} d={d} k={0.45 * size} />)}
        <circle r={R * 0.42} fill={C.spark} />
        <circle r={R * 0.26} fill={C.sparkCore} />
      </g>
    );
  };

/**
 * <SparkTrail fr path t len?=0.25 size?> — the Spark riding a polyline `path` (world points): head at t (0..1),
 * fading trail of length `len` (fraction of the path) behind it. sparkAt(path,t) gives the head point for the camera.
 */
export const sparkAt = (path: [number, number][], t: number) => along(path, t);
export const SparkTrail: React.FC<{ fr: number; path: [number, number][]; t: number; len?: number; size?: number; head?: boolean }> =
  ({ fr, path, t, len = 0.25, size = 1, head = true }) => {
    const n = 18; const pts: [number, number][] = [];
    for (let i = 0; i <= n; i++) pts.push(along(path, clamp(t - len + (len * i) / n)));
    const [hx, hy] = along(path, clamp(t)); const [px, py] = along(path, clamp(t - 0.01));
    const dir = (Math.atan2(hy - py, hx - px) * 180) / Math.PI;
    return (
      <g>
        {pts.slice(1).map((p, i) => (
          <path key={i} d={polyD([pts[i], p])} stroke={i > n - 4 ? C.sparkCore : C.spark} strokeOpacity={(i / n) * 0.9} strokeWidth={(2 + (i / n) * 8) * size} strokeLinecap="round" fill="none" />
        ))}
        {head && t > 0 && t <= 1 && <Spark fr={fr} x={hx} y={hy} size={size} mode="ride" dir={dir} />}
      </g>
    );
  };

/** morseTimes(code, at, dot=3, dash=7, gap=2, letterGap=6) → taps [{fr,dur,kind}] (spaces in code = letter gaps). */
export const morseTimes = (code: string, at: number, dot = 3, dash = 7, gap = 2, letterGap = 6) => {
  const out: { fr: number; dur: number; kind: '.' | '-' }[] = []; let f = at;
  for (const ch of code) {
    if (ch === ' ') { f += letterGap - gap; continue; }
    const d = ch === '-' ? dash : dot; out.push({ fr: f, dur: d, kind: ch as '.' | '-' }); f += d + gap;
  }
  return out;
};
/**
 * <MorseTap fr at code x y size?> — a Spark that flashes the code (light on during each tap) and draws the dots and
 * dashes as a little ticker under itself. Sound: one `morse-beep` per tap (sound.ts morseCues).
 */
export const MorseTap: React.FC<{ fr: number; at: number; code: string; x: number; y: number; size?: number; showCode?: boolean }> =
  ({ fr, at, code, x, y, size = 1, showCode = true }) => {
    const taps = morseTimes(code, at); const on = taps.some((t) => fr >= t.fr && fr < t.fr + t.dur);
    let cx = 0;
    return (
      <g>
        <Spark fr={fr} x={x} y={y} size={size} mode={on ? 'tap' : 'idle'} />
        {showCode && <g transform={`translate(${x - (taps.length * 22) / 2} ${y + 60 * size})`}>
          {taps.map((t, i) => {
            const vis = fr >= t.fr; const w = t.kind === '-' ? 26 : 9; const node = vis ? <rect key={i} x={cx} y={0} width={w} height={9} rx={4.5} fill={C.spark} /> : null; cx += w + 8; return node;
          })}
        </g>}
      </g>
    );
  };

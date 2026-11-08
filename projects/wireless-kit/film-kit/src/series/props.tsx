import React from 'react';
import { C, FONT } from './tokens';
import { Glow, Ink, Print } from './look';
import { clamp, ease, easeOut, ellipse, osc, pop, prog, rnd, rrect, stepped } from './util';
import { Spark } from './spark';

/**
 * <Telegram fr x y scale? rot? text? typeAt? fold?=0> — newsprint form "WIRELESS TELEGRAM · MARCONI" (420×260 native,
 * top-left at x,y), Courier body typed from typeAt (2 f/letter; immediate if typeAt undefined). fold 0..1 folds it shut
 * (closed = a folded slip marked TELEGRAM). The EndCard is the big version.
 */
export const Telegram: React.FC<{ fr: number; x: number; y: number; scale?: number; rot?: number; text?: string; typeAt?: number; fold?: number }> =
  ({ fr, x, y, scale = 1, rot = 0, text = '', typeAt, fold = 0 }) => {
    const n = typeAt == null ? text.length : clamp(Math.floor((fr - typeAt) / 2) + 1, 0, text.length);
    const f = ease(clamp(fold));
    const lines: string[] = []; text.slice(0, n).split(' ').forEach((w) => { const l = lines[lines.length - 1]; if (!l || (l + ' ' + w).length > 18) lines.push(w); else lines[lines.length - 1] = l + ' ' + w; });
    return (
      <Print><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
        <g transform={`translate(0 ${130 * f}) scale(1 ${1 - f * 0.5}) translate(0 ${-130 * f})`}>
          <Ink d={rrect(0, 0, 420, 260, 4)} fill={C.newsprint} sw={3} />
          {f < 0.6 && <g opacity={1 - f / 0.6}>
            <text x={210} y={36} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={20} letterSpacing={2} fill={C.deep} style={{ fontVariant: 'small-caps' }}>Wireless Telegram · Marconi</text>
            <line x1={20} y1={48} x2={400} y2={48} stroke={C.deep} strokeWidth={1.5} />
            {lines.slice(0, 5).map((l, i) => <text key={i} x={26} y={92 + i * 38} fontFamily={FONT.wire} fontWeight={700} fontSize={30} fill={C.ink} style={{ whiteSpace: 'pre' }}>{l}</text>)}
          </g>}
          {f >= 0.6 && <text x={210} y={150} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={40} fill={C.ink} opacity={(f - 0.6) / 0.4}>TELEGRAM</text>}
        </g>
      </g></Print>
    );
  };

/**
 * <TickerTape fr x y text at? rate?=2 len?=560 rot?> — a strip unspooling to the right from a spool at (x,y) with the
 * Courier text printing on it (rate frames per letter); the newest letter glows spark.
 */
export const TickerTape: React.FC<{ fr: number; x: number; y: number; text: string; at?: number; rate?: number; len?: number; rot?: number }> =
  ({ fr, x, y, text, at = 0, rate = 2, len = 560, rot = 0 }) => {
    const n = clamp(Math.floor((fr - at) / rate) + 1, 0, text.length);
    const cw = 19; const shown = text.slice(0, n); const visChars = Math.floor(len / cw);
    const start = Math.max(0, shown.length - visChars); const vis = shown.slice(start);
    const wob = osc(fr, 24) * 3;
    return (
      <Print><g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <path d={`M0 0 Q${len * 0.5} ${8 + wob} ${len} ${wob}`} stroke="none" fill="none" />
        <Ink d={`M10 -22 L${len} ${-22 + wob} L${len} ${22 + wob} L10 22Z`} fill={C.newsprint} sw={2.5} />
        {vis.split('').map((ch, i) => { const newest = start + i === n - 1 && n < text.length + 1 && fr < at + text.length * rate + 8; return <text key={i} x={len - (vis.length - i) * cw} y={10 + wob} fontFamily={FONT.wire} fontWeight={700} fontSize={30} fill={newest ? C.sparkHalo : C.ink}>{ch}</text>; })}
        {n > 0 && n <= text.length && fr < at + text.length * rate + 8 && <circle cx={len - cw / 2} cy={wob} r={16} fill="url(#wn-spark)" opacity={0.7} />}
        <Ink d={ellipse(0, 0, 34, 34)} fill={C.slate} shade="R" sw={3} />
        <Ink d={ellipse(0, 0, 12, 12)} fill={C.deep} sw={3} />
        <path d={`M0 0 L${Math.cos(fr * 0.3) * 26} ${Math.sin(fr * 0.3) * 26}`} stroke={C.ink} strokeWidth={3} />
      </g></Print>
    );
  };

/**
 * <WirelessKey fr x y scale? taps?=[{fr,dur}] tapping?> — brass Morse key with a spark gap between two balls that
 * jumps while the key is down, and a pair of headphones on a hook. `tapping` = an automatic tap loop. Returns <g>.
 */
export const WirelessKey: React.FC<{ fr: number; x: number; y: number; scale?: number; taps?: { fr: number; dur: number }[]; tapping?: boolean; headphones?: boolean }> =
  ({ fr, x, y, scale = 1, taps, tapping, headphones = true }) => {
    const down = (taps ?? []).some((t) => fr >= t.fr && fr < t.fr + t.dur) || (tapping ? [0, 4, 10, 14, 22].some((o) => (fr % 32) >= o && (fr % 32) < o + ((o === 4 || o === 14) ? 5 : 2)) : false);
    const f = stepped(fr, 2);
    const arc = Array.from({ length: 6 }, (_, i) => `${i ? 'L' : 'M'}${-50 + i * 20} ${-150 + (i === 0 || i === 5 ? 0 : (rnd(`gap${f}${i}`) - 0.5) * 30)}`).join(' ');
    return (
      <Print><g transform={`translate(${x} ${y}) scale(${scale})`}>
        <Ink d={rrect(-170, -20, 340, 40, 8)} fill={C.slate} shade="B" sw={3} />
        <Ink d={rrect(-40, -46, 80, 26, 4)} fill={C.lamp} shade="B" sw={3} />
        <g transform={`rotate(${down ? 4 : 0} -40 -50)`}>
          <Ink d={rrect(-130, -62, 260, 16, 6)} fill={C.lamp} shade="B" sw={3} />
          <Ink d={ellipse(118, -70, 30, 14)} fill={C.deep} sw={3} />
        </g>
        <path d="M-60 -20 L-60 -150 M60 -20 L60 -150" stroke={C.ink} strokeWidth={6} />
        <Ink d={ellipse(-60, -150, 14, 14)} fill={C.lamp} sw={3} /><Ink d={ellipse(60, -150, 14, 14)} fill={C.lamp} sw={3} />
        {down && <><circle cx={0} cy={-150} r={50} fill="url(#wn-spark)" /><Glow d={arc.replace(/-50 /, '-46 ')} k={0.7} /></>}
        {headphones && <g transform="translate(220 -120)"><path d="M-40 0 Q0 -70 40 0" stroke={C.ink} strokeWidth={7} fill="none" /><Ink d={ellipse(-40, 6, 16, 24)} fill={C.deep} sw={3} /><Ink d={ellipse(40, 6, 16, 24)} fill={C.deep} sw={3} /><path d="M40 30 Q60 120 -40 140" stroke={C.ink} strokeWidth={3} fill="none" /></g>}
      </g></Print>
    );
  };

/**
 * <Notebook fr x y scale? rot? open?=0..1 lines?=string[] writeAt? cover?=true bookmark?> — Dew's newsprint notebook,
 * cover "Insp. W. Dew · Scotland Yard" (Old Standard). open 0..1 flaps the cover up; lines write themselves from
 * writeAt (one line per 20 f, letters revealed left to right); bookmark = the Feather tip out of the pages (cora).
 */
export const Notebook: React.FC<{ fr: number; x: number; y: number; scale?: number; rot?: number; open?: number; lines?: string[]; writeAt?: number; bookmark?: boolean }> =
  ({ fr, x, y, scale = 1, rot = 0, open = 0, lines = [], writeAt = 0, bookmark }) => {
    const o = ease(clamp(open));
    return (
      <Print><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
        <Ink d={rrect(0, 0, 300, 400, 6)} fill={C.newsprint} sw={3} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1={20} y1={120 + i * 40} x2={280} y2={120 + i * 40} stroke={C.mist} strokeWidth={2} />)}
        {lines.map((l, i) => { const t0 = writeAt + i * 20; const n = clamp(Math.floor((fr - t0) / 1.2), 0, l.length); return <text key={i} x={26} y={112 + i * 40} fontFamily={FONT.period} fontStyle="italic" fontSize={32} fill={C.deep}>{l.slice(0, n)}</text>; })}
        {bookmark && <g transform="translate(296 60) rotate(-8)"><path d="M0 -10 Q60 -26 110 -8 Q70 4 60 10 Q40 0 0 10Z" fill={C.cora} stroke={C.ink} strokeWidth={3} /><path d="M0 0 L100 -8" stroke={C.ink} strokeWidth={2} /></g>}
        {o < 1 && <g transform={`translate(0 0) scale(1 ${1 - 2 * o}) `}>
          <Ink d={rrect(0, 0, 300, 400, 6)} fill={1 - 2 * o > 0 ? C.deep : C.slate} sw={3} />
          {1 - 2 * o > 0.2 && <><rect x={40} y={110} width={220} height={110} fill={C.newsprint} stroke={C.ink} strokeWidth={2} />
            <text x={150} y={156} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={30} fill={C.ink}>Insp. W. Dew</text>
            <text x={150} y={196} textAnchor="middle" fontFamily={FONT.period} fontStyle="italic" fontSize={24} fill={C.deep}>Scotland Yard</text></>}
          <path d="M0 0 L300 0" stroke={C.ink} strokeWidth={6} />
        </g>}
        <path d="M0 -4 L300 -4" stroke={C.ink} strokeWidth={8} strokeDasharray="6 10" />
      </g></Print>
    );
  };

/**
 * <PoliceLamp x y angle?=0 beam?=true scale? beamLen?=520 flicker? fr?> — bull's-eye lantern with a lamp-coloured beam
 * cone (35 %), pointing at `angle` degrees (0 = right, 90 = down).
 */
export const PoliceLamp: React.FC<{ fr?: number; x: number; y: number; angle?: number; beam?: boolean; scale?: number; beamLen?: number }> =
  ({ fr = 0, x, y, angle = 0, beam = true, scale = 1, beamLen = 520 }) => (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      {beam && <path d={`M30 -18 L${beamLen} ${-beamLen * 0.28} L${beamLen} ${beamLen * 0.28} L30 18Z`} fill="url(#wn-beam)" opacity={0.64 + 0.04 * osc(fr, 9)} />}
      <Print>
        <Ink d="M-34 -30 L20 -30 L24 30 L-34 30Z" fill={C.deep} shade="B" sw={3} />
        <Ink d={ellipse(26, 0, 12, 24)} fill={C.lamp} sw={3} />
        <Ink d="M-20 -30 Q-6 -60 8 -30" sw={4} />
      </Print>
    </g>
  );

/** <Telescope x y angle? extend?=1 scale?> — brass telescope (draw tubes slide out with extend 0..1). */
export const Telescope: React.FC<{ x: number; y: number; angle?: number; extend?: number; scale?: number }> = ({ x, y, angle = 0, extend = 1, scale = 1 }) => (
  <Print><g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <Ink d="M0 -18 L140 -20 L140 20 L0 18Z" fill={C.lamp} shade="B" sw={3} />
    <Ink d={`M140 -16 L${140 + 110 * extend} -16 L${140 + 110 * extend} 16 L140 16Z`} fill={C.lamp} shade="B" sw={3} />
    <Ink d={`M${130 + 110 * extend} -24 L${150 + 110 * extend} -24 L${150 + 110 * extend} 24 L${130 + 110 * extend} 24Z`} fill={C.slate} sw={3} />
    <path d="M40 -19 V19" stroke={C.ink} strokeWidth={3} />
  </g></Print>
);
/**
 * <TelescopeView fr cx cy r?=300> — the telescope's view: everything outside a circle at (cx,cy) is dimmed to deep 85 %
 * with a brass ring and cross-hair ticks. Put it above the world (frame coords) and move cx/cy to sweep.
 */
export const TelescopeView: React.FC<{ cx: number; cy: number; r?: number }> = ({ cx, cy, r = 300 }) => (
  <g>
    <path d={`M-10 -10 H1090 V1930 H-10Z M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`} fill={C.deep} fillOpacity={0.88} fillRule="evenodd" />
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.lamp} strokeWidth={16} />
    <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={C.ink} strokeWidth={4} />
    {[0, 90, 180, 270].map((a) => <line key={a} x1={cx + Math.cos(a * Math.PI / 180) * (r - 30)} y1={cy + Math.sin(a * Math.PI / 180) * (r - 30)} x2={cx + Math.cos(a * Math.PI / 180) * (r - 6)} y2={cy + Math.sin(a * Math.PI / 180) * (r - 6)} stroke={C.ink} strokeWidth={4} />)}
  </g>
);

/** <HunchBulb fr x y at? size?> — small clue-outline bulb that clicks on at `at` (pop + 4 rays). Off before `at`. */
export const HunchBulb: React.FC<{ fr: number; x: number; y: number; at?: number; size?: number; on?: boolean }> = ({ fr, x, y, at = 0, size = 1, on }) => {
  const lit = on ?? fr >= at; const s = lit ? 0.8 + 0.2 * pop(fr, at, 12) : 0.8;
  return (
    <g transform={`translate(${x} ${y}) scale(${size * s})`}>
      {lit && <circle r={70} fill="url(#wn-lamp)" opacity={0.8} />}
      <path d="M-34 0 A34 34 0 1 1 34 0 Q22 18 20 36 L-20 36 Q-22 18 -34 0Z" fill={lit ? C.newsprint : C.fog} stroke={C.clue} strokeWidth={5} />
      <path d="M-18 44 H18 M-14 54 H14" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <path d="M-10 30 L-6 4 L0 16 L6 4 L10 30" stroke={lit ? C.clue : C.slate} strokeWidth={4} fill="none" />
      {lit && [-60, -20, 20, 60].map((a, i) => <line key={i} x1={Math.sin(a * Math.PI / 180) * 48} y1={-Math.cos(a * Math.PI / 180) * 48 - 6} x2={Math.sin(a * Math.PI / 180) * 66} y2={-Math.cos(a * Math.PI / 180) * 66 - 6} stroke={C.clue} strokeWidth={5} strokeLinecap="round" />)}
    </g>
  );
};

/** <ClueRing fr at x y r?=60 rx? ry? > — clue-yellow circle that draws on in 8 frames around a target, 4 px, slight wobble. */
export const ClueRing: React.FC<{ fr: number; at: number; x: number; y: number; r?: number; rx?: number; ry?: number; out?: number }> = ({ fr, at, x, y, r = 60, rx, ry, out }) => {
  const t = clamp((fr - at) / 8); if (t <= 0) return null;
  const o = out != null ? 1 - clamp((fr - out) / 8) : 1; if (o <= 0) return null;
  const RX = rx ?? r, RY = ry ?? r; const N = 40; const pts: string[] = [];
  for (let i = 0; i <= N * t * 1.08; i++) { const a = -Math.PI / 2 + (i / N) * Math.PI * 2; const w = 1 + 0.04 * Math.sin(i * 1.7) + 0.02 * Math.sin(fr * 0.2 + i); pts.push(`${i ? 'L' : 'M'}${(x + Math.cos(a) * RX * w).toFixed(1)} ${(y + Math.sin(a) * RY * w).toFixed(1)}`); }
  return <path d={pts.join(' ')} fill="none" stroke={C.clue} strokeWidth={4} strokeLinecap="round" opacity={o} />;
};

/**
 * <StoryBalloon fr x y w?=360 h?=260 tail?=[dx,dy] text? picture? wet? wetAt? fuzzy? at?> — speech balloon (top-left at
 * x,y) holding a small painted picture (picture = (fr,w,h) => node in the inner box) and/or text. wet adds a clue drip
 * running from the picture from wetAt; fuzzy draws it as stacked offset soft copies (an unclear answer). at = pop in.
 */
export const StoryBalloon: React.FC<{ fr: number; x: number; y: number; w?: number; h?: number; tail?: [number, number]; text?: string; picture?: (fr: number, w: number, h: number) => React.ReactNode; wet?: boolean; wetAt?: number; fuzzy?: boolean; at?: number; fontSize?: number }> =
  ({ fr, x, y, w = 360, h = 260, tail = [-60, 120], text, picture, wet, wetAt = 0, fuzzy, at = 0, fontSize = 40 }) => {
    const s = pop(fr, at, 14); if (s <= 0) return null;
    const cx = w / 2, cy = h / 2;
    const shape = `M${cx} 0 C${w * 0.95} 0 ${w} ${h * 0.2} ${w} ${cy} C${w} ${h * 0.85} ${w * 0.8} ${h} ${cx + 30} ${h} L${cx + tail[0] + 20} ${h + tail[1]} L${cx - 20} ${h} C${w * 0.15} ${h} 0 ${h * 0.85} 0 ${cy} C0 ${h * 0.2} ${w * 0.05} 0 ${cx} 0Z`;
    const drip = wet ? clamp((fr - wetAt) / 30) : 0;
    const inner = (
      <g>
        <Ink d={shape} fill={C.newsprint} sw={4} />
        {picture && <svg x={w * 0.14} y={h * 0.14} width={w * 0.72} height={h * 0.62} viewBox={`0 0 ${w * 0.72} ${h * 0.62}`} overflow="hidden"><rect width={w * 0.72} height={h * 0.62} fill={C.fog} />{picture(fr, w * 0.72, h * 0.62)}</svg>}
        {text && <text x={cx} y={picture ? h * 0.92 : cy + fontSize * 0.35} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={picture ? 30 : fontSize} fill={C.ink}>{text}</text>}
        {drip > 0 && <g><path d={`M${w * 0.55} ${h * 0.7} L${w * 0.55} ${h * 0.7 + drip * 120}`} stroke={C.clue} strokeWidth={10} strokeLinecap="round" /><circle cx={w * 0.55} cy={h * 0.7 + drip * 120 + 6} r={9} fill={C.clue} /></g>}
      </g>
    );
    return (
      <Print><g transform={`translate(${x} ${y}) translate(${cx} ${h}) scale(${s}) translate(${-cx} ${-h})`}>
        {fuzzy ? <g>{[[-14, -6, 0.3], [12, 8, 0.3], [-6, 10, 0.35], [0, 0, 0.55]].map(([dx, dy, o], i) => <g key={i} transform={`translate(${dx + osc(fr, 30, i * 0.2) * 6} ${dy})`} opacity={o}>{inner}</g>)}</g> : inner}
      </g></Print>
    );
  };

/**
 * <WallCalendar fr x y months?=string[] flipAt?=number[] scale? fly?=true> — month pad ("February 1910" → "March 1910"
 * → …). At flipAt[i] page i tears off and flies away (up-right, tumbling, 24 f) revealing page i+1.
 */
export const WallCalendar: React.FC<{ fr: number; x: number; y: number; months?: string[]; flipAt?: number[]; scale?: number; fly?: boolean }> =
  ({ fr, x, y, months = ['February 1910', 'March 1910'], flipAt = [], scale = 1, fly = true }) => {
    let cur = 0; flipAt.forEach((f) => { if (fr >= f) cur++; }); cur = Math.min(cur, months.length - 1);
    const page = (m: string, key: string | number) => {
      const [mon, yr] = m.split(' ');
      return <g key={key}>
        <Ink d={rrect(0, 0, 240, 280, 4)} fill={C.newsprint} sw={3} />
        <rect x={0} y={0} width={240} height={70} fill={C.deep} />
        <text x={120} y={50} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={mon.length > 7 ? 34 : 40} fill={C.newsprint}>{mon}</text>
        <text x={120} y={250} textAnchor="middle" fontFamily={FONT.display} fontSize={50} fill={C.ink}>{yr}</text>
        {Array.from({ length: 15 }, (_, i) => <rect key={i} x={24 + (i % 5) * 40} y={92 + Math.floor(i / 5) * 34} width={26} height={18} fill={C.mist} />)}
      </g>;
    };
    return (
      <Print><g transform={`translate(${x} ${y}) scale(${scale})`}>
        <circle cx={120} cy={-14} r={8} fill={C.deep} />
        {page(months[cur], 'c')}
        {fly && flipAt.map((f, i) => { const t = (fr - f) / 24; if (t < 0 || t > 1 || !months[i]) return null; return <g key={i} transform={`translate(${t * 420} ${-t * 300 + t * t * 120}) rotate(${t * 220} 120 140)`} opacity={1 - t * 0.6}>{page(months[i], i)}</g>; })}
      </g></Print>
    );
  };

/** <RopeLadder fr x y len?=600 dropAt?=0 sway?> — rope ladder hanging from (x,y): unrolls downward from dropAt (14 f), then sways. */
export const RopeLadder: React.FC<{ fr: number; x: number; y: number; len?: number; dropAt?: number }> = ({ fr, x, y, len = 600, dropAt = 0 }) => {
  const d = prog(fr, dropAt, 14, easeOut); if (d <= 0) return null;
  const L = len * d; const sw = osc(fr, 50) * 10 * d;
  const rungs = Math.floor(L / 60);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M-40 0 Q${-40 + sw * 0.5} ${L / 2} ${-40 + sw} ${L} M40 0 Q${40 + sw * 0.5} ${L / 2} ${40 + sw} ${L}`} stroke={C.ink} strokeWidth={7} fill="none" />
      <path d={`M-40 0 Q${-40 + sw * 0.5} ${L / 2} ${-40 + sw} ${L} M40 0 Q${40 + sw * 0.5} ${L / 2} ${40 + sw} ${L}`} stroke={C.lamp} strokeOpacity={0.5} strokeWidth={3} fill="none" />
      {Array.from({ length: rungs }, (_, i) => { const yy = 40 + i * 60; const k = yy / Math.max(1, L); return <Ink key={i} d={rrect(-46 + sw * k * k, yy - 6, 92, 12, 4)} fill={C.slate} sw={3} />; })}
    </g>
  );
};

/** <PilotCap fr x y scale? liftAt?> — the peaked pilot cap alone (deep, white piping); from liftAt it lifts and tips (12 f). */
export const PilotCap: React.FC<{ fr: number; x: number; y: number; scale?: number; liftAt?: number }> = ({ fr, x, y, scale = 1, liftAt }) => {
  const l = liftAt == null ? 0 : prog(fr, liftAt, 12, easeOut);
  return (
    <Print><g transform={`translate(${x} ${y - l * 80}) rotate(${-l * 18}) scale(${scale})`}>
      <Ink d="M-90 10 Q-100 -56 0 -62 Q110 -58 100 6Z" fill={C.deep} shade="R" sw={4} />
      <Ink d="M-88 2 L94 2 L94 22 L-88 22Z" fill={C.deep} sw={4} />
      <path d="M-88 4 L94 4" stroke={C.newsprint} strokeWidth={4} />
      <Ink d="M20 20 Q86 18 138 34 Q86 40 20 30Z" fill={C.ink} sw={3} />
    </g></Print>
  );
};

/**
 * <SeaBirds fr count?=4 area?=[x,y,w,h] seed? size?> — gulls, each on its own looping path with its own wing beat.
 */
export const SeaBirds: React.FC<{ fr: number; count?: number; area?: [number, number, number, number]; seed?: number; size?: number; color?: string }> =
  ({ fr, count = 4, area = [0, 300, 1080, 500], seed = 1, size = 1, color = C.ink }) => (
    <g>{Array.from({ length: count }, (_, i) => {
      const r = (k: string) => rnd(`gull${seed}${i}${k}`);
      const sp = 0.6 + r('s') * 0.9; const span = area[2] + 300;
      const gx = area[0] - 150 + ((r('x') * span + fr * sp * 2.2) % span);
      const gy = area[1] + r('y') * area[3] + Math.sin(fr / (40 + r('p') * 30) + r('q') * 6) * 30;
      const w = Math.sin(fr / (4 + r('w') * 3) + i) * 18; const s = size * (0.7 + r('z') * 0.6);
      return <path key={i} transform={`translate(${gx} ${gy}) scale(${s})`} d={`M-34 ${w} Q-16 ${-10 + w * 0.3} 0 4 Q16 ${-10 + w * 0.3} 34 ${w}`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}</g>
  );

/**
 * <DeckChair x y scale? facing?> — a wooden deck chair, reclined, seat at (x, y-150 native). Feet line = y. Put a
 * puppet in pose 'deckChair' at the same (x, y) on top of it (CrippenB chair prop does this for you). Native ~260 wide.
 */
export const DeckChair: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1 }> = ({ x, y, scale = 1, facing = 1 }) => (
  <Print><g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
    <path d="M-150 0 L-60 -170 M120 0 L40 -190 M-110 -70 L150 -40" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
    <Ink d="M-190 -330 L-60 -150 L170 -170 L190 -150 L-50 -122 L-220 -320Z" fill={C.newsprint} shade="RB" sw={5} />
    <path d="M-200 -322 L-56 -136 L180 -160" stroke={C.slate} strokeWidth={6} fill="none" />
  </g></Print>
);

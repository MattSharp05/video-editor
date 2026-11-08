// Cards and tags over the picture (corner tab, title plaque + subtitle, honesty tags, end card). Stand-ins in the
// pick's spec until the kit's TitlePlaque / CornerTab / HonestyTag / EndCard replace them.
import React from 'react';
import B from './beats.json';
import {C, FONT, lin, ramp, osc, SparkDot, backOut} from './look';

const TOTAL = B.total;
export const PLAQUE_OUT = B.l2 - 0.45; // plate lifts out at the end of line 2 (l1)
export const END_AT = TOTAL - 2.3;

const Tab: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', left: 48, top: 72, background: C.newsprint, padding: '8px 18px 8px 40px', fontFamily: FONT.sans, fontWeight: 600,
    fontSize: 30, color: C.ink, borderRadius: 4, boxShadow: `3px 2px 0 ${C.ink}`}}>
    <span style={{position: 'absolute', left: 14, top: 18, width: 14, height: 14, borderRadius: 7, background: C.spark, boxShadow: `0 0 ${6 + 4 * osc(t, 1)}px ${C.sparkHalo}`}} />
    Caught by Wireless · Part 2 of 3
  </div>
);

// Plaque: deep enamel plate, 4 spark rivets, "CAUGHT BY WIRELESS" burned in by three Morse taps between 2.4 and 4.0 s.
const WORDS3 = ['CAUGHT', 'BY', 'WIRELESS'];
const TAPS = [2.45, 3.0, 3.55];
const Plaque: React.FC<{t: number}> = ({t}) => {
  const inK = ramp(t, 2.1, 0.35);
  const out = ramp(t, PLAQUE_OUT, 0.45);
  if (inK <= 0 || out >= 1) return null;
  const y = 300 + (1 - inK) * -40 - out * 600 + osc(t, 0.15) * 4;
  const subK = backOut(lin(t, B.title - 0.05, 0.25));
  const chaseGo = lin(t, B.chase + 0.05, 0.6);
  // spark that taps the letters
  const tapI = TAPS.findIndex((a, k) => t >= a - 0.25 && t < (TAPS[k + 1] ?? 4.0) - 0.25);
  const sx = [300, 500, 760][Math.max(0, tapI)] + (tapI >= 0 ? osc(t, 3) * 6 : 0);
  return (
    <div style={{position: 'absolute', left: 120, top: y, width: 840, opacity: inK}}>
      <div style={{position: 'relative', height: 230, background: C.deep, borderRadius: 18, border: `4px solid ${C.ink}`, boxShadow: `inset 0 0 0 10px ${C.deep}, inset 0 0 0 13px ${C.newsprint}`}}>
        {[[26, 26], [814, 26], [26, 204], [814, 204]].map(([x, yy], k) => (
          <div key={k} style={{position: 'absolute', left: x - 9, top: yy - 9, width: 18, height: 18, borderRadius: 9, background: C.spark, boxShadow: `0 0 10px ${C.sparkHalo}`}} />
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22,
          fontFamily: FONT.plaque, fontSize: 92, color: C.newsprint, letterSpacing: 1}}>
          {WORDS3.map((w, k) => {
            const b = lin(t, TAPS[k], 0.18);
            return <span key={k} style={{opacity: b, textShadow: b < 1 ? `0 0 ${24 * (1 - b)}px ${C.spark}` : undefined, color: b < 1 ? C.spark : C.newsprint}}>{w}</span>;
          })}
        </div>
        {t < 4.0 && tapI >= 0 && (
          <svg width={840} height={230} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <SparkDot t={t} x={sx} y={40 + Math.abs(Math.sin((t - TAPS[tapI]) * 9)) * -30} s={0.8} seed="plq" />
          </svg>
        )}
      </div>
      {subK > 0 && (
        <div style={{margin: '-6px auto 0', width: 640, background: C.newsprint, border: `3px solid ${C.ink}`, padding: '8px 0 12px', textAlign: 'center',
          transform: `scale(${0.6 + 0.4 * subK}) rotate(${-1.5 * (1 - subK)}deg)`, opacity: Math.min(1, subK * 2), fontFamily: FONT.period, fontStyle: 'italic', fontSize: 52, color: C.ink}}>
          Part two ·{' '}
          {'The chase'.split('').map((ch, k) => {
            const go = Math.max(0, chaseGo * 1.6 - k * 0.06);
            return <span key={k} style={{display: 'inline-block', transform: `translate(${go * 260 * (1 + k * 0.1)}px, ${go * go * 620}px) rotate(${go * 30}deg)`, opacity: 1 - lin(go, 0.85, 0.15)}}>{ch === ' ' ? ' ' : ch}</span>;
          })}
        </div>
      )}
    </div>
  );
};

export const Tag: React.FC<{t: number; at: number; until: number; text: string; x?: number; y?: number}> = ({t, at, until, text, x = 64, y = 1180}) => {
  const o = Math.min(lin(t, at, 0.25), 1 - lin(t, until - 0.25, 0.25));
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, background: C.newsprint, padding: '5px 16px 6px', fontFamily: FONT.sans, fontWeight: 600, fontSize: 28,
      color: C.ink, clipPath: 'polygon(0 0, 100% 0, 96% 50%, 100% 100%, 0 100%, 4% 50%)', paddingLeft: 26, paddingRight: 30}}>{text}</div>
  );
};

const END_TEXT = 'NEXT: THE VERDICT';
const EndCard: React.FC<{t: number}> = ({t}) => {
  if (t < END_AT) return null;
  const up = ramp(t, END_AT, 12 / 30);
  const n = Math.floor(lin(t, END_AT + 0.35, 0.9) * END_TEXT.length);
  return (
    <div style={{position: 'absolute', left: 140, top: 560 + (1 - up) * 120, width: 800, height: 440, opacity: up, background: C.newsprint, border: `4px solid ${C.ink}`,
      boxShadow: `6px 5px 0 ${C.deep}`}}>
      <div style={{margin: '26px 34px 0', borderBottom: `3px double ${C.ink}`, paddingBottom: 12, fontFamily: FONT.period, fontVariant: 'small-caps', fontSize: 40, letterSpacing: 3, color: C.ink, textAlign: 'center'}}>
        Wireless Telegram · Marconi
      </div>
      <div style={{margin: '18px 40px', display: 'flex', justifyContent: 'space-between', fontFamily: FONT.period, fontSize: 26, color: C.slate}}>
        <span>From: S.S. Montrose</span><span>Part 2 of 3</span>
      </div>
      <div style={{marginTop: 50, textAlign: 'center', fontFamily: FONT.wire, fontWeight: 700, fontSize: 64, color: C.ink}}>
        {END_TEXT.slice(0, n)}<span style={{display: 'inline-block', width: 30, height: 56, marginLeft: 6, verticalAlign: -6, background: C.spark, opacity: Math.floor(t * 3) % 2 ? 1 : 0.15}} />
      </div>
    </div>
  );
};

export const Overlays: React.FC<{t: number; fr: number}> = ({t}) => (
  <>
    <Tab t={t} />
    <Plaque t={t} />
    <Tag t={t} at={0.4} until={B.l1 - 0.3} text="Last time…" x={64} y={1180} />
    <Tag t={t} at={B.tenderly - 0.2} until={B.l8 - 0.2} text="As the captain told it" />
    <Tag t={t} at={B.onboard - 0.6} until={B.l11 - 0.3} text="Short version" />
    <Tag t={t} at={B.l13 + 0.3} until={B.l14 - 0.3} text="Short version: never side by side" />
    <EndCard t={t} />
  </>
);

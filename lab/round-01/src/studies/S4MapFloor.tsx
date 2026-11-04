// S4 · The map becomes a floor. Says: "your day, laid out as a place you can walk".
// The flat map tips back into a floor, the day's stops stand up as pins and the route draws
// between them in order; the date pills hover above. Switching day: old pins sink, new rise.
import React from 'react';
import {interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Frame} from '../kit/caption';
import {ACCENT, Layer, P, Stage, arrive, camAt, clamp, creep, lerp, spr, t01} from '../kit/space';

const MAP = staticFile('vegas-plan-day-2.png');
const MW = 1060, S = MW / 1206, MH = 898 * S; // the floor: the map region of the screenshot only (y 566-1464)
const DAYS = ['Thu 12', 'Fri 13', 'Sat 14', 'Sun 15', 'Mon 16'];
// Friday's real pins, at their positions in the screenshot (x / 1206, (y - 566) / 898)
const FRI = [{x: 514 / 1206, y: 535 / 898, n: 'Brunch'}, {x: 439 / 1206, y: 533 / 898, n: 'Fountains'}, {x: 861 / 1206, y: 177 / 898, n: 'Museum'}, {x: 343 / 1206, y: 765 / 898, n: 'Dinner'}];
const SAT = [{x: 0.62, y: 0.42, n: 'Gondola'}, {x: 0.55, y: 0.25, n: 'Forum Shops'}, {x: 0.22, y: 0.2, n: 'Red Rock'}]; // invented stand-ins
const SWITCH = 92;

const Pins: React.FC<{fr: number; pins: typeof FRI; at: number; out?: number; pitch: number}> = ({fr, pins, at, out, pitch}) => (
  <>
    {pins.map((p, i) => {
      const rise = spr(fr, at + i * 4, 13, 210);
      const sink = out ? t01(fr, out + i * 2, out + 10 + i * 2) : 0;
      const k = rise * (1 - sink);
      if (k < 0.01) return null;
      return (
        <React.Fragment key={p.n}>
          <div style={{position: 'absolute', left: p.x * MW - 30, top: p.y * MH - 12, width: 60, height: 24, borderRadius: '50%',
            background: 'rgba(0,0,0,0.65)', filter: 'blur(5px)', opacity: k}} />
          <Layer x={p.x * MW} y={p.y * MH - 70} w={64} h={140} style={{transformOrigin: '50% 100%',
            transform: `rotateX(${-pitch}deg) scale(${k})`}}>
            <div style={{position: 'absolute', left: 30, top: 60, width: 4, height: 80, background: '#fff', opacity: 0.85}} />
            <div style={{position: 'absolute', left: 0, top: 0, width: 64, height: 64, borderRadius: '50%', background: ACCENT,
              border: '4px solid #fff', boxSizing: 'border-box', color: '#fff', fontWeight: 800, fontSize: 28, display: 'flex',
              alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
            <div style={{position: 'absolute', left: 76, top: 12, whiteSpace: 'nowrap', color: '#fff', fontWeight: 700, fontSize: 30,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>{p.n}</div>
          </Layer>
        </React.Fragment>
      );
    })}
  </>
);

const Route: React.FC<{fr: number; pins: typeof FRI; at: number; out?: number}> = ({fr, pins, at, out}) => {
  const d = pins.map((p, i) => `${i ? 'L' : 'M'} ${p.x * MW} ${p.y * MH}`).join(' ');
  const draw = t01(fr, at, at + 30);
  const gone = out ? t01(fr, out, out + 8) : 0;
  return (
    <svg width={MW} height={MH} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <path d={d} stroke={ACCENT} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} opacity={1 - gone} />
    </svg>
  );
};

export const S4MapFloor: React.FC = () => {
  const fr = useCurrentFrame();
  const tip = t01(fr, 6, 40, arrive);
  const pitch = lerp(0, 60, tip);
  const cam = camAt(fr, [[0, {dist: P * 1.25}], [40, {dist: P * 1.02, ty: 40}, arrive], [160, {dist: P * 0.96, ty: 40, yaw: 10}]]);
  const c = creep(fr, 0.8);
  const sel = fr < SWITCH ? 1 : 2;
    return (
    <Frame>
      <Stage cam={{...cam, yaw: cam.yaw + c.yaw}}>
        <Layer y={110} w={MW} h={MH} rx={pitch} style={{borderRadius: 30, border: '1.5px solid rgba(255,255,255,0.12)',
          backgroundImage: `url(${MAP})`, backgroundSize: `${1206 * S}px ${2622 * S}px`, backgroundPosition: `0px ${-566 * S}px`,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05)'}}>
          {/* hide the map's own flat pins: the standing ones replace them */}
          {FRI.map((p) => <div key={p.n} style={{position: 'absolute', left: p.x * MW - 58, top: p.y * MH - 58, width: 116, height: 116,
            borderRadius: '50%', background: '#2A2E4A'}} />)}
          <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: 'rgba(10,12,30,0.25)'}} />
          <Route fr={fr} pins={FRI} at={50} out={SWITCH} />
          <Pins fr={fr} pins={FRI} at={38} out={SWITCH} pitch={pitch} />
          <Route fr={fr} pins={SAT} at={SWITCH + 22} />
          <Pins fr={fr} pins={SAT} at={SWITCH + 8} pitch={pitch} />
        </Layer>
        {/* the date pills, hovering above the far edge of the floor */}
        <Layer y={-400} z={160} w={900} h={150} style={{opacity: t01(fr, 20, 40), display: 'flex', gap: 18, justifyContent: 'center'}}>
          {DAYS.map((d, i) => {
            const on = i === sel;
            const flash = i === 2 ? spr(fr, SWITCH, 12, 240) : 1;
            return (
              <div key={d} style={{width: 150, height: 150, borderRadius: 26, background: on ? ACCENT : '#151517',
                border: '1.5px solid rgba(255,255,255,0.12)', color: on ? '#fff' : '#A0A0A0', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 600,
                transform: `translateZ(${on ? 40 : 0}px) scale(${i === 2 && on ? 0.9 + flash * 0.1 : 1})`}}>
                <span>{d.split(' ')[0]}</span><span style={{fontSize: 52, fontWeight: 800, color: on ? '#fff' : '#fff'}}>{d.split(' ')[1]}</span>
              </div>
            );
          })}
        </Layer>
      </Stage>
      <Caption fr={fr} at={4} text="Each day becomes a route" key_="route" />
    </Frame>
  );
};

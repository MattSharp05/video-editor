// S1 · Exploded interface. Says: "here is what this screen is made of".
// The real screen comes apart into its layers at different depths while the camera swings
// round to an oblique view, the layers get labels, then everything collapses flat again.
import React from 'react';
import {staticFile, useCurrentFrame} from 'remotion';
import {Caption, Frame} from '../kit/caption';
import {ACCENT, K, Layer, P, PhoneBody, Shadow, SH, Slice, Stage, SW, Tag, arrive, camAt, creep, lerp, t01, toWorld} from '../kit/space';

const SRC = staticFile('vegas-plan-day-2.png');
// screenshot regions [x, y, w, h] in screenshot px
const R = {
  header: [0, 0, 1206, 318], pills: [0, 318, 1206, 248], map: [0, 566, 1206, 898],
  sheet: [0, 1464, 1206, 1158], tab: [60, 2365, 1086, 200],
} as const;
const PINS = [{x: 861, y: 743, n: 3}, {x: 514, y: 1101, n: 1}, {x: 439, y: 1099, n: 2, photo: true}, {x: 343, y: 1331, n: 4, photo: true}];

export const S1Exploded: React.FC = () => {
  const fr = useCurrentFrame();
  const lift = (i: number) => lerp(0, 1, t01(fr, 14 + i * 3, 56 + i * 3, arrive)) * (1 - t01(fr, 112, 140));
  const cam = camAt(fr, [
    [12, {dist: P}],
    [58, {yaw: -42, pitch: 38, roll: -6, dist: P * 1.12, ty: 60, tz: 180}, arrive],
    [110, {yaw: -26, pitch: 30, roll: -4, dist: P * 1.08, ty: 60, tz: 180}],
    [142, {dist: P}],
  ]);
  const c = creep(fr, 0.6);
  const camF = {...cam, yaw: cam.yaw + c.yaw * lift(0), pitch: cam.pitch + c.pitch * lift(0)};
  const Z = {map: 0, pins: 330, sheet: 150, pills: 260, header: 90, tab: 460};
  const lab = (i: number) => t01(fr, 60 + i * 5, 72 + i * 5) * (1 - t01(fr, 104, 112));
  const sh = SH * K, sw = SW * K;

  return (
    <Frame>
      <Stage cam={camF}>
        <PhoneBody />
        {/* the base the layers lift off: the screen's own black */}
        <Layer w={sw} h={sh} z={-1} style={{background: '#000', borderRadius: 64}} />
        <Slice src={SRC} r={R.map as any} z={Z.map * lift(0)} />
        {/* cover the drawn pins on the map so the lifted ones leave holes, not doubles */}
        {PINS.map((p, i) => {
          const w = toWorld(p.x, p.y);
          return <Layer key={i} x={w.x} y={w.y} z={Z.map * lift(0) + 0.5} w={60 * K * 2} h={60 * K * 2}
            style={{borderRadius: '50%', background: '#2A2E4A', opacity: lift(1) > 0.02 ? 1 : 0}} />;
        })}
        <Shadow y={toWorld(0, 1464 + 579).y} z={Z.map * lift(0)} w={sw} h={1158 * K} lift={Z.sheet * lift(2)} radius={40} />
        <Slice src={SRC} r={R.sheet as any} z={Z.sheet * lift(2)} radius={40} />
        <Slice src={SRC} r={R.header as any} z={Z.header * lift(3)} radius={64} style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}} />
        <Shadow y={toWorld(0, 442).y} z={Z.header * lift(3)} w={sw * 0.95} h={190 * K} lift={(Z.pills - Z.header) * lift(4)} />
        <Slice src={SRC} r={R.pills as any} z={Z.pills * lift(4)} />
        <Shadow y={toWorld(0, 2465).y} z={Z.sheet * lift(2)} w={1086 * K} h={200 * K} lift={(Z.tab - Z.sheet) * lift(5)} radius={60} />
        <Slice src={SRC} r={R.tab as any} z={Z.tab * lift(5)} radius={70} />
        {/* pins rebuilt as their own objects, lifted highest */}
        {PINS.map((p, i) => {
          const w = toWorld(p.x, p.y), z = Z.pins * lift(1);
          return (
            <React.Fragment key={i}>
              <Layer x={w.x} y={w.y} z={z} w={96 * K * 1.25} h={96 * K * 1.25}
                style={{borderRadius: '50%', background: ACCENT, border: '4px solid #fff', boxSizing: 'border-box'}} />
              <Layer x={w.x + 22} y={w.y - 22} z={z + 1} w={30} h={30}
                style={{borderRadius: '50%', background: '#000', color: '#fff', fontSize: 18, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxSizing: 'border-box'}}>{p.n}</Layer>
            </React.Fragment>
          );
        })}
        {/* labels */}
        <Tag x={sw / 2 + 10} y={toWorld(0, 900).y} z={Z.map * lift(0)} text="MAP" o={lab(0)} />
        <Tag x={toWorld(861, 0).x + 30} y={toWorld(0, 743).y} z={Z.pins * lift(1)} text="PINS" o={lab(1)} dx={150} />
        <Tag x={sw / 2 + 10} y={toWorld(0, 440).y} z={Z.pills * lift(4)} text="DATES" o={lab(2)} />
        <Tag x={sw / 2 + 10} y={toWorld(0, 1800).y} z={Z.sheet * lift(2)} text="ITINERARY" o={lab(3)} />
        <Tag x={sw / 2 - 30} y={toWorld(0, 2465).y} z={Z.tab * lift(5)} text="TABS" o={lab(4)} />
      </Stage>
      <Caption fr={fr} at={6} text="Every screen is built in layers" key_="layers" />
    </Frame>
  );
};

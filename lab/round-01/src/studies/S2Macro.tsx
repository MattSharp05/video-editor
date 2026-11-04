// S2 · Component macro. Says: "this one control does the work".
// One real row lifts off the screen toward the camera, big; its button is pressed; the row
// flies to the day it was placed in, the day lights up, and the confirmation arrives.
import React from 'react';
import {interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Frame} from '../kit/caption';
import {ACCENT, K, Layer, P, PhoneBody, SH, Shadow, Slice, Stage, SW, arrive, camAt, clamp, creep, lerp, spr, t01, toWorld, travel} from '../kit/space';

const SRC = staticFile('vegas-bucket.png');
const ROW = {y: 2133, h: 190}; // Golden Tiki row centre / height in screenshot px
const SUN = {x: 687, y: 427};   // the Sun 15 date pill

const Row: React.FC<{press: number; glow: number}> = ({press, glow}) => (
  <div style={{position: 'absolute', inset: 0, background: '#141416', borderRadius: 18, border: '1.5px solid rgba(255,255,255,0.12)',
    padding: '12px 18px', boxSizing: 'border-box', color: '#fff'}}>
    <div style={{fontSize: 21, fontWeight: 700}}>Golden Tiki</div>
    <div style={{fontSize: 15, color: '#A0A0A0', marginTop: 3}}>3939 Spring Mountain Rd · Bar</div>
    <div style={{fontSize: 15, color: '#A0A0A0', marginTop: 2}}>Saved from TikTok</div>
    <div style={{position: 'absolute', right: 70, top: 22, padding: '9px 16px', borderRadius: 999, fontSize: 17, fontWeight: 700,
      background: glow > 0 ? `rgba(255,107,34,${glow})` : '#1F1F22', color: '#fff', transform: `scale(${1 - press * 0.08})`}}>Smart Add</div>
    <div style={{position: 'absolute', right: 14, top: 18, width: 44, height: 44, borderRadius: 12, background: '#1F1F22'}} />
  </div>
);

export const S2Macro: React.FC = () => {
  const fr = useCurrentFrame();
  const rowW = SW * K - 30, rowH = ROW.h * K;
  const home = toWorld(SW / 2, ROW.y), pill = toWorld(SUN.x, SUN.y);
  const up = t01(fr, 16, 42, arrive);              // lift toward the camera
  const press = interpolate(fr, [50, 53, 58], [0, 1, 0], clamp);
  const glow = t01(fr, 52, 58);
  const fly = t01(fr, 64, 90, travel);             // to the Sun 15 pill
  const pillPop = spr(fr, 88, 12, 220);
  const toast = t01(fr, 96, 110, arrive);
  const lift = up * (1 - fly);
  const x = lerp(home.x, pill.x, fly), y = lerp(lerp(home.y, home.y - 60, up), pill.y, fly);
  const z = lerp(0, 600, lift) + Math.sin(fly * Math.PI) * 220;
  const s = lerp(1, 0.32, fly) * lerp(1, 1.9, lift);
  const cam = camAt(fr, [
    [8, {dist: P}], [42, {dist: P * 0.92, ty: home.y - 60, tz: 300, pitch: 8, yaw: -6}, arrive],
    [60, {dist: P * 0.9, ty: home.y - 60, tz: 320, pitch: 9, yaw: -4}], [92, {dist: P, pitch: 4, yaw: -3}], [150, {dist: P * 0.98}],
  ]);
  const c = creep(fr, 0.5);
  const dim = 0.55 * lift;
  return (
    <Frame>
      <Stage cam={{...cam, yaw: cam.yaw + c.yaw, pitch: cam.pitch + c.pitch}}>
        <PhoneBody />
        <Slice src={SRC} r={[0, 0, SW, SH]} radius={64} />
        {/* the slot the row left */}
        <Layer x={home.x} y={home.y} z={0.5} w={rowW + 20} h={rowH + 6} style={{background: '#000', opacity: up > 0.02 ? 1 : 0}} />
        <Layer w={SW * K} h={SH * K} z={1} style={{borderRadius: 64, background: `rgba(0,0,0,${dim})`}} />
        {/* the Sun 15 pill lights up when the row lands in it */}
        <Layer x={pill.x} y={pill.y} z={2} w={162 * K} h={205 * K} scale={1 + (pillPop > 0.01 ? (1 - pillPop) * 0.25 : 0)}
          style={{borderRadius: 22, background: ACCENT, opacity: fr >= 88 ? 1 : 0, color: '#fff', textAlign: 'center',
            fontSize: 17, paddingTop: 8, boxSizing: 'border-box', lineHeight: 1.15}}>
          Sun<br /><span style={{fontSize: 26, fontWeight: 700}}>15</span><br />71°
        </Layer>
        <Shadow x={x} y={y + 30} z={0} w={rowW * s} h={rowH * s} lift={z * 0.5} radius={18} />
        <Layer x={x} y={y} z={z} w={rowW} h={rowH} scale={s} style={{opacity: fly > 0.97 ? 0 : 1}}>
          <Row press={press} glow={glow * (1 - fly)} />
        </Layer>
        {/* tap */}
        <Layer x={home.x + rowW / 2 - 130} y={home.y - 60 - 12} z={530} w={90} h={90} scale={0.6 + t01(fr, 50, 62) * 0.9}
          style={{borderRadius: '50%', border: '4px solid rgba(255,255,255,0.9)', opacity: interpolate(fr, [50, 51, 62], [0, 1, 0], clamp)}} />
        {/* the confirmation, as the app shows it */}
        <Layer x={0} y={toWorld(0, 2240).y + (1 - toast) * 60} z={40 * toast} w={SW * K - 36} h={92}
          style={{opacity: toast, background: '#1F1F22', borderRadius: 18, border: '1.5px solid rgba(255,255,255,0.12)',
            color: '#fff', fontSize: 17, padding: '16px 18px', boxSizing: 'border-box', lineHeight: 1.3}}>
          Added to Sun 15, 4:00 PM · 9 min drive from AREA15
          <span style={{position: 'absolute', right: 18, top: 30, color: ACCENT, fontWeight: 700, fontSize: 20}}>Undo</span>
        </Layer>
      </Stage>
      <Caption fr={fr} at={4} text="Smart Add picks the day" key_="Smart Add" />
    </Frame>
  );
};

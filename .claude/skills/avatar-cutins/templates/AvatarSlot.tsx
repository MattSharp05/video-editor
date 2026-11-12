// Avatar cut-ins: places each face clip (public/face/<slot>.mp4, from gen_face.py) on its frames over the film.
// Clips are muted; the master VO plays underneath, so lip-sync matches by construction (each clip was made from
// that slice of the VO, handles included: the clip's frame 0 is clip_in on the film's clock).
//
//   import slots from './face_slots.json';
//   <AbsoluteFill>
//     <World />                                   {/* the animation keeps running under the face */}
//     <AvatarSlots slots={slots.slots} />
//     <Captions ... />                            {/* captions stay on top */}
//   </AbsoluteFill>
//
// Layouts: 'full' (hard cut to the face; start here), 'pip' (rounded card bottom-right, the animation stays
// readable), 'cutout' (a clip with alpha, e.g. ProRes 4444 / VP9 webm from a matte pass, standing in the lower
// frame). Copy into src/kit/ (no dependencies beyond remotion).
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type FaceSlot = {
  name: string; start: number; end: number; clip_in: number; clip_out: number;
  layout?: 'full' | 'pip' | 'cutout';
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Face: React.FC<{slot: FaceSlot; dur: number; pipScale: number; edge: number}> = ({slot, dur, pipScale, edge}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const trim = Math.round((slot.start - slot.clip_in) * fps); // skip the lead handle
  const src = staticFile(`face/${slot.name}.${slot.layout === 'cutout' ? 'webm' : 'mp4'}`);
  const video = <OffthreadVideo src={src} muted trimBefore={trim}
    transparent={slot.layout === 'cutout'} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;

  if (slot.layout === 'pip') {
    // springs in from slightly below and scales up; leaves the same way (anything that moves returns smoothly)
    const k = Math.min(interpolate(frame, [0, edge], [0, 1], clamp), interpolate(frame, [dur - edge, dur], [1, 0], clamp));
    const w = width * pipScale, h = w * 16 / 9;
    return (
      <div style={{position: 'absolute', width: w, height: h, right: width * 0.05, bottom: height * 0.17,
        borderRadius: w * 0.08, overflow: 'hidden', opacity: k, transform: `translateY(${(1 - k) * 40}px) scale(${0.92 + 0.08 * k})`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '2px solid rgba(255,255,255,0.18)'}}>{video}</div>
    );
  }
  if (slot.layout === 'cutout') {
    return <AbsoluteFill style={{top: height * 0.32}}>{video}</AbsoluteFill>;
  }
  return <AbsoluteFill>{video}</AbsoluteFill>; // full: hard cut in and out, like a person cutting to camera
};

export const AvatarSlots: React.FC<{slots: FaceSlot[]; pipScale?: number; pipEdgeFrames?: number}> = ({
  slots, pipScale = 0.38, pipEdgeFrames = 8,
}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {slots.map((s) => {
        const from = Math.round(s.start * fps);
        const dur = Math.max(1, Math.round(s.end * fps) - from);
        return (
          <Sequence key={s.name} from={from} durationInFrames={dur} name={`face:${s.name}`} layout="none">
            <Face slot={s} dur={dur} pipScale={pipScale} edge={pipEdgeFrames} />
          </Sequence>
        );
      })}
    </>
  );
};

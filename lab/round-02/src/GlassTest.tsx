// Material test: the same interface layer (date pills over the map) in three glass looks,
// each turning slowly so the rim and specular band show.
import React from 'react';
import {staticFile, useCurrentFrame} from 'remotion';
import {Frame} from './kit/caption';
import {SANS} from './kit/fonts';
import {P, Slice, Stage, CAM0} from './kit/space';
import {Glass, GlassLook, GlassDefs, UI_ON_GLASS} from './kit/glass';

const SRC = staticFile('vegas-bucket.png');
const k = 0.5;

const Sample: React.FC<{y: number; look: GlassLook; fr: number; label: string}> = ({y, look, fr, label}) => {
  const turn = Math.sin(fr / 40) * 16;
  return (
    <>
      {/* what is behind the glass: a slice of the map, so frost and clarity read */}
      <Slice src={SRC} r={[0, 600, 1206, 520]} k={k} z={-60} style={{transform: `translate(0px, ${y - (860 - 1311) * k}px) translateZ(-60px)`}} />
      <Glass y={y} z={0} w={1206 * k} h={230 * k + 40} ry={turn} rx={-6} turn={turn} look={look} radius={34}
        behind={<div style={{position: 'absolute', inset: 0, backgroundImage: `url(${SRC})`, backgroundSize: `${1206 * k}px ${2622 * k}px`,
          backgroundPosition: `0px ${-(860 - 115) * k}px`}} />}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${SRC})`, backgroundSize: `${1206 * k}px ${2622 * k}px`,
          backgroundPosition: `0px ${-310 * k + 20}px`, filter: UI_ON_GLASS}} />
      </Glass>
      <div style={{position: 'absolute', left: -300, top: y + 120, width: 600, textAlign: 'center', color: '#fff', fontFamily: SANS,
        fontSize: 30, fontWeight: 700, letterSpacing: 4, transform: 'translateZ(0px)'}}>{label}</div>
    </>
  );
};

export const GlassTest: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <Frame>
      <GlassDefs />
      <Stage cam={{...CAM0, dist: P * 1.0, pitch: 8}}>
        <Sample y={-520} look="frosted" fr={fr} label="FROSTED" />
        <Sample y={-60} look="clear" fr={fr + 30} label="CLEAR EDGE" />
        <Sample y={400} look="tinted" fr={fr + 60} label="TINTED" />
      </Stage>
    </Frame>
  );
};

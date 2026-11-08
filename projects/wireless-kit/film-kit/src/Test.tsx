import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Grade, Layer } from './series/look';
import * as K from './series/cast';
export const Test: React.FC = () => {
  const fr = useCurrentFrame();
  return <Grade fr={fr}><Layer>
    <K.EthelA fr={fr} x={300} y={1500} pose="calm" brooch />
    <K.EthelA fr={fr} x={800} y={1500} pose="dance" hair="bob" coat />
  </Layer></Grade>;
};

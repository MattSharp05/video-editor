// One entry per key frame on the board. Each is a camera, the hands in shot, and the caption.
import {J2} from './eniac';
import {Pose} from './hand';

export type HandSpec = {model: 'right' | 'left'; p: number[]; f: number[]; b: number[]; pose: Pose};
export type Beat = {
  set: 'eniac';
  cam: number[]; look: number[]; fov: number;
  hands: HandSpec[];
  caption: {words: string[]; lit: number};
  label: string;
  fill?: number; // overhead fill on the wall (0 in the close hook shot)
};


const CABLES_CAM = [-0.4,2.1,3.2], CABLES_LOOK = [1.5,1,0.05], CABLES_FOV = 50, CABLES_FILL = 1.5;
const GRIP: Pose = {index: {bend: [0, -0.5, -0.6, -0.35]}, middle: {bend: [0, -0.85, -0.95, -0.5]}, ring: {bend: [0, -1.0, -1.05, -0.55]}, pinky: {bend: [0, -1.1, -1.05, -0.6]}, thumb: {bend: [-0.1, -0.25, -0.2]}};

export const BEATS: Record<string, Beat> = {
  // 1. Approved 2026-11-13.
  hook: {
    set: 'eniac', cam: [0.12, 1.06, 1.0], look: [0.68, 0.86, 0.05], fov: 34,
    hands: [{model: 'right', p: [0.587, 0.862, 0.075], f: [-1, -0.15, -0.5], b: [0, 1, 0.3], pose: GRIP}],
    caption: {words: ['How', 'did', 'people', 'write', 'code', 'before', 'screens?'], lit: 5}, label: 'ENIAC, 1946',
  },
  // 2. "In 1946, programmers wrote code with cables."
  cables: {
    set: 'eniac', cam: CABLES_CAM, look: CABLES_LOOK, fov: CABLES_FOV, fill: CABLES_FILL,
    hands: [{model: 'right', p: [J2.x, J2.y, J2.z], f: [-1, -0.2, -0.45], b: [0, 1, 0.3], pose: GRIP}],
    caption: {words: ['In', '1946,', 'programmers', 'wrote', 'code', 'with', 'cables.'], lit: 7}, label: 'ENIAC, 1946',
  },
};

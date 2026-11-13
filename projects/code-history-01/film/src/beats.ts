// One entry per key frame on the board. Each is a camera, the hands in shot, and the caption.
import {J2} from './eniac';
import {keyPos} from './cards';
const KD = keyPos('D');
import {Pose} from './hand';

export type HandSpec = {model: 'right' | 'left'; p: number[]; f: number[]; b: number[]; pose: Pose; anchor?: 'pinch' | 'index'};
export type Beat = {
  set: 'eniac' | 'switches' | 'cards';
  cam: number[]; look: number[]; fov: number;
  hands: HandSpec[];
  caption: {words: string[]; lit: number};
  label: string;
  fill?: number; // overhead fill on the wall (0 in the close hook shot)
};


const CABLES_CAM = [-0.4,2.1,3.2], CABLES_LOOK = [1.5,1,0.05], CABLES_FOV = 50, CABLES_FILL = 1.5;
// Index finger out to press or flip; the rest curled, thumb tucked.
const POINT: Pose = {index: {bend: [0, -0.12, -0.12, -0.06]}, middle: {bend: [0, -1.25, -1.2, -0.7]}, ring: {bend: [0, -1.35, -1.25, -0.7]}, pinky: {bend: [0, -1.4, -1.25, -0.7]}, thumb: {bend: [-0.35, -0.45, -0.35]}};
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
  // 3. "Some machines used switches. Each switch was a one or a zero."
  switches: {
    set: 'switches', cam: [0.42, 0.62, 0.55], look: [0.02, 0.54, 0], fov: 42, fill: 0,
    hands: [{model: 'right', p: [0.094, 0.49, 0.04], f: [-1, 0.45, -0.25], b: [0, 1, 0.35], pose: POINT, anchor: 'index'}],
    caption: {words: ['Some', 'machines', 'used', 'switches.'], lit: 4}, label: 'Front panel, 1950s–70s',
  },
  // 4. "Then programmers typed short words, like ADD, onto paper cards."
  cards: {
    set: 'cards', cam: [0.02, 0.24, 0.27], look: [-0.035, 0.07, 0.035], fov: 37, fill: 0,
    hands: [{model: 'right', p: [KD.x, KD.y - 0.003, KD.z], f: [-0.85, -0.5, -0.3], b: [0.1, 1, 0.1], pose: POINT, anchor: 'index'}],
    caption: {words: ['Then', 'programmers', 'typed', 'short', 'words,', 'like', 'ADD,', 'onto', 'paper', 'cards.'], lit: 7}, label: 'Keypunch and 80-column card',
  },
};

// One entry per key frame on the board. Each is a camera, the hands in shot, and the caption.
import {J2} from './eniac';
import {keyPos} from './cards';
import {errorPoint} from './printout';
import {tkeyPos} from './terminal';
import {ekeyPos, enterPos} from './editor';
const KE = enterPos();
const KU = ekeyPos('U');
const KT = tkeyPos('T');
const EP = errorPoint(-0.02);
const KD = keyPos('D');
import {Pose} from './hand';

export type HandSpec = {model: 'right' | 'left'; p: number[]; f: number[]; b: number[]; pose: Pose; anchor?: 'pinch' | 'index'; arm?: number};
export type Beat = {
  set: 'eniac' | 'switches' | 'cards' | 'batch' | 'terminal' | 'editor' | 'ending';
  editor?: 'complete' | 'ghost' | 'claude';
  cam: number[]; look: number[]; fov: number;
  hands: HandSpec[];
  caption: {words: string[]; lit: number};
  label: string;
  fill?: number; // overhead fill on the wall (0 in the close hook shot)
  mode?: 'handin' | 'printout';
  clock?: [number, number];
};


const CABLES_CAM = [-0.4,2.1,3.2], CABLES_LOOK = [1.5,1,0.05], CABLES_FOV = 50, CABLES_FILL = 1.5;
// Index finger out to press or flip; the rest curled, thumb tucked.
const POINT: Pose = {index: {bend: [0, -0.12, -0.12, -0.06]}, middle: {bend: [0, -1.25, -1.2, -0.7]}, ring: {bend: [0, -1.35, -1.25, -0.7]}, pinky: {bend: [0, -1.4, -1.25, -0.7]}, thumb: {bend: [-0.35, -0.45, -0.35]}};
// Fingers loosely together, pushing something along a surface.
const PUSH: Pose = {index: {bend: [0, -0.25, -0.2, -0.1]}, middle: {bend: [0, -0.3, -0.25, -0.1]}, ring: {bend: [0, -0.4, -0.3, -0.15]}, pinky: {bend: [0, -0.5, -0.35, -0.15]}, thumb: {bend: [-0.2, -0.2, -0.1]}};
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
    hands: [{model: 'right', p: [J2.x, J2.y, J2.z], f: [-1, -0.2, -0.45], b: [0, 1, 0.3], pose: GRIP, arm: 2.5}], // sleeve runs out of frame in the wide shot
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
  // 5. "A program was a box of cards. You handed it in and often waited hours for the answer."
  batch: {
    set: 'batch', cam: [-0.4, 0.66, 1.35], look: [0.05, 0.2, 0.08], fov: 40, fill: 0,
    hands: [{model: 'right', p: [0.118, 0.014, 0.19], f: [-1, -0.2, -0.45], b: [0, 1, 0.1], pose: PUSH, anchor: 'index'}],
    caption: {words: ['A', 'program', 'was', 'a', 'box', 'of', 'cards.'], lit: 7}, label: 'Computer centre, 1960s',
  },
  // 6. "One typo, and you waited all over again."
  typo: {
    set: 'batch', mode: 'printout', clock: [7, 12], cam: [EP.x - 0.016, EP.y + 0.22, EP.z + 0.16], look: [EP.x - 0.016, EP.y, EP.z - 0.01], fov: 43, fill: 0,
    hands: [{model: 'right', p: [EP.x + 0.026, EP.y + 0.003, EP.z + 0.006], f: [-0.8, -0.3, -0.6], b: [0, 1, 0.1], pose: POINT, anchor: 'index'}],
    caption: {words: ['One', 'typo,', 'and', 'you', 'waited', 'all', 'over', 'again.'], lit: 2}, label: 'Line-printer listing',
  },
  // 7. "Then terminals let programmers type straight into the computer, first on paper, then on screens.
  //     Mistakes took minutes to fix, not hours."  (caption shows the sense unit on screen at this moment)
  terminal: {
    set: 'terminal', cam: [-0.03, 0.55, 0.95], look: [0, 0.28, 0], fov: 40, fill: 0,
    hands: [{model: 'right', p: [KT.x, KT.y - 0.002, KT.z], f: [-0.85, -0.45, -0.4], b: [0, 1, 0.1], pose: POINT, anchor: 'index'}],
    caption: {words: ['first', 'on', 'paper,', 'then', 'on', 'screens.'], lit: 6}, label: 'Video terminal, 1970s',
  },
  // 8. "Next, editors started helping. They coloured the code and finished your words."
  editors: {
    set: 'editor', editor: 'complete', cam: [-0.1, 0.5, 0.62], look: [-0.1, 0.235, 0.06], fov: 46, fill: 0,
    hands: [], // the finger was a sliver at the frame edge; the screen carries this beat
    caption: {words: ['They', 'coloured', 'the', 'code', 'and', 'finished', 'your', 'words.'], lit: 8}, label: 'Code editor, 1990s–2010s',
  },
  // 9. "In 2021, AI started finishing whole lines."
  ai_lines: {
    set: 'editor', editor: 'ghost', cam: [-0.1, 0.5, 0.62], look: [-0.1, 0.235, 0.06], fov: 46, fill: 0,
    hands: [],
    caption: {words: ['In', '2021,', 'AI', 'started', 'finishing', 'whole', 'lines.'], lit: 7}, label: 'AI code suggestions, 2021',
  },
  // 10. "Now many programmers describe what they want in plain English. AI writes the code, and they check it."
  describe: {
    set: 'editor', editor: 'claude', cam: [-0.02, 0.5, 0.64], look: [-0.02, 0.235, 0.06], fov: 46, fill: 0,
    hands: [{model: 'right', p: [KE.x, KE.y - 0.001, KE.z], f: [-0.95, -0.35, 0.05], b: [0, 1, 0.1], pose: POINT, anchor: 'index'}],
    caption: {words: ['AI', 'writes', 'the', 'code,', 'and', 'they', 'check', 'it.'], lit: 8}, label: 'Claude, 2026',
  },
  // 11. "Cables, switches, cards, screens, sentences. The tools kept changing. The job stayed the same: tell the
  //      machine exactly what you mean."
  ending: {
    set: 'ending', cam: [0.05, 0.3, 2.75], look: [0, 1.0, -1.5], fov: 45, fill: 0,
    hands: [],
    caption: {words: ['Tell', 'the', 'machine', 'exactly', 'what', 'you', 'mean.'], lit: 7}, label: '1946 to today',
  },
};

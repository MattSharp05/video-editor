// Shared data for the style frames: the beat "the saved folder bursts and the TikToks fly into
// the iPhone showing Trip's map" (script 6–10 s). 4 s at 30 fps.
import {Easing, interpolate, random} from 'remotion';

export const W = 1080, H = 1920, FPS = 30, DUR = 120;
export const ORANGE = '#FF6B22';
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
export const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);
export const prog = (fr: number, a: number, b: number, e = easeInOut) =>
  interpolate(fr, [a, b], [0, 1], {...clamp, easing: e});
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Sourced photos (Wikimedia Commons, licences in public/photos/CREDITS.md).
export const PHOTOS = ['photos/strip-2012.jpg', 'photos/strip-rw.jpg', 'photos/patisserie.jpg', 'photos/bartender.jpg'];

// Captions on the saved TikToks: invented, generic, no real accounts.
const CAPS = ['best tacos on the strip', 'rooftop bar you NEED', 'free things to do in vegas',
  'hidden speakeasy', 'brunch spot worth the line', 'sunset at red rock', 'fremont st at night',
  'cheap eats vegas', 'the fountains hit different', 'pastry place in bellagio', 'dive bar locals love',
  'vegas itinerary day 2'];

// Where each tile lands on the phone's screen, as a fraction of the screenshot (vegas-bucket.png,
// 1206x2622): the pins in the map area.
const LANDING: [number, number][] = [[0.635, 0.283], [0.363, 0.416], [0.53, 0.41], [0.61, 0.448],
  [0.48, 0.46], [0.48, 0.508], [0.54, 0.432], [0.44, 0.40], [0.58, 0.39], [0.40, 0.47],
  [0.52, 0.49], [0.66, 0.36]];

export type Tile = {i: number; photo: string; cap: string; likes: string;
  sx: number; sy: number; rot: number; land: [number, number]; delay: number};

export const TILES: Tile[] = CAPS.map((cap, i) => {
  const a = (i / CAPS.length) * Math.PI * 2 + random(`a${i}`) * 0.5;
  const r = 380 + random(`r${i}`) * 260;
  return {i, cap, photo: PHOTOS[i % PHOTOS.length],
    likes: `${(10 + random(`l${i}`) * 890).toFixed(0)}K`,
    sx: Math.cos(a) * r, sy: Math.sin(a) * r * 1.35, rot: (random(`t${i}`) - 0.5) * 30,
    land: LANDING[i], delay: i * 3};
});

// Per tile: 0..1 burst out of the folder (frames 0–18), then 0..1 flight into the phone.
export const tileT = (fr: number, t: Tile) => ({
  burst: prog(fr, 0, 18, ease),
  fly: prog(fr, 22 + t.delay, 70 + t.delay, easeInOut),
});

import {Easing, interpolate} from 'remotion';
import B0 from '../beats.json';
export const B = B0 as Record<string, number>;
export const FPS = 30;
export const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
export const inOut = Easing.bezier(0.45, 0, 0.55, 1);
export const back = Easing.bezier(0.3, 1.5, 0.5, 1);
// 0 -> 1 from a over d seconds
export const pr = (t: number, a: number, d = 0.4, e = ease) => interpolate(t, [a, a + d], [0, 1], {...CL, easing: e});
// window: fades in at a, out at b
export const win = (t: number, a: number, b: number, f = 0.25) => Math.min(pr(t, a, f, inOut), 1 - pr(t, b - f, f, inOut));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// damped swing (for hanging things): starts at amp degrees at time a
export const swing = (t: number, a: number, amp = 14, freq = 2.2, damp = 2.4) => (t < a ? 0 : amp * Math.exp(-(t - a) * damp) * Math.cos((t - a) * freq * Math.PI * 2));
// step on twos (toy-theatre puppetry): quantise time to 15 fps
export const two = (t: number) => Math.floor(t * 15) / 15;
// camera keys in seconds -> frames
export type SK = [number, {x?: number; y?: number; zoom?: number; rot?: number}];
export const keys = (k: SK[]) => k.map(([s, c]) => [Math.round(s * FPS), c] as [number, typeof c]);

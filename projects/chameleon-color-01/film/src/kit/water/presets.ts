// Water presets: the look of a water body as data. Pick the preset from the real place and era first (a flood is
// muddy, a dam-fed river clear and green, a glacial lake milky blue), then tune. Colours are linear-ish display
// colours; extinction is per metre (R, G, B): how fast each colour fades with depth or distance under water.
// Sources for the Colorado values: lab/water-research.md (USGS, NPS; hex values are estimates).
import * as THREE from 'three';

export type WaterPreset = {
  name: string;
  shallow: string;          // colour where the water is thin (over the bed / near the bank)
  deep: string;             // colour of deep water seen from above
  haze: string;             // colour of the water itself seen from inside (underwater fog)
  extinction: [number, number, number]; // per metre, RGB; larger = murkier; red fades first in clear water
  foam: string;             // foam colour (beige in muddy water, near white in clear)
  roughness: number;        // surface roughness (0.03 glassy - 0.3 choppy/matte)
  reflect: number;          // 0..1 how much sky/environment it mirrors (muddy water is matte)
  caustics: number;         // 0..1 strength of light patterns on the bed (none in muddy water)
  silt: number;             // 0..1 density of suspended particles
};

export const PRESETS: Record<string, WaterPreset> = {
  clearGreen: {name: 'Clear green river (dam-fed, e.g. Colorado today)', shallow: '#3F7E60', deep: '#173C33', haze: '#3F7A64',
    extinction: [0.42, 0.11, 0.16], foam: '#E6ECE8', roughness: 0.06, reflect: 0.6, caustics: 0.8, silt: 0.25},
  muddyFlood: {name: 'Muddy flood (sediment-laden; Colorado in flood)', shallow: '#A87050', deep: '#7A4E34', haze: '#7E6440',
    extinction: [0.55, 0.7, 0.9], foam: '#CDB89A', roughness: 0.22, reflect: 0.35, caustics: 0.0, silt: 1.0},
  glacialBlue: {name: 'Glacial lake (rock flour, milky blue)', shallow: '#7FC4C8', deep: '#2E7E92', haze: '#5FA9B6',
    extinction: [0.55, 0.22, 0.18], foam: '#F2F6F7', roughness: 0.05, reflect: 0.85, caustics: 0.3, silt: 0.5},
  tropical: {name: 'Tropical shallows (white sand, turquoise)', shallow: '#62D6C8', deep: '#0F6E8A', haze: '#2E9FB0',
    extinction: [0.45, 0.07, 0.05], foam: '#FFFFFF', roughness: 0.04, reflect: 0.9, caustics: 1.0, silt: 0.1},
  deepOcean: {name: 'Open ocean (deep blue)', shallow: '#2C7FA0', deep: '#0B2E4A', haze: '#1C5C7E',
    extinction: [0.45, 0.06, 0.03], foam: '#F4F8FA', roughness: 0.05, reflect: 1.0, caustics: 0.6, silt: 0.15},
  stormSea: {name: 'Storm sea (grey-green, choppy)', shallow: '#5E7F7A', deep: '#1E2E33', haze: '#3E5650',
    extinction: [0.6, 0.25, 0.25], foam: '#E8ECEA', roughness: 0.12, reflect: 0.7, caustics: 0.0, silt: 0.5},
};

export const presetUniforms = (p: WaterPreset) => ({
  uShallow: {value: new THREE.Color(p.shallow)}, uDeep: {value: new THREE.Color(p.deep)},
  uHaze: {value: new THREE.Color(p.haze)}, uExt: {value: new THREE.Vector3(...p.extinction)},
  uFoamCol: {value: new THREE.Color(p.foam)}, uReflect: {value: p.reflect}, uCaustics: {value: p.caustics},
});

// Every state of the film as a pure function of time t (seconds), cued from the spoken words (cue/cueEnd), so a new
// voiceover re-times the film. Two worlds: SPACE (Sun, orbit, tilted Earth) and the MEADOW (one beam = 100 marbles).
// Hard cuts between them (CUT_*); each world's states switch on the cut frame.
import {cue, VO_END} from './lib';
import * as THREE from 'three';

export const DUR_S = VO_END + 2.2;

// ---------- colours (fixed meanings: amber = sunlight/heat/answer, ice = cold, coral = the myth)
export const AMBER = '#FFB547', ICE = '#8FD3FF', CORAL = '#FF5A4E', GLASS = '#EAF6FF';

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const D2R = Math.PI / 180;

// ---------- beats (from the words)
export const B = {
  summerHook: cue("it's summer", 0), closest: cue('closest to the'), but: cue('But'), january: cue('January,'), winterUp: cue('winter up'),
  real: cue('The real'), tilt: cue("Earth's tilt."), june: cue('In June,'), leans: cue('leans'),
  follow: cue('Follow'), beam: cue('beam of'),
  summer: cue('In summer,'), straight: cue('straight down.'), patch: cue('small patch.'),
  winter: cue('In winter, the Sun'), low: cue('sits low.'), sameBeam: cue('The same beam'), slant: cue('slant'), twice: cue('twice'),
  every: cue('So every'), half: cue('half'),
  why: cue("That's why"), newYork: cue('New York'), sydney: cue('Sydney.'),
  notClose: cue("It's not"), close: cue('close the'), straightIts: cue('straight its'),
  end: VO_END,
};

// ---------- cuts between worlds
export const CUT_MEADOW = B.summer - 0.12;   // space -> meadow, the marbles land
export const CUT_BACK = B.why - 0.12;         // meadow -> space, the globe in June
export const CUTS = [CUT_MEADOW, CUT_BACK];
export const inMeadow = (t: number) => t >= CUT_MEADOW && t < CUT_BACK;

// =====================================================================================================================
// SPACE (diorama units: Sun radius 5, Earth radius 1.4, orbit a = 30; not to scale, never claimed)
export const SUN_R = 5, EARTH_R = 2.0, ORBIT_A = 30;
export const E_TRUE = 0.0167, E_MYTH = 0.6, TILT = 23.44;
export const PERI = 13 * D2R; // orbit angle of perihelion (Jan 3, ~13 days after the December solstice at angle 0)
// orbit angle (rad, counter-clockwise seen from the north): 0 = December solstice (Earth at +X), PI = June solstice
export const mythMorph = (t: number) => ramp(t, B.but - 0.05, B.but + 1.0); // 0 = myth oval, 1 = true near-circle
export const ecc = (t: number) => lerp(E_MYTH, E_TRUE, mythMorph(t));
export const orbitR = (th: number, e: number) => (ORBIT_A * (1 - e * e)) / (1 + e * Math.cos(th - PERI));
export const orbitPos = (th: number, e: number) => { const r = orbitR(th, e); return new THREE.Vector3(r * Math.cos(th), 0, -r * Math.sin(th)); };
// where Earth is: races in along the myth oval to perihelion (beat 1), sits at Jan 3, laps half the orbit to June
export const earthAngle = (t: number) => {
  const into = PERI + 1.25 * (1 - smooth((t + 0.5) / (B.summerHook + 1.1))); // swings in to perihelion by ~'summer' + 0.6 s
  const lap = ramp(t, B.june + 0.2, B.june + 2.3);
  return lerp(into, Math.PI, lap);
};
export const earthPos = (t: number) => inMeadow(t) ? orbitPos(Math.PI, E_TRUE) : orbitPos(earthAngle(t), ecc(t));
export const lapOn = (t: number) => ramp(t, B.june + 0.2, B.june + 0.5) * (1 - ramp(t, B.follow - 0.2, B.follow + 0.4));
// ghost Earths left along the lap
export const GHOSTS = [0.18, 0.36, 0.54, 0.72, 0.88];
export const ghost = (t: number, k: number) => {
  const at = B.june + 0.2 + 2.1 * GHOSTS[k];
  const th = lerp(PERI, Math.PI, GHOSTS[k]);
  return {pos: orbitPos(th, E_TRUE), o: ramp(t, at - 0.1, at + 0.1) * (1 - ramp(t, B.follow - 0.3, B.follow + 0.3))};
};
// Earth's north: the myth warmth (beat 1), January snow (beat 2), melts on the lap
export const warm = (t: number) => ramp(t, B.summerHook, B.summerHook + 0.6) * (1 - ramp(t, B.but, B.but + 0.6));
export const snow = (t: number) => ramp(t, B.winterUp - 0.5, B.winterUp + 0.6) * (1 - ramp(t, B.june + 1.2, B.june + 2.4));
// June shots: the day map's winter snow melts off the north (the map is a northern-winter composite)
export const melt = (t: number) => ramp(t, B.june + 1.0, B.june + 2.2);
export const mythTag = (t: number) => ramp(t, B.summerHook + 0.15, B.summerHook + 0.45) * (1 - ramp(t, B.but - 0.1, B.but + 0.2));
export const janTag = (t: number) => ramp(t, B.january - 0.1, B.january + 0.3) * (1 - ramp(t, B.real - 0.2, B.real + 0.2));
export const closerTag = (t: number) => ramp(t, B.but + 0.9, B.but + 1.3) * (1 - ramp(t, B.real - 0.2, B.real + 0.2));
export const lapJanTag = (t: number) => ramp(t, B.june + 0.3, B.june + 0.7) * (1 - ramp(t, B.follow - 0.3, B.follow + 0.1));
export const junTag = (t: number) => ramp(t, B.june + 2.2, B.june + 2.6) * (1 - ramp(t, B.follow + 0.2, B.follow + 0.6));
// the axis: shoots out of both poles on "tilt"; the Polaris line and the 23.4 deg arc
export const axisOn = (t: number) => ramp(t, B.real + 0.3, B.real + 0.9) * (t < CUT_MEADOW || t >= CUT_BACK ? 1 : 0);
export const polaris = (t: number) => ramp(t, B.real + 0.7, B.real + 1.5) * (1 - ramp(t, B.june + 0.3, B.june + 0.8));
export const tiltArc = (t: number) => ramp(t, B.tilt - 0.2, B.tilt + 0.2) * (1 - ramp(t, B.june + 0.3, B.june + 0.7));
export const orbitLine = (t: number) => Math.max(1 - ramp(t, B.but + 1.1, B.but + 1.7),            // the deflate, then away as the camera closes in
  ramp(t, B.june + 0.4, B.june + 0.9) * (1 - ramp(t, B.beam + 0.3, B.beam + 0.8)),                  // the lap and the beam from above
  ramp(t, B.notClose + 1.7, B.notClose + 2.5));  // the closing pull-back, once the camera is high above the orbit plane (v1: a thick band swept over Earth)
// the beam from the Sun to New York (beat 5)
export const beamOn = (t: number) => ramp(t, B.follow - 0.1, B.follow + 0.5) * (t < CUT_MEADOW ? 1 : 0);
export const beamReach = (t: number) => ramp(t, B.follow - 0.1, B.beam + 0.6); // 0 at the Sun, 1 at Earth

// Earth's spin: the subsolar longitude (where the Sun is overhead). Real direction: it moves west as Earth turns.
// June: New York (74 W) at noon for the beam; then turns 135 deg west so Sydney (151 E) reaches noon (beat 9).
export const NY = {lat: 40.71, lon: -74.0}, SYD = {lat: -33.87, lon: 151.21};
export const subsolarLon = (t: number) => {
  if (t < B.june) return -20 - 9 * t;                      // a slow turn in the opening (Atlantic/Americas toward us)
  if (t < CUT_BACK) return lerp(-20 - 9 * B.june, -74, ramp(t, B.june, B.june + 2.4));
  return lerp(-74, -209, ramp(t, B.sydney - 1.0, B.sydney + 0.2)); // -209 = 151 E
};
// world tilt: north pole leans toward -X... toward the Sun at June (Earth at -X): pole = (sin TILT, cos TILT, 0)
export const POLE = new THREE.Vector3(Math.sin(TILT * D2R), Math.cos(TILT * D2R), 0);
export const tiltQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -TILT * D2R);
// Earth orientation quaternion at t: tilt * spin(about local Y), spin chosen so the Sun is over subsolarLon
const lonOf = (v: THREE.Vector3) => { const th = Math.atan2(v.z, -v.x); let lon = th / D2R - 180; while (lon < -180) lon += 360; while (lon >= 180) lon -= 360; return lon; };
export const earthQ = (t: number) => {
  const p = earthPos(t), toSun = p.clone().multiplyScalar(-1).normalize();
  const d0 = toSun.clone().applyQuaternion(tiltQ.clone().invert()); // in tilted frame before spin
  const lon0 = lonOf(d0);
  const s = (subsolarLon(t) - lon0) * D2R; // checked numerically (tools/spin.mts): this lands the subsolar point on subsolarLon
  const spin = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -s);
  return tiltQ.clone().multiply(spin);
};
// Sun direction in Earth-local coordinates (for the globe shader's day side)
export const sunLocal = (t: number) => earthPos(t).clone().multiplyScalar(-1).normalize().applyQuaternion(earthQ(t).clone().invert());

// beat 9: the two cities' little beams and tags
export const nyBeam = (t: number) => ramp(t, CUT_BACK, CUT_BACK + 0.3) * (1 - ramp(t, B.sydney - 1.0, B.sydney - 0.5));
export const sydBeam = (t: number) => ramp(t, B.sydney - 0.1, B.sydney + 0.3) * (1 - ramp(t, B.notClose + 0.6, B.notClose + 1.0));
export const nyTag = (t: number) => ramp(t, B.newYork - 0.1, B.newYork + 0.3) * (1 - ramp(t, B.sydney - 0.6, B.sydney - 0.2));
export const sydTag = (t: number) => ramp(t, B.sydney - 0.1, B.sydney + 0.3) * (1 - ramp(t, B.notClose + 0.5, B.notClose + 0.9));
export const distWord = (t: number) => ramp(t, B.notClose + 0.6, B.notClose + 0.9);
export const distStrike = (t: number) => ramp(t, B.close + 0.1, B.close + 0.5);
export const angleWord = (t: number) => ramp(t, B.straightIts - 0.1, B.straightIts + 0.3);
// beat 10: the beam to New York again (the answer)
export const endBeam = (_t: number) => 0; // was a beam into New York at the end; by then Earth has turned and New York is at night

// =====================================================================================================================
// MEADOW (1 unit = 1 m). Sun due south of the tiles (from +Z, frame-left; the camera looks along -X).
export const ELEV_SUMMER = 72.7, ELEV_WINTER = 25.9; // New York noon, June and December solstices
export const winterK = (t: number) => ramp(t, B.winter - 0.05, B.winter + 2.0);
export const sunElev = (t: number) => lerp(ELEV_SUMMER, ELEV_WINTER, winterK(t));
export const snowCover = (t: number) => ramp(t, B.winter + 0.2, B.winter + 2.2);
export const leafKeep = (t: number) => 1 - ramp(t, B.winter, B.winter + 1.6);
// tiles: 4 m across (x) by 4.2 m deep (z) = the summer footprint. Tile A spans z -4.2..0 (summer patch), B 0..4.2
export const TILE_X = 4, TILE_Z = 4.2;
export const BEAM = 4; // beam cross-section, metres
export const footprint = (elev: number) => BEAM / Math.sin(elev * D2R); // along z
// the two streams of marbles: 10 x 10, a wave every WAVE s; each marble flies FLY s before landing
export const WAVE = 0.85, FLY = 1.0, FLY_DIST = 15;
export const SUMMER_STREAM: [number, number] = [CUT_MEADOW - FLY + 0.25, B.winter - 0.1];
export const WINTER_STREAM: [number, number] = [B.sameBeam - FLY + 0.25, CUT_BACK + 1];
export const PATCH_CENTRE = (winter: boolean) => (winter ? 0 : -TILE_Z / 2);
// tile glow: summer tile A full; winter tiles A and B at 0.46 each (counted)
export const summerGlow = (t: number) => ramp(t, CUT_MEADOW + 0.3, CUT_MEADOW + 1.0) * (1 - ramp(t, B.winter - 0.1, B.winter + 0.5));
export const winterGlow = (t: number) => ramp(t, B.sameBeam + 0.35, B.sameBeam + 1.0);
export const summerOutline = (t: number) => ramp(t, B.winter, B.winter + 0.6);
export const count100 = (t: number) => ramp(t, B.patch - 0.6, B.patch - 0.2) * (1 - ramp(t, B.winter - 0.1, B.winter + 0.3));
export const count46 = (t: number) => ramp(t, B.half - 0.35, B.half + 0.05);
export const summerRef = (t: number) => ramp(t, B.half - 0.1, B.half + 0.3);

// ---------- camera keys: [t, pos, look, mm, up]; a key with cut: true starts a new shot at its t
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; up?: V3; cut?: boolean};
const J = orbitPos(Math.PI, E_TRUE).toArray() as V3; // June position
const P = orbitPos(PERI, E_TRUE).toArray() as V3;    // Jan 3 position
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const NYJ = (() => { const phi = ((90 - NY.lat) * Math.PI) / 180, th = ((NY.lon + 180) * Math.PI) / 180;
  const v = new THREE.Vector3(-Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)).multiplyScalar(EARTH_R);
  return v.applyQuaternion(earthQ(B.beam + 0.5)).add(orbitPos(Math.PI, E_TRUE)); })();
const NYV = NYJ.toArray() as V3, SUNWARD = NYJ.clone().normalize().multiplyScalar(-1).toArray() as V3;
const SIDE: V3 = [0.22, 0, 0.97]; // horizontal, perpendicular to the Sun line at Jan 3 (the Sun appears frame-left)
const sc = (v: V3, k: number): V3 => [v[0] * k, v[1] * k, v[2] * k];
export const KEYS: Key[] = [
  // 1 space: the myth oval, Earth races in toward a big Sun (Sun upper-left, Earth ~90 px)
  {t: 0, pos: [30, 20, 20], look: [5, 0, -5], mm: 35},
  {t: B.closest + 0.4, pos: [27, 15, 17], look: [7, 0, -3], mm: 35},
  // 2 the oval deflates; push to Earth at Jan 3 from the side, Sun at frame-left, the snowy north tipped away
  {t: B.but + 1.0, pos: add(P, add(sc(SIDE, 22), [0, 12, 0])), look: add(P, [-4, 0, 0]), mm: 35},
  {t: B.real - 0.2, pos: add(P, add(sc(SIDE, 10), [0, 3.5, 0])), look: add(P, [-0.6, 0.4, 0]), mm: 35},
  // 3 the axis and Polaris: the tilt plane (XY) seen face-on from +z, a little wider to show the line up to Polaris
  {t: B.tilt + 0.2, pos: add(P, [1.5, 3.5, 14]), look: add(P, [-0.4, 2.6, 0]), mm: 35},
  {t: B.june + 0.1, pos: add(P, [2.5, 4.0, 15]), look: add(P, [-0.4, 2.8, 0]), mm: 35},
  // 4 the lap seen from beyond the June side: Earth comes toward us round the Sun, ghosts left behind, all axes parallel
  {t: B.june + 1.0, pos: add(J, [10, 62, 26]), look: [-4, 0, -9], mm: 35, up: [1, 0, 0]},
  {t: B.june + 2.3, pos: add(J, [15, 62, 18]), look: add(J, [15.5, 0, 0]), mm: 35, up: [1, 0, 0]},
  // 5 the beam runs from the Sun to Earth across the frame; then dive along it toward New York (cut before landing)
  {t: B.beam + 0.4, pos: add(J, [13, 50, 16]), look: add(J, [14, 0, 0]), mm: 35, up: [1, 0, 0]},
  {t: CUT_MEADOW, pos: add(NYV, add(sc(SUNWARD, 5.5), [0, 1.8, 2.2])), look: NYV, mm: 35, up: [1, 0, 0]},
  // 6-8 MEADOW: side view along -X, tile A centred; rises and pulls back for the long winter patch
  {t: CUT_MEADOW, cut: true, pos: [21, 6.5, 6], look: [0, 3.2, -1.6], mm: 35},
  {t: B.winter, pos: [20, 8.5, 1.5], look: [0, 1.6, -1.2], mm: 35},
  {t: B.twice + 0.4, pos: [24, 13, -6], look: [0, 0.4, 0], mm: 35},
  {t: CUT_BACK, pos: [19, 11, -5], look: [0, 0.4, 0.2], mm: 35},
  // 9 space: Earth in June seen from the Sun's side; New York, then Earth turns and Sydney comes round
  {t: CUT_BACK, cut: true, pos: add(J, [1.6, 2.4, 11]), look: add(J, [1.0, 0.5, 0]), mm: 35},
  {t: B.notClose + 0.2, pos: add(J, [1.8, -1.2, 11.2]), look: add(J, [1.0, -0.4, 0]), mm: 35},
  {t: B.notClose + 1.6, pos: add(J, [8, 14, 14]), look: add(J, [4, 0, 0]), mm: 35, up: [0.5, 1, 0]},
  // 10 pull back: Earth (with its beam into New York) at the bottom, the Sun higher up, part of the near-circle orbit
  {t: DUR_S, pos: add(J, [17, 64, 14]), look: add(J, [17.4, 0, 0]), mm: 35, up: [1, 0, 0]},
];
// Catmull-Rom through keys (velocity continuous), within one shot only
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
export const camAt = (t: number) => {
  let s0 = 0;
  KEYS.forEach((k, i) => { if (k.cut && k.t <= t) s0 = i; });
  let s1 = KEYS.findIndex((k, i) => i > s0 && k.cut); if (s1 < 0) s1 = KEYS.length;
  const S = KEYS.slice(s0, s1);
  let i = S.findIndex((k) => k.t > t) - 1;
  if (i < 0) i = t < S[0].t ? 0 : S.length - 2;
  const a = S[Math.max(i - 1, 0)], b = S[i], c = S[i + 1], d = S[Math.min(i + 2, S.length - 1)];
  const u = smooth((t - b.t) / (c.t - b.t)) * 0.5 + clamp01((t - b.t) / (c.t - b.t)) * 0.5;
  const v = (f: (k: Key) => V3) => [0, 1, 2].map((j) => cr(f(a)[j], f(b)[j], f(c)[j], f(d)[j], u)) as V3;
  const up = (k: Key) => k.up ?? [0, 1, 0];
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, u), up: v(up)};
};

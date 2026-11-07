// Miso, the film's cat: one SVG rig used in every shot (references/characters.md).
// Conventions (read before animating):
// - Origin is the WAIST (the bend point). Units are rig units; `s` scales them to px. Head points to +x (screen right)
//   before `pitch` (whole-body in-plane rotation, radians, SVG sense: + = clockwise).
// - Roll is rotation about the spine, per half: rollF (front half + head), rollB (back half + tail).
//   0 = belly down / paws down (upright), PI = upside down (paws up). The cat turns by increasing roll toward 0 from PI
//   (or any path; the drawing is just a projection, so any value works).
// - bend (radians, >= 0): the halves fold at the waist, both ends lift (a V with the waist low).
// - tuckF / tuckB: 0 = legs stuck out (splayed), 1 = legs folded in tight.
// - tail: 1 = full tail, 0 = no tail (Manx). tailWag: phase for the tail's wave.
// - face: eyes (0 closed .. 1 open, >1 wide), look [x,y] in -1..1, mouth: 'smile' | 'o' | 'flat' | 'grin' | 'wobble' | 'smug',
//   brows: -1 worried .. 0 neutral .. 1 determined/angry, blush 0..1, label: printed word on the belly band (optional).
// - Legs and head are projected from a body frame, so a half at roll 90deg shows its legs pointing at the camera.
import React from 'react';

export type Face = {eyes?: number; look?: [number, number]; mouth?: 'smile' | 'o' | 'flat' | 'grin' | 'wobble' | 'smug'; brows?: number; blush?: number; sweat?: number};
export type CatPose = {
  x: number; y: number; s: number; pitch?: number; rollF: number; rollB: number; bend?: number;
  tuckF?: number; tuckB?: number; reachF?: number; reachB?: number; squash?: number; tail?: number; tailWag?: number; face?: Face;
  headTilt?: number; t?: number; earGlow?: number; eyeGlow?: number;
  frontTint?: string; backTint?: string; // optional rim colours that tell the two halves apart (Language table)
  rotor?: number; rotorA?: number; // tail as a helicopter rotor (myth): blur strength 0..1, blade angle (rad)
  raise?: number; padText?: string; // near front paw raised like a stop sign, pad shows padText
};

export const ORANGE = '#F29A3E', ORANGE_D = '#D9772A', STRIPE = '#C4621D', CREAM = '#FFF1DC', PINK = '#F5A3A8', INK = '#3A2418';
const L = 92, R = 40;

const legEnd = (side: number, front: boolean, tuck: number, reach: number, roll: number) => {
  // body-frame components: a along the spine (+ toward head), d along "down", l lateral (+ toward camera at roll 0)
  const out = front ? {a: 0.22, d: 0.92, l: 0.42 * side, len: 74} : {a: -0.25, d: 0.9, l: 0.46 * side, len: 78};
  const tk = front ? {a: -0.72, d: 0.42, l: 0.12 * side, len: 36} : {a: 0.65, d: 0.45, l: 0.12 * side, len: 38};
  const rch = {a: front ? 0.05 : -0.05, d: 1, l: 0.18 * side, len: 86}; // reaching straight down for the landing
  const m = (k: 'a' | 'd' | 'l' | 'len') => (out[k] * (1 - tuck) + tk[k] * tuck) * (1 - reach) + rch[k] * reach;
  const len = m('len'), a = m('a'), d = m('d'), l = m('l'), n = Math.hypot(a, d, l);
  const c = Math.cos(roll), s = Math.sin(roll);
  return {x: (a / n) * len, y: ((d * c - l * s) / n) * len, z: (d * s + l * c) / n};
};

const Leg: React.FC<{ax: number; ay: number; e: {x: number; y: number; z: number}; far: boolean; front: boolean; squash: number}> = ({ax, ay, e, far, front, squash}) => {
  const ex = ax + e.x, ey = ay + e.y * (1 - 0.35 * squash);
  // a knee: bow the leg sideways a little (more when squashed)
  const mx = (ax + ex) / 2 + (front ? -1 : 1) * (6 + 18 * squash), my = (ay + ey) / 2;
  const col = far ? ORANGE_D : ORANGE;
  return (
    <g>
      <path d={`M${ax},${ay} Q${mx},${my} ${ex},${ey}`} stroke={INK} strokeWidth={27} strokeLinecap="round" fill="none" />
      <path d={`M${ax},${ay} Q${mx},${my} ${ex},${ey}`} stroke={col} strokeWidth={21} strokeLinecap="round" fill="none" />
      <ellipse cx={ex} cy={ey} rx={13 + 3 * squash} ry={11 - 2 * squash} fill={far ? '#EBD9BF' : CREAM} stroke={INK} strokeWidth={3} />
    </g>
  );
};

// one half of the torso, drawn in its own frame (spine along x; dir = +1 front, -1 back), in three layers so the two
// halves join without a seam: 'ink' (outline) for both, then 'fill' for both, then 'pat' (belly, stripes) for both.
const halfGeom = (dir: number) => ({cx: dir * L * 0.46, rx: L * 0.64, ry: dir > 0 ? R : R * 0.95});
const Half: React.FC<{dir: number; roll: number; tint?: string; id: string; layer: 'ink' | 'fill' | 'pat'}> = ({dir, roll, tint, id, layer}) => {
  const c = Math.cos(roll), s = Math.sin(roll);
  const {cx, rx, ry} = halfGeom(dir);
  if (layer === 'ink') return <ellipse cx={cx} cy={0} rx={rx + 4} ry={ry + 4} fill={INK} />;
  if (layer === 'fill') return <ellipse cx={cx} cy={0} rx={rx} ry={ry} fill={ORANGE} />;
  const bellyY = ry * c * (0.72 - 0.55 * Math.max(0, s)), bellyRy = ry * (0.42 + 0.5 * Math.max(0, s));
  const stripeY = -ry * c * 0.62, stripeVis = Math.max(0, 1 - Math.max(0, s) * 0.9);
  return (
    <g>
      <clipPath id={id}><ellipse cx={cx} cy={0} rx={rx} ry={ry} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <ellipse cx={cx + dir * 10} cy={bellyY} rx={rx * 0.8} ry={bellyRy} fill={CREAM} />
        {[0, 1, 2].map((k) => {
          const sx = cx + dir * (-22 + k * 24);
          return <path key={k} d={`M${sx - 9},${stripeY - 22} Q${sx + 4},${stripeY} ${sx - 9},${stripeY + 22}`} stroke={STRIPE} strokeWidth={9} strokeLinecap="round" fill="none" opacity={stripeVis} />;
        })}
        {tint && <ellipse cx={cx} cy={0} rx={rx} ry={ry} fill="none" stroke={tint} strokeWidth={12} opacity={0.95} />}
      </g>
    </g>
  );
};

const Head: React.FC<{roll: number; tilt: number; face: Face; t: number; earGlow: number; eyeGlow: number}> = ({roll, tilt, face, t, earGlow, eyeGlow}) => {
  const {eyes = 1, look = [0, 0], mouth = 'smile', brows = 0, blush = 0, sweat = 0} = face;
  // automatic blink (seeded by time; deterministic)
  const ph = (t * 0.37 + 0.13) % 1, blink = ph > 0.965 ? 0.1 : 1;
  const open = Math.max(0.05, Math.min(1.4, eyes * blink));
  const eye = (ex: number) => (
    <g>
      <ellipse cx={ex} cy={-6} rx={13} ry={17 * Math.min(1.25, open)} fill="#fff" stroke={INK} strokeWidth={3.5} />
      {open > 0.25 && <circle cx={ex + look[0] * 5} cy={-6 + look[1] * 6} r={8.5 * Math.min(1, open)} fill={INK} />}
      {open > 0.25 && <circle cx={ex + look[0] * 5 + 3} cy={-10 + look[1] * 6} r={3} fill="#fff" />}
      {eyeGlow > 0 && <ellipse cx={ex} cy={-6} rx={17} ry={21} fill="none" stroke="#3FB6FF" strokeWidth={5} opacity={eyeGlow} />}
      <path d={`M${ex - 14},${-30 - brows * -4} L${ex + 14},${-30 + brows * (ex < 0 ? 5 : -5)}`} stroke={INK} strokeWidth={4.5} strokeLinecap="round" transform={`rotate(${ex < 0 ? -brows * 8 : brows * 8} ${ex} -30)`} />
    </g>
  );
  const mouths: Record<string, string> = {
    smile: 'M-12,22 Q-6,30 0,22 Q6,30 12,22', o: 'M0,20 m-7,0 a7,9 0 1,0 14,0 a7,9 0 1,0 -14,0', flat: 'M-11,25 L11,25',
    grin: 'M-16,20 Q0,40 16,20 Z', wobble: 'M-14,26 Q-9,20 -4,26 Q1,32 6,26 Q11,20 15,26', smug: 'M-12,24 Q2,30 14,18',
  };
  return (
    <g transform={`rotate(${(roll * 180) / Math.PI + tilt})`}>
      {/* ears */}
      {[-1, 1].map((k) => (
        <g key={k}>
          <path d={`M${k * 18},-30 L${k * 38},-68 L${k * 44},-22 Z`} fill={ORANGE} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M${k * 23},-32 L${k * 37},-56 L${k * 39},-28 Z`} fill={earGlow > 0 ? `rgba(63,182,255,${0.4 + 0.6 * earGlow})` : PINK} />
        </g>
      ))}
      <ellipse cx={0} cy={0} rx={50} ry={44} fill={ORANGE} stroke={INK} strokeWidth={4} />
      <ellipse cx={0} cy={18} rx={30} ry={20} fill={CREAM} />
      <path d="M-8,-40 L-4,-26 M0,-43 L0,-27 M8,-40 L4,-26" stroke={STRIPE} strokeWidth={5} strokeLinecap="round" />
      {eye(-19)}{eye(19)}
      <path d="M-6,8 L6,8 L0,15 Z" fill={PINK} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <path d={mouths[mouth]} fill={mouth === 'grin' || mouth === 'o' ? '#7A2E2E' : 'none'} stroke={INK} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      {[-1, 1].map((k) => [0, 1].map((j) => <path key={`${k}${j}`} d={`M${k * 26},${14 + j * 8} L${k * 60},${10 + j * 14}`} stroke={INK} strokeWidth={2} opacity={0.7} />))}
      {blush > 0 && [-1, 1].map((k) => <ellipse key={k} cx={k * 33} cy={14} rx={9} ry={5} fill="#FF7B8A" opacity={0.6 * blush} />)}
      {sweat > 0 && <path d="M44,-30 q8,14 0,18 q-8,-4 0,-18 Z" fill="#8FD3FF" stroke={INK} strokeWidth={2} opacity={sweat} />}
    </g>
  );
};

export const headLocal = (rollF: number) => ({x: L * 1.22, y: -14 * Math.cos(rollF)});
export const HALF_X = L * 0.46;
export const Cat: React.FC<CatPose & {label?: string; labelO?: number}> = (p) => {
  const {x, y, s, pitch = 0, rollF, rollB, bend = 0, tuckF = 0, tuckB = 0, reachF = 0, reachB = 0, squash = 0, tail = 1, tailWag = 0,
    face = {}, headTilt = 0, t = 0, earGlow = 0, eyeGlow = 0, rotor = 0, rotorA = 0, raise = 0, padText = ''} = p;
  const id = `c${Math.round(x)}_${Math.round(y)}`;
  const legsOf = (front: boolean) => {
    const roll = front ? rollF : rollB, tuck = front ? tuckF : tuckB, reach = front ? reachF : reachB;
    const ax = front ? L * 0.62 : -L * 0.66, c = Math.cos(roll);
    return [-1, 1].map((side) => {
      const e = legEnd(side, front, tuck, reach, roll);
      return {e, ax: ax + side * 7, ay: R * 0.55 * c, far: e.z < 0, front};
    });
  };
  const fl = legsOf(true).map((l) => (l.far || raise <= 0 ? l : {...l, e: {x: l.e.x * (1 - raise) + 200 * raise, y: l.e.y * (1 - raise) - 70 * raise, z: 1}})), bl = legsOf(false);
  const bendDeg = (bend * 90) / Math.PI;
  const wag = Math.sin(tailWag) * 18;
  const tc = Math.cos(rollB); // tail curls toward the back (opposite the belly)
  const tailPath = `M${-L * 1.08},${-6 * tc} C${-L * 1.6},${-10 * tc - wag} ${-L * 1.75},${-60 * tc + wag} ${-L * 1.5 - wag * 0.6},${-95 * tc}`;
  const sq = 1 - 0.18 * squash;
  return (
    <g transform={`translate(${x},${y}) rotate(${(pitch * 180) / Math.PI}) scale(${s * (1 + 0.1 * squash)},${s * sq})`}>
      {/* far legs and tail behind everything */}
      <g transform={`rotate(${bendDeg})`}>
        {bl.filter((l) => l.far).map((l, i) => <Leg key={i} ax={l.ax} ay={l.ay} e={l.e} far front={false} squash={squash} />)}
        {rotor > 0.02 && <g transform={`translate(${-L * 1.08},${-6 * tc})`}>
          <ellipse cx={-20} cy={0} rx={150} ry={40} fill="#FFFFFF" opacity={0.45 * rotor} stroke={ORANGE} strokeWidth={6} strokeOpacity={0.5 * rotor} />
          {[0, 0.5, 1].map((k) => <line key={k} x1={0} y1={0} x2={Math.cos(rotorA - k * 0.5) * 140} y2={Math.sin(rotorA - k * 0.5) * 38} stroke={ORANGE} strokeWidth={17} strokeLinecap="round" opacity={k === 0 ? 1 : 0.3 * rotor} />)}
        </g>}
        {tail > 0.02 && rotor <= 0.02 && <g transform={`translate(${-L * 1.08},0) scale(${tail}) translate(${L * 1.08},0)`}>
          <path d={tailPath} stroke={INK} strokeWidth={24} strokeLinecap="round" fill="none" />
          <path d={tailPath} stroke={ORANGE} strokeWidth={17} strokeLinecap="round" fill="none" />
        </g>}
      </g>
      <g transform={`rotate(${-bendDeg})`}>{fl.filter((l) => l.far).map((l, i) => <Leg key={i} ax={l.ax} ay={l.ay} e={l.e} far front squash={squash} />)}</g>
      {(['ink', 'fill', 'pat'] as const).map((layer) => (
        <g key={layer}>
          <g transform={`rotate(${bendDeg})`}><Half dir={-1} roll={rollB} tint={p.backTint} id={`${id}b`} layer={layer} /></g>
          <g transform={`rotate(${-bendDeg})`}><Half dir={1} roll={rollF} tint={p.frontTint} id={`${id}f`} layer={layer} /></g>
        </g>
      ))}
      <g transform={`rotate(${bendDeg})`}>{bl.filter((l) => !l.far).map((l, i) => <Leg key={i} ax={l.ax} ay={l.ay} e={l.e} far={false} front={false} squash={squash} />)}</g>
      <g transform={`rotate(${-bendDeg})`}>
        {fl.filter((l) => !l.far).map((l, i) => <Leg key={i} ax={l.ax} ay={l.ay} e={l.e} far={false} front squash={squash} />)}
        <g transform={`translate(${L * 1.22},${-14 * Math.cos(rollF)}) scale(1.22)`}>
          <Head roll={rollF} tilt={headTilt} face={face} t={t} earGlow={earGlow} eyeGlow={eyeGlow} />
        </g>
        {raise > 0.3 && fl.filter((l) => !l.far).map((l, i) => (
          <g key={i} transform={`translate(${l.ax + l.e.x},${l.ay + l.e.y}) scale(${raise * 1.3})`}>
            <ellipse rx={36} ry={40} fill={CREAM} stroke={INK} strokeWidth={4} />
            <ellipse cx={0} cy={8} rx={22} ry={16} fill={PINK} />
            {[-22, -8, 8, 22].map((bx, j) => <ellipse key={j} cx={bx} cy={-22 + Math.abs(bx) * 0.3} rx={7} ry={8} fill={PINK} />)}
            <text x={0} y={14} textAnchor="middle" fontFamily="'Permanent Marker', cursive" fontSize={17} fill={INK}>{padText}</text>
          </g>
        ))}
      </g>
    </g>
  );
};

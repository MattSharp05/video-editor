// Shared stage helpers: parallax camera, crowd, set dressing (part 2, kit style).
import React from 'react';
import {random, staticFile} from 'remotion';
import {C, Cut, Person, rect, osc, ell, SHADOW, TYPE, SERIF} from './look';

export type Cam = {x: number; y: number; z: number; r?: number};
// keyframed camera: [[t, x, y, z]], cubic in-out between keys, plus a minimum drift
export const camAt = (t: number, keys: [number, number, number, number][]): Cam => {
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const [t0, x0, y0, z0] = keys[i], [t1, x1, y1, z1] = keys[Math.min(i + 1, keys.length - 1)];
  const u = t1 === t0 ? 1 : Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
  const k = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  return {x: x0 + (x1 - x0) * k + osc(t, 0.07) * 8, y: y0 + (y1 - y0) * k + osc(t, 0.05, 0.3) * 6, z: z0 + (z1 - z0) * k};
};
// a plane at depth d (0.2 backdrop … 1 actors … 1.35 fore)
export const Plane: React.FC<{cam: Cam; d: number; children?: React.ReactNode}> = ({cam, d, children}) => {
  const z = 1 + (cam.z - 1) * d;
  const cx = 540 + (cam.x - 540) * d, cy = 960 + (cam.y - 960) * d;
  return <g transform={`translate(540,960) scale(${z}) translate(${-cx},${-cy})`}>{children}</g>;
};
// screen position of world point (x,y) on plane d
export const toScreen = (cam: Cam, d: number, x: number, y: number) => {
  const z = 1 + (cam.z - 1) * d;
  const cx = 540 + (cam.x - 540) * d, cy = 960 + (cam.y - 960) * d;
  return [540 + (x - cx) * z, 960 + (y - cy) * z];
};

const HATS = ['bowler', 'top', 'cap', 'feather', 'none', 'bowler'] as const;
const COATS = [C.nightBlue, C.sepia, C.duskBlue, '#5E4B3C', '#6B6255', C.oldGold];
// A crowd row: n people from x0 to x1 at baseline y, each with its own seeded look and bob
export const Crowd: React.FC<{seed: string; n: number; x0: number; x1: number; y: number; s?: number; t: number; facing?: 'back' | 'side'; flip?: boolean; dark?: number; hatsOff?: number; walk?: number; skip?: number[]}> = ({seed, n, x0, x1, y, s = 0.7, t, flip, dark = 0, hatsOff = 0, walk, skip = []}) => (
  <g>
    {[...Array(n)].map((_, i) => {
      if (skip.includes(i)) return null;
      const r = (k: string) => random(`${seed}${i}${k}`);
      const x = x0 + (x1 - x0) * (n === 1 ? 0.5 : i / (n - 1)) + (r('x') - 0.5) * 30;
      const hat = HATS[Math.floor(r('h') * HATS.length)];
      const off = hatsOff > 0 && r('o') < 0.6 ? Math.max(0, Math.min(1, hatsOff * 2 - r('d'))) : 0;
      return (
        <Person key={i} x={x} y={y + (r('y') - 0.5) * 16} s={s * (0.9 + r('s') * 0.2)} flip={flip ?? r('f') < 0.5}
          coat={COATS[Math.floor(r('c') * COATS.length)]} skin={C.skin[Math.floor(r('k') * 4)]} hair={r('hr') < 0.3 ? C.sepia : C.ink}
          hat={hat} gown={hat === 'feather'} tache={r('t') < 0.4} beard={r('b') < 0.12} tall={0.92 + r('ta') * 0.16} wide={0.9 + r('w') * 0.3}
          bob={Math.max(0, osc(t, 0.6 + r('bf') * 0.5, r('bp'))) * 6} look={osc(t, 0.2, r('l')) > 0.6 ? 1 : osc(t, 0.2, r('l')) < -0.6 ? -1 : 0}
          walk={walk !== undefined ? walk + r('wp') : undefined} hatOff={off} aR={off > 0 ? [60 * off, 40 * off] : undefined}
          mouth={r('m') < 0.3 ? 'o' : 'flat'} />
      );
    })}
    {dark > 0 && <rect x={x0 - 200} y={y - 600} width={x1 - x0 + 400} height={700} fill={C.ink} opacity={dark} />}
  </g>
);

// A big cartoon paper painting (never a real named work): frame + simple scene with dot-eye face
export const PaperPainting: React.FC<{x: number; y: number; w: number; h: number; seed: string; t: number; look?: number}> = ({x, y, w, h, seed, t, look = 0}) => {
  const r = (k: string) => random(seed + k);
  const bg = [C.duskBlue, C.sepia, '#6E7F5E', C.stone][Math.floor(r('b') * 4)];
  const face = r('f') < 0.7;
  return (
    <g transform={`translate(${x},${y})`}>
      <Cut d={rect(-w / 2 - 18, -h / 2 - 18, w + 36, h + 36, 3)} fill={C.oldGold} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={bg} stroke={C.ink} strokeWidth={3} />
      <path d={`M${-w / 2},${h * 0.2} Q${-w * 0.1},${h * 0.05} ${w / 2},${h * 0.25} L${w / 2},${h / 2} L${-w / 2},${h / 2} Z`} fill={C.paperShade} opacity={0.6} />
      {face && <g transform={`translate(${(r('fx') - 0.5) * w * 0.4},${-h * 0.05})`}>
        <ellipse cx={0} cy={0} rx={w * 0.14} ry={w * 0.17} fill={C.skin[Math.floor(r('s') * 3)]} stroke={C.ink} strokeWidth={3} />
        <path d={`M${-w * 0.2},${w * 0.5} Q0,${w * 0.1} ${w * 0.2},${w * 0.5} Z`} fill={[C.clueRed, C.nightBlue, C.oldGold][Math.floor(r('c') * 3)]} stroke={C.ink} strokeWidth={3} transform={`translate(0,${w * 0.1})`} />
        <circle cx={-w * 0.05 + look * w * 0.03} cy={-w * 0.02} r={w * 0.017 + 2} fill={C.ink} />
        <circle cx={w * 0.05 + look * w * 0.03} cy={-w * 0.02} r={w * 0.017 + 2} fill={C.ink} />
      </g>}
    </g>
  );
};

// the Salon Carré wall: paper wall, skylight, big paintings, parquet. Her spot at (540, 900).
export const SalonWall: React.FC<{cam: Cam; t: number; look?: number; children?: React.ReactNode}> = ({cam, t, look = 0, children}) => (
  <>
    <Plane cam={cam} d={0.45}>
      <rect x={-1600} y={-1200} width={4300} height={2900} fill={C.paper} />
      <rect x={-1600} y={-1200} width={4300} height={300} fill={C.paperShade} />
      {[...Array(9)].map((_, i) => <rect key={i} x={-1500 + i * 480} y={-1150} width={400} height={200} fill={C.duskBlue} opacity={0.35} stroke={C.ink} strokeWidth={3} />)}
      <rect x={-1600} y={1420} width={4300} height={1500} fill={C.paperShade} />
      {[...Array(30)].map((_, i) => <line key={i} x1={-1600 + i * 150} y1={1420} x2={-1600 + i * 150 - 200} y2={2900} stroke={C.sepia} strokeWidth={2} opacity={0.4} />)}
      <line x1={-1600} y1={1420} x2={2700} y2={1420} stroke={C.ink} strokeWidth={4} />
    </Plane>
    <Plane cam={cam} d={0.7}>
      <PaperPainting x={60} y={760} w={420} h={560} seed="pA" t={t} look={look} />
      <PaperPainting x={1020} y={760} w={420} h={560} seed="pB" t={t} look={-look} />
      <PaperPainting x={-560} y={600} w={560} h={420} seed="pC" t={t} look={look} />
      <PaperPainting x={1640} y={640} w={520} h={680} seed="pD" t={t} look={-look} />
      <PaperPainting x={300} y={150} w={360} h={260} seed="pE" t={t} look={look} />
      <PaperPainting x={800} y={140} w={320} h={240} seed="pF" t={t} look={-look} />
      <PaperPainting x={-560} y={1160} w={400} h={300} seed="pG" t={t} look={look} />
      <PaperPainting x={1640} y={1230} w={400} h={260} seed="pH" t={t} look={-look} />
    </Plane>
    {children}
  </>
);

// paper rooftops of Paris (far plane), chimneys with smoke
export const Rooftops: React.FC<{t: number; y: number; seed?: string; lit?: number; litOn?: boolean}> = ({t, y, seed = 'rt', lit = -1, litOn}) => (
  <g>
    {[...Array(14)].map((_, i) => {
      const r = (k: string) => random(seed + i + k);
      const x = -800 + i * 200, h = 260 + r('h') * 260, w = 190;
      return (
        <g key={i}>
          <Cut d={`M${x},${y} L${x},${y - h} L${x + w / 2},${y - h - 70} L${x + w},${y - h} L${x + w},${y} Z`} fill={i % 2 ? C.duskBlue : C.nightBlue} sw={3} rim={false} />
          <rect x={x + w * 0.65} y={y - h - 90} width={26} height={60} fill={C.stone} stroke={C.ink} strokeWidth={2.5} />
          {[0, 1, 2].map((j) => <circle key={j} cx={x + w * 0.65 + 13 + osc(t, 0.3, j * 0.3 + i) * 10 + ((t * 20 + j * 30 + i * 13) % 90) * 0.4} cy={y - h - 100 - ((t * 25 + j * 30 + i * 11) % 90)} r={10 + ((t * 25 + j * 30) % 90) * 0.12} fill={C.paperShade} opacity={0.5 * (1 - ((t * 25 + j * 30 + i * 11) % 90) / 90)} />)}
          {[0, 1].map((row) => [0, 1].map((col) => {
            const isLit = (i === lit && row === 1 && col === 0) || r(`w${row}${col}`) < 0.25;
            return <rect key={`${row}${col}`} x={x + 30 + col * 80} y={y - h + 60 + row * 110} width={50} height={70}
              fill={i === lit && row === 1 && col === 0 && litOn ? C.amber : isLit ? '#E8C979' : C.ink} opacity={isLit ? 0.9 : 0.6} stroke={C.ink} strokeWidth={2} />;
          }))}
        </g>
      );
    })}
  </g>
);

export const Lamp: React.FC<{x: number; y: number; h?: number}> = ({x, y, h = 700}) => (
  <g transform={`translate(${x},${y})`}>
    <Cut d={rect(-10, -h, 20, h, 6)} fill={C.ink} sw={2} />
    <Cut d={`M-40,${-h - 10} L40,${-h - 10} L28,${-h - 90} L-28,${-h - 90} Z`} fill="#E8C979" sw={3} />
    <ellipse cx={0} cy={-h - 50} rx={120} ry={120} fill="url(#lampGlow)" opacity={0.6} />
  </g>
);
export const Ground: React.FC<{y: number; color?: string}> = ({y, color = C.paperShade}) => (
  <g><rect x={-2000} y={y} width={5000} height={2000} fill={color} /><line x1={-2000} y1={y} x2={3000} y2={y} stroke={C.ink} strokeWidth={4} /></g>
);
export const Headline: React.FC<{x: number; y: number; w: number; h: number; text: string; rot?: number; photo?: boolean; amberName?: boolean}> = ({x, y, w, h, text, rot = 0, photo = true}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <Cut d={rect(-w / 2, -h / 2, w, h, 2)} fill={C.card} sw={2.5} />
    <text x={0} y={-h / 2 + h * 0.13} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={w * 0.075} fill={C.ink}>{text.split('|')[0]}</text>
    {text.includes('|') && <text x={0} y={-h / 2 + h * 0.13 + w * 0.085} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={w * 0.075} fill={C.ink}>{text.split('|')[1]}</text>}
    <line x1={-w * 0.42} y1={-h / 2 + h * 0.3} x2={w * 0.42} y2={-h / 2 + h * 0.3} stroke={C.ink} strokeWidth={2} />
    {photo && <g><rect x={-w * 0.2} y={-h * 0.15} width={w * 0.4} height={h * 0.5} fill={C.paperShade} />
      <image href={staticFile('monalisa.jpg')} x={-w * 0.2} y={-h * 0.15} width={w * 0.4} height={h * 0.5} preserveAspectRatio="xMidYMid slice" style={{filter: 'grayscale(1) contrast(1.3)'}} />
      <rect x={-w * 0.2} y={-h * 0.15} width={w * 0.4} height={h * 0.5} fill="url(#halftone)" opacity={0.25} />
    </g>}
    {[...Array(6)].map((_, i) => <line key={i} x1={i % 2 ? w * 0.24 : -w * 0.42} y1={-h * 0.1 + i * h * 0.08} x2={i % 2 ? w * 0.42 : -w * 0.24} y2={-h * 0.1 + i * h * 0.08} stroke={C.ink} strokeWidth={2} opacity={0.5} />)}
  </g>
);
export {ell, SHADOW, TYPE};

// Part 3, lines 1-8: recap -> Florence ink map + title -> Geri's desk -> hotel -> room 20 -> trunk -> Uffizi check -> arrest.
import React from 'react';
import {random} from 'remotion';
import {Camera, Layer} from '../kit/camera';
import {T, TYPE, SERIF} from './tok';
const FONT_TYPE = TYPE;
import {B, pr, win, lerp, swing, two, keys, inOut} from './util';
import {Cut, rect, wrect, LiraStack, NoteBundle, HotelFront, Door20, Handcuffs, Cracks, Stamp, Confetti} from './props';
import * as K from './K';
import {Hooks as KHooks, QuestionMark, Letter as KLetter, Trunk as KTrunk, Magnifier as KMag} from '../series/props';
import {Stamp as KStamp} from '../series/cards';
import {GeriDesk, DESK_TOP} from '../series/sets';
const F = (s: number) => Math.round(s * 30);

type S = {t: number; fr: number};

// ---------- shared backdrops ----------
export const Wall: React.FC<{w?: number; h?: number; x?: number; y?: number; fill?: string; seed?: string; stripes?: boolean}> = ({w = 1400, h = 2400, x = -160, y = -240, fill = T.paper, seed = 'w', stripes = true}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={fill} />
    {stripes && Array.from({length: Math.ceil(w / 90)}, (_, i) => <rect key={i} x={x + i * 90} y={y} width={45} height={h} fill={T.ink} opacity={0.025 + random(`${seed}${i}`) * 0.01} />)}
  </g>
);
export const Floor: React.FC<{y: number; fill?: string; x?: number; w?: number}> = ({y, fill = T.paperShade, x = -300, w = 1700}) => (
  <g><rect x={x} y={y} width={w} height={900} fill={fill} />{Array.from({length: 14}, (_, i) => <path key={i} d={`M${x + i * 130},${y} l-60,900`} stroke={T.ink} strokeWidth={2} opacity={0.12} />)}
    <path d={`M${x},${y}h${w}`} stroke={T.ink} strokeWidth={3.5} /></g>
);
// dust motes drifting in a lamp beam (many separate movers)
export const Dust: React.FC<{t: number; n?: number; x: number; y: number; w: number; h: number; seed?: string; col?: string}> = ({t, n = 18, x, y, w, h, seed = 'd', col = T.amberGlow}) => (
  <g>{Array.from({length: n}, (_, i) => {
    const sp = 8 + random(`${seed}s${i}`) * 18;
    const px = x + ((random(`${seed}x${i}`) * w + Math.sin(t * 0.7 + i) * 20 + t * sp) % w);
    const py = y + ((random(`${seed}y${i}`) * h + t * sp * 0.6) % h);
    return <circle key={i} cx={px} cy={py} r={2 + random(`${seed}r${i}`) * 3} fill={col} opacity={0.35 + 0.3 * Math.sin(t * 2 + i)} />;
  })}</g>
);

// ---------- 1. Recap: three flats, then the ink drop spreads into Florence ----------
const Hooks4: React.FC<{fr: number; web?: number; x?: number; y?: number}> = ({fr, web = 1, x = 0, y = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <KHooks fr={fr} x={0} y={0} state="web" web={web} />
  </g>
);
const RoofsQ: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect x={-300} y={-500} width={1100} height={1000} fill={T.duskBlue} />
    {Array.from({length: 7}, (_, i) => <Cut key={i} d={wrect(-300 + i * 150, 120 - (i % 3) * 60, 140, 400, `rf${i}`)} fill={T.nightBlue} sw={3} />)}
    {Array.from({length: 7}, (_, i) => <g key={i} transform={`translate(${-250 + i * 150} ${90 - (i % 3) * 60 - ((t * 30 + i * 13) % 40)})`} opacity={0.4 - ((t * 30 + i * 13) % 40) / 120}><circle r={14} fill={T.stone} /></g>)}
    <Cut d={rect(-30, 200, 60, 70, 6)} fill={T.amberGlow} shadow={false} />
    {Array.from({length: 10}, (_, i) => <circle key={`s${i}`} cx={-260 + i * 95} cy={-420 + (i % 4) * 60} r={4 + 3 * Math.abs(Math.sin(t * 3 + i * 1.7))} fill={T.card} opacity={0.5 + 0.5 * Math.sin(t * 4 + i)} />)}
    {Array.from({length: 8}, (_, i) => <rect key={`w${i}`} x={-270 + i * 150 + 40} y={200 - (i % 3) * 60 + 60} width={36} height={44} fill={T.duskBlue} opacity={Math.sin(t * 2.5 + i * 2.1) > 0.2 ? 0.9 : 0.25} />)}
    {Array.from({length: 4}, (_, i) => <path key={`b${i}`} d={`M${-300 + ((t * 120 + i * 160) % 800)},${-300 + i * 40} q10,${-8 + (Math.floor(t * 8 + i) % 2) * 16} 20,0 q10,${-8 + (Math.floor(t * 8 + i) % 2) * 16} 20,0`} stroke={T.ink} strokeWidth={3} fill="none" />)}
    <QuestionMark fr={Math.round(t * 30)} x={0} y={-160 + Math.sin(t * 2) * 10} size={2.2} rot={Math.sin(t * 1.6) * 6} />
  </g>
);
const Letter: React.FC<{t: number; sign: number}> = ({t, sign}) => (
  <g>
    <Cut d={wrect(-300, -380, 600, 760, 'lt', 3)} fill={T.card} sw={3} />
    {Array.from({length: 9}, (_, i) => <path key={i} d={`M-230,${-300 + i * 52} q${120},${-6 + (i % 3) * 4} ${380 - (i === 8 ? 180 : 0)},0`} stroke={T.ink} strokeWidth={4} opacity={0.55} fill="none" />)}
    <text x={60} y={300} fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight={700} fontSize={88} fill={T.ink} textAnchor="middle"
      style={{clipPath: `inset(0 ${100 - sign * 100}% 0 0)`}}>Leonardo</text>
  </g>
);
// Florence in ink: river, streets and the Duomo, revealed by the spreading drop (radius r)
const InkFlorence: React.FC<{t: number; r: number; cx?: number; cy?: number}> = ({t, r, cx = 540, cy = 960}) => (
  <g>
    <defs><clipPath id="inkc"><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
    <g clipPath="url(#inkc)">
      <rect x={-200} y={-200} width={1480} height={2400} fill={T.paper} />
      <path d="M-200,1260 C200,1180 420,1340 640,1250 S1000,1150 1300,1230" stroke={T.duskBlue} strokeWidth={70} fill="none" opacity={0.9} />
      {Array.from({length: 22}, (_, i) => <path key={i} d={`M${-100 + i * 70},${300 + (i % 4) * 30} L${-40 + i * 66},${1180}`} stroke={T.ink} strokeWidth={3} opacity={0.5} />)}
      {Array.from({length: 14}, (_, i) => <path key={i} d={`M-150,${360 + i * 62} L1250,${330 + i * 66}`} stroke={T.ink} strokeWidth={3} opacity={0.45} />)}
      {[0, 1, 2].map((i) => <path key={i} d={`M${200 + i * 260},1240 l40,-20 h120 l40,20`} stroke={T.ink} strokeWidth={6} fill="none" />)}
      {/* the Duomo */}
      <g transform="translate(560 800)">
        <Cut d="M-170,40 h340 v120 h-340 z" fill={T.paperShade} sw={3.5} />
        <Cut d="M-120,40 Q-120,-170 0,-200 Q120,-170 120,40 Z" fill="#C46A44" sw={3.5} />
        <path d="M-60,30 Q-55,-120 0,-190 M60,30 Q55,-120 0,-190" stroke={T.ink} strokeWidth={3} fill="none" />
        <Cut d={rect(-22, -250, 44, 60, 6)} fill={T.paperShade} />
      </g>
      <g transform="translate(560 1080)"><K.Label text="Florence" size={56} /></g>
    </g>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.ink} strokeWidth={10} opacity={0.6} />
  </g>
);

export const Recap: React.FC<S> = ({t, fr}) => {
  // three flats slide right -> left through the stage; then the letter stays and the ink drop falls
  const flatX = (a: number, b: number) => lerp(1300, -300, inOut(Math.min(1, Math.max(0, (t - a) / (b - a)))));
  const aX = t < 0.05 ? 540 : lerp(540, -500, pr(t, 0.85, 0.55, inOut));
  const bX = lerp(1500, 540, pr(t, 0.85, 0.55, inOut)) + lerp(0, -1040, pr(t, 1.85, 0.55, inOut));
  const cX = lerp(1500, 540, pr(t, 1.85, 0.55, inOut));
  const sign = pr(t, B.leonardo - 0.1, 0.7, inOut);
  const drop = pr(t, B.leonardo + 0.75, 0.32, (k) => k * k);
  const r = t < B.leonardo + 1.25 ? 0 : lerp(40, 1900, pr(t, B.leonardo + 1.25, 0.9));
  void flatX;
  return (
    <Camera fr={fr} keys={keys([[0, {zoom: 1.0}], [3.0, {zoom: 1.08, y: 940}], [B.leonardo + 1.0, {zoom: 1.5, y: 1000}], [B.title, {zoom: 1.0, y: 960}]])} background={T.paperShade}>
      <Layer depth={0.3}><Wall fill={T.paperShade} seed="rcp" /></Layer>
      {/* the toy-theatre stage: proscenium arch */}
      <Layer depth={0.6}>
        <Cut d={wrect(40, 360, 1000, 1180, 'st', 4)} fill={T.paper} sw={3.5} />
        <Dust t={t} x={60} y={380} w={960} h={1140} seed="rd" col={T.sepia} n={30} />
      </Layer>
      <g transform={`translate(${aX} 900)`}><g transform="scale(2.2)"><Hooks4 fr={fr} /></g>
        <g transform={`translate(${60 + Math.sin(t * 3) * 6} ${80 + Math.sin(t * 2) * 30})`}><K.Spider fr={fr} size={2.5} /></g></g>
      <g transform={`translate(${bX} 960)`}><RoofsQ t={t} /></g>
      <g transform={`translate(${cX} 960)`}>
        <g transform="translate(150 -520)"><K.Label text="Florence, 1913" size={36} rot={3} /></g>
        <KLetter fr={fr} x={0} y={-150} size={1.4} write={pr(t, 1.9, 1.3, (k) => k)} sign={sign} dropAt={F(B.leonardo + 0.75)} />
        {t < B.leonardo + 0.8 && <g transform={`translate(${t < 3.2 ? -180 + ((t - 1.9) / 1.3 * 8 % 1) * 340 : 40 + sign * 200} ${t < 3.2 ? -400 + Math.floor((t - 1.9) / 1.3 * 8) * 48 : 210}) rotate(${-30 + Math.sin(t * 20) * 8})`}>
          <path d="M0,0 L-14,-150 Q-60,-200 -30,-260 Q10,-200 0,0 Z" fill={T.card} stroke={T.ink} strokeWidth={3} /><path d="M0,0 L-24,-200" stroke={T.ink} strokeWidth={2} /></g>}
      </g>
      {r > 0 && <InkFlorence t={t} r={r} cx={cX + 157} cy={1294} />}
      <Layer depth={1.3}>
        <Cut d={`M-200,-200 h1480 v${560 + Math.sin(t * 2.2) * 30} q-740,${-160 + Math.sin(t * 1.7) * 40} -1480,0 z`} fill={T.clueRed === '' ? T.nightBlue : '#6E2A26'} sw={3.5} />
        <Cut d={`M-200,2120 h1480 v${-560 + Math.sin(t * 1.9 + 1) * 25} q-740,${140 + Math.sin(t * 2.4) * 40} -1480,0 z`} fill={T.sepia} sw={3.5} />
      </Layer>
    </Camera>
  );
};

// ---------- 2. Title: the red silk ribbon lowers the plaque over the ink map ----------
const Ribbon: React.FC<{t: number; len: number; x: number}> = ({t, len, x}) => {
  const pts = Array.from({length: 24}, (_, i) => {
    const y = -300 + (i / 23) * len;
    return [x + Math.sin(t * 3 + i * 0.5) * 18 * (i / 23), y];
  });
  const d = 'M' + pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' L');
  return <g><path d={d} stroke={T.card} strokeWidth={46} fill="none" strokeLinecap="round" /><path d={d} stroke={T.silk} strokeWidth={36} fill="none" strokeLinecap="round" />
    <path d={d} stroke="#C8504A" strokeWidth={8} fill="none" opacity={0.6} transform="translate(-6 0)" /></g>;
};
export const Title: React.FC<S> = ({t, fr}) => {
  const lower = pr(t, B.title - 0.2, 0.9, inOut), lift = pr(t, B.l2 - 0.75, 0.6, inOut);
  const len = lerp(-60, 300, lower) - lerp(0, 1000, lift);
  return (
    <Camera fr={fr} keys={keys([[B.title, {zoom: 1.0, y: 960}], [B.l2 - 0.6, {zoom: 1.12, y: 1020, x: 540}], [B.l2, {zoom: 4, y: 1200, x: 560}]])} background={T.paper}>
      <InkFlorence t={t} r={1500} />
      <Layer depth={1.1}><Dust t={t} x={0} y={300} w={1080} h={1400} seed="td" col={T.ink} n={12} /></Layer>
      <g><Ribbon t={t} len={len + 300} x={540} /></g>
    </Camera>
  );
};

// ---------- 3. Geri's desk: the pile of money grows past the ceiling ----------
export const Desk: React.FC<S> = ({t, fr}) => {
  const grow = pr(t, B.money - 0.1, 1.5, inOut);
  const n = 1 + 3 * pr(t, B.l2 + 2.6, 1.6, inOut) + grow * 23;
  const DY = DESK_TOP[2];
  const topY = DY - 58 * n;
  const topple = pr(t, B.l3 - 0.45, 0.5, (k) => k * k);
  const brows = pr(t, B.money, 0.3);
  return (
    <Camera fr={fr} keys={keys([[B.l2, {zoom: 2.8, y: 1150, x: 800}], [B.l2 + 0.7, {zoom: 1.05, y: 1000, x: 540}], [B.l2 + 2.5, {zoom: 1.4, y: 1050, x: 560}], [B.money, {zoom: 1.12, y: 960}], [B.money + 1.5, {zoom: 1.0, y: Math.min(960, topY + 600)}], [B.l3, {zoom: 1.1, y: topY + 700, x: 760, rot: 3}]])} background={T.paperShade}>
      <Layer depth={0.2}><GeriDesk fr={fr} only={['backdrop']} />
        {/* sky and the Duomo above the roof (seen when the pile goes through the ceiling) */}
        <rect x={-600} y={-2400} width={2300} height={2700} fill={T.duskBlue} opacity={0.55} />
      </Layer>
      <Layer depth={0.45}><GeriDesk fr={fr} only={['far']} />
        {Array.from({length: 5}, (_, i) => { const x = 420 + ((t * (70 + i * 13) + i * 150) % 640); return <g key={i} transform={`translate(${x} ${470 + i * 40 + Math.sin(t * 3 + i) * 15}) scale(0.5)`}><K.Pigeon fr={fr + i} flap /></g>; })}
      </Layer>
      <Layer depth={0.6}><g transform="translate(320 -900) scale(1.6)"><Cut d="M-170,40 h340 v300 h-340 z" fill={T.paperShade} sw={3.5} /><Cut d="M-120,40 Q-120,-170 0,-200 Q120,-170 120,40 Z" fill="#C46A44" sw={3.5} /><Cut d={rect(-22, -250, 44, 60, 6)} fill={T.paperShade} /></g></Layer>
      <Layer depth={0.7}><GeriDesk fr={fr} only={['mid']} />
        {/* the ceiling flap that folds open as the pile pushes through */}
        <g transform={`rotate(${-pr(t, B.money + 0.8, 0.4) * 70} 900 300)`}><Cut d={rect(-300, 240, 1700, 64)} fill={T.paperShade} sw={3.5} /></g>
      </Layer>
      {/* Geri behind the desk, reading the letter */}
      <g transform="translate(470 1540)"><K.P who="geri" fr={fr} pose={brows > 0.5 ? 'surprised' : t > B.alfredo ? 'holdUp' : 'write'} expr={brows > 0.5 ? 'jawDrop' : t > B.alfredo + 0.8 ? 'worried' : 'smile'} look={[Math.sin(t * 3) * 1.5, 0]} /></g>
      {/* pigeons strutting on the window sill */}
      {Array.from({length: 3}, (_, i) => <g key={i} transform={`translate(${560 + i * 140 + Math.sin(t * (1.3 + i * 0.4) + i) * 50} 925) scale(${Math.sin(t * 1.3 + i) > 0 ? 0.7 : -0.7} 0.7)`}><K.Pigeon fr={fr + i * 3} flap={Math.sin(t * 2 + i * 2) > 0.85} /></g>)}
      <GeriDesk fr={fr} only={['actors']} />
      <Dust t={t} x={480} y={880} w={520} h={400} seed="lamp" n={28} />
      {/* his pen ticks a sum on the letter: zeros keep coming */}
      {Array.from({length: 6}, (_, i) => { const k = pr(t, B.l2 + 2.2 + i * 0.25, 0.3); return k > 0 ? <text key={i} x={500 + i * 26} y={DY - 140} fontFamily={FONT_TYPE} fontSize={34} fill={T.ink} opacity={k}>{i === 0 ? '?' : '0'}</text> : null; })}
      <g transform={`translate(560 ${DY - 70 + Math.sin(two(t) * 3) * 4}) rotate(-8)`}><Cut d={wrect(-60, -80, 120, 160, 'gl')} fill={T.card} /></g>
      {/* the pile of money: wrapped in the red silk ribbon at first */}
      <g transform={`translate(800 ${DY}) rotate(${topple * 70} 0 0)`}>
        <LiraStack n={n} t={t} sway={0.6 + topple * 4} />
        {t > B.money - 0.2 && topple < 0.2 && <g transform={`translate(-210 ${-40 - 58 * Math.min(n, 9)}) rotate(-4)`} opacity={pr(t, B.money - 0.2, 0.3)}><K.Label text="He wants:" size={40} /></g>}
        {t > B.money + 1.1 && <g transform={`translate(${lerp(400, 0, pr(t, B.money + 1.1, 0.5))} ${-58 * n - 56 - 30 - lerp(-200, 0, pr(t, B.money + 1.1, 0.5))})`}><K.Pigeon fr={fr} flap={t < B.money + 1.6} /></g>}
      </g>
      {t < B.l2 + 2.6 && <g transform={`translate(800 ${DY - 56})`}><path d="M-110,30 h220" stroke={T.silk} strokeWidth={14} /><path d="M0,30 q-40,-50 -10,-60 q20,10 10,60 q30,-40 50,-20 q-10,20 -50,20" fill={T.silk} stroke={T.ink} strokeWidth={2} /></g>}
    </Camera>
  );
};

// ---------- 4. The hotel: the pretend deal and the museum expert ----------
export const Hotel: React.FC<S> = ({t, fr}) => {
  const a = B.l3;
  const gx = lerp(-150, 330, pr(t, a + 0.1, 1.3, inOut)) + lerp(0, 210, pr(t, B.hotel + 0.2, 0.9, inOut));
  const px = lerp(-300, 150, pr(t, B.expert - 0.3, 1.3, inOut)) + lerp(0, 330, pr(t, B.hotel + 0.4, 0.9, inOut));
  const gw = t < a + 1.4 || (t > B.hotel + 0.2 && t < B.hotel + 1.1) ? two(t) * 9 : 0;
  const pw = (t > B.expert - 0.3 && t < B.expert + 1.0) || (t > B.hotel + 0.4 && t < B.hotel + 1.3) ? two(t) * 8 : 0;
  const shake = t > B.pretends && t < B.pretends + 1.4 ? Math.sin(two(t) * 18) * 18 : 0;
  const wink = win(t, B.pretends + 1.2, B.pretends + 1.9, 0.08);
  const falling = Array.from({length: 9}, (_, i) => {
    const k = pr(t, a - 0.05 + i * 0.05, 0.75, (q) => q * q);
    return <g key={i} transform={`translate(${200 + i * 80 + Math.sin(i) * 60} ${lerp(-300, 1500 - (i % 3) * 30, k)}) rotate(${(1 - k) * 260 * (i % 2 ? 1 : -1)})`} opacity={k < 1 ? 1 : 1 - pr(t, a + 1.2, 0.6)}><NoteBundle seed={`f${i}`} /></g>;
  });
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 1.15, y: 900, x: 560}], [a + 1.5, {zoom: 1.0, y: 980}], [B.expert, {zoom: 1.02, y: 990, x: 500}], [B.hotel, {zoom: 1.0, y: 940, x: 560}], [B.l4 - 0.4, {zoom: 1.6, y: 1180, x: 720}], [B.l4, {zoom: 4.5, y: 1240, x: 730}]])} background={T.paper}>
      <Layer depth={0.3}>
        <rect x={-400} y={-200} width={1900} height={1500} fill={T.duskBlue} opacity={0.35} />
        {Array.from({length: 8}, (_, i) => <Cut key={i} d={wrect(-300 + i * 220, 300 - (i % 3) * 80, 200, 900, `bg${i}`)} fill={T.paperShade} sw={3} />)}
      </Layer>
      <Layer depth={0.6}>
        <g transform="translate(180 220)"><HotelFront t={t} /></g>
      </Layer>
      {/* steps up to the hotel door */}
      {[0, 1, 2].map((i) => <Cut key={i} d={rect(560 - i * 30, 1400 + i * 50, 380 + i * 60, 50)} fill={T.stone} sw={3} />)}
      <Cut d={rect(620, 1000, 260, 400, 6)} fill={T.nightBlue} sw={3.5} />
      <Floor y={1550} fill={T.stone} />
      {falling}
      {/* Geri: handshake in the air, then a wink at us */}
      <g transform={`translate(${gx} 1560)`}><K.P who="geri" fr={fr} pose={gw ? 'walk' : t > B.pretends && t < B.pretends + 1.5 ? 'handshake' : 'stand'} expr={wink > 0.5 ? 'wink' : 'smile'} look={[wink > 0 ? -1.5 : 1, 0]} /></g>
      {/* Geri's pretend deal: a tag on the air-handshake */}
      {t > B.pretends && t < B.expert + 0.2 && <g transform={`translate(${gx + 140} ${1080 + Math.sin(t * 4) * 6})`} opacity={win(t, B.pretends, B.expert + 0.2, 0.2)}><K.Label text="Pretend buyer" size={40} rot={4} /></g>}
      {/* Poggi with the giant magnifying glass */}
      <g transform={`translate(${px} 1580)`}>
        <K.P who="poggi" fr={fr} pose={pw ? 'walk' : 'stand'} expr="calm" hold={<KMag x={50} y={-70} r={62} rot={30} giant id="pogmag" />} />
      </g>
    </Camera>
  );
};

// ---------- 5 + 8. Room 20 (door, then the trunk; later the arrest) ----------
const Trunk: React.FC<{lid: number; leak: number}> = ({lid, leak}) => (
  <g>
    <Cut d={rect(-200, -150, 400, 150, 8)} fill="#EDE8DD" sw={3.5} />
    {[-120, 120].map((x) => <Cut key={x} d={rect(x - 14, -150, 28, 150)} fill={T.sepia} shadow={false} />)}
    {leak > 0 && <rect x={-190} y={-156} width={380} height={10} fill={T.amberGlow} opacity={leak} />}
    <g transform={`rotate(${-lid * 105} -200 -150)`}><Cut d={rect(-200, -200, 400, 50, 8)} fill="#EDE8DD" sw={3.5} />
      {[-120, 120].map((x) => <Cut key={x} d={rect(x - 14, -200, 28, 50)} fill={T.sepia} shadow={false} />)}</g>
  </g>
);
const RoomBack: React.FC<{t: number}> = ({t}) => (
  <g>
    <Wall fill="#E8D8B8" seed="r20" />
    <g transform="translate(820 600)"><Cut d={rect(-130, -180, 260, 360, 6)} fill={T.duskBlue} sw={3.5} /><path d="M0,-180v360M-130,0h260" stroke={T.ink} strokeWidth={4} />
      <path d={`M-150,-200 q${40 + Math.sin(t * 1.4) * 14},200 0,420`} fill={T.clueRed} opacity={0.0} />
      <Cut d={`M-160,-200 q${50 + Math.sin(t * 1.4) * 16},200 ${10},420 h40 v-420 z`} fill="#9C8A6A" /></g>
    {/* bed */}
    <Cut d={rect(-60, 1180, 420, 170, 10)} fill={T.card} sw={3} /><Cut d={rect(-60, 1120, 40, 300)} fill={T.sepia} />
    <Floor y={1420} fill="#B9A27C" />
  </g>
);
export const Room: React.FC<S> = ({t, fr}) => {
  const a = B.l4;
  const swingA = swing(t, B.room, 26, 1.4, 1.5);
  const open = pr(t, B.room + 0.8, 0.6, inOut);
  const lid = pr(t, B.opens + 0.1, 0.5, inOut);
  const inside = t > B.thin - 0.25;
  const clothes = ['shirt', 'sock', 'shirt2', 'sock2'].map((c, i) => {
    const k = pr(t, B.trunk + i * 0.12, 0.9, (q) => q);
    const x = lerp(0, [-260, 200, -120, 300][i], k), y = -170 - Math.sin(k * Math.PI) * [420, 360, 500, 300][i] + k * 260;
    return k > 0 ? <g key={c} transform={`translate(${x} ${y}) rotate(${k * 300 * (i % 2 ? 1 : -1)})`}><Cut d={c.startsWith('shirt') ? 'M-50,-40 h100 l30,30 -20,14 -10,-10 v60 h-100 v-60 l-10,10 -20,-14z' : 'M-14,-40 h28 v50 h30 v24 h-58z'} fill={[T.white, T.clueRed === '' ? '' : '#7C8DA8', '#D8CBB0', T.white][i]} /></g> : null;
  });
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 2.4, y: 820, x: 540}], [a + 0.8, {zoom: 1.4, y: 900}], [B.room + 0.9, {zoom: 1.3, y: 960}], [B.thin, {zoom: 1.0, y: 980}], [B.opens + 0.4, {zoom: 1.1, y: 1080, x: 600}], [B.l5 - 0.35, {zoom: 1.6, y: 1260, x: 640}], [B.l5, {zoom: 5, y: 1290, x: 640}]])} background={T.paper}>
      {!inside ? (
        <g>
          <Layer depth={0.5}><Wall fill="#D9C5A0" seed="cor" /><Floor y={1450} fill="#9E8463" /></Layer>
          <Layer depth={0.8}>{[0, 1].map((i) => <g key={i} transform={`translate(${i ? 980 : 100} 700)`}><Cut d="M-30,0 l10,-60 h40 l10,60 z" fill={T.oldGold} /><circle cy={-30} r={70} fill={T.amberGlow} opacity={0.2 + 0.05 * Math.sin(t * 9 + i)} /></g>)}</Layer>
          <g transform="translate(390 560)">
            <rect x={0} y={0} width={300} height={600} fill="#E8D8B8" />
            <g transform="translate(150 600)"><K.P who="vincenzo" fr={fr} pose="poker" expr="poker" facing={-1} /></g>
            <Door20 swing={swingA} open={open} />
          </g>
        </g>
      ) : (
        <g>
          <Layer depth={0.5}><RoomBack t={t} /></Layer>
          <Dust t={t} x={600} y={400} w={400} h={900} seed="rm" />
          <KTrunk fr={fr} x={680} y={1450} size={1.25} lid={lid} contents="clothes" leak={lid * 0.5} />
          {clothes.map((c, i) => <g key={i} transform="translate(680 1440)">{c}</g>)}
          <g transform="translate(380 1470)"><K.P who="vincenzo" fr={fr} pose={t > B.opens ? 'trunkLid' : 'poker'} expr="poker" look={[1, 0]} /></g>
          {/* Geri and Poggi in the doorway, leaning in */}
          <Layer depth={1.25}>
            <g transform={`translate(${-20 + Math.sin(two(t) * 2) * 6} 1760)`}><K.P who="poggi" fr={fr} pose="peer" expr="surprised" /></g>
            <g transform={`translate(${1080 - Math.sin(two(t) * 2) * 6} 1780)`}><K.P who="geri" fr={fr} pose="peer" expr="surprised" facing={-1} /></g>
          </Layer>
        </g>
      )}
    </Camera>
  );
};

// ---------- 6. Down into the trunk: false bottom, red silk, the Mona Lisa ----------
export const TrunkTop: React.FC<S> = ({t, fr}) => {
  const a = B.l5;
  const board = pr(t, B.lifts + 0.2, 0.9, inOut);
  const silkIn = pr(t, B.underneath, 0.4);
  const pull = pr(t, B.mona - 0.25, 0.65, (k) => k * k);
  const lean = pr(t, B.mona + 0.2, 0.6);
  const flood = pr(t, B.mona + 0.1, 0.5);
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 2.6, y: 960}], [a + 0.8, {zoom: 1.0, y: 960}], [B.underneath, {zoom: 1.05}], [B.mona, {zoom: 1.12, y: 940}], [B.l6 - 0.5, {zoom: 1.25, y: 930, rot: -2}], [B.l6, {zoom: 1.35, y: 920, rot: 0}]])} background={T.paperShade}>
      <Layer depth={0.4}><rect x={-300} y={-300} width={1700} height={2500} fill="#B9A27C" />
        {Array.from({length: 16}, (_, i) => <path key={i} d={`M-300,${-200 + i * 150} h1700`} stroke={T.ink} strokeWidth={2} opacity={0.12} />)}</Layer>
      {/* trunk walls (top-down) */}
      <Cut d={rect(120, 380, 840, 1160, 14)} fill="#EDE8DD" sw={4} />
      <rect x={170} y={430} width={740} height={1060} fill="#C9C0AE" stroke={T.ink} strokeWidth={3} />
      {/* her, under the silk */}
      <g transform="translate(540 960)"><K.Lisa fr={fr} h={626} glow={0.5 + flood * 0.5} glintAt={F(B.mona + 0.5)} /></g>
      {/* red silk bundle with amber leak at the folds, pulled away like a magician's cloth */}
      {pull < 1 && <g transform={`translate(${540 + pull * 900} ${960 - pull * 1300}) rotate(${pull * 50}) scale(${1 + pull * 0.4})`} opacity={silkIn}>
        <path d="M-260,-330 Q-300,0 -250,330 Q0,370 250,330 Q300,0 260,-330 Q0,-370 -260,-330 Z" fill={T.amberGlow} opacity={0.6} transform="scale(1.06)" />
        <Cut d="M-250,-320 Q-290,0 -240,320 Q0,360 240,320 Q290,0 250,-320 Q0,-360 -250,-320 Z" fill={T.silk} sw={3.5} />
        {[-140, -40, 60, 160].map((x, i) => <path key={i} d={`M${x},-300 q${30 + Math.sin(t * 2 + i) * 8},300 ${-10},600`} stroke="#7E1F22" strokeWidth={5} fill="none" opacity={0.7} />)}
        {[-150, 0, 150].map((x) => <path key={x} d={`M${x - 30},-310 q30,24 60,0`} stroke={T.amberGlow} strokeWidth={6} fill="none" />)}
        {/* tied like a parcel: a silk cord and a knot */}
        <path d="M-270,0 Q0,30 270,0" stroke="#7E1F22" strokeWidth={16} fill="none" />
        <path d="M0,14 q-60,-70 -20,-90 q40,10 20,90 q50,-60 80,-30 q-10,40 -80,30" fill={T.silk} stroke={T.ink} strokeWidth={3} />
        <g transform="translate(0 200)"><K.Label text="red silk" size={46} /></g>
      </g>}
      {/* the false bottom board lifts out toward the camera */}
      {board < 1 && <g transform={`translate(${540 + board * 700} ${960 - board * 200}) rotate(${board * 30}) scale(${1 + board * 0.6})`}>
        <Cut d={rect(-370, -530, 740, 1060, 6)} fill="#D9CCB2" sw={3.5} />
        {Array.from({length: 6}, (_, i) => <path key={i} d={`M-370,${-530 + i * 177}h740`} stroke={T.sepia} strokeWidth={3} />)}
        <circle cx={300} cy={0} r={18} fill={T.sepia} stroke={T.ink} strokeWidth={2.5} />
        <g transform="translate(-120 260)"><K.Label text="false bottom" size={50} /></g>
        {/* leftover shirt on the board */}
        <g transform="translate(-150 -200) rotate(-12)"><Cut d="M-90,-70 h180 l50,50 -36,24 -18,-18 v110 h-176 v-110 l-18,18 -36,-24z" fill={T.white} /></g>
      </g>}
      {/* amber motes rising from the bundle and from her */}
      {Array.from({length: 22}, (_, i) => { const ph = ((t * (0.35 + random(`am${i}`) * 0.4) + random(`ap${i}`)) % 1); return t > B.underneath ? <circle key={i} cx={540 + (random(`ax${i}`) - 0.5) * 520 + Math.sin(t * 2 + i) * 20} cy={1250 - ph * 700} r={3 + random(`ar${i}`) * 5} fill={T.amberGlow} opacity={Math.sin(ph * Math.PI) * silkIn} /> : null; })}
      {/* light floods up */}
      <rect x={-300} y={-300} width={1700} height={2500} fill={T.amberGlow} opacity={flood * (1 - pr(t, B.mona + 0.6, 0.8)) * 0.35} />
      {/* Geri and Poggi lean in from the edges (top-down heads and hands) */}
      <Layer depth={1.3}>
        <g transform={`translate(${lerp(-200, 10, lean)} ${560})`}><circle r={150} fill={T.skin[0]} stroke={T.ink} strokeWidth={4} /><path d="M-60,-150 q60,-60 140,-10" stroke="#4A3A2E" strokeWidth={30} fill="none" /></g>
        <g transform={`translate(${lerp(1280, 1070, lean)} ${1380})`}><circle r={150} fill={T.skin[0]} stroke={T.ink} strokeWidth={4} /><path d="M-60,-150 q60,-60 140,-10" stroke="#5A4636" strokeWidth={30} fill="none" /></g>
      </Layer>
    </Camera>
  );
};

// ---------- 7. The Uffizi check: cracks match, the seal on the back, "Real!" ----------
export const Check: React.FC<S> = ({t, fr}) => {
  const a = B.l6;
  const cracks = pr(t, B.cracks - 0.1, 0.9);
  const card = pr(t, B.cracks + 0.8, 0.9, inOut);
  const flip = pr(t, B.seal - 0.4, 0.7, inOut);
  const sx = Math.cos(flip * Math.PI);
  const stamp = pr(t, B.real - 0.05, 0.18, (k) => k);
  const nod = t > B.real + 0.2 ? Math.sin((t - B.real - 0.2) * 12) * 6 * Math.exp(-(t - B.real - 0.2) * 2) : 0;
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 1.6, y: 900}], [a + 0.8, {zoom: 1.05, y: 960}], [B.cracks, {zoom: 1.8, y: 1150, x: 660}], [B.cracks + 1.6, {zoom: 2.0, y: 1160, x: 640}], [B.seal - 0.3, {zoom: 1.05, y: 960, x: 540}], [B.real, {zoom: 1.1, y: 940}], [B.l7 - 0.3, {zoom: 1.5, y: 820, x: 540}], [B.l7, {zoom: 4.5, y: 800, x: 540}]])} background={T.paper}>
      <Layer depth={0.35}><Wall fill="#E2D2B2" seed="uf" />
        {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${-60 + i * 340} 240)`}><Cut d={rect(0, 0, 220, 300, 4)} fill={T.oldGold} sw={3} /><Cut d={rect(20, 20, 180, 260)} fill={[T.duskBlue, T.sepia, T.stone, '#6B7D5E'][i]} shadow={false} /></g>)}
        <g transform="translate(540 650)"><K.Label text="Uffizi, Florence" size={44} /></g>
      </Layer>
      {/* worktable */}
      <Cut d={wrect(40, 1500, 1000, 60, 'wt', 2)} fill={T.sepia} sw={3.5} />
      <g transform="translate(180 1490)"><Cut d="M-30,0 l10,-120 h40 l10,120 z" fill={T.oldGold} /><Cut d="M-80,-120 q80,-110 160,0 z" fill="#3B5E4A" /><circle cx={60} cy={-90} r={120} fill={T.amberGlow} opacity={0.14 + 0.03 * Math.sin(t * 7)} /></g>
      {/* her, standing on the table easel; flips to show the back */}
      <g transform={`translate(540 1060) scale(${Math.max(0.02, Math.abs(sx))} 1)`}>
        <K.Lisa fr={fr} h={685} glow={0.7} board={sx < 0 ? 'back' : 'front'} />
        {sx >= 0 && <g transform="translate(120 230)" opacity={cracks}>
          <clipPath id="crk"><rect x={-110} y={-110} width={220} height={210} /></clipPath>
          <g clipPath="url(#crk)" transform="scale(0.5)"><Cracks draw={cracks} color="#2A1C10" w={3} /></g>
        </g>}
        {sx < 0 && <KStamp fr={fr} at={F(B.real - 0.05)} text="Real!" x={0} y={-60} size={80} />}
      </g>
      {/* the reference card (the Louvre's photo of her cracks) slides over: the same lines, in red */}
      {sx >= 0 && <g transform={`translate(${lerp(1300, 660, card)} ${lerp(1350, 1290, card)}) rotate(${lerp(12, 0, card)})`} opacity={1 - pr(t, B.seal - 0.5, 0.3)}>
        <Cut d={rect(-130, -130, 260, 260, 6)} fill="rgba(248,241,225,0.25)" sw={2.5} rim={false} />
        <g transform="scale(0.5)"><Cracks draw={1} color={T.clueRed} w={5} /></g>
        <text x={0} y={162} fontFamily={TYPE} fontSize={26} textAnchor="middle" fill={T.ink}>Louvre photo</text>
      </g>}
      {/* the expert's magnifier over the cracks (lower right of the panel: never over her face) */}
      {sx >= 0 && <g transform={`translate(${lerp(900, 660, pr(t, a + 0.2, 0.6))} ${lerp(1500, 1300, pr(t, a + 0.2, 0.6)) + Math.sin(t * 3) * 8})`} opacity={1 - pr(t, B.seal - 0.5, 0.3)}><KMag x={0} y={0} r={125} rot={35} /></g>}
      {/* match ticks */}
      {sx >= 0 && card > 0.95 && <g transform="translate(660 1100)" opacity={win(t, B.cracks + 1.7, B.seal - 0.4, 0.1)}><text fontFamily={TYPE} fontSize={46} fill={T.clueRed} textAnchor="middle">match</text></g>}
      {/* Poggi with the giant magnifier over the cracks, then nodding */}
      <g transform={`translate(900 1580)`}>
        <g transform={`rotate(${nod} 0 -300)`}><K.P who="poggi" fr={fr} facing={-1} pose={stamp > 0 ? 'nod' : 'peer'} expr={stamp > 0.5 ? 'happy' : 'calm'} /></g>
      </g>
      <g transform={`translate(${lerp(-160, 110, pr(t, B.real - 0.4, 0.5))} 1600)`}><K.P who="geri" fr={fr} pose={stamp > 0 ? 'armsUp' : 'walk'} expr={stamp > 0 ? 'happy' : 'smile'} /></g>
    </Camera>
  );
};

// ---------- 8. The arrest: police, handcuffs, the "?" falls and straightens into "!" ----------
export const Arrest: React.FC<S> = ({t, fr}) => {
  const a = B.l7;
  const cops = pr(t, B.police - 0.1, 0.8, inOut);
  const cuffs = pr(t, B.police + 0.8, 0.3);
  const fall = pr(t, B.vincenzo - 0.55, 0.45, (k) => k * k);
  const straight = pr(t, B.vincenzo - 0.1, 0.3, inOut);
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 3.2, y: 1060, x: 540}], [a + 0.7, {zoom: 1.05, y: 980}], [B.vincenzo - 0.7, {zoom: 1.05, y: 760}], [B.vincenzo, {zoom: 1.1, y: 900}], [B.l8 - 0.35, {zoom: 1.5, y: 640, x: 560}], [B.l8, {zoom: 4.5, y: 600, x: 560}]])} background={T.paper}>
      <Layer depth={0.5}><RoomBack t={t} /><rect x={-300} y={-1600} width={1700} height={1500} fill={T.duskBlue} opacity={0.5} /></Layer>
      <KTrunk fr={fr} x={760} y={1450} size={1.25} lid={1} contents="none" />
      <g transform="translate(560 1470)"><K.P who="vincenzo" fr={fr} pose={cuffs > 0 ? 'holdUp' : 'surprised'} expr={straight > 0.5 ? 'sad' : 'surprised'} facing={-1} /></g>
      <g transform={`translate(560 ${1470 - 560 * 0.52 + 30})`}>{cuffs > 0 && <g transform="translate(40 0) scale(0.8)"><Handcuffs close={cuffs} /></g>}</g>
      <g transform={`translate(${lerp(-200, 290, cops)} 1500)`}><K.P who="police" fr={fr} pose={cops < 1 ? 'walk' : 'reach'} expr="calm" /></g>
      <Layer depth={1.2}><g transform={`translate(${lerp(-400, 60, cops)} 1700)`}><K.P who="police2" fr={fr} pose={cops < 1 ? 'walk' : 'stand'} expr="calm" /></g></Layer>
      {/* the question mark from part 2 drops out of the sky onto his head, then straightens into "!" */}
      <g transform={`translate(560 ${lerp(-500, 900, fall)})`}>
        <QuestionMark fr={fr} x={0} y={0} size={2.2} straighten={straight} />
      </g>
      {fall >= 1 && <g transform="translate(560 1000)"><Confetti p={pr(t, B.vincenzo - 0.1, 0.6)} n={10} spread={120} seed="bang" /></g>}
    </Camera>
  );
};

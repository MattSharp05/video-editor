// Part 2 stages 1–5: wall/recap/title, doll's-house Louvre, press + world, street, queue + Kafka.
// Every stage draws in world units and returns its camera; t is film time (s). Timing only from beats.json.
import React from 'react';
import B from './beats.json';
import {MonaEyes, C, Cut, Person, Mona, Hooks, QMark, Label, Calendar, Magnifier, rect, ell, ramp, lin, osc, mix, settle, step2, SHADOW, TYPE, SERIF, NameTag} from './look';
import {FameGauge as KFameGauge, Hooks as KHooks, Newspaper as KNewspaper, Postcard as KPostcard} from './series/props';
import {ParisStreet} from './series/sets';
import {Cam, camAt, Plane, SalonWall, Crowd, Ground, Lamp, Headline, Rooftops} from './world';

// ------------------------------------------------------------------ 1. the empty wall, recap, "?" and title
const recapFlat = (t: number, a: number, k: React.ReactNode, key: string) => {
  const u = (t - a) / 1.55; // slides right→left through the empty spot
  if (u < 0 || u > 1) return null;
  const x = u < 0.25 ? mix(1300, 540, ramp(u, 0, 0.25)) : u < 0.75 ? mix(540, 500, (u - 0.25) / 0.5) : mix(500, -300, ramp(u, 0.75, 0.25));
  return (
    <g key={key} transform={`translate(${x},880) rotate(${(x - 520) * 0.012})`}>
      <Cut d={rect(-270, -300, 540, 600, 6)} fill={C.card} />
      <rect x={-250} y={-280} width={500} height={560} fill={C.paperShade} stroke={C.ink} strokeWidth={3} />
      <g transform="translate(0,0)">{k}</g>
    </g>
  );
};
export const S1: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[0, 540, 900, 1.12], [4.3, 540, 880, 1.3], [5.2, 540, 900, 1.0], [7.9, 540, 1000, 1.08], [8.6, 540, 1250, 1.3]]);
  const bend = ramp(t, 4.25, 0.55); // hooks twist into the "?"
  const qIn = settle(t, 4.55, 0.6);
  const plaque = settle(t, B.l1 + 0.05, 0.9), lift = ramp(t, 7.5, 0.6);
  const typed = 'Part two: the hunt'.slice(0, Math.floor(lin(t, B.part2 - 0.05, 1.0) * 18));
  // magnifier pendulum from a pivot above, then drops to the floor
  const drop = ramp(t, 7.55, 0.5);
  const ang = (1 - drop) * 38 * Math.sin((t - 5.3) * 1.6) * (t > 5.3 ? 1 : 0) + drop * 0;
  const mx = 540 + Math.sin((ang * Math.PI) / 180) * 760, my = 260 + Math.cos((ang * Math.PI) / 180) * 760;
  const magY = mix(my, 1330, drop), magIn = ramp(t, 5.0, 0.4);
  const tt = step2(t);
  return (
    <>
      <SalonWall cam={cam} t={t} hideHooks={bend > 0}>
        <Plane cam={cam} d={1}>
          {recapFlat(t, 0.35, <g>
            <Hooks x={0} y={-220} s={1.1} t={t} />
            <Mona x={0} y={tt < 1.0 ? -40 : -40 - Math.min(40, (tt - 1.0) * 80)} h={220} glow={0.7} />
            <Person x={-130} y={270} s={0.5} role="vincenzo" costume="smock" aR={[150, -10]} aL={[130, 0]} />
          </g>, 'a')}
          {recapFlat(t, 1.75, <g>
            <Person x={-30} y={270} s={0.5} role="vincenzo" costume="smock" walk={tt * 1.6} />
            <g transform={`translate(30,${50 + osc(t, 1.6) * 6})`}>
              <ellipse cx={0} cy={0} rx={140} ry={110} fill="url(#amberGlow)" opacity={0.8} />
              <Cut d="M-90,-60 Q-100,40 -60,70 Q0,90 70,64 Q100,20 86,-56 Q0,-80 -90,-60 Z" fill={C.smock} />
              <path d="M-60,-30 Q0,-10 60,-36 M-50,30 Q10,46 66,20" fill="none" stroke={C.amber} strokeWidth={4} />
              <MonaEyes x={0} y={-58} w={120} glow={0.3} />
            </g>
          </g>, 'b')}
          {recapFlat(t, 3.15, <g>
            <rect x={60} y={-220} width={170} height={480} fill="#FFF1C8" stroke={C.ink} strokeWidth={3} />
            <Cut d={rect(-30, -220, 90, 480, 2)} fill={C.sepia} sw={3} />
            <Person x={-130} y={270} s={0.45} coat={C.duskBlue} hat="cap" hatColor={C.duskBlue} tache wide={1.2} aR={[70, 30]} bob={4 + osc(t, 2) * 4} mouth="smile" />
            <Person x={mix(40, 150, lin(t, 3.4, 1.2))} y={270} s={0.45} role="vincenzo" costume="smock" walk={tt * 1.6} flip />
          </g>, 'c')}
          {/* the four hooks: empty, then twisting together into one "?" (the kit's bend state) */}
          {bend > 0 && bend < 1 && <KHooks fr={Math.round(t * 30)} x={540} y={740} state="bend" bend={bend} />}
          {qIn > 0 && <g transform={`translate(540,${640 - lift * 80}) rotate(${osc(t, 0.5) * 3 + (1 - qIn) * 30})`}><QMark x={0} y={0} s={2.0 * qIn} /></g>}
        </Plane>
        <Plane cam={cam} d={1.2}>
          {/* part 1's two guards stroll past the empty wall during the recap */}
          {t < B.l1 + 0.6 && <g opacity={1 - ramp(t, B.l1, 0.5)}>
            <Person x={-150 + t * 150} y={1700} s={0.62} role="guard" walk={t * 1.3} />
            <Person x={1250 - t * 130} y={1760} s={0.55} role="police" walk={t * 1.4 + 2} flip />
          </g>}
          {magIn > 0 && (
            <g opacity={magIn}>
              {drop < 0.05 && <line x1={540} y1={260} x2={mx} y2={my - 100} stroke={C.ink} strokeWidth={3} />}
              <Magnifier x={drop > 0 ? mix(mx, 540, drop) : mx} y={magY} s={1.05} rot={-ang + drop * 30}>
                {drop > 0.3 && <g opacity={lin(drop, 0.3, 0.5)}>
                  {/* police boots marching seen through the lens */}
                  <rect x={-100} y={-100} width={200} height={200} fill={C.paperShade} />
                  {[-50, 20, 80, -110].map((bx, i) => <Cut key={i} d={`M${bx},${30 + osc(t, 2, i * 0.25) * 12} l0,-90 l34,0 l0,70 q36,0 40,20 l0,10 z`} fill={C.nightBlue} sw={3} rim={false} />)}
                </g>}
              </Magnifier>
            </g>
          )}
        </Plane>
      </SalonWall>
    </>
  );
};
export const S1_OUT = {x: 540, y: 1330, color: C.nightBlue};

// ------------------------------------------------------------------ 2. doll's-house Louvre searched, closed a week
const Room: React.FC<{x: number; y: number; i: number; t: number}> = ({x, y, i, t}) => {
  const tt = step2(t);
  const wall = [C.paper, C.paperShade, '#E7D9B9', C.paperShade, C.paper, '#E7D9B9'][i];
  const lantern = (lx: number, ly: number) => <g transform={`translate(${lx},${ly + osc(t, 1.3, i * 0.2) * 4})`}><ellipse cx={0} cy={0} rx={70} ry={70} fill="url(#lampGlow)" /><Cut d={rect(-11, -16, 22, 30, 3)} fill="#E8C979" sw={2} rim={false} /></g>;
  const cop = (px: number, extra: Partial<React.ComponentProps<typeof Person>> = {}) => <Person x={px} y={130} s={0.3} role="police" {...extra} />;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-150} y={-150} width={300} height={290} fill={wall} stroke={C.ink} strokeWidth={4} />
      <rect x={-150} y={110} width={300} height={30} fill={C.sepia} opacity={0.5} />
      {i === 0 && <g>{/* mummy: lid lifts, the mummy shakes its head */}
        <Cut d={rect(-30, -60, 70, 190, 30)} fill="#D8C08A" sw={3} />
        <g transform={`translate(10,${-30})`}><Cut d={ell(osc(tt, 2.2) * 6, -10, 22, 26)} fill="#EADFC6" sw={2.5} rim={false} />
          {[0, 1, 2].map((k) => <line key={k} x1={-18 + osc(tt, 2.2) * 6} y1={-22 + k * 10} x2={18 + osc(tt, 2.2) * 6} y2={-18 + k * 10} stroke={C.ink} strokeWidth={2} />)}</g>
        <g transform={`translate(80,130) rotate(${-25 - osc(t, 0.8) * 10})`}><Cut d={rect(-6, -190, 60, 190, 26)} fill={C.oldGold} sw={3} /></g>
        {cop(-90, {aR: [120, 20], look: 1, mouth: 'o', brows: 'up'})}{lantern(-60, -90)}</g>}
      {i === 1 && <g>{/* statue: a policeman peeks behind it */}
        <Cut d={rect(-20, 70, 80, 60, 3)} fill={C.stone} sw={3} />
        <Cut d={`M0,70 Q-10,-20 20,-40 Q50,-20 40,70 Z`} fill="#E9E4DA" sw={3} />
        <Cut d={ell(20, -60, 20, 22)} fill="#E9E4DA" sw={3} />
        {cop(mix(-70, 90, (osc(t, 0.35) + 1) / 2), {look: osc(t, 0.35) > 0 ? -1 : 1})}{lantern(110, -100)}</g>}
      {i === 2 && <g>{/* head stuck in a big vase, legs kicking */}
        <g transform={`rotate(${osc(tt, 1.5) * 8},0,130)`}>
          <Person x={0} y={130} s={0.3} role="police" aL={[160 + osc(tt, 3) * 20, 0]} aR={[160 - osc(tt, 3) * 20, 0]} walk={tt * 1.5} />
          <Cut d="M-60,-70 Q-80,-120 -40,-150 L40,-150 Q80,-120 60,-70 Q50,-40 30,-30 L-30,-30 Q-50,-40 -60,-70 Z" fill="#4E6FA0" sw={3} />
          <path d="M-50,-110 Q0,-90 50,-110" fill="none" stroke={C.card} strokeWidth={5} /></g>
        {lantern(-110, -110)}</g>}
      {i === 3 && <g>{/* under the table with a lantern */}
        <Cut d={rect(-110, 20, 220, 18, 3)} fill={C.sepia} sw={3} />
        <rect x={-100} y={38} width={14} height={90} fill={C.ink} /><rect x={86} y={38} width={14} height={90} fill={C.ink} />
        <g transform={`translate(${osc(t, 0.4) * 30},0)`}><Person x={0} y={150} s={0.22} role="police" look={osc(t, 0.4) > 0 ? 1 : -1} />{lantern(30, 70)}</g></g>}
      {i === 4 && <g>{/* two lift a painting to look behind */}
        <g transform={`translate(0,${-40 - Math.max(0, osc(t, 0.5)) * 30})`}><Cut d={rect(-60, -70, 120, 90, 3)} fill={C.oldGold} sw={3} /><rect x={-46} y={-56} width={92} height={62} fill={C.duskBlue} /></g>
        {cop(-80, {aR: [160, 0], aL: [150, 0]})}{cop(80, {aR: [160, 0], aL: [150, 0], flip: true, look: -1})}{lantern(0, 60)}</g>}
      {i === 5 && <g>{/* cupboard: doors swing, papers fly */}
        <Cut d={rect(-60, -90, 120, 220, 3)} fill={C.sepia} sw={3} />
        <g transform={`translate(-60,0) scale(${Math.cos(Math.max(0, osc(t, 0.45)) * 1.3)},1)`}><rect x={0} y={-90} width={60} height={220} fill="#8F6C4A" stroke={C.ink} strokeWidth={3} /></g>
        {[0, 1, 2].map((k) => { const u = ((t * 0.7 + k * 0.33) % 1); return <rect key={k} x={-20 + u * 120 * (k - 1)} y={-60 - u * 120 + u * u * 160} width={34} height={24} fill={C.card} stroke={C.ink} strokeWidth={2} transform={`rotate(${u * 300})`} />; })}
        {cop(80, {aR: [100, 30], look: -1, brows: 'cross'})}{lantern(-100, -100)}</g>}
    </g>
  );
};
export const S2: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [[B.l2 - 0.3, 540, 1150, 1.7], [B.l2 + 1.0, 540, 950, 1.0], [B.l3 - 1.6, 560, 990, 1.02], [B.l3 - 0.3, 860, 1380, 1.9]]);
  const open = ramp(t, B.l2 + 0.15, 0.9);
  const days = Math.min(7, 1 + Math.floor(lin(t, B.week - 0.2, B.l3 - 1.2 - B.week) * 6.99));
  const tearK = ((t - (B.week - 0.2)) / ((B.l3 - 1.2 - B.week) / 6.99)) % 1;
  const fly = ramp(t, B.l3 - 0.75, 0.5);
  return (
    <>
      <Plane cam={cam} d={0.25}>
        <rect x={-1500} y={-1500} width={4000} height={5000} fill={C.duskBlue} />
        <Rooftops t={t} y={1500} seed="s2" />
      </Plane>
      <Plane cam={cam} d={0.6}><Ground y={1420} color={C.stone} />
        {[...Array(8)].map((_, i) => <circle key={i} cx={-200 + i * 220 + osc(t, 0.05, i) * 40} cy={300 + (i % 3) * 120} r={40 + (i % 2) * 20} fill={C.paper} opacity={0.12} />)}
      </Plane>
      <Plane cam={cam} d={1}>
        {/* roof and facade frame */}
        <Cut d="M60,330 L540,140 L1020,330 Z" fill={C.stone} />
        <text x={540} y={300} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={54} fill={C.ink}>LOUVRE</text>
        <Cut d={rect(80, 330, 920, 1090, 4)} fill={C.stone} />
        {[0, 1, 2].map((r) => [0, 1].map((c) => <Room key={`${r}${c}`} x={350 + c * 380} y={520 + r * 320} i={r * 2 + c} t={t} />))}
        {/* the swinging front wall (hinged at the left), with closed shutters drawn as eyelids */}
        {open < 1 && <g transform={`translate(80,330) scale(${Math.cos(open * Math.PI * 0.62)},1)`}>
          <Cut d={rect(0, 0, 920, 1090, 4)} fill={C.stone} />
          {[0, 1, 2].map((r) => [0, 1].map((c) => <g key={`${r}${c}`}><rect x={130 + c * 380} y={60 + r * 320} width={280} height={240} fill={C.nightBlue} stroke={C.ink} strokeWidth={4} /><path d={`M${150 + c * 380},${190 + r * 320} q120,40 240,0`} fill="none" stroke={C.card} strokeWidth={5} /></g>))}
        </g>}
        {/* the door, chained, with the Closed sign */}
        <Cut d={rect(450, 1260, 180, 160, 4)} fill={C.sepia} />
        <path d="M455,1320 Q540,1360 625,1320" fill="none" stroke={C.ink} strokeWidth={6} strokeDasharray="12 6" />
        <g transform={`translate(540,1370) rotate(${osc(t, 0.7) * 4})`}><Label x={0} y={0} text="Closed" size={40} /></g>
        {/* the tear-off calendar: Day 1 … Day 7, then the last page flies out */}
        <g transform={`translate(${mix(860, 1500, fly)},${mix(1380, 700, fly)}) rotate(${fly * 40})`}>
          <Calendar x={0} y={0} s={1} page={fly > 0 ? 'Day 7' : `Day ${days}`} prev={days > 1 && fly === 0 ? `Day ${days - 1}` : undefined} k={days > 1 ? Math.min(1, tearK * 2.5) : 1} />
        </g>
      </Plane>
    </>
  );
};
export const S2_OUT = {x: 860, y: 1380, color: C.card};

// ------------------------------------------------------------------ 3. press → front pages → birds over the world; fame gauge
const CITIES: [string, number, number][] = [['London', 470, 520], ['New York', 130, 640], ['Buenos Aires', 300, 1050], ['Rome', 640, 660], ['Cairo', 760, 760]];
const PARIS: [number, number] = [530, 590];
const Bird: React.FC<{x: number; y: number; t: number; s?: number; rot?: number}> = ({x, y, t, s = 1, rot = 0}) => {
  const f = osc(t, 3.2) * 0.8;
  return <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Cut d={`M0,0 L-50,${-34 * f - 6} L-14,4 Z`} fill={C.card} sw={2.5} rim={false} />
    <Cut d={`M0,0 L50,${-34 * f - 6} L14,4 Z`} fill={C.card} sw={2.5} rim={false} />
    <Cut d="M-16,0 L0,-10 L16,0 L0,16 Z" fill="#E9E0CB" sw={2.5} rim={false} />
  </g>;
};
export const Gauge: React.FC<{x: number; y: number; k: number; t: number; smoke?: number; s?: number}> = ({x, y, k, t, smoke = 0, s = 1}) => (
  <KFameGauge fr={Math.round(t * 30)} x={x} y={y} size={s} value={k} smoke={smoke} tremble={k > 0.85 ? 1 : 0.2} />
);
export const S3: React.FC<{t: number}> = ({t}) => {
  const a = B.l3;
  const cam = camAt(t, [[a - 0.3, 540, 1180, 2.3], [a + 1.2, 540, 1050, 1.0], [B.suddenly, 540, 900, 1.0], [B.l4 - 0.9, 600, 1000, 1.08], [B.l4 - 0.2, 900, 1240, 1.9]]);
  const tt = step2(t);
  const roll = t * 4;
  const fold = ramp(t, B.world - 0.4, 0.5);
  const birdsGo = B.world - 0.1;
  const gk = ramp(t, B.suddenly, 1.0) * 0.9 + 0.05;
  const push = ramp(t, B.name - 0.2, 1.2); // readers shove the art lover
  return (
    <>
      <Plane cam={cam} d={0.35}>
        <rect x={-1500} y={-1500} width={4000} height={5000} fill={C.paperShade} />
        {/* flat paper world map */}
        <Cut d={rect(-60, 360, 1200, 840, 8)} fill={C.paper} sw={3} />
        {[...Array(8)].map((_, i) => <line key={i} x1={-60 + i * 150} y1={360} x2={-60 + i * 150} y2={1200} stroke={C.paperShade} strokeWidth={2} />)}
        <path d="M60,500 Q150,430 260,480 Q300,560 250,640 Q200,720 140,700 Q80,640 60,500 Z M210,760 Q300,740 360,820 Q380,960 320,1120 Q280,1060 250,940 Q200,840 210,760 Z" fill={C.paperShade} stroke={C.ink} strokeWidth={3} />
        <path d="M440,470 Q520,420 620,450 Q760,420 900,470 Q1000,520 980,620 Q900,640 820,620 Q760,700 700,640 Q640,640 600,620 Q520,640 470,600 Q430,540 440,470 Z M560,680 Q640,660 720,700 Q800,760 760,900 Q700,1000 650,900 Q600,800 560,680 Z" fill={C.paperShade} stroke={C.ink} strokeWidth={3} />
        {/* landing dots light in turn */}
        {CITIES.map(([n, x, y], i) => { const land = birdsGo + 0.55 + i * 0.32; const k = ramp(t, land, 0.2); return <g key={n} opacity={0.4 + 0.6 * k}>
          <circle cx={x} cy={y} r={10 + k * 8} fill={k > 0.5 ? C.amber : C.ink} stroke={C.ink} strokeWidth={2} />
          {k > 0 && <circle cx={x} cy={y} r={20 + lin(t, land, 0.6) * 60} fill="none" stroke={C.amber} strokeWidth={4} opacity={1 - lin(t, land, 0.6)} />}
          <text x={x} y={y - 26} textAnchor="middle" fontFamily={TYPE} fontSize={26} fill={C.ink}>{n}</text></g>; })}
        <circle cx={PARIS[0]} cy={PARIS[1]} r={12} fill={C.clueRed} stroke={C.ink} strokeWidth={2} /><text x={PARIS[0] + 20} y={PARIS[1] + 34} fontFamily={TYPE} fontSize={26} fill={C.ink}>Paris</text>
      </Plane>
      <Plane cam={cam} d={0.7}>
        <Gauge x={840} y={300} k={gk} t={t} smoke={ramp(t, B.name, 0.5)} s={0.95} />
      </Plane>
      <Plane cam={cam} d={1}>
        {/* the press: rollers turning, pages coming out */}
        <Cut d={rect(250, 1180, 580, 300, 10)} fill={C.ink} sw={3} />
        {[380, 540, 700].map((x, i) => <g key={i} transform={`translate(${x},1240) rotate(${roll * 90 * (i % 2 ? -1 : 1)})`}><Cut d={ell(0, 0, 56, 56)} fill={C.stone} sw={3} rim={false} /><line x1={-50} y1={0} x2={50} y2={0} stroke={C.ink} strokeWidth={4} /></g>)}
        <Cut d={rect(220, 1420, 640, 50, 6)} fill={C.sepia} sw={3} />
        <Label x={540} y={1340} text="Printing press" size={30} />
        {/* the hero front page, then pages folding into birds */}
        {fold < 1 && <g transform={`translate(540,${mix(1150, 1080, ramp(t, a - 0.3, 1.2))}) scale(${1 - fold * 0.7},${1 - fold})`}>
          <KNewspaper fr={Math.round(t * 30)} x={0} y={0} size={1.1} headline="Mona Lisa stolen!" rot={osc(t, 0.4) * 1.5} />
        </g>}
        {[...Array(5)].map((_, i) => {
          const [, cx, cy] = CITIES[i];
          const tx = -60 + 0.35 * 0 + cx, ty = cy; // map is on the 0.35 plane; aim roughly
          const u = ramp(t, birdsGo + i * 0.32, 0.6);
          if (u <= 0 || u >= 1) return null;
          const x = mix(540, tx, u), y = mix(1080, ty, u) - Math.sin(u * Math.PI) * 160;
          return <Bird key={i} x={x} y={y} t={t + i * 0.2} s={1 - u * 0.4} rot={(tx - 540) * 0.03} />;
        })}
        {/* a few pages keep popping out of the press */}
        {[0, 1, 2].map((i) => { const u = ((t - a) * 0.8 + i / 3) % 1; if (t < a + 0.8) return null; return <g key={i} transform={`translate(${540 + (i - 1) * 140 + u * (i - 1) * 300},${1180 - u * 420})`} opacity={1 - u}><Bird x={0} y={0} t={t + i} s={0.7} /></g>; })}
        {/* the art lover (monocle) is shoved aside by readers with newspapers */}
        <Person x={mix(170, -120, push)} y={1820} s={0.62} role="artlover" monocle={push < 0.3} flip={false} brows={push > 0.2 ? 'up' : 'flat'} mouth={push > 0.2 ? 'o' : 'smile'} />
        <Crowd seed="rd" n={4} x0={mix(1250, 420, ramp(t, B.suddenly - 0.3, 1.3))} x1={mix(1650, 980, ramp(t, B.suddenly - 0.3, 1.3))} y={1880} s={0.6} t={t} walk={tt * 1.4} flip />
        {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${mix(1250, 420, ramp(t, B.suddenly - 0.3, 1.3)) + i * 187},${1500 + osc(t, 1.2, i * 0.3) * 5})`}><Cut d={rect(-60, -40, 120, 80, 2)} fill={C.card} sw={2.5} /><line x1={-44} y1={-20} x2={44} y2={-20} stroke={C.ink} strokeWidth={3} /><line x1={-44} y1={0} x2={30} y2={0} stroke={C.ink} strokeWidth={2} /></g>)}
        {/* the bird that will land on the Paris lamp-post */}
        {t > B.l4 - 1.0 && <Bird x={mix(540, 900, ramp(t, B.l4 - 1.0, 0.8))} y={mix(1050, 1240, ramp(t, B.l4 - 1.0, 0.8))} t={t} s={1.2} />}
      </Plane>
    </>
  );
};
export const S3_OUT = {x: 900, y: 1240, color: C.card};

// ------------------------------------------------------------------ 4. Paris street: the song and the postcards
const Postcard: React.FC<{i: number; t: number}> = ({i, t}) => i < 3 ? <g transform="scale(0.72)"><KPostcard fr={Math.round(t * 30)} x={0} y={0} gag={(['balloon', 'bicycle', 'eiffel'] as const)[i]} caption={i === 2 ? 'Wish you were here!' : undefined} /></g> : (
  <g>
    <Cut d={rect(-130, -90, 260, 180, 4)} fill={C.card} sw={2.5} />
    {i === 0 && <g>{/* balloon */}
      <rect x={-130} y={-90} width={260} height={180} fill="#CFDDE8" />
      <g transform={`translate(${osc(t, 0.5) * 8},${-osc(t, 0.6) * 10})`}><Cut d={ell(0, -40, 50, 46)} fill={C.clueRed} sw={2.5} rim={false} />
        <line x1={-30} y1={0} x2={-18} y2={30} stroke={C.ink} strokeWidth={2} /><line x1={30} y1={0} x2={18} y2={30} stroke={C.ink} strokeWidth={2} />
        <rect x={-24} y={30} width={48} height={34} fill={C.sepia} stroke={C.ink} strokeWidth={2} />
        <image href={staticFileSafe()} x={-14} y={16} width={28} height={24} preserveAspectRatio="xMidYMin slice" /></g></g>}
    {i === 1 && <g>{/* bicycle leaving the Louvre */}
      <rect x={-130} y={-90} width={260} height={180} fill="#E9D9B5" /><rect x={-130} y={-60} width={90} height={100} fill={C.stone} stroke={C.ink} strokeWidth={2} />
      <g transform={`translate(${-10 + ((t * 30) % 60)},30)`}>
        {[-30, 30].map((wx) => <g key={wx} transform={`translate(${wx},20) rotate(${t * 400})`}><circle r={20} fill="none" stroke={C.ink} strokeWidth={3} /><line x1={-20} y1={0} x2={20} y2={0} stroke={C.ink} strokeWidth={1.5} /><line x1={0} y1={-20} x2={0} y2={20} stroke={C.ink} strokeWidth={1.5} /></g>)}
        <path d="M-30,20 L0,-6 L30,20 M0,-6 L-6,-24" fill="none" stroke={C.ink} strokeWidth={3} />
        <image href={staticFileSafe()} x={-16} y={-60} width={30} height={40} preserveAspectRatio="xMidYMin slice" /></g></g>}
    {i === 2 && <g>{/* Eiffel tower, wish you were here */}
      <rect x={-130} y={-90} width={260} height={180} fill="#F3E0B8" />
      <path d="M60,70 L90,-70 L120,70 M70,20 L110,20" fill="none" stroke={C.ink} strokeWidth={4} />
      <image href={staticFileSafe()} x={-100} y={-40} width={70} height={100} preserveAspectRatio="xMidYMin slice" />
      <g transform={`translate(-20,${-10 + osc(t, 2) * 6}) rotate(${osc(t, 2) * 20})`}><rect x={0} y={0} width={20} height={14} fill="#fff" stroke={C.ink} strokeWidth={1.5} /></g>
      <text x={0} y={-58} textAnchor="middle" fontFamily={TYPE} fontSize={22} fill={C.ink}>Wish you were here!</text></g>}
    {i === 3 && <g>{/* the empty wall */}
      <rect x={-130} y={-90} width={260} height={180} fill={C.paper} />
      <rect x={-30} y={-30} width={60} height={80} fill={C.card} stroke={C.paperShade} strokeWidth={2} />
      {[-24, -8, 8, 24].map((hx) => <circle key={hx} cx={hx} cy={-44} r={3} fill={C.ink} />)}</g>}
  </g>
);
import {staticFile} from 'remotion';
const staticFileSafe = () => staticFile('monalisa.jpg');
export const S4: React.FC<{t: number}> = ({t}) => {
  const a = B.l4;
  const cam = camAt(t, [[a - 0.3, 900, 1240, 2.0], [a + 0.6, 420, 1080, 1.15], [B.postcards - 0.2, 520, 1080, 1.1], [B.l5 - 1.0, 800, 1080, 1.35], [B.l5 - 0.2, 800, 1140, 2.4]]);
  const tt = step2(t);
  const open = ramp(t, a - 0.3, 0.6);
  const spin = lin(t, B.postcards - 0.3, B.l5 - 0.8 - B.postcards + 0.3) * 3; // card index 0..3
  const card = Math.min(3, Math.floor(spin));
  const flipK = spin - Math.floor(spin);
  return (
    <>
      {/* the kit's Paris street (floor 1500 drawn at 1560 here), lamp-post at x 900 */}
      <Plane cam={cam} d={0.2}><g transform="translate(0,60)"><ParisStreet fr={Math.round(t * 30)} only={['backdrop']} lampX={900} /></g></Plane>
      <Plane cam={cam} d={0.45}><g transform="translate(0,60)"><ParisStreet fr={Math.round(t * 30)} only={['far']} lampX={900} /></g></Plane>
      <Plane cam={cam} d={0.7}><g transform="translate(0,60)"><ParisStreet fr={Math.round(t * 30)} only={['mid']} lampX={900} /></g></Plane>
      <Plane cam={cam} d={1}>
        <g transform="translate(0,60)"><ParisStreet fr={Math.round(t * 30)} only={['actors']} lampX={900} /></g>
        {/* lamp-post with the song sheet the bird became */}
        <g transform={`translate(900,1180) rotate(${osc(t, 0.8) * 3})`}>
          <g transform={`scale(${0.3 + open * 0.7},1)`}><Cut d={rect(-90, -110, 180, 220, 3)} fill={C.card} sw={2.5} />
            {[0, 1, 2, 3].map((r) => <g key={r}><line x1={-70} y1={-60 + r * 34} x2={70} y2={-60 + r * 34} stroke={C.ink} strokeWidth={1.5} /><circle cx={-50 + r * 34} cy={-66 + r * 34 - (r % 2) * 10} r={6} fill={C.ink} /></g>)}
            <text x={0} y={-80} textAnchor="middle" fontFamily={TYPE} fontSize={20} fill={C.ink}>The Mona Lisa song</text></g>
        </g>
        {/* the little stage and the singer */}
        <Cut d={rect(150, 1380, 400, 180, 4)} fill={C.sepia} />
        <path d="M130,1020 Q350,960 570,1020 L570,1060 Q350,1010 130,1060 Z" fill={C.duskBlue} stroke={C.ink} strokeWidth={3} />
        <Person x={350} y={1390} s={0.62} coat={C.duskBlue} hat="feather" gown skin={C.skin[0]} hair={C.sepia} mouth={Math.floor(t * 5) % 2 ? 'open' : 'o'} aR={[90 + osc(tt, 0.7) * 40, 20]} aL={[30, 10]} bob={Math.abs(osc(t, 1)) * 6} />
        {[0, 1, 2, 3].map((i) => { const u = ((t * 0.6 + i * 0.25) % 1); return <text key={i} x={400 + u * 260 + osc(t, 1, i) * 20} y={1050 - u * 260} fontSize={56} fill={C.ink} opacity={1 - u}>{i % 2 ? '♪' : '♫'}</text>; })}
        {/* a small audience */}
        <Crowd seed="au" n={3} x0={160} x1={520} y={1800} s={0.55} t={t} />
        {/* postcard stand that spins card by card */}
        <Cut d={rect(782, 1080, 16, 480, 4)} fill={C.ink} sw={2} />
        {[0, 1, 2].map((r) => <g key={r} transform={`translate(790,${1150 + r * 130})`}><g transform={`scale(${0.62},${0.62})`}><Postcard i={(r + 1) % 3} t={t} /></g></g>)}
        <g transform={`translate(790,${mix(960, 900, ramp(t, B.postcards, 0.4))}) scale(${Math.abs(Math.cos(flipK * Math.PI)) * (card === 3 ? 1.1 : 1)},1)`}>
          <Postcard i={card} t={t} />
        </g>
      </Plane>
    </>
  );
};
export const S4_OUT = {x: 790, y: 900, color: C.paper};

// ------------------------------------------------------------------ 5. reopening: the queue stares at the empty wall; Kafka
export const S5: React.FC<{t: number}> = ({t}) => {
  const a = B.l5, k = B.l6;
  const cam = camAt(t, [[a - 0.3, 540, 880, 2.6], [a + 0.9, 540, 960, 1.1], [a + 2.6, 540, 1000, 0.82], [k - 0.1, 600, 1050, 0.85], [k + 1.0, 820, 1560, 1.45], [B.l7 - 1.0, 840, 1560, 1.55], [B.l7 - 0.2, 1000, 1480, 2.3]]);
  const tt = step2(t);
  const flash = Math.max(0, 1 - Math.abs(t - (B.kafka + 0.15)) / 0.12);
  const tag = lin(t, B.kafka + 0.1, 0.9);
  const pen = lin(t, B.writer + 0.2, B.l7 - B.writer - 0.4);
  const glasses = ramp(t, a + 1.6, 0.4) * (1 - ramp(t, k - 0.3, 0.3));
  return (
    <>
      <SalonWall cam={cam} t={t} look={osc(t, 0.25)}>
        <Plane cam={cam} d={1}>
          {/* the rope and its posts, the guard */}
          <path d="M180,1260 Q540,1310 900,1260" fill="none" stroke={C.clueRed} strokeWidth={10} />
          {[180, 900].map((x) => <Cut key={x} d={rect(x - 12, 1150, 24, 270, 6)} fill={C.oldGold} sw={3} />)}
          <Person x={1010} y={1420} s={0.68} role="guard" aR={[50, 30]} look={-1} />
          <g transform={`translate(240,1080) rotate(${osc(t, 0.6) * 3})`}><Label x={0} y={0} text="Open again" size={34} /></g>
        </Plane>
        {/* the queue: several rows, each person bobbing on its own, walking slowly toward the wall */}
        <Plane cam={cam} d={1.1}>
          <Crowd seed="q1" n={7} x0={-300} x1={1380} y={1560} s={0.62} t={t} hatsOff={lin(t, a + 2.2, 1.5)} walk={tt * 0.25} />
        </Plane>
        <Plane cam={cam} d={1.25}>
          <Crowd seed="q2" n={8} x0={-500} x1={1500} y={1820} s={0.72} t={t} hatsOff={lin(t, a + 2.6, 1.5)} skip={[5]} />
          {/* opera glasses at nothing */}
          <Person x={330} y={1830} s={0.72} coat={C.ink} hat="top" tache tall={1.05} aR={[150 * glasses + 10, 20]} aL={[150 * glasses + 10, 10]} look={0} lookY={-1}
            holdR={glasses > 0.5 ? <g transform="translate(-30,-10)"><Cut d={rect(-30, -14, 60, 28, 8)} fill={C.oldGold} sw={2.5} rim={false} /></g> : undefined} />
          {/* Kafka: slim young man, high collar, bowler in his hands, little notebook */}
          <Person x={850} y={1830} s={0.74} coat={C.ink} hat="none" collar tall={1.05} wide={0.85} skin={C.skin[0]} look={t > B.kafka + 0.3 && t < B.kafka + 1.4 ? -1 : 0} brows={flash > 0 ? 'up' : 'flat'}
            aL={[40, 50]} aR={pen > 0 ? [60, 60] : [20, 30]}
            hold={<g transform="translate(0,6)"><Cut d="M-38,-4 Q-38,-18 -24,-18 Q-24,-40 0,-40 Q24,-40 24,-18 Q38,-18 38,-4 Z" fill={C.ink} sw={2} rim={false} /></g>}
            holdR={pen > 0 ? <g><Cut d={rect(-30, -24, 54, 40, 2)} fill={C.card} sw={2} rim={false} /></g> : undefined} />
        </Plane>
        <Plane cam={cam} d={1.25}>
          {/* the pen line runs off the notebook to the right: it becomes the red string */}
          {pen > 0 && <path d={`M905,1440 q40,-20 80,0 t80,0 t80,0 t80,0 t80,0 t80,0`} fill="none" stroke={C.clueRed} strokeWidth={6} strokeDasharray="600" strokeDashoffset={600 * (1 - pen)} strokeLinecap="round" />}
          
          {tag > 0.2 && <g opacity={lin(t, B.writer, 0.4)}><Label x={850} y={1020} text="later a famous writer" size={32} rot={osc(t, 0.4) * 2} /></g>}
          {/* the camera flash puff */}
          {flash > 0 && <g><circle cx={700} cy={1050} r={260 * flash + 40} fill="#FFFDF2" opacity={flash * 0.85} /><circle cx={700} cy={1050} r={90} fill="#fff" opacity={flash} /></g>}
        </Plane>
      </SalonWall>
    </>
  );
};
export const S5_OUT = {x: 1150, y: 1440, color: '#B98A5A'};

// Part-only sets for Part 1 (pick §3.2: London street at night, music-hall stage, the ball, Albion House door),
// drawn in the series style with kit tokens. Each draws one plane at a time (`plane`) so the film can put it on its
// own parallax layer. World coords are frame coords (1080×1920); street level y 1500.
import React from 'react';
import {K, FONT} from './tok';
import {Sh, R, E, Glow} from './ink';
import {hash} from './rig';

// ---------------- London street at night (L1–L2) ----------------
// sky from y -1500 (the Spark star) down to the pavement at y 1500. Planes: far (rooftops), mid (shops, wires), near
// (pavement, lamp post, playbill wall).
export const STREET = {starX: 760, starY: -330, wireY: (x: number) => 560 + 0.00016 * (x - 540) ** 2, playbill: {x: 640, y: 860, w: 360, h: 480}, ground: 1500};
export const LondonStreet: React.FC<{t: number; plane: 'sky' | 'far' | 'mid' | 'near'; footlights?: number}> = ({t, plane, footlights = 0}) => {
  if (plane === 'sky') return (
    <g>
      <defs><linearGradient id="p1-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={K.ink} /><stop offset="0.45" stopColor={K.deep} /><stop offset="0.8" stopColor={K.slate} /><stop offset="1" stopColor={K.mist} />
      </linearGradient></defs>
      <rect x={-800} y={-2200} width={2700} height={3900} fill="url(#p1-sky)" />
      {Array.from({length: 46}).map((_, i) => {
        const x = -300 + hash(i) * 1700, y = -2000 + hash(i + 50) * 2200, tw = 0.35 + 0.35 * Math.sin(t * (1.2 + hash(i + 9) * 2) + i);
        return <circle key={i} cx={x} cy={y} r={1.6 + hash(i + 3) * 1.8} fill={K.fog} opacity={tw} />;
      })}
      <circle cx={260} cy={-640} r={70} fill={K.fog} opacity={0.75} />
      <circle cx={282} cy={-650} r={62} fill={K.deep} opacity={0.55} />
    </g>
  );
  if (plane === 'far') return (
    <g>
      {/* far rooftops and chimneys (fog-pale), with a dome far off */}
      <path d={`M-600,${980}${Array.from({length: 22}).map((_, i) => { const x = -600 + i * 120, h = 820 + hash(i + 7) * 120; return `L${x},${h}L${x + 40},${h - 30 * hash(i)}L${x + 80},${h}L${x + 120},${h + 10}`; }).join('')}L2100,980L2100,1700L-600,1700z`} fill={K.mist} opacity={0.75} />
      <path d={E(1180, 830, 120, 90)} fill={K.mist} opacity={0.8} />
      {Array.from({length: 18}).map((_, i) => <rect key={i} x={-560 + i * 150 + hash(i) * 40} y={760 + hash(i + 2) * 120} width={18} height={60} fill={K.mist} />)}
      {/* chimney smoke wisps */}
      {Array.from({length: 5}).map((_, i) => {
        const x0 = -300 + i * 380, k = (t * 0.25 + i * 0.37) % 1;
        return <circle key={i} cx={x0 + k * 90} cy={760 - k * 260} r={24 + k * 50} fill={K.fog} opacity={0.25 * (1 - k)} />;
      })}
    </g>
  );
  if (plane === 'mid') return (
    <g>
      {/* terrace of shops: slate fronts, lamp-lit windows */}
      {[-520, -120, 280, 1100, 1500].map((x, i) => (
        <g key={i}>
          <Sh d={R(x, 640, 380, 900)} fill={i % 2 ? K.slate : K.deep} ht="far" line={3} />
          <Sh d={R(x + 40, 700, 300, 40)} fill={K.deep} line={2} />
          {[0, 1, 2].map((r) => [0, 1].map((c) => {
            const lit = hash(i * 7 + r * 3 + c) > 0.35;
            return <g key={`${r}${c}`}><Sh d={R(x + 50 + c * 160, 780 + r * 190, 120, 140)} fill={lit ? K.lamp : K.deep} line={3} o={lit ? 0.85 + 0.1 * Math.sin(t * 3 + i + r) : 1} />
              {lit && <path d={`M${x + 110 + c * 160},780v140M${x + 50 + c * 160},850h120`} stroke={K.ink} strokeWidth={3} />}</g>;
          }))}
        </g>
      ))}
      {/* telegraph poles and the wire the Spark runs along */}
      {[-260, 540, 1340].map((x, i) => <g key={i}><Sh d={R(x - 9, 470, 18, 1050)} fill={K.deep} line={3} /><Sh d={R(x - 70, 500, 140, 14)} fill={K.deep} line={2} /></g>)}
      {[0, 1].map((j) => <path key={j} d={`M-700,${STREET.wireY(-700) + j * 18}${Array.from({length: 41}).map((_, i) => { const x = -700 + i * 60; return `L${x},${STREET.wireY(x) + j * 18 + Math.sin(t * 0.8 + i * 0.3) * 1.5}`; }).join('')}`} fill="none" stroke={K.ink} strokeWidth={3} />)}
    </g>
  );
  // near: pavement, gas lamp, the playbill wall
  const pb = STREET.playbill;
  const flap = Math.sin(t * 2.6) * 6 + Math.sin(t * 6.1) * 3;
  return (
    <g>
      <Sh d={R(-700, 1500, 2500, 500)} fill={K.slate} ht="far" line={3} />
      <path d={Array.from({length: 26}).map((_, i) => `M${-700 + i * 110},1500l-40,500`).join('')} stroke={K.ink} strokeWidth={2} opacity={0.4} />
      {/* playbill wall */}
      <Sh d={R(560, 760, 540, 740)} fill={K.deep} ht="near" line={4} />
      {Array.from({length: 9}).map((_, r) => <path key={r} d={`M560,${800 + r * 80}h540`} stroke={K.ink} strokeWidth={2} opacity={0.5} />)}
      <g>
        <Sh d={R(pb.x, pb.y, pb.w, pb.h)} fill={K.newsprint} line={4} />
        <text x={pb.x + pb.w / 2} y={pb.y + 62} textAnchor="middle" fontFamily={FONT.period} fontSize={22} fill={K.ink} letterSpacing={3}>TONIGHT · MUSIC HALL</text>
        <text x={pb.x + pb.w / 2} y={pb.y + 130} textAnchor="middle" fontFamily={FONT.display} fontSize={62} fill={K.ink}>BELLE</text>
        <text x={pb.x + pb.w / 2} y={pb.y + 192} textAnchor="middle" fontFamily={FONT.display} fontSize={62} fill={K.ink}>ELMORE</text>
        <text x={pb.x + pb.w / 2} y={pb.y + 232} textAnchor="middle" fontFamily={FONT.period} fontStyle="italic" fontSize={28} fill={K.ink}>(Cora Crippen)</text>
        {/* the little stage picture the camera pushes through */}
        <Sh d={R(pb.x + 50, pb.y + 252, pb.w - 100, 190, 8)} fill={K.deep} line={3} />
        <path d={`M${pb.x + 50},${pb.y + 252}q${(pb.w - 100) / 4},40 ${(pb.w - 100) / 2},0q${(pb.w - 100) / 4},40 ${(pb.w - 100) / 2},0`} fill={K.slate} stroke={K.ink} strokeWidth={2} />
        <path d={`M${pb.x + 180},${pb.y + 300}l-26,120h52z`} fill={K.mist} stroke={K.ink} strokeWidth={2} />
        <circle cx={pb.x + 180} cy={pb.y + 300} r={14} fill={K.skin} stroke={K.ink} strokeWidth={2} />
        <path d={`M${pb.x + 156},${pb.y + 290}q24,-18 48,0z`} fill={K.deep} stroke={K.ink} strokeWidth={2} />
        <path d={`M${pb.x + 198},${pb.y + 284}q12,-40 2,-60`} stroke={K.cora} strokeWidth={6} fill="none" strokeLinecap="round" />
        {Array.from({length: 7}).map((_, i) => {
          const on = footlights > i / 7;
          return <g key={i}><circle cx={pb.x + 70 + i * 37} cy={pb.y + 430} r={7} fill={on ? K.lamp : K.mist} stroke={K.ink} strokeWidth={2} />{on && <Glow x={pb.x + 70 + i * 37} y={pb.y + 425} r={34} o={0.9} />}</g>;
        })}
        {/* a corner that flaps in the night air */}
        <path d={`M${pb.x + pb.w},${pb.y + pb.h - 70}L${pb.x + pb.w - 60 - flap},${pb.y + pb.h + 4}L${pb.x + pb.w},${pb.y + pb.h}z`} fill={K.fog} stroke={K.ink} strokeWidth={3} />
      </g>
      {/* gas lamp */}
      <g transform="translate(110,0)">
        <Sh d={R(-10, 1000, 20, 500)} fill={K.deep} line={3} />
        <Sh d="M-36,940L36,940L26,1000L-26,1000z" fill={K.lamp} line={3} o={0.9 + 0.08 * Math.sin(t * 7) * Math.sin(t * 2.3)} />
        <path d="M-44,940L0,900L44,940z" fill={K.deep} stroke={K.ink} strokeWidth={3} />
        <Glow x={0} y={970} r={230} o={0.6 + 0.08 * Math.sin(t * 7.3)} />
      </g>
    </g>
  );
};

// ---------------- Music-hall stage (L3–L4) ----------------
// proscenium, curtains, footlights, a spotlight cone; audience heads bob in the foreground plane.
export const STAGE = {floor: 1380, spotX: 540};
export const MusicHall: React.FC<{t: number; plane: 'back' | 'house' | 'fore'; spot?: number}> = ({t, plane, spot = 1}) => {
  if (plane === 'back') return (
    <g>
      <rect x={-600} y={-400} width={2300} height={2600} fill={K.deep} />
      {/* back drop: a painted fog-pale London skyline */}
      <path d="M-200,1100L-200,760L0,760L0,700L120,700L120,820L300,820L300,640L360,600L420,640L420,820L640,820L640,720L780,720L780,860L1000,860L1000,700L1120,700L1120,1100z" fill={K.slate} opacity={0.7} />
      {/* curtains: folds with halftone on the shadow side */}
      {[-1, 1].map((s) => (
        <g key={s}>{Array.from({length: 5}).map((_, i) => {
          const x = s < 0 ? -260 + i * 70 : 1040 - i * 70, sway = Math.sin(t * 0.9 + i) * 6;
          return <Sh key={i} d={`M${x},180Q${x + 40 * s + sway},800 ${x + sway},${STAGE.floor}L${x + 80 * s + sway},${STAGE.floor}Q${x + 110 * s},800 ${x + 80 * s},180z`} fill={K.slate} ht="near" line={3} />;
        })}</g>
      ))}
      <Sh d={`M-300,120L1380,120L1380,330Q1220,260 1080,330Q900,250 760,330Q620,250 540,330Q440,250 320,330Q180,250 0,330Q-140,260 -300,330z`} fill={K.slate} ht="near" line={4} />
      <text x={540} y={210} textAnchor="middle" fontFamily={FONT.display} fontSize={64} fill={K.newsprint} letterSpacing={6}>THE MUSIC HALL</text>
      <Sh d={R(-300, STAGE.floor, 1700, 120)} fill={K.slate} line={4} />
      {Array.from({length: 18}).map((_, i) => <path key={i} d={`M${-300 + i * 100},${STAGE.floor}v120`} stroke={K.ink} strokeWidth={2} opacity={0.45} />)}
      {/* spotlight cone from top right */}
      <path d={`M${980},-200L${STAGE.spotX - 330},${STAGE.floor + 40}L${STAGE.spotX + 330},${STAGE.floor + 40}L${1060},-200z`} fill="url(#p1-cone)" opacity={0.55 * spot} transform={`rotate(${Math.sin(t * 0.7) * 1.6},1020,-200)`} />
      <ellipse cx={STAGE.spotX + Math.sin(t * 0.7) * 20} cy={STAGE.floor + 30} rx={330} ry={46} fill={K.lamp} opacity={0.28 * spot} />
    </g>
  );
  if (plane === 'house') return (
    <g>
      {/* footlights along the stage lip */}
      {Array.from({length: 13}).map((_, i) => {
        const x = -60 + i * 100, fl = 0.85 + 0.12 * Math.sin(t * 5 + i * 1.7);
        return <g key={i}><Sh d={`M${x - 26},${STAGE.floor + 120}q26,-44 52,0z`} fill={K.lamp} line={3} o={fl} /><Glow x={x} y={STAGE.floor + 100} r={70} o={0.7 * fl} /></g>;
      })}
      <Sh d={R(-300, STAGE.floor + 120, 1700, 60)} fill={K.deep} line={3} />
    </g>
  );
  // fore: audience heads (mist silhouettes) bobbing, each on its own beat
  return (
    <g>
      {Array.from({length: 9}).map((_, i) => {
        const x = -40 + i * 145 + (i % 2) * 30, bob = Math.sin(t * (2.2 + hash(i) * 1.6) + i * 2) * 10, y = 1740 + (i % 2) * 40 + bob;
        const hat = i % 3;
        return <g key={i} transform={`translate(${x},${y})`}>
          <Sh d={`M-80,200Q-80,40 0,40Q80,40 80,200z`} fill={K.deep} line={4} />
          <Sh d={E(0, 0, 52, 60)} fill={K.deep} line={4} />
          {hat === 0 && <Sh d="M-70,-30L70,-30L50,-50Q0,-110 -50,-50z" fill={K.ink} line={3} />}
          {hat === 1 && <Sh d="M-46,-40L-40,-110L40,-110L46,-40zM-66,-40h132v12h-132z" fill={K.ink} line={3} />}
          {hat === 2 && <path d="M-40,-50q40,-40 80,0" stroke={K.mist} strokeWidth={10} fill="none" />}
        </g>;
      })}
    </g>
  );
};

// ---------------- The ball (L10) ----------------
// a ballroom: tall windows, a chandelier that sways, parquet; dancing couples circle in mist; Clara's balcony box at
// the right with her opera glasses (part-only prop below).
export const BALL = {floor: 1450, box: {x: 860, y: 640}};
export const Ballroom: React.FC<{t: number; plane: 'back' | 'dancers' | 'fore'}> = ({t, plane}) => {
  if (plane === 'back') return (
    <g>
      <rect x={-600} y={-300} width={2300} height={2600} fill={K.slate} />
      <rect x={-600} y={-300} width={2300} height={2600} fill="url(#p1-htf)" />
      {[-140, 160, 460, 760, 1060].map((x, i) => (
        <g key={i}>
          <Sh d={`M${x},1300L${x},560Q${x + 90},440 ${x + 180},560L${x + 180},1300z`} fill={K.deep} line={4} />
          <path d={`M${x + 90},470V1300M${x},900H${x + 180}`} stroke={K.ink} strokeWidth={3} />
          {Array.from({length: 4}).map((_, j) => <circle key={j} cx={x + 30 + hash(i * 5 + j) * 120} cy={600 + hash(i + j * 3) * 600} r={2} fill={K.fog} opacity={0.4 + 0.3 * Math.sin(t * 2 + j)} />)}
        </g>
      ))}
      <Sh d={R(-600, BALL.floor, 2300, 600)} fill={K.mist} ht="far" line={3} />
      {Array.from({length: 30}).map((_, i) => <path key={i} d={`M${-600 + i * 80},${BALL.floor}l${(i - 15) * 18},600`} stroke={K.ink} strokeWidth={2} opacity={0.35} />)}
      {/* chandelier, swaying from the ceiling */}
      <g transform={`rotate(${Math.sin(t * 1.1) * 3},540,-200)`}>
        <path d="M540,-200V300" stroke={K.ink} strokeWidth={4} />
        <Sh d="M380,300Q540,420 700,300L660,360Q540,440 420,360z" fill={K.newsprint} line={4} />
        {Array.from({length: 7}).map((_, i) => {
          const x = 400 + i * 47, y = 330 + Math.sin((i / 6) * Math.PI) * 50;
          return <g key={i}><path d={`M${x},${y}v30`} stroke={K.ink} strokeWidth={3} /><circle cx={x} cy={y + 38} r={7} fill={K.lamp} /><Glow x={x} y={y + 30} r={46} o={0.7 + 0.2 * Math.sin(t * 6 + i)} /></g>;
        })}
        {Array.from({length: 9}).map((_, i) => <path key={i} d={`M${410 + i * 32},${360 + Math.sin((i / 8) * Math.PI) * 40}l${Math.sin(t * 2 + i) * 4},26`} stroke={K.fog} strokeWidth={3} />)}
      </g>
      {/* Clara's box */}
      <Sh d={R(BALL.box.x - 140, BALL.box.y + 120, 420, 140, 10)} fill={K.deep} ht="near" line={4} />
      {Array.from({length: 7}).map((_, i) => <path key={i} d={`M${BALL.box.x - 120 + i * 60},${BALL.box.y + 130}v120`} stroke={K.newsprint} strokeWidth={4} opacity={0.6} />)}
    </g>
  );
  if (plane === 'dancers') return (
    <g>
      {[0, 1, 2].map((i) => {
        const a = t * 1.3 + i * 2.1, cx = 300 + i * 330 + Math.cos(a) * 70, cy = BALL.floor - 10 + Math.sin(a) * 18, s = 0.7 + i * 0.05;
        return <g key={i} transform={`translate(${cx},${cy}) scale(${s})`}><DancingPair t={t + i} /></g>;
      })}
    </g>
  );
  return (
    <g>
      {/* foreground: potted palms and a passing waiter's tray */}
      {[-120, 1180].map((x, i) => <g key={i} transform={`translate(${x},1900)`}>
        {Array.from({length: 6}).map((_, j) => <Sh key={j} d={`M0,0Q${(j - 2.5) * 70},-300 ${(j - 2.5) * 150 + Math.sin(t * 0.8 + j) * 12},-420`} line={14} lineColor={K.deep} />)}
      </g>)}
    </g>
  );
};
// a mist dancing couple: two silhouettes turning together (simple, part-only background extras)
const DancingPair: React.FC<{t: number}> = ({t}) => {
  const tw = Math.sin(t * 2.6);
  return (
    <g>
      <Sh d={`M-70,0Q-110,-140 -40,-260L0,-260Q30,-140 10,0z`} fill={K.mist} line={3} />
      <Sh d={E(-24, -300, 34, 40)} fill={K.mist} line={3} />
      <Sh d={`M0,0Q${-10 + tw * 30},-120 20,-250L60,-250Q90,-120 ${80 + tw * 20},0z`} fill={K.fog} line={3} />
      <Sh d={`M10,-180Q${-20 + tw * 40},-60 ${-60 + tw * 50},0L${150 + tw * 30},0Q100,-60 70,-180z`} fill={K.fog} line={3} />
      <Sh d={E(40, -290, 30, 36)} fill={K.fog} line={3} />
      <path d="M-20,-200Q10,-220 40,-200" stroke={K.ink} strokeWidth={4} fill="none" />
    </g>
  );
};

// ---------------- Albion House office door (L12) ----------------
export const ALBION = {doorX: 540, doorY: 560, doorW: 440, doorH: 940};
export const AlbionDoor: React.FC<{t: number; open: number}> = ({t, open}) => {
  const {doorX: x, doorY: y, doorW: w, doorH: h} = ALBION;
  return (
    <g>
      <rect x={-600} y={-300} width={2300} height={2600} fill={K.slate} />
      <rect x={-600} y={-300} width={2300} height={2600} fill="url(#p1-htf)" />
      <Sh d={R(-600, 1500, 2300, 500)} fill={K.deep} line={3} />
      {/* corridor wainscot */}
      <path d="M-600,1150H1700" stroke={K.ink} strokeWidth={4} />
      {Array.from({length: 14}).map((_, i) => <Sh key={i} d={R(-560 + i * 170, 1190, 130, 260, 6)} line={3} lineColor={K.deep} />)}
      {/* door frame + the room beyond (lamp-warm) */}
      <Sh d={R(x - w / 2 - 30, y - 30, w + 60, h + 30)} fill={K.deep} line={4} />
      <rect x={x - w / 2} y={y} width={w} height={h} fill={K.lamp} opacity={0.55} />
      <Glow x={x} y={y + h * 0.4} r={380} o={0.5} />
      {/* door leaf swings open towards the viewer (scaleX) */}
      <g transform={`translate(${x - w / 2},0) scale(${Math.max(0.04, 1 - open * 0.9)},1) translate(${-(x - w / 2)},0)`}>
        <Sh d={R(x - w / 2, y, w, h)} fill={K.slate} ht="near" line={4} />
        <Sh d={R(x - w / 2 + 40, y + 40, w - 80, 420, 6)} fill={K.fog} line={3} o={0.92} />
        <text x={x} y={y + 210} textAnchor="middle" fontFamily={FONT.display} fontSize={60} fill={K.ink} opacity={0.75}>ALBION</text>
        <text x={x} y={y + 280} textAnchor="middle" fontFamily={FONT.display} fontSize={60} fill={K.ink} opacity={0.75}>HOUSE</text>
        <text x={x} y={y + 340} textAnchor="middle" fontFamily={FONT.period} fontStyle="italic" fontSize={28} fill={K.ink} opacity={0.7}>H. H. Crippen</text>
        <Sh d={R(x - w / 2 + 40, y + 520, w - 80, 360, 6)} line={3} />
        <circle cx={x + w / 2 - 50} cy={y + 520} r={14} fill={K.lamp} stroke={K.ink} strokeWidth={3} />
      </g>
      {/* a wall lamp flickering */}
      <Glow x={x - w / 2 - 170} y={y + 140} r={160} o={0.55 + 0.08 * Math.sin(t * 6.7)} />
      <Sh d={`M${x - w / 2 - 190},${y + 120}h40l-8,50h-24z`} fill={K.lamp} line={3} />
    </g>
  );
};

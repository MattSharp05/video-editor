// Part 3, lines 10-16: Ethel goes free -> the first wireless catch, today's sky -> the twist -> 2007 lab ->
// the tug-of-war -> the Feather's question -> the Feather rises past the captain and the mast Spark to the star.
import React from 'react';
import {Camera, ParallaxLayer} from '../kit/camera';
import {T, FONT} from './tok';
import {B, F, pr, win, lerp, keyv, rnd, inOut, back} from './util';
import {Sh, R, Txt, CourtDoors, Pigeons, ModernSky, ArchiveBox, Glove, TreeScreen, Piece, CaseBox, Expert, Juror} from './props';
import {Word, Fog, Gulls, Motes, Scraps, S} from './scenesA';
import {K} from './K';

// ---------- 9. Ethel goes free: the court doors open on daylight; she walks out; NOT GUILTY; pigeons; the Spark blinks ----------
export const Free: React.FC<S> = ({t, fr}) => {
  const open = pr(t, B.l9 - 0.2, 0.5, inOut);
  const walk = pr(t, B.notguilty - 0.6, 2.6, inOut);
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l9), {x: 540, y: 1000, zoom: 2.2}], [F(B.l9 + 0.9), {x: 540, y: 1000, zoom: 1.0}], [F(B.free), {x: 520, y: 900, zoom: 1.05}],
    [F(B.l10 - 0.6), {x: 580, y: 700, zoom: 1.05}], [F(B.l10), {x: 600, y: 360, zoom: 3.2}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.fog}>
      <ParallaxLayer depth={0.3}>
        <rect x={-800} y={-1600} width={2700} height={4000} fill={T.fog} />
        <circle cx={600} cy={300} r={500} fill="url(#p3-lamp)" opacity={0.5} />
      </ParallaxLayer>
      {/* stone front around the doors */}
      <g transform="translate(540 1000)">
        <Sh d="M-700,-760 h1400 v1500 h-1400 z" fill={T.mist} shade="far" sw={0} />
        <CourtDoors t={t} open={open} />
      </g>
      <g transform={`translate(${lerp(540, 480, walk)} ${lerp(1380, 1560, walk)}) scale(${lerp(0.75, 1, walk)})`} >
        <K.ethelA fr={fr} pose="walk" expr="smallSmile" hair="bob" coat h={640} />
      </g>
      <Word t={t} at={B.ethel2 + 0.1} text="Ethel" x={480} y={900} s={36} out={B.notguilty} />
      <g transform={`translate(${lerp(1300, 880, pr(t, B.notguilty - 0.5, 0.6))} 1560)`}>
        <K.newsboy fr={fr} pose="shout" h={470} facing={-1} />
        <g transform={`translate(-40 -520) rotate(${Math.sin(t * 5) * 3}) scale(0.5)`}><K.dailyWire fr={fr} headline={t > B.notguilty ? 'NOT GUILTY' : ''} w={760} /></g>
      </g>
      <Motes t={t} n={14} seed="fr" col={T.lamp} r={8} x={250} y={300} w={600} h={1200} up={0.4} />
      <Gulls t={t} n={4} y={150} seed="frg" />
      <g transform="translate(540 1650)"><Pigeons t={t} lift={pr(t, B.free - 0.2, 1.6)} n={7} /><g transform="translate(-300 -500)"><Pigeons t={t} lift={0.2 + (t - B.l9) * 0.15} n={5} seed="pg2" /></g></g>
      {/* the Spark blinks in the sky above her */}
      <g transform={`translate(600 360)`} opacity={pr(t, B.free + 0.3, 0.3)}><K.spark fr={fr} size={1 + 0.3 * Math.sin(t * 9)} /></g>
    </Camera>
  );
};

// ---------- 10. One of the first times: the Spark jumps from a little ship to land; pull back to today's sky ----------
export const FirstTime: React.FC<S> = ({t, fr}) => {
  const MX = 300 + K.montrosePts.mastFore[0] * 0.45, MY = 1230 + K.montrosePts.mastFore[1] * 0.45;
  const hop = pr(t, B.wireless - 0.2, 1.2, inOut);
  const today = pr(t, B.catch + 0.1, 1.2, inOut);
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l10), {x: MX, y: MY, zoom: 3.2}], [F(B.l10 + 0.9), {x: 560, y: 900, zoom: 1.15}], [F(B.catch), {x: 540, y: 820, zoom: 1.0}],
    [F(B.l11), {x: 540, y: 700, zoom: 0.62}],
  ];
  // the arc: from the ship's mast (220,1180) to a bowler on the far quay (880,1120)
  const ax = lerp(MX, 880, hop), ay = lerp(MY, 960, hop) - Math.sin(hop * Math.PI) * 420;
  return (
    <Camera fr={fr} keys={keys} background={T.deep}>

      {/* night sea with a little Montrose and the quay */}
      <g>
        <rect x={-600} y={1160} width={2300} height={1400} fill={T.slate} />
        {Array.from({length: 6}, (_, i) => <path key={i} d={`M${-400 + ((t * 30 + i * 300) % 1800)},${1220 + i * 50} q40,-16 80,0 t80,0`} stroke={T.mist} strokeWidth={4} fill="none" />)}
        <K.montrose fr={fr} x={300} y={1230} scale={0.45} lit />
        <Sh d="M760,1160 h500 v-60 h-500 z" fill={T.deep} sw={3} />
        {Array.from({length: 4}, (_, i) => <circle key={'sm' + i} cx={250 + ((t * 20 + i * 30) % 120)} cy={1150 - ((t * 30 + i * 40) % 160)} r={10 + ((t * 30 + i * 40) % 160) / 12} fill={T.mist} opacity={0.5 - ((t * 30 + i * 40) % 160) / 400} />)}
        {[0, 1, 2].map((i) => <g key={'lp' + i}><circle cx={800 + i * 140} cy={1080} r={30} fill="url(#p3-lamp)" opacity={0.6 + 0.3 * Math.sin(t * 7 + i * 2)} /><circle cx={800 + i * 140} cy={1080} r={6} fill={T.lamp} /></g>)}
        <g transform="translate(1000 1100)"><path d={`M0,0 L${Math.cos(t * 1.4) * 500},${-60 + Math.sin(t * 1.4) * 30}`} stroke={T.lamp} strokeWidth={16} opacity={0.3} /></g>
        <Gulls t={t} n={4} y={800} seed="ftg" />
        <g transform="translate(880 1160)"><K.dew fr={fr} pose={t > B.catch ? 'readTelegram' : 'stand'} h={240} feather={1} /></g>
        <g transform="translate(1000 1160)"><K.constable fr={fr} pose="sweepLamp" h={230} facing={-1} /></g>
      </g>
      <path d={`M${MX},${MY} Q550,${600} 880,960`} fill="none" stroke={T.spark} strokeWidth={4} strokeDasharray={`${hop * 1000} 1000`} opacity={0.7 * (1 - today * 0.5)} />
      <g transform={`translate(${today > 0 ? lerp(ax, 540, today) : ax} ${today > 0 ? lerp(ay, 300, today) : ay})`}><K.spark fr={fr} size={1.3 + today * 0.4} /></g>
      <Motes t={t} n={10} seed="ft" col={T.mist} r={8} y={1150} h={600} />
      {today > 0 && (() => {
        const sx = lerp(ax, 540, today), sy = lerp(ay, 300, today);
        return <g>
          <defs><clipPath id="today-iris"><circle cx={sx} cy={sy} r={20 + 3200 * today * today} /></clipPath></defs>
          <g clipPath="url(#today-iris)"><g transform="translate(540 960)"><ModernSky t={t} on={1} /></g></g>
        </g>;
      })()}
      <Word t={t} at={B.wireless} text="wireless" x={550} y={760} s={44} out={B.catch + 0.6} />
      <Word t={t} at={B.catch - 0.2} text="police" x={880} y={860} s={44} out={B.l11 - 0.4} />
      <Word t={t} at={B.catch + 0.6} text="today" x={540} y={1150} s={58} />
    </Camera>
  );
};

// ---------- 11. The twist: the Daily Wire page corkscrews; its dateline spins 1910 -> 2007 ----------
export const Twist: React.FC<S> = ({t, fr}) => {
  const tw = pr(t, B.twist - 0.3, 1.4, inOut);
  const fl = pr(t, B.twist + 0.1, 0.8, inOut);   // the dateline flips like a flip-board: 1910 folds away, 2007 folds in
  const yr = fl < 0.5 ? '1910' : '2007';
  const flipS = Math.abs(Math.cos(fl * Math.PI));
  const keys: [number, Partial<{x: number; y: number; zoom: number; rot: number}>][] = [
    [F(B.l11), {x: 540, y: 960, zoom: 1.3, rot: 0}], [F(B.twist + 0.4), {x: 540, y: 960, zoom: 1.0, rot: 6}], [F(B.l12), {x: 540, y: 960, zoom: 1.6, rot: -2}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.deep}>
      <ParallaxLayer depth={0.3}><ModernSky t={t} on={1 - tw * 0.6} /></ParallaxLayer>
      <g transform="translate(540 960)"><K.dailyWire fr={fr} date={yr} w={660} twist={tw < 1 ? tw : 0} /></g>
      <g transform={`translate(540 760) scale(1 ${Math.max(0.02, flipS)})`} opacity={pr(t, B.l11 + 0.2, 0.3)}>
        <Sh d={R(-250, -130, 500, 170, 10)} fill={T.newsprint} sw={4} />
        <Txt y={10} s={140} f={FONT.head} fill={T.ink}>{yr}</Txt>
      </g>
      <Fog fr={fr} y1={500} y2={1500} />
    </Camera>
  );
};

// ---------- 12-13. The 2007 lab: the trial sample, the family tree, the piece that won't fit; the tug-of-war ----------
export const Lab: React.FC<S> = ({t, fr}) => {
  const lid = pr(t, B.sample - 0.3, 0.7, inOut);
  const glow = pr(t, B.family - 0.6, 0.6);
  // the piece: floats up from the slide to the tree, tries, bounces off (never fits)
  const up = pr(t, B.match - 0.9, 0.9, inOut);
  const bounce = t > B.match ? Math.exp(-(t - B.match) * 3) * Math.abs(Math.sin((t - B.match) * 9)) : 0;
  const tug = t > B.experts ? Math.sin((t - B.experts) * 3.2) : 0;
  const second = pr(t, B.experts - 0.3, 0.6, back);
  const box = pr(t, B.reopened - 0.6, 0.6, back);
  const px = lerp(300, 610, up) + tug * 60, py = lerp(1360, 920, up) - bounce * 80 + (t > B.experts ? 140 * pr(t, B.experts, 0.5) : 0);
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l12), {x: 540, y: 1180, zoom: 1.6}], [F(B.l12 + 0.7), {x: 380, y: 1420, zoom: 1.25}], [F(B.family - 1.0), {x: 520, y: 1220, zoom: 1.0}],
    [F(B.match + 0.6), {x: 560, y: 1100, zoom: 1.12}], [F(B.experts), {x: 560, y: 1240, zoom: 0.95}], [F(B.reopened), {x: 600, y: 1300, zoom: 1.0}],
    [F(B.l14), {x: 560, y: 1220, zoom: 1.08}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.fog}>
      <rect x={-600} y={-600} width={2300} height={3200} fill={T.fog} />
      {Array.from({length: 7}, (_, i) => <rect key={i} x={-300 + i * 260} y={300} width={6} height={1100} fill={T.mist} opacity={0.6} />)}
      {/* lab bench */}
      <Sh d="M-200,1400 h1500 v60 h-1500 z" fill={T.slate} sw={3} />
      <Sh d="M-200,1460 h1500 v600 h-1500 z" fill={T.mist} sw={0} shade="far" />
      {/* bubbling flasks and a blinking machine: background life */}
      {[60, 980].map((x, k) => <g key={k} transform={`translate(${x} 1400)`}><Sh d="M-30,0 Q-60,-60 -16,-110 V-160 H16 V-110 Q60,-60 30,0 Z" fill={T.mist} sw={3} />
        {Array.from({length: 4}, (_, i) => <circle key={i} cx={(i - 1.5) * 10} cy={-30 - ((t * 60 + i * 30 + k * 17) % 100)} r={5} fill={T.fog} stroke={T.ink} strokeWidth={1.5} />)}</g>)}
      <g transform="translate(860 1400)"><Sh d={R(-60, -120, 120, 120, 8)} fill={T.slate} sw={3} />{[0, 1, 2].map((i) => <circle key={i} cx={-30 + i * 30} cy={-80} r={8} fill={Math.sin(t * 4 + i * 2) > 0 ? T.spark : T.deep} opacity={0.8} />)}</g>
      {/* the screen with the family tree; Cora's cameo at the top */}
      <g transform="translate(560 760)"><TreeScreen t={t} glow={glow} cameo={<K.coraCameo fr={fr} />} /></g>
      {/* the archive box and the gloved hand */}
      <g transform="translate(320 1380)"><ArchiveBox lid={lid} /></g>
      <g transform={`translate(${lerp(-60, 150, pr(t, B.l12 + 0.3, 0.6))} ${1300 - lid * 60})`}><Glove rot={-20 + lid * 10} /></g>
      {/* the jigsaw piece (it never clicks in) */}
      <g transform={`translate(${px} ${py}) rotate(${bounce * 30 + tug * 10})`} opacity={up > 0 ? 1 : 0}><Piece /></g>
      {t > B.match && t < B.experts + 0.5 && <Word t={t} at={B.match + 0.1} text="no match?" x={830} y={1130} s={36} out={B.experts + 0.4} />}
      {/* the two experts tug it (no one wins) */}
      <Word t={t} at={B.wrong - 0.2} text="maybe wrong?" x={800} y={1080} s={32} out={B.reopened + 0.3} />
      <Word t={t} at={B.reopened + 0.1} text="never reopened" x={760} y={1180} s={40} out={B.l14} />
      <g transform={`translate(${lerp(1400, 960, second)} 1600)`}><Expert t={t} kind="cardigan" arm={200 + tug * 8} mouth={Math.abs(Math.sin(t * 7))} facing={1} /></g>
      <g transform={`translate(${lerp(-300, 140, pr(t, B.experts - 0.2, 0.6, back))} 1600)`} opacity={pr(t, B.experts - 0.3, 0.3)}><Expert t={t} kind="lab" arm={-20 - tug * 8} mouth={Math.abs(Math.sin(t * 6 + 1))} /></g>
      {t > B.experts && Array.from({length: 5}, (_, i) => {
        const k = ((t - B.experts) * (0.5 + i * 0.12) + i * 0.2) % 1;
        return <g key={'pp' + i} transform={`translate(${560 + (i - 2) * 120 + Math.sin(t * 3 + i) * 60} ${1250 - k * 700}) rotate(${t * (90 + i * 30)}) scale(${Math.cos(t * 4 + i)} 1)`} opacity={1 - k}>
          <Sh d={R(-34, -24, 68, 48, 3)} fill={T.newsprint} sw={2} /></g>;
      })}
      <Motes t={t} n={12} seed="lb" col={T.newsprint} r={8} y={300} h={1100} />
      {/* the closed case */}
      <g transform={`translate(780 ${lerp(1900, 1310, box)}) scale(0.7)`}><CaseBox t={t} yawn={pr(t, B.reopened + 0.3, 0.6) * (1 - pr(t, B.reopened + 1.2, 0.5))} /></g>
      <Word t={t} at={B.sample} text="tiny sample" x={330} y={1170} s={40} out={B.match} />
    </Camera>
  );
};

// ---------- 14. Did the doctor do it? The Feather curls into a question mark, the Moustache perches on its dot;
// the jury nods yes (left), the experts still argue (right) ----------
export const Question: React.FC<S> = ({t, fr}) => {
  const curl = pr(t, B.l14 - 0.2, 1.0, inOut);
  const perch = pr(t, B.didhe + 0.8, 0.6, inOut);
  const nod = t > B.yes - 0.2 && t < B.argue ? 1 : 0;
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l14), {x: 560, y: 1000, zoom: 1.08}], [F(B.l14 + 0.8), {x: 540, y: 900, zoom: 1.0}], [F(B.argue), {x: 540, y: 880, zoom: 1.1}],
    [F(B.l15), {x: 540, y: 800, zoom: 1.2}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.deep}>
      <ParallaxLayer depth={0.3}><rect x={-800} y={-800} width={2700} height={3600} fill={T.deep} />
        {Array.from({length: 40}, (_, i) => <circle key={i} cx={(rnd('q' + i) - 0.3) * 1600} cy={(rnd('qy' + i)) * 2000} r={2} fill={T.fog} opacity={0.3 + 0.3 * Math.sin(t * 2 + i)} />)}</ParallaxLayer>
      <g opacity={0.6}><Scraps t={t} n={5} seed="qs" /></g>
      {/* a round lamp-lit floor of the story: jury left, experts right */}
      <ellipse cx={540} cy={1500} rx={760} ry={200} fill={T.slate} />
      <g transform="translate(200 1430)">{Array.from({length: 4}, (_, i) => <Juror key={i} x={-90 + i * 60} y={(i % 2) * 30} s={0.8} nod={nod * Math.max(0, Math.sin(t * 7 + i))} seed={'qj' + i} />)}
        <g opacity={win(t, B.yes, B.l15 - 0.2)}><Word t={t} at={B.yes} text="jury: yes" x={40} y={-360} s={38} /></g></g>
      <Word t={t} at={B.argue} text="still arguing" x={740} y={1070} s={38} />
      <g transform="translate(880 1520) scale(0.62)"><Expert t={t} kind="lab" arm={-60 + Math.sin(t * 5) * 20} mouth={Math.abs(Math.sin(t * 8))} facing={-1} /></g>
      <g transform="translate(1000 1530) scale(0.6)"><Expert t={t} kind="cardigan" arm={240 + Math.sin(t * 5 + 2) * 20} mouth={Math.abs(Math.sin(t * 7 + 1))} facing={-1} /></g>
      <g transform={`translate(560 ${900 + Math.sin(t * 2) * 12})`}>
        <K.feather fr={fr} state="curlToQuestion" curl={curl} size={2.2} />
        {/* the Moustache flies in and perches on the dot, tilting its "head" */}
        <g transform={`translate(${lerp(-500, 0, perch)} ${lerp(-300, 46 * 2.2 - 18 * 2.2 - 38, perch)}) rotate(${Math.sin(t * 2.5) * 12 * perch})`}>
          <K.moustache fr={fr} state={perch < 1 ? 'fly' : 'perch'} size={0.95} />
        </g>
      </g>
    </Camera>
  );
};

// ---------- 15. The Feather rises: past the sharp-eyed captain (telescope, hunch bulb), past the mast Spark leaping its
// gap (a message sent through the air), up to the star over London; its tip touches the star. End card. ----------
export const Rise: React.FC<S> = ({t, fr}) => {
  // world: tall column; the Feather rises from y 2400 to y -2600
  const k = pr(t, B.l15 - 0.2, B.end - B.l15 + 0.2, inOut);
  const STAR = -2900, fs = lerp(1.6, 0.7, k);
  const fy = Math.max(lerp(2300, -2560, k), STAR + 300 * fs - 30);   // the tip reaches the star
  const bulb = pr(t, B.captain + 0.2, 0.2);
  const gap = t > B.message - 0.1 && t < B.air + 0.6;
  const keys: [number, Partial<{x: number; y: number; zoom: number}>][] = [
    [F(B.l15 - 0.2), {x: 540, y: 1960, zoom: 1.2}], [F(B.captain), {x: 540, y: 980, zoom: 1.0}], [F(B.message), {x: 540, y: -260, zoom: 1.0}],
    [F(B.end), {x: 540, y: -2220, zoom: 1.0}], [F(B.total), {x: 540, y: -2260, zoom: 1.02}],
  ];
  return (
    <Camera fr={fr} keys={keys} background={T.deep}>
      {/* sky gradient up the column: dusk at sea -> night over London */}
      <rect x={-600} y={-3400} width={2300} height={6400} fill={T.deep} />
      <rect x={-600} y={400} width={2300} height={2600} fill={T.slate} opacity={0.6} />
      {Array.from({length: 90}, (_, i) => <circle key={i} cx={(rnd('rs' + i) - 0.25) * 1600} cy={-3200 + rnd('ry' + i) * 3600} r={1.5 + rnd('rr' + i) * 2} fill={T.fog} opacity={0.25 + 0.35 * Math.abs(Math.sin(t * 1.5 + i))} />)}
      {/* sea at the bottom; the captain on the bridge wing with his telescope; the hunch bulb */}
      <rect x={-600} y={1700} width={2300} height={1400} fill={T.deep} />
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M${-300 + ((t * 40 + i * 330) % 1700)},${1760 + i * 60} q40,-16 80,0 t80,0`} stroke={T.mist} strokeWidth={4} fill="none" />)}
      <Sh d="M-200,1520 h700 v80 h-700 z" fill={T.newsprint} sw={3} />
      <g transform="translate(260 1520)"><K.kendall fr={fr} pose="telescope" h={640} /></g>
      <g transform={`translate(260 ${760 + Math.sin(t * 3) * 6})`}><K.hunchBulb fr={fr} at={F(B.captain + 0.2)} size={1.4} /></g>
      <Word t={t} at={B.captain} text="Captain Kendall" x={600} y={1180} s={32} out={B.message} />
      {/* the mast with the aerial wire and the spark gap leaping */}
      <path d="M860,1520 V-300 M200,1520 V-200 M200,-200 L860,-300" stroke={T.ink} strokeWidth={8} />
      {[0.2, 0.4, 0.6, 0.8].map((q, i) => <path key={'fl' + i} d={`M${200 + 660 * q},${-200 - 100 * q} l${-10 + Math.sin(t * 5 + i) * 8},34 l20,0 z`} fill={i % 2 ? T.newsprint : T.mist} stroke={T.ink} strokeWidth={2} />)}
      {Array.from({length: 6}, (_, i) => { const q = ((t * 0.35 + i / 6) % 1); return <ellipse key={'sm' + i} cx={520 - q * 260} cy={700 - q * 900} rx={50 + q * 90} ry={34 + q * 50} fill={T.mist} stroke={T.ink} strokeWidth={3} opacity={0.75 * (1 - q)} />; })}
      <path d="M860,1520 V-300" stroke={T.slate} strokeWidth={4} />
      <g transform="translate(860 -320)">
        <circle cx={-26} r={12} fill={T.newsprint} stroke={T.ink} strokeWidth={3} /><circle cx={26} r={12} fill={T.newsprint} stroke={T.ink} strokeWidth={3} />
        {gap && <path d={`M-14,0 L-4,${-10 + (fr % 3) * 6} L4,${8 - (fr % 2) * 12} L14,0`} stroke={T.spark} strokeWidth={5} fill="none" />}
      </g>
      {/* the message: a spark trail from the mast up into the sky (the star) */}
      <path d="M860,-320 Q900,-1500 560,-2900" fill="none" stroke={T.spark} strokeWidth={4} strokeDasharray={`${pr(t, B.message, 1.6, inOut) * 2200} 2200`} opacity={0.65} />
      <Word t={t} at={B.message + 0.1} text="message" x={760} y={-120} s={32} out={B.end - 0.4} />
      {/* London at night, far below the star */}
      <g transform="translate(540 -1900)">
        {Array.from({length: 10}, (_, i) => <Sh key={i} d={R(-620 + i * 130, -140 - (i % 3) * 70, 110, 400)} fill={T.slate} sw={2} shade="far" op={0.7} />)}
        {Array.from({length: 14}, (_, i) => <rect key={'w' + i} x={-590 + i * 90} y={-90 + (i % 3) * 40} width={20} height={26} fill={T.lamp} opacity={Math.sin(t * 0.7 + i * 2.3) > -0.3 ? 0.8 : 0.2} />)}
      </g>
      {/* the star (the same Spark as part 1's frame 0) */}
      <g transform="translate(560 -2900)"><K.spark fr={fr} mode="star" size={1.6 + 0.3 * Math.sin(t * 7)} /></g>
      {/* the Feather rising (uncurled), tip up */}
      <g transform={`translate(${560 + Math.sin(t * 1.8) * 40 * (1 - k)} ${fy}) rotate(${Math.sin(t * 1.6) * 8 * (1 - k)})`}>
        <K.feather fr={fr} state="float" size={fs} />
      </g>
      <Gulls t={t} n={5} y={1100} seed="rg" />
      <Gulls t={t} n={4} y={-700} seed="rg2" />
      <Gulls t={t} n={4} y={300} seed="rg3" />
      <Motes t={t} n={16} seed="rs" col={T.fog} r={7} x={0} y={-3000} w={1080} h={4600} up={-0.6} />
    </Camera>
  );
};

// Part-only props and sets for part 3 (pictures-pick §3.2/§3.3 PART-ONLY P3), drawn in the kit's style:
// tokens only, ink line, halftone shadow side, misregistered fill (+3,+2), no drop shadows. Each draws around (0,0).
import React from 'react';
import {T, FONT} from './tok';
import {rnd, lerp} from './util';

// ---- style primitives (thin wrappers; the halftone pattern ids come from Defs3) ----
export const HT = 'url(#p3-ht)';
export const HTF = 'url(#p3-htf)';
export const Defs3: React.FC = () => (
  <defs>
    <pattern id="p3-ht" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx={4.5} cy={4.5} r={2.2} fill={T.ink} opacity={0.35} />
    </pattern>
    <pattern id="p3-htf" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx={3.5} cy={3.5} r={1.4} fill={T.ink} opacity={0.25} />
    </pattern>
    <radialGradient id="p3-lamp"><stop offset="0" stopColor={T.lamp} stopOpacity={0.75} /><stop offset="1" stopColor={T.lamp} stopOpacity={0} /></radialGradient>
    <linearGradient id="p3-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={T.lamp} stopOpacity={0.55} /><stop offset="1" stopColor={T.lamp} stopOpacity={0} /></linearGradient>
  </defs>
);
// a shape: misregistered fill, halftone shade, ink line
export const Sh: React.FC<{d: string; fill: string; sw?: number; shade?: boolean | 'far'; line?: string; op?: number}> = ({d, fill, sw = 3, shade, line = T.ink, op}) => (
  <g opacity={op}>
    <path d={d} fill={fill} transform="translate(3 2)" />
    {shade && <path d={d} fill={shade === 'far' ? HTF : HT} transform="translate(3 2)" />}
    {sw > 0 && <path d={d} fill="none" stroke={line} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />}
  </g>
);
export const R = (x: number, y: number, w: number, h: number, r = 0) =>
  r ? `M${x + r},${y}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-w + 2 * r}a${r},${r} 0 0 1 ${-r},${-r}v${-h + 2 * r}a${r},${r} 0 0 1 ${r},${-r}z`
    : `M${x},${y}h${w}v${h}h${-w}z`;
// slightly wobbly rectangle (pre-wobbled, deterministic)
export const WR = (x: number, y: number, w: number, h: number, seed: string, a = 2.5) => {
  const j = (k: string) => (rnd(seed + k) - 0.5) * a * 2;
  return `M${x + j('a')},${y + j('b')} L${x + w + j('c')},${y + j('d')} L${x + w + j('e')},${y + h + j('f')} L${x + j('g')},${y + h + j('h')} Z`;
};
const Txt: React.FC<{x?: number; y?: number; s: number; f?: string; fill?: string; w?: number; a?: 'middle' | 'start' | 'end'; ls?: number; it?: boolean; children: React.ReactNode}> =
  ({x = 0, y = 0, s, f = FONT.period, fill = T.ink, w = 400, a = 'middle', ls = 0, it, children}) => (
    <text x={x} y={y} fontFamily={f} fontSize={s} fill={fill} fontWeight={w} textAnchor={a} letterSpacing={ls} fontStyle={it ? 'italic' : undefined}>{children}</text>
  );
export {Txt};

// clue ring (part copy until the kit's ClueRing is adopted): draws on over p 0..1
export const Ring3: React.FC<{r: number; p: number; rx?: number}> = ({r, p, rx}) => {
  const L = 2 * Math.PI * r;
  return <ellipse rx={rx ?? r} ry={r} fill="none" stroke={T.clue} strokeWidth={4.5} strokeDasharray={`${L * p} ${L}`} transform="rotate(-80)" strokeLinecap="round" />;
};

// ---------------- the Old Bailey outside: dome, gilded Justice with scales, carved name ----------------
export const BaileyOutside: React.FC<{t: number; scalesTilt?: number}> = ({t, scalesTilt = 0}) => (
  <g>
    {/* drum and dome */}
    <Sh d="M-330,520 h660 v-260 h-660 z" fill={T.mist} shade="far" />
    {Array.from({length: 9}, (_, i) => <Sh key={i} d={R(-300 + i * 70, 300, 26, 200)} fill={T.fog} sw={2.5} />)}
    <Sh d="M-260,260 Q-260,-110 0,-150 Q260,-110 260,260 Z" fill={T.slate} shade />
    {[-150, -60, 60, 150].map((x, i) => <path key={i} d={`M${x},250 Q${x * 0.75},-40 0,-145`} stroke={T.ink} strokeWidth={2.5} fill="none" opacity={0.7} />)}
    <Sh d="M-46,-140 h92 v-90 h-92 z" fill={T.mist} />
    <Sh d="M-56,-230 h112 l-56,-40 z" fill={T.slate} />
    {/* Justice: gilded (lamp-lit newsprint + halftone), arms out, sword down, scales in her left hand */}
    <g transform="translate(0 -300)">
      <Sh d="M-26,30 Q-30,-40 0,-60 Q30,-40 26,30 Z" fill={T.newsprint} shade />
      <circle cy={-78} r={18} fill={T.newsprint} stroke={T.ink} strokeWidth={2.5} />
      <path d="M-20,-48 L-120,-70 M20,-48 L120,-70" stroke={T.ink} strokeWidth={7} strokeLinecap="round" />
      <path d="M-20,-48 L-120,-70 M20,-48 L120,-70" stroke={T.newsprint} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M-124,-70 v80" stroke={T.ink} strokeWidth={4} />
      <g transform={`translate(124 -70) rotate(${scalesTilt + Math.sin(t * 1.8) * 4})`}>
        <path d="M-50,0 h100" stroke={T.ink} strokeWidth={4} />
        {[-50, 50].map((x) => <g key={x}><path d={`M${x},0 l-20,46 M${x},0 l20,46`} stroke={T.ink} strokeWidth={2} /><Sh d={`M${x - 26},46 q26,18 52,0 z`} fill={T.newsprint} sw={2.5} /></g>)}
      </g>
      <circle cy={-78} r={60} fill="url(#p3-lamp)" opacity={0.6} />
    </g>
    {/* the building front */}
    <Sh d="M-520,520 h1040 v700 h-1040 z" fill={T.slate} shade />
    <Sh d="M-540,520 h1080 v-40 h-1080 z" fill={T.mist} />
    <Sh d="M-300,560 h600 v90 h-600 z" fill={T.mist} sw={2.5} />
    <Txt y={628} s={62} f={FONT.head} fill={T.deep} ls={8}>OLD BAILEY</Txt>
    {[-420, -260, 260, 420].map((x, i) => <Sh key={i} d={R(x - 50, 700, 100, 180, 50)} fill={T.lamp} sw={3} op={0.9} />)}
    <Sh d={R(-110, 720, 220, 500)} fill={T.deep} />
    {[-480, 480].map((x, i) => <Sh key={i} d={R(x - 30, 520, 60, 700)} fill={T.mist} sw={2.5} />)}
  </g>
);

// ---------------- Court No. 1 (inside): bench + judge, jury box, dock, gallery, lamp ----------------
// lean 0..1: jury leans together (one wave); foreman 0..1 stands; dim 0..1 the lamp softens
export const Juror: React.FC<{x: number; y: number; s?: number; lean?: number; nod?: number; seed: string; hat?: boolean}> = ({x, y, s = 1, lean = 0, nod = 0, seed, hat}) => {
  const h = 0.9 + rnd(seed + 'h') * 0.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean * 9})`}>
      <Sh d={`M-34,0 Q-36,${-70 * h} 0,${-78 * h} Q36,${-70 * h} 34,0 Z`} fill={T.mist} sw={2.5} shade="far" />
      <g transform={`translate(0 ${-98 * h + nod * 8})`}>
        <circle r={22} fill={T.mist} stroke={T.ink} strokeWidth={2.5} />
        {hat ? <path d="M-24,-10 h48 v-6 h-10 v-18 h-28 v18 h-10z" fill={T.deep} /> : <path d={`M-20,-8 q20,${-22 - rnd(seed) * 6} 40,0`} fill={T.deep} />}
        <circle cx={-7} cy={2} r={2.4} fill={T.ink} /><circle cx={7} cy={2} r={2.4} fill={T.ink} />
      </g>
    </g>
  );
};
export const Court: React.FC<{t: number; lean?: number; foreman?: number; dim?: number; nod?: number; judge?: boolean}> = ({t, lean = 0, foreman = 0, dim = 0, nod = 0, judge = true}) => (
  <g>
    {/* panelled walls */}
    <rect x={-700} y={-900} width={1400} height={2000} fill={T.slate} />
    {Array.from({length: 12}, (_, i) => <Sh key={i} d={WR(-660 + i * 112, -560, 92, 640, 'wp' + i)} fill={T.deep} sw={2} shade="far" op={0.55} />)}
    {/* the lamp */}
    <g transform={`translate(0 ${-640 + Math.sin(t * 1.3) * 4})`}>
      <path d="M0,-300 V-30" stroke={T.ink} strokeWidth={3} />
      <Sh d="M-60,0 Q0,-60 60,0 Z" fill={T.mist} sw={2.5} />
      <circle r={420 * (1 - dim * 0.35)} fill="url(#p3-lamp)" opacity={0.85 - dim * 0.45} />
    </g>
    {/* judge's high bench */}
    <Sh d="M-260,-300 h520 v260 h-520 z" fill={T.deep} shade />
    {judge && <g transform="translate(0 -300)">
      <Sh d="M-70,0 Q-74,-120 0,-130 Q74,-120 70,0 Z" fill={T.deep} />
      {/* long wig (silhouette), no props in hand */}
      <Sh d="M-46,-140 Q-52,-220 0,-230 Q52,-220 46,-140 Q54,-90 34,-80 L-34,-80 Q-54,-90 -46,-140 Z" fill={T.fog} sw={2.5} shade="far" />
      <circle cy={-160} r={26} fill={T.skin} stroke={T.ink} strokeWidth={2.5} />
      <circle cx={-9} cy={-160} r={2.6} fill={T.ink} /><circle cx={9} cy={-160} r={2.6} fill={T.ink} />
    </g>}
    <Sh d="M-280,-60 h560 v24 h-560 z" fill={T.mist} sw={2.5} />
    {/* jury box (left): two rows of six that lean as one wave; the foreman (front left) stands */}
    <g transform="translate(-380 220)">
      {Array.from({length: 6}, (_, i) => <Juror key={'b' + i} x={-150 + i * 62} y={-40} s={0.7} lean={lean * Math.min(1, (t * 2 + i) % 6 > -1 ? 1 : 0)} nod={nod * Math.max(0, Math.sin(t * 6 + i))} seed={'jb' + i} />)}
      {Array.from({length: 6}, (_, i) => (i === 0 ? null : <Juror key={'f' + i} x={-170 + i * 66} y={40} s={0.78} lean={lean} nod={nod * Math.max(0, Math.sin(t * 6 + i + 2))} seed={'jf' + i} />))}
      <Juror x={-170} y={40 - foreman * 60} s={0.78} lean={lean * (1 - foreman)} seed="foreman" nod={nod * Math.max(0, Math.sin(t * 6))} />
      <Sh d="M-220,40 h420 v120 h-420 z" fill={T.deep} shade />
      <Txt x={-10} y={110} s={28} fill={T.mist} ls={4}>JURY</Txt>
    </g>
    {/* gallery heads (right, far) */}
    <g transform="translate(380 -130)">
      <Sh d="M-200,40 h400 v60 h-400 z" fill={T.deep} />
      {Array.from({length: 6}, (_, i) => <g key={i} transform={`translate(${-170 + i * 66} ${30 + Math.sin(t * 2 + i * 1.7) * 3})`}><circle r={20} fill={T.mist} stroke={T.ink} strokeWidth={2} /><path d="M-22,-6 h44 v-6 h-44z" fill={T.deep} /></g>)}
    </g>
  </g>
);
// the dock rail (in front of the prisoner): drawn after the figure
export const DockRail: React.FC = () => (
  <g>
    <Sh d="M-200,0 h400 v160 h-400 z" fill={T.deep} shade />
    <path d="M-200,-110 h400" stroke={T.ink} strokeWidth={9} strokeLinecap="round" />
    <path d="M-200,-110 h400" stroke={T.mist} strokeWidth={4} strokeLinecap="round" />
    {Array.from({length: 9}, (_, i) => <path key={i} d={`M${-200 + i * 50},-110 v110`} stroke={T.ink} strokeWidth={4} />)}
    <Txt y={90} s={30} fill={T.mist} ls={5}>DOCK</Txt>
  </g>
);

// ---------------- the scales of Justice over the court (huge): tilt in degrees (+ = right pan down) ----------------
export const Scales: React.FC<{t: number; tilt: number; left?: React.ReactNode; right?: React.ReactNode}> = ({t, tilt, left, right}) => {
  const a = tilt + Math.sin(t * 1.4) * 1.2, rad = (a * Math.PI) / 180, arm = 330;
  const lp: [number, number] = [-arm * Math.cos(rad), -arm * Math.sin(rad)], rp: [number, number] = [arm * Math.cos(rad), arm * Math.sin(rad)];
  const pan = (p: [number, number], k: string, kid: React.ReactNode) => (
    <g key={k} transform={`translate(${p[0]} ${p[1]})`}>
      <path d="M0,0 L-110,260 M0,0 L110,260 M0,0 L0,260" stroke={T.ink} strokeWidth={3} opacity={0.85} />
      <g transform="translate(0 250)">{kid}</g>
      <Sh d="M-130,260 Q0,330 130,260 Z" fill={T.newsprint} shade sw={3.5} />
    </g>
  );
  return (
    <g>
      <path d="M0,-600 V0" stroke={T.ink} strokeWidth={12} />
      <path d="M0,-600 V0" stroke={T.newsprint} strokeWidth={6} />
      <circle r={22} fill={T.newsprint} stroke={T.ink} strokeWidth={3} />
      <g transform={`rotate(${a})`}><Sh d={R(-arm - 10, -9, 2 * arm + 20, 18, 9)} fill={T.newsprint} shade sw={3} /></g>
      {pan(lp, 'l', left)}{pan(rp, 'r', right)}
    </g>
  );
};

// ---------------- evidence (never opened, never poured, nothing under anything) ----------------
export const DrugBottle: React.FC<{ring?: number}> = ({ring = 0}) => (
  <g>
    <Sh d="M-46,-10 Q-48,-120 -26,-130 V-170 H26 V-130 Q48,-120 46,-10 Z" fill={T.slate} shade sw={3.5} />
    <Sh d={R(-30, -196, 60, 30, 6)} fill={T.deep} />
    <Sh d={R(-40, -104, 80, 64, 4)} fill={T.newsprint} sw={2.5} />
    <rect x={-40} y={-104} width={80} height={64} fill="none" stroke={T.clue} strokeWidth={3} rx={4} />
    <Txt y={-64} s={17} w={700}>Hyoscine</Txt>
    {ring > 0 && <g transform="translate(0 -72)"><Ring3 r={66} rx={78} p={ring} /></g>}
  </g>
);
export const ReportCard: React.FC<{text?: string}> = ({text = 'Drug found'}) => (
  <g>
    <Sh d={WR(-170, -110, 340, 220, 'rc')} fill={T.newsprint} sw={3} />
    <Txt y={-50} s={26} it>Report</Txt>
    <path d="M-130,-30 h260" stroke={T.ink} strokeWidth={2} />
    <Txt y={30} s={46} f={FONT.head}>{text}</Txt>
    {[60, 84].map((y) => <path key={y} d={`M-120,${y} h${y === 84 ? 160 : 240}`} stroke={T.ink} strokeWidth={3} opacity={0.4} />)}
  </g>
);
// the bearded 1910 scientist (part-only figure; head and shoulders, holding up the card with one hand)
export const Scientist1910: React.FC<{t: number; raise: number}> = ({t, raise}) => (
  <g>
    <Sh d="M-130,260 Q-140,40 0,20 Q140,40 130,260 Z" fill={T.newsprint} shade sw={4} />
    <path d="M-30,30 L0,110 L30,30" fill={T.slate} stroke={T.ink} strokeWidth={3} />
    <g transform={`translate(0 ${-40 + Math.sin(t * 2) * 2})`}>
      <Sh d="M-56,-20 Q-60,-120 0,-124 Q60,-120 56,-20 Q50,40 0,48 Q-50,40 -56,-20 Z" fill={T.skin} sw={4} />
      <Sh d="M-56,-10 Q-50,90 0,96 Q50,90 56,-10 Q30,20 0,18 Q-30,20 -56,-10 Z" fill={T.fog} shade="far" sw={3.5} />
      <path d="M-24,-46 h14 M10,-46 h14" stroke={T.ink} strokeWidth={4} strokeLinecap="round" />
      <circle cx={-17} cy={-30} r={4} fill={T.ink} /><circle cx={17} cy={-30} r={4} fill={T.ink} />
      <path d="M-46,-90 Q0,-140 46,-90" stroke={T.mist} strokeWidth={10} fill="none" strokeLinecap="round" />
    </g>
    <path d={`M100,120 Q${150 + raise * 20},${40 - raise * 120} ${150 + raise * 10},${-30 - raise * 210}`} stroke={T.ink} strokeWidth={36} fill="none" strokeLinecap="round" />
    <path d={`M100,120 Q${150 + raise * 20},${40 - raise * 120} ${150 + raise * 10},${-30 - raise * 210}`} stroke={T.newsprint} strokeWidth={28} fill="none" strokeLinecap="round" />
  </g>
);
// the chemist's window in winter (snow falling past it)
export const ChemistWindow: React.FC<{t: number}> = ({t}) => (
  <g>
    <Sh d="M-280,-260 h560 v520 h-560 z" fill={T.slate} shade sw={4} />
    <Sh d="M-260,-250 h520 v80 h-520 z" fill={T.deep} />
    <Txt y={-196} s={40} f={FONT.head} fill={T.newsprint} ls={2}>LEWIS &amp; BURROWS</Txt>
    <Sh d="M-230,-150 h460 v370 h-460 z" fill={T.lamp} sw={3} op={0.9} />
    {/* tall chemist's jars in the window */}
    {[-150, 0, 150].map((x, i) => <g key={i} transform={`translate(${x} 200)`}><Sh d="M-40,0 Q-50,-120 -20,-150 V-180 H20 V-150 Q50,-120 40,0 Z" fill={[T.mist, T.fog, T.mist][i]} sw={3} shade="far" /></g>)}
    <path d="M-230,30 h460 M0,-150 v370" stroke={T.ink} strokeWidth={5} />
    {/* snow */}
    {Array.from({length: 40}, (_, i) => {
      const x = -320 + ((rnd('sn' + i) * 640 + Math.sin(t * 1.3 + i) * 16) % 640);
      const y = -300 + ((rnd('sy' + i) * 600 + t * (50 + rnd('sv' + i) * 40)) % 600);
      return <circle key={i} cx={x} cy={y} r={3 + rnd('sr' + i) * 3} fill={T.newsprint} opacity={0.85} />;
    })}
  </g>
);
// the poisons book: pages flip (flip 0..1 over the last page), one line in clue
export const PoisonsBook: React.FC<{t: number; flip: number; ring?: number}> = ({t, flip, ring = 0}) => {
  const lines = ['Morphia · Mr. A. Bell', 'Arsenic (rats) · J. Tate', 'Laudanum · Mrs. Poole', 'Hyoscine · H. H. Crippen', 'Strychnine · F. Lowe'];
  return (
    <g>
      <Sh d="M-300,-200 Q0,-230 300,-200 V200 Q0,170 -300,200 Z" fill={T.newsprint} sw={3.5} />
      <path d="M0,-216 V186" stroke={T.ink} strokeWidth={3} />
      <Txt x={-150} y={-150} s={30} it>Poisons</Txt>
      {lines.map((l, i) => (
        <g key={i}>
          <Txt x={20} y={-140 + i * 62} s={24} a="start" w={i === 3 ? 700 : 400}>{l}</Txt>
          <path d={`M20,${-128 + i * 62} h260`} stroke={T.ink} strokeWidth={1.5} opacity={0.35} />
        </g>
      ))}
      <rect x={14} y={-140 + 3 * 62 - 30} width={270} height={42} fill="none" stroke={T.clue} strokeWidth={3} rx={6} opacity={ring > 0 ? 1 : 0} strokeDasharray={`${ring * 640} 640`} />
      {[0, 1, 2].map((k) => {
        const p = Math.min(1, Math.max(0, flip * 3 - k));
        if (p <= 0 || p >= 1) return null;
        return <path key={k} d={`M0,-210 Q${300 * Math.cos(p * Math.PI)},-240 ${300 * Math.cos(p * Math.PI)},-200 V200 Q${150 * Math.cos(p * Math.PI)},170 0,186 Z`} fill={T.fog} stroke={T.ink} strokeWidth={2} />;
      })}
      {Array.from({length: 6}, (_, i) => <path key={'L' + i} d={`M-260,${-90 + i * 50} h${200 + (i % 2) * 30}`} stroke={T.ink} strokeWidth={2} opacity={0.3} />)}
      <circle cx={-120} cy={120 + Math.sin(t * 3) * 2} r={0} />
    </g>
  );
};
// striped pyjama scrap (clean, no stains), label with clue rim
export const PyjamaScrap: React.FC<{ring?: number; label?: boolean}> = ({ring = 0, label = true}) => (
  <g>
    <defs><clipPath id="pj"><path d="M-130,-80 L120,-96 L140,70 L-20,92 L-140,60 Z" /></clipPath></defs>
    <path d="M-130,-80 L120,-96 L140,70 L-20,92 L-140,60 Z" fill={T.newsprint} transform="translate(3 2)" />
    <g clipPath="url(#pj)">{Array.from({length: 10}, (_, i) => <rect key={i} x={-160 + i * 34} y={-110} width={14} height={220} fill={T.mist} transform="rotate(-6)" />)}</g>
    <path d="M-130,-80 L120,-96 L140,70 L-20,92 L-140,60 Z" fill="none" stroke={T.ink} strokeWidth={3} strokeLinejoin="round" />
    {label && <g transform="translate(10 -6) rotate(-3)">
      <Sh d={R(-96, -30, 192, 60, 4)} fill={T.newsprint} sw={2} />
      <rect x={-96} y={-30} width={192} height={60} rx={4} fill="none" stroke={T.clue} strokeWidth={3} />
      <Txt y={-6} s={16} w={700}>Jones Brothers</Txt>
      <Txt y={16} s={14} it>(Holloway) Limited</Txt>
      {ring > 0 && <Ring3 r={60} rx={128} p={ring} />}
    </g>}
  </g>
);
export const JonesShop: React.FC<{t: number}> = ({t}) => (
  <g>
    <Sh d="M-320,-240 h640 v480 h-640 z" fill={T.slate} shade sw={4} />
    <Sh d="M-300,-230 h600 v84 h-600 z" fill={T.deep} />
    <Txt y={-200} s={34} f={FONT.head} fill={T.newsprint} ls={2}>JONES BROTHERS</Txt>
    <Txt y={-160} s={24} fill={T.newsprint} ls={6}>HOLLOWAY</Txt>
    {/* striped awning that flaps */}
    <g transform={`translate(0 -140)`}>
      {Array.from({length: 10}, (_, i) => <path key={i} d={`M${-320 + i * 64},0 h64 l${-4},${70 + Math.sin(t * 4 + i) * 6} h-56 z`} fill={i % 2 ? T.newsprint : T.mist} stroke={T.ink} strokeWidth={2.5} />)}
    </g>
    <Sh d="M-260,-40 h520 v260 h-520 z" fill={T.lamp} sw={3} op={0.85} />
    {/* folded pyjamas in the window */}
    {[-140, 20, 170].map((x, i) => <g key={i} transform={`translate(${x} 150)`}><Sh d={R(-60, -50, 120, 70, 6)} fill={T.newsprint} sw={2.5} />{[0, 1, 2, 3].map((k) => <path key={k} d={`M${-50 + k * 30},-48 v66`} stroke={T.mist} strokeWidth={10} />)}</g>)}
  </g>
);
// a drawer sliding open (open 0..1) with pyjama trousers that have no top; their stripes line up with the scrap
export const Drawer: React.FC<{open: number}> = ({open}) => (
  <g>
    <Sh d="M-260,-120 h520 v240 h-520 z" fill={T.slate} shade sw={4} />
    <g transform={`translate(0 ${open * 150})`}>
      <Sh d="M-240,-90 h480 v170 h-480 z" fill={T.deep} sw={3} />
      <g transform="translate(0 -60)">
        <Sh d="M-150,-30 h300 v80 h-300 z" fill={T.newsprint} sw={2.5} />
        {Array.from({length: 9}, (_, i) => <path key={i} d={`M${-140 + i * 34},-28 v76`} stroke={T.mist} strokeWidth={14} />)}
        <Txt x={0} y={-44} s={20} it fill={T.newsprint}>trousers (no top)</Txt>
      </g>
      <Sh d="M-240,60 h480 v60 h-480 z" fill={T.slate} sw={3} />
      <circle cy={90} r={10} fill={T.newsprint} stroke={T.ink} strokeWidth={2.5} />
    </g>
  </g>
);
// the case ledger closing (close 0..1)
export const Ledger: React.FC<{close: number; text?: string}> = ({close, text = 'Rex v. Crippen'}) => {
  const a = close * 180;
  const lx = 300 * Math.cos((a * Math.PI) / 180);
  return (
    <g>
      <Sh d="M0,-200 H300 V200 H0 Z" fill={T.newsprint} sw={3} />
      {Array.from({length: 8}, (_, i) => <path key={i} d={`M30,${-150 + i * 40} h240`} stroke={T.ink} strokeWidth={2} opacity={0.3} />)}
      <path d={`M0,-200 L${lx},-200 L${lx},200 L0,200 Z`} fill={close > 0.5 ? T.deep : T.newsprint} stroke={T.ink} strokeWidth={3} />
      {close > 0.5 && <text x={lx / 2} y={10} fontFamily={FONT.period} fontSize={30} fill={T.newsprint} textAnchor="middle" fontStyle="italic"
        transform={`translate(${lx / 2} 0) scale(${Math.max(0.01, Math.abs(Math.cos((a * Math.PI) / 180)))} 1) translate(${-lx / 2} 0)`}>{text}</text>}
    </g>
  );
};
// court doors swinging open on warm daylight (open 0..1)
export const CourtDoors: React.FC<{t: number; open: number}> = ({t, open}) => (
  <g>
    <Sh d="M-330,-560 h660 v1100 h-660 z" fill={T.deep} shade sw={4} />
    <rect x={-290} y={-520} width={580} height={1060} fill={T.lamp} opacity={0.25 + open * 0.6} />
    {Array.from({length: 7}, (_, i) => (
      <path key={i} d={`M${-260 + i * 86},-520 L${-420 + i * 140 + Math.sin(t * 1.5 + i) * 10},900 L${-360 + i * 140 + Math.sin(t * 1.5 + i) * 10},900 L${-230 + i * 86},-520 Z`} fill="url(#p3-ray)" opacity={open * (0.5 + 0.3 * Math.sin(t * 2 + i))} />
    ))}
    {[-1, 1].map((s) => (
      <g key={s} transform={`translate(${s * 290} 0) scale(${s * Math.max(0.06, 1 - open * 0.94)} 1)`}>
        <Sh d="M0,-520 h-290 v1060 h290 z" fill={T.slate} shade sw={3} />
        <Sh d={R(-240, -460, 190, 380, 6)} fill={T.mist} sw={2.5} shade="far" />
        <Sh d={R(-240, -40, 190, 520, 6)} fill={T.mist} sw={2.5} shade="far" />
        <circle cx={-30} cy={0} r={12} fill={T.newsprint} stroke={T.ink} strokeWidth={2.5} />
      </g>
    ))}
  </g>
);
// pigeons lifting (lift 0..1), each on its own path
export const Pigeons: React.FC<{t: number; lift: number; n?: number; seed?: string}> = ({t, lift, n = 6, seed = 'pg'}) => (
  <g>{Array.from({length: n}, (_, i) => {
    const k = Math.max(0, lift * 1.4 - i * 0.07);
    const x = (rnd(seed + i) - 0.5) * 500 + k * (rnd(seed + 'v' + i) - 0.3) * 700;
    const y = -k * (500 + rnd(seed + 'y' + i) * 400);
    const flap = Math.sin(t * 22 + i * 1.9) * (k > 0 ? 1 : 0.1);
    return (
      <g key={i} transform={`translate(${x} ${y})`}>
        <Sh d="M-22,0 Q0,-14 24,-2 Q4,12 -22,0 Z" fill={T.mist} sw={2.5} />
        <path d={`M-4,-4 Q-14,${-24 * flap} -30,${-20 * flap} M4,-4 Q16,${-26 * flap} 30,${-18 * flap}`} stroke={T.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    );
  })}</g>
);

// ---------------- today: the modern sky of signals over a city (the 1910 Spark stays the brightest) ----------------
export const ModernSky: React.FC<{t: number; on: number}> = ({t, on}) => (
  <g>
    <rect x={-1200} y={-1600} width={2400} height={3200} fill={T.deep} />
    {Array.from({length: 70}, (_, i) => (
      <circle key={i} cx={(rnd('st' + i) - 0.5) * 2200} cy={(rnd('sy' + i) - 0.5) * 2600 - 300} r={1.5 + rnd('sr' + i) * 2} fill={T.fog} opacity={(0.3 + 0.4 * Math.abs(Math.sin(t * (1 + rnd('sf' + i)) + i))) * on} />
    ))}
    {/* signal arcs between rooftop masts and phones */}
    {Array.from({length: 7}, (_, i) => {
      const x0 = -800 + i * 260, k = ((t * 0.6 + i * 0.17) % 1);
      return <path key={'a' + i} d={`M${x0},700 Q${x0 + 180},${200 - (i % 3) * 120} ${x0 + 360},700`} fill="none" stroke={T.mist} strokeWidth={3} strokeDasharray="6 14" strokeDashoffset={-t * 80} opacity={on * (0.35 + 0.35 * Math.sin(k * Math.PI))} />;
    })}
    {/* two satellites crossing */}
    {[0, 1].map((i) => {
      const x = -900 + ((t * (60 + i * 25) + i * 700) % 1800), y = -900 + i * 380 + Math.sin(t * 0.3 + i) * 30;
      return (
        <g key={'s' + i} transform={`translate(${x} ${y}) rotate(${-20 + i * 30})`} opacity={on}>
          <Sh d={R(-14, -10, 28, 20, 3)} fill={T.mist} sw={2} />
          <Sh d={R(-62, -8, 40, 16)} fill={T.slate} sw={2} /><Sh d={R(22, -8, 40, 16)} fill={T.slate} sw={2} />
          <circle r={3} cy={-12} fill={T.fog} opacity={Math.sin(t * 8 + i) > 0 ? 1 : 0.2} />
        </g>
      );
    })}
    {/* a plane's blinking light */}
    <g transform={`translate(${-700 + ((t * 90) % 1500)} ${-500 + Math.sin(t * 0.4) * 20})`} opacity={on}>
      <path d="M-30,0 h60 M0,-4 l-14,-18 M0,4 l-14,18" stroke={T.mist} strokeWidth={4} strokeLinecap="round" />
      <circle cx={30} r={5} fill={T.lamp} opacity={Math.floor(t * 2) % 2 ? 1 : 0.1} />
    </g>
    {/* city below: towers with lit windows and rooftop masts */}
    {Array.from({length: 14}, (_, i) => {
      const w = 110 + rnd('cw' + i) * 70, h = 300 + rnd('ch' + i) * 520, x = -1000 + i * 150;
      return (
        <g key={'c' + i}>
          <Sh d={R(x, 900 - h, w, h + 700)} fill={i % 2 ? T.slate : T.mist} sw={2.5} shade="far" />
          {Array.from({length: Math.floor(h / 70)}, (_, k) => <rect key={k} x={x + 20 + (k % 2) * 40} y={930 - h + k * 70} width={22} height={30} fill={T.lamp} opacity={on * (Math.sin(t * 0.8 + i * 3 + k * 7) > -0.4 ? 0.8 : 0.15)} />)}
          {i % 3 === 0 && <g><path d={`M${x + w / 2},${900 - h} v-90`} stroke={T.ink} strokeWidth={4} /><circle cx={x + w / 2} cy={900 - h - 94} r={6} fill={T.lamp} opacity={Math.sin(t * 3 + i) > 0 ? 1 : 0.2} /></g>}
        </g>
      );
    })}
  </g>
);

// ---------------- 2007: the lab ----------------
export const ArchiveBox: React.FC<{lid: number; label?: string}> = ({lid, label = 'Trial sample'}) => (
  <g>
    <Sh d="M-200,-60 h400 v200 h-400 z" fill={T.fog} shade sw={3.5} />
    <Sh d={R(-120, -20, 240, 70, 4)} fill={T.newsprint} sw={2.5} />
    <Txt y={24} s={30} f={FONT.wire} w={700}>{label}</Txt>
    {/* the sealed glass slide in a sleeve (never magnified) */}
    <g opacity={Math.min(1, lid * 2)} transform={`translate(0 ${-70 - lid * 50})`}>
      <Sh d={R(-90, -22, 180, 44, 4)} fill={T.mist} sw={2.5} />
      <rect x={-70} y={-12} width={140} height={24} fill={T.fog} opacity={0.8} />
      <Txt y={6} s={16} f={FONT.wire} w={700}>sealed slide</Txt>
    </g>
    <g transform={`translate(-210 -60) rotate(${-lid * 70})`}><Sh d="M0,-24 h420 v24 h-420 z" fill={T.mist} sw={3.5} /></g>
  </g>
);
// gloved hands (modern): a simple mitten shape in mist with a cuff
export const Glove: React.FC<{rot?: number; flip?: boolean; col?: string}> = ({rot = 0, flip, col = T.mist}) => (
  <g transform={`rotate(${rot}) scale(${flip ? -1 : 1} 1)`}>
    <Sh d="M0,0 C-10,-40 10,-70 40,-66 L80,-64 C96,-62 96,-44 80,-42 L54,-40 C70,-34 70,-18 54,-16 L40,-10 C44,10 20,22 0,14 Z" fill={col} sw={3} />
    <Sh d="M-120,-30 L0,-40 L6,16 L-114,30 Z" fill={T.newsprint} sw={3} />
  </g>
);
// screen with a family tree: Cora's cameo at the top (slot), three leaves glowing; the piece slot is drawn by the scene
export const TreeScreen: React.FC<{t: number; glow: number; cameo?: React.ReactNode}> = ({t, glow, cameo}) => (
  <g>
    <Sh d={R(-330, -300, 660, 520, 18)} fill={T.deep} sw={4} />
    <rect x={-300} y={-270} width={600} height={460} rx={8} fill={T.slate} />
    {/* tree lines */}
    <path d="M0,-150 V-60 M-200,-60 H200 M-200,-60 V40 M0,-60 V40 M200,-60 V40" stroke={T.fog} strokeWidth={4} fill="none" />
    <g transform="translate(0 -190)">
      <ellipse rx={74} ry={86} fill={T.newsprint} stroke={T.ink} strokeWidth={3} />
      <ellipse rx={74} ry={86} fill="none" stroke={T.cora} strokeWidth={3} opacity={0.8} />
      {cameo}
    </g>
    {[-200, 0, 200].map((x, i) => (
      <g key={i} transform={`translate(${x} 90)`}>
        <circle r={44 + 8 * glow * Math.abs(Math.sin(t * 3 + i))} fill={T.mist} opacity={0.35 * glow} />
        <Sh d="M0,-40 Q34,-20 30,10 Q20,40 0,46 Q-20,40 -30,10 Q-34,-20 0,-40 Z" fill={T.fog} sw={2.5} />
        <circle cy={-4} r={12} fill={T.skin} stroke={T.ink} strokeWidth={2} />
      </g>
    ))}
    <Txt y={200} s={30} f={FONT.ui} w={600} fill={T.newsprint}>people believed to be Cora&apos;s family</Txt>
    <Sh d="M-60,220 h120 l30,80 h-180 z" fill={T.slate} sw={3} />
  </g>
);
// a jigsaw piece (it never clicks in)
export const Piece: React.FC<{col?: string}> = ({col = T.fog}) => (
  <Sh d="M-40,-40 h26 a14,14 0 1 1 28,0 h26 v26 a14,14 0 1 1 0,28 v26 h-26 a14,14 0 1 0 -28,0 h-26 v-26 a14,14 0 1 0 0,-28 z" fill={col} sw={3} shade="far" />
);
// "CASE CLOSED" box with a padlock that yawns and stays shut (yawn 0..1)
export const CaseBox: React.FC<{t: number; yawn: number}> = ({t, yawn}) => (
  <g>
    <Sh d="M-180,-120 h360 v240 h-360 z" fill={T.slate} shade sw={3.5} />
    <Sh d="M-190,-140 h380 v40 h-380 z" fill={T.deep} sw={3} />
    <Sh d={R(-140, -60, 280, 70, 4)} fill={T.newsprint} sw={2.5} />
    <Txt y={-14} s={36} f={FONT.wire} w={700}>CASE CLOSED</Txt>
    <g transform={`translate(0 70) rotate(${Math.sin(t * 2.4) * 3})`}>
      <path d="M-30,-20 V-46 a30,30 0 0 1 60,0 V-20" fill="none" stroke={T.ink} strokeWidth={10} />
      <path d="M-30,-20 V-46 a30,30 0 0 1 60,0 V-20" fill="none" stroke={T.mist} strokeWidth={5} />
      <Sh d={R(-44, -22, 88, 70, 10)} fill={T.mist} sw={3} />
      {/* its sleepy face: eyes and a yawning mouth */}
      <path d={`M-20,${-4 + yawn * 2} q6,${-4 + yawn * 6} 12,0 M8,${-4 + yawn * 2} q6,${-4 + yawn * 6} 12,0`} stroke={T.ink} strokeWidth={3} fill="none" />
      <ellipse cy={26} rx={8 + yawn * 4} ry={3 + yawn * 10} fill={T.ink} />
    </g>
  </g>
);
// a modern expert (part-only, simple): body, head, arm angles (deg) for the tug
export const Expert: React.FC<{t: number; kind: 'lab' | 'cardigan'; arm: number; mouth?: number; facing?: 1 | -1}> = ({t, kind, arm, mouth = 0, facing = 1}) => {
  const coat = kind === 'lab' ? T.newsprint : T.slate;
  return (
    <g transform={`scale(${facing} 1)`}>
      <Sh d="M-90,0 Q-100,-240 0,-260 Q100,-240 90,0 Z" fill={coat} shade sw={4} />
      <path d="M-14,-250 L0,-180 L14,-250" fill={kind === 'lab' ? T.mist : T.newsprint} stroke={T.ink} strokeWidth={3} />
      <g transform={`translate(0 ${-320 + Math.sin(t * 2.2) * 3})`}>
        <circle r={56} fill={T.skin} stroke={T.ink} strokeWidth={4} />
        <path d={kind === 'lab' ? 'M-58,-10 Q-60,-70 0,-72 Q60,-70 58,-10 Q40,-50 0,-48 Q-40,-50 -58,-10 Z' : 'M-58,10 Q-70,-80 0,-74 Q70,-80 58,10 Q50,-40 0,-44 Q-50,-40 -58,10 Z'} fill={kind === 'lab' ? T.deep : T.mist} stroke={T.ink} strokeWidth={3} />
        {kind === 'cardigan' && <g fill="none" stroke={T.ink} strokeWidth={3}><circle cx={-20} cy={-4} r={14} /><circle cx={20} cy={-4} r={14} /><path d="M-6,-4 h12" /></g>}
        <circle cx={-20} cy={-4} r={4} fill={T.ink} /><circle cx={20} cy={-4} r={4} fill={T.ink} />
        <ellipse cy={28} rx={12} ry={3 + mouth * 9} fill={T.ink} />
      </g>
      <path d={`M60,-200 l${Math.cos((arm * Math.PI) / 180) * 150},${Math.sin((arm * Math.PI) / 180) * 150}`} stroke={T.ink} strokeWidth={38} strokeLinecap="round" />
      <path d={`M60,-200 l${Math.cos((arm * Math.PI) / 180) * 150},${Math.sin((arm * Math.PI) / 180) * 150}`} stroke={coat} strokeWidth={30} strokeLinecap="round" />
    </g>
  );
};
// the clerk's rubber stamp (the court's "gavel"): press 0..1 down
export const RubberStamp: React.FC<{press: number}> = ({press}) => (
  <g transform={`translate(0 ${-140 + press * 140})`}>
    <Sh d="M-26,-150 Q-40,-200 0,-206 Q40,-200 26,-150 Z" fill={T.slate} sw={3} shade />
    <Sh d={R(-14, -150, 28, 90)} fill={T.deep} sw={3} />
    <Sh d={R(-90, -62, 180, 50, 6)} fill={T.slate} sw={3} />
    <Sh d={R(-84, -14, 168, 14)} fill={T.deep} sw={2.5} />
  </g>
);
export {lerp};

import React from 'react';
import { C, skin, Skin, VINCENZO_H } from './tokens';
import { Look, Puppet, PuppetProps } from './puppet';
import { rnd } from './util';

/** Vincenzo Peruggia (MUST 1,2,3). 560 px, slim, side-parted dark hair, neat moustache, skin2, calm, never sneering.
 *  costume: 'smock' (long white work smock + cap) | 'shirt' (sepia waistcoat, rolled sleeves) | 'suit' (thin dark suit, tie, bowler).
 *  Poses: stand walk lift carry carryWalk rattle nod poker doorOpen reach trunkLid surprised heartHand sigh tipCap point shrug …
 *  ghost: sepia 40 % (P3 ending, with pose 'tipCap'). */
export const VINCENZO: Record<'smock' | 'shirt' | 'suit', Look> = {
  smock: { skin: C.skin2, hair: C.ink, hairStyle: 'side', coat: C.smock, coatHem: -16, shoulders: 11, hem: 13, legs: C.suit, hat: 'cap', hatColor: C.suit, moustache: 'neat', buttons: C.paperShade },
  shirt: { skin: C.skin2, hair: C.ink, hairStyle: 'side', coat: C.shirt, coatHem: -38, shoulders: 11, hem: 10, vest: C.sepia, rolled: true, legs: C.suit, moustache: 'neat' },
  suit: { skin: C.skin2, hair: C.ink, hairStyle: 'side', coat: C.suit, coatHem: -33, shoulders: 11, hem: 10.5, shirt: C.shirt, tie: C.ink, legs: C.suit, hat: 'bowler', hatColor: C.suit, moustache: 'neat' },
};
export const Vincenzo: React.FC<PuppetProps & { costume?: 'smock' | 'shirt' | 'suit'; hatOff?: boolean }> = ({ costume = 'smock', hatOff, height = VINCENZO_H, ...p }) => {
  const L = { ...VINCENZO[costume] }; if (hatOff) L.hat = 'none';
  return <Puppet seed="vincenzo" height={height} {...p} look_={L} />;
};

/** Guards (MUST 1,2): nightBlue long coats, kepis, brass buttons. variant 'tall' (thin, 680) | 'short' (round, 560). */
export const Guard: React.FC<PuppetProps & { variant?: 'tall' | 'short' }> = ({ variant = 'tall', ...p }) => {
  const L: Look = variant === 'tall'
    ? { skin: C.skin1, hair: C.sepia, hairStyle: 'short', coat: C.nightBlue, coatHem: -12, shoulders: 10, hem: 10, legs: C.ink, hat: 'kepi', hatColor: C.nightBlue, moustache: 'neat', buttons: C.oldGold, headH: 13.5, headW: 9.5 }
    : { skin: C.skin3, hair: C.ink, hairStyle: 'short', coat: C.nightBlue, coatHem: -12, shoulders: 14, hem: 15, round: 1, legs: C.ink, hat: 'kepi', hatColor: C.nightBlue, moustache: 'bushy', buttons: C.oldGold, headW: 12, headH: 11.5 };
  return <Puppet seed={`guard-${variant}`} height={variant === 'tall' ? 680 : 560} {...p} look_={L} />;
};

/** Art lovers (MUST 1,2,3): top hats, tailcoats, monocles on ribbons. variant 'tall' | 'medium' | 'short'.
 *  monocle=false shows it popped out (hanging on its ribbon: draw <PoppedMonocle> yourself if you want it flying). */
export const ArtLover: React.FC<PuppetProps & { variant?: 'tall' | 'medium' | 'short'; monocle?: boolean }> = ({ variant = 'medium', monocle = true, ...p }) => {
  const v = { tall: { h: 700, sk: C.skin1, hair: C.stone }, medium: { h: 640, sk: C.skin3, hair: C.ink }, short: { h: 560, sk: C.skin2, hair: C.sepia } }[variant];
  const L: Look = { skin: v.sk, hair: v.hair, hairStyle: 'neat', coat: C.suit, coatHem: -30, shoulders: variant === 'short' ? 13 : 11, hem: 11, round: variant === 'short' ? 0.8 : 0, shirt: C.card, tie: C.ink, legs: C.suit, hat: 'top', hatColor: C.ink, moustache: variant === 'tall' ? 'neat' : variant === 'medium' ? 'none' : 'bushy', monocle };
  return <Puppet seed={`art-${variant}`} height={v.h} {...p} look_={L} />;
};

/** Detective (MUST 2,3): bowler, sepia overcoat, big kind moustache. Give him props via hold (e.g. <Magnifier/>). */
export const Detective: React.FC<PuppetProps> = (p) => (
  <Puppet seed="detective" height={660} {...p} look_={{ skin: C.skin1, hair: C.sepia, hairStyle: 'short', coat: C.sepia, coatHem: -14, shoulders: 13, hem: 15, legs: C.suit, hat: 'bowler', hatColor: C.ink, moustache: 'big', shirt: C.card, tie: C.clueRed, buttons: C.ink, headW: 11, headH: 12 }} />
);

/** Police (MUST 2,3): 'paris' nightBlue cape + kepi; 'florence' plain dark uniform + peaked cap (no plumes/insignia). */
export const Police: React.FC<PuppetProps & { force?: 'paris' | 'florence'; tone?: Skin }> = ({ force = 'paris', tone = 1, ...p }) => (
  <Puppet seed={`police-${force}-${tone}`} height={640} {...p} look_={force === 'paris'
    ? { skin: skin(tone), hair: C.ink, hairStyle: 'short', coat: C.nightBlue, cape: true, coatHem: -30, shoulders: 12, hem: 13, legs: C.ink, hat: 'kepi', hatColor: C.nightBlue, moustache: 'neat' }
    : { skin: skin(tone), hair: C.ink, hairStyle: 'short', coat: C.suit, coatHem: -30, shoulders: 12, hem: 11, legs: C.suit, hat: 'peaked', hatColor: C.suit, buttons: C.stone, moustache: 'none' }} />
);

/** Alfredo Geri (MUST 2,3): middle-aged, rounded, neat moustache, waistcoat + watch chain, pince-nez. Warm and clever. */
export const Geri: React.FC<PuppetProps> = (p) => (
  <Puppet seed="geri" height={620} {...p} look_={{ skin: C.skin1, hair: C.stone, hairStyle: 'side', coat: C.suit, coatHem: -32, shoulders: 13, hem: 14, round: 1, shirt: C.shirt, vest: C.paperShade, watchChain: true, legs: C.suit, moustache: 'neat', pinceNez: true, headW: 11.5, headH: 12 }} />
);

/** Any extra person in the series style (crowd fill, workers, baker…): pass a Look. */
export const Person: React.FC<PuppetProps & { look: Look }> = ({ look, ...p }) => <Puppet {...p} look_={look} />;

/** Spider (MUST 2,3): tiny ink dot spider with 8 legs; legs tick on twos. suitcase=true carries a tiny case (P3). */
export const Spider: React.FC<{ fr: number; x: number; y: number; size?: number; suitcase?: boolean; thread?: number }> = ({ fr, x, y, size = 1, suitcase, thread }) => {
  const t = Math.floor(fr / 2) % 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      {thread !== undefined && <line x1={0} y1={-thread} x2={0} y2={0} stroke={C.ink} strokeWidth={1} opacity={0.7} />}
      {[0, 1, 2, 3].map((i) => {
        const a = -50 + i * 33 + (t ^ (i % 2) ? 8 : -8);
        return <g key={i}>
          <path d={`M0,0 Q${Math.cos((a * Math.PI) / 180) * 9},${-7 + i * 3} ${Math.cos((a * Math.PI) / 180) * 14},${2 + i * 2}`} stroke={C.ink} strokeWidth={1.6} fill="none" />
          <path d={`M0,0 Q${-Math.cos((a * Math.PI) / 180) * 9},${-7 + i * 3} ${-Math.cos((a * Math.PI) / 180) * 14},${2 + i * 2}`} stroke={C.ink} strokeWidth={1.6} fill="none" />
        </g>;
      })}
      <circle r={5.5} fill={C.ink} /><circle cx={0} cy={-6} r={3.5} fill={C.ink} />
      <circle cx={-1.3} cy={-6.5} r={1} fill={C.card} /><circle cx={1.3} cy={-6.5} r={1} fill={C.card} />
      {suitcase && <g transform="translate(10 4)"><rect x={0} y={0} width={10} height={7} rx={1} fill={C.sepia} stroke={C.ink} strokeWidth={1} /><path d="M3,0 L3,-2 L7,-2 L7,0" fill="none" stroke={C.ink} strokeWidth={1} /></g>}
    </g>
  );
};

/** Crowd member cut-out (cheap bust: head, shoulders, hat), used by <Crowd>. */
const HATS = ['bowler', 'top', 'cap', 'feather', 'beret', 'none'] as const;
export type CrowdEra = '1911' | 'today';
export const CrowdPerson: React.FC<{ fr: number; x: number; y: number; s?: number; seed: number; era?: CrowdEra; phone?: boolean; flashAt?: number }> = ({ fr, x, y, s = 1, seed, era = '1911', phone, flashAt }) => {
  const r = (k: string) => rnd(`crowd${seed}${k}`);
  const sk = [C.skin1, C.skin2, C.skin3, C.skin4][Math.floor(r('s') * 4)];
  const coats1911 = [C.suit, C.sepia, C.nightBlue];
  const coatsToday = [C.duskBlue, C.stone, C.paperShade];
  const coat = (era === '1911' ? coats1911 : coatsToday)[Math.floor(r('c') * 3)];
  const body = Math.floor(r('b') * 8); // 8 body cut-outs
  const bw = 34 + (body % 4) * 6, bh = 70 + Math.floor(body / 4) * 18;
  const hat = era === '1911' ? HATS[Math.floor(r('h') * 6)] : (r('h') < 0.5 ? 'hood' : 'none');
  const bob = Math.sin(fr * (0.09 + r('sp') * 0.07) + r('ph') * 6.28) * 5; // own phase
  const hairC = [C.ink, C.sepia, C.stone, '#5A3B22'][Math.floor(r('hc') * 4)];
  const phoneUp = phone ? Math.min(1, Math.max(0, (fr - (r('pu') * 40)) / 12)) : 0;
  const flashing = flashAt !== undefined ? (fr - flashAt - Math.floor(r('fl') * 50)) : -99;
  const flash = phone && flashing >= 0 && flashing % 50 < 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <path d={`M${-bw},${bh} C${-bw},${10} ${-bw * 0.6},${2} 0,${2} C${bw * 0.6},${2} ${bw},${10} ${bw},${bh}Z`} fill={coat} stroke={C.ink} strokeWidth={3} />
      {hat === 'hood' && <path d={`M-26,8 C-30,-50 30,-50 26,8Z`} fill={coat} stroke={C.ink} strokeWidth={3} />}
      <ellipse cx={0} cy={-22} rx={19} ry={23} fill={sk} stroke={C.ink} strokeWidth={3} />
      {hat !== 'hood' && <path d={`M-19,-26 C-20,-50 20,-50 19,-26 C12,-36 -12,-36 -19,-26Z`} fill={hairC} />}
      {hat === 'bowler' && <g><path d="M-16,-34 C-16,-60 16,-60 16,-34Z" fill={C.ink} /><ellipse cx={0} cy={-34} rx={24} ry={5} fill={C.ink} /></g>}
      {hat === 'top' && <g><rect x={-14} y={-72} width={28} height={38} fill={C.ink} /><ellipse cx={0} cy={-34} rx={24} ry={5} fill={C.ink} /></g>}
      {hat === 'cap' && <path d="M-20,-30 C-20,-52 20,-52 21,-32 L32,-29 L-20,-28Z" fill={C.sepia} stroke={C.ink} strokeWidth={2} />}
      {hat === 'feather' && <g><ellipse cx={0} cy={-36} rx={34} ry={8} fill={C.duskBlue} stroke={C.ink} strokeWidth={2} /><path d="M-6,-40 C-10,-62 -30,-66 -40,-60 C-28,-54 -16,-48 -6,-40Z" fill={C.card} stroke={C.ink} strokeWidth={2} /></g>}
      {hat === 'beret' && <ellipse cx={3} cy={-40} rx={22} ry={8} fill={C.ink} />}
      <circle cx={-6} cy={-22} r={2.5} fill={C.ink} /><circle cx={6} cy={-22} r={2.5} fill={C.ink} />
      {phone && <g transform={`translate(${bw * 0.6} ${40 - phoneUp * 90}) rotate(${-8 + r('pr') * 16})`}>
        <path d={`M0,40 L0,10`} stroke={sk} strokeWidth={11} strokeLinecap="round" />
        <rect x={-11} y={-14} width={22} height={34} rx={4} fill={C.ink} />
        <rect x={-8} y={-11} width={16} height={26} rx={2} fill={flash ? C.phoneWhite : C.duskBlue} />
        {flash && <circle cx={0} cy={0} r={34} fill={C.phoneWhite} opacity={0.75} />}
      </g>}
    </g>
  );
};

/**
 * Crowd generator (MUST): seeded people in rows, each bobbing on its own phase (many movers, not one block).
 * era '1911' (hats, coats) | 'today' (hoodies, phones up with white flash screens: phones=true, flashAt=frame).
 * Fills the box [x, x+w] with `rows` rows starting at baseline y, row spacing dy, scale shrinking with depth.
 */
export const Crowd: React.FC<{ fr: number; x?: number; y?: number; w?: number; rows?: number; perRow?: number; dy?: number; scale?: number; era?: CrowdEra; phones?: boolean; flashAt?: number; seed?: number; flow?: number }> =
  ({ fr, x = 0, y = 1500, w = 1080, rows = 3, perRow = 8, dy = 70, scale = 1.4, era = '1911', phones, flashAt = 0, seed = 1, flow = 0 }) => {
    const out: React.ReactNode[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      const s = scale * (1 - r * 0.12);
      for (let i = 0; i < perRow; i++) {
        const id = seed * 1000 + r * 50 + i;
        const jitter = (rnd(`cx${id}`) - 0.5) * (w / perRow) * 0.5;
        let px = x + ((i + 0.5) / perRow) * w + jitter + flow * fr * (1 - r * 0.15);
        if (flow) px = x + ((((px - x) % (w + 120)) + w + 120) % (w + 120)) - 60;
        out.push(<CrowdPerson key={id} fr={fr} x={px} y={y - r * dy} s={s} seed={id} era={era} phone={phones && rnd(`ph${id}`) < 0.75} flashAt={flashAt} />);
      }
    }
    return <g filter="url(#ss-shadow)">{out}</g>;
  };

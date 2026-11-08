import React from 'react';
import { C } from './tokens';
import { Ink, Print } from './look';
import { Expr, HatShape, Hold, Look, PoseName, Puppet, PuppetProps } from './puppet';
import { Feather, Moustache, MoustacheState } from './devices';
import { Spark } from './spark';
import { DeckChair } from './props';
import { clamp, ellipse, osc, pop, rrect } from './util';

/** Common character props: fr x y (feet) height? facing? pose expr hold holdB talk op litBelow seed. */
export type CharProps = { fr: number; x: number; y: number; height?: number; facing?: 1 | -1; pose?: PoseName; expr?: Expr; hold?: Hold; holdB?: Hold; talk?: boolean; op?: number; litBelow?: number; seed?: number; far?: boolean };
const pass = (p: CharProps) => ({ fr: p.fr, x: p.x, y: p.y, facing: p.facing, pose: p.pose, expr: p.expr, hold: p.hold, holdB: p.holdB, talk: p.talk, op: p.op, litBelow: p.litBelow, seed: p.seed, far: p.far });

/** Poses and expressions each MUST character is model-sheeted in (the KitSheet renders all of them). */
export const CAST_POSES: Record<string, PoseName[]> = {
  Cora: ['sing', 'wave', 'laugh', 'deal', 'walk', 'stand'],
  CrippenA: ['stand', 'talk', 'shrug', 'point', 'usher', 'pullCard', 'holdTelegram'],
  CrippenB: ['walk', 'holdHands', 'deckChair', 'swat', 'seated', 'startled', 'dock', 'shakeHead'],
  EthelA: ['dance', 'calm', 'walk'],
  EthelB: ['walk', 'holdHands', 'sitRead', 'lookUp'],
  Clara: ['wave', 'leanAsk', 'march', 'flag', 'seated'],
  Paul: ['wave', 'leanAsk', 'march'],
  DewA: ['walk', 'liftHat', 'write', 'holdLamp', 'leanDoor', 'readTelegram', 'leap', 'removeHat', 'seated'],
  DewB: ['climb', 'walk', 'liftCap', 'talk'],
  Kendall: ['telescope', 'think', 'holdPaper', 'handNote', 'nod'],
  Constable: ['walk', 'sweepLamp', 'lampLow'],
  Newsboy: ['shout', 'holdBoard'],
};
export const CAST_EXPRS: Record<string, Expr[]> = {
  Cora: ['sing', 'laugh', 'smile'], CrippenA: ['neutral', 'polite', 'nervous', 'blank'], CrippenB: ['neutral', 'startled', 'calm'],
  EthelA: ['smile', 'calm'], EthelB: ['calm', 'unsure', 'amused'], Clara: ['smile', 'raised', 'serious'], Paul: ['smile', 'raised'],
  DewA: ['neutral', 'serious', 'still'], DewB: ['neutral', 'smile'], Kendall: ['neutral', 'think'], Constable: ['neutral', 'still'], Newsboy: ['shout'],
};

// ---------------- Cora Crippen
const CORA: Look = { hair: C.deep, hairStyle: 'curlyBig', coat: C.mist, skirt: C.mist, skirtFlare: 1.3, legs: C.mist, build: 1.2, collarUp: true, shirt: C.mist, hat: 'cora', cheeks: 'cora' };
/** <Cora … feather?=true> — tall, full figure, very wide hat with the tall cora plume. Poses: sing wave laugh deal walk stand. Height 740. */
export const Cora: React.FC<CharProps & { feather?: boolean }> = (p) => {
  const plume = p.feather !== false ? <Feather fr={p.fr} x={-40} y={-30} size={0.8} state="onHat" rot={-12} /> : null;
  return <Puppet {...pass(p)} height={p.height ?? 740} look={CORA} expr={p.expr ?? 'smile'} hatNode={<HatShape kind="cora" fr={p.fr} feather={plume} />}
    hold={p.hold ?? (p.pose === 'deal' ? 'cards' : undefined)} />;
};
/** <CoraCameo fr x y size?> — warm oval portrait (plume, smile) for P3's family tree. ~220×280 at size 1, centred. */
export const CoraCameo: React.FC<{ fr: number; x: number; y: number; size?: number }> = ({ fr, x, y, size = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${size})`}>
    <Print><Ink d={ellipse(0, 0, 112, 140)} fill={C.newsprint} sw={5} /><Ink d={ellipse(0, 0, 100, 128)} fill={C.fog} sw={2} /></Print>
    <svg x={-100} y={-128} width={200} height={256} viewBox="-100 -128 200 256" overflow="hidden">
      <clipPath id="cora-cameo-clip"><ellipse cx={0} cy={0} rx={100} ry={128} /></clipPath>
      <g clipPath="url(#cora-cameo-clip)"><rect x={-100} y={-128} width={200} height={256} fill={C.fog} /><Cora fr={fr} x={-8} y={520} height={560} pose="stand" expr="smile" /></g>
    </svg>
  </g>
);

// ---------------- Dr Crippen
const CRIP_HEAD = { hair: C.slate, hairStyle: 'side' as const, skin: C.skin };
const CRIPPEN_A: Look = { ...CRIP_HEAD, coat: C.slate, coatLen: -220, legs: C.deep, collarUp: true, glasses: true, build: 0.95 };
/**
 * <CrippenA … moustache?=MoustacheState|'none' (default 'on') moustacheAt? glintAt?> — small (608 = 0.8× Dew), domed
 * forehead, thin side hair, round gold-rimmed glasses, high collar, slate frock coat. The Moustache is the separate
 * device drawn on his lip (pass the state). glintAt = frame of a Spark glint on his near lens.
 */
export const CrippenA: React.FC<CharProps & { moustache?: MoustacheState | 'none'; moustacheAt?: number; glintAt?: number; mono?: boolean }> = (p) => {
  const m = p.moustache ?? 'on';
  return <Puppet {...pass(p)} height={p.height ?? 608} look={CRIPPEN_A} expr={p.expr ?? 'polite'} mono={p.mono}
    lipNode={m !== 'none' ? <Moustache fr={p.fr} x={0} y={-8} size={0.82} state={m} at={p.moustacheAt} /> : null}
    faceExtra={<>{p.glintAt != null && <Spark fr={p.fr} x={60} y={-20} mode="glint" at={p.glintAt} size={1.2} />}<path d="M-50 -60 Q0 -96 60 -64" stroke={C.ink} strokeOpacity={0.25} strokeWidth={3} fill="none" /></>}
    hold={p.hold ?? (p.pose === 'holdTelegram' ? 'telegram' : p.pose === 'pullCard' ? 'card' : undefined)} holdB={p.holdB ?? (p.pose === 'holdTelegram' ? 'hanky' : undefined)} />;
};
const CRIPPEN_B: Look = { ...CRIP_HEAD, coat: C.mist, legs: C.mist, shirt: C.newsprint, bareLip: true, hat: 'felt', hatColor: C.slate, build: 0.95 };
/** <CrippenB … hat?=true rail? chair? (deck chair under pose 'deckChair')> — "Mr Robinson": same head, bare upper lip, no glasses, mist travelling suit, soft felt hat. rail = dock rail in front (pose 'dock'). */
export const CrippenB: React.FC<CharProps & { hat?: boolean; rail?: boolean; chair?: boolean; moustache?: MoustacheState | 'none'; moustacheAt?: number }> = (p) => {
  const m = p.moustache ?? 'none';
  const k = (p.height ?? 608) / 760;
  return <>{p.chair && <DeckChair x={p.x} y={p.y} scale={k * 1.1} facing={p.facing} />}<Puppet {...pass(p)} height={p.height ?? 608} look={{ ...CRIPPEN_B, hat: p.hat === false ? 'none' : 'felt' }} expr={p.expr ?? 'neutral'}
    lipNode={m !== 'none' ? <Moustache fr={p.fr} x={0} y={-8} size={0.82} state={m} at={p.moustacheAt} /> : null}
    hold={p.hold ?? (p.pose === 'deckChair' ? 'book' : undefined)}
    front={p.rail ? <Print><Ink d={rrect(-200, -380, 400, 26, 6)} fill={C.slate} shade="B" /><Ink d={rrect(-180, -356, 40, 360, 4)} fill={C.slate} shade="R" /><Ink d={rrect(140, -356, 40, 360, 4)} fill={C.slate} shade="R" /><Ink d={rrect(-200, -200, 400, 200, 4)} fill={C.slate} shade="RB" /></Print> : null} /></>;
};

// ---------------- Ethel
/** <EthelA … hair?='bun'|'bob' brooch?=false coat?=false> — young, slim, white high-collar blouse, deep skirt; brooch gem in clue; coat = her own coat-and-hat (P3). Poses: dance calm walk. Height 650. */
export const EthelA: React.FC<CharProps & { hair?: 'bun' | 'bob'; brooch?: boolean; coat?: boolean }> = (p) => {
  const look: Look = p.coat
    ? { hair: C.deep, hairStyle: p.hair ?? 'bob', coat: C.slate, coatLen: -60, legs: C.deep, skirt: C.deep, build: 0.85, collarUp: true, shirt: C.newsprint, hat: 'felt', hatColor: C.deep }
    : { hair: C.deep, hairStyle: p.hair ?? 'bun', coat: C.newsprint, legs: C.deep, skirt: C.deep, build: 0.85, collarUp: true, shirt: C.newsprint };
  return <Puppet {...pass(p)} height={p.height ?? 650} look={look} expr={p.expr ?? 'smile'}
    front={p.brooch ? <g><Ink d={ellipse(26, -500, 15, 13)} fill={C.lamp} sw={3} /><circle cx={26} cy={-500} r={8} fill={C.clue} stroke={C.ink} strokeWidth={2} /></g> : null} />;
};
/** <EthelB … hankyClue?> — "Master Robinson": short hair, cap a size too big with a hanky edge (clue only when ringed), baggy slate suit, rolled cuffs. Poses: walk holdHands sitRead lookUp. Height 640. */
export const EthelB: React.FC<CharProps & { hankyClue?: boolean; capSlip?: number }> = (p) => {
  const look: Look = { hair: C.deep, hairStyle: 'cropped', coat: C.slate, legs: C.slate, build: 1.1, shirt: C.newsprint, rolled: false };
  const slip = p.capSlip ?? 0;
  const cap = <g transform={`translate(${slip * 18} ${14 + slip * 22}) rotate(${slip * 12}) scale(1.22)`}>
    <HatShape kind="cap" color={C.slate} fr={p.fr} />
    <path d="M-60 -40 l-28 34 l36 -6Z" fill={p.hankyClue ? C.clue : C.newsprint} stroke={C.ink} strokeWidth={3} transform="translate(0 -40)" />
  </g>;
  return <Puppet {...pass(p)} height={p.height ?? 640} look={look} expr={p.expr ?? 'calm'} hatNode={cap}
    hold={p.hold ?? (p.pose === 'sitRead' ? 'book' : undefined)}
    front={<path d="M-70 -20 l22 0 M50 -20 l22 0" stroke={C.ink} strokeWidth={3} opacity={0.6} />} />;
};

// ---------------- Cora's friends
/** <Clara …> — round, warm, flowered hat, shawl. Poses: wave leanAsk march flag (holds the Feather high) seated. Height 640. */
export const Clara: React.FC<CharProps> = (p) => (
  <Puppet {...pass(p)} height={p.height ?? 640} expr={p.expr ?? 'smile'} hold={p.hold ?? (p.pose === 'flag' ? 'feather' : undefined)}
    look={{ hair: C.slate, hairStyle: 'bun', coat: C.slate, skirt: C.slate, legs: C.slate, build: 1.35, hat: 'flowered', hatColor: C.deep, scarf: C.mist, cape: true, cheeks: 'ink' }} />
);
/** <Paul …> — tall, thin, clean-shaven, curly hair, scarf. Poses: wave leanAsk march. Height 740. */
export const Paul: React.FC<CharProps> = (p) => (
  <Puppet {...pass(p)} height={p.height ?? 740} expr={p.expr ?? 'smile'}
    look={{ hair: C.deep, hairStyle: 'curly', coat: C.deep, coatLen: -240, legs: C.slate, build: 0.8, scarf: C.mist }} />
);

// ---------------- Inspector Dew
/** <DewA … feather?=true> — heavy-set, tall, deep bowler (Feather in the band), long slate overcoat, short clipped mist moustache, notebook. Poses: walk liftHat write holdLamp leanDoor readTelegram leap removeHat seated. Height 760. */
export const DewA: React.FC<CharProps & { feather?: boolean }> = (p) => {
  const band = p.feather !== false ? <Feather fr={p.fr} x={58} y={-2} size={0.95} state="hatband" /> : null;
  const hold = p.hold ?? ({ write: 'pencil', holdLamp: 'lamp', readTelegram: 'telegram', sweepLamp: 'lamp', lampLow: 'lamp' } as Record<string, Hold>)[p.pose ?? ''];
  const holdB = p.holdB ?? (p.pose === 'write' ? 'notebook' : undefined);
  return <Puppet {...pass(p)} height={p.height ?? 760} expr={p.expr ?? 'neutral'} hold={hold} holdB={holdB}
    look={{ hair: C.mist, hairStyle: 'short', coat: C.slate, coatLen: -140, legs: C.deep, build: 1.3, moustache: 'clipped', shirt: C.newsprint }}
    hatNode={<HatShape kind="bowler" fr={p.fr} feather={band} />} />;
};
/**
 * <DewB … pocketFeather?=true bowlerPop?> — pilot disguise: peaked cap, deep pea coat collar up, scarf, Feather tip from
 * the pocket. bowlerPop 0..1 (with pose 'liftCap'): the bowler springs up out of the lifted cap like a jack-in-the-box.
 */
export const DewB: React.FC<CharProps & { pocketFeather?: boolean; bowlerPop?: number }> = (p) => {
  const bp = clamp(p.bowlerPop ?? 0);
  const cap = <g>
    <HatShape kind="pilotCap" fr={p.fr} />
    {bp > 0 && <g transform={`translate(0 ${-30 - pop(bp * 20, 0, 20) * 120})`}>
      <path d={`M-10 0 q20 -15 0 -30 q-20 -15 0 -30 q20 -15 0 -30`} stroke={C.ink} strokeWidth={4} fill="none" transform={`scale(1 ${bp})`} />
      <g transform="translate(0 -40)"><HatShape kind="bowler" fr={p.fr} /></g>
    </g>}
  </g>;
  return <Puppet {...pass(p)} height={p.height ?? 760} expr={p.expr ?? 'neutral'}
    look={{ hair: C.mist, hairStyle: 'short', coat: C.deep, coatLen: -300, legs: C.deep, build: 1.3, moustache: 'clipped', collarUp: true, shirt: C.deep, scarf: C.mist }}
    hatNode={cap}
    front={p.pocketFeather !== false ? <g><Feather fr={p.fr} x={-44} y={-404} size={0.42} state="pocketTip" rot={-8} /><path d="M-84 -404 L-4 -404" stroke={C.ink} strokeWidth={5} /></g> : null} />;
};

// ---------------- Captain Kendall
/** <Kendall …> — upright, deep uniform with newsprint trim, white-top peaked cap, telescope. Poses: telescope think holdPaper handNote nod. Height 750. (HunchBulb is a separate prop: put it above his head.) */
export const Kendall: React.FC<CharProps> = (p) => {
  const hold = p.hold ?? ({ telescope: 'telescope', holdPaper: 'paper', handNote: 'note' } as Record<string, Hold>)[p.pose ?? ''];
  return <Puppet {...pass(p)} height={p.height ?? 750} expr={p.expr ?? (p.pose === 'think' ? 'think' : 'neutral')} hold={hold}
    look={{ hair: C.mist, hairStyle: 'short', coat: C.deep, coatLen: -250, legs: C.deep, build: 1.05, trim: C.newsprint, shirt: C.newsprint, hat: 'captain', beard: false, moustache: 'clipped' }} />;
};

// ---------------- Passengers, constables, newsboy
export type PassengerKind = 'parasol' | 'boater' | 'hoop' | 'steward';
export const PASSENGER_KINDS: PassengerKind[] = ['parasol', 'boater', 'hoop', 'steward'];
/** <Passenger kind …> — mist silhouettes with simple faces, each with its own idle loop: lady with parasol, man in boater, child with hoop, steward with tray. */
export const Passenger: React.FC<CharProps & { kind: PassengerKind }> = (p) => {
  const L: Record<PassengerKind, [Look, number, Hold]> = {
    parasol: [{ hair: C.slate, hairStyle: 'bun', coat: C.mist, skirt: C.mist, legs: C.mist, build: 0.95, hat: 'bonnet', hatColor: C.mist }, 690, 'parasol'],
    boater: [{ hair: C.slate, hairStyle: 'short', coat: C.mist, legs: C.mist, hat: 'boater', moustache: 'clipped' }, 720, 'cane'],
    hoop: [{ hair: C.slate, hairStyle: 'short', coat: C.mist, legs: C.mist, build: 0.85 }, 440, 'hoop'],
    steward: [{ hair: C.slate, hairStyle: 'short', coat: C.newsprint, legs: C.mist, waistcoat: C.mist }, 700, 'tray'],
  };
  const [look, h, hold] = L[p.kind];
  const pose: PoseName = p.pose ?? (p.kind === 'hoop' ? 'walk' : p.kind === 'steward' ? 'holdPaper' : 'idle');
  return <Puppet {...pass(p)} pose={pose} height={p.height ?? h} look={look} expr={p.expr ?? 'smile'} hold={p.hold ?? hold} seed={p.seed ?? PASSENGER_KINDS.indexOf(p.kind) * 1.7} far />;
};
/** <Constable …> — bobby helmet, cape, bull's-eye lamp. Poses: walk sweepLamp lampLow (litBelow for faces lit from below). Height 740. */
export const Constable: React.FC<CharProps> = (p) => (
  <Puppet {...pass(p)} height={p.height ?? 740} expr={p.expr ?? 'neutral'} hold={p.hold ?? 'lamp'}
    look={{ hair: C.slate, hairStyle: 'short', coat: C.deep, coatLen: -200, legs: C.deep, build: 1.1, hat: 'helmet', cape: true, moustache: 'clipped' }} />
);
/** <Newsboy …> — cap, satchel of papers, shouting, arm up with a paper. Poses: shout holdBoard. Height 520. */
export const Newsboy: React.FC<CharProps> = (p) => (
  <Puppet {...pass(p)} height={p.height ?? 520} expr={p.expr ?? 'shout'} pose={p.pose ?? 'shout'} hold={p.hold ?? (p.pose === 'holdBoard' ? 'board' : 'paper')}
    look={{ hair: C.deep, hairStyle: 'short', coat: C.slate, legs: C.deep, build: 0.9, hat: 'cap', hatColor: C.deep, scarf: C.mist }}
    behind={<Print><Ink d={rrect(-110, -420, 90, 110, 10)} fill={C.mist} shade="R" sw={4} /><rect x={-104} y={-440} width={78} height={24} fill={C.newsprint} stroke={C.ink} strokeWidth={3} /></Print>} />
);

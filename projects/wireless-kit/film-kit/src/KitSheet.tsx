import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  C, FONT, Grade, Layer, Ink, Print, Halftone, FogBand, CameraRig, Plane, Spark, SparkTrail, MorseTap, CornerTab, TitlePlaque, Subtitle, EndCard,
  HonestyTag, HONESTY_TAGS, Captions, textChunk, Moustache, MOUSTACHE_STATES, Feather, FEATHER_STATES, DailyWire, WantedPoster, CrippenEngraving,
  Cora, CoraCameo, CrippenA, CrippenB, EthelA, EthelB, Clara, Paul, DewA, DewB, Kendall, Passenger, PASSENGER_KINDS, Constable, Newsboy, CAST_POSES, CAST_EXPRS,
  Telegram, TickerTape, WirelessKey, Notebook, PoliceLamp, Telescope, TelescopeView, HunchBulb, ClueRing, StoryBalloon, WallCalendar, RopeLadder, PilotCap, SeaBirds,
  Hilldrop, HilldropSection, CellarFloor, ScotlandYard, Sea, Montrose, Laurentic, MontroseDeck, MontroseCabin, WirelessRoom, RaceMap, FatherPoint, PilotBoat,
  Part, rrect, Snow,
} from './series';

/** A labelled mini-viewport showing a 1080×1920 world scene scaled into (x,y,w,h). */
const Panel: React.FC<{ x: number; y: number; w: number; h: number; label: string; vb?: string; fit?: 'slice' | 'meet'; children?: React.ReactNode }> = ({ x, y, w, h, label, vb = '0 0 1080 1920', fit = 'slice', children }) => (
  <g>
    <svg x={x} y={y} width={w} height={h} viewBox={vb} preserveAspectRatio={`xMidYMid ${fit}`} overflow="hidden"><rect x={-2000} y={-2000} width={6000} height={6000} fill={C.fog} />{children}</svg>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.ink} strokeWidth={3} />
    <rect x={x} y={y + h - 34} width={w} height={34} fill={C.newsprint} opacity={0.92} />
    <text x={x + 8} y={y + h - 10} fontFamily={FONT.ui} fontWeight={700} fontSize={22} fill={C.ink}>{label}</text>
  </g>
);
const Title: React.FC<{ t: string; sub?: string }> = ({ t, sub }) => (
  <g><rect x={0} y={0} width={1080} height={150} fill={C.deep} /><text x={40} y={70} fontFamily={FONT.display} fontSize={52} fill={C.newsprint}>{t}</text>
    {sub && <text x={40} y={118} fontFamily={FONT.ui} fontWeight={600} fontSize={26} fill={C.spark}>{sub}</text>}</g>
);
const grid = (n: number, cols: number, x0 = 20, y0 = 170, W = 1040, H = 1730) => {
  const rows = Math.ceil(n / cols); const w = W / cols, h = H / rows;
  return Array.from({ length: n }, (_, i) => ({ x: x0 + (i % cols) * w, y: y0 + Math.floor(i / cols) * h, w: w - 10, h: h - 10 }));
};

type Page = { name: string; dur?: number; still: number[]; render: (fr: number) => React.ReactNode };
const castPage = (name: string, pose: string[], draw: (fr: number, x: number, y: number, h: number, pose: any, expr: any, i: number) => React.ReactNode, exprs: string[], h = 520, extra?: (fr: number) => React.ReactNode): Page => ({
  name: `cast_${name.replace(/\(.*\)/, "").trim().replace(/[^A-Za-z0-9]+/g, "_")}`, still: [40], render: (fr) => {
    const items = [...pose.map((p) => ({ p, e: undefined as any })), ...exprs.map((e) => ({ p: 'stand', e }))];
    const cells = grid(items.length, 4, 20, 170, 1040, extra ? 1350 : 1730);
    return <Layer><Title t={name} sub={`poses: ${pose.join(' · ')} | expr: ${exprs.join(' · ')}`} />
      {cells.map((c, i) => <Panel key={i} {...c} label={items[i].e ? `expr ${items[i].e}` : items[i].p} vb={`-380 ${1500 - 1120} 760 1220`}>{draw(fr, 0, 1500, h, items[i].p, items[i].e, i)}</Panel>)}
      {extra?.(fr)}
    </Layer>;
  },
});

const PAGES: Page[] = [
  { name: 'look', still: [30], render: (fr) => <Layer>
    <Title t="Wireless Night: the look" sub="tokens · fonts · Halftone near/far · Print misregistration · Grade · FogBand ×2" />
    {(Object.keys(C) as (keyof typeof C)[]).map((k, i) => <g key={k} transform={`translate(${30 + (i % 4) * 258} ${190 + Math.floor(i / 4) * 120})`}><rect width={90} height={90} fill={C[k]} stroke={C.ink} strokeWidth={2} /><text x={100} y={36} fontFamily={FONT.ui} fontWeight={700} fontSize={24} fill={C.ink}>{k}</text><text x={100} y={66} fontFamily={FONT.wire} fontWeight={700} fontSize={20} fill={C.slate}>{C[k]}</text></g>)}
    <text x={30} y={730} fontFamily={FONT.display} fontSize={64} fill={C.ink}>Abril Fatface · CAUGHT</text>
    <text x={30} y={800} fontFamily={FONT.period} fontSize={44} fill={C.ink}>Old Standard TT <tspan fontWeight={700}>Bold</tspan> <tspan fontStyle="italic">Italic</tspan></text>
    <text x={30} y={860} fontFamily={FONT.wire} fontWeight={700} fontSize={44} fill={C.ink}>COURIER PRIME 700</text>
    <text x={30} y={920} fontFamily={FONT.ui} fontWeight={800} fontSize={44} fill={C.ink}>Hanken 800 <tspan fontWeight={600}>Hanken 600</tspan></text>
    <Print><Ink d={rrect(40, 970, 300, 300, 20)} fill={C.slate} shade="R" /><text x={60} y={1310} fontFamily={FONT.ui} fontWeight={700} fontSize={22} fill={C.ink}>Ink shade R (near dots)</text></Print>
    <Print far><Ink d={rrect(390, 970, 300, 300, 20)} fill={C.mist} shade="full" /><text x={400} y={1310} fontFamily={FONT.ui} fontWeight={700} fontSize={22} fill={C.ink}>far dots, full</text></Print>
    <Print off><Ink d={rrect(740, 970, 300, 300, 20)} fill={C.slate} shade="B" /><text x={750} y={1310} fontFamily={FONT.ui} fontWeight={700} fontSize={22} fill={C.ink}>Print off (no offset)</text></Print>
    <Halftone d="M60 1350 h300 v120 h-300Z" dots="cora" /><text x={60} y={1500} fontFamily={FONT.ui} fontWeight={700} fontSize={22} fill={C.ink}>Halftone cora (Cora's cheeks only)</text>
    <rect x={420} y={1350} width={620} height={240} fill={C.deep} /><FogBand fr={fr} y={1420} speed={1.5} seed={1} /><FogBand fr={fr} y={1520} speed={-0.8} seed={4} op={0.5} />
    <text x={430} y={1620} fontFamily={FONT.ui} fontWeight={700} fontSize={22} fill={C.ink}>two FogBands drifting (speeds 1.5 / −0.8)</text>
    <text x={30} y={1690} fontFamily={FONT.ui} fontWeight={700} fontSize={24} fill={C.ink}>Grade = this whole sheet: grain PNG cycle (2 f) 6 % multiply + deep vignette 25 %</text>
  </Layer> },
  { name: 'title', dur: 200, still: [55, 80, 96, 110, 121, 150, 185], render: (fr) => <>
    <CameraRig fr={fr} keys={[[0, { y: 900 }], [200, { y: 1000 }]]}><Plane depth={0.3}><Hilldrop fr={fr} variant="night" /></Plane></CameraRig>
    <CornerTab fr={fr} part={1} />
    <TitlePlaque fr={fr} at={72} outAt={170} offset={[0, -fr * 0.15]} />
    <Subtitle fr={fr} at={128} part={1} outAt={170} />
    <Captions fr={fr} chunks={textChunk('In 1910, a woman vanished in London.', 0, 200)} />
    <Layer><text x={60} y={1880} fontFamily={FONT.ui} fontWeight={700} fontSize={26} fill={C.newsprint}>plaque 58 · taps 72–118 · settled 120 (4.0 s) · subtitle 128 · lift 170 · f{fr}</text></Layer>
  </> },
  { name: 'subtitles', dur: 120, still: [8, 30, 60, 100], render: (fr) => <>
    <Layer><rect width={1080} height={1920} fill={C.slate} /><Title t="Subtitle beats + Captions + HonestyTag" sub="P1 footlights · P2 letters sprint off · P3 rubber stamp" /></Layer>
    {[1, 2, 3].map((p) => <AbsoluteFill key={p} style={{ transform: `translateY(${-330 + (p - 1) * 250}px)` }}><Subtitle fr={fr} at={0} part={p as Part} beatAt={20} /></AbsoluteFill>)}
    {HONESTY_TAGS.map((t, i) => <AbsoluteFill key={t} style={{ transform: `translateY(${-140 + i * 70}px)` }}><HonestyTag fr={fr} at={0} text={t} /></AbsoluteFill>)}
    <Captions fr={fr} chunks={textChunk('The captain had read about the missing doctor.', 0, 120)} />
  </> },
  ...([1, 2, 3] as Part[]).map((p): Page => ({ name: `endcard_p${p}`, dur: 90, still: [70], render: (fr) => <>
    <CameraRig fr={fr}><Plane><Sea fr={fr} sky="night" horizon={1100} /></Plane></CameraRig>
    <CornerTab fr={fr} part={p} />
    <EndCard fr={fr} at={10} part={p} />
  </> })),
  { name: 'spark', still: [20, 41], render: (fr) => <Layer>
    <rect width={1080} height={1920} fill={C.deep} /><Title t="The Spark" sub="idle · tap · ride (SparkTrail) · glint · star · MorseTap C-B-W" />
    {[['idle', 200], ['tap', 540], ['star', 880]].map(([m, x]) => <g key={m as string}><Spark fr={fr} x={x as number} y={360} mode={m as any} /><text x={x as number} y={470} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={28} fill={C.newsprint}>{m}</text></g>)}
    <path d="M80 700 Q540 520 1000 760" stroke={C.ink} strokeWidth={5} fill="none" />
    <SparkTrail fr={fr} path={[[80, 700], [300, 620], [540, 610], [800, 660], [1000, 760]]} t={0.35 + (fr % 60) / 100} len={0.3} />
    <text x={540} y={820} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={28} fill={C.newsprint}>ride along a telegraph wire</text>
    <g transform="translate(540 1030)"><circle r={60} fill="none" stroke={C.lamp} strokeWidth={8} /><Spark fr={fr} x={30} y={-20} mode="glint" at={fr - (fr % 20)} size={1.4} /></g>
    <text x={540} y={1140} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={28} fill={C.newsprint}>glint (8 f, on a lens)</text>
    <MorseTap fr={fr} at={0} code="-.-. -... .--" x={540} y={1350} />
    <text x={540} y={1500} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={28} fill={C.newsprint}>MorseTap "-.-. -... .--"</text>
  </Layer> },
  { name: 'moustache', still: [21, 32], render: (fr) => <Layer>
    <Title t="The Runaway Moustache" sub={MOUSTACHE_STATES.join(' · ')} />
    {MOUSTACHE_STATES.map((s, i) => { const x = 180 + (i % 3) * 360, y = 360 + Math.floor(i / 3) * 420; return <g key={s}><rect x={x - 160} y={y - 150} width={320} height={360} fill={C.newsprint} stroke={C.ink} strokeWidth={2} /><Moustache fr={fr} x={x} y={y} size={2} state={s} at={10} tilt={s === 'perch' ? 18 : 0} /><text x={x} y={y + 180} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={30} fill={C.ink}>{s}{s === 'perch' ? ' (tilt 18)' : ''}</text></g>; })}
    <g transform="translate(0 0)"><CrippenA fr={fr} x={540} y={1890} height={420} moustache="twitch" expr="nervous" /></g>
  </Layer> },
  { name: 'feather', still: [30], render: (fr) => <Layer>
    <Title t="Cora's Feather" sub={FEATHER_STATES.join(' · ')} />
    {FEATHER_STATES.map((s, i) => { const x = 140 + (i % 4) * 268, y = 700 + Math.floor(i / 4) * 680; return <g key={s}><rect x={x - 124} y={y - 470} width={248} height={560} fill={C.newsprint} stroke={C.ink} strokeWidth={2} />
      {s === 'pocketTip' && <rect x={x - 80} y={y - 4} width={160} height={90} fill={C.deep} />}
      {s === 'bookmark' && <rect x={x - 110} y={y - 130} width={120} height={160} fill={C.newsprint} stroke={C.ink} strokeWidth={3} />}
      <Feather fr={fr} x={s === 'bookmark' ? x - 10 : x} y={s === 'bookmark' ? y - 60 : y} size={1.2} state={s} t={s === 'curlToQuestion' ? 1 : undefined} />
      {s === 'curlToQuestion' && <Moustache fr={fr} x={x} y={y + 30} size={0.5} state="perch" tilt={20} />}
      <text x={x} y={y + 70} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={24} fill={C.ink}>{s}</text></g>; })}
  </Layer> },
  { name: 'curl', still: [0, 20, 40, 60], dur: 70, render: (fr) => <Layer>
    <Title t="Feather curlToQuestion t 0→1" sub="t = frame / 60; dot appears at t > 0.8 (questionDot for the Moustache)" />
    <Feather fr={fr} x={540} y={1250} size={2.4} state="curlToQuestion" t={Math.min(1, fr / 60)} />
  </Layer> },
  { name: 'dailywire', still: [6, 40], render: (fr) => <Layer>
    <Title t="The Daily Wire" sub="headline flip · dateline flip · 3 panels · ad · raceMap · fold · twist" />
    <DailyWire fr={fr} x={20} y={170} scale={0.5} date="16 JULY 1910" prevDate="31 JULY 1910" dateAt={0} headline="CELLAR DISCOVERY" prevHeadline="ONE PENNY NEWS!" headlineAt={0} ad />
    <DailyWire fr={fr} x={360} y={170} scale={0.5} date="16 JULY 1910" panels={[(f, w, h) => <Hilldrop fr={f} variant="snow" />, (f) => <CellarFloor fr={f} />, (f) => <WantedPoster fr={f} x={60 / 0.18} y={40 / 0.18} scale={0.36 / 0.18} variant="empty" />].map((fn) => (f: number, w: number, h: number) => <g transform="scale(0.18)">{fn(f, w, h)}</g>)} panelAt={[0, 8, 16]} />
    <DailyWire fr={fr} x={700} y={170} scale={0.5} date="31 JULY 1910" headline="THE GREAT CHASE" raceMap={<RaceMap fr={fr} w={600} laurentic={3 + Math.min(1, fr / 30) * 3} montrose={5} diceAt={0} />} />
    <DailyWire fr={fr} x={20} y={640} scale={0.5} date="1910" headline="GUILTY" fold={0.35} />
    <DailyWire fr={fr} x={360} y={640} scale={0.5} date="1910" headline="NOT GUILTY" fold={1} />
    <DailyWire fr={fr} x={700} y={640} scale={0.5} date="2007" prevDate="1910" dateAt={0} headline="2007" twist={0.35} />
    <WantedPoster fr={fr} x={40} y={1150} scale={0.75} variant="full" />
    <WantedPoster fr={fr} x={390} y={1150} scale={0.75} variant="walkOut" at={10} />
    <WantedPoster fr={fr} x={740} y={1150} scale={0.75} variant="empty" />
    <text x={40} y={1640} fontFamily={FONT.ui} fontWeight={700} fontSize={24} fill={C.ink}>row 1: headline/date flip + ad · panels R1–R3 sliding · raceMap (tokens hop, dice)</text>
    <text x={40} y={1676} fontFamily={FONT.ui} fontWeight={700} fontSize={24} fill={C.ink}>row 2: fold 0.35 · fold 1 · twist 0.35 | row 3: WANTED full · walkOut · empty</text>
  </Layer> },
  castPage('Cora (MUST P1, P3)', CAST_POSES.Cora, (fr, x, y, h, p, e) => <Cora fr={fr} x={x} y={y} pose={p} expr={e ?? (p === 'sing' ? 'sing' : p === 'laugh' ? 'laugh' : 'smile')} />, CAST_EXPRS.Cora, 520, (fr) => <g><text x={40} y={1560} fontFamily={FONT.ui} fontWeight={700} fontSize={26} fill={C.ink}>CoraCameo (P3 family tree):</text><CoraCameo fr={fr} x={540} y={1720} size={0.9} /></g>),
  castPage('Crippen A (doctor) + Moustache', CAST_POSES.CrippenA, (fr, x, y, h, p, e, i) => <CrippenA fr={fr} x={x} y={y} pose={p} expr={e} moustache={i === 0 ? 'twitch' : 'on'} glintAt={i === 0 ? fr - (fr % 20) : undefined} />, CAST_EXPRS.CrippenA),
  castPage('Crippen B ("Mr Robinson")', CAST_POSES.CrippenB, (fr, x, y, h, p, e) => <CrippenB fr={fr} x={x} y={y} pose={p} expr={e ?? (p === 'startled' ? 'startled' : undefined)} rail={p === 'dock' || p === 'shakeHead'} />, CAST_EXPRS.CrippenB),
  { name: 'cast_disguises', still: [30], render: (fr) => <Layer><Title t="Disguise pairs (read side by side)" sub="Crippen A/B · Ethel A/B · Dew A/B" />
    {[[<CrippenA fr={fr} x={0} y={1500} pose="stand" />, 'Crippen A'], [<CrippenB fr={fr} x={0} y={1500} pose="stand" />, 'Crippen B'], [<EthelA fr={fr} x={0} y={1500} pose="calm" brooch />, 'Ethel A (bun, brooch)'], [<EthelB fr={fr} x={0} y={1500} pose="stand" />, 'Ethel B'], [<DewA fr={fr} x={0} y={1500} pose="stand" />, 'Dew A'], [<DewB fr={fr} x={0} y={1500} pose="stand" />, 'Dew B (pilot)']].map(([n, l], i) => { const c = grid(6, 2)[i]; return <Panel key={i} {...c} label={l as string} vb="-420 380 840 1220">{n}</Panel>; })}
  </Layer> },
  castPage('Ethel A', CAST_POSES.EthelA, (fr, x, y, h, p, e, i) => <EthelA fr={fr} x={x} y={y} pose={p} expr={e} brooch={i === 0} />, CAST_EXPRS.EthelA, 520, (fr) => <g><text x={40} y={1560} fontFamily={FONT.ui} fontWeight={700} fontSize={26} fill={C.ink}>hair="bob" coat (P3, own coat and hat) · brooch toggle:</text>
    <svg x={20} y={1580} width={1040} height={320} viewBox="-1400 500 2800 1100">{[-900, -300, 300, 900].map((x, i) => i < 2 ? <EthelA key={i} fr={fr} x={x} y={1500} pose={i ? 'walk' : 'calm'} hair="bob" coat expr="smile" /> : <EthelA key={i} fr={fr} x={x} y={1500} pose="calm" brooch={i === 3} />)}</svg></g>),
  castPage('Ethel B ("Master Robinson")', CAST_POSES.EthelB, (fr, x, y, h, p, e, i) => <EthelB fr={fr} x={x} y={y} pose={p} expr={e} hankyClue={i === 0} capSlip={i === 1 ? 1 : 0} />, CAST_EXPRS.EthelB),
  castPage('Clara', CAST_POSES.Clara, (fr, x, y, h, p, e) => <Clara fr={fr} x={x} y={y} pose={p} expr={e ?? (p === 'leanAsk' ? 'raised' : undefined)} />, CAST_EXPRS.Clara),
  castPage('Paul', CAST_POSES.Paul, (fr, x, y, h, p, e) => <Paul fr={fr} x={x} y={y} pose={p} expr={e ?? (p === 'leanAsk' ? 'raised' : undefined)} />, CAST_EXPRS.Paul),
  castPage('Dew A (Inspector Walter Dew)', CAST_POSES.DewA, (fr, x, y, h, p, e) => <DewA fr={fr} x={x} y={y} pose={p} expr={e ?? (p === 'removeHat' ? 'still' : undefined)} />, CAST_EXPRS.DewA),
  castPage('Dew B (pilot disguise)', CAST_POSES.DewB, (fr, x, y, h, p, e) => <DewB fr={fr} x={x} y={y} pose={p} expr={e} bowlerPop={p === 'liftCap' ? 1 : 0} />, CAST_EXPRS.DewB),
  castPage('Captain Kendall', CAST_POSES.Kendall, (fr, x, y, h, p, e) => <g><Kendall fr={fr} x={x} y={y} pose={p} expr={e} />{p === 'think' && <HunchBulb fr={fr} x={0} y={500} at={0} size={1.4} />}</g>, CAST_EXPRS.Kendall),
  castPage('Constables + Newsboy', [...CAST_POSES.Constable, ...CAST_POSES.Newsboy], (fr, x, y, h, p, e, i) => i < 3 ? <Constable fr={fr} x={x} y={y} pose={p} litBelow={p === 'lampLow' ? 0.9 : 0} expr={p === 'lampLow' ? 'still' : undefined} /> : i < 5 ? <Newsboy fr={fr} x={x} y={y} pose={p} /> : <Constable fr={fr} x={x} y={y} expr={e} />, CAST_EXPRS.Constable),
  { name: 'cast_passengers', still: [30], render: (fr) => <Layer><Title t="Passengers ×4 (idle loops)" sub={PASSENGER_KINDS.join(' · ')} />
    {PASSENGER_KINDS.map((k, i) => { const c = grid(4, 2)[i]; return <Panel key={k} {...c} label={k} vb="-420 380 840 1220"><Passenger fr={fr} x={0} y={1500} kind={k} /></Panel>; })}</Layer> },
  { name: 'sets_hilldrop', still: [30], render: (fr) => <Layer><Title t="39 Hilldrop Crescent" sub="night · snow · day · door open" />
    {(['night', 'snow', 'day', 'open'] as const).map((v, i) => { const c = grid(4, 2)[i]; return <Panel key={v} {...c} label={v === 'open' ? 'night, door=1' : v}><Hilldrop fr={fr} variant={v === 'open' ? 'night' : v} door={v === 'open' ? 1 : 0} /></Panel>; })}</Layer> },
  { name: 'sets_section', still: [30], render: (fr) => <Layer><Title t="Dolls'-house section · closed cellar floor" sub="section (clock moving) · CellarFloor lamps=3, brick wobble · Scotland Yard out/in" />
    {[<HilldropSection fr={fr} clockSpeed={20} />, <CellarFloor fr={fr} wobbleAt={0} />, <ScotlandYard fr={fr} shutter={0.7} />, <ScotlandYard fr={fr} view="inside" />].map((n, i) => { const c = grid(4, 2)[i]; return <Panel key={i} {...c} label={['HilldropSection', 'CellarFloor', 'ScotlandYard outside (shutter .7)', 'ScotlandYard inside'][i]}>{n}</Panel>; })}</Layer> },
  { name: 'sets_sea', still: [30], render: (fr) => <Layer><Title t="Sea · Montrose · Laurentic" sub="sea day/night/dawn · ships" />
    {[<Sea fr={fr} sky="day" />, <Sea fr={fr} sky="night" />, <Sea fr={fr} sky="dawn" />, <g><Sea fr={fr} sky="night" horizon={1150} /><Montrose fr={fr} x={540} y={1250} scale={0.9} lit sparkMast /></g>, <g><Sea fr={fr} sky="day" horizon={1150} /><Montrose fr={fr} x={540} y={1250} scale={0.9} /></g>, <g><Sea fr={fr} sky="day" horizon={1150} /><Laurentic fr={fr} x={560} y={1250} scale={0.82} /></g>].map((n, i) => { const c = grid(6, 3)[i]; return <Panel key={i} {...c} fit="meet" label={['sea day', 'sea night', 'sea dawn', 'Montrose night lit', 'Montrose day', 'Laurentic'][i]}>{n}</Panel>; })}</Layer> },
  { name: 'sets_ship', still: [30], render: (fr) => <Layer><Title t="Montrose deck · cabins · wireless room" sub="deck (bridge plate, mast Spark) · captain's cabin · passenger cabin · WirelessRoom" />
    {[<MontroseDeck fr={fr} sparkMast />, <MontroseCabin fr={fr} kind="captain" door={0.5} />, <MontroseCabin fr={fr} kind="passenger" />, <WirelessRoom fr={fr} tapping tape="CRIPPEN MAY BE ON BOARD" tapeAt={0} />].map((n, i) => { const c = grid(4, 2)[i]; return <Panel key={i} {...c} label={['MontroseDeck', 'cabin captain (door .5)', 'cabin passenger', 'WirelessRoom'][i]}>{n}</Panel>; })}</Layer> },
  { name: 'sets_race', still: [10, 40], render: (fr) => <Layer><Title t="Race map · Father Point" sub="tokens hop (Laurentic 2→5), dice roll · dawn, beam, pilot boat" />
    <svg x={40} y={180} width={1000} height={1000} viewBox="0 0 600 600"><RaceMap fr={fr} laurentic={2 + Math.min(1, fr / 40) * 3} montrose={4} diceAt={0} /></svg>
    <Panel x={240} y={1200} width={0 as any} w={600} h={680} label="FatherPoint (boatX .4)" vb="0 400 1080 1240"><FatherPoint fr={fr} boatX={0.4} /></Panel></Layer> },
  { name: 'props_1', still: [20, 50], render: (fr) => <Layer><Title t="Props 1" sub="Telegram · TickerTape · WirelessKey · Notebook · PoliceLamp" />
    <Telegram fr={fr} x={40} y={190} scale={0.8} text="CRIPPEN MAY BE ON BOARD" typeAt={0} />
    <Telegram fr={fr} x={420} y={190} scale={0.8} text="AMERICA" fold={1} />
    <Telegram fr={fr} x={760} y={190} scale={0.65} text="HALF" fold={0.4} />
    <TickerTape fr={fr} x={80} y={520} text="CRIPPEN MAY BE ON BOARD · HELPER DRESSED AS BOY" at={0} len={900} />
    <WirelessKey fr={fr} x={260} y={830} tapping />
    <Notebook fr={fr} x={620} y={620} scale={0.6} open={0} />
    <Notebook fr={fr} x={830} y={620} scale={0.6} open={1} lines={['Story 2', 'Ran away?']} writeAt={0} bookmark />
    <rect x={20} y={1000} width={1040} height={330} fill={C.deep} />
    <PoliceLamp fr={fr} x={100} y={1160} angle={10} />
    <PoliceLamp fr={fr} x={600} y={1080} angle={60} beamLen={300} />
    <Telescope x={60} y={1420} angle={-8} extend={1} />
    <Telescope x={520} y={1420} angle={0} extend={0.2} />
    <text x={40} y={1850} fontFamily={FONT.ui} fontWeight={700} fontSize={22} fill={C.ink}>Telegram typing / folded / half · Ticker (newest letter spark) · key + spark gap</text><text x={40} y={1882} fontFamily={FONT.ui} fontWeight={700} fontSize={22} fill={C.ink}>Notebook closed / open + writing + bookmark · PoliceLamp ×2 · Telescope extend 1 / 0.2</text>
  </Layer> },
  { name: 'props_2', still: [8, 50], render: (fr) => <Layer><Title t="Props 2" sub="HunchBulb · ClueRing · StoryBalloon (picture, wet, fuzzy, text) · WallCalendar · RopeLadder · PilotCap · SeaBirds · TelescopeView" />
    <HunchBulb fr={fr} x={120} y={300} on={false} /><HunchBulb fr={fr} x={300} y={300} at={4} />
    <circle cx={520} cy={300} r={20} fill={C.slate} /><ClueRing fr={fr} at={0} x={520} y={300} r={60} />
    <StoryBalloon fr={fr} x={640} y={190} w={400} h={260} at={0} text="AMERICA" wet wetAt={6} picture={(f, w, h) => <g><Sea fr={f} sky="day" horizon={h * 0.5 / 0.6} /><g transform={`translate(${(f * 2) % w} ${h * 0.6}) scale(0.18)`}><Montrose fr={f} x={0} y={0} smoke={false} /></g></g>} />
    <StoryBalloon fr={fr} x={40} y={540} w={420} h={200} at={0} text="Where in America?" fontSize={38} />
    <StoryBalloon fr={fr} x={520} y={560} w={420} h={220} at={0} fuzzy text="Oh… somewhere…" fontSize={38} />
    <WallCalendar fr={fr} x={80} y={960} months={['February 1910', 'March 1910', 'November 1910']} flipAt={[10, 40]} scale={0.9} />
    <RopeLadder fr={fr} x={520} y={900} len={560} dropAt={0} />
    <PilotCap fr={fr} x={760} y={1000} liftAt={20} />
    <rect x={640} y={1150} width={420} height={300} fill={C.mist} /><SeaBirds fr={fr} count={4} area={[640, 1200, 420, 200]} />
    <svg x={20} y={1480} width={1040} height={400} viewBox="0 600 1080 700"><Sea fr={fr} sky="day" horizon={800} /><Passenger fr={fr} x={540} y={1250} kind="boater" height={500} /><TelescopeView cx={540 + Math.sin(fr / 20) * 200} cy={1000} r={260} /></svg>
  </Layer> },
];
const PAGE_DUR = 90;
export const kitPages = () => { let f = 0; return PAGES.map((p) => { const s = f; f += p.dur ?? PAGE_DUR; return { ...p, start: s, dur: p.dur ?? PAGE_DUR }; }); };
export const KIT_SHEET_FRAMES = kitPages().reduce((a, p) => a + p.dur, 0);
export const KitSheet: React.FC = () => {
  const fr = useCurrentFrame();
  const pg = kitPages().find((p) => fr >= p.start && fr < p.start + p.dur)!;
  const lf = fr - pg.start;
  return <Grade fr={fr}>{pg.render(lf)}</Grade>;
};

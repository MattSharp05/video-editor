import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT } from './series/tokens';
import { SeriesGrade } from './series/grade';
import { CameraRig, Plane } from './series/camera';
import { Vincenzo, Guard, ArtLover, Detective, Police, Geri, Spider, Crowd } from './series/characters';
import { MonaLisa } from './series/monalisa';
import { CornerTab, TitleCard, EndCard, NameTag, HonestyTag, LastTime } from './series/cards';
import { Captions, textChunk } from './series/captions';
import { Hooks, QuestionMark, FameGauge, Calendar, SmockBundle, FrameGlass, Trunk, Letter, Magnifier, Thumbprint, Newspaper, Postcard } from './series/props';
import { SalonCarre, LouvreExterior, Staircase, ParisStreet, PaperMap, LittleRoom, GeriDesk, PrisonCell, ModernLouvre, TRUNK_SPOT } from './series/sets';
import { PLANE, CarrierPush } from './series/camera';

// Each page shows one group of kit items in motion for PAGE frames.
const PAGE = 90;
const Label: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT.type} fontSize={26} fill={C.ink}>{t}</text>
);
const Floor: React.FC = () => <rect x={-200} y={1500} width={1480} height={600} fill={C.paperShade} />;

const pages: { name: string; render: (fr: number) => React.ReactNode }[] = [
  { name: 'vincenzo-costumes', render: (fr) => (
    <CameraRig fr={fr}><Plane><Floor />
      <Vincenzo fr={fr} x={200} y={1080} costume="smock" pose="walk" height={420} />
      <Vincenzo fr={fr} x={540} y={1080} costume="shirt" pose="poker" expr="poker" height={420} />
      <Vincenzo fr={fr} x={870} y={1080} costume="suit" pose="heartHand" expr="sad" height={420} facing={-1} />
      <Label x={200} y={1130} t="smock · walk" /><Label x={540} y={1130} t="shirt · poker" /><Label x={870} y={1130} t="suit · heartHand" />
      <Vincenzo fr={fr} x={200} y={1640} costume="smock" pose="rattle" expr="sweat" height={420} />
      <Vincenzo fr={fr} x={540} y={1640} costume="smock" pose="lift" expr="calm" height={420} hold={<MonaLisa fr={fr} x={0} y={-80} height={150} glow={0.5} />} />
      <Vincenzo fr={fr} x={870} y={1640} costume="suit" pose="surprised" expr="surprised" height={420} facing={-1} />
      <Label x={200} y={1690} t="rattle · sweat" /><Label x={540} y={1690} t="lift (holds her)" /><Label x={870} y={1690} t="surprised" />
    </Plane></CameraRig>) },
  { name: 'cast', render: (fr) => (
    <CameraRig fr={fr}><Plane><Floor />
      <Guard fr={fr} x={150} y={1050} variant="tall" pose="shrug" expr="worried" height={380} />
      <Guard fr={fr} x={370} y={1050} variant="short" pose="point" expr="jawDrop" height={320} />
      <Detective fr={fr} x={620} y={1050} pose="peer" expr="calm" height={380} />
      <Geri fr={fr} x={880} y={1050} pose="handshake" expr="wink" height={370} facing={-1} />
      <ArtLover fr={fr} x={130} y={1640} variant="tall" pose="stand" height={400} />
      <ArtLover fr={fr} x={320} y={1640} variant="medium" pose="stand" height={360} />
      <ArtLover fr={fr} x={490} y={1640} variant="short" pose="stand" height={320} monocle={false} />
      <Police fr={fr} x={700} y={1640} force="paris" pose="walk" height={380} />
      <Police fr={fr} x={900} y={1640} force="florence" pose="stand" height={380} tone={2} facing={-1} />
      <Spider fr={fr} x={540} y={420} size={3} thread={120} />
    </Plane></CameraRig>) },
  { name: 'crowds', render: (fr) => (
    <CameraRig fr={fr}><Plane>
      <rect x={-100} y={0} width={1280} height={2000} fill={C.paper} />
      <Crowd fr={fr} y={800} rows={3} perRow={7} era="1911" seed={3} />
      <Crowd fr={fr} y={1450} rows={3} perRow={7} era="today" phones flashAt={0} seed={5} />
    </Plane></CameraRig>) },
  { name: 'mona-lisa', render: (fr) => (
    <CameraRig fr={fr}><Plane>
      <rect x={-100} y={0} width={1280} height={2000} fill={C.paper} />
      <MonaLisa fr={fr} x={270} y={560} height={420} glow={0.5 + 0.4 * Math.sin(fr * 0.1)} glintAt={[10, 50]} />
      <MonaLisa fr={fr} x={780} y={560} height={420} frame glass glow={0.2} />
      <MonaLisa fr={fr} x={270} y={1150} height={420} board="back" glow={0} />
      <MonaLisa fr={fr} x={780} y={1150} height={420} turn={Math.min(1, (fr % 90) / 60)} glow={0.3} />
      <MonaLisa fr={fr} x={300} y={1580} height={110} crop="eyes" glow={0.6} glintAt={20} />
      <MonaLisa fr={fr} x={780} y={1580} height={90} crop="smile" glow={0.6} />
    </Plane></CameraRig>) },
  { name: 'cards', render: (fr) => (
    <>
      <CameraRig fr={fr}><Plane><rect x={-100} y={0} width={1280} height={2000} fill={C.stone} opacity={0.4} /></Plane></CameraRig>
      <CornerTab fr={fr} part={1} outAt={70} />
      <TitleCard fr={fr + 20} at={0} part={1} hangY={330} />
      <NameTag fr={fr} at={5} text="Vincenzo Peruggia" y={1170} />
      <HonestyTag fr={fr} at={5} text="Illustration" />
      <Captions fr={fr} chunks={[textChunk('He walks into her room.', 0, 1.4), textChunk('Then someone stole the Mona Lisa.', 1.4, 3)]} />
    </>) },
  { name: 'end-cards', render: (fr) => (
    <>
      <CameraRig fr={fr}><Plane><rect x={-100} y={0} width={1280} height={2000} fill={C.paperShade} /></Plane></CameraRig>
      <LastTime fr={fr} at={2} />
      <EndCard fr={fr} at={5} part={1} y={620} />
      <EndCard fr={fr} at={15} part={2} y={900} />
      <EndCard fr={fr} at={25} part={3} y={1250} hangFrom={[540, 1050]} />
    </>) },

  { name: 'devices', render: (fr) => (
    <CameraRig fr={fr}><Plane>
      <rect x={-100} y={0} width={1280} height={2000} fill={C.paper} />
      <Hooks fr={fr} x={230} y={330} state="empty" countAt={5} />
      <Label x={230} y={420} t="hooks · count 1-4" />
      <Hooks fr={fr} x={760} y={330} state="bend" bend={Math.min(1, fr / 60)} />
      <Label x={760} y={470} t="hooks · bend to ?" />
      <Hooks fr={fr} x={230} y={600} state="web" web={Math.min(1, fr / 50)} shadowLean={0} />
      <Label x={230} y={700} t="hooks · web" />
      <Hooks fr={fr} x={760} y={600} state="empty" shadowLean={Math.min(1, fr / 50)} />
      <QuestionMark fr={fr} x={230} y={980} size={1.2} />
      <QuestionMark fr={fr} x={480} y={980} size={1.2} straighten={Math.min(1, Math.max(0, (fr - 20) / 20))} />
      <QuestionMark fr={fr} x={780} y={960} size={0.9} stamp rot={-10} />
      <FameGauge fr={fr} x={300} y={1400} value={Math.min(1.1, fr / 70)} smoke={fr > 50 ? 1 : 0} odometer="100,000+" odoAt={30} />
      <Calendar fr={fr} x={780} y={1400} pages={['Monday', 'Tuesday', '1911', 'January 1914']} tearAt={[20, 45, 70]} />
    </Plane></CameraRig>) },
  { name: 'props-hiding', render: (fr) => (
    <CameraRig fr={fr}><Plane>
      <rect x={-100} y={0} width={1280} height={2000} fill={C.paperShade} />
      <SmockBundle fr={fr} x={270} y={400} leak={0.8} eyes={Math.min(1, fr / 30)} glintAt={45} />
      <FrameGlass fr={fr} x={780} y={420} split={Math.max(0, (fr - 20) / 40)} fall={180} thumb={1} />
      <Trunk fr={fr} x={270} y={1100} leak={0.5 + 0.5 * Math.sin(fr * 0.1)} eyes={1} />
      <Trunk fr={fr} x={780} y={1100} lid={Math.min(1, fr / 25)} contents="silk" falseBottom={Math.min(1, Math.max(0, (fr - 25) / 20))} silkPull={Math.min(1, Math.max(0, (fr - 50) / 25))} />
      <Letter fr={fr} x={270} y={1600} size={0.6} write={Math.min(1, fr / 50)} sign={Math.min(1, Math.max(0, (fr - 45) / 25))} dropAt={75} />
      <Letter fr={fr} x={780} y={1560} size={0.8} envelope rot={-4} />
    </Plane></CameraRig>) },
  { name: 'props-clues', render: (fr) => (
    <CameraRig fr={fr}><Plane>
      <rect x={-100} y={0} width={1280} height={2000} fill={C.paper} />
      <Thumbprint fr={fr} x={250} y={380} face />
      <Thumbprint fr={fr} x={760} y={380} maze={Math.min(1, fr / 60)} />
      <Magnifier x={300 + Math.sin(fr * 0.05) * 60} y={820} r={110} under={<Thumbprint fr={fr} x={250} y={820} size={0.8} />} id="m1" />
      <Magnifier x={780} y={820} r={60} giant rot={-20} />
      <Newspaper fr={fr} x={290} y={1430} size={0.85} rot={-3} />
      <Postcard fr={fr} x={780} y={1260} size={0.9} gag="balloon" />
      <Postcard fr={fr} x={780} y={1560} size={0.9} gag="eiffel" caption="Wish you were here!" rot={3} />
    </Plane></CameraRig>) },
  { name: 'set-salon-carre', render: (fr) => (
    <CameraRig fr={fr} keys={[[0, { x: 540, y: 1000, zoom: 0.85 }], [89, { x: 600, y: 980, zoom: 0.95 }]]}>
      <Plane depth={PLANE.backdrop}><SalonCarre fr={fr} only={['backdrop']} light="monday" /></Plane>
      <Plane depth={PLANE.mid}><SalonCarre fr={fr} only={['mid']} light="monday" hookCountAt={10} eyeFn={(i) => Math.sin(fr * 0.08 + i)} glintAt={60} /></Plane>
      <Plane><SalonCarre fr={fr} only={['actors']} />
        <Vincenzo fr={fr} x={300} y={1500} pose="walk" facing={1} lamp="right" />
        <ArtLover fr={fr} x={850} y={1500} variant="tall" pose="stand" facing={-1} />
      </Plane>
      <Plane depth={PLANE.fore} fore><SalonCarre fr={fr} only={['fore']} /></Plane>
    </CameraRig>) },
  { name: 'set-salon-empty-crowd', render: (fr) => (
    <CameraRig fr={fr} keys={[[0, { y: 1050, zoom: 0.8 }]]}>
      <Plane depth={PLANE.mid}><SalonCarre fr={fr} only={['backdrop', 'mid']} state="empty+web" web={1} /></Plane>
      <Plane><SalonCarre fr={fr} only={['actors']} state="crowd" /><Spider fr={fr} x={560} y={900} size={2} /></Plane>
    </CameraRig>) },
  { name: 'set-louvre-exterior', render: (fr) => (
    <CameraRig fr={fr} keys={[[0, { x: 540, y: 900, zoom: 0.7 }], [89, { x: 900, y: 900, zoom: 0.7 }]]}>
      <Plane depth={PLANE.backdrop}><LouvreExterior fr={fr} only={['backdrop']} /></Plane>
      <Plane depth={PLANE.far}><LouvreExterior fr={fr} only={['far']} /></Plane>
      <Plane><LouvreExterior fr={fr} only={['mid', 'actors']} liftIndex={7} lid={Math.max(0, (fr - 40) / 40)} /></Plane>
    </CameraRig>) },
  { name: 'set-staircase', render: (fr) => (
    <CameraRig fr={fr} keys={[[0, { zoom: 0.85, y: 1000 }]]}>
      <Plane><Staircase fr={fr} door={Math.max(0, Math.min(1, (fr - 50) / 20))} knobOff={fr > 30} />
        <FrameGlass fr={fr} x={160} y={1050} w={150} h={200} show="frame" split={Math.min(1, fr / 40)} fall={150} />
        <Vincenzo fr={fr} x={620} y={1500} pose="rattle" expr="sweat" under={<SmockBundle fr={fr} x={0} y={0} size={0.55} eyes={1} />} />
      </Plane>
    </CameraRig>) },
  { name: 'set-paris-street', render: (fr) => (
    <CameraRig fr={fr} keys={[[0, { x: 540, zoom: 0.9 }], [89, { x: 700, zoom: 0.9 }]]}>
      <Plane depth={PLANE.backdrop}><ParisStreet fr={fr} only={['backdrop']} /></Plane>
      <Plane depth={PLANE.far}><ParisStreet fr={fr} only={['far']} /></Plane>
      <Plane depth={PLANE.mid}><ParisStreet fr={fr} only={['mid']} /></Plane>
      <Plane><ParisStreet fr={fr} only={['actors']} /><Vincenzo fr={fr} x={420 + fr * 3} y={1500} pose="carryWalk" under={<SmockBundle fr={fr} x={0} y={0} size={0.55} />} /></Plane>
    </CameraRig>) },
  { name: 'set-paper-map', render: (fr) => (
    <CameraRig fr={fr}>
      <Plane><PaperMap fr={fr} view={fr < 45 ? 'paris' : 'europe'} fold={fr < 45 ? Math.max(0, (fr - 30) / 15) : Math.max(0, 1 - (fr - 45) / 15)} route={['Paris', 'Florence']} routeP={Math.min(1, Math.max(0, (fr - 60) / 25))} dot={fr < 45 ? [500 + fr * 4, 1000] : [790, 1290]} /></Plane>
    </CameraRig>) },
  { name: 'set-little-room', render: (fr) => (
    <CameraRig fr={fr} keys={[[0, { zoom: 0.85, y: 1050 }]]}>
      <Plane><LittleRoom fr={fr} night={fr > 60} curtain={Math.min(1, fr / 40)} stove={Math.min(1, fr / 30)} />
        <Trunk fr={fr} x={TRUNK_SPOT[0]} y={TRUNK_SPOT[1]} size={0.8} leak={0.7} eyes={0.8} />
        <Detective fr={fr} x={420} y={1500} pose="peer" hold={<Magnifier x={0} y={0} r={18} />} />
      </Plane>
    </CameraRig>) },
  { name: 'set-geri-desk', render: (fr) => (
    <CameraRig fr={fr} keys={[[0, { zoom: 0.85, y: 1050 }]]}>
      <Plane depth={PLANE.backdrop}><GeriDesk fr={fr} only={['backdrop', 'far']} /></Plane>
      <Plane><GeriDesk fr={fr} only={['mid']} /><Geri fr={fr} x={600} y={1420} pose="write" expr={fr > 45 ? 'surprised' : 'calm'} /><GeriDesk fr={fr} only={['actors']} />
        <Letter fr={fr} x={560} y={1200} size={0.35} rot={-8} /></Plane>
    </CameraRig>) },
  { name: 'set-prison-cell', render: (fr) => (
    <CameraRig fr={fr} keys={[[0, { zoom: 0.85, y: 1050 }]]}>
      <Plane><PrisonCell fr={fr} tally={Math.min(7, fr / 10)} postcard={<Postcard fr={fr} x={0} y={0} size={0.45} />} />
        <Vincenzo fr={fr} x={300} y={1500} costume="shirt" pose="sigh" expr="sad" /></Plane>
    </CameraRig>) },
  { name: 'set-modern-louvre', render: (fr) => (
    <CameraRig fr={fr} keys={[[0, { zoom: 0.9 }], [89, { zoom: 1.0 }]]}>
      <Plane depth={PLANE.backdrop}><ModernLouvre fr={fr} only={['backdrop']} /></Plane>
      <Plane depth={PLANE.mid}><ModernLouvre fr={fr} only={['mid']} glintAt={40} /></Plane>
      <Plane><ModernLouvre fr={fr} only={['actors']} flashAt={0} flow={1} /><QuestionMark fr={fr} x={760} y={760} stamp size={0.6} /></Plane>
      <Plane><Vincenzo fr={fr} x={850} y={1560} ghost pose="tipCap" /></Plane>
    </CameraRig>) },
  { name: 'carrier-push', render: (fr) => (
    <CarrierPush fr={fr} at={20} dur={40} x={540} y={1040} r={80}
      carrier={<circle r={100} fill={C.smock} stroke={C.ink} strokeWidth={6} />}
      becomes={<rect x={-70} y={-100} width={140} height={200} fill="#FFF6DD" stroke={C.ink} strokeWidth={6} />}
      next={<CameraRig fr={fr}><Plane><Staircase fr={fr} door={1} /></Plane></CameraRig>} toX={890} toY={1200} toR={60}>
      <CameraRig fr={fr}><Plane><SalonCarre fr={fr} /></Plane></CameraRig>
    </CarrierPush>) },
];
export const KIT_SHEET_FRAMES = pages.length * PAGE;
export const KIT_PAGES = pages.map((p) => p.name);
export const KitSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(pages.length - 1, Math.floor(frame / PAGE));
  const fr = frame - i * PAGE;
  return (
    <SeriesGrade fr={frame}>
      {pages[i].render(fr)}
      <AbsoluteFill><svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <text x={1040} y={1880} textAnchor="end" fontFamily={FONT.type} fontSize={26} fill={C.ink} opacity={0.6}>kit sheet · {pages[i].name}</text>
      </svg></AbsoluteFill>
    </SeriesGrade>
  );
};

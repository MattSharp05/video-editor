import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT } from './series/tokens';
import { SeriesGrade } from './series/grade';
import { CameraRig, Plane } from './series/camera';
import { Vincenzo, Guard, ArtLover, Detective, Police, Geri, Spider, Crowd } from './series/characters';
import { MonaLisa } from './series/monalisa';
import { CornerTab, TitleCard, EndCard, NameTag, HonestyTag, LastTime } from './series/cards';
import { Captions, textChunk } from './series/captions';

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

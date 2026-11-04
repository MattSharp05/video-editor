// Style A: luminous 3D. A dark world with fog; a modelled phone showing the real app; the saved
// TikToks are glowing cards that stream in on orange light trails and land as pins.
import React, {useMemo} from "react";
import {useThree} from "@react-three/fiber";
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender} from 'remotion';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {ThreeCanvas} from '../kit/three-canvas';
import {Finish} from '../kit/finish';
import {DUR, H, ORANGE, PHOTOS, TILES, W, ease, lerp, prog, tileT} from './shared';

const useTextures = (urls: string[]) => {
  const [tex, setTex] = React.useState<THREE.Texture[] | null>(null);
  const [handle] = React.useState(() => delayRender('textures'));
  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    Promise.all(urls.map((u) => loader.loadAsync(staticFile(u)))).then((t) => {
      t.forEach((x) => { x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; });
      setTex(t); continueRender(handle);
    });
  }, []);
  return tex;
};

const PW = 1.0, PH = PW * 2622 / 1206; // screen size in scene units

const Scene: React.FC<{fr: number; screen: THREE.Texture; photos: THREE.Texture[]}> = ({fr, screen, photos: src}) => {
  // one cropped 9:16 window per tile out of the landscape photos
  const photos = useMemo(() => TILES.map((t) => {
    const tx = src[t.i % src.length].clone();
    const img = tx.image as {width: number; height: number};
    const frac = (img.height * 9 / 16) / img.width;
    tx.repeat.set(frac, 1); tx.offset.set(((t.i * 0.23) % 1) * (1 - frac), 0); tx.needsUpdate = true;
    return tx;
  }), [src]);
  const body = useMemo(() => new RoundedBoxGeometry(PW + 0.08, PH + 0.08, 0.09, 8, 0.13), []);
  const cam = prog(fr, 0, DUR, ease);
  // camera: slow push-in and orbit
  const cx = lerp(0.5, 0.15, cam), cz = lerp(6.4, 5.4, cam), cy = lerp(0.5, 0.15, cam);
  const phoneRise = prog(fr, 0, 30, ease);
  return (
    <>
      <color attach="background" args={['#05070D']} />
      <fog attach="fog" args={['#05070D', 3.5, 11]} />
      <CameraRig x={cx} y={cy} z={cz} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[-3, 4, 5]} intensity={0.8} color="#9DB4FF" />
      <pointLight position={[0, 0.2, 1.4]} intensity={5} distance={5} color={ORANGE} />
      <directionalLight position={[3, 1.5, -2]} intensity={2.5} color="#FFB48A" />
      {/* floor with a faint reflection of light */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0A0D16" roughness={0.35} metalness={0.6} />
      </mesh>
      {/* phone */}
      <group position={[0, lerp(-0.4, -0.05, phoneRise), 0]} rotation={[lerp(-0.05, 0.02, cam), lerp(-0.45, -0.18, cam), 0]}>
        <mesh geometry={body} position={[0, 0, -0.05]}>
          <meshStandardMaterial color="#2A2C31" metalness={0.9} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[PW, PH]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
        {/* tiles flying in */}
        {TILES.map((t) => {
          const {burst, fly} = tileT(fr, t);
          const lx = (t.land[0] - 0.5) * PW, ly = (0.5 - t.land[1]) * PH;
          const ox = t.sx / 380 * 1.25, oy = t.sy / 380 * 0.85, oz = 0.4 + (t.i % 4) * 0.35;
          const at = (q: number) => {
            const arc = Math.sin(q * Math.PI) * 0.5;
            return [lerp(ox * burst, lx, q), lerp(oy * burst, ly, q) + arc * 0.2, lerp(oz * burst, 0.02, q) + arc] as const;
          };
          const [x, y, z] = at(fly);
          const s = lerp(0.46, 0.05, fly);
          const pin = prog(fr, 62 + t.delay, 74 + t.delay);
          return (
            <group key={t.i}>
              <mesh position={[x, y, z]} rotation={[0, lerp(0.3, 0, fly), (t.rot * (1 - fly)) * Math.PI / 180]}
                scale={[s, s * 16 / 9, 1]} visible={burst > 0.01 && pin < 1}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial map={photos[t.i]} transparent opacity={burst * (1 - pin)} toneMapped={false} />
              </mesh>
              {/* light trail: glowing beads along the path just travelled */}
              {fly > 0.02 && fly < 0.99 && Array.from({length: 14}, (_, k) => {
                const q = Math.max(0, fly - (k + 1) * 0.018);
                const [px, py, pz] = at(q);
                return (
                  <mesh key={k} position={[px, py, pz - 0.01]}>
                    <sphereGeometry args={[0.022 * (1 - k / 14) + 0.004, 8, 8]} />
                    <meshBasicMaterial color={ORANGE} toneMapped={false} transparent opacity={(1 - k / 14) * 0.95} />
                  </mesh>
                );
              })}
              <mesh position={[lx, ly, 0.01]} scale={pin}>
                <circleGeometry args={[0.028, 32]} />
                <meshBasicMaterial color={ORANGE} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
      </group>
      {/* dust near the lens */}
      <Dust />
    </>
  );
};

const CameraRig: React.FC<{x: number; y: number; z: number}> = ({x, y, z}) => {
  const {camera} = useThree();
  camera.position.set(x, y, z);
  camera.lookAt(0, -0.05, 0);
  (camera as THREE.PerspectiveCamera).fov = 38;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

const Dust: React.FC = () => {
  const pts = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const a = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      a[i * 3] = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 8 - 4;
      a[i * 3 + 1] = (Math.sin(i * 78.233) * 43758.5453 % 1) * 5 - 2.5;
      a[i * 3 + 2] = (Math.sin(i * 39.425) * 43758.5453 % 1) * 6 - 3;
    }
    g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    return g;
  }, []);
  return <points geometry={pts}><pointsMaterial size={0.012} color="#8899BB" transparent opacity={0.5} /></points>;
};

export const StyleLuminous: React.FC = () => {
  const fr = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const tex = useTextures(['vegas-bucket.png', ...PHOTOS]);
  return (
    <AbsoluteFill style={{background: '#05070D'}}>
      <Finish fr={fr} bloom={0.8}>
        {tex && (
          <ThreeCanvas width={width} height={height} linear={false}
            gl={{antialias: true, preserveDrawingBuffer: true}}>
            <Scene fr={fr} screen={tex[0]} photos={tex.slice(1)} />
          </ThreeCanvas>
        )}
      </Finish>
    </AbsoluteFill>
  );
};

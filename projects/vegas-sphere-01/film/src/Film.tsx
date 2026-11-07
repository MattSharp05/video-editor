// Vegas Sphere 01: one shot. Strip at dusk -> TV inflates into the Sphere -> push into one puck -> slapshot, wave,
// rails, tape, 48 LEDs, reels -> through a gap to the computer and back on a pulse -> long pull-back to the eye ->
// blink -> through the pupil into the dome -> out the top, the antenna blinked off -> the city.
// Layers: 2D background (sky, Strip, TV cabinet) | WebGL PuckField (the ball) | 2D props | captions.
import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import words from './words.json';
import B from './beats.json';
import {FRAG, VERT, DT} from './shader';
import {drawEmoji, PIC} from './pictures';
import {FPS, W, H, camAt, shaderState, eyeAt, worldAt, OUR, win, ramp, BACK, INTERIOR} from './timeline';
import {drawBG, drawFG, drawBackstage, drawInterior, drawEyeCanvas, GOLD} from './world';

export {FPS};
export const DUR = Math.ceil(B.total * FPS);

const LINES = [
  'Most people think the [Sphere] in Las Vegas', 'is one giant [TV.]',
  "But actually, it's over a [million] glowing [dots,]", 'with [gaps] between them.',
  'The outside is covered in lights', 'shaped like [hockey] [pucks.]', 'There are about [one] [point] [two] [million.]',
  'They sit on a [steel] [frame,]', 'about [eight] [inches] apart.', 'Each puck holds [forty] [eight] tiny lights.',
  'Each puck is [one] [dot] of the picture.', 'It can glow in millions of [colors.]',
  'A [computer] tells every puck', 'what color to show,', 'many times a [second.]',
  'Up close, you see [dots] and dark [gaps.]', 'From far away, your eyes', '[blend] them into one picture.',
  "That's how a giant [eyeball]", 'can [blink] on the whole building.',
  "Inside, there's a [second] [screen.]", "It's much [sharper,]", 'and it [wraps] over your head.',
  'So the Sphere is a million [little] [dots,]', 'and your [eyes] do the [rest.]',
];

type GLS = {gl: WebGL2RenderingContext; prog: WebGLProgram; texA: WebGLTexture; texB: WebGLTexture; loc: Record<string, WebGLUniformLocation | null>; eye: HTMLCanvasElement; eyeKey: string};
const UNI = ['uRes', 'uCam', 'uMorph', 'uPicA', 'uPicB', 'uDT', 'uOur', 'uMissing', 'uOurLit', 'uFieldLit', 'uWave', 'uLED', 'uLEDOn', 'uGlowBlur',
  'uReelT', 'uReelLand', 'uRepaint', 'uTime', 'uGap', 'uOurGlow', 'uTVScale', 'uStrobe', 'uGapCol'];

const setupGL = (cv: HTMLCanvasElement): GLS => {
  const gl = cv.getContext('webgl2', {preserveDrawingBuffer: true, premultipliedAlpha: true, antialias: false})!;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const al = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
  const tex = (unit: number, src: HTMLCanvasElement) => {
    const t = gl.createTexture()!; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    return t;
  };
  const em = document.createElement('canvas'); em.width = em.height = PIC; drawEmoji(em.getContext('2d')!);
  const eye = document.createElement('canvas'); eye.width = eye.height = PIC;
  drawEyeCanvas(eye.getContext('2d')!, {gx: 0, gy: 0, lid: 0, dil: 1});
  const texA = tex(0, em), texB = tex(1, eye);
  const loc: GLS['loc'] = {};
  for (const u of UNI) loc[u] = gl.getUniformLocation(prog, u);
  return {gl, prog, texA, texB, loc, eye, eyeKey: ''};
};

const Scene: React.FC<{t: number}> = ({t}) => {
  const bgRef = useRef<HTMLCanvasElement>(null), glRef = useRef<HTMLCanvasElement>(null), fgRef = useRef<HTMLCanvasElement>(null);
  const gls = useRef<GLS | null>(null);
  useLayoutEffect(() => {
    const world = worldAt(t);
    const bg = bgRef.current!.getContext('2d')!, fg = fgRef.current!.getContext('2d')!;
    fg.clearRect(0, 0, W, H);
    fg.fillStyle = 'rgba(0,0,0,0.01)'; fg.fillRect(0, 0, 1, 1);   // a cleared-only canvas may not be committed before the screenshot
    if (!gls.current) gls.current = setupGL(glRef.current!);
    const {gl, loc} = gls.current;
    const cam = camAt(t), st = shaderState(t);
    if (world === 'back') { drawBackstage(bg, t); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); return; }
    if (world === 'interior') { drawInterior(bg, t); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); return; }
    const glow = t < B.l6 ? 'rgba(255,190,80,0.22)' : 'rgba(150,170,255,0.2)';
    drawBG(bg, t, cam, st.morph, glow);
    // the eye picture, redrawn only when it changes
    const e = eyeAt(t), key = [e.gx, e.gy, e.lid, e.dil].map((v) => v.toFixed(3)).join(',');
    if (key !== gls.current.eyeKey) {
      drawEyeCanvas(gls.current.eye.getContext('2d')!, e);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, gls.current.texB);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gls.current.eye);
      gls.current.eyeKey = key;
    }
    gl.viewport(0, 0, W, H);
    gl.uniform2f(loc.uRes, W, H); gl.uniform3f(loc.uCam, cam.X, cam.Y, cam.R); gl.uniform1f(loc.uMorph, st.morph);
    gl.uniform1i(loc.uPicA, 0); gl.uniform1i(loc.uPicB, 1); gl.uniform1f(loc.uDT, DT); gl.uniform2f(loc.uOur, OUR[0], OUR[1]);
    gl.uniform1f(loc.uMissing, st.missing); gl.uniform1f(loc.uOurLit, st.ourLit); gl.uniform1f(loc.uFieldLit, st.fieldLit);
    gl.uniform1f(loc.uWave, st.waveR); gl.uniform1f(loc.uLED, st.led); gl.uniform1f(loc.uLEDOn, st.ledOn); gl.uniform1f(loc.uGlowBlur, st.glowBlur);
    gl.uniform1f(loc.uReelT, st.reelT); gl.uniform1f(loc.uReelLand, st.reelLand); gl.uniform1f(loc.uRepaint, st.repaint);
    gl.uniform1f(loc.uTime, t); gl.uniform1f(loc.uGap, st.gap); gl.uniform1f(loc.uOurGlow, st.ourGlow); gl.uniform1f(loc.uTVScale, st.tvScale);
    gl.uniform1f(loc.uStrobe, st.strobe); gl.uniform3f(loc.uGapCol, st.gapCol[0], st.gapCol[1], st.gapCol[2]);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.finish();
    drawFG(fg, t, cam, st.morph);
  }, [t]);
  const cs = {position: 'absolute', left: 0, top: 0, width: W, height: H} as const;
  const outside = worldAt(t) === 'out';
  return (
    <>
      <canvas ref={bgRef} width={W} height={H} style={cs} />
      <canvas ref={glRef} width={W} height={H} style={{...cs, visibility: outside ? 'visible' : 'hidden'}} />
      <canvas ref={fgRef} width={W} height={H} style={{...cs, visibility: outside ? 'visible' : 'hidden'}} />
    </>
  );
};

const Tag: React.FC<{text: string; o: number; y?: number}> = ({text, o, y = 1460}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: 0.85 * o, fontFamily: SANS, fontSize: 28, fontWeight: 700,
    letterSpacing: 3, textTransform: 'uppercase', color: '#fff', textShadow: '0 1px 10px rgba(0,0,0,0.9)'}}>{text}</div>
);

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const t = useCurrentFrame() / FPS;
  const w = worldAt(t);
  return (
    <AbsoluteFill style={{background: '#070a24'}}>
      <Scene t={t} />
      <Tag text="Illustration" o={w === 'interior' ? win(t, B.l8 + 1.0, B.l9 + 0.5, 0.3) : 0} />
      <Tag text="Simplified" y={560} o={w === 'back' ? win(t, B.l5 + 0.6, B.manytimes, 0.2) : 0} />
      {/* the light each pass-through carries, faded on the far side too, so no world change pops */}
      <AbsoluteFill style={{background: '#FFECC8', opacity: t >= BACK.out ? 0.9 * (1 - ramp(t, BACK.out, BACK.out + 0.35)) : 0}} />
      <AbsoluteFill style={{background: '#FFD6A0', opacity: w === 'out' && t < INTERIOR.in ? ramp(t, INTERIOR.in - 0.3, INTERIOR.in) : 0}} />
      <AbsoluteFill style={{background: '#5B2D6E', opacity: t >= INTERIOR.out ? 1 - ramp(t, INTERIOR.out, INTERIOR.out + 0.35) : 0}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 60%, rgba(4,4,10,0.35) 100%)'}} />
      {captions && <Captions t={t} words={words} lines={LINES} accent={GOLD} font={SANS} />}
    </AbsoluteFill>
  );
};

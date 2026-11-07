// The air inside the squiggle: balls pushed together (PUSH) and pulled apart (PULL) by the passing wave.
// Screen-space canvas; g = px per air unit (it grows with the dive zoom, so the balls emerge from the line).
import React, {useLayoutEffect, useRef} from 'react';
import {random} from 'remotion';

export const AIR = {lambda: 14, amp: 2.6, w: 2 * Math.PI * 0.95};
const disp = (x: number, t: number) => AIR.amp * Math.sin((2 * Math.PI * x) / AIR.lambda - AIR.w * t);
const comp = (x: number, t: number) => -Math.cos((2 * Math.PI * x) / AIR.lambda - AIR.w * t); // +1 = crowded

export const Air: React.FC<{t: number; g: number; op: number; ox: number; oy: number; waveOn: number}> = ({t, g, op, ox, oy, waveOn}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, 1080, 1920);
    if (op <= 0.001) { ctx.fillStyle = 'rgba(0,0,0,0.004)'; ctx.fillRect(0, 0, 1, 1); return; }
    ctx.globalAlpha = op;
    const bg = ctx.createLinearGradient(0, 0, 0, 1920);
    bg.addColorStop(0, '#1E2740'); bg.addColorStop(0.5, '#28304A'); bg.addColorStop(1, '#161C2C');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1920);
    const W = waveOn;
    // screen x of air point x0 (ox, oy = screen position of air origin)
    const x0min = Math.floor((-ox) / g) - 4, x0max = Math.ceil((1080 - ox) / g) + 4;
    const y0min = Math.floor((-oy) / g) - 2, y0max = Math.ceil((1920 - oy) / g) + 2;
    const r = g * 0.34;
    for (let j = y0min; j <= y0max; j++) {
      for (let i = x0min; i <= x0max; i++) {
        const jx = (random(`ax${i}_${j}`) - 0.5) * 0.5, jy = (random(`ay${i}_${j}`) - 0.5) * 0.5;
        const bx = i + jx + ((j & 1) ? 0.5 : 0);
        const own = Math.sin(t * (3 + random(`af${i}_${j}`) * 4) + i * 1.3 + j) * 0.12; // each ball jitters on its own
        const d = W * disp(bx, t) + own;
        const cp = W * comp(bx, t);
        const sx = ox + (bx + d) * g, sy = oy + (j + jy + Math.cos(t * 4 + i + j * 2) * 0.1) * g;
        if (sx < -r || sx > 1080 + r || sy < -r || sy > 1920 + r) continue;
        const warm = Math.max(0, cp), cool = Math.max(0, -cp);
        const R = Math.round(205 + 45 * warm - 40 * cool), G = Math.round(210 - 10 * warm - 5 * cool), Bc = Math.round(222 - 60 * warm + 25 * cool);
        ctx.fillStyle = `rgb(${R},${G},${Bc})`;
        ctx.beginPath(); ctx.ellipse(sx, sy, r * (1 - 0.18 * warm), r * (1 + 0.1 * warm), 0, 0, Math.PI * 2); ctx.fill();
        if (g > 24) {
          ctx.fillStyle = 'rgba(40,46,70,0.35)';
          ctx.beginPath(); ctx.ellipse(sx + r * 0.25, sy + r * 0.3, r * 0.55, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          ctx.beginPath(); ctx.arc(sx - r * 0.35, sy - r * 0.35, r * 0.22, 0, Math.PI * 2); ctx.fill();
          // a few balls have faces: eyes squeeze shut when crowded
          if (random(`face${i}_${j}`) < 0.06 || (i === 0 && j === 0)) {
            const sq = Math.max(0.12, 1 - warm * 0.9);
            ctx.fillStyle = '#1A1A22';
            for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx + s * r * 0.3, sy - r * 0.05, r * 0.1, r * 0.14 * sq, 0, 0, Math.PI * 2); ctx.fill(); }
            if (warm > 0.5) { ctx.strokeStyle = '#1A1A22'; ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.arc(sx, sy + r * 0.35, r * 0.15, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
          }
        }
      }
    }
    // the hero ball's label
    if (g > 24) {
      const hx = ox + (0 + W * disp(0, t)) * g, hy = oy;
      ctx.font = `800 ${Math.round(r * 0.55)}px 'Hanken Grotesk'`; ctx.textAlign = 'center'; ctx.lineWidth = r * 0.12; ctx.strokeStyle = 'rgba(10,12,20,0.85)';
      ctx.fillStyle = '#F4EEE2'; ctx.strokeText('AIR', hx, hy + r * 0.9); ctx.fillText('AIR', hx, hy + r * 0.9);
    }
    // the orange line: the air's crowding, drawn as the wave (it is the squiggle we followed)
    ctx.globalAlpha = op * (0.35 + 0.65 * Math.min(1, Math.max(0, (30 - g) / 20)));
    ctx.strokeStyle = '#FF8A3D'; ctx.lineWidth = Math.max(5, Math.min(10, g * 0.18)); ctx.lineCap = 'round';
    ctx.beginPath();
    for (let sx = 0; sx <= 1080; sx += 6) { const x = (sx - ox) / g; const y = oy - W * comp(x, t) * Math.min(g * 4.5, 330) - Math.max(0, (g - 20)) * 0; sx === 0 ? ctx.moveTo(sx, y) : ctx.lineTo(sx, y); }
    ctx.stroke();
    // PUSH / PULL ride on the bands
    if (g > 18) {
      ctx.globalAlpha = op * Math.min(1, (g - 18) / 10);
      const ph = (AIR.w * t) / (2 * Math.PI) * AIR.lambda; // crowd centres at x = ph + n λ
      ctx.font = `800 64px 'Hanken Grotesk'`; ctx.textAlign = 'center'; ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(10,12,20,0.85)';
      for (let n = -3; n <= 3; n++) {
        for (const [off, txt, col] of [[0, 'PUSH', '#FFD2AE'], [AIR.lambda / 2, 'PULL', '#BFD6FF']] as [number, string, string][]) {
          const x = ph + off + n * AIR.lambda; const sx = ox + x * g;
          if (sx < 60 || sx > 1020) continue;
          const sy = oy + 6.2 * g > 1450 ? 1450 : oy + 6.2 * g;
          ctx.fillStyle = col; ctx.strokeText(txt, sx, sy); ctx.fillText(txt, sx, sy);
        }
      }
    }
  });
  return <canvas ref={ref} width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none'}} />;
};

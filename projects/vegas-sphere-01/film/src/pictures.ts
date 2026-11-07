// The two pictures the Sphere shows, drawn in its own front-view coordinates (x,y in -1..1, y up) into 1024² canvases.
// Our own designs: a plain grinning emoji, and a cartoon eye with gaze, lids and pupil size.
export const PIC = 1024;
const S = PIC / 2;
const X = (x: number) => S + x * S, Y = (y: number) => S - y * S, L = (l: number) => l * S;

const bgFill = (c: CanvasRenderingContext2D, top: string, bot: string) => {
  const g = c.createLinearGradient(0, 0, 0, PIC);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fillRect(0, 0, PIC, PIC);
};

export function drawEmoji(c: CanvasRenderingContext2D, grin = 1, look = 0) {
  bgFill(c, '#1b2a6b', '#3a1c5c');
  // face
  const g = c.createRadialGradient(X(-0.25), Y(0.3), L(0.1), X(0), Y(0), L(0.86));
  g.addColorStop(0, '#FFE680'); g.addColorStop(0.7, '#FFC93A'); g.addColorStop(1, '#F29A1E');
  c.fillStyle = g; c.beginPath(); c.arc(X(0), Y(0), L(0.8), 0, Math.PI * 2); c.fill();
  // eyes
  // eyes: look (0..1) lifts them toward the antenna, with a catchlight that rolls up
  for (const s of [-1, 1]) {
    c.fillStyle = '#2a1606'; c.beginPath(); c.ellipse(X(0.27 * s + 0.02 * look), Y(0.24 + 0.06 * look), L(0.085), L(0.14 - 0.02 * look), 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(X(0.27 * s + 0.02 + 0.01 * look), Y(0.3 + 0.07 * look), L(0.028), 0, Math.PI * 2); c.fill();
  }
  // grin: a thick dark arc, wider with `grin`
  const a0 = Math.PI * (0.12 - 0.06 * grin), a1 = Math.PI * (0.88 + 0.06 * grin);
  c.strokeStyle = '#2a1606'; c.lineWidth = L(0.075); c.lineCap = 'round';
  c.beginPath(); c.arc(X(0), Y(0.04), L(0.48), a0, a1); c.stroke();
  // cheeks
  c.fillStyle = 'rgba(255,120,80,0.35)';
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(X(0.5 * s), Y(-0.12), L(0.1), L(0.06), 0, 0, Math.PI * 2); c.fill(); }
}

// gaze: x,y in about -1..1; lid 0 open .. 1 closed; dil pupil scale
export function drawEye(c: CanvasRenderingContext2D, gx = 0, gy = 0, lid = 0, dil = 1) {
  bgFill(c, '#3b1f4e', '#24133a');
  // sclera
  c.save();
  c.beginPath(); c.ellipse(X(0), Y(0), L(0.96), L(0.62), 0, 0, Math.PI * 2); c.clip();
  const sg = c.createRadialGradient(X(0), Y(0.05), L(0.1), X(0), Y(0), L(0.95));
  sg.addColorStop(0, '#ffffff'); sg.addColorStop(0.75, '#eef1f6'); sg.addColorStop(1, '#b9bfd0');
  c.fillStyle = sg; c.fillRect(0, 0, PIC, PIC);
  // veins, faint
  c.strokeStyle = 'rgba(220,90,90,0.25)'; c.lineWidth = L(0.008);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3, r0 = 0.62;
    c.beginPath(); c.moveTo(X(Math.cos(a) * 0.95), Y(Math.sin(a) * 0.6));
    c.quadraticCurveTo(X(Math.cos(a + 0.2) * 0.75), Y(Math.sin(a + 0.2) * 0.45), X(Math.cos(a) * r0), Y(Math.sin(a) * r0 * 0.6)); c.stroke();
  }
  // iris + pupil
  const ix = gx * 0.42, iy = gy * 0.22;
  const ig = c.createRadialGradient(X(ix), Y(iy), L(0.05), X(ix), Y(iy), L(0.36));
  ig.addColorStop(0, '#7fe0ff'); ig.addColorStop(0.55, '#2a8fd8'); ig.addColorStop(1, '#123a7a');
  c.fillStyle = ig; c.beginPath(); c.arc(X(ix), Y(iy), L(0.36), 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(10,30,70,0.8)'; c.lineWidth = L(0.025); c.stroke();
  c.fillStyle = '#05060a'; c.beginPath(); c.arc(X(ix), Y(iy), L(0.15 * dil), 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.ellipse(X(ix - 0.09), Y(iy + 0.1), L(0.055), L(0.04), -0.5, 0, Math.PI * 2); c.fill();
  c.restore();
  // lids close from top and bottom (top travels 3/4 of the way)
  const top = 1.3 - lid * 1.56, bot = -1.3 + lid * 1.08;   // quadratic control y: the lid edge's middle sits at half of it
  c.fillStyle = '#5b2d6e';
  c.beginPath(); c.moveTo(0, 0); c.lineTo(PIC, 0); c.lineTo(PIC, Y(0)); c.quadraticCurveTo(X(0), Y(top), 0, Y(0)); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(0, PIC); c.lineTo(PIC, PIC); c.lineTo(PIC, Y(0)); c.quadraticCurveTo(X(0), Y(bot), 0, Y(0)); c.closePath(); c.fill();
  // lid lines
  c.strokeStyle = '#2a1238'; c.lineWidth = L(0.03);
  c.beginPath(); c.moveTo(0, Y(0)); c.quadraticCurveTo(X(0), Y(top), PIC, Y(0)); c.stroke();
}

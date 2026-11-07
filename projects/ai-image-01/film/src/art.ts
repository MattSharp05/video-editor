// All pictures in the film are drawn here with Canvas 2D paths (our own art, no images): the target picture (a dog
// surfing on a pizza on a wave), the three "real photos" of the collage myth, and the captioned training photos.
// Every drawing works in a 400x300 box (4:3) and is scaled to the canvas it is drawn into.
export type Draw = (c: CanvasRenderingContext2D) => void;

const ell = (c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot = 0) => {
  c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
};
const lin = (c: CanvasRenderingContext2D, y0: number, y1: number, stops: [number, string][]) => {
  const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g;
};

// the dog, standing side-on, facing right; origin at the feet centre
const dog = (c: CanvasRenderingContext2D, x: number, y: number, s: number, tilt = 0) => {
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s);
  c.fillStyle = '#B5652B';
  // tail
  c.strokeStyle = '#B5652B'; c.lineWidth = 9; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-42, -52); c.quadraticCurveTo(-66, -70, -60, -96); c.stroke();
  // legs
  c.lineWidth = 12;
  [[-30, -30], [-16, -30], [18, -30], [32, -30]].forEach(([lx, ly]) => { c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + 2, -4); c.stroke(); });
  // body
  ell(c, 0, -48, 50, 26); c.fill();
  c.fillStyle = '#E9B987'; ell(c, 4, -38, 34, 12); c.fill();
  // head
  c.fillStyle = '#B5652B'; ell(c, 50, -86, 28, 26); c.fill();
  // snout
  c.fillStyle = '#E9B987'; ell(c, 74, -78, 20, 13, 0.1); c.fill();
  c.fillStyle = '#1E1410'; ell(c, 92, -82, 7, 6); c.fill();
  // mouth + tongue
  c.strokeStyle = '#1E1410'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(70, -68); c.quadraticCurveTo(80, -64, 88, -70); c.stroke();
  c.fillStyle = '#F07A8A'; ell(c, 80, -62, 6, 8, 0.2); c.fill();
  // eye
  c.fillStyle = '#1E1410'; ell(c, 58, -94, 5, 6); c.fill();
  c.fillStyle = '#fff'; ell(c, 60, -96, 1.8, 1.8); c.fill();
  // ear (floppy, dark)
  c.fillStyle = '#6E3716'; c.beginPath(); c.moveTo(34, -104); c.quadraticCurveTo(18, -84, 30, -58); c.quadraticCurveTo(44, -70, 46, -102); c.closePath(); c.fill();
  // collar
  c.strokeStyle = '#E2453C'; c.lineWidth = 6; c.beginPath(); c.moveTo(30, -70); c.quadraticCurveTo(38, -60, 50, -62); c.stroke();
  c.restore();
};

const pizza = (c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot = 0) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = '#8F4A1C'; ell(c, 0, 6, rx, ry); c.fill(); // underside / thickness
  c.fillStyle = '#E0953C'; ell(c, 0, 0, rx, ry); c.fill(); // crust
  c.fillStyle = '#FFD45A'; ell(c, 0, 0, rx * 0.86, ry * 0.8); c.fill(); // cheese
  c.fillStyle = '#F2B23A'; ell(c, -rx * 0.3, -ry * 0.1, rx * 0.2, ry * 0.18); c.fill();
  c.fillStyle = '#D23A2A';
  [[-0.5, -0.2], [0.1, -0.4], [0.5, 0.05], [-0.15, 0.35], [0.3, 0.45], [-0.6, 0.3], [0.65, -0.35]].forEach(([px, py]) => {
    ell(c, px * rx * 0.75, py * ry * 0.75, rx * 0.11, ry * 0.12); c.fill();
  });
  c.restore();
};

const sea = (c: CanvasRenderingContext2D) => {
  // the curling wave: a big blue body rising from the right, curling over at the top left
  c.fillStyle = '#1C6FB0';
  c.beginPath(); c.moveTo(0, 300); c.lineTo(0, 210); c.bezierCurveTo(60, 200, 120, 190, 170, 170);
  c.bezierCurveTo(250, 140, 300, 60, 360, 70); c.bezierCurveTo(400, 75, 410, 110, 390, 130);
  c.bezierCurveTo(372, 110, 350, 108, 336, 122); c.bezierCurveTo(320, 170, 330, 230, 400, 250); c.lineTo(400, 300); c.closePath(); c.fill();
  c.fillStyle = '#2E8FD0';
  c.beginPath(); c.moveTo(0, 300); c.lineTo(0, 235); c.bezierCurveTo(100, 220, 200, 215, 300, 230); c.bezierCurveTo(350, 238, 380, 255, 400, 262); c.lineTo(400, 300); c.closePath(); c.fill();
  // foam lip
  c.strokeStyle = '#F4FBFF'; c.lineWidth = 10; c.lineCap = 'round';
  c.beginPath(); c.moveTo(300, 92); c.bezierCurveTo(330, 64, 380, 60, 394, 100); c.stroke();
  c.lineWidth = 5; c.beginPath(); c.moveTo(20, 222); c.bezierCurveTo(80, 212, 130, 206, 170, 190); c.stroke();
  c.fillStyle = '#F4FBFF';
  [[386, 120, 6], [372, 132, 4], [395, 140, 3], [60, 214, 4], [120, 204, 3]].forEach(([fx, fy, r]) => { ell(c, fx, fy, r, r); c.fill(); });
  // light streaks in the wave face
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 3;
  [[200, 170, 260, 130], [230, 190, 300, 150], [280, 160, 320, 120]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); });
};

const sky = (c: CanvasRenderingContext2D, top = '#7EC8F0', bot = '#FFE0B0') => {
  c.fillStyle = lin(c, 0, 300, [[0, top], [1, bot]]); c.fillRect(0, 0, 400, 300);
};
const sun = (c: CanvasRenderingContext2D, x: number, y: number, r: number, col = '#FFF1A8') => {
  c.fillStyle = 'rgba(255,240,170,0.35)'; ell(c, x, y, r * 1.6, r * 1.6); c.fill();
  c.fillStyle = col; ell(c, x, y, r, r); c.fill();
};

// The target picture: a dog surfing on a pizza on a wave
export const drawTarget: Draw = (c) => {
  sky(c); sun(c, 70, 60, 26);
  c.fillStyle = 'rgba(255,255,255,0.8)'; ell(c, 160, 50, 30, 10); c.fill(); ell(c, 185, 44, 22, 10); c.fill();
  sea(c);
  pizza(c, 205, 196, 92, 24, -0.12);
  dog(c, 200, 186, 1.05, -0.1);
  // spray behind the board
  c.fillStyle = '#F4FBFF'; [[104, 214, 7], [94, 202, 5], [88, 220, 4], [116, 206, 3]].forEach(([x, y, r]) => { ell(c, x, y, r, r); c.fill(); });
};

// The collage myth's "real photos"
export const drawDogPhoto: Draw = (c) => {
  c.fillStyle = lin(c, 0, 300, [[0, '#9FB59A'], [1, '#6E8A6A']]); c.fillRect(0, 0, 400, 300);
  c.fillStyle = '#5D7A55'; c.fillRect(0, 230, 400, 70);
  dog(c, 150, 262, 1.55);
};
export const drawPizzaPhoto: Draw = (c) => {
  c.fillStyle = '#7A4B2E'; c.fillRect(0, 0, 400, 300);
  c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 3;
  for (let y = 20; y < 300; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(400, y + 8); c.stroke(); }
  c.fillStyle = '#E9E4DA'; ell(c, 200, 150, 170, 128); c.fill();
  pizza(c, 200, 146, 140, 100);
};
export const drawWavePhoto: Draw = (c) => {
  sky(c, '#9AD2F2', '#E9F3F7'); sea(c);
  // a surfer: little person on a board
  c.fillStyle = '#F2F2F2'; c.save(); c.translate(250, 150); c.rotate(-0.4); ell(c, 0, 0, 34, 7); c.fill(); c.restore();
  c.strokeStyle = '#2A1C14'; c.lineWidth = 6; c.lineCap = 'round';
  c.beginPath(); c.moveTo(240, 146); c.lineTo(248, 120); c.lineTo(262, 140); c.moveTo(248, 120); c.lineTo(250, 100); c.moveTo(250, 108); c.lineTo(232, 104); c.moveTo(250, 108); c.lineTo(268, 98); c.stroke();
  c.fillStyle = '#2A1C14'; ell(c, 251, 92, 7, 7); c.fill();
};

// Training photos (line 9) with their captions
export const drawCar: Draw = (c) => {
  sky(c, '#A9CFE8', '#E8EEF0'); c.fillStyle = '#8A8F94'; c.fillRect(0, 220, 400, 80);
  c.fillStyle = '#D8322B';
  c.beginPath(); c.moveTo(70, 220); c.lineTo(80, 180); c.lineTo(140, 172); c.lineTo(175, 130); c.lineTo(270, 130); c.lineTo(310, 175); c.lineTo(345, 185); c.lineTo(350, 220); c.closePath(); c.fill();
  c.fillStyle = '#BFE2F5'; c.beginPath(); c.moveTo(185, 140); c.lineTo(222, 140); c.lineTo(222, 172); c.lineTo(160, 174); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(232, 140); c.lineTo(265, 140); c.lineTo(295, 174); c.lineTo(232, 174); c.closePath(); c.fill();
  c.fillStyle = '#222'; ell(c, 130, 222, 26, 26); c.fill(); ell(c, 295, 222, 26, 26); c.fill();
  c.fillStyle = '#AAA'; ell(c, 130, 222, 11, 11); c.fill(); ell(c, 295, 222, 11, 11); c.fill();
};
export const drawCat: Draw = (c) => {
  c.fillStyle = '#E8D7C2'; c.fillRect(0, 0, 400, 300);
  c.fillStyle = '#3F6A7A'; c.fillRect(30, 150, 340, 110); c.fillRect(20, 120, 60, 140); c.fillRect(320, 120, 60, 140);
  c.fillStyle = '#4F7D8E'; c.fillRect(80, 110, 240, 60);
  c.fillStyle = '#E08A3A'; ell(c, 200, 160, 70, 34); c.fill(); ell(c, 262, 128, 32, 30); c.fill();
  c.beginPath(); c.moveTo(240, 108); c.lineTo(248, 80); c.lineTo(262, 102); c.moveTo(270, 102); c.lineTo(286, 82); c.lineTo(290, 112); c.fill();
  c.fillStyle = '#1E1410'; ell(c, 254, 126, 3.5, 5); c.fill(); ell(c, 274, 126, 3.5, 5); c.fill();
  c.strokeStyle = '#E08A3A'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(134, 166); c.quadraticCurveTo(100, 190, 120, 214); c.stroke();
};
export const drawBeach: Draw = (c) => {
  c.fillStyle = lin(c, 0, 190, [[0, '#4A3A7A'], [0.6, '#E86A4A'], [1, '#FFC46A']]); c.fillRect(0, 0, 400, 190);
  sun(c, 200, 180, 40, '#FFE08A');
  c.fillStyle = '#2C5A8A'; c.fillRect(0, 186, 400, 50);
  c.fillStyle = 'rgba(255,200,120,0.6)'; c.fillRect(170, 192, 60, 4); c.fillRect(180, 204, 40, 3); c.fillRect(188, 216, 24, 3);
  c.fillStyle = '#E8C48A'; c.fillRect(0, 236, 400, 64);
};
export const drawHouse: Draw = (c) => {
  sky(c, '#8FC6EA', '#DDEFF8'); c.fillStyle = '#6FA85A'; c.fillRect(0, 230, 400, 70);
  c.fillStyle = '#F1E3C8'; c.fillRect(120, 140, 160, 100);
  c.fillStyle = '#B4463A'; c.beginPath(); c.moveTo(105, 145); c.lineTo(200, 75); c.lineTo(295, 145); c.closePath(); c.fill();
  c.fillStyle = '#6B4A30'; c.fillRect(185, 185, 32, 55);
  c.fillStyle = '#9FD0EE'; c.fillRect(140, 165, 30, 26); c.fillRect(232, 165, 30, 26);
};
export const drawTree: Draw = (c) => {
  sky(c, '#BFE0F0', '#F4F0E0'); c.fillStyle = '#8CB86A'; c.fillRect(0, 240, 400, 60);
  c.fillStyle = '#6A4A2E'; c.fillRect(188, 150, 24, 100);
  c.fillStyle = '#3E8A46'; ell(c, 200, 120, 80, 70); c.fill(); c.fillStyle = '#52A458'; ell(c, 180, 104, 46, 40); c.fill();
};
export const drawBird: Draw = (c) => {
  sky(c, '#7FB8E0', '#D8ECF6');
  c.fillStyle = '#F2C230'; ell(c, 200, 160, 54, 40); c.fill(); ell(c, 246, 124, 28, 26); c.fill();
  c.fillStyle = '#E07A20'; c.beginPath(); c.moveTo(270, 120); c.lineTo(296, 128); c.lineTo(270, 136); c.closePath(); c.fill();
  c.fillStyle = '#1E1410'; ell(c, 252, 118, 4, 4); c.fill();
  c.fillStyle = '#D9A820'; ell(c, 186, 158, 34, 18, -0.4); c.fill();
  c.fillStyle = '#6A4A2E'; c.fillRect(120, 200, 180, 8);
};

export const TRAINING: {id: string; cap: string; draw: Draw}[] = [
  {id: 'car', cap: 'red car', draw: drawCar}, {id: 'cat', cap: 'cat on a sofa', draw: drawCat},
  {id: 'beach', cap: 'beach at sunset', draw: drawBeach}, {id: 'house', cap: 'a small house', draw: drawHouse},
  {id: 'tree', cap: 'oak tree', draw: drawTree}, {id: 'bird', cap: 'yellow bird', draw: drawBird},
];

// Render a drawing into a canvas of any size (scaled from the 400x300 box)
export const paint = (cv: HTMLCanvasElement, d: Draw) => {
  const c = cv.getContext('2d')!; c.save(); c.scale(cv.width / 400, cv.height / 300); d(c); c.restore();
};
const urls = new Map<string, string>();
export const picURL = (key: string, d: Draw, w = 400, h = 300) => {
  if (!urls.has(key)) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; paint(cv, d); urls.set(key, cv.toDataURL('image/png'));
  }
  return urls.get(key)!;
};

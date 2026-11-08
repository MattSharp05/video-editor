// "Wireless Night" palette (pictures-pick §1.1). No literal colours anywhere else in the kit or the parts.
export const C = {
  fog: '#D5DED9',        // farthest plane, sky, fog bands. Never a character fill.
  newsprint: '#E4E7DF',  // paper: Daily Wire, posters, telegrams, notebook, ticker, labels, end card
  mist: '#9DB3B5',       // mid plane: far buildings, crowds, jury, passengers
  slate: '#557482',      // near plane: clothes, hull, walls, furniture
  deep: '#26414F',       // darkest fill: night sea, coats, bowler, caption stroke. (Pure black is never used.)
  ink: '#14222A',        // line work and halftone dots only (fills ≤ 10 % of frame)
  skin: '#F0E4D4',       // faces and hands
  spark: '#6FF3FF',      // THE accent: follow this
  sparkCore: '#FFFFFF',
  sparkHalo: '#2FB8E0',  // used at 40 %
  cora: '#FF6F87',       // Cora and her cause only
  clue: '#FFD23F',       // clues only; never a flood, never > 2 % of frame
  lamp: '#FFB98A',       // light only (halos, panes, footlights, dawn sun)
  captionText: '#F7F1E6',// derived: skin-white for caption text
} as const;
export type Tone = keyof typeof C;

export const FONT = {
  display: "'Abril Fatface', serif",        // plaque, headlines, shop fronts, ship names
  period: "'Old Standard TT', serif",       // datelines, signs, labels, notebook cover
  wire: "'Courier Prime', monospace",       // ticker, telegrams, end card body
  ui: "'Hanken Grotesk', sans-serif",       // captions (800), tab and tags (600)
} as const;

export const FRAME = { w: 1080, h: 1920, fps: 30 } as const;
/** Reels safe zones (BUILD-BRIEF): nothing important in the top 220, bottom 420, or x > 930 at y > 1100. */
export const SAFE = { top: 220, bottom: 1500, rightLow: 930, rightLowFromY: 1100, captionTop: 1300, captionBottom: 1470, tagTop: 1150, tagBottom: 1250 } as const;
/** Parallax planes (pick §1.4). Farther = paler (use the far halftone + fog/mist fills). */
export const PLANE = { far: 0.2, mid: 0.5, near: 1, fore: 1.4 } as const;
/** Near-scale character height (Dew A). Crippen is 0.8× Dew. */
export const NEAR_H = 760;
export const FLOOR_Y = 1500;

// The Stolen Smile: series tokens. Every colour in the series comes from here (pictures-pick §1.1).
export const C = {
  paper: '#F1E6CF', paperShade: '#DCCBA8', card: '#F8F1E1', ink: '#231B16', sepia: '#7A5A3C',
  stone: '#A39A8A', nightBlue: '#2C3A57', duskBlue: '#5B6F93', oldGold: '#8E7347',
  amber: '#F2A93B', amberGlow: '#FFD27A', // amber = ONLY her (or what hides her)
  clueRed: '#B8352A', silk: '#A72B2E',     // red = only the mystery
  skin1: '#E9C3A0', skin2: '#D9A57F', skin3: '#C08A64', skin4: '#9C6B4B',
  // costume / prop tokens named in the pick
  smock: '#F7F3EA', trunk: '#EDE8DD', glass: '#DDE6EE', phoneWhite: '#FFFFFF',
  // kit additions (decided by the kit builder): dark cloth for suits/tailcoats, plain shirt, shadow
  suit: '#3A3631', shirt: '#EFE8DA', shadow: 'rgba(35,27,22,0.28)', parquet: '#C9B48D', wood: '#B08A5E',
} as const;
export const SKINS = [C.skin1, C.skin2, C.skin3, C.skin4];
export type Skin = 1 | 2 | 3 | 4;
export const skin = (n: Skin) => SKINS[n - 1];

export const FONT = {
  caption: "'Hanken Grotesk', sans-serif", // 800
  type: "'Special Elite', monospace",       // labels, dates, tags, stamps
  display: "'Playfair Display', serif",     // 900: logotype, headlines, posters
} as const;

export const W = 1080, H = 1920, FPS = 30;
// Reels safe area (BUILD-BRIEF + pick §1.5)
export const SAFE = { top: 220, bottom: 1920 - 420, right: 930 };
export const STROKE = { figure: 3.5, prop: 2.5 } as const;
export const VINCENZO_H = 560; // the size unit
export const MONA_H = 270;     // true scale next to Vincenzo

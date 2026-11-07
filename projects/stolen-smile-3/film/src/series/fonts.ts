// Fonts bundled in public/fonts (OFL). Import this module once (SeriesGrade does).
import { continueRender, delayRender, staticFile } from 'remotion';
const FACES: [string, string, string][] = [
  ['Hanken Grotesk', '800', 'HankenGrotesk-800.woff2'],
  ['Special Elite', '400', 'SpecialElite-400.woff2'],
  ['Playfair Display', '900', 'PlayfairDisplay-900.woff2'],
];
let started = false;
export const loadSeriesFonts = () => {
  if (started || typeof document === 'undefined') return; started = true;
  const h = delayRender('series fonts');
  Promise.all(FACES.map(([fam, w, file]) => {
    const f = new FontFace(fam, `url(${staticFile('fonts/' + file)})`, { weight: w });
    document.fonts.add(f); return f.load();
  })).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};
loadSeriesFonts();

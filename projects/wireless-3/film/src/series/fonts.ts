// Series fonts in public/fonts (all OFL, Google Fonts). Loaded once by <Grade>/<KitDefs>.
import { continueRender, delayRender, staticFile } from 'remotion';
const FACES: [string, string, string, string?][] = [
  ['Abril Fatface', '400', 'AbrilFatface-400.woff2'],
  ['Old Standard TT', '400', 'OldStandardTT-400.woff2'],
  ['Old Standard TT', '700', 'OldStandardTT-700.woff2'],
  ['Old Standard TT', '400', 'OldStandardTT-400i.woff2', 'italic'],
  ['Courier Prime', '700', 'CourierPrime-700.woff2'],
  ['Hanken Grotesk', '600', 'HankenGrotesk-600.woff2'],
  ['Hanken Grotesk', '700', 'HankenGrotesk-700.woff2'],
  ['Hanken Grotesk', '800', 'HankenGrotesk-800.woff2'],
];
let started = false;
export const loadSeriesFonts = () => {
  if (started || typeof document === 'undefined') return; started = true;
  const h = delayRender('wireless fonts');
  Promise.all(FACES.map(([fam, w, file, style]) => {
    const f = new FontFace(fam, `url(${staticFile('fonts/' + file)})`, { weight: w, style: style ?? 'normal' });
    (document.fonts as unknown as { add: (f: FontFace) => void }).add(f); return f.load();
  })).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};
loadSeriesFonts();

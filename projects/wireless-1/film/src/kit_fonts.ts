// Fonts bundled locally (Google Fonts, OFL): series fonts (pick §1.2) + Hanken Grotesk (repo).
import {continueRender, delayRender, staticFile} from 'remotion';
const FACES: [string, string, string, string?][] = [
  ['Hanken Grotesk', '500', 'HankenGrotesk-500.woff2'], ['Hanken Grotesk', '600', 'HankenGrotesk-700.woff2'], ['Hanken Grotesk', '700', 'HankenGrotesk-700.woff2'],
  ['Hanken Grotesk', '800', 'HankenGrotesk-800.woff2'], ['Abril Fatface', '400', 'AbrilFatface-400.woff2'],
  ['Old Standard TT', '400', 'OldStandardTT-400.woff2'], ['Old Standard TT', '700', 'OldStandardTT-700.woff2'],
  ['Old Standard TT', '400', 'OldStandardTT-400i.woff2', 'italic'], ['Courier Prime', '700', 'CourierPrime-700.woff2'],
];
const handle = delayRender('fonts');
Promise.all(FACES.map(([fam, w, file, style]) => {
  const f = new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w, style: style ?? 'normal'});
  document.fonts.add(f);
  return f.load();
})).then(() => continueRender(handle));

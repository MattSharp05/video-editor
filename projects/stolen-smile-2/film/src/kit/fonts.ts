// Fonts bundled locally (Google Fonts, OFL): the render browser can't reach fonts.gstatic.com here.
import {continueRender, delayRender, staticFile} from 'remotion';

const FACES: [string, string, string, string?][] = [
  ['Hanken Grotesk', '500', 'HankenGrotesk-500.woff2'], ['Hanken Grotesk', '700', 'HankenGrotesk-700.woff2'],
  ['Hanken Grotesk', '800', 'HankenGrotesk-800.woff2'], ['Special Elite', '400', 'SpecialElite-400.woff2'],
  ['Playfair Display', '900', 'PlayfairDisplay-900.woff2'],
  ['Playfair Display', '900', 'PlayfairDisplay-900italic.woff2', 'italic'],
];
const handle = delayRender('fonts');
Promise.all(FACES.map(([fam, w, file, style]) => {
  const f = new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w, style: style ?? 'normal'});
  document.fonts.add(f);
  return f.load();
})).then(() => continueRender(handle));

export const SANS = "'Hanken Grotesk', sans-serif";
export const TYPE = "'Special Elite', monospace";
export const MARKER = "'Permanent Marker', cursive";

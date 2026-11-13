// Fonts bundled locally (OFL): the render browser can't reach Google Fonts here.
import {continueRender, delayRender, staticFile} from 'remotion';
const FACES: [string, string, string][] = [
  ['Hanken Grotesk', '500', 'HankenGrotesk-500.woff2'], ['Hanken Grotesk', '700', 'HankenGrotesk-700.woff2'],
  ['Hanken Grotesk', '800', 'HankenGrotesk-800.woff2'],
  ['Overpass Mono', '600', 'OverpassMono-600.woff2'], // line-printer listing (gothic monospace, OFL)
  ['VT323', '400', 'VT323-400.woff2'],                // terminal screen text (OFL)
];
const handle = delayRender('fonts');
Promise.all(FACES.map(([fam, w, file]) => {
  const f = new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w});
  document.fonts.add(f);
  return f.load();
})).then(() => continueRender(handle));
export const SANS = "'Hanken Grotesk', sans-serif";
export const PRINTER = "'Overpass Mono', 'Courier New', monospace";
export const TERMINAL = "'VT323', 'Courier New', monospace";

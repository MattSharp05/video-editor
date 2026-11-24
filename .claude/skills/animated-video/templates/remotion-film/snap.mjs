// Stills from one bundle plus findings.json: what the browser reported while drawing them.
// Called by snap.sh (use that); direct use, from the film folder so the packages resolve:
//   node snap.mjs <bundle-dir> <outdir> <sec> [sec...]
//   env: SCALE (default 1), PAR (stills at a time, default 2), COMP (default Film),
//        FINDINGS_ALLOW (allow-list file, default ./findings-allow.txt)
// Writes <outdir>/t<sec>.png and <outdir>/findings.json; exit 1 when any finding is `fail`.
// Uses @remotion/renderer, installed with @remotion/cli (pin it to the same version if you add it yourself).
//
// Findings (kind -> severity):
//   render_error   the still threw (an error in the film, an <Img> that failed, a delayRender timeout)  fail
//   page_error     an uncaught exception in the page                                                     fail
//   console_error  console.error                                                                          fail
//   console_warn   console.warn                                                                           warn
//   load_failed    a request that failed or answered >= 400 (missing image, texture, json, font)          fail
//   remote_request any http(s)/ws request outside localhost (CDN, API, remote image)                       fail
//   font_not_in_tree  a font file requested from outside localhost                                       fail
//   font_failed    a declared @font-face that did not load                                               fail
//   font_undeclared  DOM text whose font family has no @font-face (a system font: differs by machine)     warn
// Allow-list: one regular expression per line ('#' comments), matched against "kind: message url".
// Allowed findings stay in the file with "allowed": true and never fail the run.
import {createRequire, SourceMap} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [bundle, out, ...secs] = process.argv.slice(2);
if (!bundle || !out || !secs.length) { console.error('usage: node snap.mjs <bundle-dir> <outdir> <sec> [sec...]'); process.exit(2); }
const require = createRequire(path.resolve('package.json'));
const R = require('@remotion/renderer');
const findings = new Map(), notes = [];
fs.mkdirSync(out, {recursive: true});

// The film's remotion.config.ts (gl renderer, delayRender timeout, browser) applies here as in the CLI.
const opt = {gl: null, timeout: 30000, browserExecutable: null, chromeMode: 'headless-shell'};
try {
  const {BrowserSafeApis} = require('@remotion/renderer/client');
  if (fs.existsSync('remotion.config.ts')) await import(path.resolve('remotion.config.ts'));
  const g = (k) => BrowserSafeApis.options[k].getValue({commandLine: {}}).value;
  Object.assign(opt, {gl: g('glOption'), timeout: g('delayRenderTimeoutInMillisecondsOption'),
    browserExecutable: g('browserExecutableOption'), chromeMode: g('chromeModeOption')});
} catch (e) { notes.push(`remotion.config.ts not applied (${e.message.split('\n')[0]}); defaults used`); }

// Map a bundle position to the film's source file and line.
const maps = new Map();
const where = (url, line, col) => {
  try {
    const file = path.join(bundle, new URL(url).pathname.replace(/^\//, ''));
    if (!maps.has(file)) maps.set(file, fs.existsSync(file + '.map') ? new SourceMap(JSON.parse(fs.readFileSync(file + '.map', 'utf8'))) : null);
    const e = maps.get(file)?.findEntry(line, col ?? 0);
    if (e?.originalSource) return `${e.originalSource.replace(/^webpack:\/\/[^/]*\//, '').replace(/^\.\//, '')}:${e.originalLine + 1}`;
  } catch {}
  return url ? `${url}:${line + 1}` : null;
};
const fromStack = (frames = []) => {
  for (const f of frames) {
    const w = f?.url && where(f.url, f.lineNumber ?? 0, f.columnNumber);
    if (w && !/node_modules|\/remotion\/|\/react-dom\//.test(w)) return w;
  }
  return frames[0]?.url ? where(frames[0].url, frames[0].lineNumber ?? 0, frames[0].columnNumber) : null;
};
const add = (kind, severity, message, frame, extra = {}) => {
  if (extra.source) extra.source = extra.source.replace(/https?:\/\/(localhost|127\.0\.0\.1):\d+\//, '');
  message = message.replace(/https?:\/\/(localhost|127\.0\.0\.1):\d+/g, '').replace(/\b\d+ms\b/g, 'Nms');
  if (extra.url && local(extra.url)) try { const u = new URL(extra.url); extra.url = u.pathname + u.search; } catch {} // workers serve on different ports
  const key = `${kind}|${message}|${extra.url ?? ''}|${extra.source ?? ''}`;
  const f = findings.get(key) ?? {kind, severity, message, ...extra, frames: []};
  if (!f.frames.includes(frame)) f.frames.push(frame);
  findings.set(key, f);
};
const local = (u) => { try { const h = new URL(u).hostname; return ['localhost', '127.0.0.1', '[::1]', '0.0.0.0'].includes(h); } catch { return true; } };
const remote = (u) => /^(https?|wss?):/i.test(u) && !local(u);

// In the page, after the frame is drawn: every declared font and its state, and DOM text in undeclared families.
const FONT_PROBE = `(() => {
  const faces = [...document.fonts].map(f => ({family: f.family.replace(/^["']|["']$/g, ''), status: f.status}));
  const declared = new Set(faces.map(f => f.family.toLowerCase()));
  const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[a-z-]+|-apple-system|blinkmacsystemfont|emoji|math|fangsong|inherit|initial)$/i;
  const used = new Set();
  for (const el of document.querySelectorAll('body *')) {
    if (/^(STYLE|SCRIPT|NOSCRIPT|TITLE|TEMPLATE)$/.test(el.tagName) || !el.getClientRects().length) continue;
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const first = getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
    if (first && !generic.test(first) && !declared.has(first.toLowerCase())) used.add(first);
  }
  return {faces, undeclared: [...used]};
})()`;

// One browser per worker, so every request and message is tied to the frame that worker is drawing.
const launch = async () => {
  const st = {frame: 'load'};
  const browser = await R.openBrowser('chrome', {browserExecutable: opt.browserExecutable, chromeMode: opt.chromeMode,
    chromiumOptions: {gl: opt.gl ?? undefined}, logLevel: 'error'});
  const newPage = browser.newPage.bind(browser);
  browser.newPage = async (args) => {
    const page = await newPage(args), client = page._client(), reqs = new Map();
    client.on('Network.requestWillBeSent', (e) => {
      const u = e.request.url; reqs.set(e.requestId, {url: u, type: e.type});
      if (!remote(u)) return;
      if (e.type === 'Font') add('font_not_in_tree', 'fail', 'font loaded from outside the project: put the file in public/ with an @font-face', st.frame, {url: u});
      else add('remote_request', 'fail', `${e.type ?? 'request'} to a remote host: download it into public/`, st.frame, {url: u});
    });
    client.on('Network.responseReceived', (e) => {
      if (e.response.status >= 400) add('load_failed', 'fail', `${e.type ?? 'resource'} answered HTTP ${e.response.status}`, st.frame, {url: e.response.url});
    });
    client.on('Network.loadingFailed', (e) => {
      const r = reqs.get(e.requestId) ?? {};
      if (!e.canceled && !/^data:|^blob:/.test(r.url ?? '')) add('load_failed', 'fail', `${e.type ?? r.type ?? 'resource'} failed: ${e.errorText}`, st.frame, {url: r.url});
    });
    // Probe fonts just before Remotion closes the page: the frame has been drawn by then.
    const close = page.close.bind(page);
    page.close = async (...a) => {
      try {
        if (st.frame === 'load') return close(...a);
        const r = await client.send('Runtime.evaluate', {expression: FONT_PROBE, returnByValue: true});
        const v = (r?.value?.result ?? r?.result)?.value ?? {faces: [], undeclared: []};
        for (const f of v.faces) if (f.status === 'error') add('font_failed', 'fail', `@font-face "${f.family}" did not load`, st.frame);
        for (const fam of v.undeclared) add('font_undeclared', 'warn', `text in "${fam}" has no @font-face: a system font, which differs between machines`, st.frame);
      } catch {}
      return close(...a);
    };
    return page;
  };
  return {browser, st};
};
const log = (st) => (l) => {
  if (/^Failed to load resource/.test(l.text)) return; // the network listener reports these, with the URL
  const sev = l.type === 'error' ? 'fail' : l.type === 'warning' || l.type === 'warn' ? 'warn' : null;
  if (!sev) return;
  let text = l.text.split('\n')[0].replace(/^\[\]/, '').slice(0, 500);
  if (/^JSHandle@/.test(text)) text = `console.${l.type === 'error' ? 'error' : 'warn'} with an object argument (often React or Remotion reporting the error listed beside it)`;
  const kind = /^Uncaught /.test(text) ? 'page_error' : sev === 'fail' ? 'console_error' : 'console_warn';
  add(kind, sev, text, st.frame, {source: fromStack(l.stackTrace)});
};
const srcOf = (e) => {
  const sf = [e?.symbolicatedStackFrames, e?.stackFrame].flat().filter(Boolean).find((x) => x.originalFileName && !/node_modules/.test(x.originalFileName));
  return sf ? `${sf.originalFileName.replace(/^webpack:\/\/[^/]*\//, '').replace(/^\.\//, '')}:${sf.originalLineNumber}` : null;
};
const scale = Number(process.env.SCALE || 1), par = Math.max(1, Math.min(Number(process.env.PAR || 2), secs.length));
const workers = [await launch()];
let comp;
try {
  comp = await R.selectComposition({serveUrl: bundle, id: process.env.COMP || 'Film', puppeteerInstance: workers[0].browser,
    onBrowserLog: log(workers[0].st), chromiumOptions: {gl: opt.gl ?? undefined}, timeoutInMilliseconds: opt.timeout, logLevel: 'error'});
} catch (e) { add('render_error', 'fail', String(e.message ?? e).split('\n')[0].slice(0, 500), 'load', {source: srcOf(e)}); }
while (comp && workers.length < par) workers.push(await launch());
const todo = comp ? [...secs] : [], stills = [];
await Promise.all(workers.map(async ({browser, st}) => {
  while (todo.length) {
    const s = todo.shift(), frame = Math.min(comp.durationInFrames - 1, Math.round(Number(s) * comp.fps)), file = path.join(out, `t${s}.png`);
    st.frame = frame; fs.rmSync(file, {force: true}); // no stale still on the sheet when this one fails
    try {
      await R.renderStill({composition: comp, serveUrl: bundle, frame, output: file, scale, overwrite: true, puppeteerInstance: browser,
        onBrowserLog: log(st), chromiumOptions: {gl: opt.gl ?? undefined}, timeoutInMilliseconds: opt.timeout, logLevel: 'error'});
      stills.push(file);
    } catch (e) { add('render_error', 'fail', String(e.message ?? e).split('\n')[0].slice(0, 500), frame, {source: srcOf(e)}); }
  }
}));
await Promise.all(workers.map((w) => w.browser.close({silent: true}).catch(() => {})));

// Allow-list.
const allowFile = process.env.FINDINGS_ALLOW || 'findings-allow.txt', allow = [];
if (fs.existsSync(allowFile)) for (const l of fs.readFileSync(allowFile, 'utf8').split('\n')) {
  const t = l.trim(); if (t && !t.startsWith('#')) try { allow.push(new RegExp(t)); } catch { notes.push(`bad allow-list line: ${t}`); }
}
const list = [...findings.values()].map((f) => {
  f.frames.sort((a, b) => (a === 'load' ? -1 : b === 'load' ? 1 : a - b));
  const line = `${f.kind}: ${f.message} ${f.url ?? ''}`;
  return allow.some((r) => r.test(line)) ? {...f, allowed: true} : f;
});
const count = (sev) => list.filter((f) => f.severity === sev && !f.allowed).length;
const report = {ok: count('fail') === 0, fail: count('fail'), warn: count('warn'), allowed: list.filter((f) => f.allowed).length,
  composition: comp?.id ?? null, fps: comp?.fps ?? null, stills: stills.length, of: secs.length, allowList: fs.existsSync(allowFile) ? path.resolve(allowFile) : null,
  notes, findings: list.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'fail' ? -1 : 1))};
fs.writeFileSync(path.join(out, 'findings.json'), JSON.stringify(report, null, 1) + '\n');
for (const f of list.filter((f) => !f.allowed)) console.error(`${f.severity.toUpperCase()} ${f.kind}: ${f.message}${f.url ? ' ' + f.url : ''}${f.source ? ' (' + f.source + ')' : ''} [frames ${f.frames.join(',')}]`);
for (const n of notes) console.error(`NOTE ${n}`);
console.error(`findings: ${report.fail} fail, ${report.warn} warn, ${report.allowed} allowed -> ${path.join(out, 'findings.json')}`);
process.exit(report.fail ? 1 : 0);

// Render each style frame (HTML page) to a 1080x1920 PNG.
// Usage: node render.cjs [name ...]   (names = html files without extension; default all)
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const names = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(dir).filter(f => /^[a-z]-.*\.html$/.test(f)).map(f => f.replace('.html', ''));
(async () => {
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files']});
  fs.mkdirSync(path.join(dir, 'png'), {recursive: true});
  for (const n of names) {
    for (const beat of [1, 2]) {
      const page = await browser.newPage({viewport: {width: 1080, height: 1920}, deviceScaleFactor: 1});
      page.on('console', m => { if (m.type() === 'error') console.log(n, beat, m.text()); });
      page.on('pageerror', e => console.log(n, beat, 'PAGEERROR', e.message));
      await page.goto('file://' + path.join(dir, n + '.html') + '?beat=' + beat);
      await page.waitForFunction('window.__ready === true', null, {timeout: 60000}).catch(() => console.log(n, beat, 'no ready flag'));
      await page.screenshot({path: path.join(dir, 'png', `${n}-beat${beat}.png`)});
      await page.close();
      console.log('ok', n, beat);
    }
  }
  await browser.close();
})();

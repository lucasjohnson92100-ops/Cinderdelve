// Exporte des affiches d'exemple en SVG autonomes (assets/), à partir du moteur de dessin d'index.html.
// Usage : NODE_PATH=$(npm root -g) node export_posters.js   (Chromium via Playwright)
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname;
const server = http.createServer((req, res) => fs.readFile(path.join(root, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0])), (e, b) => { res.writeHead(e ? 404 : 200); res.end(b); })).listen(0, async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
  const p = await b.newPage();
  await p.goto(`http://localhost:${server.address().port}/`, { waitUntil: 'domcontentloaded' });
  const out = await p.evaluate(() => {
    const r = {};
    for (const k of Object.keys(TPL)) r['affiche-' + k] = poster(example(k), { intro: true });
    const t = { ...example('anniversaire'), format: 'toise', title: 'Le chemin de Jade', names: 'Jade', start: '2018-05-04', end: '2026-05-04',
      events: [['2019-06-01', 'Premiers pas', 'steps'], ['2021-09-01', "Entrée à l'école", 'school'], ['2023-07-10', 'Premier voyage', 'ship'], ['2025-05-04', 'Le chiot Pistache', 'puppy']].map(([date, title, icon]) => ({ date, title, icon, a: {} })),
      measures: [{ date: '2020-05-04', cm: 92 }, { date: '2022-05-04', cm: 108 }, { date: '2024-05-04', cm: 121 }] };
    r.toise = poster(t, { intro: true });
    return r;
  });
  for (const [k, svg] of Object.entries(out)) fs.writeFileSync(path.join(root, 'assets', k + '.svg'), svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '));
  console.log(Object.keys(out).join(', '));
  await b.close(); server.close();
});

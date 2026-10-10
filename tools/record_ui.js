// Enregistre en temps réel (vidéo Playwright) les écrans de progression : cages, grille de héros, choix du monde.
// Usage : node record_ui.js <url-build-debug> <dossier>   → <dossier>/{cages,grille,monde}.webm
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const URL = process.argv[2], OUT = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  async function scene(name, freed, cleared, fn) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: OUT + '/_' + name, size: { width: 1280, height: 720 } } });
    await ctx.addInitScript(([f, c]) => { try { localStorage.setItem('donjon-surv-freed', JSON.stringify(f)); localStorage.setItem('donjon-surv-cleared', JSON.stringify(c)); } catch (e) {} }, [freed, cleared]);
    const T0 = Date.now(); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(1500);
    await p.mouse.click(640, 360); await p.waitForTimeout(1200); if (await p.$('#li-skip')) await p.click('#li-skip'); await p.waitForTimeout(1500);
    await p.getByText('Mode Survie').first().click(); await p.waitForTimeout(1500);
    const st = (Date.now() - T0) / 1000; await fn(p); const en = (Date.now() - T0) / 1000; fs.writeFileSync(OUT + '/' + name + '.json', JSON.stringify({ st, en }));
    const v = p.video(); await ctx.close(); await v.saveAs(OUT + '/' + name + '.webm');
    console.log(name, errs.join('|') || 'no errors');
  }
  const FREED = ['cochon', 'meuh', 'canard', 'lapin'];
  await scene('grille', FREED, [0], async p => {
    await p.waitForTimeout(1500);
    const cards = await p.$$('.hp-card'); for (const i of [1, 5, 9, 14]) { if (cards[i]) { await cards[i].hover(); await p.waitForTimeout(700); } }
    await p.waitForTimeout(800);
  });
  await scene('monde', FREED, [0, 1, 4], async p => {
    await p.getByText('Cocotte').first().click(); await p.waitForTimeout(600); await p.click('#hp-go'); await p.waitForTimeout(2000);
    const rows = await p.$$('.overlay.show .row'); for (const i of [1, 3, 5]) { if (rows[i]) { await rows[i].hover(); await p.waitForTimeout(700); } }
    await p.waitForTimeout(600);
  });
  await scene('cages', [], [0], async p => {
    await p.getByText('Cocotte').first().click(); await p.waitForTimeout(600); await p.click('#hp-go'); await p.waitForTimeout(1200);
    await p.getByText('Chef : Maître Hachoir').first().click(); await p.waitForTimeout(5500);
    await p.evaluate(() => { window.__d.state.hp = window.__d.state.maxHp = 9999; window.__d.unlockAlert(['cochon', 'canard']); });
    await p.waitForTimeout(7000);
  });
  await b.close();
})();

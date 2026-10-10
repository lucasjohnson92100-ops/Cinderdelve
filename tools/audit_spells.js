// Capture pouvoir + ultime de chaque héros (2 images chacun) pour vérifier leur lisibilité. node audit_spells.js <url-debug> <dossier>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'); const URL = process.argv[2], OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
const H = ['cocotte','cochon','meuh','canard','lapin','mouton','cheval','oie','bouc','chien','dinde','ane','chat','paon','taureau','coq','pintade','lama','cavia'];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 960, height: 540 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(1500);
  await p.mouse.click(480, 270); await p.waitForTimeout(1200); if (await p.$('#li-skip')) await p.click('#li-skip'); await p.waitForTimeout(1500);
  await p.getByText('Mode Survie').first().click(); await p.waitForTimeout(1500);
  await p.getByText('Cocotte').first().click(); await p.waitForTimeout(600); await p.click('#hp-go'); await p.waitForTimeout(1200);
  await p.getByText('Chef : Maître Hachoir').first().click(); await p.waitForTimeout(5500);
  await p.evaluate(() => { performance.now = () => window.__T = window.__T || 1e6; window.__T = 1e6 + performance.timeOrigin * 0; window.requestAnimationFrame = () => 0; });
  const frame = async (n, ms) => { for (let i = 0; i < n; i++) await p.evaluate(() => { window.__T += 1000 / 30; window.__d.loop(); }); };
  for (const h of H) {
    for (const kind of ['pw', 'ult']) {
      await p.evaluate(([h, kind]) => { const d = window.__d, s = d.state; d.setHeroFull(h); d.enemies().length = 0; s.maxHp = s.hp = 9999; s.farmCd = 0; s.survUlt = 100; s.farmAct = null;
        for (let i = 0; i < 14; i++) { const e = d.mk(['skeleton','goblin','wolf','slime'][i % 4], Math.round(d.p.vx), Math.round(d.p.vy)), a = i * 0.45, r = 2.5 + (i % 4) * 1.4; e.vx = d.p.vx + Math.cos(a) * r; e.vy = d.p.vy + Math.sin(a) * r * 0.8; e.aggro = true; e.born = performance.now() - 5000; e.hp = e.maxHp = 400; d.push(e); } }, [h, kind]);
      await frame(3);
      await p.evaluate(kind => { kind === 'pw' ? window.__d.farmUse() : window.__d.useUlt(); }, kind);
      await frame(8); await p.screenshot({ path: `${OUT}/${h}_${kind}_a.jpg`, type: 'jpeg', quality: 80 });
      await frame(14); await p.screenshot({ path: `${OUT}/${h}_${kind}_b.jpg`, type: 'jpeg', quality: 80 });
      await frame(60);
    }
  }
  console.log(errs.join('|') || 'no errors'); await b.close();
})();

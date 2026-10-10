// Enregistre des scènes du jeu image par image (horloge simulée, rendu déterministe) pour la page itch.io.
// Usage : node record_trailer.js <url-du-build-de-debug> <dossier-de-sortie> [scene,scene,...]
// Le build de debug se fabrique avec tools/balance_debug_build.py. Les images sont des JPEG nommés <scene>/NNNN.jpg.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const URL = process.argv[2], OUT = process.argv[3], ONLY = (process.argv[4] || '').split(',').filter(Boolean);
const FPS = 30;

/* code exécuté dans la page : aides communes et scènes */
const PAGE_SETUP = () => {
  const d = window.__d, R = window.__R = {};
  R.god = () => { const s = d.state; s.maxHp = 9999; s.hp = 9999; s.xp = 0; };
  R.clear = () => { d.enemies().length = 0; };
  R.spawn = (n, hpMul, types) => {
    const T = types || ['skeleton', 'goblin', 'wolf', 'slime', 'bat', 'spider', 'mushroom', 'ghost', 'archer', 'golem'], p = d.p;
    for (let i = 0; i < n; i++) {
      const e = d.mk(T[i % T.length], Math.round(p.vx), Math.round(p.vy)), a = Math.random() * 6.283, r = 3.5 + Math.random() * 4;
      e.vx = p.vx + Math.cos(a) * r; e.vy = p.vy + Math.sin(a) * r * 0.75; e.aggro = true; e.born = performance.now() - 5000;
      e.hp = e.maxHp = Math.round(e.hp * (hpMul || 6)); d.push(e);
    }
  };
  /* petit pilote : s'approche des monstres, recule quand il est encerclé */
  R.bot = () => {
    const p = d.p, en = d.enemies().filter(e => e.hp > 0), dist = e => Math.hypot(e.vx - p.vx, e.vy - p.vy);
    const close = en.filter(e => dist(e) < 2.4), mid = en.filter(e => dist(e) < 9);
    let mx = 0, my = 0;
    if (close.length >= 3) { let cx = 0, cy = 0; close.forEach(e => { cx += e.vx; cy += e.vy; }); cx /= close.length; cy /= close.length; const dx = p.vx - cx, dy = p.vy - cy, m = Math.hypot(dx, dy) || 1; mx = dx / m - dy / m * 0.5; my = dy / m + dx / m * 0.5; }
    else if (mid.length) { const t = mid.sort((a, b) => dist(a) - dist(b))[0], dx = t.vx - p.vx, dy = t.vy - p.vy, dd = Math.hypot(dx, dy) || 1; if (dd > 1.8) { mx = dx / dd; my = dy / dd; } else { mx = -dy / dd * 0.8; my = dx / dd * 0.8; } }
    const W = d.g.length, bd = 7; if (p.vx < bd) mx += 1; if (p.vx > W - bd) mx -= 1; if (p.vy < bd) my += 1; if (p.vy > W - bd) my -= 1;
    const m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; } d.input.x = mx; d.input.y = my;
  };
  R.pick = () => { const r = document.querySelector('.overlay.show .row:not([disabled])') || document.querySelector('.overlay.show .main-btn'); if (r) r.click(); };

  const HEROES = ['cocotte', 'canard', 'paon', 'coq', 'taureau', 'cavia', 'chien', 'oie'];
  R.scenes = {
    heros: { sec: 12, tick: (i, t) => {
      const slot = 1.5, h = Math.min(HEROES.length - 1, Math.floor(t / slot)), lt = t - h * slot, s = d.state;
      if (lt < 0.034) { d.setHeroFull(HEROES[h]); R.clear(); R.spawn(12, 8); s.farmCd = 0; s.survUlt = 100; s.farmAct = null; }
      if (Math.abs(lt - 0.3) < 0.017) { try { d.farmUse(); } catch (e) {} }
      if (Math.abs(lt - 0.85) < 0.017) { s.survUlt = 100; try { d.useUlt(); } catch (e) {} }
      R.god(); if (i % 3 === 0) R.bot();
    } },
    dons: { sec: 11, setup: () => { const s = d.state; s.atk = 22; d.setHeroFull('cocotte'); R.clear(); R.spawn(14, 6); }, tick: (i, t) => {
      const s = d.state, at = (x) => Math.abs(t - x) < 0.017;
      if (at(0.5)) { d.legGain('blackhole'); s.legT = s.legT || {}; s.legT.bh = 0; }
      if (at(2.8)) { d.legGain('meteors'); s.legT = s.legT || {}; s.legT.met = 0; }
      if (at(5.2)) { d.legGain('vengeance'); d.legGain('chain'); }
      if (at(7.6)) { d.legGain('feather'); d.legGain('berserk'); s.hp = Math.round(s.maxHp * 0.3); s.legT = s.legT || {}; s.legT.fe = 0; }
      if (at(9.4)) { s.legT.bh = 0; }
      if (i % 45 === 0 && d.enemies().length < 10) R.spawn(10, 6);
      if (t < 7.6) R.god(); else { s.maxHp = 9999; s.hp = Math.max(Math.round(9999 * 0.3), Math.min(s.hp, 2999)); }
      if (i % 3 === 0) R.bot();
    } },
    boss: { sec: 14, setup: () => { const s = d.state; d.setHeroFull('cocotte'); R.clear(); s.survCycle = 4; s.survTotalT = 600; s.survTaken = 0; s.atk = 14; s.survBossUp = true; d.spawnSurvivalBoss(); }, tick: (i, t) => {
      const b = d.enemies().find(e => e.survivalBoss), at = (x) => Math.abs(t - x) < 0.017;
      if (b && at(4)) b.hp = Math.floor(b.maxHp * 0.64);
      if (b && at(8.5)) b.hp = Math.floor(b.maxHp * 0.31);
      if (b && b.hp < b.maxHp * 0.12) b.hp = Math.floor(b.maxHp * 0.12);
      R.god(); if (i % 3 === 0) R.bot();
    } },
    lieux: { sec: 12, tick: (i, t) => {
      const MAPS = [0, 7, 1, 2, 3, 8], h = Math.min(MAPS.length - 1, Math.floor(t / 2)), lt = t - h * 2;
      if (lt < 0.034) { d.gen(MAPS[h]); d.setPosCenter && d.setPosCenter(); R.clear(); R.spawn(9, 8); }
      R.god(); d.state.hp = 9999; if (i % 3 === 0) R.bot();
      if (lt > 0.4 && i % 10 === 0) { const p = d.p; d.input.x = Math.cos(t * 0.8) * 0.8; d.input.y = Math.sin(t * 0.8) * 0.8; }
      if (i % 40 === 0 && d.enemies().length < 6) R.spawn(8, 8);
    } },
    choix: { sec: 10, setup: () => { d.setHeroFull('cocotte'); R.clear(); R.spawn(12, 6); d.state.atk = 20; }, tick: (i, t) => {
      const s = d.state, at = (x) => Math.abs(t - x) < 0.017;
      if (at(2.6)) { s.lvl = 12; s.pending = 1; s.legLvl = 0; const o = Math.random; Math.random = () => 0.01; d.openLevelUp(); Math.random = o; }
      if (at(6)) { const rows = [...document.querySelectorAll('#lvl-list .row')]; (rows.find(r => r.className.includes('legend')) || rows[0]).click(); }
      if (d.mode === 'play') { R.god(); if (i % 3 === 0) R.bot(); if (i % 40 === 0 && d.enemies().length < 8) R.spawn(8, 6); }
    } }
  };
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const names = ['heros', 'dons', 'boss', 'lieux', 'choix'].filter(n => !ONLY.length || ONLY.includes(n));
  for (const name of names) {
    const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(1500);
    await p.mouse.click(640, 360); await p.waitForTimeout(1200); if (await p.$('#li-skip')) await p.click('#li-skip'); await p.waitForTimeout(1500);
    await p.getByText('Mode Survie').first().click(); await p.waitForTimeout(1500);
    await p.getByText('Cocotte').first().click(); await p.waitForTimeout(600);
    await p.click('#hp-go'); await p.waitForTimeout(1200);
    await p.getByText('Chef : Maître Hachoir').first().click(); await p.waitForTimeout(5500);
    await p.evaluate(() => { const t0 = performance.now(); window.__T = t0; performance.now = () => window.__T; window.requestAnimationFrame = () => 0; });
    await p.evaluate(PAGE_SETUP);
    const sec = await p.evaluate((n) => window.__R.scenes[n].sec, name);
    await p.evaluate((n) => { const sc = window.__R.scenes[n]; if (sc.setup) sc.setup(); window.__R.god(); }, name);
    const dir = OUT + '/' + name; fs.mkdirSync(dir, { recursive: true });
    const n = Math.round(sec * FPS);
    for (let i = 0; i < n; i++) {
      await p.evaluate(([n, i, t]) => { window.__T += 1000 / 30; try { window.__R.scenes[n].tick(i, t); } catch (e) { window.__err = String(e); } window.__d.loop(); }, [name, i, i / FPS]);
      await p.screenshot({ path: dir + '/' + String(i).padStart(4, '0') + '.jpg', type: 'jpeg', quality: 90 });
    }
    const e2 = await p.evaluate(() => window.__err || null);
    console.log(name, n + ' images', errs.join('|') || (e2 ? 'erreur scène: ' + e2 : 'no errors'));
    await p.close();
  }
  await b.close();
})();

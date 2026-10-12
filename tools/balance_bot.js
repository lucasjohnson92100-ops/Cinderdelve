// Robot de test : joue le Mode Survie en accéléré (horloge simulée, sans affichage) et mesure la difficulté.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const URL = process.argv[2], MAPS = (process.argv[3] || '0').split(',').map(Number), RUNS = +(process.argv[4] || 1), LIMIT = +(process.argv[5] || 3000);
const out = process.argv[6];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const results = [];
  for (const map of MAPS) for (let run = 0; run < RUNS; run++) {
    const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(1500);
    await p.mouse.click(640, 360); await p.waitForTimeout(1200);
    if (await p.$('#li-skip')) await p.click('#li-skip'); await p.waitForTimeout(1500);
    await p.getByText('Mode Survie').first().click(); await p.waitForTimeout(1500);
    await p.getByText('Cocotte').first().click(); await p.waitForTimeout(600);
    await p.click('#hp-go'); await p.waitForTimeout(1200);
    await p.getByText('Chef : Gaston le Fermier').first().click(); await p.waitForTimeout(2500);
    await p.evaluate(([map, GOD, LEG, HERO]) => {
      window.__GOD = GOD; window.__LEG = LEG; window.__HERO = HERO; const t0 = performance.now(); window.__T = t0; performance.now = () => window.__T; window.requestAnimationFrame = () => 0;
      const d = window.__d; if (map !== 0) d.gen(map); if (window.__LEG) Object.keys(d.LEGENDS).forEach(id => d.legGain(id)); if (window.__HERO) d.setHero(window.__HERO);
      window.__log = []; window.__sec = 0; window.__bot = { tick: 0 }; window.__W = {}; window.__lastHp = d.state.hp;
      const B = window.__bot;
      B.pick = function () { const r = document.querySelector('.overlay.show .row:not([disabled])') || document.querySelector('.overlay.show .main-btn'); if (r) r.click(); };
      B.step = function () {
        const d = window.__d, s = d.state, p = d.p, mode = d.mode;
        if (mode === 'levelup' || mode === 'gear' || mode === 'altar' || mode === 'intro') { B.pick(); return; }
        if (mode === 'shop') { for (let k = 0; k < 4; k++) { const r = document.querySelector('#shop .row:not([disabled])'); if (r) r.click(); } const go = document.getElementById('shop-go'); if (go) go.click(); return; }
        if (mode !== 'play') return;
        const en = d.enemies().filter(e => e.hp > 0), dist = e => Math.hypot(e.vx - p.vx, e.vy - p.vy);
        const close = en.filter(e => dist(e) < 2.6), mid = en.filter(e => dist(e) < 9);
        let mx = 0, my = 0;
        if (close.length >= (B.fleeN || 3)) {
          let cx = 0, cy = 0; close.forEach(e => { cx += e.vx; cy += e.vy; }); cx /= close.length; cy /= close.length;
          const dx = p.vx - cx, dy = p.vy - cy, m0 = Math.hypot(dx, dy) || 1; mx = dx / m0; my = dy / m0;
          const tx = -my, ty = mx; mx += tx * 0.5; my += ty * 0.5;
        } else if (mid.length) {
          const t = mid.sort((a, b) => dist(a) - dist(b))[0], dx = t.vx - p.vx, dy = t.vy - p.vy, dd = Math.hypot(dx, dy) || 1;
          if (dd > 1.7) { mx = dx / dd; my = dy / dd; } else { mx = -dy / dd * 0.8; my = dx / dd * 0.8; }
        } else {
          const gm = d.gems().filter(x => x.v != null || x.k === 'heart' || x.k === 'chest').sort((a, b) => Math.hypot(a.x - p.vx, a.y - p.vy) - Math.hypot(b.x - p.vx, b.y - p.vy))[0];
          if (gm && Math.hypot(gm.x - p.vx, gm.y - p.vy) < 14) { mx = gm.x - p.vx; my = gm.y - p.vy; }
        }
        const near = mid; let m;
        if (s.survRing && s.survBossUp) { mx += (s.survRing.x - p.vx) * 0.12; my += (s.survRing.y - p.vy) * 0.12; }
        const bd = 7, W = d.g[0].length, H = d.g.length;
        if (p.vx < bd) mx += (bd - p.vx) * 0.4; if (p.vx > W - bd) mx -= (p.vx - (W - bd)) * 0.4; if (p.vy < bd) my += (bd - p.vy) * 0.4; if (p.vy > H - bd) my -= (p.vy - (H - bd)) * 0.4;
        m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; }
        d.input.x = mx; d.input.y = my;
        if ((s.farmCd || 0) <= 0 && near.length >= 3) try { d.farmUse(); } catch (e) {}
        if ((s.survUlt || 0) >= 100 && near.length >= 5) try { d.useUlt(); } catch (e) {}
      };
    }, [map, +(process.env.GOD || 0), +(process.env.LEG || 0), process.env.HERO || '']);
    let res = null, simSec = 0, lastCycle = 0;
    const wavesT = {};
    while (simSec < LIMIT) {
      const r = await p.evaluate(() => {
        const d = window.__d, B = window.__bot; let n = 0;
        while (n < 900) {
          window.__T += 33; n++; window.__sec += 0.033;
          if (n % 3 === 0) B.step();
          d.sim(33);
          { const s0 = d.state, c = s0.survCycle || 0, w = window.__W[c] = window.__W[c] || { dmg: 0, sec: 0, kills0: s0.kills || 0, maxEn: 0, bossSec: 0, lvl0: s0.lvl };
            if (d.mode === 'play') { w.sec += 0.033; if (s0.survBossUp) w.bossSec += 0.033; const en = d.enemies().length; if (en > w.maxEn) w.maxEn = en; w.kills = (s0.kills || 0) - w.kills0; w.lvl = s0.lvl; }
            if (window.__GOD) { if (s0.hp < window.__lastHp) w.dmg += window.__lastHp - s0.hp; if (s0.hp < s0.maxHp) s0.hp = s0.maxHp; window.__lastHp = s0.hp; } }
          if (d.mode === 'dead') break;
        }
        const s = d.state;
        return { W: window.__W, mode: d.mode, sec: window.__sec, cycle: s.survCycle || 0, lvl: s.lvl, hp: s.hp, maxHp: s.maxHp, t: s.survT, en: d.enemies().length, boss: !!s.survBossUp, kills: s.kills || 0, gold: s.gold };
      });
      simSec = r.sec; res = r;
      if (r.cycle !== lastCycle) { wavesT[r.cycle] = Math.round(r.sec); lastCycle = r.cycle; }
      if (r.mode === 'dead') break;
      if (r.mode === 'intro' || (await p.evaluate(() => document.body.innerText.includes('VICTOIRE') && window.__d.mode !== 'play'))) break;
    }
    results.push({ map, run, W: res.W, dead: res.mode === 'dead', simSec: Math.round(simSec), cycle: res.cycle, lvl: res.lvl, kills: res.kills, boss: res.boss, wavesT, errs: errs.slice(0, 2) });
    console.log(JSON.stringify(results[results.length - 1]));
    await p.close();
  }
  if (out) require('fs').writeFileSync(out, JSON.stringify(results, null, 1));
  await b.close();
})();

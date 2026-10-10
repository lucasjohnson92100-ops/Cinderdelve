/* Service worker de Cinderdelve : jeu jouable hors ligne, mises à jour automatiques.
   6d6cc0ea0f, 0bda2c78f516 et ["img/bd_cages.webp", "img/bd_ferme.webp", "img/bd_poule.webp", "img/big_boucher.webp", "img/big_cocotte.webp", "img/h_ane.webp", "img/h_bouc.webp", "img/h_canard.webp", "img/h_cavia.webp", "img/h_chat.webp", "img/h_cheval.webp", "img/h_chien.webp", "img/h_cochon.webp", "img/h_cocotte.webp", "img/h_coq.webp", "img/h_dinde.webp", "img/h_lama.webp", "img/h_lapin.webp", "img/h_meuh.webp", "img/h_mouton.webp", "img/h_oie.webp", "img/h_paon.webp", "img/h_pintade.webp", "img/h_taureau.webp", "img/l_charcutier.webp", "img/l_desosseur.webp", "img/l_fumaison.webp", "img/l_grandboucher.webp", "img/l_grilleur.webp", "img/l_hachoir.webp", "img/l_rotisseur.webp", "img/l_saignee.webp", "img/l_saumure.webp", "img/l_surgele.webp", "img/p_ane.webp", "img/p_bouc.webp", "img/p_canard.webp", "img/p_cavia.webp", "img/p_chat.webp", "img/p_cheval.webp", "img/p_chien.webp", "img/p_cochon.webp", "img/p_cocotte.webp", "img/p_coq.webp", "img/p_dinde.webp", "img/p_lama.webp", "img/p_lapin.webp", "img/p_meuh.webp", "img/p_mouton.webp", "img/p_oie.webp", "img/p_paon.webp", "img/p_pintade.webp", "img/p_taureau.webp", "img/sq_land.webp", "img/sq_port.webp", "img/u_ane.webp", "img/u_bouc.webp", "img/u_canard.webp", "img/u_cavia.webp", "img/u_chat.webp", "img/u_cheval.webp", "img/u_chien.webp", "img/u_cochon.webp", "img/u_cocotte.webp", "img/u_coq.webp", "img/u_dinde.webp", "img/u_lama.webp", "img/u_lapin.webp", "img/u_meuh.webp", "img/u_mouton.webp", "img/u_oie.webp", "img/u_paon.webp", "img/u_pintade.webp", "img/u_taureau.webp", "music/boss.mp3", "music/chateau.mp3", "music/crypte.mp3", "music/foret.mp3", "music/glace.mp3", "music/grottes.mp3", "music/marais.mp3", "music/menu.mp3", "music/olympe.mp3", "music/plage.mp3", "music/temple.mp3", "music/volcan.mp3", "video/intro-last.jpg", "video/intro-poster.jpg", "video/intro.mp4"] sont remplacés au déploiement (voir .github/workflows/pwa-deploy.yml).
   - le code du jeu (index.html) : réseau d'abord, donc une nouvelle version arrive dès que le téléphone est en ligne ;
   - images et musiques : conservées entre les versions tant qu'elles ne changent pas (pas de re-téléchargement). */
const BUILD = '6d6cc0ea0f', ASSETS = '0bda2c78f516', FILES = ["img/bd_cages.webp", "img/bd_ferme.webp", "img/bd_poule.webp", "img/big_boucher.webp", "img/big_cocotte.webp", "img/h_ane.webp", "img/h_bouc.webp", "img/h_canard.webp", "img/h_cavia.webp", "img/h_chat.webp", "img/h_cheval.webp", "img/h_chien.webp", "img/h_cochon.webp", "img/h_cocotte.webp", "img/h_coq.webp", "img/h_dinde.webp", "img/h_lama.webp", "img/h_lapin.webp", "img/h_meuh.webp", "img/h_mouton.webp", "img/h_oie.webp", "img/h_paon.webp", "img/h_pintade.webp", "img/h_taureau.webp", "img/l_charcutier.webp", "img/l_desosseur.webp", "img/l_fumaison.webp", "img/l_grandboucher.webp", "img/l_grilleur.webp", "img/l_hachoir.webp", "img/l_rotisseur.webp", "img/l_saignee.webp", "img/l_saumure.webp", "img/l_surgele.webp", "img/p_ane.webp", "img/p_bouc.webp", "img/p_canard.webp", "img/p_cavia.webp", "img/p_chat.webp", "img/p_cheval.webp", "img/p_chien.webp", "img/p_cochon.webp", "img/p_cocotte.webp", "img/p_coq.webp", "img/p_dinde.webp", "img/p_lama.webp", "img/p_lapin.webp", "img/p_meuh.webp", "img/p_mouton.webp", "img/p_oie.webp", "img/p_paon.webp", "img/p_pintade.webp", "img/p_taureau.webp", "img/sq_land.webp", "img/sq_port.webp", "img/u_ane.webp", "img/u_bouc.webp", "img/u_canard.webp", "img/u_cavia.webp", "img/u_chat.webp", "img/u_cheval.webp", "img/u_chien.webp", "img/u_cochon.webp", "img/u_cocotte.webp", "img/u_coq.webp", "img/u_dinde.webp", "img/u_lama.webp", "img/u_lapin.webp", "img/u_meuh.webp", "img/u_mouton.webp", "img/u_oie.webp", "img/u_paon.webp", "img/u_pintade.webp", "img/u_taureau.webp", "music/boss.mp3", "music/chateau.mp3", "music/crypte.mp3", "music/foret.mp3", "music/glace.mp3", "music/grottes.mp3", "music/marais.mp3", "music/menu.mp3", "music/olympe.mp3", "music/plage.mp3", "music/temple.mp3", "music/volcan.mp3", "video/intro-last.jpg", "video/intro-poster.jpg", "video/intro.mp4"];
const CORE = 'cd-core-' + BUILD, ASSET = 'cd-assets-' + ASSETS;
const CORE_FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CORE); await c.addAll(CORE_FILES.map(u => new Request(u, { cache: 'reload' })));
    const a = await caches.open(ASSET);
    await Promise.allSettled(FILES.map(async f => { if (!(await a.match(f))) { try { await a.add(f); } catch (err) {} } }));
    if (!self.registration.active) self.skipWaiting(); /* 1re installation : tout de suite ; mise à jour : on attend que le joueur accepte */
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CORE && k !== ASSET && k.startsWith('cd-')) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });

function ranged(req, res) { /* les navigateurs demandent la musique par morceaux : on renvoie un 206 depuis le fichier en cache */
  const m = /bytes=(\d+)-(\d*)/.exec(req.headers.get('range') || ''); if (!m || res.status !== 200) return res;
  return res.arrayBuffer().then(buf => {
    const s = +m[1], e = m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
    return new Response(buf.slice(s, e + 1), { status: 206, headers: { 'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg', 'Content-Range': `bytes ${s}-${e}/${buf.byteLength}`, 'Content-Length': e - s + 1 } });
  });
}
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const isAsset = /\/(img|music|video)\//.test(url.pathname);
  if (isAsset) {
    e.respondWith((async () => {
      const a = await caches.open(ASSET); let r = await a.match(req.url);
      if (!r) { r = await fetch(req.url); if (r.ok && r.status === 200) a.put(req.url, r.clone()); }
      return req.headers.get('range') ? ranged(req, r) : r;
    })());
    return;
  }
  /* page et fichiers du jeu : réseau d'abord (nouvelle version dès qu'on est en ligne), sinon le cache */
  e.respondWith((async () => {
    const c = await caches.open(CORE);
    try {
      const r = await Promise.race([fetch(req, { cache: 'no-cache' }), new Promise((_, rej) => setTimeout(rej, 4500))]);
      if (r && r.ok) c.put(req, r.clone()); return r;
    } catch (err) {
      return (await c.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? await c.match('index.html') : Response.error());
    }
  })());
});

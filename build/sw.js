/* Service worker de Cinderdelve : jeu jouable hors ligne, mises à jour automatiques.
   __BUILD__, __ASSETS__ et __FILES__ sont remplacés au déploiement (voir .github/workflows/pwa-deploy.yml).
   - le code du jeu (index.html) : réseau d'abord, donc une nouvelle version arrive dès que le téléphone est en ligne ;
   - images et musiques : conservées entre les versions tant qu'elles ne changent pas (pas de re-téléchargement). */
const BUILD = '__BUILD__', ASSETS = '__ASSETS__', FILES = __FILES__;
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
  const isAsset = /\/(img|music)\//.test(url.pathname);
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

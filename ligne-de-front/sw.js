/* Service worker de Ligne de Front : jouable hors ligne, mises à jour automatiques.
   - index.html : réseau d'abord (une nouvelle version arrive dès que le téléphone est en ligne), copie en cache en secours ;
   - le reste (icônes, polices) : cache d'abord. */
const VERSION = 'ldf-1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== VERSION && k.startsWith('ldf-')) await caches.delete(k); await self.clients.claim(); })()); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== location.origin && !fonts) return;
  const core = u.origin === location.origin && (r.mode === 'navigate' || /\/(index\.html)?$/.test(u.pathname));
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    if (core) { try { const res = await fetch(r); if (res.ok) cache.put(r.mode === 'navigate' ? 'index.html' : r, res.clone()); return res; } catch (err) { return (await cache.match('index.html')) || (await cache.match(r)) || Response.error(); } }
    const hit = await cache.match(r); if (hit) return hit;
    try { const res = await fetch(r); if (res.ok || res.type === 'opaque') cache.put(r, res.clone()); return res; } catch (err) { return Response.error(); }
  })());
});

// Bez signálu sa aplikácia otvorí z pamäte. So signálom dostane najnovšiu verziu.
const C = 'tabula-v1';
const FILES = ['./', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const nav = e.request.mode === 'navigate', key = nav ? './' : e.request, cache = caches.open(C);
  const net = fetch(nav ? './' : e.request.url, { cache: 'no-cache' }).then(async r => { if (r.ok) (await cache).put(key, r.clone()); return r; });
  e.waitUntil(net.catch(() => { }));
  e.respondWith(cache.then(c => c.match(key)).then(hit => {
    if (!hit) return net;
    if (!nav) return hit;
    // Stránka: nová verzia, ak príde do 2,5 s. Inak, aj bez signálu, tá z pamäte.
    return Promise.race([net.catch(() => hit), new Promise(done => setTimeout(() => done(hit), 2500))]);
  }));
});

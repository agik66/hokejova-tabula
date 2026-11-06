// Offline: aplikácia sa otvorí z pamäte hneď a nová verzia sa potichu stiahne pre ďalšie spustenie.
const C = 'tabula-v1';
const FILES = ['./', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const nav = e.request.mode === 'navigate';
  e.respondWith(caches.open(C).then(async c => {
    const key = nav ? './' : e.request;
    const hit = await c.match(key);
    const net = fetch(nav ? './' : e.request.url, { cache: 'no-cache' }).then(r => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => hit || Response.error());
    if (hit) { e.waitUntil(net.catch(() => { })); return hit; }
    return net;
  }));
});

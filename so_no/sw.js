const CACHE = 'sono-v1';
const ASSETS = ['./index.html', './manifest.webmanifest',
                './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request, {ignoreSearch: true})
    .then(r => r || fetch(e.request).then(resp => {
      const cl = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, cl));
      return resp;
    }).catch(() => caches.match('./index.html'))));
});

const CACHE = 'sono-v3';
const ASSETS = ['./index.html', './manifest.webmanifest',
                './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(ks => Promise.all(ks
      .filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => clients.claim())));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // trang html: mạng trước (luôn lấy bản mới), mất mạng → cache
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(fetch(e.request).then(resp => {
      const cl = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, cl));
      return resp;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // ảnh/manifest: cache trước cho nhanh
  e.respondWith(caches.match(e.request, {ignoreSearch: true})
    .then(r => r || fetch(e.request).then(resp => {
      const cl = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, cl));
      return resp;
    }).catch(() => caches.match('./index.html'))));
});

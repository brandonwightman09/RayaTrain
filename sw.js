// Raya Train — network-first service worker (anti-staleness pattern)
const CACHE = 'raya-train-v2';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Never intercept Supabase API calls — always live
  if (url.hostname.endsWith('supabase.co')) return;
  if (e.request.method !== 'GET') return;

  // Network-first: fresh copy wins, cache is offline fallback only
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

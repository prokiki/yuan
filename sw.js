
const VERSION = new URL(self.location).searchParams.get('v') || 'dev';
const CACHE_NAME = `family-reward-cache-${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js?v=' + VERSION,
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE_NAME);
    await c.addAll(ASSETS);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.map(k => k !== CACHE_NAME && caches.delete(k)));
    await self.clients.claim();
  })());
});

// Safer update strategy:
// - index.html: network-first (ensure users get the latest app logic)
// - other assets: cache-first
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isIndex = isSameOrigin && (url.pathname.endsWith('/index.html') || url.pathname.endsWith('/'));

  if (isIndex) {
    e.respondWith((async () => {
      try {
        const res = await fetch(e.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(e.request, res.clone());
        return res;
      } catch (err) {
        const cached = await caches.match(e.request);
        return cached || new Response('离线且无缓存', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    if (cached) return cached;
    const res = await fetch(e.request);
    // Best-effort cache
    try {
      const cache = await caches.open(CACHE_NAME);
      cache.put(e.request, res.clone());
    } catch {}
    return res;
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

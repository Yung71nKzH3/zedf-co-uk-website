// ZEDF PWA Service Worker (Full Offline Support)
const CACHE_NAME = 'zedf-cache-v2';

const PRECACHE_ASSETS = [
  '/',
  '/calc67',
  '/manifests/calc67.webmanifest',
  '/manifest.webmanifest',
  '/icons/calc67.svg',
  '/icons/calc67-192.png',
  '/icons/calc67-512.png',
  '/icons/zedf-192.png',
  '/icons/zedf.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache asset warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key.startsWith('zedf-cache-')) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Only handle GET requests from the same origin or CDN assets
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);
  const isSameOrigin = url.origin === location.origin;
  
  if (!isSameOrigin && !url.hostname.includes('challenges.cloudflare.com')) {
    return;
  }

  // Network first with offline cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.status === 200 && isSameOrigin) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        // If it's a navigation request, provide the matching cached route
        if (request.mode === 'navigate') {
          if (url.pathname.startsWith('/calc67')) {
            const cachedCalc = await caches.match('/calc67');
            if (cachedCalc) return cachedCalc;
          }
          const cachedHome = await caches.match('/');
          if (cachedHome) return cachedHome;
        }

        return new Response('Offline: Content not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' }),
        });
      })
  );
});

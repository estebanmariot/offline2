const CACHE_NAME = 'todolist-cache-v1';
const OFFLINE_URL = '/second';

self.addEventListener('install', (event) => {
  console.log('SW install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW activate');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  console.log(`Fetching : ${event.request.url}, Mode : ${event.request.mode}`);

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        // Essaye le réseau d'abord
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (e) {
        console.log('Offline, on renvoie la page offline depuis le cache');
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
          
        return cachedResponse || new Response('TODOLIST OFFLINE');
      }
    })());
  }
});

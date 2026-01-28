const CACHE_NAME = 'todolist-cache-v1';
const OFFLINE_PAGE = '/second'; // ta page TODO

self.addEventListener('install', (event) => {
  console.log('🔧 Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.addAll([OFFLINE_PAGE])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🚀 Activate');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  console.log(`📡 ${event.request.url}`);
  
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(OFFLINE_PAGE).then(cached => {
        return cached || fetch(event.request).catch(() => cached);
      })
    );
  }
});

const CACHE_NAME = 'todolist-v1';
const OFFLINE_PAGE = '/second';

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
  
  // 1️⃣ Pages HTML (navigate)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => 
        cache.match(OFFLINE_PAGE)
          .then(cached => cached || fetch(event.request))
          .catch(() => cached)
      )
    );
  }
  
  // 2️⃣ CSS + Fonts + Images (cache si possible)
  else if (
    event.request.url.includes('.css') ||
    event.request.url.includes('.woff2') ||
    event.request.url.includes('.png') ||
    event.request.url.includes('.jpg')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME)
        .then(cache => 
          cache.match(event.request)
            .then(cached => 
              cached || fetch(event.request).then(response => {
                // Copie fraîche = cache aussi !
                cache.put(event.request, response.clone());
                return response;
              })
            )
            .catch(() => cached || new Response('Asset offline'))
        )
    );
  }
});

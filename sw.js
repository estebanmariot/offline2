geconst CACHE_NAME = 'todolist-v2';
const OFFLINE_PAGE = [
  '/second',
  '/HomePage',
  '/HomePage-connexion'
  ];

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
  const url = event.request.url;
  console.log(`📡 ${url}`);
  
  // 1️⃣ Pages HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => 
        cache.match(OFFLINE_PAGE)
          .then(cached => cached || fetch(event.request))
          .catch(() => cached)
      )
    );
  }
  
  // 2️⃣ CSS + Fonts + Images + JS (TOUT)
  else if (
    url.includes('.css') ||
    url.includes('.woff2') ||
    url.includes('.png') ||
    url.includes('.jpg') ||
    url.includes('.js') ||       // ← NOUVEAU !
    url.includes('manifest.json') // ← NOUVEAU !
  ) {
    event.respondWith(
      caches.open(CACHE_NAME)
        .then(cache => 
          cache.match(event.request)
            .then(cached => {
              if (cached) {
                console.log(`✅ Cache hit: ${url}`);
                return cached;
              }
              
              // Fetch + cache
              return fetch(event.request).then(response => {
                console.log(`💾 Caching: ${url}`);
                cache.put(event.request, response.clone());
                return response;
              });
            })
            .catch(() => {
              console.log(`❌ Offline, no cache: ${url}`);
              return new Response('Asset offline', {status: 503});
            })
        )
    );
  }
});

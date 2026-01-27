const CACHE_NAME = 'todolist-v2';

// Install : cache tout
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.addAll([
        '/',                           // Page principale
        '/second',                     // Ta page TODO
        '/manifest.json'               // PWA manifest
      ])
    )
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  self.clients.claim();
});

// Fetch : stratégie CACHE FIRST
self.addEventListener('fetch', event => {
  console.log(`📡 Fetch: ${event.request.url}`);
  
  // TOUT est géré (pas seulement navigate !)
  event.respondWith(
    caches.match(event.request).then(cached => 
      cached || fetch(event.request).catch(() => {
        console.log('❌ Offline → Fallback');
        // Page offline personnalisée
        return new Response(`
          <html>
            <head><title>TODO Offline</title></head>
            <body style="font-family:sans-serif;padding:2rem">
              <h1>📱 TODO List</h1>
              <p>App disponible offline !</p>
              <p>Reviens en ligne pour sync.</p>
            </body>
          </html>
        `, { headers: {'Content-Type': 'text/html'} });
      })
    )
  );
});

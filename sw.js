const CACHE_NAME = 'offline-cache-v1';

// Installation du SW
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installé');
  self.skipWaiting();
});

// Activation du SW
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activé');
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Seulement les requêtes POST/GET vers les APIs
  if (event.request.method === 'POST' || event.request.method === 'GET') {
    event.respondWith(sw(event.request));
  }
});

async function sw(request) {
  try {
    // Essayer de récupérer depuis le réseau
    const response = await fetch(request);
    
    // Si succès, mettre en cache
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Si erreur réseau (offline), retourner du cache
    console.log('⚠️ Offline, utiliser le cache');
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Pas de cache disponible
    return new Response('Offline', { status: 503 });
  }
}

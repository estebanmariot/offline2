const CACHE_NAME = 'todolist-cache-v1';
const API_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:NbNF6YZg/todolist';

// Installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  self.clients.claim();
});

// Interception des fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Seulement pour les requêtes vers Xano
  if (url.origin === 'https://x8ki-letl-twmt.n7.xano.io') {
    event.respondWith(handleFetch(request));
  }
});

async function handleFetch(request) {
  try {
    // Essayer le fetch normal (online)
    const response = await fetch(request.clone());
    
    // Si succès, mettre en cache
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      console.log('Réponse mise en cache:', request.url);
    }
    
    return response;
    
  } catch (error) {
    // Offline: retourner le cache
    console.log('Offline, utiliser le cache');
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Cache utilisé:', request.url);
      return cachedResponse;
    }
    
    // Pas de cache, retourner erreur
    return new Response(
      JSON.stringify({ error: 'Offline - pas de cache' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

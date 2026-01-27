const CACHE_NAME = 'todolist-cache-v1';
const API_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:NbNF6YZg/todolist';

// Installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Ajouter la page /second au cache
      return cache.addAll([
        '/second'
      ]);
    })
  );
  
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
    event.respondWith(handleApiFetch(request));
  }
  
  // Pour TOUTES les pages, afficher /second en offline
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
  }
});

// Gestion des API Xano
async function handleApiFetch(request) {
  try {
    const response = await fetch(request.clone());
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      console.log('API mise en cache:', request.url);
    }
    
    return response;
    
  } catch (error) {
    console.log('API offline, utiliser le cache');
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('API cache utilisé:', request.url);
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ offline: true, message: 'Mode offline - sync local' }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleNavigation(request) {
  try {
    // Essayer le réseau d'abord
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('Navigation offline, afficher /second');
    
    // Fallback vers /second
    const cache = await caches.open(CACHE_NAME);
    const cachedPage = await cache.match('/second') || await cache.match('/second/index.html');
    
    if (cachedPage) {
      console.log('Page /second servie depuis cache');
      return cachedPage;
    }
    
    // Si pas en cache, générer une page offline
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Offline - Todo List</title>
        <meta name="viewport" content="width=device-width">
        <style>
          body { font-family: Arial; padding: 2rem; text-align: center; }
          .offline { color: #666; }
          .btn { background: #007bff; color: white; padding: 1rem 2rem; border: none; border-radius: 5px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>📱 Mode Hors Ligne</h1>
        <p class="offline">Votre connexion est interrompue. Vos tâches sont synchronisées localement.</p>
        <p>La synchronisation se fera automatiquement quand vous serez reconnecté.</p>
        <button class="btn" onclick="window.location.reload()">🔄 Recharger</button>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

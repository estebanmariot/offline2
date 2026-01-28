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
    url.includes('.js') ||
    url.includes('manifest.json')
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

// ✨ NOUVEAU : Message listener pour charger les todos depuis IndexedDB
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_TODOS') {
    console.log('📨 SW: Message reçu GET_TODOS');
    
    const request = indexedDB.open('toDoList', 2);
    
    request.onsuccess = (e) => {
      const db = e.target.result;
      
      // Vérifier que l'object store existe
      if (!db.objectStoreNames.contains('todolist')) {
        console.warn('⚠️ SW: Object store todolist inexistant');
        event.ports[0].postMessage({
          type: 'TODOS_LOADED',
          todos: []
        });
        db.close();
        return;
      }
      
      try {
        const transaction = db.transaction(['todolist'], 'readonly');
        const store = transaction.objectStore('todolist');
        const getAll = store.getAll();
        
        getAll.onsuccess = () => {
          console.log('📤 SW: Envoi de', getAll.result.length, 'todos');
          event.ports[0].postMessage({
            type: 'TODOS_LOADED',
            todos: getAll.result
          });
          db.close();
        };
        
        getAll.onerror = () => {
          console.error('❌ SW: Erreur lecture IndexedDB');
          event.ports[0].postMessage({
            type: 'TODOS_LOADED',
            todos: []
          });
          db.close();
        };
      } catch(err) {
        console.error('❌ SW: Erreur transaction:', err);
        event.ports[0].postMessage({
          type: 'TODOS_LOADED',
          todos: []
        });
        db.close();
      }
    };
    
    request.onerror = () => {
      console.error('❌ SW: Erreur ouverture DB');
      event.ports[0].postMessage({
        type: 'TODOS_LOADED',
        todos: []
      });
    };
  }
});

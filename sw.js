self.addEventListener('fetch', (event) => {
  console.log(`Fetching: ${event.request.url}, Mode: ${event.request.mode}`);

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) return preloadResponse;
        return await fetch(event.request);
      } catch (e) {
        console.log('Offline → TODO page');
        return new Response('<h1>TODOLIST Offline</h1>', {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    })());
  }
});

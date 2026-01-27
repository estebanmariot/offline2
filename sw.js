const PREFIX = 'V1';

self.addEventListener('install', () => {
    self.skipWaiting();
    console.log(`${PREFIX} Install`)
});

self.addEventListener('activate', () => {
    console.log(`${PREFIX} Active`)
});

self.addEventListener("fetch", (event) => {
    console.log(`Fetching : ${event.request.url}, Mode : ${event.request.mode}`);

    if (event.request.mode === 'navigate'){
        event.respondWith((async () => {
            try{
                const preloadResponse = await event.preloadResponse
                if (preloadResponse) {
                    return preloadResponse;
                }

                return await fetch(event.request)
            } catch(e) {
                return new Response("TODOLIST");
            }
        }))
    }
});

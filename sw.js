self.addEventListener("fetch", (event) => {
    console.log('Fetching : ${event.request.url}, Mode : ${event.request.mode}');

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

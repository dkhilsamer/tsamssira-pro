const CACHE_NAME = 'tsamssira-pro-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png',
    '/style.css'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching initial assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip API calls - Network Only/First
    if (url.pathname.startsWith('/api')) {
        return;
    }

    // Cache First for other assets
    event.respondWith(
        caches.match(request).then((response) => {
            return response || fetch(request).then((fetchRes) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    // Only cache successful GET requests
                    if (request.method === 'GET' && fetchRes.status === 200) {
                        cache.put(request, fetchRes.clone());
                    }
                    return fetchRes;
                });
            });
        }).catch(() => {
            // Fallback for offline if index.html is in cache
            if (request.mode === 'navigate') {
                return caches.match('/index.html');
            }
        })
    );
});

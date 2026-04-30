const CACHE_NAME = 'roktokorobi-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/donors',
  '/request',
  '/profile',
  '/blood-requests',
  '/leaderboard',
  '/api/donors/nearby',
  '/api/hospitals',
  '/api/stats',
  '/api/blood-requests',
  '/api/user/location-consent'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

const CACHE_NAME = 'idle-energy-empire-v2. 0. 0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/variables.css',
  '/css/main.css',
  '/css/components/buttons.css',
  '/css/components/cards.css',
  '/css/components/tabs.css',
  '/css/components/modals.css',
  '/css/components/notifications. css',
  '/css/components/tooltips.css',
  '/css/components/tutorial.css',
  '/css/components/upgrade-queue.css',
  '/js/main.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event. waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
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
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event. request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
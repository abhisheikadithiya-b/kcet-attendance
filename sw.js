const CACHE_NAME = 'student-checkin-v1';
const ASSETS = [
  'index.html',
  'admin_login.html',
  'register.html',
  'assets/css/styles.css',
  'assets/js/app.js',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Bypass Service Worker for database APIs and heavy AI models
  if (event.request.url.includes('/api/') || event.request.url.includes('/models/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

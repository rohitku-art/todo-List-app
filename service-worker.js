const CACHE_NAME = 'todo-app-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './todo.html',
  './style.css',
  './script.js',
  './auth.js',
  './firebase.js'
];

// Service Worker Install karna
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Requests ko fetch karna
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
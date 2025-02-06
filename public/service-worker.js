const CACHE_NAME = "my-app-cache-v1";
const OFFLINE_URL = "/offline.html";

// List of URLs to cache (adjust as needed)
const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html", // a fallback offline page (see below)
  "/assets/styles.css",
  // include your built JS/CSS files or any assets you want cached
];

// Install event: cache app shell and assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event: serve cached content if offline, otherwise fetch from network
self.addEventListener("fetch", (event) => {
  // For navigation requests, try network first, then cache fallback to offline.html
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_URL, { ignoreSearch: true })
      )
    );
    return;
  }
  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Cache the new response for future requests
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        })
      );
    })
  );
});

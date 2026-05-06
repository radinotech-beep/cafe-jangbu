const CACHE_NAME = 'cafe-jangbu-v3';

const STATIC_ASSETS = [
  '/cafe-jangbu/cafe_ledger_v4.html',
  '/cafe-jangbu/order_new.html',
  '/cafe-jangbu/kds.html',
  '/cafe-jangbu/manifest-ledger.json',
  '/cafe-jangbu/manifest-order.json',
  '/cafe-jangbu/manifest-kds.json',
  '/cafe-jangbu/icon-ledger-192.png',
  '/cafe-jangbu/icon-ledger-512.png',
  '/cafe-jangbu/icon-order-192.png',
  '/cafe-jangbu/icon-order-512.png',
  '/cafe-jangbu/icon-kds-192.png',
  '/cafe-jangbu/icon-kds-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

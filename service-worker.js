const CACHE_NAME = 'cafe-jangbu-v1';

// 오프라인에서도 쓸 수 있도록 캐시할 파일들
const STATIC_ASSETS = [
  '/cafe-jangbu/cafe_ledger_v4.html',
  '/cafe-jangbu/order_new.html',
  '/cafe-jangbu/kds.html',
  '/cafe-jangbu/manifest.json',
  '/cafe-jangbu/icon-192.png',
  '/cafe-jangbu/icon-512.png',
];

// 설치 시 캐시 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화 시 이전 캐시 삭제
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

// 네트워크 우선, 실패 시 캐시 사용 (Firebase 실시간 연동 유지)
self.addEventListener('fetch', event => {
  // Firebase 요청은 캐시 안 함 (항상 최신 데이터)
  if (event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 성공하면 캐시도 업데이트
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 응답
        return caches.match(event.request);
      })
  );
});

// DRAVÉ 오프라인 지원: 앱 화면을 저장해 두고, 인터넷이 없을 때도 열리게 해요.
const CACHE = 'drave-v5';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 같은 사이트 파일만 처리 (데이터 서버 요청은 건드리지 않음)
  if (url.origin !== location.origin) return;
  // 최신 버전 우선, 인터넷이 없으면 저장본 사용
  e.respondWith(
    fetch(req, {cache: 'no-cache'}).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});

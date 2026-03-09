'use strict';
const CACHE = 'yangdosave-v3.3'; // 버전 변경 → 구버전 캐시 전부 삭제
const PRECACHE = ['/', '/index.html', '/style.css', '/app.js', '/template.js', '/logo.png'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    // Firebase / CDN 요청은 캐시 안 함
    if (/firestore|googleapis|gstatic|firebase/.test(e.request.url)) return;
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
            if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
            return res;
        })).catch(() => caches.match('/index.html'))
    );
});

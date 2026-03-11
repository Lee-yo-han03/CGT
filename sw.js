'use strict';
const CACHE = 'yangdosave-v3.6'; // 버전 변경 → 구버전 캐시 전부 삭제
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
    // Firebase / CDN / Analytics 요청은 캐시 안 함
    if (/firestore|googleapis|gstatic|firebase|googletagmanager|googlesyndication|clarity\.ms|cdnjs/.test(e.request.url)) return;

    // Network First with Cache Fallback 전략
    e.respondWith(
        fetch(e.request).then(res => {
            if (res.ok && e.request.url.startsWith(self.location.origin)) {
                const resClone = res.clone();
                caches.open(CACHE).then(c => c.put(e.request, resClone));
            }
            return res;
        }).catch(() => {
            return caches.match(e.request).then(cached => {
                if (cached) return cached;
                // 페이지 이동(navigation) 요청인 경우에만 index.html 반환
                if (e.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return;
            });
        })
    );
});

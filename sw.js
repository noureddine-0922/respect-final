const CACHE_NAME = 'respect-streams-v2'; // غيرت الإصدار عشان يحدث الكاش
const ASSETS = [
  '/',
  '/style.css',
  '/main.js',
  '/manifest.json'
];

// تثبيت التطبيق وتخزين الملفات
self.addEventListener('install', (e) => {
  self.skipWaiting(); // فرض التحديث الفوري
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// تفعيل السيرفر وركر الجديد وحذف القديم
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// جلب الملفات من الكاش
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});



const CACHE = 'mobile-v6';
const PRECACHE = [
  'index.html',
  'assets/style.css',
  'assets/app.js',
  'assets/manifest.json',
  'lessons/01-intro-js.html',
  'lessons/02-ui-responsiva.html',
  'lessons/03-pwa-basics.html',
  'lessons/04-web-apis.html',
  'lessons/05-expo-snack.html',
  'lessons/06-projeto-final.html',
  'assignments/checkpoint-1.html',
  'assignments/checkpoint-2.html',
  'assignments/checkpoint-3.html',
  'assignments/projeto-final.html',
  'offline.html',
  'pwa-debug.html',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/maskable-192.png'
];
const PRECACHE_URLS = PRECACHE.map(p => new URL(p, self.registration.scope).href);

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', evt => {
  const req = evt.request;
  if(req.mode === 'navigate'){
    evt.respondWith(
      fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })
        .catch(() => caches.match('offline.html').then(r => r || caches.match('index.html')))
    );
    return;
  }
  if(PRECACHE_URLS.includes(req.url)){
    evt.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; }))
    );
  }
});

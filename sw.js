
self.addEventListener('install', evt => {
  evt.waitUntil(caches.open('uc-mobile-v1').then(c => c.addAll([
    '.', 'assets/style.css', 'assets/app.js', 'assets/manifest.json'
  ])));
});
self.addEventListener('fetch', evt => {
  evt.respondWith(caches.match(evt.request).then(resp => resp || fetch(evt.request)));
});

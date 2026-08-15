const CACHE_NAME = 'imamalergiju-v32';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/i18n.js',
  './js/allergens.js',
  './js/offapi.js',
  './js/offwrite.js',
  './js/profiles.js',
  './js/history.js',
  './js/app.js',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  // cache.addAll() koristi fetch() koji po defaultu smije vratiti stare stvari iz
  // browser HTTP keša — cache:'reload' forsira mrežu, pa se ovdje uvijek uzima svježe.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        APP_SHELL.map((url) =>
          fetch(url, { cache: 'reload' }).then((response) => cache.put(url, response))
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

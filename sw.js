// VAŽNO: povećaj ovaj broj SVAKI PUT kad se pushuje bilo kakva izmjena sajta/app-a.
// Ako se ovaj fajl ne promijeni, browser vidi identičan sw.js i nikad ne primijeti
// da postoji nova verzija — auto-refresh ispod se onda nikad ne aktivira, i
// korisnik ostaje zaglavljen na staroj verziji dok ručno ne očisti keš.
const CACHE_NAME = 'imamalergiju-v47';
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
  './js/qrcode.js',
  './js/app.js',
  './js/consent.js',
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

  // Mreža prvo, keš samo kao rezerva ako nema interneta. cache:'no-store' je
  // bitan — bez njega bi fetch() smio vratiti GitHub Pages-ov keširan odgovor
  // (Cache-Control: max-age=600) umjesto da stvarno pita mrežu, pa bi "mreža
  // prvo" u praksi značilo "keš prvo" do 10 minuta poslije svakog pusha.
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

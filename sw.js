// Cache version — increment for new deployments
const CACHE = 'flexora-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/tailwind.css',
  '/script.js',
  '/manifest.webmanifest',
  '/assets/fonts/Inter-Variable.woff2',
  '/assets/fonts/SpaceGrotesk-Variable.woff2',
  '/assets/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install:', CACHE);
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial failure:', err.message);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate:', CACHE);
  event.waitUntil(
    caches.keys().then((keys) => {
      const old = keys.filter((k) => k !== CACHE);
      if (old.length) console.log('[SW] Cleaning old caches:', old);
      return Promise.all(old.map((k) => caches.delete(k)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/index.html').then((cached) => {
          if (!cached) {
            return new Response(
              '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Flexora — Offline</title><style>body{background:#050816;color:#ffd700;font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;text-align:center;padding:1rem}.offline-card{max-width:400px}h1{font-family:Georgia,serif;font-size:1.8rem;margin-bottom:0.5rem}p{color:#aaa;font-size:1.05rem}</style></head><body><div class="offline-card"><h1>Flexora</h1><p>El Olimpo est\u00e1 temporalmente fuera de l\u00ednea.</p></div></body></html>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          }
          return cached;
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

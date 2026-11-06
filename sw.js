/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   GarantÃ­asPro â€” Service Worker
   - Precache del esqueleto de la app (funciona sin conexiÃ³n).
   - NUNCA cachea datos privados: solo recursos estÃ¡ticos del propio
     dominio. Las llamadas a la base de datos y las URLs firmadas de
     los tickets son de otro origen y pasan siempre por la red.
   - Recibe los avisos push de plazos y los muestra.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
'use strict';

const VERSION = 'gp-v4';
const STATIC_CACHE = `${VERSION}-static`;

const PRECACHE = [
  './',
  'index.html',
  'auth.html',
  'styles.css',
  'auth.css',
  'urgent-alert.css',
  'cookies.css',
  'icons.js',
  'supabase-client.js',
  'session-guard.js',
  'session.js',
  'app.js',
  'auth.js',
  'urgent-alert.js',
  'cookies.js',
  'pwa.js',
  'push.js',
  'vendor/supabase.js',
  'vendor/tesseract.min.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    // Uno a uno: si un archivo falla no se rompe toda la instalaciÃ³n
    await Promise.all(PRECACHE.map((url) =>
      cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
    ));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Solo recursos del propio dominio; todo lo demÃ¡s (datos, fuentes) va directo a la red
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;

  // PÃ¡ginas: red primero (para recibir actualizaciones) y cachÃ© si no hay conexiÃ³n
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch {
        const cached = await caches.match(req, { ignoreSearch: true });
        return cached || (await caches.match('index.html')) || Response.error();
      }
    })());
    return;
  }

  // EstÃ¡ticos: cachÃ© primero y actualizaciÃ³n en segundo plano
  event.respondWith((async () => {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(req);
    const network = fetch(req).then((res) => {
      if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    }).catch(() => null);
    return cached || (await network) || Response.error();
  })());
});

/* â”€â”€ Avisos push â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data ? event.data.text() : '' }; }

  const title = data.title || 'GarantÃ­asPro';
  const options = {
    body: data.body || 'Tienes plazos a punto de vencer.',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    tag: data.tag || 'gp-deadline',
    renotify: Boolean(data.renotify),
    data: { url: data.url || './index.html#alerts' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || './index.html#alerts', self.registration.scope).href;

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
        await client.focus();
        client.postMessage({ type: 'OPEN_VIEW', view: 'alerts' });
        return;
      }
    }
    await self.clients.openWindow(target);
  })());
});


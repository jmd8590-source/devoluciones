/* ═══════════════════════════════════════════════════════════════
   GarantíasPro — Service Worker
   - Precache del esqueleto de la app (funciona sin conexión).
   - NUNCA cachea datos privados: solo recursos estáticos del propio
     dominio. Las llamadas a la base de datos y las URLs firmadas de
     los tickets son de otro origen y pasan siempre por la red.
   - Recibe los avisos push de plazos y los muestra.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const VERSION = 'gp-v8';
const STATIC_CACHE = `${VERSION}-static`;

const PRECACHE = [
  './',
  'index.html',
  'auth.html',
  'styles.css',
  'auth.css',
  'urgent-alert.css',
  'cookies.css',
  'fonts.css',
  'tokens.css',
  'fonts/figtree-latin-wght-normal.woff2',
  'fonts/bricolage-grotesque-latin-wght-normal.woff2',
  'ui.css',
  'cercana.css',
  'theme.js',
  'tour.js',
  'claim-pdf.js',
  'icons.js',
  'supabase-client.js',
  'session-guard.js',
  'session.js',
  'i18n.js',
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
  // La versión nueva toma el control en cuanto se instala (antes quedaba
  // «en espera» hasta cerrar todas las pestañas y el móvil veía la antigua).
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    // Uno a uno: si un archivo falla no se rompe toda la instalación
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
  // Solo recursos del propio dominio; todo lo demás (datos, fuentes) va directo a la red
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;

  // Páginas: red primero (para recibir actualizaciones) y caché si no hay conexión
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

  // Ficheros que no cambian nunca (fuentes, iconos, librerías): caché primero.
  const immutable = /\/(fonts|icons|vendor)\//.test(url.pathname);
  if (immutable) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    })());
    return;
  }

  // Código y estilos de la app: red primero (siempre la última versión)
  // y la copia guardada solo si no hay conexión.
  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res && res.ok && req.cache !== 'no-store') {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    } catch {
      const cached = await caches.match(req, { ignoreSearch: true });
      return cached || Response.error();
    }
  })());
});

/* ── Avisos push ───────────────────────────────────────────────── */
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data ? event.data.text() : '' }; }

  const title = data.title || 'GarantíasPro';
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


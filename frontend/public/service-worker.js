// ─────────────────────────────────────────────────────────────────────────────
// service-worker.js — PesaLocal PWA Service Worker
//
// Strategy overview:
//   • App shell (HTML, JS, CSS, fonts)  → Cache-first, stale-while-revalidate
//   • /api/*  sync endpoints            → Network-first, queue offline (Background Sync)
//   • /api/*  read endpoints (GET)      → Network-first with cache fallback
//   • Google Fonts                      → Cache-first (long TTL)
//   • Everything else                   → Network-first, cache fallback
//
// Offline behaviour:
//   • App loads fully from cache even with no connection
//   • Failed POST /api/sync/* ops queued in IndexedDB via Background Sync tag
//   • Push notifications scaffold wired (requires server VAPID key)
// ─────────────────────────────────────────────────────────────────────────────

const APP_VERSION   = 'v1';
const SHELL_CACHE   = `pesalocal-shell-${APP_VERSION}`;
const API_CACHE     = `pesalocal-api-${APP_VERSION}`;
const FONT_CACHE    = `pesalocal-fonts-${APP_VERSION}`;
const BG_SYNC_TAG   = 'pesalocal-sync';

// Assets to pre-cache on install (app shell)
// Vite injects hashed filenames at build time; in dev these paths work as-is.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ── Install ───────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log(`[SW ${APP_VERSION}] Installing…`);

  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => {
        console.log(`[SW ${APP_VERSION}] Pre-cache complete`);
        // Take control immediately without waiting for old SW to finish
        return self.skipWaiting();
      })
      .catch((err) => console.warn('[SW] Pre-cache failed (dev mode?)', err))
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  console.log(`[SW ${APP_VERSION}] Activating…`);

  event.waitUntil(
    Promise.all([
      // Wipe all caches from previous versions
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== API_CACHE && k !== FONT_CACHE)
            .map((k) => {
              console.log(`[SW] Deleting stale cache: ${k}`);
              return caches.delete(k);
            })
        )
      ),
      // Claim all open clients immediately
      self.clients.claim(),
    ]).then(() => console.log(`[SW ${APP_VERSION}] Active and in control`))
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin + Google Fonts
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (!isSameOrigin && !isGoogleFont) return; // let browser handle CDN, etc.

  // ── API: sync mutations (POST/PUT/DELETE) → network, queue on fail ──────────
  if (isSameOrigin && url.pathname.startsWith('/api/sync') && request.method !== 'GET') {
    event.respondWith(networkWithSyncQueue(request));
    return;
  }

  // ── API: reads (GET) → network-first, cache fallback ───────────────────────
  if (isSameOrigin && url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, 60 * 1000)); // 1 min
    return;
  }

  // ── Google Fonts → cache-first (they never change) ─────────────────────────
  if (isGoogleFont) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // ── App shell navigation (HTML) → stale-while-revalidate ───────────────────
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE, '/index.html'));
    return;
  }

  // ── Static assets (JS/CSS/images built by Vite) → cache-first ──────────────
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // ── Default → network-first ─────────────────────────────────────────────────
  event.respondWith(networkFirstWithCache(request, SHELL_CACHE, 0));
});

// ── Strategy helpers ──────────────────────────────────────────────────────────

/**
 * Cache-first: serve from cache, fall back to network and cache result.
 * Best for immutable assets (hashed JS/CSS, fonts).
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback(request);
  }
}

/**
 * Stale-while-revalidate: serve cache immediately, update in background.
 * Best for HTML navigations — fast load AND fresh content.
 */
async function staleWhileRevalidate(request, cacheName, fallbackUrl) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request) || await cache.match(fallbackUrl);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || await fetchPromise || offlineFallback(request);
}

/**
 * Network-first with cache fallback.
 * Best for API reads and non-hashed assets.
 * @param {number} ttlMs — set to 0 to always prefer network
 */
async function networkFirstWithCache(request, cacheName, ttlMs) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  // If we have a fresh enough cached response, use it without hitting network
  if (cached && ttlMs > 0) {
    const cachedDate = new Date(cached.headers.get('sw-cached-at') || 0);
    if (Date.now() - cachedDate.getTime() < ttlMs) return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Stamp response with cache time so TTL works
      const stamped = stampResponse(response.clone());
      cache.put(request, stamped);
      return response;
    }
    return cached || response;
  } catch {
    return cached || offlineFallback(request);
  }
}

/**
 * Network-first for sync mutations. On failure, registers a Background Sync
 * tag so the browser retries when connectivity returns.
 */
async function networkWithSyncQueue(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch (err) {
    // Queue for Background Sync
    try {
      await self.registration.sync.register(BG_SYNC_TAG);
      console.log('[SW] Registered background sync tag:', BG_SYNC_TAG);
    } catch {
      console.warn('[SW] Background Sync not supported — app-level queue will handle retry');
    }

    // Return a synthetic queued response so the app knows it was accepted offline
    return new Response(
      JSON.stringify({ queued: true, message: 'Saved locally, will sync when online' }),
      {
        status:  202,
        headers: { 'Content-Type': 'application/json', 'X-SW-Queued': '1' },
      }
    );
  }
}

/** Stamp a cloned response with current time for cache TTL checks */
function stampResponse(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', new Date().toISOString());
  return new Response(response.body, {
    status:     response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Offline fallback — generic or JSON depending on request */
function offlineFallback(request) {
  const isJson = request.headers.get('accept')?.includes('application/json');
  if (isJson) {
    return new Response(
      JSON.stringify({ error: 'offline', message: 'You are offline. Data is saved locally.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
  // For navigation, return a minimal offline page
  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PesaLocal — Offline</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
          font-family: system-ui, sans-serif;
          background: #080A0C; color: #EAE8E3;
          min-height: 100vh; display: flex;
          align-items: center; justify-content: center;
          flex-direction: column; gap: 16px; padding: 24px;
          text-align: center;
        }
        .icon { font-size: 56px; }
        h1 { font-size: 24px; font-weight: 700; }
        p { color: #7A8490; font-size: 14px; line-height: 1.6; max-width: 320px; }
        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(46,207,168,0.1); border: 1px solid rgba(46,207,168,0.2);
          border-radius: 40px; padding: 6px 16px;
          color: #2ECFA8; font-size: 13px; font-weight: 600;
        }
        button {
          margin-top: 8px; padding: 10px 24px; border-radius: 40px;
          background: #2ECFA8; color: #080A0C;
          border: none; font-size: 14px; font-weight: 700; cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="icon">📵</div>
      <h1>You're offline</h1>
      <p>PesaLocal is a local-first app. All your data is saved on this device and will sync automatically when you reconnect.</p>
      <div class="badge">🔒 Your data is safe locally</div>
      <button onclick="window.location.reload()">Retry</button>
    </body>
    </html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

/** True for Vite-built hashed assets and common static extensions */
function isStaticAsset(url) {
  const p = url.pathname;
  return (
    p.startsWith('/assets/') ||
    p.startsWith('/icons/')  ||
    /\.(js|mjs|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|webp|ico|gif|avif)(\?.*)?$/.test(p)
  );
}

// ── Background Sync ───────────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === BG_SYNC_TAG) {
    console.log('[SW] Background sync fired — notifying app to flush queue');
    event.waitUntil(notifyClientsToSync());
  }
});

/**
 * Tell all open PesaLocal windows to run their sync engine.
 * The app-level sync.ts already handles the actual queue draining.
 */
async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: 'BACKGROUND_SYNC_FIRED', tag: BG_SYNC_TAG });
  }
  console.log(`[SW] Notified ${clients.length} client(s) to sync`);
}

// ── Push Notifications ────────────────────────────────────────────────────────
// Scaffold — wire up by sending push events from your Go server with VAPID.

self.addEventListener('push', (event) => {
  let data = { title: 'PesaLocal', body: 'You have a new notification', icon: '/icons/icon-192.png' };

  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon || '/icons/icon-192.png',
      badge:   '/icons/icon-96.png',
      tag:     data.tag || 'pesalocal-default',
      data:    data,
      actions: data.actions || [],
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus an existing window if open
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({ type: 'NOTIFICATION_CLICK', data: event.notification.data });
            return;
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) return self.clients.openWindow(url);
      })
  );
});

// ── Message handler ───────────────────────────────────────────────────────────
// Allows the app to communicate with the SW directly.

self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      // Called by the update prompt to immediately activate new SW
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.source?.postMessage({ type: 'SW_VERSION', version: APP_VERSION });
      break;

    case 'CLEAR_CACHE':
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => event.source?.postMessage({ type: 'CACHE_CLEARED' }));
      break;

    default:
      break;
  }
});

// ── Periodic Background Sync (where supported) ────────────────────────────────
// Registered by the app on first load. Gives the SW a chance to ping the app
// to sync every ~12 hours even when the app isn't open.

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'pesalocal-periodic-sync') {
    event.waitUntil(notifyClientsToSync());
  }
});
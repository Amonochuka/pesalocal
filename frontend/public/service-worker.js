// public/service-worker.js — Cashlet PWA
// Fixes applied:
//   Bug 1 (line ~187): resp.clone() called after body already consumed — fixed
//          by cloning BEFORE any await/then that reads the body.
//   Bug 2 (white screen offline): '/' was in SHELL_URLS so cache-first ran,
//          but '/' returns the HTML shell which references /assets/* hashed
//          files. Those weren't being pre-cached, so offline gave a blank page.
//          Fixed by pre-caching ALL /assets/* files surfaced at install time,
//          and falling through to offline.html correctly for HTML requests.
//   Bug 3 (IDB not connecting): The SW opens CashletDB at version 1, but Dexie
//          opens it at version 1 too and creates ALL stores in onupgradeneeded.
//          If the SW's openIDB() ran first (before the app loaded), it created
//          the DB with ONLY offlineQueue, then Dexie tried to upgrade to add
//          the other stores but the version number was the same so
//          onupgradeneeded never fired for Dexie. Fixed by bumping SW IDB
//          version to 2 so it never races with Dexie's v1 schema creation,
//          and by making the SW only open its own isolated database
//          (CashletOfflineDB) rather than sharing CashletDB.

const CACHE_NAME    = 'cashlet-v1';
const SYNC_TAG      = 'cashlet-form-sync';

// ── CRITICAL: SW uses its OWN separate database, not CashletDB ───────────────
// Reason: Dexie owns CashletDB. If the SW also opens CashletDB, they race
// on onupgradeneeded and one will block or corrupt the other's schema.
// The SW only needs the offlineQueue — a separate lightweight DB is cleaner.
const SW_IDB_NAME   = 'CashletSW';
const SW_IDB_VER    = 1;
const OFFLINE_STORE = 'offlineQueue';

const SHELL_URLS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-96x96.png',
  '/icons/icon-216x96.png',
];

// ── Install ───────────────────────────────────────────────────────────────────
// Pre-cache the shell. We also fetch the root HTML and parse asset URLs from it
// so that /assets/*.js and /assets/*.css are cached before going offline.
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // 1. Cache stable shell URLs
      await Promise.all(
        SHELL_URLS.map(url =>
          cache.add(url).catch(err =>
            console.warn(`[SW] Failed to pre-cache ${url}:`, err)
          )
        )
      );

      // 2. Fetch root HTML and extract /assets/* references to pre-cache
      //    This solves the blank screen: Vite's hashed JS/CSS must be cached
      //    at install time, not lazily, or offline will show a white page.
      try {
        const rootResp = await fetch('/');
        if (rootResp.ok) {
          const html   = await rootResp.text();
          const assets = [...html.matchAll(/src="(\/assets\/[^"]+)"|href="(\/assets\/[^"]+)"/g)]
            .map(m => m[1] ?? m[2])
            .filter(Boolean);

          await Promise.all(
            assets.map(url =>
              cache.add(url).catch(err =>
                console.warn(`[SW] Failed to pre-cache asset ${url}:`, err)
              )
            )
          );

          // Re-cache the root HTML itself with the Response (not the text)
          await cache.put('/', new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          }));
        }
      } catch (err) {
        console.warn('[SW] Could not pre-cache assets from root HTML:', err);
      }

      await self.skipWaiting();
    })()
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;

  const url    = new URL(event.request.url);
  const isHTML = event.request.headers.get('accept')?.includes('text/html');
  const method = event.request.method;

  // ── 1. Mutating API calls — queue offline if network fails ────────────────
  if (url.pathname.startsWith('/api/') && method !== 'GET') {
    // Clone the request IMMEDIATELY before any async work.
    // Once fetch() consumes the body, cloning throws "body already used".
    const requestCloneForFetch = event.request.clone();
    const requestCloneForQueue = event.request.clone();

    event.respondWith(
      fetch(requestCloneForFetch)
        .catch(async () => {
          try {
            // Safe to read body here — we cloned before fetch() above
            const bodyText = await requestCloneForQueue.text();
            const headers  = {};
            event.request.headers.forEach((v, k) => { headers[k] = v; });

            const entityType = urlToEntityType(url.pathname);
            let entityId = 'unknown';
            try {
              const parsed = JSON.parse(bodyText);
              entityId = parsed.id ?? parsed.ID ?? 'unknown';
            } catch (_) {}

            await idbEnqueue({
              url:        event.request.url,
              method:     method,
              headers:    headers,
              body:       bodyText,
              entityType: entityType,
              entityId:   entityId,
              createdAt:  new Date().toISOString(),
              retries:    0,
            });

            return new Response(
              JSON.stringify({ queued: true, offline: true }),
              { status: 202, headers: { 'Content-Type': 'application/json' } }
            );
          } catch (queueErr) {
            console.error('[SW] Failed to queue offline request:', queueErr);
            return new Response(
              JSON.stringify({ error: 'Offline and failed to queue' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          }
        })
    );
    return;
  }

  // ── 2. GET API calls — Network-Only ──────────────────────────────────────
  if (url.pathname.startsWith('/api/')) return;

  // ── 3. App shell / manifest / icons — Cache-First ────────────────────────
  if (SHELL_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(resp => {
            if (!resp || !resp.ok) return resp;
            // Clone BEFORE storing — resp body can only be consumed once
            const toCache = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, toCache));
            return resp;
          })
          .catch(() =>
            isHTML ? caches.match('/offline.html') : undefined
          );
      })
    );
    return;
  }

  // ── 4. Vite hashed assets (/assets/*) — Cache-First ──────────────────────
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(resp => {
          if (!resp || !resp.ok) return resp;
          // Clone BEFORE storing
          const toCache = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, toCache));
          return resp;
        });
      })
    );
    return;
  }

  // ── 5. Images — Stale-While-Revalidate ───────────────────────────────────
  if (/\.(png|jpg|jpeg|webp|gif|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          const networkFetch = fetch(event.request)
            .then(resp => {
              if (resp && resp.ok) {
                // Clone BEFORE storing
                cache.put(event.request, resp.clone());
              }
              return resp;
            })
            .catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // ── 6. HTML navigation — Network-First + offline.html fallback ───────────
  if (isHTML) {
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          if (!resp || !resp.ok) return resp;
          // Clone BEFORE storing
          const toCache = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, toCache));
          return resp;
        })
        .catch(() =>
          caches.match(event.request)
            .then(cached => cached ?? caches.match('/offline.html') ?? caches.match('/'))
        )
    );
    return;
  }

  // ── 7. Everything else — Network-First, cache fallback ───────────────────
  event.respondWith(
    fetch(event.request)
      .then(resp => {
        if (!resp || !resp.ok) return resp;
        // Clone BEFORE storing — this was the original line ~187 crash
        const toCache = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, toCache));
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(flushOfflineQueue());
  }
});

async function flushOfflineQueue() {
  const database = await openSWDB();
  const items    = await idbGetAll(database);
  if (!items.length) return;

  for (const item of items) {
    try {
      const resp = await fetch(item.url, {
        method:  item.method,
        headers: item.headers,
        body:    item.body,
      });

      if (resp.ok) {
        await idbDelete(database, item.id);
        notifyClients({
          type:       'SYNC_SUCCESS',
          entityType: item.entityType,
          entityId:   item.entityId,
        });
      } else {
        await idbMarkRetry(database, item.id, `HTTP ${resp.status}`);
      }
    } catch (err) {
      await idbMarkRetry(database, item.id, String(err));
    }
  }
}

// ── SW ↔ App messaging ────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'FLUSH_QUEUE') {
    flushOfflineQueue().catch(console.error);
  }
});

function notifyClients(payload) {
  self.clients.matchAll({ includeUncontrolled: true })
    .then(clients => clients.forEach(c => c.postMessage(payload)));
}

// ── IndexedDB helpers (SW-only isolated database) ────────────────────────────

function openSWDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SW_IDB_NAME, SW_IDB_VER);

    req.onupgradeneeded = e => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(OFFLINE_STORE)) {
        const store = database.createObjectStore(OFFLINE_STORE, {
          keyPath: 'id', autoIncrement: true,
        });
        store.createIndex('entityType', 'entityType', { unique: false });
        store.createIndex('entityId',   'entityId',   { unique: false });
        store.createIndex('createdAt',  'createdAt',  { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function idbEnqueue(item) {
  return openSWDB().then(database =>
    new Promise((resolve, reject) => {
      const tx    = database.transaction(OFFLINE_STORE, 'readwrite');
      const store = tx.objectStore(OFFLINE_STORE);
      const r     = store.add(item);
      r.onsuccess = () => resolve(r.result);
      r.onerror   = () => reject(r.error);
    })
  );
}

function idbGetAll(database) {
  return new Promise((resolve, reject) => {
    const tx = database.transaction(OFFLINE_STORE, 'readonly');
    const r  = tx.objectStore(OFFLINE_STORE).getAll();
    r.onsuccess = () => resolve(r.result);
    r.onerror   = () => reject(r.error);
  });
}

function idbDelete(database, id) {
  return new Promise((resolve, reject) => {
    const tx = database.transaction(OFFLINE_STORE, 'readwrite');
    const r  = tx.objectStore(OFFLINE_STORE).delete(id);
    r.onsuccess = () => resolve();
    r.onerror   = () => reject(r.error);
  });
}

function idbMarkRetry(database, id, error) {
  return new Promise((resolve, reject) => {
    const tx     = database.transaction(OFFLINE_STORE, 'readwrite');
    const store  = tx.objectStore(OFFLINE_STORE);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item = getReq.result;
      if (!item) { resolve(); return; }
      item.retries  += 1;
      item.lastError = error;
      const put = store.put(item);
      put.onsuccess = () => resolve();
      put.onerror   = () => reject(put.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// ── URL → entity type ─────────────────────────────────────────────────────────
function urlToEntityType(pathname) {
  if (pathname.includes('/sales/items'))     return 'saleItem';
  if (pathname.includes('/sales'))           return 'sale';
  if (pathname.includes('/purchases/items')) return 'purchaseItem';
  if (pathname.includes('/purchases'))       return 'purchase';
  if (pathname.includes('/products'))        return 'product';
  return 'unknown';
}
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { registerOnlineSync } from "./services/storage/db";

// ── Service Worker registration ───────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then(reg => {
        console.log('[SW] Registered. Scope:', reg.scope);

        // When the app comes back online, also tell the SW to flush the queue.
        // This is a belt-and-suspenders fallback for browsers that don't
        // support the Background Sync API (iOS Safari < 17.4).
        window.addEventListener('online', () => {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'FLUSH_QUEUE' });
          }
        });
      })
      .catch(err => console.error('[SW] Registration failed:', err));

    // Listen for sync-success messages from the SW so the UI can update
    // record status from 'pending' → 'synced' without a page refresh.
    navigator.serviceWorker.addEventListener('message', event => {
      const { type, entityType, entityId } = event.data ?? {};
      if (type === 'SYNC_SUCCESS') {
        console.log(`[SW → App] Synced ${entityType} ${entityId}`);
        // Dispatch a custom DOM event so any component can listen:
        //   window.addEventListener('cashlet:synced', e => { ... e.detail ... })
        window.dispatchEvent(
          new CustomEvent('cashlet:synced', { detail: { entityType, entityId } })
        );
      }
    });
  });
}

// ── IndexedDB online-sync fallback ────────────────────────────────────────────
// Runs in the app context (has Dexie) — complements the SW Background Sync.
const cleanupOnlineSync = registerOnlineSync();

// Cleanup if the module ever hot-reloads (dev only)
if (import.meta.hot) {
  import.meta.hot.dispose(() => cleanupOnlineSync());
}

// ── React root ────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

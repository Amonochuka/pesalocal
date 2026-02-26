# PWA 

## 1. Web App Manifest

File: `manifest.json`
Purpose: Tells the browser how your app behaves when installed.

Key fields:

* `name` and `short_name`
* `start_url`
* `display: "standalone"`
* `background_color`
* `theme_color`
* `icons` with multiple sizes, 192x192 and 512x512 required

Example:

```json
{
  "name": "Cashlet",
  "short_name": "Cashlet",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Link it in `index.html`:

```html
<link rel="manifest" href="/manifest.json" />
```

---

## 2. Service Worker

Purpose:

* Cache static assets
* Enable offline mode
* Control updates

Basic flow:

* Install event → cache core files
* Activate event → clean old caches
* Fetch event → serve cached files when offline

Minimal example:

```js
const CACHE_NAME = "app-v1";
const urlsToCache = ["/", "/index.html", "/assets/main.js"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

Register it in your app:

```js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
```

Service workers require HTTPS. Localhost works in development.

---

## 3. Icons

Required:

* 192x192
* 512x512

Recommended:

* Maskable icon for Android
* Apple touch icon for iOS

Place them in `/public/icons`.

Use PNG format. Keep background solid and clean.

---

## 4. Screenshots

Used for install prompt in Chrome.

Add to manifest:

```json
"screenshots": [
  {
    "src": "/screenshots/desktop.png",
    "sizes": "1280x720",
    "type": "image/png",
    "form_factor": "wide"
  },
  {
    "src": "/screenshots/mobile.png",
    "sizes": "390x844",
    "type": "image/png"
  }
]
```

Provide at least:

* One mobile view
* One desktop view

---

## 5. Testing With Chrome DevTools

Open DevTools → Application tab.

Check:

* Manifest loads correctly
* Icons appear
* Service worker is registered
* Cache storage contains files

Test offline:

* Go to Network tab
* Enable “Offline”
* Refresh
* App should still load

Check installability:

* Look for “Install” icon in address bar

---

## 6. Testing With Lighthouse

Open DevTools → Lighthouse tab.

Select:

* Progressive Web App
* Performance
* Best Practices

Run audit.

To pass PWA:

* App loads offline
* Has valid manifest
* Has service worker
* Served over HTTPS
* Fast first load

Aim for:

* Performance score above 90
* No PWA install errors

---

## 7. Minimum Checklist

* Manifest linked
* Valid icons
* Service worker registered
* Offline caching works
* HTTPS enabled
* Lighthouse PWA audit passes


self.options = {
    "domain": "5gvci.com",
    "zoneId": 11523162
}
self.lary = ""
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')

/* ============================================================
   Mihad Free Video — Service Worker
   App-shell + offline caching strategy.
   ============================================================ */

const CACHE_VERSION = "mihad-v1";
const CORE_ASSETS = ["/", "/offline", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_VERSION)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache cross-origin images from image CDNs — let network handle
  // them (the browser cache will). Same-origin navigations: network-first.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || (await caches.match("/offline"));
        })
    );
    return;
  }

  // Static assets (same origin): stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});

// ============================================================
// Push notification handling
// ============================================================
self.addEventListener("push", (event) => {
  let data = { title: "Mihad Free Video", body: "", url: "/", icon: "/icons/icon-192.png" };
  try {
    const payload = event.data ? event.data.json() : {};
    data = Object.assign(data, payload);
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }
  const options = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/" },
    tag: data.tag || undefined,
    renotify: !!data.tag,
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click -> open URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});

/* Mawaqit Service Worker - Prayer Time Notifications + Offline Audio Cache */

const CACHE_NAME = "mawaqit-v2";

// Files to pre-cache for full offline support
const PRECACHE_ASSETS = [
  "/",
  "/assets/audio/adhan.mp3",
];

// Scheduled timers
const scheduledTimers = new Map();

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("SW precache failed:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => clients.claim())
  );
});

// Intercept fetch: serve adhan audio from cache when offline
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === "/assets/audio/adhan.mp3") {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_ADHAN") {
    const prayers = event.data.prayers;

    // Clear existing timers
    for (const timerId of scheduledTimers.values()) {
      clearTimeout(timerId);
    }
    scheduledTimers.clear();

    prayers.forEach(({ name, timestamp }) => {
      const delay = timestamp - Date.now();
      if (delay > 0 && delay < 86400000) {
        const timerId = setTimeout(() => {
          self.registration
            .showNotification(`🕌 Prayer Time - ${name}`, {
              body: `It is time for ${name} prayer. Allahu Akbar.`,
              icon: "/icons/icon-192.png",
              badge: "/icons/icon-72.png",
              tag: `prayer-${name}`,
              renotify: true,
              requireInteraction: true,
              silent: false,
              data: { prayer: name, timestamp },
            })
            .catch(() => {});
          scheduledTimers.delete(name);
        }, delay);
        scheduledTimers.set(name, timerId);
      }
    });

    // Confirm scheduling
    if (event.source) {
      event.source.postMessage({
        type: "ADHAN_SCHEDULED",
        count: prayers.filter((p) => {
          const d = p.timestamp - Date.now();
          return d > 0 && d < 86400000;
        }).length,
      });
    }
  }

  if (event.data && event.data.type === "CANCEL_ALL") {
    for (const timerId of scheduledTimers.values()) {
      clearTimeout(timerId);
    }
    scheduledTimers.clear();
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});

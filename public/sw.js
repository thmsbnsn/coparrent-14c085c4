// Service Worker for Push Notifications - iOS Compatible
const CACHE_VERSION = 'v1';
const CACHE_NAME = `coparrent-push-${CACHE_VERSION}`;

// Push notification handler with iOS compatibility
self.addEventListener("push", function (event) {
  if (!event.data) {
    console.log("Push event but no data");
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    // Handle plain text payloads
    data = {
      title: "CoParrent",
      message: event.data.text(),
    };
  }

  const options = {
    body: data.message || data.body || "You have a new notification",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || "1",
      url: data.url || "/dashboard",
    },
    actions: [
      {
        action: "open",
        title: "Open",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],
    tag: data.tag || "coparrent-notification",
    renotify: true,
    // iOS Safari 16.4+ supports these
    silent: data.silent || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "CoParrent", options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed:", event.notification.tag);
});

// Install event - cache essential assets for notifications
self.addEventListener("install", function (event) {
  console.log("Push SW: Installing version", CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll([
        "/pwa-192x192.png",
        "/pwa-512x512.png",
      ]);
    })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches and claim clients
self.addEventListener("activate", function (event) {
  console.log("Push SW: Activating version", CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (name) {
              return name.startsWith("coparrent-push-") && name !== CACHE_NAME;
            })
            .map(function (name) {
              console.log("Push SW: Deleting old cache", name);
              return caches.delete(name);
            })
        );
      }),
      // Claim all clients immediately
      self.clients.claim(),
    ])
  );
});

// Handle messages from the main thread
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  
  // Handle local notification requests from main thread
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      ...options,
    });
  }
});
